import React, { useState, useEffect } from 'react';
import { useAuth } from '../../App';
import { motion } from 'framer-motion';
import { User, Smartphone, Globe, Mail, ShieldCheck, CheckCircle, AlertTriangle, FileText, MapPin, Store, Tractor, CreditCard, ChevronRight, Settings2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { mockBackend } from '../../services/mockBackend';

export const KisanDashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [payments, setPayments] = useState<any[]>([]);

    useEffect(() => {
        if (user) {
            const unsub = mockBackend.subscribeToUserPayments(user.id, (userPayments) => {
                const kisanPayments = userPayments.filter(p => p.planName.toLowerCase().includes('kisan'));
                setPayments(kisanPayments);
            });
            return () => unsub();
        }
    }, [user]);

    if (!user) return null;

    const isKisanPro = payments.some(p => p.planName === 'Kisan Pro' && p.status === 'COMPLETED');
    // Basic way to check active plan visually:
    const isPlanActive = user.subscriptionExpiry && new Date(user.subscriptionExpiry) > new Date();

    return (
        <div className="min-h-full p-6 md:p-12 font-sans pb-32">
            <header className="max-w-5xl mx-auto mb-10">
                <h1 className="text-4xl md:text-5xl font-black text-stone-900 tracking-tight mb-2">Farmer Profile</h1>
                <p className="text-stone-500 text-lg font-medium">Manage your agri-network, rentals, and subscriptions.</p>
            </header>

            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Overview */}
                <div className="md:col-span-1 space-y-8">
                    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-stone-200 flex flex-col items-center text-center">
                        <div className="w-24 h-24 bg-[#2d5a27] rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg mb-6 border-4 border-white ring-1 ring-[#2d5a27]/10 overflow-hidden">
                            {user.profilePhotoUrl ? (
                                <img src={user.profilePhotoUrl} className="w-full h-full object-cover" alt={user.name} />
                            ) : (
                                user.name[0]
                            )}
                        </div>
                        <h2 className="font-bold text-2xl text-stone-800">{user.name}</h2>
                        <span className="px-3 py-1 bg-stone-100 text-stone-600 rounded-full text-[10px] font-black uppercase tracking-widest mt-2">Verified Farmer</span>

                        <div className="w-full mt-8 pt-8 border-t border-stone-100 space-y-4 text-left">
                            <div>
                                <p className="text-[10px] font-black text-stone-300 uppercase tracking-widest mb-1 flex items-center gap-1"><Globe size={10} /> Region</p>
                                <p className="text-sm font-bold text-stone-600 truncate bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                                    {user.country || 'India'}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-stone-300 uppercase tracking-widest mb-1 flex items-center gap-1"><Smartphone size={10} /> Mobile</p>
                                <p className="text-sm font-bold text-stone-600 truncate bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                                    {user.mobileNumber || 'Not Linked'}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-stone-300 uppercase tracking-widest mb-1 flex items-center gap-1"><Mail size={10} /> Email</p>
                                <p className="text-sm font-bold text-stone-600 truncate bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                                    {user.email}
                                </p>
                            </div>
                            <div className="pt-2">
                                <p className="text-[10px] font-black text-stone-300 uppercase tracking-widest mb-1 flex items-center gap-1"><ShieldCheck size={10} /> Farm ID</p>
                                <p className="text-[11px] font-mono font-bold text-[#92745B] bg-stone-50 p-2.5 rounded-xl border border-stone-100 break-all select-all">
                                    {user.farmId || 'Generating...'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2 space-y-8">
                    {/* Kisan Pro Status */}
                    <div className="bg-gradient-to-br from-emerald-800 to-[#2d5a27] rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl">
                        <div className="absolute top-0 right-0 p-6 text-white/5 transition-colors">
                            <ShieldCheck size={120} />
                        </div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300">Kisan Subscription</span>
                                {isPlanActive && isKisanPro ? (
                                    <div className="flex items-center gap-1 text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30">
                                        <CheckCircle size={12} /> PRO ACTIVE
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1 text-[10px] font-black uppercase bg-stone-500/20 text-stone-300 px-3 py-1 rounded-full border border-stone-500/30">
                                        <AlertTriangle size={12} /> FREE TIER
                                    </div>
                                )}
                            </div>
                            <h3 className="text-3xl font-bold mb-2">
                                {isKisanPro ? 'Kisan Pro Member' : 'Standard Access'}
                            </h3>
                            {isPlanActive && user.subscriptionExpiry && (
                                <p className="text-xs text-white/50 font-bold uppercase tracking-widest mb-6">Valid until: {new Date(user.subscriptionExpiry).toLocaleDateString()}</p>
                            )}

                            {!isKisanPro && (
                                <div className="mt-8">
                                    <p className="text-emerald-100/80 text-sm font-medium mb-6 max-w-sm">Upgrade to Kisan Pro for priority marketplace listings, dedicated expert consulting, and advanced micro-climate alerts.</p>
                                    <Link to="/subscription?type=kisan" className="inline-flex py-3 px-6 bg-white text-[#2d5a27] hover:bg-emerald-50 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg">
                                        View Kisan Plans
                                    </Link>
                                </div>
                            )}

                            {isKisanPro && (
                                <div className="mt-8 bg-white/10 rounded-2xl p-6 border border-white/10 flex gap-4">
                                     <div className="w-10 h-10 shrink-0 bg-white/20 rounded-full flex items-center justify-center">
                                         <CheckCircle size={20} className="text-emerald-300" />
                                     </div>
                                     <div>
                                         <h4 className="font-bold text-lg text-white mb-1">Priority Support Enabled</h4>
                                         <p className="text-emerald-100/70 text-sm">Your queries will be fast-tracked to our agricultural scientists.</p>
                                     </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Access Links */}
                    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-stone-200">
                        <h3 className="text-lg font-bold text-stone-800 mb-6 flex items-center gap-2">
                            <Settings2 size={20} className="text-stone-400" /> Farm Management
                        </h3>
                        <div className="space-y-3">
                            <Link to="/kisan/my-listings" className="w-full p-5 bg-stone-50 hover:bg-[#2d5a27] hover:text-white group rounded-2xl transition-all flex items-center justify-between border border-stone-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-emerald-600 group-hover:text-[#2d5a27] shadow-sm">
                                        <Store size={22} />
                                    </div>
                                    <div className="text-left">
                                        <h4 className="font-bold text-stone-800 group-hover:text-white">Produce Listings</h4>
                                        <p className="text-xs text-stone-500 font-medium group-hover:text-emerald-100">Manage your active crop sale posts</p>
                                    </div>
                                </div>
                                <ChevronRight size={20} className="text-stone-300 group-hover:text-white" />
                            </Link>

                            <Link to="/kisan/equipment" className="w-full p-5 bg-stone-50 hover:bg-[#2d5a27] hover:text-white group rounded-2xl transition-all flex items-center justify-between border border-stone-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-amber-600 group-hover:text-[#2d5a27] shadow-sm">
                                        <Tractor size={22} />
                                    </div>
                                    <div className="text-left">
                                        <h4 className="font-bold text-stone-800 group-hover:text-white">Equipment Rentals</h4>
                                        <p className="text-xs text-stone-500 font-medium group-hover:text-emerald-100">Lease or rent tractors and implements</p>
                                    </div>
                                </div>
                                <ChevronRight size={20} className="text-stone-300 group-hover:text-white" />
                            </Link>

                            <Link to="/kisan/schemes" className="w-full p-5 bg-stone-50 hover:bg-[#2d5a27] hover:text-white group rounded-2xl transition-all flex items-center justify-between border border-stone-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-600 group-hover:text-[#2d5a27] shadow-sm">
                                        <FileText size={22} />
                                    </div>
                                    <div className="text-left">
                                        <h4 className="font-bold text-stone-800 group-hover:text-white">Govt. Schemes</h4>
                                        <p className="text-xs text-stone-500 font-medium group-hover:text-emerald-100">Check eligible subsidies and benefits</p>
                                    </div>
                                </div>
                                <ChevronRight size={20} className="text-stone-300 group-hover:text-white" />
                            </Link>
                        </div>
                    </div>

                    {/* Kisan Payments */}
                    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-stone-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2">
                                <CreditCard size={20} className="text-stone-400" /> Kisan Billing History
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-stone-100 text-[10px] uppercase tracking-widest font-black text-stone-400">
                                        <th className="pb-4">Date</th>
                                        <th className="pb-4">Plan Name</th>
                                        <th className="pb-4 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-50">
                                    {payments.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="py-8 text-center text-sm font-medium text-stone-500">
                                                No Kisan-specific transactions found.
                                            </td>
                                        </tr>
                                    ) : (
                                        payments.map((payment, idx) => (
                                            <tr key={idx} className="text-sm hover:bg-stone-50/50">
                                                <td className="py-4 text-stone-500 font-medium">{new Date(payment.date).toLocaleDateString()}</td>
                                                <td className="py-4 font-bold text-stone-800">{payment.planName}</td>
                                                <td className="py-4 text-right">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${payment.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-500'}`}>
                                                        {payment.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
