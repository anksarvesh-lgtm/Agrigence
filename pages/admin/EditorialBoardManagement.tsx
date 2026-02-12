
import React, { useState, useEffect } from 'react';
import { mockBackend } from '../../services/mockBackend';
import { EditorialMember } from '../../types';
import { Plus, Trash2, Edit, Save, X, Award, MapPin, Mail, ChevronUp, ChevronDown, ImageIcon, Globe, Linkedin, BookOpen, User } from 'lucide-react';

const EditorialBoardManagement: React.FC = () => {
  const [members, setMembers] = useState<EditorialMember[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Partial<EditorialMember>>({});

  useEffect(() => { loadMembers(); }, []);

  const loadMembers = async () => {
    setMembers([...(await mockBackend.getMembers()).sort((a,b) => a.order - b.order)]);
  };

  const handleSave = async () => {
    if (!editingMember.name || !editingMember.designation) return alert("Name and Designation are required");
    
    if (editingMember.id) {
      await mockBackend.updateMember(editingMember as EditorialMember);
    } else {
      await mockBackend.addMember({
        ...editingMember,
        order: members.length + 1,
        isEnabled: true
      });
    }
    
    setIsModalOpen(false);
    setEditingMember({});
    loadMembers();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Permanently remove this editorial board member from the database?')) {
      await mockBackend.deleteMember(id);
      loadMembers();
    }
  };

  const handleToggleStatus = async (member: EditorialMember) => {
    await mockBackend.updateMember({ ...member, isEnabled: !member.isEnabled });
    loadMembers();
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex justify-between items-center bg-agri-primary/5 p-6 rounded-3xl border border-white/5">
        <div>
           <h1 className="text-2xl font-bold text-white">Editorial Board Architecture</h1>
           <p className="text-white/40 text-xs mt-1 uppercase tracking-widest font-black">Credibility & Review Protocol</p>
        </div>
        <button onClick={() => { setEditingMember({ isEnabled: true }); setIsModalOpen(true); }} className="bg-agri-secondary text-agri-primary px-10 py-3 rounded-xl font-bold flex items-center gap-2 shadow-xl shadow-agri-secondary/10 hover:scale-105 transition-all text-xs uppercase tracking-widest">
           <Plus size={18} /> ADD_SCHOLAR
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {members.map(member => (
          <div key={member.id} className={`bg-white/5 border border-white/5 rounded-[2.5rem] p-8 group hover:bg-white/10 transition-all relative overflow-hidden ${!member.isEnabled ? 'opacity-50 grayscale' : ''}`}>
             {!member.isEnabled && (
                <div className="absolute top-4 left-4 bg-red-500 text-white text-[8px] font-black uppercase px-2 py-1 rounded-full z-10">Protcol_Disabled</div>
             )}
             
             <div className="flex items-center gap-6 mb-8">
                <div className="w-24 h-24 rounded-3xl overflow-hidden border-2 border-agri-secondary/30 shrink-0 shadow-2xl group-hover:border-agri-secondary transition-all">
                   <img src={member.imageUrl || `https://ui-avatars.com/api/?name=${member.name}`} className="w-full h-full object-cover" alt={member.name} />
                </div>
                <div className="flex-1 min-w-0">
                   <h3 className="text-white font-bold text-lg leading-tight mb-1">{member.name}</h3>
                   <p className="text-agri-secondary text-[10px] font-black uppercase tracking-[0.2em]">{member.designation}</p>
                   <p className="text-white/20 text-[9px] mt-2 font-mono">ORDER: {member.order}</p>
                </div>
             </div>
             
             <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3 text-xs text-white/40">
                   <Award size={16} className="shrink-0 text-agri-secondary" /> <span className="line-clamp-1">{member.qualification}</span>
                </div>
                <div className="flex items-start gap-3 text-xs text-white/40">
                   <MapPin size={16} className="shrink-0 text-agri-secondary" /> <span className="line-clamp-1">{member.institution}</span>
                </div>
                <div className="flex items-start gap-3 text-xs text-white/40">
                   <Mail size={16} className="shrink-0 text-agri-secondary" /> <span className="truncate">{member.email || 'NO_V_MAIL'}</span>
                </div>
             </div>

             <div className="flex items-center justify-between border-t border-white/5 pt-6">
                <div className="flex gap-2">
                   <button onClick={() => handleToggleStatus(member)} className={`p-2.5 rounded-xl transition-all ${member.isEnabled ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'}`}>
                      <Globe size={18} />
                   </button>
                   <button onClick={() => { setEditingMember(member); setIsModalOpen(true); }} className="p-2.5 bg-white/5 rounded-xl text-white/40 hover:text-agri-secondary hover:bg-white/10 transition-all"><Edit size={18}/></button>
                </div>
                <button onClick={() => handleDelete(member.id)} className="p-2.5 bg-white/5 rounded-xl text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-all"><Trash2 size={18}/></button>
             </div>
          </div>
        ))}
        {members.length === 0 && <div className="col-span-3 text-center py-32 text-white/10 italic border-2 border-dashed border-white/5 rounded-[3rem]">No scholarly profiles found in the registry.</div>}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md">
           <div className="bg-[#1C2A22] w-full max-w-5xl rounded-[3.5rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-10 border-b border-white/5 flex justify-between items-center bg-black/20">
                 <div>
                    <h3 className="text-3xl font-serif font-bold text-white">Scholar Management</h3>
                    <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mt-1">Refining: {editingMember.name || 'New Node'}</p>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className="p-4 bg-white/5 rounded-full text-white/40 hover:text-white transition-all"><X size={24} /></button>
              </div>

              <div className="p-10 space-y-8 overflow-y-auto custom-scrollbar flex-1">
                 <div className="grid lg:grid-cols-12 gap-10">
                    
                    {/* Left: Media & Basic Info */}
                    <div className="lg:col-span-4 space-y-8">
                       <div className="space-y-4">
                          <label className="text-[10px] uppercase font-bold text-white/40 block tracking-widest ml-2">Academic Portrait</label>
                          <div className="aspect-square rounded-[3rem] bg-black/40 border-2 border-dashed border-white/10 overflow-hidden relative group">
                             {editingMember.imageUrl ? <img src={editingMember.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex flex-col items-center justify-center text-white/10"><ImageIcon size={48} /><span className="text-[8px] mt-2">MISSING_ASSET</span></div>}
                             <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer">
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">Replace Photo</span>
                                <input type="file" className="hidden" onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if(file) {
                                    const reader = new FileReader();
                                    reader.onload = () => setEditingMember({...editingMember, imageUrl: reader.result as string});
                                    reader.readAsDataURL(file);
                                  }
                                }} />
                             </label>
                          </div>
                       </div>

                       <div className="space-y-6 bg-black/20 p-8 rounded-[2.5rem] border border-white/5">
                          <h4 className="text-[10px] font-black text-agri-secondary uppercase tracking-[0.2em] mb-4">External Protocol Links</h4>
                          <div className="space-y-4">
                             <div className="relative">
                                <Globe size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                                <input className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-xs outline-none focus:border-agri-secondary" placeholder="Google Scholar URL" value={editingMember.googleScholar || ''} onChange={e => setEditingMember({...editingMember, googleScholar: e.target.value})} />
                             </div>
                             <div className="relative">
                                <BookOpen size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                                <input className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-xs outline-none focus:border-agri-secondary" placeholder="ORCID ID / URL" value={editingMember.orcid || ''} onChange={e => setEditingMember({...editingMember, orcid: e.target.value})} />
                             </div>
                             <div className="relative">
                                <Linkedin size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                                <input className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-xs outline-none focus:border-agri-secondary" placeholder="LinkedIn Profile" value={editingMember.linkedin || ''} onChange={e => setEditingMember({...editingMember, linkedin: e.target.value})} />
                             </div>
                          </div>
                       </div>
                    </div>

                    {/* Right: Detailed Fields */}
                    <div className="lg:col-span-8 space-y-8">
                       <div className="grid md:grid-cols-2 gap-6">
                          <div>
                             <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block tracking-widest">Full Scholarly Name</label>
                             <input className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-agri-secondary font-bold" value={editingMember.name || ''} onChange={e => setEditingMember({...editingMember, name: e.target.value})} />
                          </div>
                          <div>
                             <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block tracking-widest">Editorial Role</label>
                             <select className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-agri-secondary" value={editingMember.designation || ''} onChange={e => setEditingMember({...editingMember, designation: e.target.value})}>
                                <option value="" className="bg-agri-primary">Select Role</option>
                                <option value="Editor-in-Chief" className="bg-agri-primary">Editor-in-Chief</option>
                                <option value="Associate Editor" className="bg-agri-primary">Associate Editor</option>
                                <option value="Reviewer" className="bg-agri-primary">Reviewer</option>
                                <option value="Advisory Board" className="bg-agri-primary">Advisory Board</option>
                                <option value="Managing Editor" className="bg-agri-primary">Managing Editor</option>
                             </select>
                          </div>
                       </div>

                       <div className="grid md:grid-cols-2 gap-6">
                          <div>
                             <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block tracking-widest">Institution / University</label>
                             <input className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-agri-secondary text-sm" value={editingMember.institution || ''} onChange={e => setEditingMember({...editingMember, institution: e.target.value})} />
                          </div>
                          <div>
                             <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block tracking-widest">Official Contact Email</label>
                             <input className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-agri-secondary text-sm" value={editingMember.email || ''} onChange={e => setEditingMember({...editingMember, email: e.target.value})} />
                          </div>
                       </div>

                       <div className="grid md:grid-cols-3 gap-6">
                          <div>
                             <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block tracking-widest">Qualification</label>
                             <input className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-agri-secondary text-xs" placeholder="e.g. Ph.D." value={editingMember.qualification || ''} onChange={e => setEditingMember({...editingMember, qualification: e.target.value})} />
                          </div>
                          <div>
                             <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block tracking-widest">Experience (Years)</label>
                             <input className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-agri-secondary text-xs" value={editingMember.experience || ''} onChange={e => setEditingMember({...editingMember, experience: e.target.value})} />
                          </div>
                          <div>
                             <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block tracking-widest">Display Priority</label>
                             <input type="number" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-agri-secondary font-black outline-none focus:border-agri-secondary text-xs" value={editingMember.order || 0} onChange={e => setEditingMember({...editingMember, order: parseInt(e.target.value)})} />
                          </div>
                       </div>

                       <div>
                          <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block tracking-widest">Areas of Expertise (Comma Separated Tags)</label>
                          <input className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-agri-secondary text-sm" placeholder="Soil Science, Crop Rotation, Pest Resilience" value={editingMember.expertise || ''} onChange={e => setEditingMember({...editingMember, expertise: e.target.value})} />
                       </div>

                       <div>
                          <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block tracking-widest">Scholarly Biography (Public Display)</label>
                          <textarea className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-white text-sm outline-none focus:border-agri-secondary h-40 leading-relaxed resize-none font-serif" placeholder="Provide a professional summary..." value={editingMember.bio || ''} onChange={e => setEditingMember({...editingMember, bio: e.target.value})}></textarea>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="p-10 border-t border-white/5 flex justify-end gap-6 bg-black/10">
                 <button onClick={() => setIsModalOpen(false)} className="px-10 py-4 text-white/20 hover:text-white font-bold text-xs uppercase tracking-widest">TERMINATE</button>
                 <button onClick={handleSave} className="bg-agri-secondary text-agri-primary px-16 py-4 rounded-[2rem] font-bold flex items-center gap-3 shadow-2xl shadow-agri-secondary/20 hover:scale-105 transition-transform active:scale-95">
                    <Save size={20} /> SYNCHRONIZE_SCHOLAR
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default EditorialBoardManagement;
