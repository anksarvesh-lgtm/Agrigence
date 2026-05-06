
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../src/authContext';
import { mockBackend } from '../services/mockBackend';
import { CheckCircle2, User, Lock, Mail, Users, LogIn, Globe, Smartphone, Camera, Loader2, Calendar } from 'lucide-react';

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [profession, setProfession] = useState('Student');
  const [customProfession, setCustomProfession] = useState('');
  // New Fields
  const [country, setCountry] = useState('IN');
  const [mobile, setMobile] = useState('');
  const [userType, setUserType] = useState<'INDIVIDUAL' | 'INSTITUTE' | 'ORGANISATION' | 'FARMER'>('INDIVIDUAL');
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const professionOptions = [
    "Student",
    "Researcher",
    "Professor / Teacher",
    "Farmer",
    "Agriculture Professional",
    "Other"
  ];

  // Common Country List for Dropdown
  const countries = [
    { code: 'IN', name: 'India', dial: '+91' },
    { code: 'US', name: 'United States', dial: '+1' },
    { code: 'GB', name: 'United Kingdom', dial: '+44' },
    { code: 'AE', name: 'UAE', dial: '+971' },
    { code: 'CA', name: 'Canada', dial: '+1' },
    { code: 'AU', name: 'Australia', dial: '+61' },
    { code: 'EU', name: 'Europe (Generic)', dial: '' }
  ];

  const validatePassword = (pass: string) => {
    return pass.length >= 6;
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          // Increased limit to 5MB, backend handles compression
          if (file.size > 5 * 1024 * 1024) {
              setError("Image too large. Max 5MB allowed.");
              return;
          }
          if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
              setError("Invalid format. JPG, PNG, WEBP only.");
              return;
          }
          setError('');
          setProfilePhoto(file);
      }
  };

  const handleRoleRedirect = (role: string) => {
    switch (role) {
        case 'SUPER_ADMIN':
        case 'ADMIN':
            navigate('/admin/dashboard');
            break;
        case 'EDITORIAL_MEMBER':
            navigate('/reviewer');
            break;
        case 'USER':
        case 'EDITOR': // Legacy role support
        default:
            navigate('/dashboard');
            break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        const user = await mockBackend.login(email, password);
        if (user) {
          login(user); // Update context immediately
          handleRoleRedirect(user.role);
        }
      } else {
        // Register
        if (!validatePassword(password)) {
          setError('Password must be at least 6 characters.');
          setIsLoading(false);
          return;
        }

        const finalProfession = profession === 'Other' ? customProfession : profession;
        const selectedCountry = countries.find(c => c.code === country);
        const fullMobile = selectedCountry ? `${selectedCountry.dial} ${mobile}` : mobile;

        let photoUrl = '';
        
        if (profilePhoto) {
            setIsPhotoUploading(true);
            try {
                photoUrl = await mockBackend.uploadFile(profilePhoto, 'users/profiles/initial'); 
            } catch (err: any) {
                console.error("Photo Upload Failed", err.message || err);
            } finally {
                setIsPhotoUploading(false);
            }
        }

        // Register the user
        const newUser = await mockBackend.register({
          name,
          dob,
          email,
          occupation: finalProfession,
          role: 'USER',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3D2B1F&color=fff`,
          profilePhotoUrl: photoUrl,
          country: country,
          mobileNumber: fullMobile,
          userType: userType,
          // @ts-ignore
          password: password 
        });
        
        setIsLoading(false);
        handleRoleRedirect(newUser.role);
        return;
      }
    } catch (e: any) {
      if (isLogin) {
        if (
          e.code === 'auth/invalid-credential' || 
          e.code === 'auth/user-not-found' || 
          e.code === 'auth/wrong-password' || 
          e.code === 'auth/invalid-email' ||
          e.message?.includes('auth/invalid-credential')
        ) {
          setError("Email or password is incorrect");
        } else {
          setError("Email or password is incorrect");
        }
      } else {
        if (e.code === 'auth/email-already-in-use') {
          setError("User already exists. Please sign in");
        } else if (e.code === 'auth/weak-password') {
          setError("Password is too weak.");
        } else {
          setError(e.message || "Registration failed.");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4 md:p-8">
      <div className="w-full max-w-5xl bg-white rounded-[2.5rem] shadow-premium overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* Left Side: Image & Branding */}
        <div className="md:w-1/2 relative hidden md:flex flex-col justify-end p-12 text-white">
           <div className="absolute inset-0">
              <img 
                src="https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?auto=format&fit=crop&q=80" 
                className="w-full h-full object-cover" 
                alt="Agriculture Field" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-agri-primary/90 via-agri-primary/40 to-transparent"></div>
           </div>
           
           <div className="relative z-10">
              <h2 className="text-4xl font-serif font-bold mb-4">Cultivating Knowledge</h2>
              <p className="text-white/80 font-light mb-8 leading-relaxed">
                 Join India's premier digital ecosystem for agricultural research. Connect with over 5,000+ researchers and professionals.
              </p>
              <div className="flex gap-6">
                 <div className="flex flex-col">
                    <span className="text-2xl font-bold">2.4k+</span>
                    <span className="text-[10px] uppercase font-black tracking-widest text-white/50">Articles</span>
                 </div>
                 <div className="w-px bg-white/20"></div>
                 <div className="flex flex-col">
                    <span className="text-2xl font-bold">150+</span>
                    <span className="text-[10px] uppercase font-black tracking-widest text-white/50">Institutions</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Right Side: Form */}
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center max-h-screen overflow-y-auto custom-scrollbar">
          <div className="max-w-md mx-auto w-full">
            <div className="text-center mb-8">
              <div className="inline-block p-3 rounded-2xl bg-agri-primary/5 text-agri-primary mb-4 md:hidden">
                 <User size={32} />
              </div>
              <h2 className="text-3xl font-serif font-bold text-agri-primary mb-2">
                {isLogin ? 'Welcome Back' : 'Join the Network'}
              </h2>
              <p className="text-stone-400 text-xs font-bold uppercase tracking-widest">
                {isLogin ? 'Access your research dashboard' : 'Begin your publishing journey'}
              </p>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-xs mb-6 border border-red-100 font-bold text-center">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Full Name</label>
                    <div className="relative">
                       <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" />
                       <input 
                        type="text" 
                        placeholder="e.g. Dr. Rajesh Kumar" 
                        className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-agri-secondary/20 focus:border-agri-secondary outline-none transition-all text-sm font-medium"
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Date of Birth</label>
                    <div className="relative">
                       <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" />
                       <input 
                        type="date" 
                        className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-agri-secondary/20 focus:border-agri-secondary outline-none transition-all text-sm font-medium"
                        required
                        value={dob}
                        onChange={e => setDob(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Country</label>
                        <div className="relative">
                           <Globe size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" />
                           <select 
                            className="w-full pl-12 pr-2 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-agri-secondary/20 focus:border-agri-secondary outline-none transition-all text-xs font-bold appearance-none"
                            value={country}
                            onChange={e => setCountry(e.target.value)}
                            required
                          >
                            {countries.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Mobile No.</label>
                        <div className="relative">
                           <Smartphone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" />
                           <input 
                            type="tel" 
                            placeholder="9876543210" 
                            className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-agri-secondary/20 focus:border-agri-secondary outline-none transition-all text-sm font-medium"
                            required
                            value={mobile}
                            onChange={e => setMobile(e.target.value.replace(/\D/g, ''))} // Digits only
                          />
                        </div>
                      </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Account Type</label>
                    <div className="relative">
                       <Users size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" />
                       <select 
                        className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-agri-secondary/20 focus:border-agri-secondary outline-none transition-all text-sm appearance-none font-medium"
                        value={userType}
                        onChange={e => setUserType(e.target.value as any)}
                        required
                      >
                        <option value="INDIVIDUAL">Individual</option>
                        <option value="INSTITUTE">Institute</option>
                        <option value="ORGANISATION">Organisation</option>
                        <option value="FARMER">Farmer</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Profession</label>
                    <div className="relative">
                       <Users size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" />
                       <select 
                        className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-agri-secondary/20 focus:border-agri-secondary outline-none transition-all text-sm appearance-none font-medium"
                        value={profession}
                        onChange={e => setProfession(e.target.value)}
                        required
                      >
                        {professionOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                    {profession === 'Other' && (
                      <input 
                        type="text" 
                        placeholder="Specify profession" 
                        className="w-full mt-2 p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-agri-secondary/20 focus:border-agri-secondary outline-none transition-all text-sm"
                        required
                        value={customProfession}
                        onChange={e => setCustomProfession(e.target.value)}
                      />
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Profile Photo (Optional)</label>
                    <div className={`relative border-2 border-dashed rounded-2xl p-3 text-center cursor-pointer transition-all ${profilePhoto ? 'border-agri-secondary bg-agri-secondary/5' : 'border-stone-200 hover:border-agri-secondary/30'}`}>
                        <input type="file" accept="image/*" onChange={handlePhotoSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        <div className="flex items-center justify-center gap-3 text-stone-400">
                            {profilePhoto ? <span className="text-agri-secondary font-bold text-xs truncate">{profilePhoto.name}</span> : <><Camera size={18} /> <span className="text-xs font-bold">Upload Portrait (Max 5MB)</span></>}
                        </div>
                    </div>
                  </div>
                </>
              )}
              
              <div className="space-y-1">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative">
                   <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" />
                   <input 
                    type="email" 
                    placeholder="researcher@institute.edu" 
                    className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-agri-secondary/20 focus:border-agri-secondary outline-none transition-all text-sm font-medium"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Password</label>
                <div className="relative">
                   <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" />
                   <input 
                    type="password" 
                    placeholder="••••••••" 
                    className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-agri-secondary/20 focus:border-agri-secondary outline-none transition-all text-sm font-medium"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
                {isLogin && (
                    <button type="button" onClick={() => navigate('/forgot-password')} className="text-[10px] text-agri-secondary font-bold mt-2 ml-1 hover:underline">Forgot Password?</button>
                )}
                {!isLogin && (
                  <p className="text-[10px] text-stone-400 mt-1 ml-1">Must contain 6+ characters</p>
                )}
              </div>
              
              <button type="submit" disabled={isLoading || isPhotoUploading} className="w-full bg-agri-primary text-white font-bold py-4 rounded-2xl hover:bg-agri-secondary transition-all shadow-xl shadow-agri-primary/10 mt-6 flex items-center justify-center gap-2 disabled:opacity-70">
                {isLoading || isPhotoUploading ? (
                    <>Processing <Loader2 size={18} className="animate-spin"/></>
                ) : (isLogin ? 'Access Account' : 'Initialize Profile')}
                {!isLogin && !isLoading && !isPhotoUploading && <CheckCircle2 size={18} />}
              </button>
            </form>

            <p className="text-center mt-10 text-xs font-bold text-stone-400 uppercase tracking-widest">
              {isLogin ? "New to Agrigence?" : "Already have an account?"}
              <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-agri-secondary ml-2 hover:text-agri-primary transition-colors underline decoration-2 underline-offset-4">
                {isLogin ? 'Register Free' : 'Secure Login'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
