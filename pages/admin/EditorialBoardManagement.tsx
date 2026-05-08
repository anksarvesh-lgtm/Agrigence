
import React, { useState, useEffect } from 'react';
import { mockBackend } from '../../services/mockBackend';
import { EditorialMember } from '../../types';
import { Plus, Trash2, Edit, Save, X, Award, MapPin, Mail, ImageIcon, Globe, Linkedin, BookOpen, User, Loader2, Upload } from 'lucide-react';
import { useConfirm } from '../../components/ContextualConfirm';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const EditorialBoardManagement: React.FC = () => {
  const [members, setMembers] = useState<EditorialMember[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Partial<EditorialMember>>({});
  const [isUploading, setIsUploading] = useState(false);
  const { confirm } = useConfirm();

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

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    const isConfirmed = await confirm({
        message: 'Permanently remove this editorial board member from the database?',
        type: 'danger',
        trigger: e.currentTarget
    });

    if (isConfirmed) {
      await mockBackend.deleteMember(id);
      loadMembers();
    }
  };

  const handleToggleStatus = async (member: EditorialMember) => {
    await mockBackend.updateMember({ ...member, isEnabled: !member.isEnabled });
    loadMembers();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const url = await mockBackend.uploadToBlob(file, 'editorial');
        setEditingMember((prev) => prev ? {...prev, imageUrl: url} : prev);
      } catch (err) {
        console.error("Upload failed", err);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link', 'clean']
    ],
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">Editorial Board Architecture</h1>
           <p className="text-gray-500 text-xs mt-1 uppercase tracking-widest font-black">Credibility & Review Protocol</p>
        </div>
        <button onClick={() => { setEditingMember({ isEnabled: true }); setIsModalOpen(true); }} className="bg-agri-secondary text-white px-10 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-agri-primary transition-all text-xs uppercase tracking-widest">
           <Plus size={18} /> ADD_SCHOLAR
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {members.map(member => (
          <div key={member.id} className={`bg-white border border-gray-200 rounded-[2.5rem] p-8 group hover:shadow-lg transition-all relative overflow-hidden ${!member.isEnabled ? 'opacity-50 grayscale' : ''}`}>
             {!member.isEnabled && (
                <div className="absolute top-4 left-4 bg-red-500 text-white text-[8px] font-black uppercase px-2 py-1 rounded-full z-10">Disabled</div>
             )}
             
             <div className="flex items-center gap-6 mb-8">
                <div className="w-24 h-24 rounded-3xl overflow-hidden border-2 border-gray-100 shrink-0 shadow-sm group-hover:border-agri-secondary transition-all">
                   <img src={member.imageUrl || `https://ui-avatars.com/api/?name=${member.name}`} className="w-full h-full object-cover" alt={member.name} />
                </div>
                <div className="flex-1 min-w-0">
                   <h3 className="text-gray-900 font-bold text-lg leading-tight mb-1">{member.name}</h3>
                   <p className="text-agri-secondary text-[10px] font-black uppercase tracking-[0.2em]">{member.designation}</p>
                   <p className="text-gray-400 text-[9px] mt-2 font-mono">ORDER: {member.order}</p>
                </div>
             </div>
             
             <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3 text-xs text-gray-500">
                   <Award size={16} className="shrink-0 text-agri-secondary" /> <span className="line-clamp-1">{member.profession}</span>
                </div>
                <div className="flex items-start gap-3 text-xs text-gray-500">
                   <MapPin size={16} className="shrink-0 text-agri-secondary" /> <span className="line-clamp-1">{member.institution}</span>
                </div>
                <div className="flex items-start gap-3 text-xs text-gray-500">
                   <Mail size={16} className="shrink-0 text-agri-secondary" /> <span className="truncate">{member.email || 'NO_V_MAIL'}</span>
                </div>
             </div>

             <div className="flex items-center justify-between border-t border-gray-100 pt-6">
                <div className="flex gap-2">
                   <button onClick={() => handleToggleStatus(member)} className={`p-2.5 rounded-xl transition-all ${member.isEnabled ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'}`}>
                      <Globe size={18} />
                   </button>
                   <button onClick={() => { setEditingMember(member); setIsModalOpen(true); }} className="p-2.5 bg-gray-50 rounded-xl text-gray-500 hover:text-agri-secondary hover:bg-gray-100 transition-all"><Edit size={18}/></button>
                </div>
                <button onClick={(e) => handleDelete(member.id, e)} className="p-2.5 bg-gray-50 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 size={18}/></button>
             </div>
          </div>
        ))}
        {members.length === 0 && <div className="col-span-3 text-center py-32 text-gray-400 italic border-2 border-dashed border-gray-200 rounded-[3rem]">No scholarly profiles found.</div>}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
           <div className="bg-white w-full max-w-5xl rounded-[3.5rem] border border-gray-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-10 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                 <div>
                    <h3 className="text-3xl font-serif font-bold text-gray-900">Scholar Management</h3>
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-1">Refining: {editingMember.name || 'New Profile'}</p>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className="p-4 bg-white rounded-full text-gray-400 hover:text-gray-900 transition-all shadow-sm"><X size={24} /></button>
              </div>

              <div className="p-10 space-y-8 overflow-y-auto custom-scrollbar flex-1 bg-white">
                 <div className="grid lg:grid-cols-12 gap-10">
                    
                    {/* Left: Media & Basic Info */}
                    <div className="lg:col-span-4 space-y-8">
                       <div className="space-y-4">
                          <label className="text-[10px] uppercase font-bold text-gray-500 block tracking-widest ml-2">Academic Portrait</label>
                          <div className="aspect-square rounded-[3rem] bg-gray-50 border-2 border-dashed border-gray-200 overflow-hidden relative group">
                             {isUploading && (
                                <div className="absolute inset-0 z-20 bg-white/80 flex items-center justify-center text-agri-secondary">
                                   <Loader2 size={32} className="animate-spin" />
                                </div>
                             )}
                             {editingMember.imageUrl ? <img src={editingMember.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex flex-col items-center justify-center text-gray-300"><ImageIcon size={48} /><span className="text-[8px] mt-2">MISSING_ASSET</span></div>}
                             <label htmlFor="editorial-image-upload" className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer">
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">Replace Photo</span>
                             </label>
                             <input type="file" id="editorial-image-upload" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                          </div>
                       </div>

                       <div className="space-y-6 bg-gray-50 p-8 rounded-[2.5rem] border border-gray-200">
                          <h4 className="text-[10px] font-black text-agri-secondary uppercase tracking-[0.2em] mb-4">External Links</h4>
                          <div className="space-y-4">
                             <div className="relative">
                                <Globe size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-gray-900 text-xs outline-none focus:border-agri-secondary" placeholder="Google Scholar URL" value={editingMember.googleScholar || ''} onChange={e => setEditingMember({...editingMember, googleScholar: e.target.value})} />
                             </div>
                             <div className="relative">
                                <BookOpen size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-gray-900 text-xs outline-none focus:border-agri-secondary" placeholder="ORCID ID / URL" value={editingMember.orcid || ''} onChange={e => setEditingMember({...editingMember, orcid: e.target.value})} />
                             </div>
                             <div className="relative">
                                <Linkedin size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-gray-900 text-xs outline-none focus:border-agri-secondary" placeholder="LinkedIn Profile" value={editingMember.linkedin || ''} onChange={e => setEditingMember({...editingMember, linkedin: e.target.value})} />
                             </div>
                          </div>
                       </div>
                    </div>

                    {/* Right: Detailed Fields */}
                    <div className="lg:col-span-8 space-y-8">
                       <div className="grid md:grid-cols-2 gap-6">
                          <div>
                             <label className="text-[10px] uppercase font-bold text-gray-500 mb-2 block tracking-widest">Full Name</label>
                             <input className="w-full bg-white border border-gray-300 rounded-2xl p-4 text-gray-900 font-bold outline-none focus:border-agri-secondary focus:ring-1 focus:ring-agri-secondary" value={editingMember.name || ''} onChange={e => setEditingMember({...editingMember, name: e.target.value})} />
                          </div>
                          <div>
                             <label className="text-[10px] uppercase font-bold text-gray-500 mb-2 block tracking-widest">Role</label>
                             <select className="w-full bg-white border border-gray-300 rounded-2xl p-4 text-gray-900 outline-none focus:border-agri-secondary focus:ring-1 focus:ring-agri-secondary" value={editingMember.designation || ''} onChange={e => setEditingMember({...editingMember, designation: e.target.value})}>
                                <option value="">Select Role</option>
                                <option value="Editor-in-Chief">Editor-in-Chief</option>
                                <option value="Managing Editor">Managing Editor</option>
                                <option value="Associate Editor">Associate Editor</option>
                                <option value="Editorial Board Member">Editorial Board Member</option>
                                <option value="Advisory Board">Advisory Board Member</option>
                                <option value="Reviewer">Reviewer</option>
                             </select>
                          </div>
                       </div>

                       <div className="grid md:grid-cols-2 gap-6">
                          <div>
                             <label className="text-[10px] uppercase font-bold text-gray-500 mb-2 block tracking-widest">Institution/Affiliation</label>
                             <input className="w-full bg-white border border-gray-300 rounded-2xl p-4 text-gray-900 outline-none focus:border-agri-secondary text-sm" value={editingMember.institution || ''} onChange={e => setEditingMember({...editingMember, institution: e.target.value})} />
                          </div>
                          <div>
                             <label className="text-[10px] uppercase font-bold text-gray-500 mb-2 block tracking-widest">Department</label>
                             <input className="w-full bg-white border border-gray-300 rounded-2xl p-4 text-gray-900 outline-none focus:border-agri-secondary text-sm" value={editingMember.department || ''} onChange={e => setEditingMember({...editingMember, department: e.target.value})} />
                          </div>
                       </div>

                       <div className="grid md:grid-cols-2 gap-6">
                          <div>
                             <label className="text-[10px] uppercase font-bold text-gray-500 mb-2 block tracking-widest">Country</label>
                             <input className="w-full bg-white border border-gray-300 rounded-2xl p-4 text-gray-900 outline-none focus:border-agri-secondary text-sm" value={editingMember.country || ''} onChange={e => setEditingMember({...editingMember, country: e.target.value})} />
                          </div>
                          <div>
                             <label className="text-[10px] uppercase font-bold text-gray-500 mb-2 block tracking-widest">Email</label>
                             <input className="w-full bg-white border border-gray-300 rounded-2xl p-4 text-gray-900 outline-none focus:border-agri-secondary text-sm" value={editingMember.email || ''} onChange={e => setEditingMember({...editingMember, email: e.target.value})} />
                          </div>
                       </div>

                       <div className="grid md:grid-cols-3 gap-6">
                          <div>
                             <label className="text-[10px] uppercase font-bold text-gray-500 mb-2 block tracking-widest">Profession</label>
                             <input className="w-full bg-white border border-gray-300 rounded-2xl p-4 text-gray-900 outline-none focus:border-agri-secondary text-xs" placeholder="e.g. Professor" value={editingMember.profession || ''} onChange={e => setEditingMember({...editingMember, profession: e.target.value})} />
                          </div>
                          <div>
                             <label className="text-[10px] uppercase font-bold text-gray-500 mb-2 block tracking-widest">Experience (Years)</label>
                             <input className="w-full bg-white border border-gray-300 rounded-2xl p-4 text-gray-900 outline-none focus:border-agri-secondary text-xs" value={editingMember.experience || ''} onChange={e => setEditingMember({...editingMember, experience: e.target.value})} />
                          </div>
                          <div>
                             <label className="text-[10px] uppercase font-bold text-gray-500 mb-2 block tracking-widest">Priority</label>
                             <input type="number" className="w-full bg-white border border-gray-300 rounded-2xl p-4 text-gray-900 font-bold outline-none focus:border-agri-secondary text-xs" value={editingMember.order || 0} onChange={e => setEditingMember({...editingMember, order: parseInt(e.target.value)})} />
                          </div>
                       </div>

                       <div>
                          <label className="text-[10px] uppercase font-bold text-gray-500 mb-2 block tracking-widest">Expertise</label>
                          <input className="w-full bg-white border border-gray-300 rounded-2xl p-4 text-gray-900 outline-none focus:border-agri-secondary text-sm" placeholder="Soil Science, Crop Rotation..." value={editingMember.expertise || ''} onChange={e => setEditingMember({...editingMember, expertise: e.target.value})} />
                       </div>

                       <div>
                          <label className="text-[10px] uppercase font-bold text-gray-500 mb-2 block tracking-widest">Biography (HTML Support)</label>
                          <ReactQuill 
                            theme="snow"
                            value={editingMember.bio || ''}
                            onChange={(val) => setEditingMember({...editingMember, bio: val})}
                            modules={quillModules}
                            className="bg-white border-gray-300 rounded-[2rem] overflow-hidden"
                            placeholder="Provide a professional summary..."
                          />
                       </div>
                    </div>
                 </div>
              </div>

              <div className="p-10 border-t border-gray-200 flex justify-end gap-6 bg-gray-50">
                 <button onClick={() => setIsModalOpen(false)} className="px-10 py-4 text-gray-500 hover:text-gray-900 font-bold text-xs uppercase tracking-widest">CANCEL</button>
                 <button onClick={handleSave} className="bg-agri-secondary text-white px-16 py-4 rounded-[2rem] font-bold flex items-center gap-3 shadow-lg hover:bg-agri-primary transition-transform active:scale-95">
                    <Save size={20} /> SAVE SCHOLAR
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default EditorialBoardManagement;
