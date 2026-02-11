
import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { 
  LayoutDashboard, Users, BookOpen, FileText, ShoppingBag, 
  Settings, LogOut, Menu, X, Image, CreditCard,
  Rss, Award, Newspaper, Tag, ShieldCheck, Megaphone,
  Navigation, Layout as LayoutIcon, Globe, Mail, MessageSquare, Files, Sliders, Trash2
} from 'lucide-react';
import Logo from '../components/Logo';

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Responsive State Management
  const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        // Auto-open on desktop if it was closed by mobile logic
        setSidebarOpen(true); 
      } else {
        // Auto-close on mobile resize
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Navigation', path: '/admin/navigation', icon: Navigation },
    { label: 'Layout', path: '/admin/layout', icon: LayoutIcon },
    { label: 'Inquiries', path: '/admin/inquiries', icon: MessageSquare },
    { label: 'Pages', path: '/admin/pages', icon: Files },
    { label: 'Articles', path: '/admin/articles', icon: FileText },
    { label: 'Blogs', path: '/admin/blogs', icon: Rss },
    { label: 'Magazines', path: '/admin/magazines', icon: BookOpen },
    { label: 'News', path: '/admin/news', icon: Newspaper },
    { label: 'Store Products', path: '/admin/products', icon: ShoppingBag },
    { label: 'Editorial Board', path: '/admin/board', icon: Award },
    { label: 'Users', path: '/admin/users', icon: Users },
    { label: 'Subscriptions', path: '/admin/plans', icon: CreditCard },
    { label: 'Payments', path: '/admin/payments', icon: ShieldCheck },
    { label: 'Notifications', path: '/admin/broadcast', icon: Megaphone },
    { label: 'Media Library', path: '/admin/media', icon: Image },
    { label: 'Coupons', path: '/admin/coupons', icon: Tag },
    { label: 'Email Templates', path: '/admin/templates', icon: Mail },
    { label: 'SEO Settings', path: '/admin/seo', icon: Globe },
    { label: 'Trash', path: '/admin/trash', icon: Trash2 },
    { label: 'Settings', path: '/admin/settings', icon: Sliders },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-[#1C1510] text-white font-sans flex overflow-hidden relative">
      
      {/* Mobile Overlay */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside 
        className={`
          fixed lg:static top-0 left-0 h-screen bg-black/40 backdrop-blur-2xl border-r border-white/5 
          transition-all duration-300 z-50 flex flex-col
          ${isSidebarOpen ? 'w-72 translate-x-0' : 'w-72 -translate-x-full lg:translate-x-0 lg:w-20'}
        `}
      >
        <div className="p-6 flex items-center justify-between border-b border-white/5 h-20 shrink-0">
          {(isSidebarOpen || isMobile) ? (
            <div className="flex items-center gap-3 animate-in fade-in duration-300">
               <Logo variant="light" className="h-8 w-auto" />
               <span className="font-serif font-bold text-xl tracking-tight text-white">Agrigence</span>
            </div>
          ) : (
             <div className="w-8 h-8 flex items-center justify-center mx-auto">
                <Logo variant="light" className="h-8 w-8" />
             </div>
          )}
          {isMobile && (
            <button onClick={() => setSidebarOpen(false)} className="text-white/30 hover:text-white">
               <X size={24} />
            </button>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-6 space-y-1 px-3 custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const showLabel = isSidebarOpen || isMobile;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => isMobile && setSidebarOpen(false)}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-agri-secondary text-agri-primary font-bold shadow-lg shadow-agri-secondary/10' 
                    : 'text-white/40 hover:bg-white/5 hover:text-white'
                } ${!showLabel && 'justify-center'}`}
                title={!showLabel ? item.label : ''}
              >
                <item.icon size={20} className={`shrink-0 ${isActive ? 'text-agri-primary' : 'text-white/20 group-hover:text-white'}`} />
                {showLabel && <span className="text-[13px] tracking-wide whitespace-nowrap">{item.label}</span>}
              </Link>
            );
          })}
          
          <div className="h-4"></div>
          
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group text-white/40 hover:bg-red-500/10 hover:text-red-400 ${!isSidebarOpen && !isMobile && 'justify-center'}`}
            title="Sign Out"
          >
            <LogOut size={20} className="shrink-0 text-white/20 group-hover:text-red-400" />
            {(isSidebarOpen || isMobile) && <span className="text-[13px] tracking-wide font-bold">Sign Out</span>}
          </button>
        </nav>

        <div className="p-4 border-t border-white/5 bg-black/20 shrink-0">
          <div className={`flex items-center gap-3 ${!isSidebarOpen && !isMobile && 'justify-center'}`}>
            <img src={user?.avatar} className="w-10 h-10 rounded-full border border-agri-secondary shadow-lg object-cover" alt="Admin" />
            {(isSidebarOpen || isMobile) && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate text-white">{user?.name}</p>
                <p className="text-[10px] text-white/40 truncate uppercase font-black tracking-widest">{user?.role}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto bg-[#2D1F16] relative w-full">
        <header className="sticky top-0 z-30 bg-[#1C1510]/80 backdrop-blur-md border-b border-white/5 px-6 lg:px-8 py-4 flex justify-between items-center h-20">
          <div className="flex items-center gap-4">
             <button 
               className="text-white p-2 hover:bg-white/5 rounded-lg transition-colors" 
               onClick={toggleSidebar}
             >
               {isSidebarOpen && !isMobile ? <X size={20} /> : <Menu size={20} />}
             </button>
             <h2 className="text-xl font-serif font-bold text-white capitalize tracking-wide truncate max-w-[200px] md:max-w-none">
                {location.pathname.split('/').pop()?.replace(/-/g, ' ')}
             </h2>
          </div>
          <div className="flex items-center gap-6">
            <p className="text-[10px] font-black text-agri-secondary uppercase tracking-[0.3em] hidden md:block border border-agri-secondary/30 px-3 py-1.5 rounded-full">
              SECURE_CHANNEL
            </p>
          </div>
        </header>
        <div className="p-6 lg:p-10 max-w-7xl mx-auto pb-24">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
