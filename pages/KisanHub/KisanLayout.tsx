import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Home, IndianRupee, FileCheck, Menu, X, Landmark, CloudLightning, ArrowLeft, Languages, LayoutDashboard, Database, Smartphone, User, Tractor, Store, Map, FileText, ClipboardList, Package, Plus } from 'lucide-react';
import { LanguageProvider, useLanguage, Language } from '../../lib/LanguageContext';
import Logo from '../../components/Logo';
import OptimizedImage from '../../components/OptimizedImage';
import { mockBackend } from '../../services/mockBackend';

const KisanLayoutContent: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  const [settings, setSettings] = useState<any>(null);

  React.useEffect(() => {
    const unsub = mockBackend.subscribeToSettings(setSettings);
    return () => unsub();
  }, []);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as Language);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Header */}
      <header className="bg-[#92745B] text-white shadow-xl sticky top-0 z-50">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#92745B' }}>
          <div className="flex items-center justify-between h-16">
            {/* Logo area */}
            <div className="flex items-center gap-3 shrink-0">
               <div className="bg-white rounded-full p-1.5 h-10 w-10 flex items-center justify-center shrink-0 shadow-sm">
                   {settings?.logoUrl ? (
                       <OptimizedImage src={settings.logoUrl} className="h-full w-full object-contain" alt="Logo" priority={true} />
                   ) : (
                       <Logo variant="dark" className="text-xl font-['Times_New_Roman']" showText={false} />
                   )}
               </div>
               <span className="font-black text-xl tracking-tight font-serif hidden sm:block" style={{ fontFamily: 'Times New Roman' }}>Agrigence Kheti</span>
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden">
              <button onClick={() => setIsOpen(!isOpen)} className="p-2 bg-white/10 rounded-xl">
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex flex-1 items-center justify-between ml-8">
              <nav className="flex space-x-1 overflow-x-auto scrollbar-none items-center">
                <NavLink to="/kisan" end className={({isActive}) => `flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${isActive ? 'bg-white text-[#92745B] shadow-md' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
                  <LayoutDashboard size={18} /> Hub Dashboard
                </NavLink>
                <NavLink to="/kisan/weather" className={({isActive}) => `flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${isActive ? 'bg-white text-[#92745B] shadow-md' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
                  <CloudLightning size={18} /> {t('nav.weather')}
                </NavLink>
                <NavLink to="/kisan/mandi" className={({isActive}) => `flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${isActive ? 'bg-white text-[#92745B] shadow-md' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
                  <Smartphone size={18} /> {t('nav.mandi')}
                </NavLink>
                <NavLink to="/kisan/marketplace" className={({isActive}) => `flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${isActive ? 'bg-white text-[#92745B] shadow-md' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
                  <Store size={18} /> Marketplace
                </NavLink>
                <NavLink to="/kisan/equipment" className={({isActive}) => `flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${isActive ? 'bg-white text-[#92745B] shadow-md' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
                  <Tractor size={18} /> Assets & Equip
                </NavLink>
              </nav>

              {/* Right side icons & Language */}
              <div className="flex items-center gap-3 shrink-0 ml-4 border-l border-white/20 pl-4">
                <div className="flex items-center bg-white/10 rounded-xl px-2">
                  <Languages size={14} className="text-emerald-400 ml-2" />
                  <select 
                    value={language}
                    onChange={handleLanguageChange}
                    className="bg-transparent border-none py-2 pl-2 pr-8 text-xs text-white outline-none focus:ring-0 font-bold cursor-pointer appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1rem' }}
                  >
                    <option value="en" className="text-stone-900">EN</option>
                    <option value="hi" className="text-stone-900">HI</option>
                    <option value="mr" className="text-stone-900">MR</option>
                    <option value="pa" className="text-stone-900">PA</option>
                    <option value="gu" className="text-stone-900">GU</option>
                  </select>
                </div>
                <NavLink to="/kisan/dashboard" className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all">
                  <User size={18} className="text-white" />
                </NavLink>
                <NavLink to="/dashboard" className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-sm font-bold text-white flex items-center gap-2">
                   Exit <span className="hidden xl:inline">Krishi</span>
                </NavLink>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isOpen && (
          <div className="md:hidden border-t border-white/10 bg-[#7d6148] px-4 pt-2 pb-4 space-y-1">
             <NavLink to="/kisan" end onClick={() => setIsOpen(false)} className={({isActive}) => `flex items-center gap-3 px-3 py-3 rounded-xl text-base font-bold ${isActive ? 'bg-white text-[#92745B]' : 'text-white'}`}>
                <LayoutDashboard size={20} /> Hub Dashboard
             </NavLink>
             <NavLink to="/kisan/weather" onClick={() => setIsOpen(false)} className={({isActive}) => `flex items-center gap-3 px-3 py-3 rounded-xl text-base font-bold ${isActive ? 'bg-white text-[#92745B]' : 'text-white'}`}>
                <CloudLightning size={20} /> {t('nav.weather')}
             </NavLink>
             <NavLink to="/kisan/mandi" onClick={() => setIsOpen(false)} className={({isActive}) => `flex items-center gap-3 px-3 py-3 rounded-xl text-base font-bold ${isActive ? 'bg-white text-[#92745B]' : 'text-white'}`}>
                <Smartphone size={20} /> {t('nav.mandi')}
             </NavLink>
             <NavLink to="/kisan/marketplace" onClick={() => setIsOpen(false)} className={({isActive}) => `flex items-center gap-3 px-3 py-3 rounded-xl text-base font-bold ${isActive ? 'bg-white text-[#92745B]' : 'text-white'}`}>
                <Store size={20} /> Marketplace
             </NavLink>
             <NavLink to="/kisan/equipment" onClick={() => setIsOpen(false)} className={({isActive}) => `flex items-center gap-3 px-3 py-3 rounded-xl text-base font-bold ${isActive ? 'bg-white text-[#92745B]' : 'text-white'}`}>
                <Tractor size={20} /> Assets & Equip
             </NavLink>
             <NavLink to="/kisan/dashboard" onClick={() => setIsOpen(false)} className={({isActive}) => `flex items-center gap-3 px-3 py-3 rounded-xl text-base font-bold ${isActive ? 'bg-white text-[#92745B]' : 'text-white'}`}>
                <User size={20} /> Farmer Profile
             </NavLink>
             
             <div className="mt-4 pt-4 border-t border-white/20">
               <label className="text-[10px] text-white/50 uppercase font-black tracking-widest pl-2 mb-2 block">Language</label>
               <select 
                 value={language}
                 onChange={(e) => { handleLanguageChange(e); setIsOpen(false); }}
                 className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white outline-none font-bold appearance-none mb-4"
               >
                 <option value="en" className="text-stone-900">English</option>
                 <option value="hi" className="text-stone-900">हिन्दी</option>
                 <option value="mr" className="text-stone-900">मराठी</option>
                 <option value="pa" className="text-stone-900">ਪੰਜਾਬੀ</option>
                 <option value="gu" className="text-stone-900">ગુજરાતી</option>
               </select>
             </div>
          </div>
        )}
      </header>

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
