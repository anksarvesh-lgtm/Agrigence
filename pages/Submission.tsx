
import React, { useState } from 'react';
import { useAuth } from '../App';
import { useNavigate } from 'react-router-dom';
import { mockBackend } from '../services/mockBackend';
import { UploadCloud, AlertTriangle, Lock, FileText, CheckCircle, PenTool, Type } from 'lucide-react';
import { createMetaFile } from '../extensions/submission-tracking/meta-handler';
import { sendNotification } from '../extensions/notifications/service';
import OptimizedImage from '../components/OptimizedImage';
import SEO from '../components/SEO';

const Submission: React.FC = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  
  const [submissionMode, setSubmissionMode] = useState<'FILE' | 'TEXT'>('FILE');
  const [contentType, setContentType] = useState<'ARTICLE' | 'BLOG'>('ARTICLE');
  const [title, setTitle] = useState('');
  const [authorName, setAuthorName] = useState(user?.name || '');
  const [file, setFile] = useState<File | null>(null);
  const [textContent, setTextContent] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Check if user has any active plan (simple expiry check)
  const isPlanActive = user?.subscriptionExpiry && new Date(user.subscriptionExpiry) > new Date();
  
  // 2. Check Submission Limit
  const totalArticleLimit = user?.articleLimit === 'UNLIMITED' ? 'UNLIMITED' : (Number(user?.articleLimit) || 0) + (user?.adminArticleLimitAdjustment || 0);
  const totalBlogLimit = user?.blogLimit === 'UNLIMITED' ? 'UNLIMITED' : (Number(user?.blogLimit) || 0) + (user?.adminBlogLimitAdjustment || 0);
  
  const currentLimit = contentType === 'ARTICLE' ? totalArticleLimit : totalBlogLimit;
  const currentUsage = contentType === 'ARTICLE' ? user?.articleUsage || 0 : user?.blogUsage || 0;
  
  const isLimitReached = user && currentLimit !== 'UNLIMITED' && (currentUsage >= currentLimit);
  
  // Combine checks
  const canSubmit = user && isPlanActive && !isLimitReached;

  // Determine Blocking Reason
  let blockReason = '';
  if (!user) blockReason = 'LOGIN_REQUIRED';
  else if (!user.subscriptionExpiry) blockReason = 'NO_PLAN';
  else if (!isPlanActive) blockReason = 'EXPIRED';
  else if (isLimitReached) blockReason = 'LIMIT_REACHED';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setErrorMsg('');

    if (selectedFile) {
      // Validate file type
      const isDocx = selectedFile.name.toLowerCase().endsWith('.docx');
      const isWithinSize = selectedFile.size <= 10 * 1024 * 1024; // 10 MB

      if (!isDocx) {
        setErrorMsg('Invalid file type. Only .docx files are accepted.');
        setFile(null);
        return;
      }

      if (!isWithinSize) {
        setErrorMsg('File too large. Maximum size allowed is 10 MB.');
        setFile(null);
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    if (!title.trim()) return setErrorMsg("Title is required");
    if (!authorName.trim()) return setErrorMsg("Author name is required");
    
    if (submissionMode === 'FILE' && !file) return setErrorMsg("Please upload your file (.docx)");
    if (submissionMode === 'TEXT' && !textContent.trim()) return setErrorMsg("Please write your content.");
    if (!acceptedTerms) return setErrorMsg("You must accept the terms and conditions before submitting.");

    setIsSubmitting(true);
    setErrorMsg('');
    
    try {
      let fileUrl = '';
      // Upload file to get base64 string if in file mode
      if (submissionMode === 'FILE' && file) {
        fileUrl = await mockBackend.uploadFile(file, 'submissions');
      }

      const result = await mockBackend.submitArticle({
        title,
        authorId: user!.id,
        authorName: authorName,
        status: 'Pending',
        type: contentType,
        submissionDate: new Date().toISOString(),
        fileUrl: fileUrl,
        content: submissionMode === 'TEXT' ? textContent : ''
      });
      
      if (result) {
        // --- EXTENSION HOOK: Create Metadata Sidecar ---
        try {
           await createMetaFile(result.id, title, authorName);
           
           // --- NOTIFICATION HOOK ---
           sendNotification('SUBMISSION_RECEIVED', {
             name: authorName,
             email: user?.email,
             title: title,
             id: result.id
           });

        } catch(e: any) {
           console.warn("Meta file creation warning", e.message || e);
        }

        if(user) {
            const isArticle = contentType === 'ARTICLE';
            const updatedUser = { 
                ...user, 
                articleUsage: isArticle ? (user.articleUsage || 0) + 1 : (user.articleUsage || 0),
                blogUsage: !isArticle ? (user.blogUsage || 0) + 1 : (user.blogUsage || 0)
            };
            // Persist to backend
            await mockBackend.updateUser(updatedUser.id, updatedUser);
            // Update local state
            login(updatedUser); 
        }
        alert(`${contentType === 'BLOG' ? 'Blog' : 'Article'} submitted successfully! Plagiarism check initiated.`);
        navigate('/dashboard');
      }
    } catch (error: any) {
      setErrorMsg(error.message || "Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- RENDER BLOCKING SCREENS ---

  if (blockReason === 'NO_PLAN' || blockReason === 'LOGIN_REQUIRED') {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-stone-100 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-bold text-stone-800 mb-2">Subscription Required</h2>
          <p className="text-stone-600 mb-6">You need an active subscription plan to submit articles.</p>
          <button onClick={() => navigate('/subscription')} className="w-full bg-agri-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-agri-secondary transition-colors">
            View Subscription Plans
          </button>
        </div>
      </div>
    );
  }

  if (blockReason === 'EXPIRED') {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-stone-100 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-500">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-stone-800 mb-2">Plan Expired</h2>
          <p className="text-stone-600 mb-6">Your subscription plan has expired. Please renew your plan to continue submissions.</p>
          <button onClick={() => navigate('/subscription')} className="w-full bg-agri-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-agri-secondary transition-colors">
            Renew Plan
          </button>
        </div>
      </div>
    );
  }

  if (blockReason === 'LIMIT_REACHED') {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-stone-100 text-center">
           <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500">
            <UploadCloud size={32} />
          </div>
          <h2 className="text-2xl font-bold text-stone-800 mb-2">Submission Limit Reached</h2>
          <p className="text-stone-600 mb-6">You have reached the submission limit for your current plan. Upgrade to submit more.</p>
          <button onClick={() => navigate('/subscription')} className="w-full bg-agri-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-agri-secondary transition-colors">
            Upgrade Plan
          </button>
        </div>
      </div>
    );
  }

  // --- RENDER SUBMISSION FORM ---

  return (
    <div className="container mx-auto px-4 py-12">
      <SEO 
        title="Submit Content | Agrigence"
        description="Submit your agricultural research articles, blogs, and insights to the Agrigence platform."
      />
      <div className="max-w-xl mx-auto bg-white p-8 md:p-10 rounded-[2.5rem] shadow-premium border border-stone-100">
        <div className="flex items-center gap-4 mb-8">
           <div className="bg-agri-secondary/10 p-3 rounded-2xl text-agri-secondary">
              {submissionMode === 'FILE' ? <UploadCloud size={24} /> : <PenTool size={24} />}
           </div>
           <div>
              <h1 className="text-2xl font-serif font-bold text-agri-primary">Submit Content</h1>
              <p className="text-stone-400 text-xs uppercase tracking-widest font-black">Fast-Track Publishing Protocol</p>
           </div>
        </div>
        
        {errorMsg && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100 text-xs font-bold uppercase tracking-tight">
            {errorMsg}
          </div>
        )}

        {/* Content Category Toggle */}
        <div className="mb-6">
            <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-1">Content Category</label>
            <div className="flex gap-4">
                <button 
                    type="button" 
                    onClick={() => setContentType('ARTICLE')} 
                    className={`flex-1 py-3 rounded-xl border font-bold text-xs transition-all ${contentType === 'ARTICLE' ? 'bg-agri-primary text-white border-agri-primary shadow-lg' : 'bg-white border-stone-200 text-stone-500 hover:border-agri-secondary'}`}
                >
                    Research Article
                </button>
                <button 
                    type="button" 
                    onClick={() => setContentType('BLOG')} 
                    className={`flex-1 py-3 rounded-xl border font-bold text-xs transition-all ${contentType === 'BLOG' ? 'bg-agri-primary text-white border-agri-primary shadow-lg' : 'bg-white border-stone-200 text-stone-500 hover:border-agri-secondary'}`}
                >
                    Blog Post
                </button>
            </div>
        </div>

        {/* Submission Mode Toggle */}
        <div className="flex bg-stone-100 p-1 rounded-2xl mb-8">
            <button 
                onClick={() => setSubmissionMode('FILE')}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${submissionMode === 'FILE' ? 'bg-white shadow-sm text-agri-primary' : 'text-stone-400 hover:text-stone-600'}`}
            >
                <UploadCloud size={14} /> Upload File
            </button>
            <button 
                onClick={() => setSubmissionMode('TEXT')}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${submissionMode === 'TEXT' ? 'bg-white shadow-sm text-agri-primary' : 'text-stone-400 hover:text-stone-600'}`}
            >
                <Type size={14} /> Write Text
            </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-1">Title</label>
            <input 
              type="text" 
              required 
              className="w-full border border-stone-200 bg-stone-50 rounded-2xl p-4 focus:ring-2 focus:ring-agri-secondary/20 focus:border-agri-secondary outline-none transition-all text-sm font-medium"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Impact of Climate Change on Paddy Yield"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-1">Primary Author Name</label>
            <input 
              type="text" 
              required 
              className="w-full border border-stone-200 bg-stone-50 rounded-2xl p-4 focus:ring-2 focus:ring-agri-secondary/20 focus:border-agri-secondary outline-none transition-all text-sm font-medium"
              value={authorName}
              onChange={e => setAuthorName(e.target.value)}
              placeholder="Author's Full Name"
            />
          </div>

          {submissionMode === 'FILE' ? (
            <div>
                <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-1">Upload File (.docx only)</label>
                <div className={`border-2 border-dashed rounded-[2rem] p-10 text-center transition-all cursor-pointer ${file ? 'border-agri-secondary bg-agri-secondary/5' : 'border-stone-200 bg-stone-50 hover:bg-white hover:border-agri-secondary/30'}`}>
                <input 
                    type="file" 
                    id="file" 
                    accept=".docx" 
                    className="hidden"
                    onChange={handleFileChange}
                />
                <label htmlFor="file" className="cursor-pointer flex flex-col items-center">
                    {file ? (
                    <div className="flex flex-col items-center animate-in fade-in zoom-in">
                        <div className="bg-agri-secondary text-white p-4 rounded-full mb-3 shadow-lg">
                        <FileText size={32} />
                        </div>
                        <span className="text-agri-primary font-bold text-sm truncate max-w-[200px]">{file.name}</span>
                        <span className="text-[10px] text-agri-secondary font-black mt-1 uppercase tracking-widest">File Ready</span>
                    </div>
                    ) : (
                    <>
                        <div className="bg-stone-200 text-stone-400 p-4 rounded-full mb-3">
                        <UploadCloud size={32} />
                        </div>
                        <span className="text-stone-700 font-bold text-sm">Click to Select Manuscript</span>
                        <span className="text-[10px] text-stone-400 mt-1 uppercase tracking-widest font-black">DOCX Max 10MB</span>
                    </>
                    )}
                </label>
                </div>
            </div>
          ) : (
            <div>
                <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-1">Content Editor</label>
                <textarea 
                    required 
                    className="w-full border border-stone-200 bg-stone-50 rounded-2xl p-4 focus:ring-2 focus:ring-agri-secondary/20 focus:border-agri-secondary outline-none transition-all text-sm font-medium h-64 leading-relaxed"
                    value={textContent}
                    onChange={e => setTextContent(e.target.value)}
                    placeholder="Write or paste your content here. Basic HTML is supported..."
                />
                <p className="text-[10px] text-stone-400 mt-2 ml-1">* Plagiarism check will be performed on this text.</p>
            </div>
          )}

          <div className="bg-stone-50 rounded-2xl p-4 flex items-center justify-between">
             <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-agri-secondary" />
                <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Protocol Verified</span>
             </div>
             <span className="text-[10px] font-black text-agri-primary uppercase tracking-widest">
                {currentLimit === 'UNLIMITED' ? 'UNLIMITED_TX' : `REM: ${Number(currentLimit) - currentUsage}_TX`}
             </span>
          </div>

          <div className="flex items-start gap-3 bg-stone-50 rounded-2xl p-4 border border-stone-200">
             <input 
               type="checkbox" 
               id="terms" 
               checked={acceptedTerms}
               onChange={(e) => setAcceptedTerms(e.target.checked)}
               className="mt-1 w-4 h-4 text-agri-secondary border-stone-300 rounded focus:ring-agri-secondary"
             />
             <label htmlFor="terms" className="text-xs text-stone-600 leading-relaxed">
               I have read and agree to the <a href="/terms" target="_blank" className="text-agri-secondary font-bold hover:underline">Terms and Conditions</a> and confirm that this submission is my original work.
             </label>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`w-full py-5 rounded-2xl text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all ${isSubmitting ? 'bg-stone-400' : 'bg-agri-primary hover:bg-agri-secondary shadow-agri-primary/20 hover:scale-[1.02] active:scale-[0.98]'}`}
          >
            {isSubmitting ? 'UPLOADING_PROTOCOL...' : 'SUBMIT_CONTENT'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Submission;
