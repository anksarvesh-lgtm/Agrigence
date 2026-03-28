
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../App';
import { mockBackend } from '../../services/mockBackend';
import { getMetaFile, updateMetaStatus, deleteMetaFile, SubmissionMeta } from '../submission-tracking/meta-handler';
import { Download, Eye, Search, Filter, FileText, Check, X, AlertCircle, Loader2, Save, Trash2, UserPlus, ShieldAlert, Activity, ArrowRight, CornerUpRight, RotateCcw } from 'lucide-react';
import { sendNotification } from '../notifications/service';
import { User, Article, PlagiarismReport, ReviewStatus } from '../../types';
import { useConfirm } from '../../components/ContextualConfirm';

interface CombinedSubmission {
  articleId: string;
  title: string;
  fileUrl: string;
  submittedAt: string;
  authorName: string;
  authorEmail: string;
  status: SubmissionMeta['status'];
  review_status?: ReviewStatus;
  remarks: string;
  assignedReviewers: string[]; // IDs
  plagiarismReport?: PlagiarismReport; // Added
}

const SubmissionAdminPanel: React.FC = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<CombinedSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const { confirm } = useConfirm();
  
  // Editing State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempStatus, setTempStatus] = useState<SubmissionMeta['status']>('Pending');
  const [tempRemarks, setTempRemarks] = useState('');

  // Assignment State
  const [assignmentModalId, setAssignmentModalId] = useState<string | null>(null);
  const [reviewers, setReviewers] = useState<User[]>([]);
  const [selectedReviewer, setSelectedReviewer] = useState('');

  // Forensic Modal State
  const [forensicReport, setForensicReport] = useState<PlagiarismReport | null>(null);

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  useEffect(() => {
    let unsubArticles: (() => void) | null = null;

    const init = async () => {
        const users: User[] = await mockBackend.getUsers();
        const userMap = new Map(users.map(u => [u.id, u]));
        setReviewers(users.filter(u => u.role === 'EDITORIAL_MEMBER'));

        unsubArticles = mockBackend.subscribeToArticles(async (articles) => {
            const combined: CombinedSubmission[] = [];

            for (const art of articles) {
                const meta = await getMetaFile(art);
                const author = userMap.get(art.authorId);
                const assignments = art.reviewAssignments?.map(a => a.reviewerId) || [];
                
                let displayStatus: SubmissionMeta['status'] = 'Pending';
                const rawStatus = art.status || (meta ? meta.status : 'Pending');
                if (rawStatus.toUpperCase() === 'PENDING') displayStatus = 'Pending';
                else if (rawStatus.toUpperCase() === 'APPROVED') displayStatus = 'Approved';
                else if (rawStatus.toUpperCase() === 'REJECTED') displayStatus = 'Rejected';
                else if (rawStatus.toUpperCase() === 'PUBLISHED') displayStatus = 'Published';
                else if (rawStatus.toUpperCase() === 'UNDER REVIEW') displayStatus = 'Under Review';
                else displayStatus = rawStatus as any;

                combined.push({
                    articleId: art.id,
                    title: art.title,
                    fileUrl: art.fileUrl || '#',
                    submittedAt: art.submissionDate,
                    authorName: art.authorName,
                    authorEmail: author?.email || 'Unknown Source',
                    status: displayStatus, 
                    review_status: art.review_status,
                    remarks: meta ? meta.remarks : '',
                    assignedReviewers: assignments,
                    plagiarismReport: art.plagiarismReport
                });
            }
            
            combined.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
            setSubmissions(combined);
            setLoading(false);
        });
    };

    init();

    return () => {
        if (unsubArticles) unsubArticles();
    };
  }, []);

  const loadData = async () => {
    // This is now handled by the real-time subscription in useEffect
  };

  const handleStatusUpdate = async (id: string) => {
     const sub = submissions.find(s => s.articleId === id);
     await updateMetaStatus(id, tempStatus, tempRemarks);
     
     // Sync BOTH status and workflow status to Firestore
     await mockBackend.updateArticleStatus(id, tempStatus as any);

     if (tempStatus === 'Approved') {
         await mockBackend.updateWorkflowStatus(id, 'admin_verified');
     } else if (tempStatus === 'Published') {
         await mockBackend.updateWorkflowStatus(id, 'published');
     } else if (tempStatus === 'Rejected') {
         await mockBackend.updateWorkflowStatus(id, 'rejected');
     }

     if (sub) {
        sendNotification('STATUS_UPDATE', {
            email: sub.authorEmail,
            title: sub.title,
            status: tempStatus,
            remarks: tempRemarks
        });
     }

     setEditingId(null);
  };

  // State Transition Handlers
  const handleWorkflowTransition = async (id: string, newStatus: ReviewStatus) => {
      await mockBackend.updateWorkflowStatus(id, newStatus);
  };

  const handleAssignReviewer = async () => {
      if(!assignmentModalId || !selectedReviewer || !user) return;
      try {
          await mockBackend.assignReviewer(assignmentModalId, selectedReviewer, user.id);
          alert("Reviewer Assigned Successfully.");
          setAssignmentModalId(null);
          setSelectedReviewer('');
      } catch(e: any) {
          alert("Assignment Failed.");
          console.error(e.message || e);
      }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    if (!isSuperAdmin) return alert("Access Denied");
    const isConfirmed = await confirm({
        message: 'PERMANENT ACTION: Delete submission record?',
        trigger: e.currentTarget
    });
    if (isConfirmed) {
      try {
        await mockBackend.deleteSubmissionPermanent(id);
        deleteMetaFile(id); 
        setSubmissions(prev => prev.filter(sub => sub.articleId !== id));
      } catch (error) {
        alert("Failed to delete.");
      }
    }
  };

  const startEdit = (sub: CombinedSubmission) => {
     setEditingId(sub.articleId);
     setTempStatus(sub.status);
     setTempRemarks(sub.remarks);
  };

  const filtered = submissions.filter(sub => {
     const matchesStatus = filterStatus === 'ALL' || sub.status === filterStatus;
     const matchesSearch = sub.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           sub.authorEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           sub.authorName.toLowerCase().includes(searchTerm.toLowerCase());
     return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 bg-white p-8 rounded-[2.5rem] border border-stone-200 shadow-sm">
        <div>
           <h1 className="text-3xl font-serif font-bold text-black">Submission Manager</h1>
           <p className="text-stone-500 text-xs mt-2 uppercase tracking-widest font-bold flex items-center gap-2">
             <FileText size={12}/> Global Repository View
           </p>
        </div>
        <div className="flex items-center gap-4">
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-agri-secondary transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Search email, title..." 
                className="bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-4 py-3 text-black text-xs outline-none focus:border-agri-secondary focus:ring-1 focus:ring-agri-secondary w-64 transition-all"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
           </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
         {['ALL', 'Pending', 'Under Review', 'Approved', 'Published', 'Rejected'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                filterStatus === status ? 'bg-agri-secondary text-white border-agri-secondary' : 'bg-white text-stone-500 border-stone-200'
              }`}
            >
               {status}
            </button>
         ))}
      </div>

      <div className="bg-white border border-stone-200 rounded-[2.5rem] overflow-hidden shadow-sm">
         {loading ? (
            <div className="p-20 text-center text-stone-400 flex flex-col items-center gap-4">
               <Loader2 className="animate-spin" size={32} />
               <span className="text-xs font-bold uppercase tracking-widest">Indexing Storage...</span>
            </div>
         ) : (
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead className="bg-stone-50 text-stone-500 text-[9px] font-black uppercase tracking-[0.2em]">
                     <tr>
                        <th className="p-6">Submission</th>
                        <th className="p-6">Integrity Audit</th>
                        <th className="p-6">Workflow Status</th>
                        <th className="p-6 text-right">Controls</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-sm">
                     {filtered.map(sub => (
                        <tr key={sub.articleId} className="hover:bg-stone-50 transition-colors group">
                           <td className="p-6">
                              <p className="font-bold text-black text-base mb-1">{sub.title}</p>
                              <p className="text-xs text-stone-500 mb-1">{sub.authorName} ({sub.authorEmail})</p>
                              <span className="bg-stone-100 px-2 py-0.5 rounded text-[10px] font-mono text-stone-400">{new Date(sub.submittedAt).toLocaleDateString()}</span>
                           </td>
                           <td className="p-6">
                              {sub.plagiarismReport?.audit_status === 'COMPLETED' ? (
                                  <div className="space-y-2">
                                      <div className="flex items-center gap-4 text-xs font-bold">
                                          <span className={sub.plagiarismReport.ai_generated_score < 40 ? "text-green-600" : "text-red-600"}>
                                              AI: {sub.plagiarismReport.ai_generated_score}%
                                          </span>
                                          <span className="w-px h-3 bg-stone-300"></span>
                                          <span className={sub.plagiarismReport.plagiarism_score < 15 ? "text-green-600" : "text-red-600"}>
                                              Plag: {sub.plagiarismReport.plagiarism_score}%
                                          </span>
                                      </div>
                                      {isSuperAdmin && (
                                          <button 
                                            onClick={() => setForensicReport(sub.plagiarismReport!)}
                                            className="text-[9px] font-black uppercase text-agri-secondary hover:underline flex items-center gap-1"
                                          >
                                              <ShieldAlert size={10}/> View Forensic Report
                                          </button>
                                      )}
                                  </div>
                              ) : (
                                  <div className="flex items-center gap-2 text-stone-400 text-xs">
                                      <Loader2 size={12} className="animate-spin" /> Audit Pending
                                  </div>
                              )}
                           </td>
                           <td className="p-6">
                              {/* Workflow State Indicator */}
                              <div className="flex flex-col gap-2">
                                <span className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest w-fit border
                                    ${sub.review_status === 'review_completed' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' :
                                      sub.review_status === 'admin_verified' ? 'bg-teal-50 text-teal-600 border-teal-200' :
                                      sub.review_status === 'published' ? 'bg-green-50 text-green-600 border-green-200' :
                                      'bg-stone-100 text-stone-500 border-stone-200'
                                    }`}>
                                    {sub.review_status?.replace(/_/g, ' ') || 'SUBMITTED'}
                                </span>
                                
                                {/* Quick Transitions */}
                                {sub.review_status === 'review_completed' && (
                                    <div className="flex gap-2">
                                        <button onClick={() => handleWorkflowTransition(sub.articleId, 'revision_requested')} className="text-[9px] font-bold text-orange-500 hover:underline flex items-center gap-1"><RotateCcw size={10}/> Request Revision</button>
                                        <button onClick={() => handleWorkflowTransition(sub.articleId, 'admin_verified')} className="text-[9px] font-bold text-teal-600 hover:underline flex items-center gap-1"><Check size={10}/> Verify Review</button>
                                    </div>
                                )}
                                {isSuperAdmin && sub.review_status === 'admin_verified' && (
                                    <div className="flex gap-2">
                                        <button onClick={() => handleStatusUpdate(sub.articleId)} className="text-[9px] font-bold text-agri-secondary hover:underline flex items-center gap-1"><CornerUpRight size={10}/> Finalize</button>
                                    </div>
                                )}
                              </div>
                           </td>
                           <td className="p-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                 {/* Assign Reviewer */}
                                 {sub.review_status !== 'published' && sub.review_status !== 'rejected' && (
                                     <button onClick={() => setAssignmentModalId(sub.articleId)} className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-all" title="Assign Reviewer"><UserPlus size={18} /></button>
                                 )}
                                 
                                 {/* Edit/View */}
                                 <button onClick={() => window.open(sub.fileUrl, '_blank')} className="p-2 hover:bg-stone-100 text-stone-600 rounded-lg transition-all" title="View Document"><Eye size={18} /></button>
                                 
                                 {/* Manual Override (Admin) */}
                                 <button onClick={() => startEdit(sub)} className="p-2 hover:bg-stone-100 text-stone-600 rounded-lg transition-all" title="Override Status"><AlertCircle size={18}/></button>

                                 {/* Delete (SuperAdmin) */}
                                 {isSuperAdmin && <button onClick={(e) => handleDelete(sub.articleId, e)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-all" title="Delete"><Trash2 size={18} /></button>}
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         )}
      </div>

      {/* Forensic Report Modal */}
      {forensicReport && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[70] flex items-center justify-center p-6">
              <div className="bg-white w-full max-w-3xl rounded-[2rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                  <div className="p-8 bg-stone-50 border-b border-stone-200 flex justify-between items-center">
                      <div>
                          <h3 className="text-xl font-serif font-bold text-black flex items-center gap-2">
                              <ShieldAlert className="text-red-500" /> Forensic AI Audit Report
                          </h3>
                          <p className="text-xs text-stone-500 mt-1 uppercase tracking-widest font-bold">Generated: {new Date(forensicReport.generatedAt).toLocaleString()}</p>
                      </div>
                      <button onClick={() => setForensicReport(null)} className="p-2 hover:bg-stone-200 rounded-full"><X size={20}/></button>
                  </div>
                  
                  <div className="p-8 overflow-y-auto custom-scrollbar space-y-8">
                      {/* Score Cards */}
                      <div className="grid grid-cols-2 gap-6">
                          <div className={`p-6 rounded-2xl border text-center ${forensicReport.ai_generated_score > 50 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                              <Activity size={32} className={`mx-auto mb-2 ${forensicReport.ai_generated_score > 50 ? 'text-red-500' : 'text-green-500'}`} />
                              <p className="text-4xl font-black text-black mb-1">{forensicReport.ai_generated_score}%</p>
                              <p className="text-[10px] uppercase font-bold text-stone-500 tracking-widest">AI Probability</p>
                          </div>
                          <div className={`p-6 rounded-2xl border text-center ${forensicReport.plagiarism_score > 20 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                              <FileText size={32} className={`mx-auto mb-2 ${forensicReport.plagiarism_score > 20 ? 'text-red-500' : 'text-green-500'}`} />
                              <p className="text-4xl font-black text-black mb-1">{forensicReport.plagiarism_score}%</p>
                              <p className="text-[10px] uppercase font-bold text-stone-500 tracking-widest">Plagiarism Match</p>
                          </div>
                      </div>

                      {/* Summary */}
                      <div>
                          <h4 className="text-xs font-black uppercase text-stone-400 tracking-widest mb-3">Executive Summary</h4>
                          <p className="text-sm leading-relaxed text-stone-700 bg-stone-50 p-6 rounded-2xl border border-stone-200 italic">
                              "{forensicReport.summary}"
                          </p>
                      </div>

                      {/* Flagged Segments */}
                      <div>
                          <h4 className="text-xs font-black uppercase text-stone-400 tracking-widest mb-3">Flagged Content Segments</h4>
                          <div className="space-y-4">
                              {forensicReport.flagged_sections.map((seg, i) => (
                                  <div key={i} className="p-4 border-l-4 border-red-400 bg-red-50/50 rounded-r-xl">
                                      <p className="text-[10px] font-bold text-red-600 uppercase mb-2">{seg.reason}</p>
                                      <p className="text-xs text-stone-600 font-mono">"{seg.text}"</p>
                                  </div>
                              ))}
                              {forensicReport.flagged_sections.length === 0 && (
                                  <p className="text-sm text-stone-400 italic">No specific segments flagged as high risk.</p>
                              )}
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Manual Edit Modal */}
      {editingId && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-3xl border border-agri-secondary shadow-2xl space-y-4 w-full max-w-sm">
               <h3 className="text-lg font-bold text-black">Override Status</h3>
               <select 
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-black text-sm outline-none"
                  value={tempStatus}
                  onChange={e => setTempStatus(e.target.value as any)}
               >
                  <option value="Pending">Pending</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Approved">Approved</option>
                  {isSuperAdmin && <option value="Published">Published</option>}
                  <option value="Rejected">Rejected</option>
               </select>
               <textarea 
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-black text-sm outline-none h-24"
                  placeholder="Enter remarks..."
                  value={tempRemarks}
                  onChange={e => setTempRemarks(e.target.value)}
               ></textarea>
               <div className="flex justify-end gap-2">
                  <button onClick={() => setEditingId(null)} className="px-4 py-2 text-stone-500 font-bold text-xs uppercase">Cancel</button>
                  <button onClick={() => handleStatusUpdate(editingId)} className="bg-agri-secondary text-white px-6 py-2 rounded-xl font-bold text-xs uppercase">Save</button>
               </div>
            </div>
         </div>
      )}

      {/* Assignment Modal (Existing) */}
      {assignmentModalId && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white border border-stone-200 rounded-2xl w-full max-w-md shadow-2xl p-6">
                  <h3 className="text-black font-bold text-lg mb-4">Assign Reviewer</h3>
                  <select 
                    className="w-full bg-white border border-stone-300 rounded-xl p-3 text-black outline-none"
                    value={selectedReviewer}
                    onChange={e => setSelectedReviewer(e.target.value)}
                  >
                      <option value="">Select Editorial Member</option>
                      {reviewers.map(r => (
                          <option key={r.id} value={r.id}>{r.name} ({r.editorialRole})</option>
                      ))}
                  </select>
                  <div className="flex justify-end gap-3 mt-4">
                      <button onClick={() => setAssignmentModalId(null)} className="px-4 py-2 text-stone-500 font-bold text-xs uppercase">Cancel</button>
                      <button onClick={handleAssignReviewer} className="bg-agri-secondary text-white px-6 py-2 rounded-xl font-bold text-xs uppercase">Confirm</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default SubmissionAdminPanel;
