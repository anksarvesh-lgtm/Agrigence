
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockBackend } from '../services/mockBackend';
import { useAuth } from '../App';
import { Loader2, AlertCircle, FileText, ArrowLeft, Shield } from 'lucide-react';
import { Article } from '../types';

const ViewDocument: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
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
                // We use getPublicAdmins which queries specifically for admins to satisfy security rules
                // instead of fetching all users which would fail for public/regular users
                const adminUsers = await mockBackend.getPublicAdmins();
                const authorProfile = adminUsers.find(u => u.id === article.authorId);
                
                if (authorProfile) {
                    isPublicContent = true;
                }
            }
        }

        // Strict Access Gate
        // - Allow if Viewer is Admin
        // - Allow if Viewer is Owner
        // - Allow if Content is explicitly Public (Admin Uploaded & Published)
        if (!isViewerAdmin && !isViewerOwner && !isPublicContent) {
          setError("Access Denied: Private Submission.");
          setLoading(false);
          return;
        }

        // 3. Secure Fetch (Stream)
        // We fetch the file using the stored URL (which contains the access token)
        // converting it to a Blob hides the direct storage URL from the browser address bar
        if (!article.fileUrl || article.fileUrl === '#') {
            setError("Document file is missing or corrupted.");
            setLoading(false);
            return;
        }

        const response = await fetch(article.fileUrl);
        if (!response.ok) throw new Error("Failed to stream document content.");
        
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
        setLoading(false);

      } catch (err) {
        console.error(err);
        setError("Secure Gateway Error: Unable to load document stream.");
        setLoading(false);
      }
    };

    fetchDocument();

    // Cleanup blob URL on unmount
    return () => {
        if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
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

  return (
    <div className="h-screen flex flex-col bg-stone-900 overflow-hidden">
       {/* Viewer Toolbar */}
       <div className="bg-[#1C1510] text-white p-4 flex justify-between items-center border-b border-white/10 shrink-0 z-50 shadow-lg">
          <div className="flex items-center gap-4">
             <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <ArrowLeft size={20} />
             </button>
             <div>
                <h1 className="font-bold text-sm truncate max-w-[200px] md:max-w-md">{meta?.title}</h1>
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-mono">
                   {meta?.type} • SECURE_VIEW
                </p>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <a 
               href={blobUrl!} 
               download={`${meta?.title || 'document'}.pdf`}
               className="bg-agri-secondary text-agri-primary px-4 py-2 rounded-lg text-xs font-bold hover:bg-white transition-colors"
             >
                Download Copy
             </a>
          </div>
       </div>

       {/* Document Stream */}
       <div className="flex-1 bg-stone-800 relative">
          {blobUrl && (
             <iframe 
               src={blobUrl} 
               className="w-full h-full border-none" 
               title="Secure Document Viewer"
             />
          )}
       </div>
    </div>
  );
};

export default ViewDocument;
