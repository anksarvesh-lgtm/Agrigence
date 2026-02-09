
import React, { useState, useEffect } from 'react';
import { mockBackend } from '../../services/mockBackend';
import { Trash2, RotateCcw, AlertTriangle, User, FileText, Database } from 'lucide-react';

const TrashManager: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    setItems(mockBackend.getTrash());
  }, []);

  const handlePermanentDelete = async (id: string) => {
    if(confirm('This will be permanently erased. Proceed?')) {
        await mockBackend.permanentDelete(id);
        setItems(mockBackend.getTrash());
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-red-500/10 p-6 rounded-2xl border border-red-500/20">
        <div>
          <h1 className="text-2xl font-bold text-white">System Trash Repository</h1>
          <p className="text-red-400/60 text-xs mt-1 uppercase tracking-widest font-bold flex items-center gap-2"><AlertTriangle size={14}/> Recovery protocol available</p>
        </div>
        <div className="bg-black/20 px-6 py-2 rounded-xl text-[10px] font-black uppercase text-red-400 border border-red-500/20">
           {items.length} ITEMS_QUEUED
        </div>
      </div>

      <div className="grid gap-4">
        {items.map(item => (
          <div key={item.id} className="bg-white/5 border border-white/5 p-6 rounded-2xl flex items-center justify-between group hover:bg-white/10 transition-all">
             <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-white/20">
                   {item.trashType === 'USER' ? <User size={24}/> : <FileText size={24}/>}
                </div>
                <div>
                   <h3 className="text-white font-bold">{item.name || item.title}</h3>
                   <div className="flex items-center gap-4 mt-1">
                      <span className="text-[10px] text-white/30 uppercase font-black tracking-widest">{item.trashType} NODE</span>
                      <span className="text-[10px] text-red-400/40 font-mono uppercase">Deleted: {new Date(item.deletedAt).toLocaleDateString()}</span>
                   </div>
                </div>
             </div>
             <div className="flex gap-3">
                <button className="px-6 py-2 rounded-lg bg-green-500/20 text-green-400 border border-green-500/20 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-green-500 hover:text-white transition-all">
                   <RotateCcw size={14} /> Restore
                </button>
                <button onClick={() => handlePermanentDelete(item.id)} className="px-6 py-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/20 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-red-500 hover:text-white transition-all">
                   <Trash2 size={14} /> Erase
                </button>
             </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="py-32 text-center">
             <Database size={64} className="mx-auto text-white/5 mb-6" />
             <p className="text-white/10 italic">Primary storage is clean. No items in trash.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrashManager;
