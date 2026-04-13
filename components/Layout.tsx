
import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../App';
import { mockBackend } from '../services/mockBackend';
import { 
  Menu, X, Search, User as UserIcon, LogOut, 
  Facebook, Linkedin, Youtube, Twitter, Instagram, ArrowRight, Clock, ChevronDown, Wrench, ChevronRight, ArrowLeft
} from 'lucide-react';
import Logo from './Logo';
import { SiteSettings } from '../types';
import { motion } from 'framer-motion';
import { useConfirm } from './ContextualConfirm';
import OptimizedImage from './OptimizedImage';
import ThemeToggle from './ThemeToggle';

const Header = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [toolSections, setToolSections] = useState<any[]>([]);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
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

    const loadTools = async () => {
        const sections = await mockBackend.getToolSections();
        setToolSections(sections);
    };
    loadTools();

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
    { label: 'Home', path: '/' },
    { label: 'Archive', path: '/journals' },
    { label: 'News', path: '/news' },
    { label: 'Blogs', path: '/blogs' },
    { label: 'Store', path: '/products' },
    { label: 'Tools', path: '/tools' },
    { label: 'Analytics', path: '/analytics' },
    { label: 'Pipeline Builder', path: '/analytics/pipeline' },
    { label: 'ANOVA Engine', path: '/analytics/anova' },
    { label: 'Author Guidelines', path: '/author-guidelines' },
    { label: 'Editorial Board', path: '/editorial-board' },
    { label: 'About', path: '/about-contact' },
  ];

  const rawMenuItems = menuItems.length > 0 ? menuItems : defaultItems.map(i => ({ ...i, id: i.path, isExternal: false, order: 0, isEnabled: true }));
  
  // Ensure Analytics tools are present
  const analyticsTools = [
    { label: 'Analytics', path: '/analytics', id: 'analytics', isExternal: false, order: 5, isEnabled: true },
    { label: 'Pipeline Builder', path: '/analytics/pipeline', id: 'pipeline', isExternal: false, order: 6, isEnabled: true },
    { label: 'ANOVA Engine', path: '/analytics/anova', id: 'anova', isExternal: false, order: 7, isEnabled: true },
  ];

  analyticsTools.forEach(tool => {
    if (!rawMenuItems.some(i => i.path === tool.path)) {
      rawMenuItems.push(tool);
    }
  });

  // Ensure Home is always present and first
  const hasHome = rawMenuItems.some(i => i.path === '/' || i.label === 'Home');
  const activeMenuItems = hasHome 
      ? rawMenuItems 
      : [{ label: 'Home', path: '/', id: 'home-auto', isExternal: false, order: -999, isEnabled: true }, ...rawMenuItems];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        isScrolled 
          ? 'bg-white/30 backdrop-blur-lg border-b border-white/20 shadow-lg' 
          : 'bg-white/10 backdrop-blur-sm border-b border-transparent'
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
          <div className="flex items-center gap-2">
            {location.pathname !== '/' && (
              <button 
                onClick={() => navigate(-1)} 
                className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-500"
                aria-label="Go back"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <Link to="/" className="flex items-center gap-3 group">
              {settings?.logoUrl ? (
                 <OptimizedImage 
                   src={settings.logoUrl} 
                   className={`w-auto object-contain transition-all duration-300 ${isScrolled ? "h-10" : "h-14"}`} 
                   alt="Agrigence" 
                   priority={true}
                 />
              ) : (
                 <Logo className={isScrolled ? "h-10" : "h-14"} variant="dark" showText={false} />
              )}
              
              <div className="flex flex-col">
                <span className={`font-serif font-bold text-agri-primary leading-none tracking-tight transition-all duration-300 ${isScrolled ? 'text-xl' : 'text-2xl'}`}>
                  Agrigence
                </span>
                <p className={`font-serif italic text-agri-secondary leading-tight transition-all duration-300 ${isScrolled ? 'text-[9px] mt-0.5' : 'text-[11px] mt-1'}`}>
                  Where Agri-Intelligence Meets Agricultural Generation
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Removed as per user request to use Hamburger Menu on all screens */}

          <div className="flex items-center gap-4 md:gap-6">
            <div className="relative hidden sm:block">
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
                  className="hidden sm:block text-stone-400 hover:text-red-500 transition-colors p-2" 
                  title="Sign Out"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="hidden sm:flex bg-agri-primary text-white px-6 py-2.5 rounded-full text-xs font-bold tracking-wide hover:bg-agri-secondary transition-all shadow-md items-center gap-2">
                <UserIcon size={14} /> SIGN IN
              </Link>
            )}

            <ThemeToggle />
            <button className="text-agri-primary p-2 hover:bg-stone-100 rounded-lg transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>
      
      {isMenuOpen && (
        <div className="bg-white border-t border-agri-border p-6 space-y-4 shadow-xl absolute w-full left-0 z-20 max-h-[calc(100vh-80px)] overflow-y-auto">
           <div className="mb-6 sm:hidden">
             <div className="flex items-center bg-stone-50 rounded-xl px-4 py-3 border border-stone-200 focus-within:border-agri-secondary/50 focus-within:bg-white transition-all">
               <Search size={18} className="text-stone-400" />
               <input 
                 type="text" 
                 placeholder="Search articles..." 
                 className="bg-transparent border-none focus:outline-none text-sm ml-3 w-full placeholder:text-stone-400 text-agri-primary"
                 value={searchTerm}
                 onChange={handleSearch}
               />
             </div>
             {searchResults.length > 0 && (
               <div className="mt-2 bg-white shadow-lg rounded-xl border border-stone-100 p-2 overflow-hidden">
                 <div className="bg-stone-50 px-3 py-1 text-[9px] font-bold uppercase text-stone-400 tracking-widest border-b border-stone-100 mb-1">
                    Public Registry
                 </div>
                 {searchResults.map(a => (
                   <div key={a.id} onClick={() => { setSearchResults([]); setIsMenuOpen(false); navigate('/journals'); }} className="p-3 hover:bg-stone-50 rounded-lg cursor-pointer transition-colors group">
                     <p className="font-serif font-bold text-sm text-agri-primary truncate group-hover:text-agri-secondary transition-colors">{a.title}</p>
                     <p className="text-xs text-stone-500 mt-0.5">{a.authorName}</p>
                   </div>
                 ))}
               </div>
             )}
           </div>

           {activeMenuItems.map((item, index) => {
             const targetPath = (item.path === '/board' || item.label === 'Board') ? '/editorial-board' : item.path;
             const displayLabel = (item.label === 'Board') ? 'Editorial Board' : item.label;
             if (targetPath === '/tools') {
                 return (
                   <div key={item.id ? `mobile-nav-${item.id}-${index}` : `mobile-nav-${index}`} className="space-y-2">
                       <Link to="/tools" onClick={() => setIsMenuOpen(false)} className="block text-sm font-bold text-agri-primary">{displayLabel}</Link>
                       <div className="pl-4 space-y-2 border-l border-stone-100">
                           {toolSections.map(section => (
                               <Link 
                                   key={section.id} 
                                   to="/tools" 
                                   onClick={() => setIsMenuOpen(false)}
                                   className="block text-xs font-bold text-stone-400 uppercase tracking-widest hover:text-agri-secondary"
                               >
                                   {section.name}
                               </Link>
                           ))}
                       </div>
                   </div>
                 );
             }

             return item.isExternal 
               ? <a key={item.id ? `mobile-nav-${item.id}-${index}` : `mobile-nav-${index}`} href={targetPath} target="_blank" className="block text-sm font-bold text-agri-primary">{displayLabel}</a>
               : <Link key={item.id ? `mobile-nav-${item.id}-${index}` : `mobile-nav-${index}`} to={targetPath} onClick={() => setIsMenuOpen(false)} className="block text-sm font-bold text-agri-primary">{displayLabel}</Link>
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
        } catch (e: any) {
            console.error("Visitor tracking failed", e.message || e);
        }
    };
    trackVisitor();

    return () => {
        clearInterval(interval);
        unsub();
    };
  }, []);

  const socials = [
    { icon: Twitter, link: settings?.footerSocials.twitter, label: 'Twitter' },
    { icon: Instagram, link: settings?.footerSocials.instagram, label: 'Instagram' },
    { icon: Facebook, link: settings?.footerSocials.facebook, label: 'Facebook' },
    { icon: Linkedin, link: settings?.footerSocials.linkedin, label: 'LinkedIn' },
    { icon: Youtube, link: settings?.footerSocials.youtube, label: 'YouTube' },
  ];

  return (
    <footer className="bg-stone-950/80 backdrop-blur-lg text-white pt-5 pb-3 relative overflow-hidden border-t border-white/10">
      {/* Agricultural Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="leafPattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M50 20c-10 0-20 10-20 20s10 20 20 20 20-10 20-20-10-20-20-20zm0 35c-8.3 0-15-6.7-15-15s6.7-15 15-15 15 6.7 15 15-6.7 15-15 15z" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#leafPattern)" />
        </svg>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
          
          {/* Column 1: Brand & Description */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Link to="/" className="shrink-0 mt-1">
                 {settings?.logoUrl ? (
                    <img src={settings.logoUrl} className="h-10 w-auto object-contain brightness-0 invert" alt="Agrigence" />
                 ) : (
                    <Logo className="h-10" variant="light" showText={false} />
                 )}
              </Link>
              <div className="flex flex-col">
                <span className="text-2xl font-serif font-bold text-white leading-none tracking-tight">Agrigence</span>
                <p className="text-[11px] font-serif italic text-sky-400 mt-1.5 leading-tight">
                  Where Agri-Intelligence Meets Agricultural Generation
                </p>
              </div>
            </div>
            <p className="text-stone-400 text-[10px] leading-relaxed font-serif italic">
              Bridging the gap between scientific research and practical farming innovation through intelligent agricultural systems and expert academic resources.
            </p>
            <div className="pt-1">
              <div className="flex items-center gap-2 mb-1">
                <Clock size={10} className="text-agri-secondary" />
                <span className="text-[8px] font-black uppercase tracking-widest text-agri-secondary">Next Issue Countdown</span>
              </div>
              <div className="flex gap-2 text-center">
                {[['d', timeLeft.d], ['h', timeLeft.h], ['m', timeLeft.m], ['s', timeLeft.s]].map(([unit, val]) => (
                  <div key={unit as string} className="bg-white/5 border border-white/10 rounded-lg px-2 py-0.5 min-w-[30px]">
                    <span className="block text-[10px] font-bold text-white leading-none">{val}</span>
                    <span className="text-[6px] text-stone-500 uppercase font-black">{unit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-white font-bold text-[10px] uppercase tracking-widest mb-2 flex items-center gap-2">
              <span className="w-3 h-px bg-agri-secondary"></span>
              Quick Links
            </h4>
            <ul className="space-y-1 text-[10px] text-stone-400">
              <li><Link to="/" className="hover:text-agri-secondary transition-colors flex items-center gap-2 group"><ChevronRight size={8} className="text-agri-secondary/50 group-hover:translate-x-1 transition-transform" /> Home</Link></li>
              <li><Link to="/tools" className="hover:text-agri-secondary transition-colors flex items-center gap-2 group"><ChevronRight size={8} className="text-agri-secondary/50 group-hover:translate-x-1 transition-transform" /> Agri-Tools</Link></li>
              <li><Link to="/products" className="hover:text-agri-secondary transition-colors flex items-center gap-2 group"><ChevronRight size={8} className="text-agri-secondary/50 group-hover:translate-x-1 transition-transform" /> Store</Link></li>
              <li><Link to="/blogs" className="hover:text-agri-secondary transition-colors flex items-center gap-2 group"><ChevronRight size={8} className="text-agri-secondary/50 group-hover:translate-x-1 transition-transform" /> Expert Blogs</Link></li>
              <li><Link to="/news" className="hover:text-agri-secondary transition-colors flex items-center gap-2 group"><ChevronRight size={8} className="text-agri-secondary/50 group-hover:translate-x-1 transition-transform" /> News & Updates</Link></li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div>
            <h4 className="text-white font-bold text-[10px] uppercase tracking-widest mb-2 flex items-center gap-2">
              <span className="w-3 h-px bg-agri-secondary"></span>
              Resources
            </h4>
            <ul className="space-y-1 text-[10px] text-stone-400">
              <li><Link to="/journals" className="hover:text-agri-secondary transition-colors flex items-center gap-2 group"><ChevronRight size={8} className="text-agri-secondary/50 group-hover:translate-x-1 transition-transform" /> Research Archive</Link></li>
              <li><Link to="/author-guidelines" className="hover:text-agri-secondary transition-colors flex items-center gap-2 group"><ChevronRight size={8} className="text-agri-secondary/50 group-hover:translate-x-1 transition-transform" /> Author Guidelines</Link></li>
              <li><Link to="/editorial-board" className="hover:text-agri-secondary transition-colors flex items-center gap-2 group"><ChevronRight size={8} className="text-agri-secondary/50 group-hover:translate-x-1 transition-transform" /> Editorial Board</Link></li>
              <li><Link to="/submission" className="hover:text-agri-secondary transition-colors flex items-center gap-2 group"><ChevronRight size={8} className="text-agri-secondary/50 group-hover:translate-x-1 transition-transform" /> Submit Manuscript</Link></li>
              <li><Link to="/about-contact" className="hover:text-agri-secondary transition-colors flex items-center gap-2 group"><ChevronRight size={8} className="text-agri-secondary/50 group-hover:translate-x-1 transition-transform" /> About & Contact</Link></li>
            </ul>
          </div>

          {/* Column 4: Social Media */}
          <div>
            <h4 className="text-white font-bold text-[10px] uppercase tracking-widest mb-2 flex items-center gap-2">
              <span className="w-3 h-px bg-agri-secondary"></span>
              Connect
            </h4>
            <div className="grid grid-cols-5 gap-2 mb-3">
                {socials.map((social, i) => (
                  <a 
                    key={i} 
                    href={social.link || '#'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-stone-400 hover:bg-agri-secondary hover:text-white transition-all border border-white/10 group"
                    title={social.label}
                  >
                    <social.icon size={12} className="group-hover:scale-110 transition-transform" />
                  </a>
                ))}
            </div>
            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <p className="text-[8px] font-black uppercase tracking-widest text-stone-500 mb-0.5">Global Visitor Count</p>
              <p className="text-lg font-serif font-bold text-agri-secondary">{visitorCount.toLocaleString()}</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-[7px] font-bold text-white/60 uppercase tracking-wider">System Online</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-2 border-t border-white/5">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2">
            <div className="text-[8px] font-black uppercase tracking-[0.2em] text-stone-600">
              © {new Date().getFullYear()} AGRIGENCE INTELLECTUAL PROPERTY.
            </div>

            <div className="flex flex-wrap justify-center gap-3 text-[8px] font-black uppercase tracking-widest text-stone-500">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link to="/sitemap" className="hover:text-white transition-colors">Sitemap</Link>
              <button onClick={() => window.dispatchEvent(new Event('openCookieSettings'))} className="hover:text-white transition-colors uppercase tracking-widest">Cookie Settings</button>
              <a href="mailto:info@agrigence.in" className="hover:text-white transition-colors">Support</a>
            </div>
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
