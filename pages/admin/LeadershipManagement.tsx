
import React, { useState, useEffect } from 'react';
import { mockBackend } from '../../services/mockBackend';
import { LeadershipMember } from '../../types';
import { Save, UserCircle, Camera, Trash2, Eye, EyeOff, ChevronUp, ChevronDown } from 'lucide-react';

const LeadershipManagement: React.FC = () => {
  const [leaders, setLeaders] = useState<LeadershipMember[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
        setLeaders([...(await mockBackend.getLeadership()).sort((a,b) => a.order - b.order)]);
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

  const updateLeader = (id: string, field: keyof LeadershipMember, value: any) => {
    setLeaders(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const handleImageUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateLeader(id, 'imageUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex justify-between items-center bg-agri-secondary/10 p-6 rounded-2xl border border-agri-secondary/20">
        <div>
          <h1 className="text-2xl font-bold text-white">Founding Leadership</h1>
          <p className="text-white/40 text-xs mt-1 uppercase tracking-widest font-bold">Manage profiles shown on About page</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className="bg-agri-secondary text-agri-primary px-10 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform active:scale-95 disabled:opacity-50"
        >
           <Save size={18} /> {isSaving ? 'UPDATING...' : 'SYNC ALL PROFILES'}
        </button>
      </div>

      <div className="space-y-10">
         {leaders.map((lead, idx) => (
           <div key={lead.id} className="bg-white/5 border border-white/5 rounded-[3rem] p-10 group relative hover:bg-white/10 transition-colors">
              <div className="flex flex-col md:flex-row gap-12 items-start">
                 {/* Portrait */}
                 <div className="relative shrink-0">
                    <div className="w-56 h-56 rounded-[2.5rem] overflow-hidden border-2 border-white/10 group-hover:border-agri-secondary transition-all shadow-2xl relative">
                       <img src={lead.imageUrl} className="w-full h-full object-cover" />
                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <label htmlFor={`lead-img-${lead.id}`} className="cursor-pointer bg-white text-agri-primary p-4 rounded-2xl shadow-xl hover:scale-110 transition-transform">
                             <Camera size={24} />
                          </label>
                          <input type="file" id={`lead-img-${lead.id}`} className="hidden" onChange={e => handleImageUpload(lead.id, e)} />
                       </div>
                    </div>
                    <div className="absolute -bottom-4 -right-4 flex gap-2">
                       <button 
                        onClick={() => updateLeader(lead.id, 'isEnabled', !lead.isEnabled)}
                        className={`p-3 rounded-2xl shadow-xl transition-all ${lead.isEnabled ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
                       >
                          {lead.isEnabled ? <Eye size={18} /> : <EyeOff size={18} />}
                       </button>
                    </div>
                 </div>

                 {/* Bio/Info */}
                 <div className="flex-1 space-y-8 w-full">
                    <div className="grid grid-cols-2 gap-6">
                       <div>
                          <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block tracking-widest">Full Name</label>
                          <input 
                            className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:border-agri-secondary" 
                            value={lead.name} 
                            onChange={e => updateLeader(lead.id, 'name', e.target.value)}
                          />
                       </div>
                       <div>
                          <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block tracking-widest">Designation</label>
                          <input 
                            className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 text-agri-secondary font-bold outline-none focus:border-agri-secondary uppercase tracking-widest text-xs" 
                            value={lead.role} 
                            onChange={e => updateLeader(lead.id, 'role', e.target.value)}
                          />
                       </div>
                    </div>

                    <div>
                       <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block tracking-widest">Public Biography</label>
                       <textarea 
                        className="w-full bg-black/20 border border-white/10 rounded-2xl p-5 text-white text-sm outline-none focus:border-agri-secondary h-32 leading-relaxed resize-none" 
                        value={lead.bio} 
                        onChange={e => updateLeader(lead.id, 'bio', e.target.value)}
                       />
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                       <div className="flex gap-4">
                          <button className="flex items-center gap-2 text-[10px] font-bold text-white/20 hover:text-white"><ChevronUp size={14}/> MOVE UP</button>
                          <button className="flex items-center gap-2 text-[10px] font-bold text-white/20 hover:text-white"><ChevronDown size={14}/> MOVE DOWN</button>
                       </div>
                       <button className="text-[10px] font-bold text-red-400/40 hover:text-red-400 flex items-center gap-2"><Trash2 size={14} /> REMOVE PROFILE</button>
                    </div>
                 </div>
              </div>
           </div>
         ))}
      </div>
    </div>
  );
};

export default LeadershipManagement;
