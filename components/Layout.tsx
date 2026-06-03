import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../src/authContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, Settings, BarChart2, BookOpen, Crown, FileText, LayoutDashboard, 
  Search, Bell, User, Sun, Moon, Sparkles, Menu, X, ChevronRight, 
  Map, GraduationCap, Trophy, History, Presentation, BrainCircuit,
  LogOut, Shield, DollarSign, Bookmark, RefreshCw, CheckCircle, Clock, Activity, Flame
} from 'lucide-react';

const ExamLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkTheme, setDarkTheme] = useState(true);
  const [showAiMentor, setShowAiMentor] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [location]);

  return (
    <div className={`min-h-screen flex ${darkTheme ? 'bg-[#0B1120] text-slate-200' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* MOBILE OVERLAY */}
      <AnimatePresence>
        {sidebarOpen && window.innerWidth < 1024 && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* LEFT SIDEBAR */}
      <motion.aside 
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 80 }}
        className={`fixed lg:relative z-50 h-[100dvh] flex flex-col transition-all duration-300 border-r
          ${darkTheme ? 'bg-[#0F172A] border-slate-800' : 'bg-white border-slate-200'}
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex items-center justify-between h-20 px-6 border-b border-slate-800/50 shrink-0">
          {sidebarOpen && (
            <Link to="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                <GraduationCap className="text-white w-5 h-5" />
              </div>
              <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-green-500">
                Agrigence
              </span>
              <span className="hidden xl:block text-[8px] font-black uppercase tracking-widest text-slate-500 leading-none mt-1 ml-1 max-w-[120px]">
                Where Agri-Intelligence Meets Agricultural Generations
              </span>
            </Link>
          )}
          {!sidebarOpen && (
            <Link to="/" className="mx-auto w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
              <GraduationCap className="text-white w-6 h-6" />
            </Link>
          )}
        </div>

        <div className="flex-1 overflow-y-auto python-scrollbar py-6 flex flex-col gap-6 px-4">
          
          {/* MAIN */}
          <div className="flex flex-col gap-1.5">
            {sidebarOpen && <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-3 py-1">Main</p>}
            <SidebarItem icon={LayoutDashboard} label="Dashboard" to="/dashboard" open={sidebarOpen} active={location.pathname === '/dashboard'} />
            <SidebarItem icon={FileText} label="Test Series" to="/test-series" open={sidebarOpen} active={location.pathname === '/test-series'} />
            <SidebarItem icon={Presentation} label="Mock Tests" to="/mock-tests" open={sidebarOpen} active={location.pathname === '/mock-tests'} />
            <SidebarItem icon={RefreshCw} label="Live Tests" to="/live-tests" open={sidebarOpen} active={location.pathname === '/live-tests'} badge="LIVE" />
            <SidebarItem icon={BookOpen} label="Current Affairs" to="/current-affairs" open={sidebarOpen} active={location.pathname === '/current-affairs'} />
            <SidebarItem icon={History} label="PYQs" to="/pyq" open={sidebarOpen} active={location.pathname === '/pyq'} />
            <SidebarItem icon={Sparkles} label="Practice" to="/practice" open={sidebarOpen} active={location.pathname === '/practice'} />
          </div>

          {/* ANALYTICS */}
          <div className="flex flex-col gap-1.5">
            {sidebarOpen && <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-3 py-1">Analytics</p>}
            <SidebarItem icon={BarChart2} label="Performance" to="/analytics/performance" open={sidebarOpen} active={location.pathname === '/analytics/performance'} />
            <SidebarItem icon={Trophy} label="Rank & Percentile" to="/analytics/rank" open={sidebarOpen} active={location.pathname === '/analytics/rank'} />
            <SidebarItem icon={CheckCircle} label="Accuracy" to="/analytics/accuracy" open={sidebarOpen} active={location.pathname === '/analytics/accuracy'} />
            <SidebarItem icon={Clock} label="Speed Analysis" to="/analytics/speed" open={sidebarOpen} active={location.pathname === '/analytics/speed'} />
            <SidebarItem icon={Activity} label="Weak Topics" to="/analytics/weak-topics" open={sidebarOpen} active={location.pathname === '/analytics/weak-topics'} />
          </div>

          {/* REVISION */}
          <div className="flex flex-col gap-1.5">
            {sidebarOpen && <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-3 py-1">Revision</p>}
            <SidebarItem icon={RefreshCw} label="Revision Center" to="/revision" open={sidebarOpen} active={location.pathname === '/revision'} />
            <SidebarItem icon={Bookmark} label="Bookmarks" to="/bookmarks" open={sidebarOpen} active={location.pathname === '/bookmarks'} />
            <SidebarItem icon={X} label="Wrong Questions" to="/revision/wrong" open={sidebarOpen} active={location.pathname === '/revision/wrong'} />
            <SidebarItem icon={RefreshCw} label="Retry Queue" to="/revision/retry" open={sidebarOpen} active={location.pathname === '/revision/retry'} />
          </div>

          {/* AI EXPERIENCES */}
          <div className="flex flex-col gap-1.5">
            {sidebarOpen && <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 px-3 py-1">AI Intelligence</p>}
            <SidebarItem icon={Bot} label="AI Mentor" to="/ai-mentor" open={sidebarOpen} active={location.pathname === '/ai-mentor'} />
            <SidebarItem icon={Sparkles} label="AI Recommendations" to="/ai-recommendations" open={sidebarOpen} active={location.pathname === '/ai-recommendations'} />
            <SidebarItem icon={Map} label="Smart Study Plan" to="/study-plan" open={sidebarOpen} active={location.pathname === '/study-plan'} />
          </div>

        </div>

        <div className="p-4 border-t border-slate-800/50 flex flex-col gap-1.5 shrink-0">
          {user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
            <SidebarItem icon={Shield} label="Admin Panel" to="/admin" open={sidebarOpen} />
          )}
          <SidebarItem icon={Crown} label="My Pass" to="/subscription" open={sidebarOpen} active={location.pathname === '/subscription'} />
          <SidebarItem icon={Bell} label="Notifications" to="/notifications" open={sidebarOpen} active={location.pathname === '/notifications'} />
          <SidebarItem icon={User} label="Profile" to="/profile" open={sidebarOpen} active={location.pathname === '/profile'} />
          <SidebarItem icon={Settings} label="Settings" to="/settings" open={sidebarOpen} active={location.pathname === '/settings'} />
          {user ? (
            <button onClick={logout} className={`flex items-center gap-4 px-3 py-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors ${!sidebarOpen && 'justify-center'}`}>
              <LogOut size={20} />
              {sidebarOpen && <span className="font-semibold text-sm">Logout</span>}
            </button>
          ) : (
            <SidebarItem icon={User} label="Login" to="/login" open={sidebarOpen} />
          )}
        </div>
      </motion.aside>

      {/* RIGHT CONTENT AREA */}
      <div className="flex-1 flex flex-col h-[100dvh] overflow-hidden relative">
        
        {/* TOP NAVBAR */}
        <header className={`h-20 flex-shrink-0 flex items-center justify-between px-4 lg:px-8 z-30
          ${darkTheme ? 'bg-[#0F172A]/80 border-slate-800' : 'bg-white/80 border-slate-200'}
          backdrop-blur-xl border-b`}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-xl text-slate-400 hover:bg-slate-800/10 transition-colors flex items-center justify-center border border-slate-850"
              aria-label="Toggle Navigation Sidebar"
            >
              <Menu size={20} />
            </button>

            <div className={`hidden lg:flex items-center gap-3 px-4 py-2.5 rounded-2xl border
              ${darkTheme ? 'bg-[#1E293B] border-slate-700 focus-within:border-emerald-500' : 'bg-slate-100 border-slate-300 focus-within:border-emerald-500'}
              transition-colors w-96 relative group`}
            >
              <Search size={18} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="Search for mock tests, PYQs, topics..." 
                className="bg-transparent border-none outline-none text-sm w-full font-medium"
              />
              <div className="absolute right-2 px-2 py-1 rounded bg-slate-800 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                AI SEARCH
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 lg:gap-5">
            
            {/* Daily Streak */}
            <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border ${darkTheme ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' : 'bg-orange-50 border-orange-200 text-orange-600'}`}>
              <Flame size={16} className={darkTheme ? 'text-orange-400' : 'text-orange-500'} />
              <span className="font-bold text-xs">12 Day Streak</span>
            </div>

            {/* Pass Status */}
            <Link to="/subscription" className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl font-bold text-xs uppercase tracking-wider text-white shadow-lg shadow-emerald-500/20 hover:scale-105 transition-transform">
              <Crown size={14} className="text-emerald-100" /> Pro Pass Active
            </Link>

            <button onClick={() => setDarkTheme(!darkTheme)} className="p-2 rounded-xl text-slate-400 hover:bg-slate-800 transition-colors">
              {darkTheme ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className="relative p-2 rounded-xl text-slate-400 hover:bg-slate-800 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0F172A]"></span>
            </button>
            {user ? (
              <Link to="/profile" className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center font-bold text-white shadow-lg cursor-pointer">
                {user.email?.charAt(0).toUpperCase()}
              </Link>
            ) : (
              <Link to="/login" className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-500 transition-colors">
                Sign In
              </Link>
            )}
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className={`flex-1 overflow-y-auto relative pb-16 md:pb-0 ${darkTheme ? 'bg-[#0B1120]' : 'bg-slate-50'}`}>
          <div className="h-full">
            <Outlet context={{ darkTheme }} />
          </div>
        </main>

        {/* MOBILE BOTTOM NAVIGATION */}
        <nav className={`fixed bottom-0 left-0 right-0 h-16 border-t md:hidden z-40 flex items-center justify-around px-2
          ${darkTheme ? 'bg-[#0F172A] border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600'}
        `}>
          <div className="flex items-center justify-around w-full max-w-md mx-auto">
            <BottomNavItem icon={LayoutDashboard} label="Home" to="/" active={location.pathname === '/'} darkTheme={darkTheme} />
            <BottomNavItem icon={FileText} label="Tests" to="/test-series" active={location.pathname.startsWith('/test')} darkTheme={darkTheme} />
            <BottomNavItem icon={Bot} label="AI Mentor" to="/ai-mentor" active={location.pathname === '/ai-mentor'} darkTheme={darkTheme} />
            <BottomNavItem icon={Trophy} label="Leaderboard" to="/leaderboard" active={location.pathname === '/leaderboard'} darkTheme={darkTheme} />
            <BottomNavItem icon={DollarSign} label="Get Pass" to="/subscription" active={location.pathname === '/subscription'} darkTheme={darkTheme} />
          </div>
        </nav>

        {/* FLOATING AI ASSISTANT */}
        <div className="fixed bottom-6 right-6 z-50">
          <AnimatePresence>
            {showAiMentor && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                className={`absolute bottom-20 right-0 w-80 md:w-96 rounded-2xl shadow-2xl border flex flex-col overflow-hidden
                  ${darkTheme ? 'bg-[#1E293B] border-slate-700 shadow-emerald-500/10' : 'bg-white border-slate-200'}`}
              >
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 flex items-center justify-between text-white">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                      <Bot size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">AI Mentor</h3>
                      <p className="text-[10px] text-emerald-100 uppercase font-black tracking-widest">Always Online</p>
                    </div>
                  </div>
                  <button onClick={() => setShowAiMentor(false)} className="hover:bg-white/20 p-2 rounded-lg transition-colors">
                    <X size={18} />
                  </button>
                </div>
                <div className={`h-64 p-4 overflow-y-auto ${darkTheme ? 'bg-[#0F172A]' : 'bg-slate-50'}`}>
                  <div className="flex flex-col gap-4">
                    <div className="self-start bg-slate-800 text-sm p-3 rounded-2xl rounded-tl-sm text-slate-200 max-w-[80%] border border-slate-700">
                      Hi! I noticed you struggle with <strong className="text-emerald-400">Pathology</strong>. Want to take a quick 5-min revision quiz?
                    </div>
                  </div>
                </div>
                <div className="p-3 border-t border-slate-700 bg-[#1E293B] flex gap-2">
                  <input type="text" placeholder="Ask a doubt..." className="flex-1 bg-slate-800 border-none rounded-xl px-4 py-2 text-sm outline-none text-slate-200" />
                  <button className="bg-emerald-600 text-white w-10 border-none rounded-xl flex items-center justify-center hover:bg-emerald-500 transition-colors">
                    <ChevronRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setShowAiMentor(!showAiMentor)}
            className="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-2xl shadow-emerald-600/40 hover:bg-emerald-500 hover:scale-110 transition-all duration-300 relative group"
          >
            <Bot size={24} />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-[#0F172A]"></span>
            </span>
          </button>
        </div>

      </div>
    </div>
  );
};

const SidebarItem = ({ icon: Icon, label, to, open, active, badge }: any) => (
  <Link 
    to={to} 
    className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-all group relative
      ${active 
        ? 'bg-emerald-500/10 text-emerald-400 font-semibold' 
        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
      }
      ${!open && 'justify-center'}
    `}
  >
    {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-500 rounded-r-full" />}
    <Icon size={20} className={active ? 'text-emerald-400' : 'group-hover:text-emerald-400 transition-colors'} />
    {open && <span className="text-sm flex-1 truncate">{label}</span>}
    {open && badge && (
      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-black tracking-widest uppercase">
        {badge}
      </span>
    )}
  </Link>
)

const BottomNavItem = ({ icon: Icon, label, to, active, darkTheme }: any) => (
  <Link 
    to={to} 
    className={`flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-lg text-center transition-all relative
      ${active 
        ? 'text-emerald-500 font-bold' 
        : darkTheme ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
      }
    `}
  >
    <Icon size={18} className={active ? 'text-emerald-500 scale-110' : 'transition-transform'} />
    <span className="text-[9px] tracking-tight truncate max-w-[50px]">{label}</span>
    {active && (
      <motion.div 
        layoutId="bottomTabUnderline"
        className="absolute -bottom-[2px] w-5 h-[2px] bg-emerald-500 rounded-full"
      />
    )}
  </Link>
);

export default ExamLayout;
