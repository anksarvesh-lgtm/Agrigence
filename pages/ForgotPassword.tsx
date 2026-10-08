import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../src/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Mail, Calendar, ArrowRight, Loader2 } from 'lucide-react';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [step, setStep] = useState<'EMAIL' | 'DETAILS'>('EMAIL');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('DETAILS');
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await addDoc(collection(db, 'password_reset_requests'), {
        email,
        dob,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      alert('Your password reset request has been submitted to the admin.');
      navigate('/login');
    } catch (e) {
      setError('Failed to submit request.');
    } finally {
      setIsLoading(false);
    }
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
            <button type="submit" className="w-full bg-agri-primary text-white font-bold py-4 rounded-2xl hover:bg-agri-secondary transition-all flex items-center justify-center gap-2">
              Continue <ArrowRight size={18} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleDetailsSubmit} className="space-y-4">
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
            {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
            <button type="submit" disabled={isLoading} className="w-full bg-agri-primary text-white font-bold py-4 rounded-2xl hover:bg-agri-secondary transition-all flex items-center justify-center gap-2">
              {isLoading ? <Loader2 className="animate-spin" /> : <>Submit Request <ArrowRight size={18} /></>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
