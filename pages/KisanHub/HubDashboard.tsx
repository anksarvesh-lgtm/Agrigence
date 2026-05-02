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
  Droplets
} from 'lucide-react';
import { useLanguage } from '../../lib/LanguageContext';
import { useAuth } from '../../App';

const HubDashboard: React.FC = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    return (
        <div className="min-h-full bg-stone-50 p-6 md:p-8 font-sans">
            <div className="max-w-[1440px] mx-auto">
                {/* Welcome Header */}
                <header className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-stone-900 mb-1 tracking-tight">
                            Welcome back, {user ? user.name : 'Farmer'}
                        </h1>
                        <p className="text-stone-500 font-medium flex items-center gap-2">
                            <Calendar size={16} className="text-[#2d5a27]" />
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • Harvest Season Phase II
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <div className="bg-[#2d5a27]/10 px-4 py-2 rounded-xl border border-[#2d5a27]/10 flex items-center gap-3 shadow-sm">
                            <div className="p-2 bg-[#2d5a27] rounded-lg text-white shadow-sm">
                                <Zap size={16} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-[#2d5a27] uppercase leading-tight tracking-wider">Market Demand</p>
                                <p className="text-sm font-bold text-stone-900">Wheat High (+18%)</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Metrics Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Weather Detail */}
                    <div onClick={() => navigate('/kisan/weather')} className="cursor-pointer bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-stone-100 relative overflow-hidden group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                                <ThermometerSun size={24} />
                            </div>
                            <span className="flex items-center text-amber-700 font-bold text-[10px] uppercase tracking-widest bg-amber-100 px-2 py-1 rounded-lg">
                                Alert: Storm
                            </span>
                        </div>
                        <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">Current Weather</p>
                        <h3 className="text-3xl font-extrabold text-stone-900 tracking-tight">32°C <span className="text-sm font-medium text-stone-500">Sunny</span></h3>
                    </div>
                    
                    {/* Mandi Rate Detail */}
                    <div onClick={() => navigate('/kisan/mandi')} className="cursor-pointer bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-stone-100 group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                                <IndianRupee size={24} />
                            </div>
                            <span className="flex items-center text-emerald-700 font-bold text-sm bg-emerald-50 px-2 py-1 rounded-lg">
                                <TrendingUp size={14} className="mr-1" />
                                Nearest Max
                            </span>
                        </div>
                        <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">Azadpur Mandi • Wheat</p>
                        <h3 className="text-3xl font-extrabold text-stone-900 tracking-tight">₹2,950<span className="text-sm font-medium text-stone-500">/Qtl</span></h3>
                    </div>
                    
                    {/* Market Update Detail */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-stone-100 group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                                <Store size={24} />
                            </div>
                            <span className="flex items-center text-emerald-700 font-bold text-sm bg-emerald-50 px-2 py-1 rounded-lg">
                                <TrendingUp size={14} className="mr-1" />
                                Demand High
                            </span>
                        </div>
                        <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">Global Market Trend</p>
                        <h3 className="text-3xl font-extrabold text-stone-900 tracking-tight">Cotton +12%</h3>
                    </div>
                    
                    {/* Asset Detail */}
                    <div onClick={() => navigate('/kisan/equipment')} className="cursor-pointer bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-stone-100 group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
                                <Tractor size={24} />
                            </div>
                            <span className="flex items-center text-stone-600 font-bold text-[10px] uppercase tracking-widest bg-stone-100 px-2 py-1 rounded-lg">
                                <ShieldCheck size={14} className="mr-1" />
                                Verified
                            </span>
                        </div>
                        <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">Your Equipment & Assets</p>
                        <h3 className="text-3xl font-extrabold text-stone-900 tracking-tight">4 Active</h3>
                    </div>
                </div>

                {/* Government Schemes Highlight Row */}
                <div onClick={() => navigate('/kisan/schemes')} className="cursor-pointer mb-8 relative overflow-hidden bg-gradient-to-r from-[#2d5a27]/90 to-emerald-800 rounded-3xl p-8 md:p-10 shadow-xl border border-[#2d5a27] group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                        <Landmark size={120} />
                    </div>
                    <div className="relative z-10 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-[10px] font-black uppercase tracking-widest mb-4">
                            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
                            New Subsidies Updated
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-2">Government Schemes & Financial Aid</h2>
                        <p className="text-white/80 font-medium md:text-lg mb-6 leading-relaxed">Access verified central and state agriculture subsidies. Apply for PM-KISAN, crop insurance, and equipment loans directly through official portals.</p>
                        <button className="bg-white text-[#2d5a27] px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-stone-50 transition-colors shadow-sm group-hover:shadow-md">
                            Browse Subsidies <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default HubDashboard;

