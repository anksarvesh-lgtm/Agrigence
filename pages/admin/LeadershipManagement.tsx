
import React, { useState, useEffect } from 'react';
import { mockBackend } from '../../services/mockBackend';
import { LeadershipMember } from '../../types';
import { Save, UserCircle, Camera, Trash2, Eye, EyeOff, ChevronUp, ChevronDown, Loader2, Plus } from 'lucide-react';
import { useConfirm } from '../../components/ContextualConfirm';

const LeadershipManagement: React.FC = () => {
  const [leaders, setLeaders] = useState<LeadershipMember[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const { confirm } = useConfirm();

  useEffect(() => {
    const load = async () => {
        const data = await mockBackend.getLeadership();
        setLeaders([...data.sort((a,b) => a.order - b.order)]);
    };
    load();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    await mockBackend.updateLeadership(leaders);
    setTimeout(() => {
        setIsSaving(false);
        alert('Leadership profiles synced successfully!');
    }, 800);
  };

  const handleAddProfile = () => {
    const newProfile: LeadershipMember = {
        id: `l${Date.now()}`,
        name: 'New Leader',
        role: 'Designation',
        bio: 'Enter biography here...',
        imageUrl: '',
        order: leaders.length + 1,
        isEnabled: true
    };
    setLeaders([...leaders, newProfile]);
  };

  const handleDeleteProfile = async (id: string, e: React.MouseEvent) => {
      const isConfirmed = await confirm({
          message: "Are you sure you want to remove this profile?",
          type: 'danger',
          trigger: e.currentTarget
      });

      if(isConfirmed) {
          setLeaders(prev => prev.filter(l => l.id !== id));
      }
  };

  const updateLeader = (id: string, field: keyof LeadershipMember, value: any) => {
    setLeaders(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const handleImageUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingId(id);
      try {
        const url = await mockBackend.uploadFile(file, 'leadership');
        updateLeader(id, 'imageUrl', url);
      } finally {
        setUploadingId(null);
      }
    }
  };

  const moveProfile = (index: number, direction: 'up' | 'down') => {
      const newLeaders = [...leaders];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex >= 0 && targetIndex < newLeaders.length) {
          [newLeaders[index], newLeaders[targetIndex]] = [newLeaders[targetIndex], newLeaders[index]];
          // Update orders
          newLeaders.forEach((l, i) => l.order = i + 1);
          setLeaders(newLeaders);
      }
  };

  return (
    <div className="space-y-8 max-w-5xl pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl border border-stone-200 shadow-sm gap-4">
        <div>
          <h1 className="text-2xl font-bold text-black">Founding Leadership</h1>
          <p className="text-stone-500 text-xs mt-1 uppercase tracking-widest font-bold">Manage profiles shown on About page</p>
        </div>
        <div className="flex flex-wrap gap-3">
            <button 
            onClick={handleAddProfile} 
            className="bg-stone-100 text-stone-600 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-stone-200 transition-transform active:scale-95 text-xs uppercase tracking-widest"
            >
            <Plus size={18} /> Add Profile
            </button>
            <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-agri-secondary text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform active:scale-95 disabled:opacity-50 text-xs uppercase tracking-widest shadow-lg"
            >
            <Save size={18} /> {isSaving ? 'SYNCING...' : 'SAVE CHANGES'}
            </button>
        </div>
      </div>

      <div className="space-y-10">
         {leaders.map((lead, idx) => (
           <div key={lead.id} className="bg-white border border-stone-200 rounded-[3rem] p-10 group relative hover:shadow-lg transition-all shadow-sm">
              <div className="flex flex-col md:flex-row gap-12 items-start">
                 {/* Portrait */}
                 <div className="relative shrink-0">
                    <div className="w-56 h-56 rounded-[2.5rem] overflow-hidden border-2 border-stone-200 group-hover:border-agri-secondary transition-all shadow-xl relative bg-stone-100">
                       {uploadingId === lead.id && (
                          <div className="absolute inset-0 z-20 bg-white/80 flex items-center justify-center text-agri-secondary">
                             <Loader2 size={32} className="animate-spin" />
                          </div>
                       )}
                       {lead.imageUrl ? (
                           <img src={lead.imageUrl} className="w-full h-full object-cover" />
                       ) : (
                           <div className="w-full h-full flex items-center justify-center text-stone-300">
                               <UserCircle size={64} />
                           </div>
                       )}
                       
                       {/* Always visible upload overlay for better UX */}
                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                          <label htmlFor={`lead-img-${lead.id}`} className="cursor-pointer bg-white text-agri-primary p-4 rounded-2xl shadow-xl hover:scale-110 transition-transform">
                             <Camera size={24} />
                          </label>
                          <input type="file" id={`lead-img-${lead.id}`} className="hidden" onChange={e => handleImageUpload(lead.id, e)} disabled={uploadingId === lead.id} />
                       </div>
                    </div>
                    <div className="absolute -bottom-4 -right-4 flex gap-2">
                       <button 
                        onClick={() => updateLeader(lead.id, 'isEnabled', !lead.isEnabled)}
                        className={`p-3 rounded-2xl shadow-xl transition-all ${lead.isEnabled ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
                        title="Toggle Visibility"
                       >
                          {lead.isEnabled ? <Eye size={18} /> : <EyeOff size={18} />}
                       </button>
                    </div>
                 </div>

                 {/* Bio/Info */}
                 <div className="flex-1 space-y-8 w-full">
                    <div className="grid grid-cols-2 gap-6">
                       <div>
                          <label className="text-[10px] uppercase font-bold text-stone-500 mb-2 block tracking-widest">Full Name</label>
                          <input 
                            className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-4 text-black font-bold outline-none focus:border-agri-secondary focus:ring-1 focus:ring-agri-secondary" 
                            value={lead.name} 
                            onChange={e => updateLeader(lead.id, 'name', e.target.value)}
                          />
                       </div>
                       <div>
                          <label className="text-[10px] uppercase font-bold text-stone-500 mb-2 block tracking-widest">Designation</label>
                          <input 
                            className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-4 text-agri-secondary font-bold outline-none focus:border-agri-secondary focus:ring-1 focus:ring-agri-secondary uppercase tracking-widest text-xs" 
                            value={lead.role} 
                            onChange={e => updateLeader(lead.id, 'role', e.target.value)}
                          />
                       </div>
                    </div>

                    <div>
                       <label className="text-[10px] uppercase font-bold text-stone-500 mb-2 block tracking-widest">Public Biography</label>
                       <textarea 
                        className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-5 text-black text-sm outline-none focus:border-agri-secondary focus:ring-1 focus:ring-agri-secondary h-32 leading-relaxed resize-none" 
                        value={lead.bio} 
                        onChange={e => updateLeader(lead.id, 'bio', e.target.value)}
                       />
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                       <div className="flex gap-4">
                          <button onClick={() => moveProfile(idx, 'up')} className="flex items-center gap-2 text-[10px] font-bold text-stone-400 hover:text-black"><ChevronUp size={14}/> MOVE UP</button>
                          <button onClick={() => moveProfile(idx, 'down')} className="flex items-center gap-2 text-[10px] font-bold text-stone-400 hover:text-black"><ChevronDown size={14}/> MOVE DOWN</button>
                       </div>
                       <button onClick={(e) => handleDeleteProfile(lead.id, e)} className="text-[10px] font-bold text-red-400 hover:text-red-600 flex items-center gap-2"><Trash2 size={14} /> REMOVE PROFILE</button>
                    </div>
                 </div>
              </div>
           </div>
         ))}
         {leaders.length === 0 && (
             <div className="text-center py-20 text-stone-400 italic border-2 border-dashed border-stone-200 rounded-[3rem]">
                 No leadership profiles found. Click "Add Profile" to begin.
             </div>
         )}
      </div>
    </div>
  );
};

export default LeadershipManagement;
