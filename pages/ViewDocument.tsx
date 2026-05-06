
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockBackend } from '../services/mockBackend';
import { useAuth } from '../src/authContext';
import { Loader2, AlertCircle, FileText, ArrowLeft, Shield, ShieldAlert, ShieldCheck, AlertTriangle, Activity, Home } from 'lucide-react';
import { Article } from '../types';

const ViewDocument: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<Article | null>(null);

  useEffect(() => {
    const fetchDocument = async () => {
      if (!id) return;
      
      try {
        // 1. Fetch Metadata
        const articles = await mockBackend.getArticles();
        const article = articles.find(a => a.id === id);

        if (!article) {
          setError("Document not found in registry.");
          setLoading(false);
          return;
        }

        setMeta(article);

        // 2. Permission Logic
        const isViewerAdmin = user && ['ADMIN', 'SUPER_ADMIN'].includes(user.role);
        const isViewerOwner = user && user.id === article.authorId;

        // Determine if Content is "Admin Content" (Publicly permissible)
        let isPublicContent = false;
        
        // If status suggests visibility, verify uploader role
        if (article.status === 'PUBLISHED' || article.status === 'APPROVED') {
            if (!article.authorId) {
                // Assume Admin/System upload if no author ID attached (legacy/admin-panel behavior)
                isPublicContent = true;
            } else {
                // Verify if author is an Admin
                const adminUsers = await mockBackend.getPublicAdmins();
                const authorProfile = adminUsers.find(u => u.id === article.authorId);
                
                if (authorProfile) {
                    isPublicContent = true;
                }
            }
        }

        // Strict Access Gate
        if (!isViewerAdmin && !isViewerOwner && !isPublicContent) {
          setError("Access Denied: Private Submission.");
          setLoading(false);
          return;
        }
        
        setLoading(false);

      } catch (err: any) {
        console.error(err.message || err);
        setError("Secure Gateway Error: Unable to verify document protocols.");
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50">
        <Loader2 className="animate-spin text-agri-secondary mb-4" size={48} />
        <h2 className="text-xl font-serif font-bold text-agri-primary">Establishing Secure Connection...</h2>
        <p className="text-xs text-stone-400 uppercase tracking-widest mt-2">Verifying Access Protocol</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 p-6">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl text-center max-w-md border border-red-100">
           <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
              <Shield size={32} />
           </div>
           <h2 className="text-2xl font-serif font-bold text-agri-primary mb-3">Restricted Content</h2>
           <p className="text-stone-500 mb-8 leading-relaxed">{error}</p>
           <button onClick={() => navigate(-1)} className="bg-agri-primary text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-agri-secondary transition-all">
              Return to Safety
           </button>
        </div>
      </div>
    );
  }

  const hasFile = meta?.fileUrl && meta.fileUrl !== '#';
  const hasText = !!meta?.content;

  return (
    <div className="h-screen flex flex-col bg-stone-900 overflow-hidden">
       {/* Viewer Toolbar */}
       <div className="bg-[#1C1510] text-white p-4 flex justify-between items-center border-b border-white/10 shrink-0 z-50 shadow-lg">
          <div className="flex items-center gap-4">
              <button onClick={() => navigate('/')} className="p-2 hover:bg-white/10 rounded-full transition-colors" title="Go Home">
                 <Home size={20} />
              </button>
             <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <ArrowLeft size={20} />
             </button>
             <div>
                <h1 className="font-bold text-sm truncate max-w-[200px] md:max-w-md">{meta?.title}</h1>
                <p className="text--[10px] text-white/40 uppercase tracking-widest font-mono">
                   {meta?.type} • SECURE_VIEW
                </p>
             </div>
          </div>
          
          <div className="flex items-center gap-6">
             {/* Plagiarism Badge in Viewer Header */}
             {meta?.plagiarismReport && (
                <div className="hidden md:flex items-center gap-4 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                    <div className="flex items-center gap-2">
                        <ShieldAlert size={14} className={meta.plagiarismReport.plagiarism_score > 20 ? "text-red-400" : "text-green-400"} />
                        <span className="text-[10px] font-bold uppercase text-white/60">Plagiarism Risk: <span className="text-white">{meta.plagiarismReport.plagiarism_score}%</span></span>
                    </div>
                    <div className="w-px h-3 bg-white/10"></div>
                    <div className="flex items-center gap-2">
                        <Activity size={14} className={meta.plagiarismReport.ai_generated_score > 40 ? "text-amber-400" : "text-blue-400"} />
                        <span className="text-[10px] font-bold uppercase text-white/60">AI Probability: <span className="text-white">{meta.plagiarismReport.ai_generated_score}%</span></span>
                    </div>
                </div>
             )}

             {hasFile && (
                 <a 
                   href={meta?.fileUrl} 
                   download={`${meta?.title || 'document'}.pdf`}
                   className="bg-agri-secondary text-agri-primary px-4 py-2 rounded-lg text-xs font-bold hover:bg-white transition-colors"
                 >
                    Download Copy
                 </a>
             )}
          </div>
       </div>

       {/* Document Stream */}
       <div className="flex-1 bg-stone-800 relative overflow-y-auto custom-scrollbar flex">
          
          {/* Main Content */}
          <div className="flex-1 relative">
            {hasFile ? (
                <iframe 
                src={meta?.fileUrl} 
                className="w-full h-full border-none" 
                title="Secure Document Viewer"
                />
            ) : hasText ? (
                <div className="max-w-4xl mx-auto bg-white min-h-full p-12 md:p-20 shadow-2xl">
                    <h1 className="text-3xl font-serif font-bold text-stone-900 mb-8">{meta?.title}</h1>
                    
                    {/* Detailed AI Report Block */}
                    {meta?.plagiarismReport && (
                        <div className={`mb-8 p-6 rounded-2xl border ${
                            meta.plagiarismReport.risk_level === 'LOW' ? 'bg-green-50 border-green-100' : 
                            meta.plagiarismReport.risk_level === 'MEDIUM' ? 'bg-amber-50 border-amber-100' : 'bg-red-50 border-red-100'
                        }`}>
                            <h4 className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Shield size={16} /> Automated Integrity Report
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                <div className="bg-white/50 p-3 rounded-lg text-center">
                                    <span className="text-[10px] font-bold text-stone-400 uppercase">Plagiarism Score</span>
                                    <p className="text-xl font-black mt-1">{meta.plagiarismReport.plagiarism_score}%</p>
                                </div>
                                <div className="bg-white/50 p-3 rounded-lg text-center">
                                    <span className="text-[10px] font-bold text-stone-400 uppercase">AI Probability</span>
                                    <p className="text-xl font-black mt-1">{meta.plagiarismReport.ai_generated_score}%</p>
                                </div>
                                <div className="bg-white/50 p-3 rounded-lg text-center">
                                    <span className="text-[10px] font-bold text-stone-400 uppercase">Risk Level</span>
                                    <p className="text-xl font-black mt-1">{meta.plagiarismReport.risk_level}</p>
                                </div>
                                <div className="bg-white/50 p-3 rounded-lg text-center">
                                    <span className="text-[10px] font-bold text-stone-400 uppercase">Analyzed Date</span>
                                    <p className="text-xs font-bold mt-2">{new Date(meta.plagiarismReport.generatedAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                            {meta.plagiarismReport.flagged_sections.length > 0 && (
                                <div className="bg-white/50 p-4 rounded-xl">
                                    <p className="text-[10px] font-bold text-stone-400 uppercase mb-2">Flagged Segments</p>
                                    <ul className="list-disc pl-4 space-y-1">
                                        {meta.plagiarismReport.flagged_sections.map((sec, i) => (
                                            <li key={i} className="text-xs text-stone-600 italic">"{sec.text.substring(0, 100)}..."</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    <div 
                    className="prose prose-stone prose-lg max-w-none font-serif text-stone-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: meta?.content || '' }}
                    />
                </div>
            ) : (
                <div className="flex items-center justify-center h-full text-white/20">
                    <div className="text-center">
                        <FileText size={48} className="mx-auto mb-4"/>
                        <p>No content stream available.</p>
                    </div>
                </div>
            )}
          </div>
       </div>
    </div>
  );
};

export default ViewDocument;
