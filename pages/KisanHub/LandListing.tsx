import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Map, Droplet, Sun, Wind, ArrowRight, Trash2, EyeOff, Eye, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../src/firebase';
import { useAuth } from '../../src/authContext';

export const LandListing: React.FC = () => {
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
                where('category', '==', 'land')
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
            console.error('Error fetching land items:', e);
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
            <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-black text-stone-800 tracking-tight">Land Leasing</h1>
                    <p className="text-stone-500 font-medium">Verified farmland for long-term lease or purchase.</p>
                </div>
                <button onClick={() => navigate('/kisan/list-item')} className="bg-[#2d5a27] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:bg-emerald-800 transition-colors">
                    <Plus size={20} /> List Land
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2d5a27]"></div>
                </div>
            ) : items.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-stone-200">
                    <p className="text-stone-500 font-bold mb-4">No land listings found.</p>
                    <button onClick={() => navigate('/kisan/list-item')} className="text-[#2d5a27] font-bold hover:underline">List your land!</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item, i) => (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            key={item.id} 
                            className={`bg-white rounded-[2rem] overflow-hidden border shadow-sm hover:shadow-xl transition-all relative ${item.visibility === 'hidden' ? 'border-amber-300 opacity-75' : 'border-stone-200'}`}
                        >
                            {(isAdmin || (user && item.sellerId === user.id)) && (
                                <div className="absolute top-4 left-4 z-10 flex gap-2">
                                    <button onClick={() => toggleVisibility(item.id, item.visibility)} className="bg-white/90 p-2 rounded-full shadow hover:bg-stone-100 text-stone-600 transition-colors" title={item.visibility === 'public' ? 'Hide Listing' : 'Make Public'}>
                                        {item.visibility === 'public' ? <EyeOff size={16} /> : <Eye size={16} className="text-amber-500" />}
                                    </button>
                                    <button onClick={() => deleteItem(item.id)} className="bg-white/90 p-2 rounded-full shadow hover:bg-red-50 text-red-600 transition-colors" title="Delete Listing">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            )}

                            <div className="h-48 bg-stone-100 relative">
                                <img src={item.images?.[0] || `https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000&auto=format&fit=crop`} className={`w-full h-full object-cover ${item.visibility === 'hidden' ? 'grayscale' : ''}`} alt="Farmland" />
                                {item.visibility === 'hidden' ? (
                                    <div className="absolute top-4 right-4 bg-amber-500 text-white px-2 py-1 rounded text-[10px] font-black uppercase">
                                        HIDDEN
                                    </div>
                                ) : (
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl font-black text-stone-800 shadow-sm">
                                        {item.location}
                                    </div>
                                )}
                            </div>
                            
                            <div className="p-6">
                                <h3 className="font-bold text-xl text-stone-800 mb-2 truncate">{item.title}</h3>
                                <p className="text-stone-500 text-sm mb-6 line-clamp-2">{item.description}</p>
                                
                                <div className="grid grid-cols-3 gap-2 mb-6">
                                    <div className="bg-stone-50 p-2 rounded-lg text-center border border-stone-100">
                                        <Droplet size={16} className="text-blue-500 mx-auto mb-1" />
                                        <p className="text-[10px] font-black text-stone-500 uppercase tracking-wider">Water</p>
                                        <p className="text-xs font-bold text-stone-800 truncate" title={item.condition || 'N/A'}>{item.condition || 'N/A'}</p>
                                    </div>
                                    <div className="bg-stone-50 p-2 rounded-lg text-center border border-stone-100">
                                        <Map size={16} className="text-amber-600 mx-auto mb-1" />
                                        <p className="text-[10px] font-black text-stone-500 uppercase tracking-wider">Type</p>
                                        <p className="text-xs font-bold text-stone-800 truncate">Land</p>
                                    </div>
                                    <div className="bg-stone-50 p-2 rounded-lg text-center border border-stone-100">
                                        <Sun size={16} className="text-orange-500 mx-auto mb-1" />
                                        <p className="text-[10px] font-black text-stone-500 uppercase tracking-wider">Solar</p>
                                        <p className="text-xs font-bold text-stone-800 truncate">Varies</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                                    <div>
                                        <p className="font-black text-xl text-[#2d5a27]">₹{item.amount}</p>
                                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Estimated</p>
                                    </div>
                                    <button className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center hover:bg-[#2d5a27] hover:text-white transition-colors">
                                        <ArrowRight size={20} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};
