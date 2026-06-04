import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, MapPin, IndianRupee, Upload, ChevronDown, 
  Tractor, Sprout, Map, CheckCircle, FileText, Camera, Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../src/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../src/authContext';

export const ListYourItem: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [category, setCategory] = useState('equipment');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [condition, setCondition] = useState('');
    const [amount, setAmount] = useState('');
    const [location, setLocation] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const categories = [
        { id: 'equipment', icon: Tractor, label: 'Equipment', desc: 'Tractors, tools, etc.' },
        { id: 'produce', icon: Sprout, label: 'Produce', desc: 'Grains, veggies, fruits' },
        { id: 'land', icon: Map, label: 'Land', desc: 'Buy or lease farmland' },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            alert('Please login first to post an ad.');
            return;
        }

        if (!title || !description || !amount || !location) {
            alert('Please fill out all required fields.');
            return;
        }

        setIsSubmitting(true);
        try {
            await addDoc(collection(db, 'marketplace_items'), {
                category,
                title,
                description,
                condition,
                amount: Number(amount) || 0,
                location,
                sellerId: user.id || 'anonymous',
                sellerName: user.name || 'Unknown Seller',
                visibility: 'public', // public or hidden
                status: 'active',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                // In a real app we'd upload images and store their URLs
                images: ['https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=600&auto=format&fit=crop']
            });
            alert('Listing created successfully!');
            navigate('/kisan/marketplace'); // Route based on category maybe
        } catch (error) {
            console.error('Error adding listing: ', error);
            alert('Failed to publish listing.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-full p-6 md:p-12 bg-stone-50 font-sans pb-32">
            <header className="max-w-4xl mx-auto mb-10">
                <button 
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 text-stone-500 font-bold text-sm uppercase tracking-widest hover:text-[#2d5a27] transition-colors mb-4"
                >
                   ← Back
                </button>
                <h1 className="text-4xl md:text-5xl font-black text-stone-900 tracking-tight mb-2">List Your Item</h1>
                <p className="text-stone-500 text-lg font-medium">Provide clear details to reach verified buyers and renters.</p>
            </header>

            <form className="max-w-4xl mx-auto space-y-8" onSubmit={handleSubmit}>
                {/* Step 1: Category */}
                <section className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm relative overflow-hidden">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-[#2d5a27]">
                            <CheckCircle size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-stone-800 tracking-tight">1. Select Category</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {categories.map((cat) => (
                            <label key={cat.id} className="cursor-pointer group relative">
                                <input 
                                    type="radio" 
                                    name="category" 
                                    value={cat.id} 
                                    checked={category === cat.id}
                                    onChange={() => setCategory(cat.id)}
                                    className="peer sr-only" 
                                />
                                <div className="h-full border-2 border-stone-100 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 peer-checked:border-[#2d5a27] peer-checked:bg-emerald-50/50 transition-all hover:bg-stone-50 group-hover:border-stone-200">
                                    <cat.icon size={32} className={`transition-transform group-hover:scale-110 ${category === cat.id ? 'text-[#2d5a27]' : 'text-stone-400'}`} />
                                    <div className="text-center">
                                        <p className="font-black text-sm uppercase tracking-wider text-stone-800">{cat.label}</p>
                                        <p className="text-[10px] text-stone-400 font-medium">{cat.desc}</p>
                                    </div>
                                    {category === cat.id && (
                                        <div className="absolute top-3 right-3 text-[#2d5a27]">
                                            <CheckCircle size={16} fill="currentColor" className="text-white" />
                                        </div>
                                    )}
                                </div>
                            </label>
                        ))}
                    </div>
                </section>

                {/* Step 2: Item Details */}
                <section className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-600">
                             <FileText size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-stone-800 tracking-tight">2. Item Details</h2>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                             <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Listing Title</label>
                             <input 
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., John Deere 5050D Tractor"
                                className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 text-stone-800 font-bold placeholder:text-stone-300 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                required
                             />
                        </div>

                        <div className="space-y-2">
                             <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Detailed Description</label>
                             <textarea 
                                rows={4}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe specifications, history, and usage conditions..."
                                className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 text-stone-800 font-bold placeholder:text-stone-300 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none"
                                required
                             />
                        </div>

                        <div className="space-y-2">
                             <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Current Condition</label>
                             <div className="relative">
                                <select 
                                    value={condition}
                                    onChange={(e) => setCondition(e.target.value)}
                                    className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 text-stone-800 font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none appearance-none cursor-pointer"
                                    required
                                >
                                    <option value="">Select condition...</option>
                                    <option value="new">Brand New</option>
                                    <option value="excellent">Used - Excellent</option>
                                    <option value="good">Used - Good</option>
                                    <option value="fair">Used - Fair</option>
                                </select>
                                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-stone-300 pointer-events-none" size={20} />
                             </div>
                        </div>
                    </div>
                </section>

                {/* Step 3: Pricing & Location */}
                <section className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                             <IndianRupee size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-stone-800 tracking-tight">3. Pricing & Location</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest block ml-1">Amount (₹)</label>
                            <div className="relative">
                                <IndianRupee className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-300" size={20} />
                                <input 
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full bg-stone-50 border border-stone-100 rounded-2xl pl-14 pr-6 py-4 text-stone-800 font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest block ml-1">Item Location</label>
                            <div className="relative">
                                <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-300" size={20} />
                                <input 
                                    type="text" 
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="Village, District, or Pincode"
                                    className="w-full bg-stone-50 border border-stone-100 rounded-2xl pl-14 pr-6 py-4 text-stone-800 font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Step 4: Photos */}
                <section className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm relative overflow-hidden">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                             <Camera size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-stone-800 tracking-tight">4. Technical Photos</h2>
                    </div>

                    <div className="border-2 border-dashed border-stone-200 rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center bg-stone-50/50 hover:bg-stone-50 hover:border-blue-300 transition-all cursor-pointer group">
                        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-blue-600 shadow-lg group-hover:scale-110 transition-transform mb-6">
                            <Upload size={32} />
                        </div>
                        <h4 className="text-lg font-bold text-stone-800 mb-1">Click to upload or drag and drop</h4>
                        <p className="text-stone-400 text-sm font-medium">Add at least 3 photos from different angles for better trust.</p>
                    </div>
                </section>

                {/* Submit Actions */}
                <div className="pt-10 flex flex-col sm:flex-row justify-end gap-4 border-t border-stone-100">
                    <button 
                        type="button"
                        onClick={() => navigate(-1)}
                        className="px-10 py-4 rounded-2xl border-2 border-stone-200 text-stone-600 font-bold hover:bg-stone-100 transition-all flex items-center justify-center gap-2"
                    >
                        <Trash2 size={18} /> Discard
                    </button>
                    <button 
                        type="submit"
                        disabled={isSubmitting}
                        className={`group px-12 py-4 rounded-2xl text-white font-bold shadow-xl flex items-center justify-center gap-3 transition-all ${isSubmitting ? 'bg-stone-400 cursor-not-allowed' : 'bg-[#2d5a27] shadow-emerald-900/20 hover:bg-emerald-800'}`}
                    >
                        {isSubmitting ? 'Publishing...' : 'Publish Listing'}
                    </button>
                </div>
            </form>
        </div>
    );
};
