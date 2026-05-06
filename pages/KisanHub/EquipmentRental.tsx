import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Tractor, Search, MapPin, Star, Calendar, Trash2, EyeOff, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../src/firebase';
import { useAuth } from '../../src/authContext';

export const EquipmentRental: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const isAdmin = user && ['ADMIN', 'SUPER_ADMIN'].includes(user.role);

    useEffect(() => {
        fetchItems();
    }, [user]);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const q = query(
                collection(db, 'marketplace_items'), 
                where('category', '==', 'equipment')
            );
            const snapshot = await getDocs(q);
            const loadedItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
            
            loadedItems.sort((a: any, b: any) => {
                const dateA = a.createdAt?.seconds || 0;
                const dateB = b.createdAt?.seconds || 0;
                return dateB - dateA;
            });

            const filtered = loadedItems.filter((item: any) => {
                if (item.visibility === 'public') return true;
                if (isAdmin) return true;
                if (user && item.sellerId === user.id) return true;
                return false;
            });

            setItems(filtered);
        } catch(e) {
            console.error('Error fetching equipment items:', e);
        }
        setLoading(false);
    };

    const toggleVisibility = async (id: string, currentVis: string) => {
        try {
            const newVis = currentVis === 'public' ? 'hidden' : 'public';
            await updateDoc(doc(db, 'marketplace_items', id), { visibility: newVis });
            setItems(items.map(it => it.id === id ? { ...it, visibility: newVis } : it));
        } catch (e) {
            console.error('Error toggling visibility', e);
        }
    };

    const deleteItem = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this listing?")) return;
        try {
            await deleteDoc(doc(db, 'marketplace_items', id));
            setItems(items.filter(it => it.id !== id));
        } catch (e) {
            console.error('Error deleting item', e);
        }
    };

    return (
        <div className="p-6 md:p-12 font-sans relative min-h-screen pb-32">
            <div className="flex flex-col gap-2 mb-8">
                <h1 className="text-4xl font-black text-stone-800 tracking-tight">Equipment Rental</h1>
                <p className="text-stone-500 font-medium">Rent tractors, harvesters, and tools from farmers nearby.</p>
            </div>

            <div className="bg-white rounded-[2rem] p-4 flex items-center shadow-lg border border-stone-200 mb-8 max-w-2xl">
                <Search className="text-stone-400 mx-4" size={24} />
                <input 
                    type="text" 
                    placeholder="Search for tractors, rotavators, sprayers..." 
                    className="flex-1 bg-transparent border-none outline-none text-stone-800 font-medium placeholder:text-stone-400"
                />
                <button className="bg-[#2d5a27] text-white px-6 py-3 rounded-xl font-bold tracking-wide hover:bg-emerald-800 transition-colors">
                    Search
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2d5a27]"></div>
                </div>
            ) : items.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-stone-200">
                    <p className="text-stone-500 font-bold mb-4">No equipment listings found.</p>
                    <button onClick={() => navigate('/kisan/list-item')} className="text-[#2d5a27] font-bold hover:underline">List your equipment!</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item, i) => (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            key={item.id} 
                            className={`bg-white rounded-3xl p-6 border shadow-sm hover:shadow-xl hover:border-[#2d5a27]/30 transition-all group relative ${item.visibility === 'hidden' ? 'border-amber-300 opacity-75' : 'border-stone-200'}`}
                        >
                            {(isAdmin || (user && item.sellerId === user.id)) && (
                                <div className="absolute top-4 right-4 z-10 flex gap-2">
                                    <button onClick={() => toggleVisibility(item.id, item.visibility)} className="bg-white/90 p-2 rounded-full shadow hover:bg-stone-100 text-stone-600 transition-colors" title={item.visibility === 'public' ? 'Hide Listing' : 'Make Public'}>
                                        {item.visibility === 'public' ? <EyeOff size={16} /> : <Eye size={16} className="text-amber-500" />}
                                    </button>
                                    <button onClick={() => deleteItem(item.id)} className="bg-white/90 p-2 rounded-full shadow hover:bg-red-50 text-red-600 transition-colors" title="Delete Listing">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            )}

                            <div className="aspect-video bg-stone-100 rounded-2xl mb-4 overflow-hidden relative">
                                <img src={item.images?.[0] || 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=500&auto=format&fit=crop'} className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ${item.visibility === 'hidden' ? 'grayscale' : ''}`} alt="Equipment" />
                                {item.visibility === 'hidden' ? (
                                    <div className="absolute bottom-4 left-4 bg-amber-500 text-white px-3 py-1 rounded-full text-[10px] font-black shadow-sm uppercase">
                                        HIDDEN
                                    </div>
                                ) : (
                                    <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black text-amber-600 flex items-center gap-1 shadow-sm">
                                        <Star size={12} className="fill-amber-500" /> 4.8
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex-1 pr-2">
                                    <h3 className="font-bold text-lg text-stone-800 line-clamp-1">{item.title}</h3>
                                    <p className="text-stone-500 text-sm flex items-center gap-1 mt-1 truncate"><MapPin size={14} /> {item.location}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-xl text-[#2d5a27]">₹{item.amount}</p>
                                    <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider text-right">Per Hour</p>
                                </div>
                            </div>
                            
                            <p className="text-sm text-stone-600 mt-2 line-clamp-2">{item.description}</p>

                            <button className="w-full mt-4 py-3 rounded-xl border-2 border-stone-100 text-stone-700 font-bold flex items-center justify-center gap-2 hover:bg-[#2d5a27] hover:border-[#2d5a27] hover:text-white transition-all">
                                <Calendar size={18} /> Book Now
                            </button>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};
