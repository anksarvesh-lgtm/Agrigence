import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  CloudLightning, 
  IndianRupee, 
  FileCheck, 
  Home, 
  ChevronRight, 
  MapPin, 
  ThermometerSun, 
  TrendingUp,
  TrendingDown,
  LayoutDashboard,
  ShieldCheck,
  Zap,
  Landmark,
  Tractor,
  Store,
  Map,
  FileText,
  PlusCircle,
  ClipboardList,
  Calendar,
  Waves,
  Banknote,
  ShoppingCart,
  ArrowRight,
  User,
  Heart,
  Droplets,
  Sprout,
  Smartphone
} from 'lucide-react';
import { useLanguage } from '../../lib/LanguageContext';
import { useAuth } from '../../src/authContext';

const HubDashboard: React.FC = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    return (
        <div className="min-h-full bg-stone-50 px-4 md:px-8 py-8 md:py-10 font-sans">
            <div className="max-w-[1440px] mx-auto">
                {/* Welcome Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                             <div className="w-8 h-8 bg-agri-secondary/10 rounded-lg flex items-center justify-center text-agri-secondary">
                                <Sprout size={18} />
                             </div>
                             <span className="text-[10px] uppercase font-black tracking-[0.2em] text-stone-400">Bharat Krishi Portal</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-extrabold text-stone-900 mb-2 tracking-tight">
                            Namaste, {user ? user.name : 'Kisan Bhai'}
                        </h1>
                        <p className="text-stone-500 font-medium flex items-center gap-2 text-sm md:text-base">
                            <Calendar size={16} className="text-[#2d5a27]" />
                            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-4">
                        <div className="bg-white px-5 py-3 rounded-2xl border border-stone-100 flex items-center gap-4 shadow-sm">
                            <div className="p-2.5 bg-emerald-500 rounded-xl text-white shadow-lg shadow-emerald-500/20">
                                <TrendingUp size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-stone-400 uppercase leading-none tracking-widest mb-1">Market Sentiment</p>
                                <p className="text-sm font-bold text-stone-900">High Demand Phase</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Metrics Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-10">
                    {/* Weather Detail */}
                    <div onClick={() => navigate('/kisan/weather')} className="cursor-pointer bg-white p-6 rounded-3xl shadow-sm hover:shadow-xl transition-all border border-stone-100 relative overflow-hidden group">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-amber-50 rounded-2xl text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                                <ThermometerSun size={26} />
                            </div>
                            <span className="flex items-center text-amber-700 font-black text-[9px] uppercase tracking-widest bg-amber-100 px-3 py-1 rounded-full">
                                Rain Alert
                            </span>
                        </div>
                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Current Weather</p>
                        <div className="flex items-end gap-2">
                            <h3 className="text-4xl font-black text-stone-900 tracking-tight">32°c</h3>
                            <span className="text-sm font-bold text-stone-500 pb-1">Mostly Clear</span>
                        </div>
                    </div>
                    
                    {/* Mandi Rate Detail */}
                    <div onClick={() => navigate('/kisan/mandi')} className="cursor-pointer bg-white p-6 rounded-3xl shadow-sm hover:shadow-xl transition-all border border-stone-100 group">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                <IndianRupee size={26} />
                            </div>
                            <div className="bg-emerald-50 px-3 py-1 rounded-full flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-emerald-700 font-black text-[9px] uppercase tracking-widest">Live Updates</span>
                            </div>
                        </div>
                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Top Price: Wheat</p>
                        <div className="flex items-end gap-2">
                             <h3 className="text-4xl font-black text-stone-900 tracking-tight">₹2,950</h3>
                             <span className="text-sm font-bold text-stone-500 pb-1">/Qtl</span>
                        </div>
                    </div>
                    
                    {/* Market Update Detail */}
                    <div onClick={() => navigate('/kisan/marketplace')} className="cursor-pointer bg-white p-6 rounded-3xl shadow-sm hover:shadow-xl transition-all border border-stone-100 group">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <Store size={26} />
                            </div>
                            <span className="flex items-center text-blue-700 font-black text-[9px] uppercase tracking-widest bg-blue-100 px-3 py-1 rounded-full">
                                Verified
                            </span>
                        </div>
                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Farmer Marketplace</p>
                        <h3 className="text-3xl font-black text-stone-900 tracking-tight">Buy & Sell</h3>
                    </div>
                    
                    {/* Asset Detail */}
                    <div onClick={() => navigate('/kisan/equipment')} className="cursor-pointer bg-white p-6 rounded-3xl shadow-sm hover:shadow-xl transition-all border border-stone-100 group">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-rose-50 rounded-2xl text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                                <Tractor size={26} />
                            </div>
                            <span className="flex items-center text-rose-700 font-black text-[9px] uppercase tracking-widest bg-rose-100 px-3 py-1 rounded-full">
                                Near You
                            </span>
                        </div>
                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Equipment Rental</p>
                        <h3 className="text-3xl font-black text-stone-900 tracking-tight">Rent Tools</h3>
                    </div>
                </div>

                {/* Main AI Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-6">
                             <h2 className="text-2xl font-black text-stone-900 flex items-center gap-3">
                                <Zap size={24} className="text-amber-500 fill-amber-500" /> Krishi AI Assistant
                             </h2>
                             <span className="text-[10px] font-black uppercase tracking-widest text-[#2d5a27] bg-[#2d5a27]/10 px-3 py-1 rounded-full">Pro Features Enabled</span>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div 
                                onClick={() => navigate('/kisan/crop-planner')}
                                className="bg-[#2d5a27] p-8 rounded-[2.5rem] text-white shadow-xl shadow-[#2d5a27]/20 hover:scale-[1.02] transition-transform cursor-pointer group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-125 transition-transform duration-700">
                                    <Sprout size={140} />
                                </div>
                                <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl inline-block mb-6">
                                    <Sprout size={32} />
                                </div>
                                <h3 className="text-2xl font-black mb-2">AI Crop Planner</h3>
                                <p className="text-white/70 font-medium mb-8 leading-relaxed">Personalized 210-day crop journey powered by Advanced AI Models and real-time weather analytics.</p>
                                <div className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em]">
                                    Start Planning <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                                </div>
                            </div>

                            <div 
                                onClick={() => navigate('/kisan/soil-analyzer')}
                                className="bg-white p-8 rounded-[2.5rem] border-2 border-stone-100 hover:border-[#92745B]/30 hover:shadow-xl transition-all cursor-pointer group"
                            >
                                <div className="p-4 bg-stone-50 text-[#92745B] rounded-2xl inline-block mb-6 group-hover:bg-[#92745B] group-hover:text-white transition-colors">
                                    <ShieldCheck size={32} />
                                </div>
                                <h3 className="text-2xl font-black text-stone-900 mb-2">Soil Analyzer</h3>
                                <p className="text-stone-500 font-medium mb-8 leading-relaxed">Upload soil test reports to get instant fertilization & input recommendations.</p>
                                <div className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-[#92745B]">
                                    Start Analysis <ChevronRight size={18} className="group-hover:translate-x-2 transition-transform" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-stone-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden flex flex-col justify-between">
                         <div className="relative z-10">
                            <div className="bg-yellow-400 text-stone-900 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest inline-block mb-6">New Scheme</div>
                            <h3 className="text-3xl font-black leading-[1.1] mb-6">PM Solar Pump <br />Subsidies 2026</h3>
                            <p className="text-white/60 font-medium leading-relaxed mb-10">Apply before May 15th to get up to 60% subsidy on solar irrigation systems.</p>
                         </div>
                         <button 
                            onClick={() => navigate('/kisan/schemes')}
                            className="w-full py-4 bg-white text-stone-900 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-stone-100 transition-colors relative z-10"
                        >
                            View Eligibility
                         </button>
                         {/* Decoration */}
                         <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-emerald-500/20 rounded-full blur-3xl"></div>
                    </div>
                </div>

                {/* Quick Access Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {[
                        { icon: LayoutDashboard, label: 'Profile', to: '/kisan/dashboard', color: 'text-[#92745B]' },
                        { icon: IndianRupee, label: 'Khatabook', to: '/kisan/ledger', color: 'text-emerald-600' },
                        { icon: Landmark, label: 'Govt Schemes', to: '/kisan/schemes', color: 'text-rose-600' },
                        { icon: FileCheck, label: 'Verified SOPs', to: '/kisan/sop', color: 'text-blue-600' },
                        { icon: Map, label: 'Land Record', to: '/kisan/land', color: 'text-amber-600' },
                        { icon: Smartphone, label: 'Mandi Rates', to: '/kisan/mandi', color: 'text-indigo-600' },
                    ].map((item, idx) => (
                        <div 
                            key={idx}
                            onClick={() => navigate(item.to)}
                            className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-3 group"
                        >
                            <div className={`p-4 bg-stone-50 rounded-2xl group-hover:bg-white group-hover:shadow-md transition-all ${item.color}`}>
                                <item.icon size={24} />
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-widest text-stone-600">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HubDashboard;

