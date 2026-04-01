
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../App';
import { mockBackend } from '../services/mockBackend';
import { Article, ReviewMessage, Review, Recommendation } from '../types';
import { FileText, MessageCircle, CheckCircle, Clock, Eye, Send, ArrowLeft, ShieldAlert, Activity, Download, User, PlayCircle, X } from 'lucide-react';
import { useConfirm } from '../components/ContextualConfirm';

const ReviewerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [assignedArticles, setAssignedArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'protocol' | 'evaluation'>('evaluation');
  const [reviewDraft, setReviewDraft] = useState<Partial<Review>>({
    commentsToAuthor: '',
    commentsToEditor: '',
    recommendation: null
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const { confirm } = useConfirm();

  useEffect(() => {
    loadAssignments();
  }, [user]);

  useEffect(() => {
    if (selectedArticle && user) {
      loadReviewDraft();
    }
  }, [selectedArticle]);

  // Debounced Autosave
  useEffect(() => {
    if (!selectedArticle || !user || !reviewDraft || saveStatus === 'saving') return;
    
    // Don't save if it's the initial empty state and no draft exists yet
    if (!reviewDraft.commentsToAuthor && !reviewDraft.commentsToEditor && !reviewDraft.recommendation && saveStatus === 'idle') return;

    const timer = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        await mockBackend.saveReviewDraft({
          ...reviewDraft,
          manuscriptId: selectedArticle.id,
          reviewerId: user.id
        });
        setSaveStatus('saved');
        setLastSaved(new Date().toISOString());
      } catch (err: any) {
        console.error(err.message || err);
        setSaveStatus('error');
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [reviewDraft, selectedArticle, user]);

  const loadReviewDraft = async () => {
    if (!selectedArticle || !user) return;
    const draft = await mockBackend.getReview(selectedArticle.id, user.id);
    if (draft) {
      setReviewDraft({
        commentsToAuthor: draft.commentsToAuthor,
        commentsToEditor: draft.commentsToEditor,
        recommendation: draft.recommendation,
        status: draft.status
      });
      setLastSaved(draft.lastSavedAt);
      setSaveStatus('saved');
    } else {
      setReviewDraft({
        commentsToAuthor: '',
        commentsToEditor: '',
        recommendation: null
      });
      setLastSaved(null);
      setSaveStatus('idle');
    }
  };

  const loadAssignments = async () => {
    if(!user) return;
    setLoading(true);
    const allArticles = await mockBackend.getArticles();
    
    // Filter articles assigned to this user
    // In a real backend, this would be a direct query: assignments.where('reviewerId', '==', user.id)
    const myAssignments = allArticles.filter(a => 
        a.reviewAssignments?.some(ra => ra.reviewerId === user.id)
    );
    
    // Sort by assignment date (newest first)
    myAssignments.sort((a, b) => {
        const assignA = a.reviewAssignments?.find(ra => ra.reviewerId === user.id)?.assignedAt || '';
        const assignB = b.reviewAssignments?.find(ra => ra.reviewerId === user.id)?.assignedAt || '';
        return new Date(assignB).getTime() - new Date(assignA).getTime();
    });
    
    setAssignedArticles(myAssignments);
    setLoading(false);
  };

  const handleSubmitReview = async (e: React.MouseEvent) => {
      if (!selectedArticle || !user || !reviewDraft.recommendation) {
          alert("Please select a recommendation before submitting.");
          return;
      }

      const isConfirmed = await confirm({
        message: "Are you sure you want to submit this review? It will become immutable and visible to the editors.",
        trigger: e.currentTarget
      });

      if (isConfirmed) {
        setLoading(true);
        try {
          const draftId = await mockBackend.saveReviewDraft({
            ...reviewDraft,
            manuscriptId: selectedArticle.id,
            reviewerId: user.id
          });
          await mockBackend.submitReview(draftId);
          
          // Refresh
          await loadAssignments();
          setSelectedArticle(null);
        } catch (err: any) {
          alert("Failed to submit review: " + (err.message || err));
        } finally {
          setLoading(false);
        }
      }
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

  const handleUpdateStatus = async (status: 'REVIEWED' | 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED', e: React.MouseEvent) => {
      if(!selectedArticle || !user) return;
      
      let confirmMsg = "";
      if (status === 'REVIEWED') confirmMsg = "Mark as Reviewed? This indicates you have finished your evaluation.";
      else if (status === 'UNDER_REVIEW') confirmMsg = "Mark as Under Review? This indicates you have started the process.";
      else if (status === 'ACCEPTED') confirmMsg = "Accept this article for review? You will be responsible for reviewing it.";
      else if (status === 'REJECTED') confirmMsg = "Reject this article for review? You will not be reviewing it.";

      const isConfirmed = await confirm({
          message: confirmMsg,
          trigger: e.currentTarget
      });

      if(isConfirmed) {
          // Updates individual assignment status AND potentially article global review_status
          await mockBackend.updateReviewStatus(selectedArticle.id, user.id, status);
          
          // Refresh
          const updatedList = await mockBackend.getArticles();
          const updatedArticle = updatedList.find(a => a.id === selectedArticle.id);
          setAssignedArticles(updatedList.filter(a => a.reviewAssignments?.some(ra => ra.reviewerId === user.id)));
          if(updatedArticle) setSelectedArticle(updatedArticle);
      }
  };

  if(loading) return (
      <div className="flex flex-col items-center justify-center h-64 text-stone-400">
          <div className="animate-spin mb-4 h-8 w-8 border-2 border-agri-secondary border-t-transparent rounded-full"></div>
          <p className="text-xs font-bold uppercase tracking-widest">Loading Assignments...</p>
      </div>
  );

  // Detail View (Review Mode)
  if(selectedArticle) {
      const myAssignment = selectedArticle.reviewAssignments?.find(a => a.reviewerId === user?.id);
      
      return (
          <div className="flex flex-col h-[calc(100vh-140px)]">
              {/* Header / Toolbar */}
              <div className="flex items-center justify-between mb-6 shrink-0">
                  <button onClick={() => setSelectedArticle(null)} className="flex items-center gap-2 text-stone-500 hover:text-agri-primary font-bold text-xs uppercase tracking-widest transition-colors bg-white px-4 py-2 rounded-lg border border-stone-200 shadow-sm">
                      <ArrowLeft size={14} /> Back to List
                  </button>
                  
                  <div className="flex items-center gap-4">
                      {/* Status Indicator */}
                      <div className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border flex items-center gap-2 ${
                          myAssignment?.status === 'REVIEWED' || myAssignment?.status === 'ACCEPTED' ? 'bg-green-50 text-green-600 border-green-200' : 
                          myAssignment?.status === 'UNDER_REVIEW' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                          myAssignment?.status === 'REJECTED' ? 'bg-red-50 text-red-600 border-red-200' :
                          'bg-amber-50 text-amber-600 border-amber-200'
                      }`}>
                          <span className={`w-2 h-2 rounded-full ${
                              myAssignment?.status === 'REVIEWED' || myAssignment?.status === 'ACCEPTED' ? 'bg-green-500' : 
                              myAssignment?.status === 'UNDER_REVIEW' ? 'bg-blue-500' :
                              myAssignment?.status === 'REJECTED' ? 'bg-red-500' :
                              'bg-amber-500'
                          }`}></span>
                          {myAssignment?.status.replace('_', ' ')}
                      </div>

                      {/* Actions */}
                      {myAssignment?.status === 'PENDING' && (
                          <div className="flex items-center gap-2">
                              <button onClick={(e) => handleUpdateStatus('ACCEPTED', e)} className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-green-700 transition-colors shadow-lg shadow-green-200 flex items-center gap-2">
                                  <CheckCircle size={14} /> Accept Review
                              </button>
                              <button onClick={(e) => handleUpdateStatus('REJECTED', e)} className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-red-700 transition-colors shadow-lg shadow-red-200 flex items-center gap-2">
                                  <X size={14} /> Reject Review
                              </button>
                          </div>
                      )}
                      {myAssignment?.status === 'ACCEPTED' && (
                          <button onClick={(e) => handleUpdateStatus('UNDER_REVIEW', e)} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center gap-2">
                              <PlayCircle size={14} /> Start Review
                          </button>
                      )}
                      {(myAssignment?.status === 'UNDER_REVIEW' || myAssignment?.status === 'ACCEPTED') && reviewDraft.status !== 'submitted' && (
                          <button onClick={handleSubmitReview} className="bg-agri-secondary text-white px-6 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-agri-primary transition-colors shadow-lg shadow-agri-secondary/20 flex items-center gap-2">
                              <CheckCircle size={14} /> Submit Evaluation
                          </button>
                      )}
                  </div>
              </div>

              {/* Main Workspace */}
              <div className="flex-1 grid lg:grid-cols-3 gap-6 min-h-0">
                  
                  {/* Left Column: Manuscript Viewer & Info */}
                  <div className="lg:col-span-2 bg-white rounded-[2rem] border border-stone-200 shadow-sm flex flex-col overflow-hidden">
                      {/* Meta Header */}
                      <div className="p-6 border-b border-stone-100 bg-stone-50 flex justify-between items-start">
                          <div>
                              <h2 className="text-xl font-serif font-bold text-agri-primary leading-tight mb-1">{selectedArticle.title}</h2>
                              <p className="text-xs text-stone-500 font-bold uppercase tracking-wide flex items-center gap-2">
                                  <User size={12}/> {selectedArticle.authorName} 
                                  <span className="text-stone-300">|</span> 
                                  <Clock size={12}/> Submitted: {new Date(selectedArticle.submissionDate).toLocaleDateString()}
                              </p>
                          </div>
                          
                          {/* Forensic Badge */}
                          {selectedArticle.plagiarismReport && (
                              <div className="flex flex-col items-end gap-1">
                                  <div className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${selectedArticle.plagiarismReport.ai_generated_score > 50 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                                      <Activity size={12} /> AI Risk: {selectedArticle.plagiarismReport.ai_generated_score}%
                                  </div>
                                  <div className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${selectedArticle.plagiarismReport.plagiarism_score > 20 ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                                      <ShieldAlert size={12} /> Originality Risk: {selectedArticle.plagiarismReport.plagiarism_score}%
                                  </div>
                              </div>
                          )}
                      </div>

                      {/* Content Area */}
                      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white">
                          <div 
                            className="prose prose-stone max-w-none font-serif text-sm leading-relaxed text-stone-600"
                            dangerouslySetInnerHTML={{ __html: selectedArticle.content || '<p class="italic text-stone-400 text-center py-10">No text content available directly. Please review the attached manuscript file.</p>' }} 
                          />
                          
                          {selectedArticle.fileUrl && selectedArticle.fileUrl !== '#' && (
                              <div className="mt-12 p-6 bg-stone-50 border border-stone-200 rounded-2xl flex items-center justify-between">
                                  <div>
                                      <p className="font-bold text-agri-primary text-sm">Full Manuscript File</p>
                                      <p className="text-[10px] text-stone-400 font-black uppercase tracking-widest mt-1">PDF / DOCX Format</p>
                                  </div>
                                  <a 
                                    href={selectedArticle.fileUrl} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="inline-flex items-center gap-2 bg-agri-primary text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-agri-secondary transition-colors shadow-lg"
                                  >
                                      <Download size={14} /> Download Document
                                  </a>
                              </div>
                          )}
                      </div>
                  </div>

                  {/* Right Column: Communication Console & Evaluation Form */}
                  <div className="bg-stone-900 rounded-[2rem] border border-stone-800 flex flex-col shadow-2xl overflow-hidden">
                      <div className="flex border-b border-white/10 bg-black/20">
                          <button 
                            onClick={() => setActiveTab('evaluation')}
                            className={`flex-1 p-4 text-[10px] font-black uppercase tracking-widest transition-colors ${activeTab === 'evaluation' ? 'text-agri-secondary bg-white/5' : 'text-white/40 hover:text-white/60'}`}
                          >
                              Evaluation Form
                          </button>
                          <button 
                            onClick={() => setActiveTab('protocol')}
                            className={`flex-1 p-4 text-[10px] font-black uppercase tracking-widest transition-colors ${activeTab === 'protocol' ? 'text-agri-secondary bg-white/5' : 'text-white/40 hover:text-white/60'}`}
                          >
                              Review Protocol
                          </button>
                      </div>
                      
                      {activeTab === 'protocol' ? (
                        <>
                          <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-stone-900/50">
                              {selectedArticle.reviewThreads?.map((msg) => (
                                  <div key={msg.id} className={`p-4 rounded-2xl text-xs border relative ${msg.senderId === user?.id ? 'bg-agri-secondary/10 border-agri-secondary/20 ml-4' : 'bg-white/5 border-white/5 mr-4'}`}>
                                      <div className="flex justify-between items-center mb-2 opacity-60">
                                          <span className="font-bold text-[9px] uppercase tracking-wider text-agri-secondary">{msg.senderName}</span>
                                          <span className="text-[9px] text-white/40">{new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                      </div>
                                      <p className="text-white/90 leading-relaxed font-medium">{msg.message}</p>
                                  </div>
                              ))}
                              {(!selectedArticle.reviewThreads || selectedArticle.reviewThreads.length === 0) && (
                                  <div className="flex flex-col items-center justify-center h-full text-white/20 space-y-3">
                                      <MessageCircle size={32} />
                                      <p className="text-xs italic">No remarks recorded.</p>
                                  </div>
                              )}
                          </div>

                          <div className="p-5 border-t border-white/10 bg-black/30">
                              <div className="relative">
                                  <textarea 
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-xs outline-none focus:border-agri-secondary/50 h-24 resize-none mb-3 transition-colors placeholder:text-white/20"
                                    placeholder="Type your suggestion, revision note, or acceptance remark..."
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                  ></textarea>
                                  <div className="flex justify-end">
                                    <button 
                                        onClick={handleSendMessage}
                                        disabled={!newMessage.trim()}
                                        className="bg-agri-secondary text-agri-primary px-6 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest disabled:opacity-50 hover:bg-white transition-all shadow-lg flex items-center gap-2"
                                    >
                                        Add Remark <Send size={12} />
                                    </button>
                                  </div>
                              </div>
                          </div>
                        </>
                      ) : (
                        <div className="flex-1 flex flex-col min-h-0 bg-stone-900/50">
                            <div className="p-5 border-b border-white/5 flex items-center justify-between">
                                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Formal Evaluation</span>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[9px] font-bold uppercase tracking-widest ${saveStatus === 'error' ? 'text-red-400' : 'text-white/30'}`}>
                                        {saveStatus === 'saving' ? 'Saving...' : 
                                         saveStatus === 'saved' ? `Saved at ${new Date(lastSaved || '').toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}` : 
                                         saveStatus === 'error' ? 'Save Failed' : ''}
                                    </span>
                                    <div className={`w-1.5 h-1.5 rounded-full ${saveStatus === 'saving' ? 'bg-amber-500 animate-pulse' : saveStatus === 'saved' ? 'bg-green-500' : saveStatus === 'error' ? 'bg-red-500' : 'bg-white/10'}`}></div>
                                </div>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Recommendation</label>
                                    <select 
                                      disabled={reviewDraft.status === 'submitted'}
                                      value={reviewDraft.recommendation || ''}
                                      onChange={e => setReviewDraft({...reviewDraft, recommendation: e.target.value as Recommendation})}
                                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs outline-none focus:border-agri-secondary/50 transition-colors appearance-none font-bold"
                                    >
                                        <option value="" className="bg-stone-900">Select Decision</option>
                                        <option value="A" className="bg-stone-900">Accept Submission</option>
                                        <option value="MR" className="bg-stone-900">Minor Revision</option>
                                        <option value="MJ" className="bg-stone-900">Major Revision</option>
                                        <option value="R" className="bg-stone-900">Reject Submission</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Comments to Author</label>
                                    <textarea 
                                      disabled={reviewDraft.status === 'submitted'}
                                      value={reviewDraft.commentsToAuthor}
                                      onChange={e => setReviewDraft({...reviewDraft, commentsToAuthor: e.target.value})}
                                      placeholder="Provide constructive feedback for the authors..."
                                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-xs outline-none focus:border-agri-secondary/50 h-40 resize-none transition-colors placeholder:text-white/10"
                                    ></textarea>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Confidential Comments to Editor</label>
                                    <textarea 
                                      disabled={reviewDraft.status === 'submitted'}
                                      value={reviewDraft.commentsToEditor}
                                      onChange={e => setReviewDraft({...reviewDraft, commentsToEditor: e.target.value})}
                                      placeholder="Internal notes not visible to authors..."
                                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-xs outline-none focus:border-agri-secondary/50 h-32 resize-none transition-colors placeholder:text-white/10"
                                    ></textarea>
                                </div>

                                {reviewDraft.status === 'submitted' && (
                                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-3">
                                        <CheckCircle size={18} className="text-green-500 shrink-0" />
                                        <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest leading-relaxed">
                                            This review has been submitted and is now locked for editing.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                      )}
                  </div>
              </div>
          </div>
      );
  }

  // Dashboard List View
  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white rounded-[2.5rem] p-8 border border-stone-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
         <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-agri-secondary/5 to-transparent pointer-events-none"></div>
         <div className="relative z-10">
            <h1 className="text-3xl font-serif font-bold text-agri-primary">Reviewer Console</h1>
            <p className="text-stone-500 text-xs mt-2 font-bold uppercase tracking-widest flex items-center gap-2">
               <Activity size={14} className="text-green-500" /> System Active • {assignedArticles.length} Assignments
            </p>
         </div>
         <div className="relative z-10 flex gap-4">
             <div className="text-center px-6 py-2 bg-stone-50 rounded-2xl border border-stone-100">
                 <p className="text-2xl font-black text-agri-primary">{assignedArticles.filter(a => a.reviewAssignments?.find(r => r.reviewerId === user?.id)?.status === 'PENDING').length}</p>
                 <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Pending</p>
             </div>
             <div className="text-center px-6 py-2 bg-stone-50 rounded-2xl border border-stone-100">
                 <p className="text-2xl font-black text-agri-primary">{assignedArticles.filter(a => a.reviewAssignments?.find(r => r.reviewerId === user?.id)?.status === 'REVIEWED').length}</p>
                 <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Completed</p>
             </div>
         </div>
      </div>

      <div className="grid gap-4">
         {assignedArticles.map(art => {
             const assignment = art.reviewAssignments?.find(ra => ra.reviewerId === user?.id);
             return (
                 <div 
                    key={art.id} 
                    className="bg-white border border-stone-200 p-6 rounded-[2rem] flex flex-col md:flex-row items-center justify-between hover:shadow-lg transition-all group cursor-pointer relative overflow-hidden"
                    onClick={() => setSelectedArticle(art)}
                 >
                     {/* Hover Effect Bar */}
                     <div className="absolute left-0 top-0 bottom-0 w-1 bg-agri-secondary opacity-0 group-hover:opacity-100 transition-opacity"></div>

                     <div className="flex items-center gap-6 mb-4 md:mb-0 w-full md:w-auto">
                         <div className="w-16 h-16 bg-stone-50 rounded-2xl flex items-center justify-center text-stone-300 group-hover:text-agri-secondary transition-colors border border-stone-100 shrink-0">
                             <FileText size={28} />
                         </div>
                         <div className="min-w-0">
                             <div className="flex items-center gap-3 mb-1">
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                                    assignment?.status === 'REVIEWED' || assignment?.status === 'ACCEPTED' ? 'bg-green-50 text-green-600 border-green-100' : 
                                    assignment?.status === 'UNDER_REVIEW' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                    assignment?.status === 'REJECTED' ? 'bg-red-50 text-red-600 border-red-100' :
                                    'bg-amber-50 text-amber-600 border-amber-100'
                                }`}>
                                    {assignment?.status.replace('_', ' ')}
                                </span>
                                <span className="text-[10px] text-stone-400 font-mono">ID: {art.id.slice(0, 8)}</span>
                             </div>
                             <h3 className="text-agri-primary font-bold text-lg truncate pr-4">{art.title}</h3>
                             <p className="text-stone-400 text-xs mt-1 flex items-center gap-3 font-medium">
                                 <span>{art.authorName}</span>
                                 <span className="w-1 h-1 rounded-full bg-stone-300"></span>
                                 <span>Assigned: {new Date(assignment?.assignedAt || '').toLocaleDateString()}</span>
                             </p>
                         </div>
                     </div>
                     
                     <div className="flex items-center gap-6 shrink-0">
                         {art.plagiarismReport && (
                             <div className="text-right hidden lg:block">
                                 <p className="text-[10px] font-black text-stone-300 uppercase tracking-widest">AI Audit</p>
                                 <div className="flex items-center justify-end gap-1 mt-1">
                                     <span className={`text-xs font-bold ${art.plagiarismReport.ai_generated_score > 50 ? 'text-red-500' : 'text-green-500'}`}>{art.plagiarismReport.ai_generated_score}% AI</span>
                                 </div>
                             </div>
                         )}
                         <button className="p-3 bg-stone-50 rounded-xl text-stone-400 group-hover:text-agri-primary group-hover:bg-agri-secondary/20 transition-colors">
                             <Eye size={20} />
                         </button>
                     </div>
                 </div>
             );
         })}
         {assignedArticles.length === 0 && (
             <div className="flex flex-col items-center justify-center py-24 text-stone-400 bg-white rounded-[2.5rem] border border-stone-200 border-dashed">
                 <FileText size={48} className="mb-4 text-stone-200" />
                 <p className="font-serif text-lg text-agri-primary mb-1">No Assignments Yet</p>
                 <p className="text-xs uppercase tracking-widest font-bold opacity-60">Your queue is currently empty</p>
             </div>
         )}
      </div>
    </div>
  );
};

export default ReviewerDashboard;
