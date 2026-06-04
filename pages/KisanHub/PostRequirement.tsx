import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  MapPin, 
  Calendar, 
  IndianRupee, 
  CheckCircle, 
  PlusCircle, 
  Tractor, 
  Sprout, 
  Map, 
  Wrench,
  ChevronDown,
  Navigation
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PostRequirement: React.FC = () => {
    const navigate = useNavigate();
    const [category, setCategory] = useState('equipment');

    const categories = [
        { id: 'equipment', icon: Tractor, label: 'Equipment', color: 'text-primary' },
        { id: 'produce', icon: Sprout, label: 'Produce / Seed', color: 'text-emerald-600' },
        { id: 'land', icon: Map, label: 'Land Lease', color: 'text-amber-700' },
        { id: 'service', icon: Wrench, label: 'Labor / Service', color: 'text-blue-600' },
    ];

    return (
        <div className="min-h-full p-6 md:p-12 bg-stone-50 font-sans pb-32">
            <header className="max-w-4xl mx-auto mb-10">
                <button 
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 text-stone-500 font-bold text-sm uppercase tracking-widest hover:text-[#2d5a27] transition-colors mb-4"
                >
                   ← Back
                </button>
                <h1 className="text-4xl md:text-5xl font-black text-stone-900 tracking-tight mb-2">Post a Requirement</h1>
                <p className="text-stone-500 text-lg font-medium">Detail what you need to connect with available resources in your community.</p>
            </header>

            <form className="max-w-4xl mx-auto space-y-8" onSubmit={(e) => e.preventDefault()}>
                {/* Section 1: Category */}
                <section className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-[#2d5a27]"></div>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-[#2d5a27]">
                            <Plus size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-stone-800 tracking-tight">Select Category</h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {categories.map((cat) => (
                            <label key={cat.id} className="cursor-pointer group">
                                <input 
                                    type="radio" 
                                    name="category" 
                                    value={cat.id} 
                                    checked={category === cat.id}
                                    onChange={() => setCategory(cat.id)}
                                    className="peer sr-only" 
                                />
                                <div className="h-full border-2 border-stone-100 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 peer-checked:border-[#2d5a27] peer-checked:bg-emerald-50/50 transition-all hover:bg-stone-50">
                                    <cat.icon size={32} className={`transition-transform group-hover:scale-110 ${category === cat.id ? 'text-[#2d5a27]' : 'text-stone-400'}`} />
                                    <span className={`font-black text-[10px] uppercase tracking-wider text-center ${category === cat.id ? 'text-[#2d5a27]' : 'text-stone-400'}`}>{cat.label}</span>
                                </div>
                            </label>
                        ))}
                    </div>
                </section>

                {/* Section 2: Details */}
                <section className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500"></div>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                             <CheckCircle size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-stone-800 tracking-tight">Requirement Details</h2>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                             <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Short Title</label>
                             <input 
                                type="text" 
                                placeholder="e.g., Need a 50HP Tractor for 3 days"
                                className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 text-stone-800 font-bold placeholder:text-stone-300 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                             />
                        </div>

                        <div className="space-y-2">
                             <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Detailed Description</label>
                             <textarea 
                                rows={4}
                                placeholder="Describe specific specifications, conditions, or scope of work..."
                                className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 text-stone-800 font-bold placeholder:text-stone-300 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none"
                             />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Date Needed By</label>
                                <div className="relative">
                                    <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-300" size={20} />
                                    <input 
                                        type="date" 
                                        className="w-full bg-stone-50 border border-stone-100 rounded-2xl pl-14 pr-6 py-4 text-stone-800 font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                    />
                                </div>
                             </div>
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Expected Duration</label>
                                <div className="relative">
                                    <select className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 text-stone-800 font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none cursor-pointer">
                                        <option value="">Select duration...</option>
                                        <option value="1_day">1 Day</option>
                                        <option value="few_days">2-3 Days</option>
                                        <option value="week">1 Week</option>
                                        <option value="month">1 Month</option>
                                        <option value="season">Entire Season</option>
                                    </select>
                                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-stone-300 pointer-events-none" size={20} />
                                </div>
                             </div>
                        </div>
                    </div>
                </section>

                {/* Section 3: Budget and Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <section className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm relative overflow-hidden flex flex-col">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
                        <h2 className="text-2xl font-bold text-stone-800 tracking-tight mb-8">Budget & Offer</h2>
                        
                        <div className="space-y-6 flex-1">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest block ml-1">Compensation Type</label>
                                <div className="flex gap-4">
                                    <label className="flex-1 flex items-center justify-center gap-3 p-4 rounded-2xl border-2 border-stone-100 cursor-pointer hover:bg-stone-50 transition-all has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50/30">
                                        <input type="radio" name="comp_type" defaultChecked className="sr-only" />
                                        <IndianRupee size={18} />
                                        <span className="font-bold text-sm">Cash</span>
                                    </label>
                                    <label className="flex-1 flex items-center justify-center gap-3 p-4 rounded-2xl border-2 border-stone-100 cursor-pointer hover:bg-stone-50 transition-all has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50/30">
                                        <input type="radio" name="comp_type" className="sr-only" />
                                        <CheckCircle size={18} />
                                        <span className="font-bold text-sm">Barter</span>
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest block ml-1">Budget Range</label>
                                <div className="relative">
                                    <IndianRupee className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-300" size={20} />
                                    <input 
                                        type="text" 
                                        placeholder="e.g., ₹500 - ₹800 / day"
                                        className="w-full bg-stone-50 border border-stone-100 rounded-2xl pl-14 pr-6 py-4 text-stone-800 font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                     </section>

                     <section className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm relative overflow-hidden flex flex-col">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500"></div>
                        <h2 className="text-2xl font-bold text-stone-800 tracking-tight mb-8">Location</h2>
                        
                        <div className="space-y-6 flex-1 flex flex-col">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest block ml-1">Base Location</label>
                                <div className="relative">
                                    <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-300" size={20} />
                                    <input 
                                        type="text" 
                                        placeholder="Enter village or district"
                                        className="w-full bg-stone-50 border border-stone-100 rounded-2xl pl-14 pr-6 py-4 text-stone-800 font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            
                            <div className="flex-1 min-h-[140px] bg-stone-100 rounded-2xl border-2 border-dashed border-stone-200 flex flex-col items-center justify-center gap-3 group cursor-pointer hover:border-rose-300 transition-all">
                                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-rose-500 shadow-sm group-hover:scale-110 transition-transform">
                                    <Navigation size={24} />
                                </div>
                                <span className="text-xs font-black text-stone-400 uppercase tracking-widest">Pin Live Location</span>
                            </div>
                        </div>
                     </section>
                </div>

                {/* Form Actions */}
                <div className="pt-10 flex flex-col sm:flex-row justify-end gap-4 border-t border-stone-100">
                    <button 
                        type="button"
                        className="px-10 py-4 rounded-2xl border-2 border-stone-200 text-stone-600 font-bold hover:bg-stone-100 transition-all"
                    >
                        Save as Draft
                    </button>
                    <button 
                        type="submit"
                        className="group px-10 py-4 rounded-2xl bg-[#2d5a27] text-white font-bold shadow-xl shadow-emerald-900/20 hover:bg-emerald-800 transition-all flex items-center justify-center gap-3"
                    >
                        <PlusCircle size={20} className="group-hover:scale-110 transition-transform" />
                        Post Requirement
                    </button>
                </div>
            </form>
        </div>
    );
};
