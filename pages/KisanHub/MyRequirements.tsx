import React from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  AlertCircle,
  MoreVertical,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MyRequirements: React.FC = () => {
    const navigate = useNavigate();

    const requirements = [
        {
            id: '1',
            title: 'Irrigation System Overhaul',
            desc: 'Seeking comprehensive quotes for laying 500m of heavy-duty drip irrigation tape.',
            status: 'URGENT',
            date: 'Oct 24, 2023',
            offers: 5,
            type: 'service',
            color: 'rose'
        },
        {
            id: '2',
            title: 'Tractor Rental - 5 Days',
            desc: 'Need a 50HP tractor with a heavy-duty plow attachment for autumn field preparation.',
            status: 'OPEN',
            date: 'Oct 12, 2023',
            offers: 2,
            type: 'equipment',
            color: 'emerald'
        },
        {
            id: '3',
            title: 'Organic Fertilizer - 200 Bags',
            desc: 'Bulk order of certified organic compost delivered to main storage shed.',
            status: 'FULFILLED',
            date: 'Sep 28, 2023',
            offers: 0,
            type: 'produce',
            color: 'stone'
        }
    ];

    return (
        <div className="min-h-full p-6 md:p-12 bg-stone-50 font-sans pb-32">
            <header className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                <div className="space-y-2">
                    <button 
                      onClick={() => navigate('/kisan')}
                      className="flex items-center gap-2 text-stone-500 font-bold text-[10px] uppercase tracking-[0.2em] hover:text-[#2d5a27] transition-colors mb-4"
                    >
                       ← Hub Home
                    </button>
                    <h1 className="text-5xl font-black text-stone-900 tracking-tight">My Requirements</h1>
                    <p className="text-stone-500 text-lg font-medium">Connect with partners who can fulfill your farm's critical needs.</p>
                </div>
                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/kisan/post-requirement')}
                    className="bg-[#2d5a27] text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-xl shadow-emerald-900/20"
                >
                    <Plus size={20} /> Post New Need
                </motion.button>
            </header>

            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                 <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <Clock size={28} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Active Needs</p>
                        <p className="text-3xl font-bold text-stone-800 tracking-tighter">02</p>
                    </div>
                 </div>
                 <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <MessageSquare size={28} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Pending Offers</p>
                        <p className="text-3xl font-bold text-stone-800 tracking-tighter">07</p>
                    </div>
                 </div>
                 <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                        <TrendingUp size={28} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Average Response</p>
                        <p className="text-3xl font-bold text-stone-800 tracking-tighter">2.4h</p>
                    </div>
                 </div>
            </div>

            <div className="max-w-6xl mx-auto space-y-6">
                {requirements.map((req, i) => (
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={req.id} 
                        className={`group bg-white rounded-[2.5rem] p-8 border border-stone-100 shadow-sm hover:shadow-xl transition-all relative overflow-hidden ${req.status === 'FULFILLED' ? 'opacity-60' : ''}`}
                    >
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            <div className="flex-1 space-y-4">
                                <div className="flex items-center gap-3">
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase shadow-sm ${
                                        req.status === 'URGENT' ? 'bg-rose-500 text-white' : 
                                        req.status === 'OPEN' ? 'bg-emerald-500 text-white' : 'bg-stone-200 text-stone-600'
                                    }`}>
                                        {req.status}
                                    </span>
                                    <span className="text-[10px] font-black text-stone-300 uppercase tracking-widest">POSTED {req.date}</span>
                                </div>
                                
                                <div>
                                    <h3 className="text-2xl font-bold text-stone-800 mb-2 tracking-tight group-hover:text-[#2d5a27] transition-colors">{req.title}</h3>
                                    <p className="text-stone-500 font-medium leading-relaxed max-w-3xl">{req.desc}</p>
                                </div>

                                <div className="flex items-center gap-6 pt-2">
                                    <div className="flex items-center gap-2 text-stone-400 font-bold text-xs uppercase tracking-widest bg-stone-50 px-4 py-2 rounded-xl">
                                        <MessageSquare size={14} className="text-[#2d5a27]" /> {req.offers} Offers
                                    </div>
                                    <div className="flex items-center gap-2 text-stone-400 font-bold text-xs uppercase tracking-widest bg-stone-50 px-4 py-2 rounded-xl text-stone-400">
                                        <CheckCircle2 size={14} /> ID: #RE-{req.id}00
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 w-full md:w-auto shrink-0 self-stretch justify-center border-t md:border-t-0 md:border-l border-stone-50 pt-6 md:pt-0 md:pl-8">
                                {req.status !== 'FULFILLED' ? (
                                    <>
                                        <button className="bg-[#2d5a27] text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-800 transition-colors shadow-lg shadow-emerald-900/10">
                                            Review Offers <ChevronRight size={18} />
                                        </button>
                                        <div className="flex gap-2">
                                            <button className="flex-1 p-4 bg-stone-50 text-stone-500 rounded-2xl hover:bg-stone-100 transition-colors flex items-center justify-center">
                                                <MoreVertical size={20} />
                                            </button>
                                            <button className="flex-1 p-4 bg-stone-50 text-stone-400 hover:text-rose-500 hover:bg-rose-50 transition-all rounded-2xl flex items-center justify-center">
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <button className="px-8 py-4 rounded-2xl border-2 border-stone-100 text-stone-400 font-bold flex items-center justify-center gap-2 cursor-default">
                                        Fulfilled <CheckCircle2 size={18} className="text-emerald-500" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Empty State / Info */}
            <div className="max-w-6xl mx-auto mt-20 p-12 bg-white/50 rounded-[3rem] border border-dashed border-stone-200 text-center flex flex-col items-center">
                 <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center text-stone-400 mb-6">
                    <AlertCircle size={40} />
                 </div>
                 <h4 className="text-xl font-bold text-stone-800 mb-2">Need something else?</h4>
                 <p className="text-stone-500 mb-8 max-w-sm font-medium">Broadcast your farm requirements locally to get the best prices and services directly from verified partners.</p>
                 <button className="text-[#2d5a27] font-black text-xs uppercase tracking-[0.2em] border-b-2 border-[#2d5a27]/20 hover:border-[#2d5a27] transition-all pb-1">Learn how FieldNeeds works</button>
            </div>
        </div>
    );
};
