
import React, { useState, useEffect } from 'react';
import { mockBackend } from '../../services/mockBackend';
import { SubscriptionPlan } from '../../types';
import { Edit, Save, Plus, CheckCircle, Trash2, X } from 'lucide-react';

const SubscriptionPlans: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<SubscriptionPlan>>({});

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setPlans(await mockBackend.getPlans());
  };

  const handleCreate = () => {
    setEditForm({ 
        features: ['Priority Review', 'Email Support'], 
        type: 'ARTICLE_ACCESS', 
        isActive: true,
        durationMonths: 1,
        articleLimit: 1,
        blogLimit: 0
    });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingId(plan.id);
    setEditForm(plan);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if(confirm("Are you sure you want to delete this subscription plan?")) {
        await mockBackend.deletePlan(id);
        loadPlans();
    }
  };

  const handleSave = async () => {
    if (!editForm.name || !editForm.price) return alert("Name and Price are required");
    
    if (editingId) {
      await mockBackend.updatePlan(editForm as SubscriptionPlan);
    } else {
      await mockBackend.addPlan(editForm);
    }
    loadPlans();
    setIsModalOpen(false);
    setEditingId(null);
  };

  const updateFeatures = (text: string) => {
      setEditForm({...editForm, features: text.split(',').map(f => f.trim())});
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Subscription Plans Manager</h1>
        <button 
          onClick={handleCreate}
          className="bg-agri-secondary text-agri-primary px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-xl shadow-agri-secondary/10 text-xs uppercase tracking-widest hover:scale-105 transition-transform"
        >
          <Plus size={16} /> Create New Plan
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {plans.map(plan => (
          <div key={plan.id} className="bg-admin-glass backdrop-blur-md border border-admin-border rounded-2xl p-6 relative group hover:border-agri-secondary transition-colors">
            <div className="flex justify-between items-start mb-4">
               <div>
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <p className="text-admin-muted text-xs uppercase tracking-wider mt-1">{plan.type.replace('_', ' ')}</p>
               </div>
               <div className="flex gap-2">
                 <button 
                   onClick={() => handleEdit(plan)} 
                   className="p-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
                 >
                   <Edit size={16} />
                 </button>
                 <button 
                   onClick={() => handleDelete(plan.id)} 
                   className="p-2 bg-white/10 rounded-lg text-white hover:bg-red-500/20 hover:text-red-400 transition-colors"
                 >
                   <Trash2 size={16} />
                 </button>
               </div>
            </div>

            <div className="bg-white/5 rounded-xl p-4 mb-4 border border-white/5">
               <div className="flex justify-between items-center mb-2">
                 <span className="text-admin-muted text-sm">Monthly Price</span>
                 <span className="text-2xl font-bold text-admin-leaf">₹{plan.price}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-admin-muted text-sm">Duration</span>
                 <span className="text-white">{plan.durationMonths} Month(s)</span>
               </div>
            </div>

            <p className="text-admin-muted text-sm mb-4 h-10 line-clamp-2">{plan.description}</p>
            
            <div className="space-y-2">
               {plan.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-stone-300">
                     <CheckCircle size={14} className="text-admin-leaf" /> {f}
                  </div>
               ))}
            </div>
          </div>
        ))}
        {plans.length === 0 && (
            <div className="col-span-full py-20 text-center text-white/20 italic border-2 border-dashed border-white/10 rounded-3xl">
                No active subscription plans. Create one to get started.
            </div>
        )}
      </div>

      {/* Edit/Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-[#1C2A22] border border-admin-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-admin-border flex justify-between items-center bg-black/20">
                 <h3 className="text-xl font-bold text-white">{editingId ? 'Edit Plan' : 'Create New Plan'}</h3>
                 <button onClick={() => setIsModalOpen(false)}><X className="text-white/40 hover:text-white" /></button>
              </div>
              
              <div className="p-8 space-y-4 overflow-y-auto custom-scrollbar">
                 <div>
                    <label className="text-xs text-admin-muted uppercase font-bold block mb-2">Plan Name</label>
                    <input 
                      className="w-full bg-black/20 border border-admin-border rounded-lg p-3 text-white focus:border-agri-secondary outline-none"
                      value={editForm.name || ''}
                      onChange={e => setEditForm({...editForm, name: e.target.value})}
                      placeholder="e.g. Premium Researcher"
                    />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-admin-muted uppercase font-bold block mb-2">Price (₹)</label>
                        <input 
                            type="number"
                            className="w-full bg-black/20 border border-admin-border rounded-lg p-3 text-white focus:border-agri-secondary outline-none"
                            value={editForm.price || ''}
                            onChange={e => setEditForm({...editForm, price: parseInt(e.target.value)})}
                        />
                    </div>
                    <div>
                        <label className="text-xs text-admin-muted uppercase font-bold block mb-2">Duration (Months)</label>
                        <input 
                            type="number"
                            className="w-full bg-black/20 border border-admin-border rounded-lg p-3 text-white focus:border-agri-secondary outline-none"
                            value={editForm.durationMonths || ''}
                            onChange={e => setEditForm({...editForm, durationMonths: parseInt(e.target.value)})}
                        />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-admin-muted uppercase font-bold block mb-2">Article Limit</label>
                        <input 
                            type="number"
                            className="w-full bg-black/20 border border-admin-border rounded-lg p-3 text-white focus:border-agri-secondary outline-none"
                            value={editForm.articleLimit === 'UNLIMITED' ? 9999 : editForm.articleLimit || 0}
                            onChange={e => setEditForm({...editForm, articleLimit: parseInt(e.target.value)})}
                            placeholder="0 for none"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-admin-muted uppercase font-bold block mb-2">Blog Limit</label>
                        <input 
                            type="number"
                            className="w-full bg-black/20 border border-admin-border rounded-lg p-3 text-white focus:border-agri-secondary outline-none"
                            value={editForm.blogLimit === 'UNLIMITED' ? 9999 : editForm.blogLimit || 0}
                            onChange={e => setEditForm({...editForm, blogLimit: parseInt(e.target.value)})}
                            placeholder="0 for none"
                        />
                    </div>
                 </div>

                 <div>
                    <label className="text-xs text-admin-muted uppercase font-bold block mb-2">Plan Type</label>
                    <select 
                       className="w-full bg-black/20 border border-admin-border rounded-lg p-3 text-white focus:border-agri-secondary outline-none"
                       value={editForm.type}
                       onChange={e => setEditForm({...editForm, type: e.target.value as any})}
                    >
                       <option value="ARTICLE_ACCESS" className="bg-agri-primary">Article Access</option>
                       <option value="BLOG_ACCESS" className="bg-agri-primary">Blog Access</option>
                       <option value="COMBO_ACCESS" className="bg-agri-primary">Combo (Article + Blog)</option>
                    </select>
                 </div>

                 <div>
                    <label className="text-xs text-admin-muted uppercase font-bold block mb-2">Features (Comma Separated)</label>
                    <input 
                      className="w-full bg-black/20 border border-admin-border rounded-lg p-3 text-white focus:border-agri-secondary outline-none"
                      value={editForm.features?.join(', ') || ''}
                      onChange={e => updateFeatures(e.target.value)}
                      placeholder="Fast Review, Certificate, etc."
                    />
                 </div>

                 <div>
                    <label className="text-xs text-admin-muted uppercase font-bold block mb-2">Description</label>
                    <textarea 
                      className="w-full bg-black/20 border border-admin-border rounded-lg p-3 text-white focus:border-agri-secondary outline-none h-24 resize-none"
                      value={editForm.description || ''}
                      onChange={e => setEditForm({...editForm, description: e.target.value})}
                    />
                 </div>
              </div>

              <div className="p-6 border-t border-white/5 flex justify-end gap-3 bg-black/10">
                 <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-admin-muted hover:text-white font-bold text-xs uppercase tracking-widest">Cancel</button>
                 <button onClick={handleSave} className="bg-agri-secondary text-agri-primary px-8 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg">
                    <Save size={16} /> {editingId ? 'Update Plan' : 'Create Plan'}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPlans;
