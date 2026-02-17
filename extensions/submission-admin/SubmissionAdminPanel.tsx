
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../App';
import { mockBackend } from '../../services/mockBackend';
import { getMetaFile, updateMetaStatus, deleteMetaFile, SubmissionMeta } from '../submission-tracking/meta-handler';
import { Download, Eye, Search, Filter, FileText, Check, X, AlertCircle, Loader2, Save, Trash2 } from 'lucide-react';
import { sendNotification } from '../notifications/service';

interface CombinedSubmission {
  articleId: string;
  title: string;
  fileUrl: string;
  submittedAt: string;
  authorName: string;
  authorEmail: string;
  status: SubmissionMeta['status'];
  remarks: string;
}

const SubmissionAdminPanel: React.FC = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<CombinedSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Editing State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempStatus, setTempStatus] = useState<SubmissionMeta['status']>('Pending');
  const [tempRemarks, setTempRemarks] = useState('');

  useEffect(() => {
    const loadData = async () => {
      // 1. Fetch Registry Data (Articles)
      const articles = await mockBackend.getArticles();
      
      // 2. Fetch User Directory for Email mapping
      const users = await mockBackend.getUsers();
      const userMap = new Map(users.map(u => [u.id, u]));

      const combined: CombinedSubmission[] = [];

      // 3. Aggregate Data
      for (const art of articles) {
        // Read Sidecar Metadata
        const meta = await getMetaFile(art);
        const author = userMap.get(art.authorId);
        
        combined.push({
          articleId: art.id,
          title: art.title,
          fileUrl: art.fileUrl || '#',
          submittedAt: art.submissionDate,
          authorName: art.authorName,
          authorEmail: author?.email || 'Unknown Source',
          status: meta ? meta.status : 'Pending', // Fallback to 'Pending' if meta missing
          remarks: meta ? meta.remarks : ''
        });
      }
      
      // Sort by date descending
      combined.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      setSubmissions(combined);
      setLoading(false);
    };

    loadData();
  }, []);

  const handleStatusUpdate = async (id: string) => {
     // Write to Sidecar File only
     await updateMetaStatus(id, tempStatus, tempRemarks);
     
     // Reflect in UI immediately
     setSubmissions(prev => prev.map(sub => {
        if (sub.articleId === id) {
            // --- NOTIFICATION HOOK ---
            // Send email to author about the update
            sendNotification('STATUS_UPDATE', {
                email: sub.authorEmail,
                title: sub.title,
                status: tempStatus,
                remarks: tempRemarks
            });
            // -------------------------
            return { ...sub, status: tempStatus, remarks: tempRemarks };
        }
        return sub;
     }));
     setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('PERMANENT ACTION: Are you sure you want to delete this submission? This removes the file and record permanently.')) {
      try {
        await mockBackend.deleteSubmissionPermanent(id);
        deleteMetaFile(id); // Clear local metadata sidecar
        setSubmissions(prev => prev.filter(sub => sub.articleId !== id));
      } catch (error) {
        console.error("Delete failed", error);
        alert("Failed to delete submission.");
      }
    }
  };

  const startEdit = (sub: CombinedSubmission) => {
     setEditingId(sub.articleId);
     setTempStatus(sub.status);
     setTempRemarks(sub.remarks);
  };

  // Filter Logic
  const filtered = submissions.filter(sub => {
     const matchesStatus = filterStatus === 'ALL' || sub.status === filterStatus;
     const matchesSearch = sub.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           sub.authorEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           sub.authorName.toLowerCase().includes(searchTerm.toLowerCase());
     return matchesStatus && matchesSearch;
  });

  // Security Gate
  if (!user || (user.email !== 'agrigence@gmail.com' && user.role !== 'SUPER_ADMIN')) {
     return (
       <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8">
          <div className="bg-red-500/10 p-6 rounded-full mb-4 text-red-500 border border-red-500/20">
            <AlertCircle size={48} />
          </div>
          <h2 className="text-2xl font-serif font-bold text-white mb-2">Restricted Access Node</h2>
          <p className="text-white/50 max-w-md">This administration panel is strictly limited to the Super Admin protocol. Your access level does not meet the requirement.</p>
       </div>
     );
  }

  return (
    <div className="space-y-8 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 bg-white/5 p-8 rounded-[2.5rem] border border-white/5">
        <div>
           <h1 className="text-3xl font-serif font-bold text-white">Submission Manager</h1>
           <p className="text-white/40 text-xs mt-2 uppercase tracking-widest font-bold flex items-center gap-2">
             <FileText size={12}/> Global Repository View
           </p>
        </div>
        <div className="flex items-center gap-4">
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-agri-secondary transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Search email, title..." 
                className="bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-xs outline-none focus:border-agri-secondary w-64 transition-all"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
           </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
         {['ALL', 'Pending', 'Under Review', 'Approved', 'Published', 'Rejected'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                filterStatus === status 
                  ? 'bg-agri-secondary text-agri-primary border-agri-secondary' 
                  : 'bg-white/5 text-white/40 border-white/5 hover:text-white'
              }`}
            >
               {status}
            </button>
         ))}
      </div>

      {/* Table */}
      <div className="bg-white/5 border border-white/5 rounded-[2.5rem] overflow-hidden">
         {loading ? (
            <div className="p-20 text-center text-white/30 flex flex-col items-center gap-4">
               <Loader2 className="animate-spin" size={32} />
               <span className="text-xs font-bold uppercase tracking-widest">Indexing Storage...</span>
            </div>
         ) : (
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead className="bg-black/20 text-white/30 text-[9px] font-black uppercase tracking-[0.2em]">
                     <tr>
                        <th className="p-6">Submission Details</th>
                        <th className="p-6">Author Node</th>
                        <th className="p-6">Status Protocol</th>
                        <th className="p-6 text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                     {filtered.map(sub => (
                        <tr key={sub.articleId} className="hover:bg-white/5 transition-colors group">
                           <td className="p-6">
                              <p className="font-bold text-white text-base mb-1">{sub.title}</p>
                              <div className="flex items-center gap-3 text-white/40 text-xs">
                                 <span className="bg-white/10 px-2 py-0.5 rounded text-[10px] font-mono">{new Date(sub.submittedAt).toLocaleDateString()}</span>
                                 <span className="truncate max-w-[200px]">{sub.articleId}</span>
                              </div>
                           </td>
                           <td className="p-6">
                              <div className="flex flex-col">
                                 <span className="text-white font-bold">{sub.authorName}</span>
                                 <span className="text-agri-secondary text-xs">{sub.authorEmail}</span>
                              </div>
                           </td>
                           <td className="p-6">
                              {editingId === sub.articleId ? (
                                 <div className="bg-black/40 p-4 rounded-xl border border-agri-secondary/30 space-y-3 min-w-[200px]">
                                    <select 
                                       className="w-full bg-white/10 border border-white/10 rounded-lg p-2 text-white text-xs outline-none focus:border-agri-secondary"
                                       value={tempStatus}
                                       onChange={e => setTempStatus(e.target.value as any)}
                                    >
                                       <option className="bg-stone-900" value="Pending">Pending</option>
                                       <option className="bg-stone-900" value="Under Review">Under Review</option>
                                       <option className="bg-stone-900" value="Approved">Approved</option>
                                       <option className="bg-stone-900" value="Published">Published</option>
                                       <option className="bg-stone-900" value="Rejected">Rejected</option>
                                    </select>
                                    <input 
                                       className="w-full bg-white/10 border border-white/10 rounded-lg p-2 text-white text-xs outline-none focus:border-agri-secondary"
                                       placeholder="Reviewer remarks..."
                                       value={tempRemarks}
                                       onChange={e => setTempRemarks(e.target.value)}
                                    />
                                    <div className="flex justify-end gap-2">
                                       <button onClick={() => setEditingId(null)} className="p-1.5 text-white/40 hover:text-white"><X size={14}/></button>
                                       <button onClick={() => handleStatusUpdate(sub.articleId)} className="p-1.5 bg-agri-secondary text-agri-primary rounded hover:bg-white"><Check size={14}/></button>
                                    </div>
                                 </div>
                              ) : (
                                 <div onClick={() => startEdit(sub)} className="cursor-pointer group/status">
                                    <span className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                                       sub.status === 'Approved' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                       sub.status === 'Published' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                       sub.status === 'Rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                       'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                    }`}>
                                       {sub.status}
                                    </span>
                                    {sub.remarks && <p className="text-white/30 text-xs mt-2 line-clamp-1 italic">"{sub.remarks}"</p>}
                                    <p className="text-agri-secondary text-[9px] mt-1 opacity-0 group-hover/status:opacity-100 transition-opacity uppercase font-bold">Click to Edit</p>
                                 </div>
                              )}
                           </td>
                           <td className="p-6 text-right">
                              <div className="flex items-center justify-end gap-3">
                                 <button 
                                    onClick={() => window.open(sub.fileUrl, '_blank')}
                                    className="p-3 bg-white/5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all border border-white/5"
                                    title="View Document"
                                 >
                                    <Eye size={18} />
                                 </button>
                                 <a 
                                    href={sub.fileUrl} 
                                    download={`${sub.title}.docx`}
                                    className="p-3 bg-agri-secondary text-agri-primary rounded-xl hover:bg-white transition-all shadow-lg hover:scale-105"
                                    title="Download File"
                                 >
                                    <Download size={18} />
                                 </a>
                                 <button 
                                    onClick={() => handleDelete(sub.articleId)}
                                    className="p-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all border border-red-500/10"
                                    title="Delete Submission"
                                 >
                                    <Trash2 size={18} />
                                 </button>
                              </div>
                           </td>
                        </tr>
                     ))}
                     {filtered.length === 0 && (
                        <tr>
                           <td colSpan={4} className="p-20 text-center text-white/20 italic">No submissions matching criteria.</td>
                        </tr>
                     )}
                  </tbody>
               </table>
            </div>
         )}
      </div>
    </div>
  );
};

export default SubmissionAdminPanel;
