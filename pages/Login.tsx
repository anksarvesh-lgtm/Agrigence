import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { mockBackend } from '../services/mockBackend';
import { Fingerprint, CheckCircle2 } from 'lucide-react';
import { User } from '../types';

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [profession, setProfession] = useState('Student');
  const [customProfession, setCustomProfession] = useState('');
  const [error, setError] = useState('');
  
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

  const validatePassword = (pass: string) => {
    return pass.length >= 8 && /[a-zA-Z]/.test(pass) && /[0-9]/.test(pass);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      const user = await mockBackend.login(email, password);
      if (user) {
        login(user);
        navigate(user.role === 'SUPER_ADMIN' || user.role === 'ADMIN' ? '/admin' : '/dashboard');
      } else {
        setError('Invalid credentials');
      }
    } else {
      // Register
      if (!validatePassword(password)) {
        setError('Password must be at least 8 characters and include letters and numbers.');
        return;
      }

      const finalProfession = profession === 'Other' ? customProfession : profession;

      const user = await mockBackend.register({
        id: '',
        name,
        email,
        occupation: finalProfession,
        role: 'USER',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3D2B1F&color=fff`,
        subscriptionTier: undefined
      });
      login(user);
      navigate('/dashboard');
    }
  };

  const handleInternetIdentity = () => {
    setTimeout(() => {
        const mockUser: User = {
            id: 'ii-user-' + Math.random(),
            name: 'Internet Identity User',
            email: 'user@dfinity.mock',
            role: 'USER',
            permissions: {
              canDownloadArticles: false,
              canDownloadBlogs: false
            },
            status: 'ACTIVE',
            joinedDate: new Date().toISOString(),
            articleUsage: 0,
            blogUsage: 0
        };
        login(mockUser);
        navigate('/dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-stone-50 px-4 py-12">
      <div className="bg-white w-full max-w-md p-8 md:p-10 rounded-3xl shadow-premium border border-stone-100">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-serif font-bold text-agri-primary mb-3">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-stone-500 text-sm">
            {isLogin 
              ? 'Access your dashboard and research papers' 
              : 'Takes less than 10 seconds to create your account'}
          </p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-xs mb-6 border border-red-100 font-bold">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <>
              <div>
                <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Rahul Sharma" 
                  className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-agri-secondary/20 focus:border-agri-secondary outline-none transition-all text-sm"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5 ml-1">Profession</label>
                <select 
                  className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-agri-secondary/20 focus:border-agri-secondary outline-none transition-all text-sm appearance-none"
                  value={profession}
                  onChange={e => setProfession(e.target.value)}
                  required
                >
                  {professionOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                {profession === 'Other' && (
                  <input 
                    type="text" 
                    placeholder="Specify profession" 
                    className="w-full mt-3 p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-agri-secondary/20 focus:border-agri-secondary outline-none transition-all text-sm"
                    required
                    value={customProfession}
                    onChange={e => setCustomProfession(e.target.value)}
                  />
                )}
              </div>
            </>
          )}
          
          <div>
            <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
            <input 
              type="email" 
              placeholder="name@example.com" 
              className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-agri-secondary/20 focus:border-agri-secondary outline-none transition-all text-sm"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5 ml-1">Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-agri-secondary/20 focus:border-agri-secondary outline-none transition-all text-sm"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            {!isLogin && (
              <p className="text-[10px] text-stone-400 mt-2 ml-1">Min. 8 characters with letters & numbers</p>
            )}
          </div>
          
          <button type="submit" className="w-full bg-agri-primary text-white font-bold py-4 rounded-2xl hover:bg-agri-secondary transition-all shadow-xl shadow-agri-primary/10 mt-4 flex items-center justify-center gap-2">
            {isLogin ? 'Sign In' : 'Create My Account'}
            {!isLogin && <CheckCircle2 size={18} />}
          </button>
        </form>

        <div className="mt-8">
            <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-stone-100"></div></div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest"><span className="px-4 bg-white text-stone-400">Secure Connect</span></div>
            </div>
            <button 
                type="button"
                onClick={handleInternetIdentity}
                className="mt-6 w-full flex items-center justify-center gap-3 border border-stone-200 p-4 rounded-2xl hover:bg-stone-50 transition-all font-bold text-xs text-stone-600 uppercase tracking-widest"
            >
                <Fingerprint size={20} className="text-agri-secondary" /> Internet Identity
            </button>
        </div>

        <p className="text-center mt-10 text-xs font-bold text-stone-400 uppercase tracking-widest">
          {isLogin ? "New to Agrigence?" : "Already have an account?"}
          <button onClick={() => setIsLogin(!isLogin)} className="text-agri-secondary ml-2 hover:underline">
            {isLogin ? 'Sign Up Free' : 'Log In Now'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;