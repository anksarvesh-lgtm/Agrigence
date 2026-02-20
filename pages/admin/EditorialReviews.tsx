
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../App';
import { mockBackend } from '../../services/mockBackend';
import { Article, ReviewMessage } from '../../types';
import { FileText, MessageCircle, CheckCircle, Clock, Eye, Send, ArrowLeft, User } from 'lucide-react';
import { useConfirm } from '../../components/ContextualConfirm';

const EditorialReviews: React.FC = () => {
  const { user } = useAuth();
  const [assignedArticles, setAssignedArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const { confirm } = useConfirm();

  useEffect(() => {
    loadAssignments();
  }, [user]);

  const loadAssignments = async () => {
    if(!user) return;
    setLoading(true);
    const allArticles = await mockBackend.getArticles();
    
    // Filter articles assigned to this user
    const myAssignments = allArticles.filter(a => 
        a.reviewAssignments?.some(ra => ra.reviewerId === user.id)
    );
    
    setAssignedArticles(myAssignments);
    setLoading(false);
  };

  const handleSendMessage = async () => {
      if(!selectedArticle || !newMessage.trim() || !user) return;
      
      const msg = {
          senderId: user.id,
          senderName: user.name,
          senderRole: user.role,
          message: newMessage,
          type: 'SUGGESTION' as const
      };

      await mockBackend.addReviewMessage(selectedArticle.id, msg);
      setNewMessage('');
      
      // Refresh local state
      const updatedList = await mockBackend.getArticles();
      const updatedArticle = updatedList.find(a => a.id === selectedArticle.id);
      if(updatedArticle) setSelectedArticle(updatedArticle);
  };

  const handleMarkReviewed = async (e: React.MouseEvent) => {
      if(!selectedArticle || !user) return;
      
      const isConfirmed = await confirm({
          message: "Mark this assignment as reviewed? Admin will be notified.",
          trigger: e.currentTarget
      });

      if(isConfirmed) {
          await mockBackend.updateReviewStatus(selectedArticle.id, user.id, 'REVIEWED');
          loadAssignments(); // Refresh list to update status display
          
          // Re-fetch selected to show updated status immediately
          const updatedList = await mockBackend.getArticles();
          const updatedArticle = updatedList.find(a => a.id === selectedArticle.id);
          if(updatedArticle) setSelectedArticle(updatedArticle);
      }
  };

  if(loading) return <div className="text-center p-20 text-white/30">Loading assignments...</div>;

  // Detail View
  if(selectedArticle) {
      const myAssignment = selectedArticle.reviewAssignments?.find(a => a.reviewerId === user?.id);
      
      return (
          <div className="h-[85vh] flex flex-col">
              <div className="flex items-center justify-between mb-6">
                  <button onClick={() => setSelectedArticle(null)} className="flex items-center gap-2 text-white/50 hover:text-white font-bold text-xs uppercase tracking-widest">
                      <ArrowLeft size={14} /> Back to List
                  </button>
                  <div className="flex gap-3">
                      <span className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest border ${myAssignment?.status === 'REVIEWED' ? 'bg-green-500/20 text-green-400 border-green-500/20' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20'}`}>
                          Status: {myAssignment?.status}
                      </span>
                      {myAssignment?.status !== 'REVIEWED' && (
                          <button onClick={handleMarkReviewed} className="bg-agri-secondary text-agri-primary px-4 py-1 rounded font-bold text-[10px] uppercase tracking-widest hover:bg-white transition-colors">
                              Mark Reviewed
                          </button>
                      )}
                  </div>
              </div>

              <div className="flex-1 grid lg:grid-cols-3 gap-8 min-h-0">
                  {/* Article Content (Read Only) */}
                  <div className="lg:col-span-2 bg-white rounded-2xl overflow-hidden flex flex-col shadow-2xl">
                      <div className="p-6 border-b border-stone-100 bg-stone-50">
                          <h2 className="text-xl font-serif font-bold text-agri-primary">{selectedArticle.title}</h2>
                          <p className="text-xs text-stone-500 mt-1">Author: {selectedArticle.authorName}</p>
                      </div>
                      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-stone-50">
                          <div 
                            className="prose prose-stone max-w-none font-serif text-sm leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: selectedArticle.content || '<p class="italic text-stone-400">No text content. Please review attached file.</p>' }} 
                          />
                          {selectedArticle.fileUrl && selectedArticle.fileUrl !== '#' && (
                              <div className="mt-8 p-4 bg-white border border-stone-200 rounded-xl text-center">
                                  <p className="text-xs text-stone-500 mb-3">Original Manuscript File</p>
                                  <a href={selectedArticle.fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-stone-800 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-stone-600">
                                      <FileText size={14} /> View PDF/DOCX
                                  </a>
                              </div>
                          )}
                      </div>
                  </div>

                  {/* Suggestion Panel */}
                  <div className="bg-[#1C2A22] rounded-2xl border border-white/10 flex flex-col shadow-2xl">
                      <div className="p-4 border-b border-white/5 bg-black/20">
                          <h3 className="text-white font-bold text-sm flex items-center gap-2"><MessageCircle size={16} className="text-agri-secondary"/> Suggestion Thread</h3>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                          {selectedArticle.reviewThreads?.map((msg) => (
                              <div key={msg.id} className={`p-3 rounded-xl border text-xs ${msg.senderId === user?.id ? 'bg-agri-secondary/10 border-agri-secondary/20 ml-4' : 'bg-white/5 border-white/5 mr-4'}`}>
                                  <div className="flex justify-between items-center mb-1 opacity-50">
                                      <span className="font-bold text-[10px] uppercase">{msg.senderName} ({msg.senderRole})</span>
                                      <span className="text-[9px]">{new Date(msg.timestamp).toLocaleDateString()}</span>
                                  </div>
                                  <p className="text-white/80 leading-relaxed">{msg.message}</p>
                              </div>
                          ))}
                          {!selectedArticle.reviewThreads?.length && (
                              <div className="text-center text-white/20 italic text-xs mt-10">No suggestions yet. Start the discussion.</div>
                          )}
                      </div>

                      <div className="p-4 border-t border-white/5 bg-black/20">
                          <textarea 
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs outline-none focus:border-agri-secondary h-20 resize-none mb-2"
                            placeholder="Type suggestion for author..."
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                          ></textarea>
                          <button 
                            onClick={handleSendMessage}
                            disabled={!newMessage.trim()}
                            className="w-full bg-agri-secondary text-agri-primary py-2 rounded-lg font-bold text-xs uppercase tracking-widest disabled:opacity-50 hover:bg-white transition-colors"
                          >
                              Send Feedback
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  // List View
  return (
    <div className="space-y-8">
      <div className="bg-white/5 border border-white/5 rounded-3xl p-8 flex items-center justify-between">
         <div>
            <h1 className="text-2xl font-bold text-white">My Assigned Reviews</h1>
            <p className="text-white/40 text-xs mt-1 uppercase tracking-widest font-bold">Pending Evaluations: {assignedArticles.filter(a => a.reviewAssignments?.find(ra => ra.reviewerId === user?.id)?.status !== 'REVIEWED').length}</p>
         </div>
      </div>

      <div className="grid gap-4">
         {assignedArticles.map(art => {
             const assignment = art.reviewAssignments?.find(ra => ra.reviewerId === user?.id);
             return (
                 <div key={art.id} className="bg-white/5 border border-white/5 p-6 rounded-2xl flex items-center justify-between hover:bg-white/10 transition-colors group cursor-pointer" onClick={() => setSelectedArticle(art)}>
                     <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-white/20 group-hover:text-agri-secondary transition-colors">
                             <FileText size={24} />
                         </div>
                         <div>
                             <h3 className="text-white font-bold text-lg">{art.title}</h3>
                             <p className="text-white/40 text-xs mt-0.5 flex items-center gap-3">
                                 <span>{art.authorName}</span>
                                 <span className="w-1 h-1 rounded-full bg-white/20"></span>
                                 <span>Assigned: {new Date(assignment?.assignedAt || '').toLocaleDateString()}</span>
                             </p>
                         </div>
                     </div>
                     <div className="flex items-center gap-4">
                         <span className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest border ${assignment?.status === 'REVIEWED' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                             {assignment?.status.replace('_', ' ')}
                         </span>
                         <div className="p-2 bg-white/5 rounded-lg text-white/40 group-hover:text-white transition-colors">
                             <Eye size={18} />
                         </div>
                     </div>
                 </div>
             );
         })}
         {assignedArticles.length === 0 && (
             <div className="text-center py-20 text-white/20 italic border border-white/5 rounded-3xl border-dashed">
                 No articles assigned for review.
             </div>
         )}
      </div>
    </div>
  );
};

export default EditorialReviews;
