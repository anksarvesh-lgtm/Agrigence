import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Store, Tag, Plus, MessageCircle, Trash2, EyeOff, Eye, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, updateDoc, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '../../src/firebase';
import { useAuth } from '../../App';

export const FarmerMarketplace: React.FC = () => {
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
                where('category', '==', 'produce')
            );
            const snapshot = await getDocs(q);
            const loadedItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
            
            // Sort client side because compound query with orderBy requires compound index
            loadedItems.sort((a: any, b: any) => {
                const dateA = a.createdAt?.seconds || 0;
                const dateB = b.createdAt?.seconds || 0;
                return dateB - dateA;
            });

            // Filter out hidden items if not admin and not owner
            const filtered = loadedItems.filter((item: any) => {
                if (item.visibility === 'public') return true;
                if (isAdmin) return true;
                if (user && item.sellerId === user.id) return true;
                return false;
            });

            setItems(filtered);
        } catch(e) {
            console.error('Error fetching marketplace items:', e);
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
                    <h1 className="text-4xl font-black text-stone-800 tracking-tight">Produce Marketplace</h1>
                    <p className="text-stone-500 font-medium">B2B/B2C trading hub for buying and selling farm produce directly.</p>
                </div>
                <button onClick={() => navigate('/kisan/list-item')} className="bg-[#2d5a27] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:bg-emerald-800 transition-colors">
                    <Plus size={20} /> Create Listing
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2d5a27]"></div>
                </div>
            ) : items.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-stone-200">
                    <p className="text-stone-500 font-bold mb-4">No produce listings found.</p>
                    <button onClick={() => navigate('/kisan/list-item')} className="text-[#2d5a27] font-bold hover:underline">Be the first to list something!</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item, i) => (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            key={item.id} 
                            className={`bg-white rounded-3xl p-6 border shadow-sm hover:shadow-xl transition-all relative ${item.visibility === 'hidden' ? 'border-amber-300 opacity-75' : 'border-stone-200'}`}
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

                            <div className="aspect-square bg-stone-100 rounded-2xl mb-4 overflow-hidden relative">
                                <img src={item.images?.[0] || `https://images.unsplash.com/photo-1574323347407-15e1d4dec70b?q=80&w=500&auto=format&fit=crop`} className={`w-full h-full object-cover ${item.visibility === 'hidden' ? 'grayscale' : ''}`} alt="Produce" />
                                {item.condition && (
                                    <div className="absolute top-4 left-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-black shadow-sm uppercase">
                                        {item.condition}
                                    </div>
                                )}
                                {item.visibility === 'hidden' && (
                                    <div className="absolute bottom-4 left-4 bg-amber-500 text-white px-3 py-1 rounded-full text-[10px] font-black shadow-sm uppercase">
                                        HIDDEN
                                    </div>
                                )}
                            </div>
                            
                            <div className="mb-4 flex-1">
                                <h3 className="font-bold text-xl text-stone-800 line-clamp-1">{item.title}</h3>
                                <p className="text-stone-500 font-medium text-sm line-clamp-2 mt-1">{item.description}</p>
                            </div>
                            
                            <div className="flex items-center justify-between mb-6 pb-6 border-b border-stone-100 mt-auto">
                                <div>
                                    <p className="text-[10px] text-stone-400 font-black uppercase tracking-wider mb-1">Asking Price</p>
                                    <p className="font-bold text-2xl text-stone-800">₹{item.amount}</p>
                                </div>
                                <div className="text-right max-w-[50%]">
                                    <p className="text-[10px] text-stone-400 font-black uppercase tracking-wider mb-1">Seller</p>
                                    <p className="font-bold text-stone-700 text-sm truncate">{item.sellerName}</p>
                                    <p className="text-xs text-stone-400 truncate flex items-center justify-end"><MapPin size={10} className="mr-1 inline" /> {item.location}</p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button className="flex-1 bg-stone-100 text-stone-700 py-3 rounded-xl font-bold hover:bg-stone-200 transition-colors">
                                    View Details
                                </button>
                                <button className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors">
                                    <MessageCircle size={20} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};
