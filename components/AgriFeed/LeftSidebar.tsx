
import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import Logo from '../Logo';
import { 
  Home, 
  Search, 
  Users, 
  Mail, 
  Bookmark, 
  Bell, 
  User as UserIcon, 
  LayoutDashboard, 
  ArrowLeft,
  PlusCircle,
  BookOpen,
  Settings,
  Briefcase,
  MessageSquare
} from 'lucide-react';
import { User } from '../../types';

interface LeftSidebarProps {
  user: User | null;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ user }) => {
  const navigate = useNavigate();
  const navItems = [
    { label: 'Home', icon: <LayoutDashboard className="w-6 h-6" />, path: '/agri-feed/dashboard' },
    { label: 'AgriFeed', icon: <Home className="w-6 h-6" />, path: '/agri-feed/feed' },
    { label: 'Researchers', icon: <Users className="w-6 h-6" />, path: '/agri-feed/researchers' },
    { label: 'Collaborations', icon: <Briefcase className="w-6 h-6" />, path: '/agri-feed/collaborations' },
    { label: 'Messages', icon: <Mail className="w-6 h-6" />, path: '/agri-feed/inbox' },
    { label: 'Notifications', icon: <Bell className="w-6 h-6" />, path: '/agri-feed/notifications' },
    { label: 'Research Toolkit', icon: <BookOpen className="w-6 h-6" />, path: '/agri-feed/tools' },
    { label: 'Bookmarks', icon: <Bookmark className="w-6 h-6" />, path: '/agri-feed/saved' },
    { label: 'Profile', icon: <UserIcon className="w-6 h-6" />, path: `/agri-feed/profile/${user?.id}` },
    { label: 'Settings', icon: <Settings className="w-6 h-6" />, path: '/agri-feed/settings' },
  ];

  return (
    <div className="flex md:flex-col h-full md:justify-between">
      <div className="flex w-full md:w-auto md:flex-col md:space-y-2">
        {/* AgriFeed Logo */}
        <Link to="/agri-feed/dashboard" className="hidden md:flex items-center px-4 py-6 group">
          <span className="text-2xl font-black text-agri-primary">Agrigence</span>
        </Link>

        {/* Navigation */}
        <nav className="flex w-full justify-around md:justify-start md:flex-col md:space-y-1 p-2 md:p-0">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center justify-center md:justify-start gap-4 p-3 md:px-4 md:py-3 rounded-full text-xl font-medium transition-colors ${
                  isActive ? 'text-agri-primary font-bold' : 'text-stone-900 hover:bg-stone-100'
                }`
              }
            >
              {item.icon}
              <span className="hidden xl:block">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Create Post Button */}
        <button 
          onClick={() => { navigate('/agri-feed/feed'); setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100); }}
          className="hidden md:flex w-full bg-agri-primary hover:bg-agri-primary/90 text-white font-bold py-4 rounded-full shadow-lg transition-transform active:scale-95 items-center justify-center gap-2 mt-4"
        >
          <PlusCircle className="w-6 h-6" />
          <span className="hidden xl:block text-lg">Post</span>
        </button>
      </div>


      {/* Back to Agrigence */}
      <div className="hidden md:block mt-auto pb-6">
        <Link 
          to="/" 
          className="flex items-center gap-4 px-4 py-3 rounded-full text-stone-600 hover:bg-agri-secondary/10 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
          <span className="hidden xl:block">Back to Agrigence</span>
        </Link>
        
        {/* User Mini Profile */}
        {user && (
          <div className="flex items-center gap-3 mt-4 px-4 py-3 rounded-full hover:bg-agri-secondary/10 transition-colors cursor-pointer">
            <img 
              src={user.profilePhotoUrl || user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
              alt={user.name} 
              className="w-10 h-10 rounded-full bg-stone-200 object-cover"
            />
            <div className="hidden xl:block overflow-hidden">
              <p className="font-bold text-sm truncate">{user.name}</p>
              <p className="text-stone-500 text-xs truncate">@{user.email.split('@')[0]}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeftSidebar;
