
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../src/authContext';
import { mockBackend } from '../services/mockBackend';
import { User, Lock, Mail, Loader2 } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

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
        case 'EDITOR':
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
        const user = await mockBackend.login(email, password);
        if (user) {
          login(user);
          handleRoleRedirect(user.role);
        }
    } catch (e: any) {
        setError("Email or password is incorrect");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4 md:p-8">
      <div className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-premium overflow-hidden flex flex-col p-8 md:p-12">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-serif font-bold text-agri-primary mb-2">Admin Login</h2>
            <p className="text-stone-400 text-xs font-bold uppercase tracking-widest">Access authorized area</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-xs mb-6 border border-red-100 font-bold text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" />
                    <input 
                    type="email" 
                    placeholder="admin@agrigence.org" 
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
            </div>
            
            <button type="submit" disabled={isLoading} className="w-full bg-agri-primary text-white font-bold py-4 rounded-2xl hover:bg-agri-secondary transition-all shadow-xl shadow-agri-primary/10 mt-6 flex items-center justify-center gap-2 disabled:opacity-70">
                {isLoading ? (
                    <>Processing <Loader2 size={18} className="animate-spin"/></>
                ) : 'Sign In'}
            </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
