import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  MessageSquare, 
  CheckCircle, 
  Trash2, 
  EyeOff,
  Eye,
  TrendingUp,
  Package
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../src/firebase';
import { useAuth } from '../../App';

export const MyListings: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const isAdmin = user && ['ADMIN', 'SUPER_ADMIN'].includes(user.role);

    useEffect(() => {
        if (!user) return;
        fetchListings();
    }, [user]);

    const fetchListings = async () => {
        setLoading(true);
        try {
            let q;
            if (isAdmin) {
                // Admin sees all listings
                q = query(collection(db, 'marketplace_items'));
            } else {
                // User sees only their listings
                q = query(
                    collection(db, 'marketplace_items'), 
                    where('sellerId', '==', user?.id)
                );
            }
            
            const snapshot = await getDocs(q);
            const loadedItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
            
            loadedItems.sort((a: any, b: any) => {
                const dateA = a.createdAt?.seconds || 0;
                const dateB = b.createdAt?.seconds || 0;
                return dateB - dateA;
            });

            setListings(loadedItems);
        } catch(e) {
            console.error('Error fetching listings:', e);
        }
        setLoading(false);
    };

    const toggleVisibility = async (id: string, currentVis: string) => {
        try {
            const newVis = currentVis === 'public' ? 'hidden' : 'public';
            await updateDoc(doc(db, 'marketplace_items', id), { visibility: newVis });
            setListings(listings.map(it => it.id === id ? { ...it, visibility: newVis } : it));
        } catch (e) {
            console.error('Error toggling visibility', e);
        }
    };

    const deleteListing = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this listing?")) return;
        try {
            await deleteDoc(doc(db, 'marketplace_items', id));
            setListings(listings.filter(it => it.id !== id));
        } catch (e) {
            console.error('Error deleting listing', e);
        }
    };

    return (
        <div className="min-h-full p-6 md:p-12 bg-stone-50 font-sans pb-32">
            <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                <div className="space-y-2">
                    <button 
                      onClick={() => navigate('/kisan/dashboard')}
                      className="flex items-center gap-2 text-stone-500 font-bold text-[10px] uppercase tracking-[0.2em] hover:text-[#2d5a27] transition-colors mb-4"
                    >
                       ← Dashboard
                    </button>
                    <h1 className="text-4xl md:text-5xl font-black text-stone-900 tracking-tight">
                        {isAdmin ? 'All Listings (Admin)' : 'My Listings'}
                    </h1>
                    <p className="text-stone-500 text-lg font-medium">Manage your active posts, rentals, and land leases.</p>
                </div>
                <button onClick={() => navigate('/kisan/list-item')} className="bg-[#2d5a27] text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-xl shadow-emerald-900/20 hover:bg-emerald-800 hover:-translate-y-1 transition-all">
                    <Plus size={22} className="stroke-[3]" /> Create New Listing
                </button>
            </header>

            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <TrendingUp size={32} />
                    </div>
                    <div>
                        <p className="text-sm font-black text-stone-400 uppercase tracking-widest mb-1">Total Active</p>
                        <p className="text-3xl font-black text-stone-800">{listings.filter(l => l.visibility !== 'hidden').length}</p>
                    </div>
                </div>
                <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <MessageSquare size={32} />
                    </div>
                    <div>
                        <p className="text-sm font-black text-stone-400 uppercase tracking-widest mb-1">Inquiries</p>
                        <p className="text-3xl font-black text-stone-800">0</p>
                    </div>
                </div>
                <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                        <Package size={32} />
                    </div>
                    <div>
                        <p className="text-sm font-black text-stone-400 uppercase tracking-widest mb-1">Hidden/Inactive</p>
                        <p className="text-3xl font-black text-stone-800">{listings.filter(l => l.visibility === 'hidden').length}</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto flex flex-col gap-6">
                {loading ? (
                    <div className="text-center py-20 text-stone-500 font-bold">Loading listings...</div>
                ) : listings.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-stone-200 shadow-sm">
                        <p className="text-stone-500 font-bold mb-4">No listings found.</p>
                        <button onClick={() => navigate('/kisan/list-item')} className="text-[#2d5a27] font-bold hover:underline">Create your first listing!</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {listings.map((item, i) => (
                            <motion.div 
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                key={item.id} 
                                className={`group bg-white rounded-[3rem] p-6 border border-stone-100 shadow-sm hover:shadow-2xl transition-all relative overflow-hidden flex flex-col ${item.visibility === 'hidden' ? 'opacity-70 grayscale border-amber-300' : ''}`}
                            >
                                <div className="aspect-[4/3] rounded-[2rem] overflow-hidden mb-6 relative">
                                    <img src={item.images?.[0] || 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=500&auto=format&fit=crop'} className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110`} alt={item.title} />
                                    <div className="absolute top-4 left-4 flex gap-2">
                                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg ${
                                            item.visibility === 'public' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                                        }`}>
                                            {item.visibility === 'public' ? 'ACTIVE' : 'HIDDEN'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex-1 space-y-4 flex flex-col">
                                    <div>
                                        <p className="text-xs font-black text-stone-400 tracking-widest uppercase mb-1">{item.category}</p>
                                        <h3 className="text-xl font-bold text-stone-800 mb-1 tracking-tight line-clamp-1">{item.title}</h3>
                                        <div className="flex items-center justify-between mt-2">
                                            <p className="text-2xl font-black text-[#2d5a27]">₹{item.amount}</p>
                                            <p className="text-[10px] font-black text-stone-300 uppercase tracking-widest">
                                                {item.createdAt ? new Date(item.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-2 flex gap-2 mt-auto">
                                        <button onClick={() => toggleVisibility(item.id, item.visibility)} className="flex-1 bg-stone-50 text-stone-600 font-bold py-4 rounded-2xl hover:bg-stone-100 transition-colors flex items-center justify-center gap-2">
                                            {item.visibility === 'public' ? <><EyeOff size={16} /> Hide</> : <><Eye size={16}/> Show</>}
                                        </button>
                                        <button onClick={() => deleteListing(item.id)} className="p-4 bg-red-50 text-red-500 hover:bg-red-100 rounded-2xl flex items-center justify-center transition-colors">
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
