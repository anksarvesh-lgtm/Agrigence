
import React, { useState, useEffect } from 'react';
import { mockBackend } from '../../services/mockBackend';
import { NavigationItem } from '../../types';
import { Plus, Trash2, Edit, Save, X, GripVertical, Power, Link as LinkIcon } from 'lucide-react';

const NavigationManager: React.FC = () => {
  const [items, setItems] = useState<NavigationItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<NavigationItem>>({});

  useEffect(() => {
    setItems(mockBackend.getSettings().navigation.sort((a,b) => a.order - b.order));
  }, []);

  const handleSave = async () => {
    if(!editingItem.label || !editingItem.path) return alert("Label and Path are required");
    const settings = mockBackend.getSettings();
    let newNav = [...settings.navigation];
    
    if(editingItem.id) {
      newNav = newNav.map(n => n.id === editingItem.id ? (editingItem as NavigationItem) : n);
    } else {
      newNav.push({ ...editingItem, id: Math.random().toString(), order: newNav.length + 1, isEnabled: true, isExternal: false } as NavigationItem);
    }

    await mockBackend.updateSettings({ ...settings, navigation: newNav });
    setItems([...newNav].sort((a,b) => a.order - b.order));
    setIsModalOpen(false);
  };

  const handleToggle = async (id: string) => {
    const settings = mockBackend.getSettings();
    const newNav = settings.navigation.map(n => n.id === id ? { ...n, isEnabled: !n.isEnabled } : n);
    await mockBackend.updateSettings({ ...settings, navigation: newNav });
    setItems([...newNav].sort((a,b) => a.order - b.order));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-black">Menu Navigation</h1>
        <button onClick={() => { setEditingItem({}); setIsModalOpen(true); }} className="bg-stone-200 text-black border border-stone-300 px-8 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-stone-200/20 flex items-center gap-2 hover:bg-stone-300 transition-colors">
           <Plus size={16} /> ADD_LINK
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={item.id} className="bg-white border border-stone-200 p-4 rounded-2xl flex items-center justify-between group hover:shadow-md transition-all shadow-sm">
             <div className="flex items-center gap-4">
                <GripVertical size={20} className="text-black cursor-move" />
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] border border-stone-300 ${item.isEnabled ? 'bg-stone-200 text-black' : 'bg-stone-100 text-black'}`}>
                   {idx + 1}
                </div>
                <div>
                   <h3 className={`text-sm font-bold ${item.isEnabled ? 'text-black' : 'text-black line-through opacity-50'}`}>{item.label}</h3>
                   <p className="text-[10px] text-black font-mono">{item.path}</p>
                </div>
             </div>
             <div className="flex items-center gap-4">
                <button 
                  onClick={() => handleToggle(item.id)}
                  className={`p-2 rounded-lg transition-all ${item.isEnabled ? 'text-black hover:bg-green-100' : 'text-black hover:bg-red-100'}`}
                  title={item.isEnabled ? "Enabled" : "Disabled"}
                >
                   <Power size={18} />
                </button>
                <button onClick={() => { setEditingItem(item); setIsModalOpen(true); }} className="p-2 text-black hover:bg-stone-100 rounded-lg transition-all"><Edit size={18} /></button>
                <button className="p-2 text-black hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={18} /></button>
             </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
           <div className="bg-white w-full max-w-md rounded-[2.5rem] border border-stone-200 shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-stone-200 flex justify-between items-center bg-stone-50">
                 <h3 className="text-xl font-serif font-bold text-black">Menu Editor</h3>
                 <button onClick={() => setIsModalOpen(false)}><X className="text-black hover:bg-stone-200 rounded-full p-1" /></button>
              </div>
              <div className="p-8 space-y-6">
                 <div>
                    <label className="text-[10px] uppercase font-bold text-black mb-2 block tracking-widest">Menu Label</label>
                    <input className="w-full bg-white border border-stone-300 rounded-xl p-4 text-black outline-none focus:border-black focus:ring-1 focus:ring-black" value={editingItem.label || ''} onChange={e => setEditingItem({...editingItem, label: e.target.value})} placeholder="e.g. Products" />
                 </div>
                 <div>
                    <label className="text-[10px] uppercase font-bold text-black mb-2 block tracking-widest">Route Path</label>
                    <div className="relative">
                      <LinkIcon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-black" />
                      <input className="w-full bg-white border border-stone-300 rounded-xl pl-10 pr-4 py-4 text-black outline-none focus:border-black focus:ring-1 focus:ring-black font-mono text-xs" value={editingItem.path || ''} onChange={e => setEditingItem({...editingItem, path: e.target.value})} placeholder="/example" />
                    </div>
                 </div>
              </div>
              <div className="p-8 border-t border-stone-200 flex justify-end gap-4 bg-stone-50">
                 <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-black hover:bg-stone-200 rounded-xl font-bold text-xs uppercase tracking-widest">Cancel</button>
                 <button onClick={handleSave} className="bg-stone-200 text-black border border-stone-300 px-10 py-3 rounded-xl font-bold flex items-center gap-2 shadow-xl hover:bg-stone-300 transition-colors">
                    <Save size={18} /> SYNC_NAV
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default NavigationManager;
