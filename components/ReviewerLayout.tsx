
import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../App';
import Logo from './Logo';
import { 
  LogOut, Menu, X, FileText, MessageSquare, User, PenTool, Home
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ReviewerLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Assigned Articles', path: '/reviewer', icon: FileText },
    { label: 'My Reviews', path: '/reviewer/history', icon: PenTool }, // Could just filter on main page
    // { label: 'Messages', path: '/reviewer/messages', icon: MessageSquare }, // Could be integrated
  ];

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 font-sans flex overflow-hidden relative">
      
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:static top-0 left-0 h-screen bg-white border-r border-stone-200 shadow-xl lg:shadow-none
          transition-all duration-300 z-50 flex flex-col w-72
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="p-6 flex items-center justify-between border-b border-stone-100 h-20 shrink-0">
            <div className="flex items-center gap-3">
               <Logo className="h-8 w-auto" showText={true} />
               <span className="text-[10px] font-black uppercase bg-agri-secondary/10 text-agri-secondary px-2 py-1 rounded">Reviewer</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-stone-400 hover:text-black">
               <X size={24} />
            </button>
        </div>

        <div className="p-6 border-b border-stone-100">
            <div className="flex items-center gap-3">
                <img src={user?.avatar} className="w-12 h-12 rounded-full border-2 border-white shadow-md object-cover bg-stone-100" alt="Reviewer" />
                <div className="min-w-0">
                    <p className="text-sm font-bold truncate text-agri-primary">{user?.name}</p>
                    <p className="text-[10px] text-stone-400 truncate uppercase font-black tracking-widest">{user?.editorialRole || 'Editorial Member'}</p>
                </div>
            </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 space-y-1 px-4 custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/reviewer' && location.pathname.startsWith(item.path));
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-agri-primary text-white font-bold shadow-md' 
                    : 'text-stone-500 hover:bg-stone-100 hover:text-black'
                }`}
              >
                <item.icon size={18} className={`shrink-0 ${isActive ? 'text-agri-secondary' : 'text-stone-400 group-hover:text-agri-primary'}`} />
                <span className="text-xs font-bold uppercase tracking-widest">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-stone-100 bg-stone-50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 bg-white border border-stone-200 text-stone-500 hover:text-red-600 hover:border-red-200 shadow-sm"
          >
            <LogOut size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-y-auto bg-stone-50 relative w-full">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-stone-200 px-6 py-4 flex justify-between items-center h-20 shadow-sm lg:hidden">
             <button 
               className="text-stone-500 p-2 hover:bg-stone-100 rounded-lg transition-colors" 
               onClick={() => setSidebarOpen(true)}
             >
               <Menu size={24} />
             </button>
             <span className="font-serif font-bold text-lg text-agri-primary">Dashboard</span>
             <div className="w-10"></div> {/* Spacer */}
        </header>
        <div className="p-6 lg:p-10 max-w-7xl mx-auto pb-24">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
