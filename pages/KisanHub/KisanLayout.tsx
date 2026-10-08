import React, { useState } from 'react';
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import { Home, IndianRupee, FileCheck, Menu, X, Landmark, CloudLightning, ArrowLeft, Languages, LayoutDashboard, Database, Smartphone, User, Tractor, Store, Map, FileText, ClipboardList, Package, Plus, Sprout, Beaker, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LanguageProvider, useLanguage, Language } from '../../lib/LanguageContext';
import Logo from '../../components/Logo';
import OptimizedImage from '../../components/OptimizedImage';
import { mockBackend } from '../../services/mockBackend';

const KisanLayoutContent: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const [settings, setSettings] = useState<any>(null);

  const navSections = [
    {
      title: 'Farm Management',
      items: [
        { to: '/kisan', label: 'Dashboard', icon: LayoutDashboard, end: true },
        { to: '/kisan/ledger', label: 'Khatabook', icon: IndianRupee },
        { to: '/kisan/equipment', label: 'My Assets', icon: Tractor },
      ]
    },
    {
      title: 'Advisory Services',
      items: [
        { to: '/kisan/crop-planner', label: 'AI Crop Planner', icon: Sprout },
        { to: '/kisan/soil-analyzer', label: 'Soil Analyzer', icon: Beaker },
        { to: '/kisan/weather', label: 'Weather Alerts', icon: CloudLightning },
        { to: '/kisan/sop', label: 'Expert SOPs', icon: ClipboardList },
      ]
    },
    {
      title: 'Marketplace',
      items: [
        { to: '/kisan/mandi', label: 'Mandi Rates', icon: Smartphone },
        { to: '/kisan/marketplace', label: 'Kisan Market', icon: Store },
      ]
    },
    {
      title: 'Resources',
      items: [
        { to: '/kisan/schemes', label: 'Govt Schemes', icon: Landmark },
        { to: '/kisan/land', label: 'Land Records', icon: Map },
      ]
    }
  ];

  React.useEffect(() => {
    const unsub = mockBackend.subscribeToSettings(setSettings);
    return () => unsub();
  }, []);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as Language);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900 pb-20 md:pb-0">
      {/* Top Header */}
      <header className="bg-[#92745B] text-white shadow-xl sticky top-0 z-50">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#92745B' }}>
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo area */}
            <div className="flex items-center gap-3 shrink-0">
               <div className="bg-white rounded-full p-1.5 h-10 w-10 md:h-12 md:w-12 flex items-center justify-center shrink-0 shadow-sm transition-transform active:scale-95 cursor-pointer" onClick={() => navigate('/kisan')}>
                   {settings?.logoUrl && settings.logoUrl !== '/logo.png' ? (
                       <OptimizedImage src={settings.logoUrl} className="h-full w-full object-contain" alt="Logo" priority={true} />
                   ) : (
                       <Logo variant="dark" className="h-full w-full object-contain" showText={false} />
                   )}
               </div>
               <div className="flex flex-col">
                 <span className="font-black text-lg md:text-xl tracking-tight font-serif" style={{ fontFamily: 'Times New Roman' }}>Agrigence Kheti</span>
                 <span className="text-[10px] uppercase tracking-[0.2em] font-black opacity-60 leading-none hidden xs:block">Kisan Hub</span>
               </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex flex-1 items-center justify-center mx-8">
              <nav className="flex space-x-1 items-center bg-black/10 p-1 rounded-2xl relative">
                <Link to="/kisan" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all text-white/80 hover:bg-white/10 hover:text-white">
                  Dashboard
                </Link>
                
                {/* Reorganized Dropdowns can be added here, for now a simplified direct row */}
                <Link to="/kisan/crop-planner" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all text-white/80 hover:bg-white/10 hover:text-white">
                   Crop Planner
                </Link>
                <Link to="/kisan/mandi" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all text-white/80 hover:bg-white/10 hover:text-white">
                   Mandi Bhav
                </Link>
                <Link to="/kisan/schemes" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all text-white/80 hover:bg-white/10 hover:text-white">
                   Schemes
                </Link>
                <Link to="/kisan/marketplace" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all text-white/80 hover:bg-white/10 hover:text-white">
                   Marketplace
                </Link>
              </nav>
            </div>

            {/* Right side icons & Language */}
            <div className="flex items-center gap-2 md:gap-4 shrink-0">
              <div className="hidden sm:flex items-center bg-white/10 rounded-xl px-2">
                <Languages size={14} className="text-emerald-400 ml-2" />
                <select 
                  value={language}
                  onChange={handleLanguageChange}
                  className="bg-transparent border-none py-2.5 pl-2 pr-8 text-xs text-white outline-none focus:ring-0 font-bold cursor-pointer appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1rem' }}
                >
                  <option value="en" className="text-stone-900">EN</option>
                  <option value="hi" className="text-stone-900">HI</option>
                  <option value="mr" className="text-stone-900">MR</option>
                  <option value="pa" className="text-stone-900">PA</option>
                  <option value="gu" className="text-stone-900">GU</option>
                </select>
              </div>
              <Link to="/kisan/dashboard" className="p-2.5 md:p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-all">
                <User size={20} className="text-white" />
              </Link>
              <button 
                onClick={() => setIsOpen(true)}
                className="lg:hidden p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 transition-all"
              >
                <Menu size={20} />
              </button>
              <NavLink to="/dashboard" className="hidden xl:flex p-2.5 rounded-2xl bg-black/20 hover:bg-black/30 transition-all text-xs font-black uppercase tracking-widest text-white border border-white/10 items-center gap-2">
                 Exit Hub <ArrowLeft size={14} />
              </NavLink>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Sidebar */}
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[60]"
              />
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                className="fixed top-0 right-0 h-full w-4/5 max-w-sm bg-white z-[70] shadow-2xl p-8 flex flex-col"
              >
                <div className="flex justify-between items-center mb-10">
                  <div className="flex items-center gap-2">
                    <Tractor className="text-[#92745B]" size={24} />
                    <span className="font-serif font-black text-[#92745B] text-xl">Menu</span>
                  </div>
                  <button onClick={() => setIsOpen(false)} className="p-2 bg-stone-50 rounded-xl text-stone-400">
                    <X size={20} />
                  </button>
                </div>

                <nav className="flex-1 space-y-8 overflow-y-auto pr-2 custom-scrollbar">
                   {navSections.map((section, sIdx) => (
                     <div key={sIdx} className="space-y-3">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 pl-4">{section.title}</h3>
                        <div className="space-y-1">
                          {section.items.map((item) => (
                            <NavLink 
                              key={item.to} 
                              to={item.to} 
                              end={item.end}
                              onClick={() => setIsOpen(false)} 
                              className={({isActive}) => `flex items-center justify-between group px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${isActive ? 'bg-[#92745B] text-white shadow-lg' : 'text-stone-600 hover:bg-stone-50'}`}
                            >
                              {({ isActive }) => (
                                <>
                                  <div className="flex items-center gap-3">
                                    <item.icon size={20} className={isActive ? 'text-white' : 'text-[#92745B] group-hover:scale-110 transition-transform'} />
                                    {item.label}
                                  </div>
                                  {!isActive && <ChevronRight size={14} className="text-stone-300 opacity-0 group-hover:opacity-100 transition-all" />}
                                </>
                              )}
                            </NavLink>
                          ))}
                        </div>
                     </div>
                   ))}
                </nav>

                <div className="mt-auto pt-8 border-t border-stone-100 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Language</span>
                    <div className="flex gap-1">
                      {['en', 'hi', 'mr'].map((l) => (
                        <button 
                          key={l}
                          onClick={() => setLanguage(l as Language)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${language === l ? 'bg-[#92745B] border-[#92745B] text-white' : 'border-stone-200 text-stone-400'}`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                  <NavLink to="/dashboard" className="w-full py-4 bg-stone-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                    Exit Krishi Hub <ArrowLeft size={16} />
                  </NavLink>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-xl border border-stone-200/50 shadow-2xl rounded-[2rem] px-8 py-3 flex items-center gap-10 md:gap-16 z-50">
         <Link to="/kisan" className="flex flex-col items-center gap-1 transition-all text-stone-400 opacity-60">
            <LayoutDashboard size={24} />
            <span className="text-[9px] font-black uppercase tracking-widest">Hub</span>
         </Link>
         <Link to="/kisan/mandi" className="flex flex-col items-center gap-1 transition-all text-stone-400 opacity-60">
            <IndianRupee size={24} />
            <span className="text-[9px] font-black uppercase tracking-widest">Prices</span>
         </Link>
         <Link to="/kisan/crop-planner" className="flex flex-col items-center gap-1 transition-all text-stone-400 opacity-60">
            <Sprout size={24} />
            <span className="text-[9px] font-black uppercase tracking-widest">Plan</span>
         </Link>
         <Link to="/kisan/dashboard" className="flex flex-col items-center gap-1 transition-all text-stone-400 opacity-60">
            <User size={24} />
            <span className="text-[9px] font-black uppercase tracking-widest">Profile</span>
         </Link>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-screen-2xl mx-auto h-full relative">
         <Outlet />
      </main>
    </div>
  );
};

const KisanLayout: React.FC = () => {
  return (
    <LanguageProvider>
      <KisanLayoutContent />
    </LanguageProvider>
  );
};

export default KisanLayout;
