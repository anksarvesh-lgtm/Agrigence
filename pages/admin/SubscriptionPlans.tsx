
import React, { useState, useEffect } from 'react';
import { mockBackend } from '../../services/mockBackend';
import { SubscriptionPlan, Tool } from '../../types';
import { Edit, Save, Plus, CheckCircle, Trash2, X } from 'lucide-react';
import { useConfirm } from '../../components/ContextualConfirm';

const SubscriptionPlans: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [allTools, setAllTools] = useState<Tool[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<SubscriptionPlan>>({});
  const { confirm } = useConfirm();

  useEffect(() => {
    loadPlans();
    loadTools();
  }, []);

  const loadPlans = async () => {
    setPlans(await mockBackend.getPlans());
  };

  const loadTools = async () => {
    setAllTools(await mockBackend.getAllTools());
  };

  const handleCreate = () => {
    setEditForm({ 
        features: ['Priority Review', 'Email Support'], 
        type: 'ARTICLE_ACCESS', 
        isActive: true,
        durationMonths: 1,
        articleLimit: 1,
        blogLimit: 0,
        allowedTools: []
    });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingId(plan.id);
    setEditForm({
      ...plan,
      allowedTools: plan.allowedTools || []
    });
    setIsModalOpen(true);
  };

  const toggleTool = (toolId: string) => {
    const currentTools = editForm.allowedTools || [];
    if (currentTools.includes(toolId)) {
      setEditForm({ ...editForm, allowedTools: currentTools.filter(id => id !== toolId) });
    } else {
      setEditForm({ ...editForm, allowedTools: [...currentTools, toolId] });
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    const isConfirmed = await confirm({
        message: "Are you sure you want to delete this subscription plan?",
        type: 'danger',
        trigger: e.currentTarget
    });

    if(isConfirmed) {
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Subscription Plans Manager</h1>
        <button 
          onClick={handleCreate}
          className="bg-agri-secondary text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-md text-xs uppercase tracking-widest hover:bg-agri-primary transition-colors"
        >
          <Plus size={16} /> Create New Plan
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {plans.map(plan => (
          <div key={plan.id} className="bg-white border border-gray-200 rounded-2xl p-6 relative group hover:shadow-lg transition-all">
            <div className="flex justify-between items-start mb-4">
               <div>
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-gray-500 text-xs uppercase tracking-wider">{plan.type.replace('_', ' ')}</p>
                    {plan.is_research_enabled && (
                      <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Research Enabled
                      </span>
                    )}
                  </div>
               </div>
               <div className="flex gap-2">
                 <button 
                   onClick={() => handleEdit(plan)} 
                   className="p-2 bg-gray-100 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                 >
                   <Edit size={16} />
                 </button>
                 <button 
                   onClick={(e) => handleDelete(plan.id, e)} 
                   className="p-2 bg-gray-100 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                 >
                   <Trash2 size={16} />
                 </button>
               </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200">
               <div className="flex justify-between items-center mb-2">
                 <span className="text-gray-500 text-sm">Monthly Price</span>
                 <span className="text-2xl font-bold text-agri-secondary">₹{plan.price}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-gray-500 text-sm">Duration</span>
                 <span className="text-gray-900 font-bold">{plan.durationMonths} Month(s)</span>
               </div>
            </div>

            <p className="text-gray-600 text-sm mb-4 h-10 line-clamp-2">{plan.description}</p>
            
            <div className="space-y-2">
               {plan.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                     <CheckCircle size={14} className="text-green-500" /> {f}
                  </div>
               ))}
            </div>
          </div>
        ))}
        {plans.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-400 italic border-2 border-dashed border-gray-200 rounded-3xl">
                No active subscription plans. Create one to get started.
            </div>
        )}
      </div>

      {/* Edit/Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                 <h3 className="text-xl font-bold text-gray-900">{editingId ? 'Edit Plan' : 'Create New Plan'}</h3>
                 <button onClick={() => setIsModalOpen(false)}><X className="text-gray-400 hover:text-gray-900" /></button>
              </div>
              
              <div className="p-8 space-y-4 overflow-y-auto custom-scrollbar">
                 <div>
                    <label className="text-xs text-gray-500 uppercase font-bold block mb-2">Plan Name</label>
                    <input 
                      className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-900 focus:border-agri-secondary focus:ring-1 focus:ring-agri-secondary outline-none"
                      value={editForm.name || ''}
                      onChange={e => setEditForm({...editForm, name: e.target.value})}
                      placeholder="e.g. Premium Researcher"
                    />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-gray-500 uppercase font-bold block mb-2">Price (₹)</label>
                        <input 
                            type="number"
                            className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-900 focus:border-agri-secondary outline-none"
                            value={editForm.price || ''}
                            onChange={e => setEditForm({...editForm, price: parseInt(e.target.value)})}
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 uppercase font-bold block mb-2">Duration (Months)</label>
                        <input 
                            type="number"
                            className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-900 focus:border-agri-secondary outline-none"
                            value={editForm.durationMonths || ''}
                            onChange={e => setEditForm({...editForm, durationMonths: parseInt(e.target.value)})}
                        />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-gray-500 uppercase font-bold block mb-2">Article Limit</label>
                        <input 
                            type="number"
                            className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-900 focus:border-agri-secondary outline-none"
                            value={editForm.articleLimit === 'UNLIMITED' ? 9999 : editForm.articleLimit || 0}
                            onChange={e => setEditForm({...editForm, articleLimit: parseInt(e.target.value)})}
                            placeholder="0 for none"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 uppercase font-bold block mb-2">Blog Limit</label>
                        <input 
                            type="number"
                            className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-900 focus:border-agri-secondary outline-none"
                            value={editForm.blogLimit === 'UNLIMITED' ? 9999 : editForm.blogLimit || 0}
                            onChange={e => setEditForm({...editForm, blogLimit: parseInt(e.target.value)})}
                            placeholder="0 for none"
                        />
                    </div>
                 </div>

                 <div>
                    <label className="text-xs text-gray-500 uppercase font-bold block mb-2">Plan Type</label>
                    <select 
                       className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-900 focus:border-agri-secondary outline-none"
                       value={editForm.type}
                       onChange={e => setEditForm({...editForm, type: e.target.value as any})}
                    >
                       <option value="ARTICLE_ACCESS">Article Access</option>
                       <option value="BLOG_ACCESS">Blog Access</option>
                       <option value="COMBO_ACCESS">Combo (Article + Blog)</option>
                       <option value="TOOL_ACCESS">Tool Access</option>
                    </select>
                 </div>

                 <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <input 
                      type="checkbox"
                      id="is_research_enabled"
                      className="w-5 h-5 text-agri-secondary rounded border-gray-300 focus:ring-agri-secondary"
                      checked={!!editForm.is_research_enabled}
                      onChange={e => setEditForm({...editForm, is_research_enabled: e.target.checked})}
                    />
                    <label htmlFor="is_research_enabled" className="text-sm font-bold text-gray-900 cursor-pointer">
                      Enable Research Data Entry & Analysis Access
                    </label>
                 </div>

                 <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl">
                    <label className="text-xs text-stone-500 uppercase font-black tracking-widest block mb-4">Tools Access Control</label>
                    <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                      {allTools.map(tool => (
                        <label key={tool.id} className="flex items-center gap-3 p-2 hover:bg-white rounded-lg transition-colors cursor-pointer border border-transparent hover:border-stone-100">
                          <input 
                            type="checkbox"
                            className="w-4 h-4 text-agri-secondary rounded border-stone-300 focus:ring-agri-secondary"
                            checked={editForm.allowedTools?.includes(tool.id)}
                            onChange={() => toggleTool(tool.id)}
                          />
                          <div className="flex-1">
                            <p className="text-xs font-bold text-stone-800">{tool.name}</p>
                            <p className="text-[10px] text-stone-400 line-clamp-1">{tool.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                 </div>

                 <div>
                    <label className="text-xs text-gray-500 uppercase font-bold block mb-2">Features (Comma Separated)</label>
                    <input 
                      className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-900 focus:border-agri-secondary outline-none"
                      value={editForm.features?.join(', ') || ''}
                      onChange={e => updateFeatures(e.target.value)}
                      placeholder="Fast Review, Certificate, etc."
                    />
                 </div>

                 <div>
                    <label className="text-xs text-gray-500 uppercase font-bold block mb-2">Description</label>
                    <textarea 
                      className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-900 focus:border-agri-secondary outline-none h-24 resize-none"
                      value={editForm.description || ''}
                      onChange={e => setEditForm({...editForm, description: e.target.value})}
                    />
                 </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
                 <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-gray-500 hover:text-gray-900 font-bold text-xs uppercase tracking-widest">Cancel</button>
                 <button onClick={handleSave} className="bg-agri-secondary text-white px-8 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg hover:bg-agri-primary">
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
