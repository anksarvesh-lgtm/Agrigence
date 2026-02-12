
import React, { useEffect, useState } from 'react';
import { useAuth } from '../App';
import { mockBackend } from '../services/mockBackend';
import { Article } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, FileText, Calendar, Clock, CheckCircle, AlertTriangle, Star, Send, MessageSquareHeart, ChevronRight, PenTool, Layers, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard: React.FC = () => {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      const fetchArticles = async () => {
        try {
          const userArticles = await mockBackend.getUserArticles(user.id);
          setArticles(userArticles);
        } catch (error) {
          console.error("Failed to load articles", error);
          setArticles([]);
        }
      };
      fetchArticles();
    }
  }, [user]);

  if (!user) return null;

  const isPlanActive = user.subscriptionExpiry && new Date(user.subscriptionExpiry) > new Date();

  const handleLogout = () => {
    if (confirm("Are you sure you want to sign out securely?")) {
      logout();
      navigate('/login');
    }
  };

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
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const getStatusLabel = (status: Article['status']) => {
    switch(status) {
        case 'PENDING': return 'Submitted';
        case 'APPROVED': return 'Approved';
        case 'REJECTED': return 'Rejected';
        case 'PUBLISHED': return 'Approved';
        default: return status;
    }
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
              <div className="w-24 h-24 bg-agri-primary rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-2xl mb-6 border-4 border-white ring-1 ring-agri-primary/10">
                {user.name[0]}
              </div>
              <h2 className="font-serif font-bold text-xl text-agri-primary">{user.name}</h2>
              <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mt-1">{user.occupation || 'Researcher'}</p>
              <div className="mt-6 pt-6 border-t border-stone-100 w-full space-y-4">
                 <div>
                    <p className="text-[10px] font-black text-stone-300 uppercase tracking-widest mb-1">Email ID</p>
                    <p className="text-sm text-stone-600 truncate">{user.email}</p>
                 </div>
                 <button onClick={handleLogout} className="w-full py-3 bg-stone-50 text-stone-400 hover:bg-red-50 hover:text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
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
                             <span>{user.articleUsage} / {user.articleLimit === 'UNLIMITED' ? '∞' : user.articleLimit}</span>
                          </div>
                          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                             <div 
                               className="bg-agri-secondary h-full transition-all duration-1000" 
                               style={{ width: user.articleLimit === 'UNLIMITED' ? '100%' : `${Math.min((user.articleUsage / (Number(user.articleLimit) || 1)) * 100, 100)}%` }}
                             />
                          </div>
                       </div>

                       <div className="space-y-2">
                          <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-white/60 mb-1">
                             <span className="flex items-center gap-1"><PenTool size={10}/> Blogs</span>
                             <span>{user.blogUsage} / {user.blogLimit === 'UNLIMITED' ? '∞' : user.blogLimit}</span>
                          </div>
                          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                             <div 
                               className="bg-agri-secondary h-full transition-all duration-1000" 
                               style={{ width: user.blogLimit === 'UNLIMITED' ? '100%' : `${Math.min((user.blogUsage / (Number(user.blogLimit) || 1)) * 100, 100)}%` }}
                             />
                          </div>
                       </div>
                    </div>
                  )}
                  <Link to="/subscription" className="mt-8 block text-center py-4 bg-agri-secondary text-agri-primary hover:bg-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-black/20">
                     {isPlanActive ? 'Upgrade Protocol' : 'Sync Subscription'}
                  </Link>
               </div>
            </div>
        </div>

        {/* Submissions Table */}
        <div className="lg:col-span-3 space-y-8">
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
                      <th className="px-8 py-5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                    {articles.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-8 py-20 text-center">
                           <div className="flex flex-col items-center opacity-30">
                              <FileText size={48} className="mb-4" />
                              <p className="font-bold uppercase tracking-[0.2em] text-xs">No Manuscripts Found</p>
                           </div>
                        </td>
                      </tr>
                    ) : (
                      articles.map(article => (
                        <tr key={article.id} className="hover:bg-stone-50/80 transition-colors group">
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-agri-secondary/5 flex items-center justify-center text-agri-secondary group-hover:scale-110 transition-transform">
                                   <FileText size={18} />
                                </div>
                                <span className="font-bold text-agri-primary line-clamp-1">{article.title}</span>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <span className="text-stone-500 text-sm font-medium">{new Date(article.submissionDate).toLocaleDateString()}</span>
                          </td>
                          <td className="px-8 py-6 text-right">
                             <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border
                                ${article.status === 'APPROVED' || article.status === 'PUBLISHED' ? 'bg-green-50 text-green-600 border-green-200' : 
                                  article.status === 'REJECTED' ? 'bg-red-50 text-red-600 border-red-200' : 
                                  'bg-amber-50 text-amber-600 border-amber-200'
                                }`}>
                                {getStatusLabel(article.status)}
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

      {/* Feedback Modal Overlay */}
      <AnimatePresence>
        {isFeedbackOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-agri-primary/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl border border-white/20 overflow-hidden"
            >
              <div className="p-10">
                <h3 className="text-2xl font-serif font-bold text-agri-primary mb-2">Sync Experience Review</h3>
                <p className="text-stone-400 text-[10px] font-black uppercase tracking-widest mb-8">System_Evaluation_Unit</p>
                
                <form onSubmit={handleFeedbackSubmit} className="space-y-8">
                   <div>
                      <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-4">Rating Index (1-5)</label>
                      <div className="flex gap-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(star)}
                            className="transition-all active:scale-90"
                          >
                            <Star 
                              size={36} 
                              fill={(hoverRating || rating) >= star ? '#C29263' : 'transparent'} 
                              className={(hoverRating || rating) >= star ? 'text-agri-secondary' : 'text-stone-200'}
                            />
                          </button>
                        ))}
                      </div>
                   </div>
                   
                   <div>
                      <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">Detailed Observations</label>
                      <textarea 
                        className="w-full bg-stone-50 border border-stone-200 p-5 rounded-[2rem] focus:ring-2 focus:ring-agri-secondary/20 focus:border-agri-secondary outline-none text-sm h-32 leading-relaxed"
                        placeholder="Detail your experience with the submission protocol..."
                        required
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                      ></textarea>
                   </div>

                   <div className="flex gap-4">
                      <button 
                        type="button"
                        onClick={() => setIsFeedbackOpen(false)}
                        className="flex-1 py-5 text-[10px] font-black text-stone-400 uppercase tracking-widest hover:text-stone-600 transition-colors"
                      >
                         Terminate
                      </button>
                      <button 
                        type="submit"
                        disabled={isSubmittingFeedback || feedbackSuccess}
                        className={`flex-[2] py-5 rounded-2xl font-black text-xs uppercase tracking-widest text-white shadow-xl transition-all flex items-center justify-center gap-2 ${feedbackSuccess ? 'bg-green-500' : 'bg-agri-secondary hover:bg-agri-primary shadow-agri-secondary/20'}`}
                      >
                         {feedbackSuccess ? (
                           <>SUCCESS_SYNCED <CheckCircle size={18} /></>
                         ) : isSubmittingFeedback ? (
                           'UPLOADING...'
                         ) : (
                           <>SYNC_REVIEW <Send size={16} /></>
                         )}
                      </button>
                   </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
    