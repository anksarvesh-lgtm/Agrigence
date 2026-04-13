import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../src/firebase';
import { mockBackend } from '../services/mockBackend';
import { Mail, User, Smartphone, Users, ArrowRight, Loader2 } from 'lucide-react';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'EMAIL' | 'DETAILS'>('EMAIL');
  const [user, setUser] = useState<any>(null);
  const [details, setDetails] = useState({ name: '', mobile: '', occupation: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const u = await mockBackend.getUserByEmail(email.toLowerCase().trim());
      if (!u) {
        setError('User not found.');
      } else {
        setUser(u);
        setStep('DETAILS');
      }
    } catch (e) {
      setError('Error finding user.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Validate details
    // Note: mobileNumber is stored as "+91 9876543210".
    // I need to check if the user-provided mobile matches.
    // The user-provided mobile is just digits.
    
    const mobileMatch = user.mobileNumber?.includes(details.mobile);
    
    if (user.name === details.name && mobileMatch && user.occupation === details.occupation) {
      try {
        await sendPasswordResetEmail(auth, email);
        alert('Password reset email sent!');
        navigate('/login');
      } catch (e) {
        setError('Failed to send reset email.');
      }
    } else {
      setError('Details do not match our records.');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-premium p-8">
        <h2 className="text-2xl font-serif font-bold text-agri-primary mb-6 text-center">Reset Password</h2>
        
        {step === 'EMAIL' ? (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" />
                <input 
                  type="email" 
                  className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-agri-secondary/20 focus:border-agri-secondary outline-none transition-all text-sm font-medium"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>
            {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
            <button type="submit" disabled={isLoading} className="w-full bg-agri-primary text-white font-bold py-4 rounded-2xl hover:bg-agri-secondary transition-all flex items-center justify-center gap-2">
              {isLoading ? <Loader2 className="animate-spin" /> : <>Continue <ArrowRight size={18} /></>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleDetailsSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" />
                <input 
                  type="text" 
                  className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-agri-secondary/20 focus:border-agri-secondary outline-none transition-all text-sm font-medium"
                  required
                  value={details.name}
                  onChange={e => setDetails({...details, name: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Mobile Number (Digits Only)</label>
              <div className="relative">
                <Smartphone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" />
                <input 
                  type="text" 
                  className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-agri-secondary/20 focus:border-agri-secondary outline-none transition-all text-sm font-medium"
                  required
                  value={details.mobile}
                  onChange={e => setDetails({...details, mobile: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Profession</label>
              <div className="relative">
                <Users size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" />
                <input 
                  type="text" 
                  className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-agri-secondary/20 focus:border-agri-secondary outline-none transition-all text-sm font-medium"
                  required
                  value={details.occupation}
                  onChange={e => setDetails({...details, occupation: e.target.value})}
                />
              </div>
            </div>
            {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
            <button type="submit" disabled={isLoading} className="w-full bg-agri-primary text-white font-bold py-4 rounded-2xl hover:bg-agri-secondary transition-all flex items-center justify-center gap-2">
              {isLoading ? <Loader2 className="animate-spin" /> : <>Reset Password <ArrowRight size={18} /></>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
