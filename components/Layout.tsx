import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../src/authContext';
import { mockBackend } from '../services/mockBackend';
import { 
  Menu, X, Search, User as UserIcon, LogOut, Cpu,
  Home, BookOpen, Newspaper, FileText, ShoppingBag, Wrench, BarChart2, Info, Users, Settings, ChevronRight, ArrowLeft
} from 'lucide-react';
import Logo from './Logo';
import { SiteSettings } from '../types';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useConfirm } from './ContextualConfirm';
import OptimizedImage from './OptimizedImage';
import ThemeToggle from './ThemeToggle';
import Footer from './Footer';

const DockItem = ({ children, mouseY, isCollapsed, onClick, isActive }: any) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isClicked, setIsClicked] = useState(false);
  
  const distance = useTransform(mouseY, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { y: 0, height: 0 };
    return val - (bounds.y + bounds.height / 2);
  });

  const scale = useTransform(distance, [-150, -75, 0, 75, 150], [1, 1.1, 1.4, 1.1, 1]);
  const scaleSpring = useSpring(scale, { stiffness: 200, damping: 25 });
  
  const y = useTransform(distance, [-150, 0, 150], [0, -5, 0]);
  const ySpring = useSpring(y, { stiffness: 200, damping: 25 });

  const finalScale = isCollapsed ? scaleSpring : 1;
  const finalY = isCollapsed ? ySpring : 0;

  const handleClick = (e: React.MouseEvent) => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 600);
    onClick?.(e);
  };

  return (
    <motion.div
      ref={ref}
      style={{ 
        scale: finalScale,
        y: finalY
      }}
      whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
      animate={isClicked ? { scale: [1, 0.95, 1.1, 1] } : {}}
      onClick={handleClick}
      className="relative group cursor-pointer rounded-xl transition-colors duration-200"
    >
      {children}
      
      {/* Glow Pulse */}
      <AnimatePresence>
        {isClicked && (
          <motion.div
            initial={{ scale: 0.5, opacity: 1, border: '2px solid rgba(194,146,99,1)', boxShadow: '0 0 0px rgba(194,146,99,0)' }}
            animate={{ 
              scale: 2.5, 
              opacity: 0, 
              border: '2px solid rgba(194,146,99,0)',
              boxShadow: '0 0 20px rgba(194,146,99,0.5)'
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute inset-0 rounded-xl pointer-events-none z-10"
          />
        )}
      </AnimatePresence>

      {isActive && (
        <motion.div 
          layoutId="active-pill"
          className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-agri-primary rounded-r-full shadow-[0_0_10px_rgba(61,43,31,0.5)]"
        />
      )}
    </motion.div>
  );
};

const AppLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [toolSections, setToolSections] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });
  const [clickPos, setClickPos] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();
  const location = useLocation();
  const { confirm } = useConfirm();
  
  const mouseY = useMotionValue(Infinity);
  const sidebarRef = useRef<HTMLElement>(null);

  // Process navigation items and SEO data in a single memo to ensure initialization order
  const { filteredMenuItems, pageTitle, canonicalUrl } = React.useMemo(() => {
    const menuItems = settings?.navigation 
      ? settings.navigation.filter(item => item.isEnabled).sort((a,b) => a.order - b.order) 
      : [];

    const defaultItems = [
      { label: 'Home', path: '/', icon: Home },
      { label: 'AI Hub', path: '/ai-hub', icon: Cpu },
      { label: 'Archive', path: '/journals', icon: BookOpen },
      { label: 'News', path: '/news', icon: Newspaper },
      { label: 'Blogs', path: '/blogs', icon: FileText },
      { label: 'Store', path: '/products', icon: ShoppingBag },
      { label: 'Tools', path: '/tools', icon: Wrench },
      { label: 'Author Guidelines', path: '/author-guidelines', icon: FileText },
      { label: 'Editorial Board', path: '/editorial-board', icon: Users },
      { label: 'About & Contact Us', path: '/about-contact', icon: Info },
    ];

    const raw = menuItems.length > 0 
      ? menuItems.map(m => ({...m, icon: defaultItems.find(d => d.path === m.path)?.icon || FileText})) 
      : defaultItems.map(i => ({ ...i, id: i.path, isExternal: false, order: 0, isEnabled: true }));
    
    // Ensure Tools and About & Contact Us are always present
    const essentialItems = [
      { label: 'Tools', path: '/tools', icon: Wrench },
      { label: 'About & Contact Us', path: '/about-contact', icon: Info },
    ];

    essentialItems.forEach(item => {
      if (!raw.some(i => i.path === item.path || i.label === item.label)) {
        raw.push({ ...item, id: item.path, isExternal: false, order: 99, isEnabled: true } as any);
      }
    });

    const hasHome = raw.some(i => i.path === '/' || i.label === 'Home');
    const active = hasHome 
        ? raw 
        : [{ label: 'Home', path: '/', id: 'home-auto', isExternal: false, order: -999, isEnabled: true, icon: Home }, ...raw];

    const filtered = active.filter(item => {
      const label = item.label?.trim().toLowerCase() || '';
      return !['analytics', 'pipeline builder', 'anova engine'].includes(label);
    });

    // Sub-function for title mapping
    const getTitle = (pathname: string) => {
      const segments = pathname.split('/').filter(Boolean);
      if (segments.length === 0) return 'Home';
      
      const menuItem = filtered.find(i => i.path === pathname);
      if (menuItem) return menuItem.label;

      if (segments[0] === 'news' && segments[1]) return `News | ${segments[1]}`;
      if (segments[0] === 'blog' && segments[1]) return `Blog | ${segments[1]}`;
      if (segments[0] === 'scheme' && segments[1]) return `Scheme | ${segments[1]}`;
      if (segments[0] === 'mandi-bhav' && segments[1]) return `Mandi Bhav | ${segments[1]}`;
      if (segments[0] === 'crop' && segments[1]) return `Crop advisory | ${segments[1]}`;
      
      return segments.map(s => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ')).join(' > ');
    };

    return {
      filteredMenuItems: filtered,
      pageTitle: getTitle(location.pathname),
      canonicalUrl: `https://www.agrigence.in${location.pathname === '/' ? '' : location.pathname}`
    };
  }, [settings?.navigation, location.pathname]);

  useEffect(() => {
    // Close sidebar on route change on mobile
    setIsSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const unsubSettings = mockBackend.subscribeToSettings((data) => {
        setSettings(data);
        // Favicon logic
        if (data.logoUrl) {
            const updateFavicon = (url: string) => {
                const linkId = 'dynamic-favicon';
                const oldLink = document.getElementById(linkId);
                const newLink = document.createElement('link');
                newLink.id = linkId;
                newLink.rel = 'shortcut icon';
                newLink.type = 'image/png';
                newLink.href = url;
                if (oldLink) document.head.removeChild(oldLink);
                else document.querySelectorAll("link[rel*='icon']").forEach(el => el.remove());
                document.head.appendChild(newLink);
            };
            const canvas = document.createElement('canvas');
            canvas.width = 64; canvas.height = 64;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                const img = new Image();
                img.crossOrigin = "Anonymous"; 
                img.onload = () => {
                    try {
                        ctx.clearRect(0, 0, 64, 64);
                        const scale = Math.min(64 / img.width, 64 / img.height);
                        const w = img.width * scale; const h = img.height * scale;
                        const x = (64 - w) / 2; const y = (64 - h) / 2;
                        ctx.drawImage(img, x, y, w, h);
                        updateFavicon(canvas.toDataURL('image/png'));
                    } catch (e) { updateFavicon(data.logoUrl); }
                };
                img.onerror = () => updateFavicon(data.logoUrl);
                img.src = data.logoUrl;
            }
        }
    });
    return () => unsubSettings();
  }, []);

  useEffect(() => {
    const loadTools = async () => {
      const sections = await mockBackend.getToolSections();
      setToolSections(sections);
    };
    loadTools();
  }, []);

  const getNextDeadline = () => {
    const now = new Date();
    let target = new Date(now.getFullYear(), now.getMonth(), 25, 23, 59, 59);
    if (now.getTime() > target.getTime()) {
      target = new Date(now.getFullYear(), now.getMonth() + 1, 25, 23, 59, 59);
    }
    return target.getTime();
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const target = getNextDeadline();
      const diff = target - now;
      if (diff > 0) {
        setTimeLeft({
          d: Math.floor(diff / (1000 * 60 * 60 * 24)),
          h: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          s: Math.floor((diff % (1000 * 60)) / 1000)
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term.length > 2) {
      const lowerTerm = term.toLowerCase();
      const results = await mockBackend.getArticles(term);
      const allUsers = await mockBackend.getPublicAdmins();
      const adminIds = new Set(allUsers.map(u => u.id));
      const publicResults = results.filter(a => {
         if (a.status !== 'PUBLISHED' && a.status !== 'APPROVED') return false;
         if (!a.authorId) return true; 
         return adminIds.has(a.authorId);
      }).map(a => ({ ...a, resultType: a.type === 'BLOG' ? 'Blog' : 'Article' }));

      let productResults: any[] = [];
      try {
        const products = await mockBackend.getProducts();
        productResults = products.filter(p => 
          p.name.toLowerCase().includes(lowerTerm) || 
          p.description.toLowerCase().includes(lowerTerm)
        ).map(p => ({ ...p, resultType: 'Product' }));
      } catch (err) {
        console.error("Error fetching products", err);
      }

      setSearchResults([...publicResults, ...productResults]);
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
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans">
      <Helmet>
        <title>{`${pageTitle} | Agrigence`}</title>
        <meta name="description" content={`Explore ${pageTitle} on Agrigence - The futuristic agricultural intelligence platform.`} />
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Open Graph Tags for sharing */}
        <meta property="og:title" content={`${pageTitle} | Agrigence`} />
        <meta property="og:description" content={`Explore ${pageTitle} on Agrigence - The futuristic agricultural intelligence platform.`} />
        <meta property="og:url" content={canonicalUrl} />
      </Helmet>
      
      {/* Sidebar (Desktop) & Drawer (Mobile) */}
      <aside className={`fixed inset-y-0 left-0 z-50 glossy border-r border-white/10 transform transition-all duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'} md:relative md:translate-x-0 ${isCollapsed ? 'md:w-20' : 'md:w-64'} flex flex-col shadow-2xl md:shadow-none`}>
        
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10 shrink-0 glossy">
          <Link to="/" className={`flex items-center gap-3 ${isCollapsed ? 'md:justify-center md:w-full' : ''}`}>
            {settings?.logoUrl ? (
                <OptimizedImage src={settings.logoUrl} className="h-8 w-auto object-contain shrink-0" alt="Agrigence" priority={true} />
            ) : (
                <Logo className="h-8 shrink-0" variant="dark" showText={false} />
            )}
            <span className={`font-serif font-bold text-agri-primary dark:text-stone-100 text-lg tracking-tight truncate ${isCollapsed ? 'md:hidden' : ''}`}>Agrigence</span>
          </Link>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-1 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <div 
          className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar"
          onMouseMove={(e) => mouseY.set(e.clientY)}
          onMouseLeave={() => mouseY.set(Infinity)}
        >
          {filteredMenuItems.map((item, index) => {
            const targetPath = (item.path === '/board' || item.label === 'Board') ? '/editorial-board' : item.path;
            const displayLabel = (item.label === 'Board') ? 'Editorial Board' : item.label;
            const Icon = item.icon || FileText;
            const isActive = location.pathname === targetPath || (targetPath !== '/' && location.pathname.startsWith(targetPath));

            const handleItemClick = (e: React.MouseEvent) => {
              setClickPos({ x: e.clientX, y: e.clientY });
              if (item.isExternal) {
                window.open(targetPath, '_blank');
              } else {
                navigate(targetPath);
              }
            };

            if (displayLabel === 'Tools') {
              return (
                <DockItem key={index} mouseY={mouseY} isCollapsed={isCollapsed} isActive={isActive}>
                  <div className="flex flex-col">
                    <button onClick={() => { setIsToolsOpen(!isToolsOpen); if (isCollapsed) setIsCollapsed(false); }} className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-agri-primary dark:hover:text-white ${isCollapsed ? 'md:justify-center' : ''}`} title={isCollapsed ? "Tools" : undefined}>
                      <div className="flex items-center gap-3">
                        <Icon size={18} className="shrink-0" />
                        <span className={`truncate ${isCollapsed ? 'md:hidden' : ''}`}>Tools</span>
                      </div>
                      <ChevronRight size={16} className={`transition-transform ${isToolsOpen ? 'rotate-90' : ''} ${isCollapsed ? 'md:hidden' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {isToolsOpen && !isCollapsed && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="pl-10 pr-3 py-2 space-y-2 border-l-2 border-stone-100 dark:border-stone-800 ml-5 mt-1">
                            <Link to="/tools" onClick={(e) => setClickPos({ x: e.clientX, y: e.clientY })} className="block text-xs font-medium text-stone-500 hover:text-agri-primary dark:hover:text-white transition-colors">All Tools</Link>
                            <Link to="/analytics" onClick={(e) => setClickPos({ x: e.clientX, y: e.clientY })} className="block text-xs font-medium text-stone-500 hover:text-agri-primary dark:hover:text-white transition-colors">Analytics</Link>
                            <Link to="/analytics/pipeline" onClick={(e) => setClickPos({ x: e.clientX, y: e.clientY })} className="block text-xs font-medium text-stone-500 hover:text-agri-primary dark:hover:text-white transition-colors">Pipeline Builder</Link>
                            <Link to="/analytics/anova" onClick={(e) => setClickPos({ x: e.clientX, y: e.clientY })} className="block text-xs font-medium text-stone-500 hover:text-agri-primary dark:hover:text-white transition-colors">ANOVA Engine</Link>
                            {toolSections.map(section => (
                              <Link key={section.id} to="/tools" onClick={(e) => setClickPos({ x: e.clientX, y: e.clientY })} className="block text-xs font-medium text-stone-500 hover:text-agri-primary dark:hover:text-white transition-colors">
                                {section.name}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </DockItem>
              );
            }

            if (displayLabel === 'About' || displayLabel === 'About & Contact Us') {
              return (
                <DockItem key={index} mouseY={mouseY} isCollapsed={isCollapsed} isActive={isActive}>
                  <div className="flex flex-col">
                    <button onClick={() => { setIsAboutOpen(!isAboutOpen); if (isCollapsed) setIsCollapsed(false); }} className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-agri-primary dark:hover:text-white ${isCollapsed ? 'md:justify-center' : ''}`} title={isCollapsed ? "About & Contact Us" : undefined}>
                      <div className="flex items-center gap-3">
                        <Icon size={18} className="shrink-0" />
                        <span className={`truncate ${isCollapsed ? 'md:hidden' : ''}`}>About & Contact Us</span>
                      </div>
                      <ChevronRight size={16} className={`transition-transform ${isAboutOpen ? 'rotate-90' : ''} ${isCollapsed ? 'md:hidden' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {isAboutOpen && !isCollapsed && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="pl-10 pr-3 py-2 space-y-2 border-l-2 border-stone-100 dark:border-stone-800 ml-5 mt-1">
                            <Link to="/about-contact" onClick={(e) => setClickPos({ x: e.clientX, y: e.clientY })} className="block text-xs font-medium text-stone-500 hover:text-agri-primary dark:hover:text-white transition-colors">Contact Us</Link>
                            <Link to="/editorial-board" onClick={(e) => setClickPos({ x: e.clientX, y: e.clientY })} className="block text-xs font-medium text-stone-500 hover:text-agri-primary dark:hover:text-white transition-colors">Leadership</Link>
                            <Link to="/privacy" onClick={(e) => setClickPos({ x: e.clientX, y: e.clientY })} className="block text-xs font-medium text-stone-500 hover:text-agri-primary dark:hover:text-white transition-colors">Privacy Policy</Link>
                            <Link to="/terms" onClick={(e) => setClickPos({ x: e.clientX, y: e.clientY })} className="block text-xs font-medium text-stone-500 hover:text-agri-primary dark:hover:text-white transition-colors">Terms of Service</Link>
                            <button onClick={() => window.dispatchEvent(new Event('openCookieSettings'))} className="block text-xs font-medium text-stone-500 hover:text-agri-primary dark:hover:text-white transition-colors text-left w-full">Cookie Settings</button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </DockItem>
              );
            }

            return (
              <DockItem key={index} mouseY={mouseY} isCollapsed={isCollapsed} isActive={isActive} onClick={handleItemClick}>
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${isActive ? 'bg-agri-primary/10 text-agri-primary dark:bg-agri-primary/20 dark:text-agri-secondary' : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-agri-primary dark:hover:text-white'} ${isCollapsed ? 'md:justify-center' : ''}`} title={isCollapsed ? displayLabel : undefined}>
                  <Icon size={18} className={`shrink-0 ${isActive ? 'text-agri-primary dark:text-agri-secondary' : ''}`} />
                  <span className={`truncate ${isCollapsed ? 'md:hidden' : ''}`}>{displayLabel}</span>
                </div>
              </DockItem>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-white/10 shrink-0 space-y-3 glossy">
           <div className={`flex items-center ${isCollapsed ? 'md:justify-center justify-between' : 'justify-between'} px-2`}>
             <span className={`text-xs font-medium text-stone-500 dark:text-stone-400 ${isCollapsed ? 'md:hidden' : ''}`}>Theme</span>
             <ThemeToggle />
           </div>
           
           {user ? (
             <div className={`flex items-center ${isCollapsed ? 'md:justify-center justify-between' : 'justify-between'} bg-white/5 dark:bg-black/20 backdrop-blur-md p-2 rounded-xl border border-white/10`}>
               <Link to={['SUPER_ADMIN', 'ADMIN'].includes(user.role) ? "/admin" : "/dashboard"} className="flex items-center gap-2 overflow-hidden" title={isCollapsed ? "Dashboard" : undefined}>
                 <div className="w-8 h-8 rounded-full bg-agri-primary text-white flex items-center justify-center font-bold text-xs shrink-0">
                   {user.name[0]}
                 </div>
                 <div className={`flex flex-col min-w-0 ${isCollapsed ? 'md:hidden' : ''}`}>
                   <span className="text-xs font-bold text-stone-800 dark:text-stone-200 truncate">{user.name}</span>
                   <span className="text-[10px] text-stone-500 dark:text-stone-400 truncate">{user.role}</span>
                 </div>
               </Link>
               <button onClick={handleLogout} className={`p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors ${isCollapsed ? 'md:hidden' : ''}`} title="Sign Out">
                 <LogOut size={16} />
               </button>
             </div>
           ) : (
             <Link to="/login" className={`flex items-center justify-center gap-2 w-full bg-agri-primary/80 backdrop-blur-md text-white border border-white/20 ${isCollapsed ? 'md:px-0 md:py-2.5 px-4 py-2.5' : 'px-4 py-2.5'} rounded-xl text-sm font-bold hover:bg-agri-secondary transition-colors shadow-lg shadow-agri-primary/20`} title={isCollapsed ? "Sign In" : undefined}>
               <UserIcon size={16} className="shrink-0" /> <span className={`${isCollapsed ? 'md:hidden' : ''}`}>Sign In</span>
             </Link>
           )}
           <div className={`text-center pt-2 ${isCollapsed ? 'md:hidden' : ''}`}>
             <span className="text-[9px] text-stone-400 dark:text-stone-600 uppercase tracking-widest">© {new Date().getFullYear()} Agrigence</span>
           </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden" 
            onClick={() => setIsSidebarOpen(false)} 
          />
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Top App Bar */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 glossy border-b border-white/10 z-30 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 -ml-2 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors">
              <Menu size={20} />
            </button>
            <button onClick={() => setIsCollapsed(!isCollapsed)} className="hidden md:flex p-2 -ml-2 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors">
              <Menu size={20} />
            </button>
            {location.pathname !== '/' && (
              <button onClick={() => navigate(-1)} className="hidden sm:flex p-1.5 text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors" aria-label="Go back">
                <ArrowLeft size={18} />
              </button>
            )}
            <div className={`flex flex-col ml-1 ${!isCollapsed ? 'md:hidden' : ''}`}>
              <span className="font-serif font-bold text-agri-primary dark:text-stone-100 text-xl leading-none tracking-tight">
                Agrigence
              </span>
              <p className="font-serif italic text-agri-secondary dark:text-agri-secondary/80 text-[9px] sm:text-[10px] leading-tight mt-0.5 hidden sm:block">
                Where Agri-Intelligence Meets Agricultural Generation
              </p>
            </div>
          </div>
          
          <div className="flex-1 max-w-xl mx-4 lg:mx-12 relative hidden md:block">
            <div className="relative group">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-agri-primary transition-colors" />
              <input
                type="text"
                placeholder="Search articles, blogs, products..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full bg-stone-100 dark:bg-stone-900/50 border border-stone-200 dark:border-white/10 rounded-full py-2 pl-9 pr-8 text-sm focus:outline-none focus:border-agri-primary/50 transition-all text-stone-800 dark:text-stone-200"
              />
              {searchTerm && (
                <button
                  onClick={() => { setSearchTerm(''); setSearchResults([]); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            
            <AnimatePresence>
              {searchTerm.length > 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-[calc(100%+8px)] w-full bg-white dark:bg-stone-950 border border-stone-200 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden z-[100]"
                >
                  <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {searchResults.length > 0 ? (
                      <div className="flex flex-col">
                        {searchResults.map((result, idx) => (
                           <button 
                             key={idx} 
                             onClick={() => { 
                               setSearchTerm(''); 
                               setSearchResults([]); 
                               if (result.resultType === 'Product') {
                                 navigate(`/products/${result.id}`);
                               } else if (result.resultType === 'Blog') {
                                 navigate(`/blog/${result.slug || result.id}`);
                               } else {
                                 navigate(`/article/${result.slug || result.id}`);
                               }
                             }} 
                             className="text-left px-4 py-3 border-b border-stone-100 dark:border-white/5 hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors w-full flex items-start gap-3 group"
                           >
                              <div className="mt-1 flex-shrink-0">
                                {result.resultType === 'Product' ? (
                                    <ShoppingBag size={16} className="text-stone-400 group-hover:text-agri-primary transition-colors" />
                                ) : result.resultType === 'Blog' ? (
                                    <FileText size={16} className="text-stone-400 group-hover:text-agri-primary transition-colors" />
                                ) : (
                                    <BookOpen size={16} className="text-stone-400 group-hover:text-agri-primary transition-colors" />
                                )}
                              </div>
                              <div className="flex flex-col flex-1 min-w-0">
                                  <span className="text-sm font-semibold text-stone-800 dark:text-stone-200 truncate group-hover:text-agri-primary transition-colors">{result.name || result.title}</span>
                                  {result.resultType === 'Product' ? (
                                     <span className="text-xs text-stone-500 dark:text-stone-400 truncate mt-0.5" dangerouslySetInnerHTML={{ __html: result.description || '' }} />
                                  ) : (
                                     <span className="text-xs text-stone-500 dark:text-stone-400 truncate mt-0.5">By {result.authorName}</span>
                                  )}
                                  <span className="text-[10px] uppercase font-bold text-agri-primary/80 tracking-wider mt-1.5">{result.resultType}</span>
                              </div>
                           </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center">
                        <Search size={24} className="mx-auto text-stone-300 dark:text-stone-700 mb-2" />
                        <span className="text-stone-500 text-sm">No results found for "{searchTerm}"</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex justify-end relative">
            <div className="flex items-center gap-3 bg-stone-950/40 dark:bg-black/40 backdrop-blur-xl px-5 py-2.5 rounded-2xl border-2 border-agri-primary/40 shadow-[0_0_25px_rgba(61,43,31,0.3)] relative overflow-hidden group glossy-card">
              {/* Futuristic Scanline Effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-agri-primary/15 to-transparent h-[200%] animate-scanline pointer-events-none" />
              
              {/* Digital Grid overlay */}
              <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[radial-gradient(#C29263_0.5px,transparent_0.5px)] [background-size:10px_10px]" />

              <div className="flex flex-col items-end mr-3 hidden sm:flex relative z-10">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-agri-secondary animate-pulse shadow-[0_0_5px_rgba(194,146,99,0.8)]" />
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-agri-secondary">System Live</span>
                </div>
                <span className="text-[11px] font-bold text-stone-500 tracking-tight">Submission Deadline</span>
              </div>
              
              <div className="flex gap-2 relative z-10">
                {Object.entries(timeLeft).map(([unit, val]) => (
                  <div key={unit} className="flex flex-col items-center relative">
                    <div className="bg-stone-900 dark:bg-stone-950 rounded-lg px-2.5 py-1.5 min-w-[40px] border border-stone-800 dark:border-stone-900 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] group-hover:border-agri-primary/60 transition-all duration-500 relative overflow-hidden">
                      {/* Individual digit glow */}
                      <div className="absolute inset-0 bg-agri-primary/5 blur-md" />
                      <span className="relative block text-[15px] font-mono font-bold text-agri-secondary leading-none tracking-tighter drop-shadow-[0_0_10px_rgba(194,146,99,0.9)]">
                        {val.toString().padStart(2, '0')}
                      </span>
                    </div>
                    <span className="text-[8px] text-stone-600 uppercase font-black mt-1.5 tracking-[0.15em]">{unit}</span>
                  </div>
                ))}
              </div>

              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-agri-primary/50" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-agri-primary/50" />
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-stone-50 dark:bg-stone-950 relative">
          {/* Background darkening overlay during transition */}
          <AnimatePresence>
            {location.pathname && (
              <motion.div
                key="transition-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 bg-black pointer-events-none z-0"
              />
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ 
                scale: 0.2, 
                opacity: 0, 
                x: clickPos.x - window.innerWidth / 2, 
                y: clickPos.y - window.innerHeight / 2,
                filter: 'blur(20px)'
              }}
              animate={{ 
                scale: 1, 
                opacity: 1, 
                x: 0, 
                y: 0,
                filter: 'blur(0px)'
              }}
              exit={{ 
                scale: 1.1, 
                opacity: 0,
                filter: 'blur(10px)',
                transition: { duration: 0.3 }
              }}
              transition={{ 
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1]
              }}
              className="h-full w-full relative z-10 flex flex-col"
            >
              <div className="flex-1">
                <Outlet />
              </div>
              <Footer />
            </motion.div>
          </AnimatePresence>
        </main>

      </div>
    </div>
  );
};

export default AppLayout;
