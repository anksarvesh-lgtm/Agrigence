
import React, { useState, useEffect } from 'react';
import { mockBackend } from '../../services/mockBackend';
import { Coupon } from '../../types';
import { Plus, Trash2, Tag, Save, X, Calendar } from 'lucide-react';
import { useConfirm } from '../../components/ContextualConfirm';

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
  const { confirm } = useConfirm();

  useEffect(() => {
    const load = async () => {
        setCoupons(await mockBackend.getCoupons());
    };
    load();
  }, []);

  const handleSave = async () => {
    if (!newCoupon.code || !newCoupon.value) return alert("Code and Value are required");
    await mockBackend.addCoupon(newCoupon);
    setCoupons(await mockBackend.getCoupons());
    setIsModalOpen(false);
    setNewCoupon({ code: '', discountType: 'PERCENT', value: 0, isActive: true, expiryDate: '' });
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    const isConfirmed = await confirm({
        message: 'Delete this coupon?',
        type: 'danger',
        trigger: e.currentTarget
    });

    if(isConfirmed) {
      await mockBackend.deleteCoupon(id);
      setCoupons(await mockBackend.getCoupons());
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-black">Promotional Coupons</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-stone-200 text-black border border-stone-300 px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-stone-200/20 text-xs hover:bg-stone-300 transition-colors w-full md:w-auto"
        >
          <Plus size={18} /> CREATE COUPON
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map(coupon => (
          <div key={coupon.id} className="bg-white border border-stone-200 rounded-3xl p-8 relative overflow-hidden group shadow-sm hover:shadow-md transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <Tag size={64} className="rotate-12 text-black" />
            </div>
            
            <div className="relative z-10">
               <div className="flex justify-between items-start mb-6">
                  <div>
                     <h3 className="text-3xl font-mono font-black text-black tracking-widest">{coupon.code}</h3>
                     <p className="text-[10px] uppercase font-bold text-black mt-1">{coupon.isActive ? 'Active Protocol' : 'Disabled'}</p>
                  </div>
                  <button onClick={(e) => handleDelete(coupon.id, e)} className="text-black hover:text-red-500 transition-colors">
                     <Trash2 size={18} />
                  </button>
               </div>

               <div className="flex gap-4 mb-8">
                  <div className="bg-stone-100 border border-stone-200 px-4 py-2 rounded-xl">
                     <span className="text-black font-black text-xl">
                        {coupon.discountType === 'PERCENT' ? `${coupon.value}%` : `₹${coupon.value}`}
                     </span>
                     <span className="text-[9px] uppercase font-bold text-black ml-2">Discount</span>
                  </div>
                  <div className="bg-stone-50 px-4 py-2 rounded-xl flex items-center border border-stone-100">
                     <span className="text-black font-bold text-sm">{coupon.usageCount} Uses</span>
                  </div>
               </div>

               <div className="flex items-center gap-2 text-[10px] font-bold text-black uppercase tracking-widest">
                  <Calendar size={14} /> Exp: {coupon.expiryDate || 'N/A'}
               </div>
            </div>
          </div>
        ))}
        {coupons.length === 0 && <div className="col-span-full py-20 text-center text-black italic">No promotional coupons configured.</div>}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
           <div className="bg-white w-full max-w-lg rounded-3xl border border-stone-200 shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-stone-200 flex justify-between items-center bg-stone-50">
                 <h3 className="text-2xl font-serif font-bold text-black">New Coupon Protocol</h3>
                 <button onClick={() => setIsModalOpen(false)}><X className="text-stone-400 hover:text-black" /></button>
              </div>
              <div className="p-8 space-y-6">
                 <div>
                    <label className="text-[10px] uppercase font-bold text-stone-500 mb-2 block tracking-widest">Coupon Code</label>
                    <input className="w-full bg-white border border-stone-300 rounded-xl p-4 text-black outline-none focus:border-agri-secondary" placeholder="e.g. SUMMER2025" value={newCoupon.code || ''} onChange={e => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})} />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-6">
                    <div>
                       <label className="text-[10px] uppercase font-bold text-stone-500 mb-2 block tracking-widest">Discount Type</label>
                       <select className="w-full bg-white border border-stone-300 rounded-xl p-4 text-black outline-none focus:border-agri-secondary appearance-none" value={newCoupon.discountType} onChange={e => setNewCoupon({...newCoupon, discountType: e.target.value as any})}>
                          <option value="PERCENT">Percentage (%)</option>
                          <option value="FLAT">Flat Amount (₹)</option>
                       </select>
                    </div>
                    <div>
                       <label className="text-[10px] uppercase font-bold text-stone-500 mb-2 block tracking-widest">Value</label>
                       <input type="number" className="w-full bg-white border border-stone-300 rounded-xl p-4 text-black outline-none focus:border-agri-secondary" placeholder="20" value={newCoupon.value || ''} onChange={e => setNewCoupon({...newCoupon, value: parseInt(e.target.value)})} />
                    </div>
                 </div>

                 <div>
                    <label className="text-[10px] uppercase font-bold text-stone-500 mb-2 block tracking-widest">Expiry Date</label>
                    <input type="date" className="w-full bg-white border border-stone-300 rounded-xl p-4 text-black outline-none focus:border-agri-secondary" value={newCoupon.expiryDate || ''} onChange={e => setNewCoupon({...newCoupon, expiryDate: e.target.value})} />
                 </div>
              </div>
              <div className="p-8 border-t border-stone-200 flex justify-end gap-4 bg-stone-50">
                 <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-stone-500 hover:text-black font-bold text-xs uppercase tracking-widest">Cancel</button>
                 <button onClick={handleSave} className="bg-agri-secondary text-white px-10 py-3 rounded-xl font-bold flex items-center gap-2 shadow-xl hover:bg-agri-primary transition-colors">
                    <Save size={18} /> ACTIVATE COUPON
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Coupons;
