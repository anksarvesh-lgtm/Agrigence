
import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../App';
import { mockBackend } from '../services/mockBackend';
import { 
  Menu, X, Search, User as UserIcon, LogOut, 
  Facebook, Linkedin, Youtube, Twitter, Instagram, ArrowRight, Clock
} from 'lucide-react';
import Logo from './Logo';
import { SiteSettings } from '../types';
import { motion } from 'framer-motion';
import { useConfirm } from './ContextualConfirm';

const Header = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { confirm } = useConfirm();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    // Subscribe to settings for real-time updates (e.g. Logo change)
    const unsubSettings = mockBackend.subscribeToSettings((data) => {
        setSettings(data);
        
        // --- DYNAMIC FAVICON SYNC ---
        if (data.logoUrl) {
            const updateFavicon = (url: string) => {
                const linkId = 'dynamic-favicon';
                const oldLink = document.getElementById(linkId);
                const newLink = document.createElement('link');
                newLink.id = linkId;
                newLink.rel = 'shortcut icon';
                newLink.type = 'image/png';
                newLink.href = url;

                if (oldLink) {
                    document.head.removeChild(oldLink);
                } else {
                    // Remove any other existing icons to avoid conflicts
                    const existingIcons = document.querySelectorAll("link[rel*='icon']");
                    existingIcons.forEach(el => el.remove());
                }
                document.head.appendChild(newLink);
            };

            // Attempt to use Canvas for resizing and ensuring transparency (if CORS allows)
            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 64;
            const ctx = canvas.getContext('2d');
            
            if (ctx) {
                const img = new Image();
                // 'Anonymous' allows canvas export if server sends Access-Control-Allow-Origin
                img.crossOrigin = "Anonymous"; 
                
                img.onload = () => {
                    try {
                        ctx.clearRect(0, 0, 64, 64);
                        
                        // Maintain Aspect Ratio, Center Image
                        const scale = Math.min(64 / img.width, 64 / img.height);
                        const w = img.width * scale;
                        const h = img.height * scale;
                        const x = (64 - w) / 2;
                        const y = (64 - h) / 2;
                        
                        ctx.drawImage(img, x, y, w, h);
                        
                        // Export to data URI
                        const faviconUrl = canvas.toDataURL('image/png');
                        updateFavicon(faviconUrl);
                    } catch (e) {
                        // Canvas Tainted (CORS) - Fallback to raw URL
                        updateFavicon(data.logoUrl);
                    }
                };
                
                img.onerror = () => {
                    // Image load failed (likely CORS blocking the request entirely) - Fallback
                    updateFavicon(data.logoUrl);
                };

                img.src = data.logoUrl;
            }
        }
    });

    return () => {
        window.removeEventListener('scroll', handleScroll);
        unsubSettings();
    };
  }, []);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term.length > 2) {
      const results = await mockBackend.getArticles(term);
      
      const allUsers = await mockBackend.getPublicAdmins();
      const adminIds = new Set(allUsers.map(u => u.id));

      const publicResults = results.filter(a => {
         if (a.status !== 'PUBLISHED' && a.status !== 'APPROVED') return false;
         if (!a.authorId) return true; 
         return adminIds.has(a.authorId);
      });

      setSearchResults(publicResults);
    } else {
      setSearchResults([]);
    }
  };

  const handleLogout = async (e: React.MouseEvent) => {
    const isConfirmed = await confirm({ 
        message: "Are you sure you want to sign out?", 
        type: 'danger',
        trigger: e.currentTarget
    });
    
    if (isConfirmed) {
      logout();
      navigate('/login');
      setIsMenuOpen(false);
    }
  };

  const menuItems = settings?.navigation 
    ? settings.navigation.filter(item => item.isEnabled).sort((a,b) => a.order - b.order) 
    : [];

  const defaultItems = [
    { label: 'Archive', path: '/journals' },
    { label: 'News', path: '/news' },
    { label: 'Blogs', path: '/blogs' },
    { label: 'Store', path: '/products' },
    { label: 'Author Guidelines', path: '/author-guidelines' },
    { label: 'Editorial Board', path: '/editorial-board' },
    { label: 'About', path: '/about-contact' },
  ];

  const activeMenuItems = menuItems.length > 0 ? menuItems : defaultItems.map(i => ({ ...i, id: i.path, isExternal: false, order: 0, isEnabled: true }));

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 bg-white ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md border-b border-agri-border shadow-sm' 
          : 'border-b border-transparent'
      }`}
    >
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
         <motion.div
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 1.5 }}
           className="absolute top-0 left-0"
         >
            <svg width="200" height="150" viewBox="0 0 200 150" className="text-[#4A7C59] opacity-80 fill-current">
               <path d="M0,0 C20,40 10,80 30,120" fill="none" stroke="#3D2B1F" strokeWidth="2" />
               <path d="M10,0 C30,30 40,70 20,110" fill="none" stroke="#3D2B1F" strokeWidth="1.5" />
               <path d="M20,30 Q5,25 10,45 Q25,45 20,30" />
               <path d="M25,70 Q10,75 15,90 Q30,85 25,70" />
               <path d="M15,10 Q0,5 5,20 Q20,20 15,10" />
               <path d="M30,110 Q15,115 20,130 Q35,125 30,110" />
               <path d="M5,50 Q-10,45 -5,65 Q10,65 5,50" className="opacity-70" />
               <path d="M35,50 Q50,45 45,65 Q30,65 35,50" className="opacity-70" />
            </svg>
         </motion.div>

         <motion.div
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 1.5 }}
           className="absolute top-0 right-0 transform -scale-x-100"
         >
            <svg width="250" height="180" viewBox="0 0 250 180" className="text-[#4A7C59] opacity-80 fill-current">
               <path d="M0,0 C30,50 10,100 40,150" fill="none" stroke="#3D2B1F" strokeWidth="2" />
               <path d="M20,0 C50,40 60,90 30,140" fill="none" stroke="#3D2B1F" strokeWidth="1.5" />
               <path d="M30,40 Q15,35 20,55 Q35,55 30,40" />
               <path d="M10,80 Q-5,75 0,95 Q15,95 10,80" />
               <path d="M40,120 Q25,115 30,135 Q45,135 40,120" />
               <path d="M50,60 Q65,55 60,75 Q45,75 50,60" className="opacity-60" />
            </svg>
         </motion.div>
      </div>

      <div className={`container mx-auto px-6 relative z-10 ${isScrolled ? 'py-2' : 'py-4'}`}>
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 group">
            {settings?.logoUrl ? (
               <img src={settings.logoUrl} className={`w-auto object-contain transition-all duration-300 ${isScrolled ? "h-8" : "h-12"}`} alt="Agrigence" />
            ) : (
               <Logo className={isScrolled ? "h-8" : "h-10"} variant="dark" />
            )}
            
            {/* Masthead Branding Block */}
            <div className="flex flex-col items-start justify-center">
              {/* 1. Title */}
              <span className={`font-serif font-bold tracking-tight transition-all duration-300 ${isScrolled ? 'text-xl' : 'text-2xl'} text-agri-primary leading-none`}>
                Agrigence
              </span>
              
              {/* 2. ISSN - Correctly placed between title and tagline */}
              <span className="text-[11px] md:text-xs text-[#222222] tracking-[0.22em] font-medium mt-1">
                ISSN: {settings?.issn || 'XXXX-XXXX'}
              </span>

              {/* 3. Tagline - Preserved below ISSN */}
              <span className={`text-[10px] text-agri-primary/80 font-serif italic mt-0.5 whitespace-nowrap transition-all duration-300 ${isScrolled ? 'hidden' : 'block'}`}>
                Where Agri-Intelligence Meets Agricultural Generation
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-8 xl:gap-10">
            {activeMenuItems.map((item) => {
               // Fix legacy label/path issues locally to prevent flickering from API updates
               const targetPath = (item.path === '/board' || item.label === 'Board') ? '/editorial-board' : item.path;
               const displayLabel = (item.label === 'Board') ? 'Editorial Board' : item.label;
               
               const isActive = location.pathname === targetPath;
               
               if (item.isExternal) {
                   return (
                     <a 
                       key={item.id} 
                       href={targetPath} 
                       target="_blank"
                       rel="noopener noreferrer"
                       className="text-sm font-medium transition-all hover:text-agri-secondary relative group text-stone-500"
                     >
                       {displayLabel}
                       <span className="absolute -bottom-1 left-0 h-0.5 bg-agri-secondary transition-all duration-300 w-0 group-hover:w-full"></span>
                     </a>
                   );
               }
               return (
                <Link 
                  key={item.id} 
                  to={targetPath} 
                  className={`text-sm font-medium transition-all hover:text-agri-secondary relative group ${
                    isActive ? 'text-agri-primary font-bold' : 'text-stone-500'
                  }`}
                >
                  {displayLabel}
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-agri-secondary transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                </Link>
              );
            })}
          </nav>

          <div className="hidden lg:flex items-center gap-6">
            <div className="relative">
              <div className="flex items-center bg-stone-50 rounded-full px-4 py-2 border border-stone-200 focus-within:border-agri-secondary/50 focus-within:bg-white transition-all">
                <Search size={16} className="text-stone-400" />
                <input 
                  type="text" 
                  placeholder="Search articles..." 
                  className="bg-transparent border-none focus:outline-none text-sm ml-2 w-32 focus:w-48 transition-all placeholder:text-stone-400 text-agri-primary"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
              {searchResults.length > 0 && (
                <div className="absolute top-full right-0 mt-3 w-80 bg-white shadow-2xl rounded-xl border border-stone-100 p-2 z-50 overflow-hidden">
                  <div className="bg-stone-50 px-3 py-1 text-[9px] font-bold uppercase text-stone-400 tracking-widest border-b border-stone-100 mb-1">
                     Public Registry
                  </div>
                  {searchResults.map(a => (
                    <div key={a.id} onClick={() => { setSearchResults([]); navigate('/journals'); }} className="p-3 hover:bg-stone-50 rounded-lg cursor-pointer transition-colors group">
                      <p className="font-serif font-bold text-sm text-agri-primary truncate group-hover:text-agri-secondary transition-colors">{a.title}</p>
                      <p className="text-xs text-stone-500 mt-0.5">{a.authorName}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {user ? (
              <div className="flex items-center gap-3">
                <Link to={['SUPER_ADMIN', 'ADMIN'].includes(user.role) ? "/admin" : "/dashboard"} className="w-10 h-10 rounded-full bg-agri-primary text-white flex items-center justify-center font-bold text-sm shadow-md hover:bg-agri-secondary transition-colors" title="Dashboard">
                  {user.name[0]}
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="text-stone-400 hover:text-red-500 transition-colors p-2" 
                  title="Sign Out"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="bg-agri-primary text-white px-6 py-2.5 rounded-full text-xs font-bold tracking-wide hover:bg-agri-secondary transition-all shadow-md flex items-center gap-2">
                <UserIcon size={14} /> SIGN IN
              </Link>
            )}
          </div>

          <button className="lg:hidden text-agri-primary" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-agri-border p-6 space-y-4 shadow-xl relative z-20">
           {activeMenuItems.map(item => {
             const targetPath = (item.path === '/board' || item.label === 'Board') ? '/editorial-board' : item.path;
             const displayLabel = (item.label === 'Board') ? 'Editorial Board' : item.label;
             return item.isExternal 
               ? <a key={item.id} href={targetPath} target="_blank" className="block text-sm font-bold text-agri-primary">{displayLabel}</a>
               : <Link key={item.id} to={targetPath} onClick={() => setIsMenuOpen(false)} className="block text-sm font-bold text-agri-primary">{displayLabel}</Link>
           })}
           <div className="pt-4 border-t border-stone-100">
             {user ? (
               <>
                 <Link to={['SUPER_ADMIN', 'ADMIN'].includes(user.role) ? "/admin" : "/dashboard"} onClick={() => setIsMenuOpen(false)} className="block text-agri-secondary font-bold text-sm mb-4">My Dashboard</Link>
                 <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 font-bold text-sm w-full text-left py-2">
                    <LogOut size={16} /> Sign Out
                 </button>
               </>
             ) : (
               <Link to="/login" onClick={() => setIsMenuOpen(false)} className="text-agri-primary font-bold text-sm">Sign In</Link>
             )}
           </div>
        </div>
      )}
    </header>
  );
};

const Footer = () => {
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [visitorCount, setVisitorCount] = useState<number>(0);

  useEffect(() => {
    const unsub = mockBackend.subscribeToSettings(setSettings);
    
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

    const trackVisitor = async () => {
        try {
            const hasVisited = localStorage.getItem('agri_visitor_tracked');
            let count = 0;
            if (!hasVisited) {
                count = await mockBackend.incrementVisitorCount();
                localStorage.setItem('agri_visitor_tracked', 'true');
            } else {
                count = await mockBackend.getVisitorCount();
            }
            setVisitorCount(count);
        } catch (e) {
            console.error("Visitor tracking failed", e);
        }
    };
    trackVisitor();

    return () => {
        clearInterval(interval);
        unsub();
    };
  }, []);

  const socials = [
    { icon: Twitter, link: settings?.footerSocials.twitter },
    { icon: Instagram, link: settings?.footerSocials.instagram },
    { icon: Facebook, link: settings?.footerSocials.facebook },
    { icon: Linkedin, link: settings?.footerSocials.linkedin },
    { icon: Youtube, link: settings?.footerSocials.youtube },
  ];

  return (
    <footer className="bg-agri-primary text-white pt-20 pb-0 relative overflow-hidden border-t-4 border-agri-secondary">
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#1a110d] via-[#2a1d15] to-[#3D2B1F] z-0">
         <svg className="absolute bottom-0 left-0 w-full h-full opacity-30 text-[#8B5E34]" preserveAspectRatio="none">
            <defs>
               <pattern id="soilRoots" x="0" y="0" width="100" height="50" patternUnits="userSpaceOnUse">
                  <path d="M50,0 C40,20 60,30 50,50 M20,0 C10,15 30,25 20,40 M80,0 C70,10 90,30 80,50" fill="none" stroke="currentColor" strokeWidth="0.5" />
               </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#soilRoots)" />
         </svg>
      </div>

      <div className="absolute bottom-28 left-0 w-full h-full pointer-events-none z-0">
         <motion.svg 
           initial={{ height: 0 }}
           whileInView={{ height: '100%' }}
           viewport={{ once: true }}
           transition={{ duration: 2 }}
           className="absolute bottom-0 left-0 w-64 text-[#6A9955]/30" 
           viewBox="0 0 100 200" 
           preserveAspectRatio="none"
         >
            <path d="M10,200 Q40,150 20,100 T50,0" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M20,180 Q0,170 10,160 Q25,160 20,180" fill="currentColor" opacity="0.8" />
            <path d="M30,130 Q10,120 20,110 Q35,115 30,130" fill="currentColor" opacity="0.8" />
            <path d="M15,80 Q-5,70 5,60 Q20,65 15,80" fill="currentColor" opacity="0.8" />
         </motion.svg>

         <motion.svg 
           initial={{ height: 0 }}
           whileInView={{ height: '100%' }}
           viewport={{ once: true }}
           transition={{ duration: 2.5 }}
           className="absolute bottom-0 right-0 w-64 text-[#6A9955]/30 transform -scale-x-100" 
           viewBox="0 0 100 200" 
           preserveAspectRatio="none"
         >
            <path d="M10,200 Q40,150 20,100 T50,0" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M20,180 Q0,170 10,160 Q25,160 20,180" fill="currentColor" opacity="0.8" />
            <path d="M30,130 Q10,120 20,110 Q35,115 30,130" fill="currentColor" opacity="0.8" />
            <path d="M15,80 Q-5,70 5,60 Q20,65 15,80" fill="currentColor" opacity="0.8" />
         </motion.svg>
      </div>

      <div className="container mx-auto px-6 relative z-10 pb-12">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
               {settings?.logoUrl ? (
                  <img src={settings.logoUrl} className="h-8 w-auto object-contain brightness-0 invert" alt="Agrigence" />
               ) : (
                  <Logo className="h-6" variant="light" />
               )}
               <span className="font-serif font-bold text-xl tracking-tight">Agrigence</span>
            </div>
            <p className="text-white/60 text-xs leading-relaxed">
              A premier peer-reviewed journal dedicated to advancing agricultural sciences and connecting the research community.
            </p>
            <div className="flex gap-3 pt-2">
                {socials.map((social, i) => (
                  <a 
                    key={i} 
                    href={social.link || '#'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-agri-secondary hover:text-white transition-all"
                  >
                    <social.icon size={12} />
                  </a>
                ))}
            </div>
          </div>

          <div>
            <h4 className="font-serif font-bold text-sm mb-4">Quick Links</h4>
            <ul className="space-y-2 text-xs text-white/60">
              <li><Link to="/journals" className="hover:text-agri-secondary transition-colors">Journal Archive</Link></li>
              <li><Link to="/blogs" className="hover:text-agri-secondary transition-colors">Blogs</Link></li>
              <li><Link to="/editorial-board" className="hover:text-agri-secondary transition-colors">Editorial Board</Link></li>
              <li><Link to="/author-guidelines" className="hover:text-agri-secondary transition-colors">Author Guidelines</Link></li>
              <li><Link to="/products" className="hover:text-agri-secondary transition-colors">Book Store</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif font-bold text-sm mb-4">Support</h4>
            <ul className="space-y-2 text-xs text-white/60">
              <li><Link to="/about-contact" className="hover:text-agri-secondary transition-colors">Contact Us</Link></li>
              <li><Link to="/privacy" className="hover:text-agri-secondary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-agri-secondary transition-colors">Terms of Service</Link></li>
              <li><a href="mailto:agrigence@gmail.com" className="hover:text-agri-secondary transition-colors">Report an Issue</a></li>
            </ul>
          </div>

          <div>
             <h4 className="font-serif font-bold text-sm mb-4">Next Publication</h4>
             <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2 text-agri-secondary">
                   <Clock size={14} className="animate-pulse" />
                   <span className="text-xs font-bold uppercase tracking-wider">Releasing In</span>
                </div>
                <div className="flex justify-between text-center">
                   <div>
                      <span className="block text-lg font-serif font-bold">{timeLeft.d}</span>
                      <span className="text-[10px] text-white/40">Days</span>
                   </div>
                   <div className="text-white/20 text-lg font-light">:</div>
                   <div>
                      <span className="block text-lg font-serif font-bold">{timeLeft.h}</span>
                      <span className="text-[10px] text-white/40">Hrs</span>
                   </div>
                   <div className="text-white/20 text-lg font-light">:</div>
                   <div>
                      <span className="block text-lg font-serif font-bold">{timeLeft.m}</span>
                      <span className="text-[10px] text-white/40">Mins</span>
                   </div>
                   <div className="text-white/20 text-lg font-light">:</div>
                   <div>
                      <span className="block text-lg font-serif font-bold">{timeLeft.s}</span>
                      <span className="text-[10px] text-white/40">Secs</span>
                   </div>
                </div>
                <Link to="/submission" className="mt-4 block text-center bg-white text-agri-primary py-2 rounded-lg text-[10px] font-bold hover:bg-agri-secondary hover:text-white transition-colors">
                   Submit Manuscript
                </Link>
             </div>
          </div>

        </div>
        
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/40">
           <div className="flex flex-col md:flex-row items-center gap-4">
               <p>© {new Date().getFullYear()} Agrigence. All rights reserved.</p>
               <span className="hidden md:inline text-white/20">|</span>
               <span className="text-[10px] font-mono tracking-wider opacity-60">
                   Visitor Count: {visitorCount.toLocaleString()}
               </span>
           </div>
           <div className="flex gap-6">
              <span>Peer-Reviewed Journal</span>
           </div>
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
