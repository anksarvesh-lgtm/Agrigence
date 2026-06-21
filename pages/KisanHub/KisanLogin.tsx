import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Tractor, 
  ArrowLeft, 
  Smartphone, 
  Lock, 
  ChevronRight, 
  Sprout, 
  User,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '../../src/firebase';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import Logo from '../../components/Logo';

const KisanLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || "/kisan";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error(err);
      setError("Incorrect login details. Please try again or use Google Login.");
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, provider);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError("Google Sign-In failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col md:flex-row font-sans selection:bg-emerald-100">
      {/* Visual Side - Hidden on small mobile */}
      <div className="hidden lg:flex w-1/2 bg-[#92745B] relative overflow-hidden flex-col justify-between p-16 text-white">
        <div className="relative z-10">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-20"
          >
            <ArrowLeft size={18} /> Back to Main Site
          </button>
          
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-white p-2 rounded-2xl">
              <Tractor className="text-[#92745B]" size={32} />
            </div>
            <span className="text-xl font-serif italic text-white/90">Kisan Hub</span>
          </div>
          <h1 className="text-6xl font-black tracking-tight leading-[1.1]">
            Grow Smarter <br />
            With <span className="text-emerald-300">AI</span> Power.
          </h1>
          <p className="mt-8 text-xl text-white/70 max-w-md leading-relaxed">
            Access Mandi rates, AI crop planning, and digital ledger tools. All in one place.
          </p>
        </div>

        <div className="relative z-10 flex gap-12">
            <div>
                <p className="text-3xl font-black">2M+</p>
                <p className="text-sm uppercase tracking-widest text-white/50 font-bold">Farmers</p>
            </div>
            <div>
                <p className="text-3xl font-black">24/7</p>
                <p className="text-sm uppercase tracking-widest text-white/50 font-bold">Support</p>
            </div>
        </div>

        {/* Abstract Background pattern */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white opacity-[0.03] rounded-full -mr-[300px] -mt-[300px]"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white opacity-[0.02] rounded-full -ml-[200px] -mb-[200px]"></div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-10">
            <div className="flex flex-col items-center gap-3">
              <div className="bg-[#92745B] p-4 rounded-[2rem] shadow-xl shadow-[#92745B]/20">
                <Sprout className="text-white" size={32} />
              </div>
              <h2 className="text-2xl font-black text-[#92745B] tracking-tight">Kisan Hub</h2>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-stone-200/50 border border-stone-100"
          >
            <div className="mb-10">
              <h3 className="text-3xl font-black text-stone-900 mb-2">Farmer Sign In</h3>
              <p className="text-stone-500 font-medium">Continue to your farm dashboard</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 pl-1">Email / Phone</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400 group-focus-within:text-[#92745B] transition-colors">
                    <User size={18} />
                  </div>
                  <input 
                    type="email" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-[#92745B] focus:ring-4 focus:ring-[#92745B]/5 transition-all text-sm"
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Password</label>
                  <button type="button" className="text-[10px] font-bold text-[#92745B] uppercase tracking-widest hover:underline">Forgot?</button>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400 group-focus-within:text-[#92745B] transition-colors">
                    <Lock size={18} />
                  </div>
                  <input 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-[#92745B] focus:ring-4 focus:ring-[#92745B]/5 transition-all text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-3 p-4 bg-rose-50 text-rose-600 rounded-2xl text-xs font-bold border border-rose-100"
                  >
                    <AlertCircle size={16} /> {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-[#92745B] text-white py-4 rounded-2xl font-bold uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-[#92745B]/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? 'Processing...' : (
                  <>Sign In <ChevronRight size={18} /></>
                )}
              </button>
            </form>

            <div className="mt-10 mb-8 flex items-center gap-4">
              <div className="h-px bg-stone-100 flex-1"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-stone-300">Or continue with</span>
              <div className="h-px bg-stone-100 flex-1"></div>
            </div>

            <button 
              onClick={signInWithGoogle}
              className="w-full bg-white border border-stone-200 py-3 rounded-2xl flex items-center justify-center gap-4 hover:border-[#92745B] transition-all group"
            >
              <img src="https://www.google.com/favicon.ico" className="w-5 h-5 grayscale group-hover:grayscale-0 transition-all" alt="Google" />
              <span className="text-sm font-bold text-stone-700">Google Account</span>
            </button>
          </motion.div>

          <p className="mt-10 text-center text-stone-400 text-xs font-medium">
            Don't have an account? <button onClick={() => navigate('/login')} className="text-[#92745B] font-bold hover:underline">Register your farm</button>
          </p>

          <div className="mt-12 flex items-center justify-center gap-8 text-stone-300 grayscale select-none pointer-events-none opacity-50">
             <div className="flex items-center gap-2 font-black text-sm uppercase italic">Trusted</div>
             <ShieldCheck size={24} />
             <div className="flex items-center gap-2 font-black text-sm uppercase italic">Secure</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KisanLogin;
