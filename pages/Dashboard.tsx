
import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../src/authContext';
import { mockBackend } from '../services/mockBackend';
import { Article, PaymentRecord, ReviewMessage, ReviewStatus, ToolHistory } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, FileText, Calendar, Clock, CheckCircle, AlertTriangle, Star, Send, MessageSquareHeart, ChevronRight, PenTool, Layers, LogOut, ShieldCheck, ShieldAlert, CreditCard, Activity, Camera, Lock, Smartphone, Globe, Mail, X, MessageSquareText, Loader2, Calculator, TrendingUp, Settings2, Wand2, LayoutGrid, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Tracker from '../extensions/submission-tracking/Tracker';
import { useConfirm } from '../components/ContextualConfirm';

const Dashboard: React.FC = () => {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [toolHistory, setToolHistory] = useState<ToolHistory[]>([]);
  const { confirm } = useConfirm();
  
  // Feedback States
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // Profile Update States
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Password Change States
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [pwdForm, setPwdForm] = useState({ current: '', new: '', confirm: '' });
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [isPwdSubmitting, setIsPwdSubmitting] = useState(false);

  // Review Chat States
  const [selectedReviewArticle, setSelectedReviewArticle] = useState<Article | null>(null);
  const [replyMessage, setReplyMessage] = useState('');

  useEffect(() => {
    if (user) {
      // Setup realtime listener for articles to capture async audit updates
      const unsubArticles = mockBackend.subscribeToArticles((allArticles) => {
          const myArticles = allArticles.filter(a => a.authorId === user.id);
          // Sort by date desc
          setArticles(myArticles.sort((a,b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime()));
      });

      // Setup realtime listener for payments
      const unsubPayments = mockBackend.subscribeToUserPayments(user.id, (userPayments) => {
          setPayments(userPayments);
      });

      // Setup realtime listener for tool history
      const unsubToolHistory = mockBackend.subscribeToToolHistory(user.id, (history) => {
          setToolHistory(history);
      });

      return () => {
          unsubArticles();
          unsubPayments();
          unsubToolHistory();
      };
    }
  }, [user]);

  if (!user) return null;

  const isPlanActive = user.subscriptionExpiry && new Date(user.subscriptionExpiry) > new Date();

  const handleLogout = async (e: React.MouseEvent) => {
    const isConfirmed = await confirm({
        message: "Are you sure you want to sign out securely?",
        type: 'danger',
        trigger: e.currentTarget
    });

    if (isConfirmed) {
      logout();
      navigate('/login');
    }
  };

  // --- Profile Photo Logic ---
  const handlePhotoClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Allow up to 5MB initially; server will compress to < 200KB
      if (file.size > 5 * 1024 * 1024) {
          alert("Image too large. Max 5MB allowed.");
          return;
      }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
          alert("Invalid format. JPG, PNG, WEBP only.");
          return;
      }

      setIsPhotoUploading(true);
      try {
          // Use specific path to overwrite existing if possible or standard path
          // Using user ID ensures we don't spam storage with new files for same user profile
          const customName = `${user.id}.webp`; 
          const url = await mockBackend.uploadFile(file, 'users/profiles', customName);
          
          await mockBackend.updateUser(user.id, { profilePhotoUrl: url });
          // Update local context
          login({ ...user, profilePhotoUrl: url });
      } catch (err: any) {
          console.error("Profile Upload Failed", err);
          alert(`Failed to upload photo: ${err.message || 'Unknown error'}`);
      } finally {
          setIsPhotoUploading(false);
      }
  };

  // --- Password Logic ---
  const handlePasswordSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setPwdError('');
      setPwdSuccess('');

      if (pwdForm.new !== pwdForm.confirm) {
          setPwdError("New passwords do not match.");
          return;
      }

      // Strong Password Regex: Min 8 chars, 1 number, 1 symbol
      const strongRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
      if (!strongRegex.test(pwdForm.new)) {
          setPwdError("Password must be 8+ chars with at least 1 number and 1 symbol.");
          return;
      }

      setIsPwdSubmitting(true);
      try {
          await mockBackend.changeUserPassword(pwdForm.current, pwdForm.new);
          setPwdSuccess("Password updated successfully!");
          setTimeout(() => {
              setIsPasswordModalOpen(false);
              setPwdForm({ current: '', new: '', confirm: '' });
              setPwdSuccess('');
          }, 1500);
      } catch (err: any) {
          console.error(err.message || err);
          setPwdError(err.code === 'auth/wrong-password' ? "Current password is incorrect." : "Update failed. Please try again.");
      } finally {
          setIsPwdSubmitting(false);
      }
  };

  // --- Feedback Logic ---
  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return alert("Please select a rating");
    setIsSubmittingFeedback(true);

    try {
      await mockBackend.submitFeedback({
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        userOccupation: user.occupation,
        rating,
        comment,
      });
      setFeedbackSuccess(true);
      setTimeout(() => {
        setIsFeedbackOpen(false);
        setFeedbackSuccess(false);
        setRating(0);
        setComment('');
      }, 2000);
    } catch (error: any) {
      console.error(error.message || error);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  // --- Review Reply Logic ---
  const handleReplyReview = async () => {
      if(!selectedReviewArticle || !replyMessage.trim()) return;
      
      const msg: Partial<ReviewMessage> = {
          senderId: user.id,
          senderName: user.name,
          senderRole: 'USER', // Author
          message: replyMessage,
          type: 'REPLY'
      };

      await mockBackend.addReviewMessage(selectedReviewArticle.id, msg);
      setReplyMessage('');
      
      // Refresh logic handled by subscription in useEffect
  };

  const getWorkflowLabel = (status?: ReviewStatus) => {
    // Author-facing status mapping
    switch (status) {
        case 'submitted': return { label: 'Submitted', color: 'bg-stone-100 text-stone-600' };
        case 'under_admin_check': return { label: 'Screening', color: 'bg-yellow-100 text-yellow-700' };
        case 'assigned_for_review': return { label: 'Review Initiated', color: 'bg-blue-50 text-blue-700' };
        case 'under_review': return { label: 'Under Review', color: 'bg-blue-100 text-blue-700 animate-pulse' };
        
        // "Review Completed" and "Admin Verified" are internal; User sees "Awaiting Decision"
        case 'review_completed': return { label: 'Awaiting Decision', color: 'bg-purple-100 text-purple-700' };
        case 'admin_verified': return { label: 'Awaiting Decision', color: 'bg-purple-100 text-purple-700' };
        
        case 'revision_requested': return { label: 'Revision Required', color: 'bg-orange-100 text-orange-700 border-orange-200' };
        case 'published': return { label: 'Published', color: 'bg-green-100 text-green-700 border-green-200' };
        case 'rejected': return { label: 'Declined', color: 'bg-red-100 text-red-700 border-red-200' };
        default: return { label: 'Processing', color: 'bg-gray-100 text-gray-600' };
    }
  };

  // Updated Badge Logic for Forensic Audit
  const getPlagiarismBadge = (report: Article['plagiarismReport']) => {
      // 1. Pending Audit
      if (!report || report.audit_status === 'PENDING') {
          return (
              <div className="flex items-center gap-2 text-stone-400">
                  <Loader2 size={12} className="animate-spin text-agri-secondary" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">Auditing...</span>
              </div>
          );
      }

      // 2. Failed Audit
      if (report.audit_status === 'FAILED') {
          return (
              <span className="text-[9px] font-bold text-red-400 uppercase">Audit Failed</span>
          );
      }
      
      // 3. Completed Audit - Show AI & Plag %
      const aiColor = report.ai_generated_score < 20 ? 'bg-green-100 text-green-700' : report.ai_generated_score < 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700';
      const plagColor = report.plagiarism_score < 5 ? 'bg-green-100 text-green-700' : report.plagiarism_score < 15 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700';

      return (
          <div className="flex gap-2">
              <span className={`px-2 py-1 rounded text-[10px] font-bold ${aiColor} border border-transparent`}>
                  AI: {report.ai_generated_score}%
              </span>
              <span className={`px-2 py-1 rounded text-[10px] font-bold ${plagColor} border border-transparent`}>
                  Plag: {report.plagiarism_score}%
              </span>
          </div>
      );
  };

  return (
    <div className="container mx-auto px-4 py-12">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-agri-primary">Researcher Dashboard</h1>
          <p className="text-stone-400 text-xs uppercase tracking-widest font-black mt-1">Academic Hub v2.0</p>
        </div>
        <Link 
          to="/submission" 
          className="bg-agri-primary text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-agri-secondary transition-all shadow-xl shadow-agri-primary/10 hover:scale-105 active:scale-95 text-sm"
        >
          <Plus size={18} /> SUBMIT NEW ARTICLE
        </Link>
      </div>

      <div className="grid lg:grid-cols-4 gap-8 mb-12">
        {/* Profile Info */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-8 rounded-[2rem] shadow-premium border border-stone-100 flex flex-col items-center text-center">
              
              {/* Avatar with Edit Overlay */}
              <div className="relative group cursor-pointer" onClick={handlePhotoClick}>
                  <div className="w-24 h-24 bg-agri-primary rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-2xl mb-6 border-4 border-white ring-1 ring-agri-primary/10 overflow-hidden">
                    {user.profilePhotoUrl ? (
                        <img src={user.profilePhotoUrl} className="w-full h-full object-cover" alt={user.name} />
                    ) : (
                        user.name[0]
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity mb-6 border-4 border-white">
                      <Camera size={24} className="text-white" />
                  </div>
                  {isPhotoUploading && (
                      <div className="absolute inset-0 bg-white/80 rounded-full flex items-center justify-center mb-6 z-10">
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-agri-secondary border-t-transparent"></div>
                      </div>
                  )}
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />

              <h2 className="font-serif font-bold text-xl text-agri-primary">{user.name}</h2>
              <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mt-1">{user.occupation || 'Researcher'}</p>
              
              <div className="mt-6 pt-6 border-t border-stone-100 w-full space-y-4 text-left">
                 <div>
                    <p className="text-[9px] font-black text-stone-300 uppercase tracking-widest mb-1 flex items-center gap-1"><Globe size={10} /> Region</p>
                    <p className="text-xs font-bold text-stone-600 truncate bg-stone-50 p-2 rounded-lg border border-stone-100 flex justify-between">
                        {user.country || 'N/A'} <span className="text-stone-400 text-[9px]">{user.currency}</span>
                    </p>
                 </div>
                 <div>
                    <p className="text-[9px] font-black text-stone-300 uppercase tracking-widest mb-1 flex items-center gap-1"><Smartphone size={10} /> Contact</p>
                    <p className="text-xs font-bold text-stone-600 truncate bg-stone-50 p-2 rounded-lg border border-stone-100 opacity-80 cursor-not-allowed" title="Contact Support to Change">
                        {user.mobileNumber || 'Not Linked'}
                    </p>
                 </div>
                 <div>
                    <p className="text-[9px] font-black text-stone-300 uppercase tracking-widest mb-1 flex items-center gap-1"><Mail size={10} /> Email</p>
                    <p className="text-xs font-bold text-stone-600 truncate bg-stone-50 p-2 rounded-lg border border-stone-100 opacity-80 cursor-not-allowed" title="Email is immutable">
                        {user.email}
                    </p>
                 </div>

                 <Link to="/dashboard/subscription" className="w-full py-3 bg-agri-primary/5 text-agri-primary hover:bg-agri-primary/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-agri-primary/10 mb-2">
                    <ShieldCheck size={14} /> My Subscription
                 </Link>

                 <button 
                    onClick={() => setIsPasswordModalOpen(true)}
                    className="w-full py-2 bg-stone-100 text-stone-500 hover:bg-stone-200 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                 >
                    <Lock size={12} /> Change Password
                 </button>

                 <button onClick={handleLogout} className="w-full py-3 bg-red-50 text-red-400 hover:bg-red-100 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 mt-2">
                    <LogOut size={14} /> Sign Out
                 </button>
              </div>
            </div>

            <div className="bg-agri-primary p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 text-white/5 group-hover:text-white/10 transition-colors">
                  <Star size={80} />
               </div>
               <div className="relative z-10 text-white">
                  <div className="flex justify-between items-start mb-4">
                     <span className="text-[9px] font-black uppercase tracking-widest text-agri-secondary">My Subscription</span>
                     {isPlanActive ? (
                       <div className="flex items-center gap-1 text-[8px] font-black uppercase bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/20">
                          <CheckCircle size={8} /> ACTIVE
                       </div>
                     ) : (
                       <div className="flex items-center gap-1 text-[8px] font-black uppercase bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full border border-red-500/20">
                          <AlertTriangle size={8} /> INACTIVE
                       </div>
                     )}
                  </div>
                  <h3 className="text-2xl font-serif font-bold leading-tight mb-2">{user.subscriptionTier || 'No Plan Active'}</h3>
                  {user.subscriptionExpiry && (
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">EXPIRY: {new Date(user.subscriptionExpiry).toLocaleDateString()}</p>
                  )}
                  
                  {isPlanActive && (
                    <div className="mt-8 space-y-6">
                       <div className="space-y-2">
                          <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-white/60 mb-1">
                             <span className="flex items-center gap-1"><FileText size={10}/> Articles</span>
                             <div className="text-right">
                                <span className="block">{user.articleUsage} / {user.articleLimit === 'UNLIMITED' ? '∞' : (Number(user.articleLimit) || 0) + (user.adminArticleLimitAdjustment || 0)}</span>
                                {user.adminArticleLimitAdjustment ? (
                                    <span className="text-[8px] text-agri-secondary lowercase">({user.articleLimit} plan + {user.adminArticleLimitAdjustment} admin)</span>
                                ) : null}
                             </div>
                          </div>
                          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                             <div 
                               className="bg-agri-secondary h-full transition-all duration-1000" 
                               style={{ width: user.articleLimit === 'UNLIMITED' ? '100%' : `${Math.min((user.articleUsage / ((Number(user.articleLimit) || 0) + (user.adminArticleLimitAdjustment || 0) || 1)) * 100, 100)}%` }}
                             />
                          </div>
                       </div>

                       <div className="space-y-2">
                          <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-white/60 mb-1">
                             <span className="flex items-center gap-1"><PenTool size={10}/> Blogs</span>
                             <div className="text-right">
                                <span className="block">{user.blogUsage} / {user.blogLimit === 'UNLIMITED' ? '∞' : (Number(user.blogLimit) || 0) + (user.adminBlogLimitAdjustment || 0)}</span>
                                {user.adminBlogLimitAdjustment ? (
                                    <span className="text-[8px] text-agri-secondary lowercase">({user.blogLimit} plan + {user.adminBlogLimitAdjustment} admin)</span>
                                ) : null}
                             </div>
                          </div>
                          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                             <div 
                               className="bg-agri-secondary h-full transition-all duration-1000" 
                               style={{ width: user.blogLimit === 'UNLIMITED' ? '100%' : `${Math.min((user.blogUsage / ((Number(user.blogLimit) || 0) + (user.adminBlogLimitAdjustment || 0) || 1)) * 100, 100)}%` }}
                             />
                          </div>
                       </div>
                    </div>
                  )}
                  <Link to="/subscription" className="mt-8 block text-center py-4 bg-agri-secondary text-agri-primary hover:bg-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-black/20">
                     {isPlanActive ? 'Upgrade Plan' : 'Buy Subscription'}
                  </Link>
               </div>
            </div>

            {/* Researcher Toolkit Navigation */}
            <div className="bg-white p-8 rounded-[2rem] shadow-premium border border-stone-100 mt-8">
              <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Settings2 size={12} /> Researcher Toolkit
              </h3>
              <div className="space-y-3">
                      <Link 
                  to="/dashboard/tools" 
                  className="w-full p-4 bg-stone-50 hover:bg-agri-primary hover:text-white rounded-2xl transition-all group flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg text-agri-primary group-hover:bg-agri-secondary group-hover:text-agri-primary transition-colors">
                      <Wand2 size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold">My Tools & Analysis</p>
                      <p className="text-[9px] opacity-60 font-medium">Statistical Engine v2.0</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="opacity-40 group-hover:opacity-100" />
                </Link>
                <Link to="/tools" 
                  className="w-full p-4 bg-stone-50 hover:bg-agri-primary hover:text-white rounded-2xl transition-all group flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg text-agri-primary group-hover:bg-agri-secondary group-hover:text-agri-primary transition-colors">
                      <LayoutGrid size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold">All Platform Tools</p>
                      <p className="text-[9px] opacity-60 font-medium">Browse 20+ Agri-Tools</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="opacity-40 group-hover:opacity-100" />
                </Link>
              </div>
            </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-10">
            
            {/* Submissions Table */}
            <div className="bg-white rounded-[2.5rem] shadow-premium border border-stone-100 overflow-hidden">
              <div className="px-8 py-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/30">
                <div className="flex items-center gap-3">
                   <div className="bg-agri-primary text-white p-2 rounded-lg">
                      <FileText size={18} />
                   </div>
                   <h3 className="font-serif font-bold text-lg text-agri-primary">Submission History</h3>
                </div>
                <span className="text-[10px] font-black bg-stone-100 px-4 py-1.5 rounded-full text-stone-500 uppercase tracking-widest">
                  {articles.length} Manuscripts
                </span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-stone-50/50 text-[10px] uppercase font-black tracking-[0.2em] text-stone-400 border-b border-stone-100">
                      <th className="px-8 py-5">Manuscript Title</th>
                      <th className="px-8 py-5">Upload Date</th>
                      <th className="px-8 py-5">Forensic Audit</th>
                      <th className="px-8 py-5 text-right">Workflow Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                    {articles.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-8 py-20 text-center">
                           <div className="flex flex-col items-center opacity-30">
                              <FileText size={48} className="mb-4" />
                              <p className="font-bold uppercase tracking-[0.2em] text-xs">No Manuscripts Found</p>
                           </div>
                        </td>
                      </tr>
                    ) : (
                      articles.map(article => {
                        const statusInfo = getWorkflowLabel(article.review_status || 'submitted');
                        return (
                        <tr 
                          key={article.id} 
                          className="hover:bg-stone-50/80 transition-colors group"
                        >
                          <td className="px-8 py-6 cursor-pointer" onClick={() => navigate(`/view-document/${article.id}`)}>
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-agri-secondary/5 flex items-center justify-center text-agri-secondary group-hover:scale-110 transition-transform">
                                   <FileText size={18} />
                                </div>
                                <div>
                                    <span className="font-bold text-agri-primary line-clamp-1">{article.title}</span>
                                    <span className="text-[9px] text-stone-400 font-bold uppercase tracking-wider">{article.type || 'ARTICLE'}</span>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <span className="text-stone-500 text-sm font-medium">{new Date(article.submissionDate).toLocaleDateString()}</span>
                          </td>
                          <td className="px-8 py-6">
                             {getPlagiarismBadge(article.plagiarismReport)}
                          </td>
                          <td className="px-8 py-6 text-right">
                             <div className="flex items-center justify-end gap-3">
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusInfo.color}`}>
                                    {statusInfo.label}
                                </span>
                                {article.reviewThreads && article.reviewThreads.length > 0 && (
                                    <button 
                                        onClick={() => setSelectedReviewArticle(article)}
                                        className="p-2 bg-indigo-50 text-indigo-500 rounded-full hover:bg-indigo-100 hover:scale-110 transition-all shadow-sm relative"
                                        title="View Review Comments"
                                    >
                                        <MessageSquareText size={16} />
                                        {/* Notification Dot Logic Could Be Improved */}
                                        <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                    </button>
                                )}
                             </div>
                          </td>
                        </tr>
                      )})
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tool History Section */}
            <div className="bg-white rounded-[2.5rem] shadow-premium border border-stone-100 overflow-hidden">
              <div className="px-8 py-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/30">
                <div className="flex items-center gap-3">
                  <div className="bg-agri-secondary text-agri-primary p-2 rounded-lg">
                    <Clock size={18} />
                  </div>
                  <h3 className="font-serif font-bold text-lg text-agri-primary">Tool History</h3>
                </div>
                <span className="text-[10px] font-black bg-stone-100 px-4 py-1.5 rounded-full text-stone-500 uppercase tracking-widest">
                  {toolHistory.length} Sessions
                </span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-stone-50/50 text-[10px] uppercase font-black tracking-[0.2em] text-stone-400 border-b border-stone-100">
                      <th className="px-8 py-5">Tool Name</th>
                      <th className="px-8 py-5">Date & Time</th>
                      <th className="px-8 py-5">Status</th>
                      <th className="px-8 py-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                    {toolHistory.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-8 py-10 text-center">
                           <p className="text-stone-400 text-xs font-bold uppercase tracking-widest">No tool history found</p>
                        </td>
                      </tr>
                    ) : (
                      toolHistory.map(item => (
                        <tr key={item.id} className="hover:bg-stone-50/80 transition-colors group">
                          <td className="px-8 py-5">
                            <span className="font-bold text-agri-primary text-sm">{item.toolName}</span>
                          </td>
                          <td className="px-8 py-5 text-xs font-medium text-stone-500">
                            {new Date(item.timestamp).toLocaleString()}
                          </td>
                          <td className="px-8 py-5">
                            <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${
                              item.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <button 
                              onClick={() => navigate(`/dashboard/tool-history/${item.id}`)}
                              className="p-2 bg-stone-100 text-stone-400 rounded-full hover:bg-agri-primary hover:text-white transition-all"
                            >
                              <ChevronRight size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Analytical Tools Section */}
            <div className="bg-white rounded-[2.5rem] shadow-premium border border-stone-100 overflow-hidden">
              <div className="px-8 py-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/30">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-600 text-white p-2 rounded-lg">
                    <Activity size={18} />
                  </div>
                  <h3 className="font-serif font-bold text-lg text-agri-primary">Analytical Tools</h3>
                </div>
                  <Link to="/tools"
                    className="w-full py-3 bg-white text-agri-primary border border-stone-200 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 hover:bg-agri-secondary hover:text-white hover:border-agri-secondary"
                  >
                    View All Tools
                  </Link>
              </div>
              <div className="p-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Advanced Research Suite Card */}
                <div className="bg-stone-50 rounded-3xl p-6 border border-stone-100 group hover:border-blue-200 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-blue-100 p-3 rounded-2xl text-blue-600">
                      <Database size={24} />
                    </div>
                    <span className="text-[9px] font-black bg-blue-100 text-blue-700 px-3 py-1 rounded-full uppercase tracking-widest">
                      New Module
                    </span>
                  </div>
                  <h4 className="font-bold text-agri-primary text-lg mb-2">Advanced Research Suite</h4>
                  <p className="text-stone-500 text-sm mb-6 leading-relaxed">
                    Excel-like data entry, custom datasets, and comprehensive statistical analysis (ANOVA, PCA, Regression).
                  </p>
                  <Link 
                    to="/dashboard/advanced-research"
                    className="w-full py-3 bg-white text-agri-primary border border-stone-200 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white hover:border-blue-600"
                  >
                    Open Research Suite <ChevronRight size={14} />
                  </Link>
                </div>

                <div className="bg-stone-50 rounded-3xl p-6 border border-stone-100 group hover:border-emerald-200 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-600">
                      <Calculator size={24} />
                    </div>
                    <span className="text-[9px] font-black bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full uppercase tracking-widest">
                      Research Ready
                    </span>
                  </div>
                  <h4 className="font-bold text-agri-primary text-lg mb-2">Statistical Analysis</h4>
                  <p className="text-stone-500 text-sm mb-6 leading-relaxed">
                    Run CRD/RBD ANOVA, Correlation, and Regression analysis with agricultural standard outputs and PDF reporting.
                  </p>
                  <Link to="/tools"
                    className="w-full py-3 bg-white text-agri-primary border border-stone-200 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 hover:bg-emerald-600 hover:text-white hover:border-emerald-600"
                  >
                    Launch Analysis Engine <ChevronRight size={14} />
                  </Link>
                </div>

                <div className="bg-stone-50 rounded-3xl p-6 border border-stone-100 group hover:border-agri-secondary/30 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-agri-secondary/10 p-3 rounded-2xl text-agri-secondary">
                      <TrendingUp size={24} />
                    </div>
                    <span className="text-[9px] font-black bg-agri-secondary/10 text-agri-secondary px-3 py-1 rounded-full uppercase tracking-widest">
                      Visualizer
                    </span>
                  </div>
                  <h4 className="font-bold text-agri-primary text-lg mb-2">Graph Generator</h4>
                  <p className="text-stone-500 text-sm mb-6 leading-relaxed">
                    Transform your research data into publication-quality visualizations and charts instantly.
                  </p>
                  <Link to="/tools"
                    className="w-full py-3 bg-white text-agri-primary border border-stone-200 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 hover:bg-agri-secondary hover:text-white hover:border-agri-secondary"
                  >
                    Open Visualizer <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            </div>

            {/* EXTENSION: Metadata Tracker Widget */}
            <Tracker articles={articles} />

            {/* Data Storage & Uploads Section */}
            <div className="bg-white rounded-[2.5rem] shadow-premium border border-stone-100 overflow-hidden">
              <div className="px-8 py-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/30">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600 text-white p-2 rounded-lg">
                    <Database size={18} />
                  </div>
                  <h3 className="font-serif font-bold text-lg text-agri-primary">Data Storage & Uploads</h3>
                </div>
                <span className="text-[10px] font-black bg-stone-100 px-4 py-1.5 rounded-full text-stone-500 uppercase tracking-widest">
                  {isPlanActive ? '180 Days Retention' : '24 Hours Retention'}
                </span>
              </div>
              <div className="p-8">
                <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200 mb-6">
                  <h4 className="font-bold text-agri-primary mb-2 flex items-center gap-2">
                    <ShieldCheck size={16} className="text-agri-secondary" /> Data Retention Policy
                  </h4>
                  <p className="text-sm text-stone-600 leading-relaxed">
                    Your uploaded datasets and documents are securely stored for use with our analytical tools. 
                    <strong> Free users</strong> have a data retention period of <strong>24 hours</strong>. 
                    <strong> Premium subscribers</strong> enjoy extended storage for up to <strong>180 days</strong>.
                  </p>
                </div>

                <div className="border-2 border-dashed border-stone-300 rounded-3xl p-10 text-center hover:border-agri-secondary transition-colors group cursor-pointer relative" onClick={() => document.getElementById('data-upload')?.click()}>
                  <input type="file" id="data-upload" className="hidden" accept=".doc,.docx,.xls,.xlsx,.csv" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      alert(`File "${file.name}" selected for upload. Processing logic will be implemented in the respective tools.`);
                    }
                  }} />
                  <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-agri-secondary/10 group-hover:text-agri-secondary transition-colors text-stone-400">
                    <FileText size={32} />
                  </div>
                  <h4 className="font-bold text-agri-primary text-lg mb-2">Upload Research Data</h4>
                  <p className="text-stone-500 text-sm mb-4">Click to browse or drag and drop files here</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Supported formats: DOC, DOCX, XLS, XLSX, CSV</p>
                </div>
              </div>
            </div>

            {/* Subscription & Payment History */}
            <div className="bg-white rounded-[2.5rem] shadow-premium border border-stone-100 overflow-hidden">
                <div className="px-8 py-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/30">
                    <div className="flex items-center gap-3">
                        <div className="bg-green-600 text-white p-2 rounded-lg">
                            <CreditCard size={18} />
                        </div>
                        <h3 className="font-serif font-bold text-lg text-agri-primary">Billing History</h3>
                    </div>
                    <span className="text-[10px] font-black bg-stone-100 px-4 py-1.5 rounded-full text-stone-500 uppercase tracking-widest">
                        {payments.length} Transactions
                    </span>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-stone-50/50 text-[10px] uppercase font-black tracking-[0.2em] text-stone-400 border-b border-stone-100">
                                <th className="px-8 py-5">Date</th>
                                <th className="px-8 py-5">Plan</th>
                                <th className="px-8 py-5">Amount</th>
                                <th className="px-8 py-5 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-50">
                            {payments.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-10 text-center">
                                        <p className="text-stone-400 text-xs font-bold uppercase tracking-widest">No payment records found</p>
                                    </td>
                                </tr>
                            ) : (
                                payments.map(payment => (
                                    <tr key={payment.id} className="hover:bg-stone-50/80 transition-colors">
                                        <td className="px-8 py-5 text-xs font-medium text-stone-500">
                                            {new Date(payment.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="font-bold text-agri-primary text-sm">{payment.planName}</span>
                                            <span className="block text-[9px] text-stone-400 font-mono mt-0.5">{payment.upiTxnId || 'N/A'}</span>
                                        </td>
                                        <td className="px-8 py-5 font-bold text-agri-primary text-sm">
                                            ₹{payment.amount}
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <span className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${
                                                payment.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 
                                                payment.status === 'FAILED' ? 'bg-red-100 text-red-700' : 
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {payment.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Support Grid */}
            <div className="grid md:grid-cols-2 gap-8">
               <div className="bg-white/40 backdrop-blur-md p-10 rounded-[2.5rem] shadow-premium border border-white/20 flex flex-col items-center text-center group">
                  <div className="bg-agri-secondary/10 p-5 rounded-[2rem] text-agri-secondary mb-6 group-hover:scale-110 transition-transform">
                     <MessageSquareHeart size={32} />
                  </div>
                  <h3 className="font-serif font-bold text-xl text-agri-primary mb-2">Platform Review</h3>
                  <p className="text-stone-500 text-sm mb-8 leading-relaxed font-light">Your feedback directly influences the peer-review UI updates.</p>
                  <button 
                    onClick={() => setIsFeedbackOpen(true)}
                    className="w-full py-4 bg-agri-primary text-white border border-stone-100 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-agri-primary/10"
                  >
                     Launch Review Interface
                  </button>
               </div>

               <div className="bg-white/40 backdrop-blur-md p-10 rounded-[2.5rem] shadow-premium border border-white/20 flex flex-col items-center text-center group">
                  <div className="bg-agri-primary/5 p-5 rounded-[2rem] text-agri-primary mb-6 group-hover:scale-110 transition-transform">
                     <Send size={32} />
                  </div>
                  <h3 className="font-serif font-bold text-xl text-agri-primary mb-2">Protocol Support</h3>
                  <p className="text-stone-500 text-sm mb-8 leading-relaxed font-light">Facing manuscript rejection or technical upload errors?</p>
                  <a 
                    href="https://wa.me/919452571317" 
                    target="_blank" 
                    rel="noreferrer"
                    className="w-full py-4 bg-agri-secondary text-agri-primary border border-stone-100 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-xl shadow-agri-secondary/10"
                  >
                     Connect_Tech_Nodes <ChevronRight size={14} />
                  </a>
               </div>
            </div>
        </div>
      </div>

      {/* Review Feedback Modal */}
      <AnimatePresence>
          {selectedReviewArticle && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
                  <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
                  >
                      <div className="p-6 bg-stone-50 border-b border-stone-200 flex justify-between items-center">
                          <div>
                              <h3 className="text-lg font-serif font-bold text-agri-primary">Reviewer Feedback</h3>
                              <p className="text-xs text-stone-500">For: {selectedReviewArticle.title}</p>
                          </div>
                          <button onClick={() => setSelectedReviewArticle(null)} className="p-2 hover:bg-stone-200 rounded-full"><X size={20}/></button>
                      </div>
                      
                      <div className="p-6 flex-1 overflow-y-auto space-y-4 bg-stone-100/50 custom-scrollbar">
                          {selectedReviewArticle.reviewThreads?.map((msg) => (
                              <div key={msg.id} className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                                  <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${msg.senderId === user.id ? 'bg-agri-primary text-white rounded-br-none' : 'bg-white border border-stone-200 rounded-bl-none text-stone-700 shadow-sm'}`}>
                                      <p className="font-bold text-[10px] uppercase mb-1 opacity-70 flex justify-between gap-4">
                                          {/* Mask Reviewer Name for User */}
                                          <span>{msg.senderRole === 'EDITORIAL_MEMBER' ? 'Editorial Reviewer' : msg.senderName} ({msg.senderRole === 'EDITORIAL_MEMBER' ? 'Board' : 'You'})</span>
                                          <span>{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                      </p>
                                      <p className="leading-relaxed">{msg.message}</p>
                                  </div>
                              </div>
                          ))}
                          {!selectedReviewArticle.reviewThreads?.length && (
                              <div className="text-center text-stone-400 italic py-10">No review comments yet.</div>
                          )}
                      </div>

                      <div className="p-4 bg-white border-t border-stone-200">
                          <div className="flex gap-2">
                              <input 
                                className="flex-1 bg-stone-100 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-agri-secondary/50"
                                placeholder="Type your reply or clarification..."
                                value={replyMessage}
                                onChange={e => setReplyMessage(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleReplyReview()}
                              />
                              <button 
                                onClick={handleReplyReview}
                                disabled={!replyMessage.trim()}
                                className="bg-agri-secondary text-agri-primary px-4 rounded-xl hover:bg-agri-primary hover:text-white transition-colors disabled:opacity-50"
                              >
                                  <Send size={18} />
                              </button>
                          </div>
                      </div>
                  </motion.div>
              </div>
          )}
      </AnimatePresence>

      {/* Password Change Modal & Feedback Modal ... (Existing Code) */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
           <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
              <div className="p-6 bg-stone-50 border-b border-stone-200 flex justify-between items-center">
                 <h3 className="font-bold text-lg text-agri-primary">Security Update</h3>
                 <button onClick={() => setIsPasswordModalOpen(false)}><X size={20} className="text-stone-400 hover:text-black"/></button>
              </div>
              <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
                 <div>
                    <label className="text-[10px] font-black uppercase text-stone-400 block mb-1">Current Password</label>
                    <input type="password" required className="w-full border border-stone-200 rounded-xl p-3 text-sm outline-none focus:border-agri-secondary" value={pwdForm.current} onChange={e => setPwdForm({...pwdForm, current: e.target.value})} />
                 </div>
                 <div>
                    <label className="text-[10px] font-black uppercase text-stone-400 block mb-1">New Password</label>
                    <input type="password" required className="w-full border border-stone-200 rounded-xl p-3 text-sm outline-none focus:border-agri-secondary" value={pwdForm.new} onChange={e => setPwdForm({...pwdForm, new: e.target.value})} />
                 </div>
                 <div>
                    <label className="text-[10px] font-black uppercase text-stone-400 block mb-1">Confirm New Password</label>
                    <input type="password" required className="w-full border border-stone-200 rounded-xl p-3 text-sm outline-none focus:border-agri-secondary" value={pwdForm.confirm} onChange={e => setPwdForm({...pwdForm, confirm: e.target.value})} />
                 </div>
                 
                 {pwdError && <p className="text-xs text-red-500 font-bold">{pwdError}</p>}
                 {pwdSuccess && <p className="text-xs text-green-500 font-bold">{pwdSuccess}</p>}

                 <button type="submit" disabled={isPwdSubmitting} className="w-full bg-agri-primary text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-agri-secondary transition-all">
                    {isPwdSubmitting ? 'Updating...' : 'Update Credentials'}
                 </button>
              </form>
           </div>
        </div>
      )}

      {isFeedbackOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
           <div className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl relative">
              <button onClick={() => setIsFeedbackOpen(false)} className="absolute top-4 right-4 p-2 bg-stone-100 rounded-full hover:bg-stone-200 transition-colors"><X size={18}/></button>
              <div className="p-8 text-center">
                 <div className="w-16 h-16 bg-agri-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-agri-secondary">
                    <MessageSquareHeart size={32} />
                 </div>
                 <h3 className="text-2xl font-serif font-bold text-agri-primary mb-2">Share Your Experience</h3>
                 <p className="text-stone-500 text-sm mb-8">How would you rate the submission process?</p>
                 
                 <div className="flex justify-center gap-2 mb-8">
                    {[1,2,3,4,5].map(star => (
                       <button 
                         key={star}
                         onMouseEnter={() => setHoverRating(star)}
                         onMouseLeave={() => setHoverRating(0)}
                         onClick={() => setRating(star)}
                         className="p-1 transition-transform hover:scale-110"
                       >
                          <Star 
                            size={32} 
                            fill={(hoverRating || rating) >= star ? "#D4A373" : "none"} 
                            className={(hoverRating || rating) >= star ? "text-agri-gold" : "text-stone-300"}
                          />
                       </button>
                    ))}
                 </div>

                 <textarea 
                   className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-4 text-sm outline-none focus:border-agri-secondary h-32 resize-none mb-6"
                   placeholder="Any suggestions for improvement?"
                   value={comment}
                   onChange={e => setComment(e.target.value)}
                 ></textarea>

                 {feedbackSuccess ? (
                    <div className="bg-green-100 text-green-700 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                       <CheckCircle size={18} /> Feedback Sent!
                    </div>
                 ) : (
                    <button 
                      onClick={handleFeedbackSubmit}
                      disabled={isSubmittingFeedback}
                      className="w-full bg-agri-primary text-white py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-agri-secondary transition-all shadow-lg"
                    >
                       {isSubmittingFeedback ? 'Sending...' : 'Submit Feedback'}
                    </button>
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
