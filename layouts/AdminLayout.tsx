
import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { 
  LayoutDashboard, Users, BookOpen, FileText, ShoppingBag, 
  Settings, LogOut, Menu, X, ChevronRight, Bell, Search, Image, CreditCard,
  Rss, Award, Newspaper, Tag, ShieldCheck, Megaphone, UserCircle,
  Navigation, Layout as LayoutIcon, Globe, Mail, MessageSquare, Files, Sliders, Trash2
} from 'lucide-react';
import Logo from '../components/Logo';

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(true);

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

  return (
    <div className="min-h-screen bg-[#1C1510] text-white font-sans flex overflow-hidden">
      <aside 
        className={`${
          isSidebarOpen ? 'w-72' : 'w-20'
        } h-screen bg-black/40 backdrop-blur-2xl border-r border-white/5 transition-all duration-300 flex flex-col fixed lg:relative z-50`}
      >
        <div className="p-6 flex items-center justify-between border-b border-white/5 h-20">
          {isSidebarOpen ? (
            <Logo variant="light" className="w-32" />
          ) : (
             <div className="w-8 h-8 rounded-full bg-agri-secondary mx-auto shadow-[0_0_10px_rgba(194,146,99,0.5)]"></div>
          )}
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="hidden lg:block text-white/30 hover:text-white">
             {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 space-y-1 px-3 custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-agri-secondary text-agri-primary font-bold shadow-lg shadow-agri-secondary/10' 
                    : 'text-white/40 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon size={20} className={isActive ? 'text-agri-primary' : 'text-white/20 group-hover:text-white'} />
                {isSidebarOpen && <span className="text-[13px] tracking-wide">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5 bg-black/20">
          <div className={`flex items-center gap-3 ${!isSidebarOpen && 'justify-center'}`}>
            <img src={user?.avatar} className="w-10 h-10 rounded-full border border-agri-secondary shadow-lg" alt="Admin" />
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate text-white">{user?.name}</p>
                <p className="text-[10px] text-white/40 truncate uppercase font-black tracking-widest">{user?.role}</p>
              </div>
            )}
            {isSidebarOpen && (
              <button onClick={handleLogout} className="text-white/30 hover:text-red-400">
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </aside>

      <main className="flex-1 h-screen overflow-y-auto bg-[#2D1F16]">
        <header className="sticky top-0 z-40 bg-[#1C1510]/80 backdrop-blur-md border-b border-white/5 px-8 py-4 flex justify-between items-center h-20">
          <div className="flex items-center gap-4">
             <button className="lg:hidden text-white" onClick={() => setSidebarOpen(!isSidebarOpen)}><Menu /></button>
             <h2 className="text-xl font-serif font-bold text-white capitalize tracking-wide">{location.pathname.split('/').pop()?.replace('-', ' ')}</h2>
          </div>
          <div className="flex items-center gap-6">
            <p className="text-[10px] font-black text-agri-secondary uppercase tracking-[0.3em] hidden md:block border border-agri-secondary/30 px-3 py-1.5 rounded-full">
              SECURE_CHANNEL_v2.0
            </p>
          </div>
        </header>
        <div className="p-10 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
