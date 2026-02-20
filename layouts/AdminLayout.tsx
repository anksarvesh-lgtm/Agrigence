
import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { 
  LayoutDashboard, Users, BookOpen, FileText, ShoppingBag, 
  Settings, LogOut, Menu, X, Image, CreditCard,
  Rss, Award, Newspaper, Tag, ShieldCheck, Megaphone,
  Navigation, Layout as LayoutIcon, Globe, Mail, MessageSquare, Files, Sliders, Trash2,
  Activity, FolderOpen, Crown, Layers, PenTool
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
        setSidebarOpen(true); 
      } else {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isAdmin = user?.role === 'ADMIN';
  const isEditorial = user?.role === 'EDITORIAL_MEMBER';

  // Define menu structure based on role
  let menuItems: { label: string; path: string; icon: any; isExternal?: boolean }[] = [];

  if (isEditorial) {
    menuItems = [
      { label: 'My Reviews', path: '/admin/reviews', icon: PenTool },
      { label: 'Profile Settings', path: '/dashboard', icon: Settings, isExternal: false },
    ];
  } else if (isSuperAdmin) {
    // SuperAdmin sees EVERYTHING
    menuItems = [
      { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
      { label: 'All Submissions', path: '/admin/submissions', icon: FolderOpen },
      { label: 'Status Tracker', path: '/admin/tracker', icon: Activity },
      { label: 'Users', path: '/admin/users', icon: Users },
      { label: 'Subscriptions', path: '/admin/plans', icon: CreditCard },
      { label: 'Payments', path: '/admin/payments', icon: ShieldCheck },
      { label: 'Articles', path: '/admin/articles', icon: FileText },
      { label: 'Blogs', path: '/admin/blogs', icon: Rss },
      { label: 'Magazines', path: '/admin/magazines', icon: BookOpen },
      { label: 'News', path: '/admin/news', icon: Newspaper },
      { label: 'Inquiries', path: '/admin/inquiries', icon: MessageSquare },
      { label: 'Notifications', path: '/admin/broadcast', icon: Megaphone },
      { label: 'Coupons', path: '/admin/coupons', icon: Tag },
      { label: 'Store Products', path: '/admin/products', icon: ShoppingBag },
      { label: 'Editorial Board', path: '/admin/board', icon: Award },
      { label: 'Leadership', path: '/admin/leadership', icon: Crown },
      { label: 'Pages', path: '/admin/pages', icon: Files },
      { label: 'Templates', path: '/admin/templates', icon: Mail },
      { label: 'Navigation', path: '/admin/navigation', icon: Navigation },
      { label: 'Layout', path: '/admin/layout', icon: LayoutIcon },
      { label: 'Popup Manager', path: '/admin/popup', icon: Layers },
      { label: 'SEO Settings', path: '/admin/seo', icon: Globe },
      { label: 'Media Library', path: '/admin/media', icon: Image },
      { label: 'Trash', path: '/admin/trash', icon: Trash2 },
      { label: 'Settings', path: '/admin/settings', icon: Sliders },
    ];
  } else if (isAdmin) {
    // Admin: Operational Role Only
    menuItems = [
      { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
      { label: 'Submissions', path: '/admin/submissions', icon: FolderOpen }, // Verify & Assign
      { label: 'Payments', path: '/admin/payments', icon: ShieldCheck }, // Approve Payments
      { label: 'Inquiries', path: '/admin/inquiries', icon: MessageSquare }, // Reply to messages
      { label: 'News', path: '/admin/news', icon: Newspaper }, // Publish News
      { label: 'Blogs', path: '/admin/blogs', icon: Rss }, // Publish Blogs
      { label: 'Notifications', path: '/admin/broadcast', icon: Megaphone }, // Send alerts
    ];
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-admin-bg text-admin-text font-sans flex overflow-hidden relative">
      
      {/* Mobile Overlay */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside 
        className={`
          fixed lg:static top-0 left-0 h-screen bg-admin-sidebar border-r border-admin-border shadow-admin
          transition-all duration-300 z-50 flex flex-col
          ${isSidebarOpen ? 'w-72 translate-x-0' : 'w-72 -translate-x-full lg:translate-x-0 lg:w-20'}
        `}
      >
        <div className="p-6 flex items-center justify-between border-b border-admin-border h-20 shrink-0 bg-admin-sidebar">
          {(isSidebarOpen || isMobile) ? (
            <div className="flex items-center gap-3 animate-in fade-in duration-300">
               <Logo variant="dark" className="h-8 w-auto" />
               <span className="font-serif font-bold text-xl tracking-tight text-admin-text">Agrigence</span>
            </div>
          ) : (
             <div className="w-8 h-8 flex items-center justify-center mx-auto">
                <Logo variant="dark" className="h-8 w-8" />
             </div>
          )}
          {isMobile && (
            <button onClick={() => setSidebarOpen(false)} className="text-admin-text hover:text-agri-secondary">
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
                    ? 'bg-white text-black font-bold shadow-md border border-admin-border' 
                    : 'text-stone-600 hover:bg-white hover:text-black hover:shadow-sm'
                } ${!showLabel && 'justify-center'}`}
                title={!showLabel ? item.label : ''}
              >
                <item.icon size={20} className={`shrink-0 ${isActive ? 'text-agri-secondary' : 'text-stone-400 group-hover:text-agri-secondary'}`} />
                {showLabel && <span className="text-[13px] tracking-wide whitespace-nowrap font-medium">{item.label}</span>}
              </Link>
            );
          })}
          
          <div className="h-px bg-admin-border mx-4 my-2"></div>
          
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group text-stone-600 hover:bg-red-50 hover:text-red-600 ${!isSidebarOpen && !isMobile && 'justify-center'}`}
            title="Sign Out"
          >
            <LogOut size={20} className="shrink-0 text-stone-400 group-hover:text-red-500" />
            {(isSidebarOpen || isMobile) && <span className="text-[13px] tracking-wide font-bold">Sign Out</span>}
          </button>
        </nav>

        <div className="p-4 border-t border-admin-border bg-white shrink-0">
          <div className={`flex items-center gap-3 ${!isSidebarOpen && !isMobile && 'justify-center'}`}>
            <img src={user?.avatar} className="w-10 h-10 rounded-full border border-admin-border shadow-sm object-cover bg-stone-100" alt="Admin" />
            {(isSidebarOpen || isMobile) && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate text-black">{user?.name}</p>
                <p className="text-[10px] text-stone-500 truncate uppercase font-black tracking-widest">{user?.role}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto bg-admin-bg relative w-full text-admin-text">
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-admin-border px-6 lg:px-8 py-4 flex justify-between items-center h-20 shadow-sm">
          <div className="flex items-center gap-4">
             <button 
               className="text-admin-secondary p-2 hover:bg-admin-hover rounded-lg transition-colors" 
               onClick={toggleSidebar}
             >
               {isSidebarOpen && !isMobile ? <X size={20} /> : <Menu size={20} />}
             </button>
             <h2 className="text-xl font-serif font-bold text-black capitalize tracking-wide truncate max-w-[200px] md:max-w-none">
                {location.pathname.split('/').pop()?.replace(/-/g, ' ')}
             </h2>
          </div>
          <div className="flex items-center gap-6">
            <p className="text-[10px] font-black text-agri-secondary uppercase tracking-[0.3em] hidden md:block border border-agri-secondary/30 px-3 py-1.5 rounded-full bg-agri-secondary/5">
              {isSuperAdmin ? 'SYSTEM_ROOT' : isAdmin ? 'OPS_MANAGER' : 'REVIEWER_NODE'}
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
