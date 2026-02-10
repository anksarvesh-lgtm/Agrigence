
import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../App';
import { mockBackend } from '../services/mockBackend';
import { 
  Menu, X, Search, User as UserIcon, LogOut, 
  Facebook, Linkedin, Youtube, Twitter, Instagram, LayoutDashboard, ArrowRight, MessageSquare, Clock,
  Wheat, Sprout, Send, MapPin, Mail, Phone, Users, Cpu, Activity, Terminal
} from 'lucide-react';
import Logo from './Logo';
import { SiteSettings } from '../types';
import { motion } from 'framer-motion';

const Header = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    setSettings(mockBackend.getSettings());
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term.length > 2) setSearchResults(mockBackend.getArticles(term));
    else setSearchResults([]);
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to sign out?")) {
      logout();
      navigate('/login');
      setIsMenuOpen(false);
    }
  };

  const menuItems = [
    { label: 'Archive', path: '/journals' },
    { label: 'News', path: '/news' },
    { label: 'Store', path: '/products' },
    { label: 'Guidelines', path: '/guidelines' },
    { label: 'Board', path: '/editorial-board' },
    { label: 'About', path: '/about-contact' },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md border-b border-agri-border shadow-sm py-2' 
          : 'bg-white border-b border-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 group">
            <Logo className={isScrolled ? "h-8" : "h-10"} variant="dark" />
            <div className="flex flex-col">
              <span className={`font-serif font-bold tracking-tight transition-all duration-300 ${isScrolled ? 'text-xl' : 'text-2xl'} text-agri-primary leading-tight`}>
                Agrigence
              </span>
              {/* Refined spacing between Title and ISSN */}
              <span className="text-[8px] font-black uppercase tracking-[0.3em] text-agri-secondary mt-3 opacity-70 border-t border-agri-secondary/20 pt-1.5">
                ISSN: {settings?.issn || 'Not Available'}
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-10">
            {menuItems.map((item) => {
               const isActive = location.pathname === item.path;
               return (
                <Link 
                  key={item.path} 
                  to={item.path} 
                  className={`text-[11px] font-black uppercase tracking-widest transition-all hover:text-agri-secondary relative group ${
                    isActive ? 'text-agri-primary' : 'text-stone-400'
                  }`}
                >
                  {item.label}
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-agri-secondary transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                </Link>
              );
            })}
          </nav>

          <div className="hidden lg:flex items-center gap-6">
            <div className="relative">
              <div className="flex items-center bg-stone-100 rounded-full px-4 py-2 border border-transparent focus-within:border-agri-secondary/30 focus-within:bg-white transition-all">
                <Search size={14} className="text-stone-400" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="bg-transparent border-none focus:outline-none text-[10px] font-bold ml-2 w-24 focus:w-40 transition-all uppercase tracking-wider"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
              {searchResults.length > 0 && (
                <div className="absolute top-full right-0 mt-3 w-80 bg-white shadow-2xl rounded-xl border border-stone-100 p-2 z-50 overflow-hidden">
                  {searchResults.map(a => (
                    <div key={a.id} onClick={() => { setSearchResults([]); navigate('/journals'); }} className="p-3 hover:bg-stone-50 rounded-lg cursor-pointer transition-colors">
                      <p className="font-serif font-bold text-sm text-agri-primary truncate">{a.title}</p>
                      <p className="text-[9px] text-agri-secondary uppercase font-black mt-0.5 tracking-tighter">{a.authorName}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {user ? (
              <div className="flex items-center gap-3">
                <Link to={['SUPER_ADMIN', 'ADMIN'].includes(user.role) ? "/admin" : "/dashboard"} className="w-9 h-9 rounded-full bg-agri-primary text-white flex items-center justify-center font-black text-xs shadow-lg border-2 border-white ring-1 ring-agri-primary/10 hover:scale-105 transition-transform" title="Dashboard">
                  {user.name[0]}
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="text-stone-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-stone-100" 
                  title="Sign Out"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="bg-agri-primary text-white px-6 py-2 rounded-full text-[10px] font-black tracking-widest hover:bg-agri-secondary transition-all shadow-md flex items-center gap-2 uppercase">
                <UserIcon size={12} /> Sign In
              </Link>
            )}
          </div>

          <button className="lg:hidden text-agri-primary" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-agri-border p-6 space-y-4 shadow-xl">
           {menuItems.map(item => (
             <Link key={item.path} to={item.path} onClick={() => setIsMenuOpen(false)} className="block text-xs font-black text-agri-primary uppercase tracking-widest">{item.label}</Link>
           ))}
           <div className="pt-4 border-t border-stone-100">
             {user ? (
               <>
                 <Link to={['SUPER_ADMIN', 'ADMIN'].includes(user.role) ? "/admin" : "/dashboard"} onClick={() => setIsMenuOpen(false)} className="block text-agri-secondary font-black text-xs uppercase tracking-widest mb-4">My Dashboard</Link>
                 <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 font-black text-xs uppercase tracking-widest">
                    <LogOut size={14} /> Sign Out
                 </button>
               </>
             ) : (
               <Link to="/login" onClick={() => setIsMenuOpen(false)} className="text-agri-primary font-black text-xs uppercase tracking-widest">Sign In</Link>
             )}
           </div>
        </div>
      )}
    </header>
  );
};

const Footer = () => {
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      let targetDate = new Date(now.getFullYear(), now.getMonth(), 25, 23, 59, 59);
      if (now.getTime() > targetDate.getTime()) {
        targetDate = new Date(now.getFullYear(), now.getMonth() + 1, 25, 23, 59, 59);
      }
      const diff = targetDate.getTime() - now.getTime();
      
      setTimeLeft({
        d: Math.floor(diff / (1000 * 60 * 60 * 24)),
        h: Math.floor((diff / (1000 * 60 * 60)) % 24),
        m: Math.floor((diff / 1000 / 60) % 60),
        s: Math.floor((diff / 1000) % 60)
      });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, []);

  const HUDTimerUnit = ({ val, label, isAccent = false }: { val: number, label: string, isAccent?: boolean }) => (
    <div className="flex flex-col items-center">
      <div className="relative">
        <span className={`text-xl font-mono font-black tabular-nums transition-all ${isAccent ? 'text-agri-secondary drop-shadow-[0_0_8px_rgba(194,146,99,0.5)]' : 'text-white'}`}>
          {val.toString().padStart(2, '0')}
        </span>
      </div>
      <span className="text-[7px] font-black uppercase tracking-[0.2em] text-white/30 mt-0.5">{label}</span>
    </div>
  );

  return (
    <footer className="bg-agri-primary text-white border-t-2 border-agri-secondary relative overflow-hidden">
      {/* HUD Scanline Effect Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>
      
      <div className="container mx-auto px-6 py-8 relative z-10">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-12">
          
          {/* Identity HUD Section */}
          <div className="flex items-center gap-8 group">
            <div className="relative">
               <div className="absolute -inset-2 bg-agri-secondary/20 rounded-full blur animate-pulse group-hover:bg-agri-secondary/40 transition-all"></div>
               <Logo className="h-6 relative" variant="light" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-lg tracking-tighter">AGRIGENCE</span>
              <div className="flex items-center gap-2 mt-0.5">
                 <div className="w-1 h-1 bg-green-500 rounded-full animate-ping"></div>
                 <span className="text-[7px] font-black text-white/40 uppercase tracking-[0.3em]">Core_Node.Online</span>
              </div>
            </div>
          </div>

          {/* Futuristic HUD Countdown Timer */}
          <div className="flex items-center bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl px-10 py-5 shadow-[0_0_40px_rgba(0,0,0,0.4)] relative">
             {/* Tech Corners */}
             <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-agri-secondary/30 rounded-tl-lg"></div>
             <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-agri-secondary/30 rounded-br-lg"></div>
             
             <div className="flex items-center gap-8">
                <div className="flex flex-col items-center border-r border-white/10 pr-8 mr-2">
                   <Terminal size={14} className="text-agri-secondary mb-1 opacity-60" />
                   <span className="text-[7px] font-black text-white/40 uppercase tracking-[0.3em]">Status:TX</span>
                </div>

                <div className="flex gap-5">
                   <HUDTimerUnit val={timeLeft.d} label="Days" />
                   <div className="w-px h-6 bg-white/10 mt-1.5 opacity-20"></div>
                   <HUDTimerUnit val={timeLeft.h} label="Hrs" />
                   <div className="w-px h-6 bg-white/10 mt-1.5 opacity-20"></div>
                   <HUDTimerUnit val={timeLeft.m} label="Min" />
                   <div className="w-px h-6 bg-white/10 mt-1.5 opacity-20"></div>
                   <HUDTimerUnit val={timeLeft.s} label="Sec" isAccent={true} />
                </div>

                <div className="ml-6 pl-8 border-l border-white/10">
                   <Link to="/submission" className="flex flex-col items-center group/btn">
                      <div className="bg-agri-secondary/10 p-2.5 rounded-full border border-agri-secondary/20 group-hover/btn:bg-agri-secondary group-hover/btn:text-agri-primary transition-all shadow-lg shadow-agri-secondary/5 group-hover/btn:shadow-agri-secondary/20">
                        <ArrowRight size={16} className="group-hover/btn:translate-x-0.5 transition-transform" />
                      </div>
                      <span className="text-[7px] font-black text-agri-secondary mt-1.5 tracking-tighter uppercase group-hover/btn:opacity-100 opacity-60 transition-opacity">Protocol:Send</span>
                   </Link>
                </div>
             </div>
          </div>

          {/* Clean HUD Navigation Links */}
          <div className="flex items-center gap-12">
             <div className="flex gap-4">
                {[Twitter, Instagram, Facebook, Linkedin].map((Icon, i) => (
                  <a key={i} href="#" className="p-2 rounded-lg text-white/30 hover:text-agri-secondary hover:bg-white/5 transition-all border border-transparent hover:border-white/5">
                    <Icon size={14} />
                  </a>
                ))}
             </div>
             <div className="h-10 w-px bg-white/5 hidden md:block"></div>
             <div className="flex gap-8 text-[9px] font-black uppercase tracking-[0.25em] text-white/20">
                <Link to="/guidelines" className="hover:text-white transition-colors">Author_Req</Link>
                <Link to="/privacy" className="hover:text-white transition-colors">Privacy_v2</Link>
             </div>
          </div>

        </div>
        
        {/* Bottom Metadata Layer */}
        <div className="mt-10 pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="flex items-center gap-3">
              <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]"></div>
              <p className="text-[7px] font-bold text-white/20 uppercase tracking-[0.4em]">
                © v2.0.{new Date().getFullYear()} CORE_AGRI_NET. SYSTEM_SECURITY_VERIFIED
              </p>
           </div>
           <p className="text-[7px] font-bold text-white/10 uppercase tracking-[0.5em] hidden md:block">
             CULTIVATING FUTURES THROUGH PEER-REVIEWED INTELLIGENCE
           </p>
        </div>
      </div>
    </footer>
  );
};

const Layout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-agri-bg">
      <Header />
      <div className="flex-grow pt-24">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
