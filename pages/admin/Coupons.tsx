
import React, { useState, useEffect } from 'react';
import { mockBackend } from '../../services/mockBackend';
import { Coupon } from '../../types';
import { Plus, Trash2, Tag, Save, X, Calendar, Percent, DollarSign } from 'lucide-react';

const Coupons: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCoupon, setNewCoupon] = useState<Partial<Coupon>>({
    code: '',
    discountType: 'PERCENT',
    value: 0,
    isActive: true,
    expiryDate: ''
  });

  useEffect(() => {
    setCoupons(mockBackend.getCoupons());
  }, []);

  const handleSave = async () => {
    if (!newCoupon.code || !newCoupon.value) return alert("Code and Value are required");
    await mockBackend.addCoupon(newCoupon);
    setCoupons(mockBackend.getCoupons());
    setIsModalOpen(false);
    setNewCoupon({ code: '', discountType: 'PERCENT', value: 0, isActive: true, expiryDate: '' });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this coupon?')) {
      await mockBackend.deleteCoupon(id);
      setCoupons(mockBackend.getCoupons());
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Promotional Coupons</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-agri-secondary text-agri-primary px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-xl shadow-agri-secondary/10 text-xs"
        >
          <Plus size={18} /> CREATE COUPON
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map(coupon => (
          <div key={coupon.id} className="bg-white/5 border border-white/5 rounded-3xl p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <Tag size={64} className="rotate-12" />
            </div>
            
            <div className="relative z-10">
               <div className="flex justify-between items-start mb-6">
                  <div>
                     <h3 className="text-3xl font-mono font-black text-white tracking-widest">{coupon.code}</h3>
                     <p className="text-[10px] uppercase font-bold text-agri-secondary mt-1">{coupon.isActive ? 'Active Protocol' : 'Disabled'}</p>
                  </div>
                  <button onClick={() => handleDelete(coupon.id)} className="text-white/20 hover:text-red-400 transition-colors">
                     <Trash2 size={18} />
                  </button>
               </div>

               <div className="flex gap-4 mb-8">
                  <div className="bg-agri-secondary/10 border border-agri-secondary/20 px-4 py-2 rounded-xl">
                     <span className="text-agri-secondary font-black text-xl">
                        {coupon.discountType === 'PERCENT' ? `${coupon.value}%` : `₹${coupon.value}`}
                     </span>
                     <span className="text-[9px] uppercase font-bold text-white/30 ml-2">Discount</span>
                  </div>
                  <div className="bg-white/5 px-4 py-2 rounded-xl flex items-center">
                     <span className="text-white font-bold text-sm">{coupon.usageCount} Uses</span>
                  </div>
               </div>

               <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                  <Calendar size={14} /> Exp: {coupon.expiryDate || 'N/A'}
               </div>
            </div>
          </div>
        ))}
        {coupons.length === 0 && <div className="col-span-full py-20 text-center text-white/10 italic">No promotional coupons configured.</div>}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
           <div className="bg-[#1C2A22] w-full max-w-lg rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-white/5 flex justify-between items-center bg-black/20">
                 <h3 className="text-2xl font-serif font-bold text-white">New Coupon Protocol</h3>
                 <button onClick={() => setIsModalOpen(false)}><X className="text-white/40 hover:text-white" /></button>
              </div>
              <div className="p-8 space-y-6">
                 <div>
                    <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block tracking-widest">Coupon Code</label>
                    <input className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-agri-secondary font-mono uppercase" placeholder="e.g. AGRI50" value={newCoupon.code} onChange={e => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})} />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-6">
                    <div>
                       <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block tracking-widest">Discount Type</label>
                       <select className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-agri-secondary" value={newCoupon.discountType} onChange={e => setNewCoupon({...newCoupon, discountType: e.target.value as any})}>
                          <option value="PERCENT" className="bg-agri-primary">Percentage (%)</option>
                          <option value="FLAT" className="bg-agri-primary">Flat Amount (₹)</option>
                       </select>
                    </div>
                    <div>
                       <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block tracking-widest">Value</label>
                       <input type="number" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-agri-secondary" value={newCoupon.value} onChange={e => setNewCoupon({...newCoupon, value: parseInt(e.target.value)})} />
                    </div>
                 </div>

                 <div>
                    <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block tracking-widest">Expiry Date</label>
                    <input type="date" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-agri-secondary" value={newCoupon.expiryDate} onChange={e => setNewCoupon({...newCoupon, expiryDate: e.target.value})} />
                 </div>
              </div>
              <div className="p-8 border-t border-white/5 flex justify-end gap-4 bg-black/10">
                 <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-white/40 hover:text-white font-bold text-xs uppercase tracking-widest">Cancel</button>
                 <button onClick={handleSave} className="bg-agri-secondary text-agri-primary px-10 py-3 rounded-xl font-bold flex items-center gap-2 shadow-xl shadow-agri-secondary/10">
                    <Tag size={18} /> INITIALIZE COUPON
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Coupons;
