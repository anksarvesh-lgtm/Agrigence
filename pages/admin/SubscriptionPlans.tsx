import React, { useState, useEffect } from 'react';
import { mockBackend } from '../../services/mockBackend';
import { SubscriptionPlan } from '../../types';
import { Edit, Save, DollarSign, Calendar, CheckCircle } from 'lucide-react';

const SubscriptionPlans: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<SubscriptionPlan>>({});

  useEffect(() => {
    setPlans(mockBackend.getPlans());
  }, []);

  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingId(plan.id);
    setEditForm(plan);
  };

  const handleSave = async () => {
    if (editForm.id && editForm.name && editForm.price) {
      await mockBackend.updatePlan(editForm as SubscriptionPlan);
      setPlans(mockBackend.getPlans());
      setEditingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Subscription Plans Manager</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {plans.map(plan => (
          <div key={plan.id} className="bg-admin-glass backdrop-blur-md border border-admin-border rounded-2xl p-6 relative">
            <div className="flex justify-between items-start mb-4">
               <div>
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <p className="text-admin-muted text-xs uppercase tracking-wider mt-1">{plan.type.replace('_', ' ')}</p>
               </div>
               <button 
                 onClick={() => handleEdit(plan)} 
                 className="p-2 bg-white/10 rounded-lg text-white hover:bg-white/20"
               >
                 <Edit size={16} />
               </button>
            </div>

            <div className="bg-white/5 rounded-xl p-4 mb-4">
               <div className="flex justify-between items-center mb-2">
                 <span className="text-admin-muted text-sm">Monthly Price</span>
                 <span className="text-2xl font-bold text-admin-leaf">₹{plan.price}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-admin-muted text-sm">Duration</span>
                 <span className="text-white">{plan.durationMonths} Month(s)</span>
               </div>
            </div>

            <p className="text-admin-muted text-sm mb-4 h-10">{plan.description}</p>
            
            <div className="space-y-2">
               {plan.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-stone-300">
                     <CheckCircle size={14} className="text-admin-leaf" /> {f}
                  </div>
               ))}
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal / Form */}
      {editingId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-[#1C2A22] border border-admin-border rounded-2xl w-full max-w-lg p-8 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-6">Edit Plan: {editForm.name}</h3>
              
              <div className="space-y-4">
                 <div>
                    <label className="text-xs text-admin-muted uppercase font-bold">Plan Name</label>
                    <input 
                      className="w-full bg-black/20 border border-admin-border rounded-lg p-3 text-white mt-1"
                      value={editForm.name}
                      onChange={e => setEditForm({...editForm, name: e.target.value})}
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-admin-muted uppercase font-bold">Price (₹)</label>
                        <input 
                            type="number"
                            className="w-full bg-black/20 border border-admin-border rounded-lg p-3 text-white mt-1"
                            value={editForm.price}
                            onChange={e => setEditForm({...editForm, price: parseInt(e.target.value)})}
                        />
                    </div>
                    <div>
                        <label className="text-xs text-admin-muted uppercase font-bold">Duration (Months)</label>
                        <input 
                            type="number"
                            className="w-full bg-black/20 border border-admin-border rounded-lg p-3 text-white mt-1"
                            value={editForm.durationMonths}
                            onChange={e => setEditForm({...editForm, durationMonths: parseInt(e.target.value)})}
                        />
                    </div>
                 </div>
                 <div>
                    <label className="text-xs text-admin-muted uppercase font-bold">Description</label>
                    <textarea 
                      className="w-full bg-black/20 border border-admin-border rounded-lg p-3 text-white mt-1"
                      value={editForm.description}
                      onChange={e => setEditForm({...editForm, description: e.target.value})}
                    />
                 </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                 <button onClick={() => setEditingId(null)} className="px-4 py-2 text-admin-muted hover:text-white">Cancel</button>
                 <button onClick={handleSave} className="bg-admin-leaf text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2">
                    <Save size={16} /> Save Changes
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPlans;
