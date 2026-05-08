import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../src/authContext';
import { mockBackend } from '../services/mockBackend';
import { 
  Menu, X, Search, User as UserIcon, LogOut, Cpu,
  Home, BookOpen, Newspaper, FileText, ShoppingBag, Wrench, BarChart2, Info, Users, Settings, ChevronRight, ArrowLeft, Shield, Mail
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
      { label: 'Archive', path: '/journals', icon: BookOpen },
      { label: 'Author Guidelines', path: '/author-guidelines', icon: FileText },
      { label: 'Editorial Board', path: '/editorial-board', icon: Users },
      { label: 'Publication Ethics', path: '/pages/publication-ethics', icon: Shield },
      { label: 'Aim & Scope', path: '/aim-scope', icon: Info },
      { label: 'About Journal', path: '/about-journal', icon: Info },
      { label: 'Contact Us', path: '/about-contact', icon: Mail },
    ];

    const raw = menuItems.length > 0 
      ? menuItems.map(m => ({...m, icon: defaultItems.find(d => d.path === m.path)?.icon || FileText})) 
      : defaultItems.map(i => ({ ...i, id: i.path, isExternal: false, order: 0, isEnabled: true }));
    
    // Filter by featureVisibility
    const visibility = settings?.featureVisibility || {
      mandi: true, schemes: true, crops: true, journals: true, store: true
    };

    let filteredByVisibility = raw.filter(item => {
      const path = item.path.toLowerCase();
      if (path === '/journals' && !visibility.journals) return false;
      if (path === '/products' && !visibility.store) return false;
      return true;
    });

    // Ensure essential items are present
    const essentialItems = [
      { label: 'Aim & Scope', path: '/aim-scope', icon: Info },
      { label: 'About Journal', path: '/about-journal', icon: Info },
      { label: 'Contact Us', path: '/about-contact', icon: Mail },
    ];

    essentialItems.forEach(item => {
      if (!filteredByVisibility.some(i => (i as any).path === item.path || (i as any).label === item.label)) {
        filteredByVisibility.push({ ...item, id: item.path, isExternal: false, order: 99, isEnabled: true } as any);
      }
    });

    const hasHome = filteredByVisibility.some(i => (i as any).path === '/' || (i as any).label === 'Home');
    const active = hasHome 
        ? filteredByVisibility 
        : [{ label: 'Home', path: '/', id: 'home-auto', isExternal: false, order: -999, isEnabled: true, icon: Home }, ...filteredByVisibility];

    const filtered = (active as any[]).filter(item => {
      const label = item.label?.trim().toLowerCase() || '';
      return !['analytics', 'pipeline builder', 'anova engine'].includes(label);
    });

    // Sub-function for title mapping
    const getTitle = (pathname: string) => {
      const segments = pathname.split('/').filter(Boolean);
      if (segments.length === 0) return 'Home';
      
      const menuItem = filtered.find(i => i.path === pathname);
      if (menuItem) return menuItem.label;

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
         if (a.type === 'BLOG') return false;
         if (!a.authorId) return true; 
         return adminIds.has(a.authorId);
      }).map(a => ({ ...a, resultType: 'Article' }));

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
      

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Top App Bar */}
         <header className="h-16 flex items-center justify-between px-4 sm:px-6 glossy border-b border-white/10 z-30 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 -ml-2 text-stone-900 dark:text-stone-100">
               {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Link to="/" className="flex items-center gap-3">
              <Logo className="h-8" />
              <div className="flex flex-col">
                <span className="font-serif font-bold text-agri-primary dark:text-stone-100 text-lg leading-none tracking-tight">
                  Agrigence
                </span>
                <span className="font-serif italic text-agri-secondary dark:text-agri-secondary/80 text-[9px] leading-tight mt-0.5">
                  Where Agri-Intelligence Meets Agricultural Generation
                </span>
              </div>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center gap-6 text-sm font-bold text-stone-600 dark:text-stone-300 uppercase tracking-widest text-[11px]">
             <Link to="/journals" className="hover:text-agri-primary transition-colors">Archive</Link>
             <Link to="/editorial-board" className="hover:text-agri-primary transition-colors">Editorial Board</Link>
             <Link to="/submission" className="hover:text-agri-primary transition-colors">Manuscript Submission</Link>
             <Link to="/about-journal" className="hover:text-agri-primary transition-colors">About</Link>
             <Link to="/about-contact" className="hover:text-agri-primary transition-colors">Contact</Link>
          </nav>

          <AnimatePresence>
            {isMobileMenuOpen && (
               <motion.nav 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute top-16 left-0 right-0 bg-white dark:bg-stone-950 border-b border-stone-200 dark:border-white/10 p-4 flex flex-col gap-4 text-sm font-bold text-stone-600 dark:text-stone-300 uppercase tracking-widest text-[11px] md:hidden shadow-xl z-20"
               >
                  <Link to="/journals" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-agri-primary py-2">Archive</Link>
                  <Link to="/editorial-board" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-agri-primary py-2">Editorial Board</Link>
                  <Link to="/submission" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-agri-primary py-2">Manuscript Submission</Link>
                  <Link to="/about-journal" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-agri-primary py-2">About</Link>
                  <Link to="/about-contact" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-agri-primary py-2">Contact</Link>
               </motion.nav>
            )}
          </AnimatePresence>
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
