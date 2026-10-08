
import React, { useEffect, useState } from 'react';
import { FileText, Clock, AlertCircle, CheckCircle, XCircle, Loader2, Eye, File } from 'lucide-react';
import { getMetaFile, SubmissionMeta } from './meta-handler';
import { Article } from '../../types';

// Visual Status Mapping
const getStatusBadge = (status: string) => {
  const s = status || 'Pending';
  switch (s) {
    case 'Approved': 
      return 'bg-green-100 text-green-700 border-green-200';
    case 'Published': 
      return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'Rejected': 
      return 'bg-red-100 text-red-700 border-red-200';
    case 'Under Review': 
      return 'bg-blue-100 text-blue-700 border-blue-200';
    default: // Pending
      return 'bg-yellow-100 text-yellow-700 border-yellow-200'; 
  }
};

const Tracker: React.FC<{ articles: Article[] }> = ({ articles }) => {
  const [history, setHistory] = useState<SubmissionMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadUserSubmissions = async () => {
      setLoading(true);
      const results: SubmissionMeta[] = [];

      // 1. Scan the submission list (passed prop represents the directory scan)
      for (const article of articles) {
        try {
          // 2. Match with metadata file (Fail-safe loader)
          const meta = await getMetaFile(article);
          results.push(meta);
        } catch (e) {
          console.warn("Failed to load meta for", article.id);
        }
      }

      // 3. Sort by date descending
      results.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

      if (isMounted) {
        setHistory(results);
        setLoading(false);
      }
    };

    loadUserSubmissions();

    return () => { isMounted = false; };
  }, [articles]);

  if (loading) {
    return (
      <div className="bg-white rounded-[2.5rem] shadow-premium border border-stone-100 p-12 text-center mt-10">
        <Loader2 className="animate-spin mx-auto text-agri-secondary mb-3" size={24} />
        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Scanning Submission Nodes...</p>
      </div>
    );
  }

  if (history.length === 0) return null;

  return (
    <div className="bg-white rounded-[2.5rem] shadow-premium border border-stone-100 overflow-hidden mt-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="px-8 py-6 border-b border-stone-100 bg-stone-50/50 flex justify-between items-center">
        <h3 className="font-serif font-bold text-lg text-agri-primary flex items-center gap-2">
          <Clock size={18} className="text-agri-secondary" /> Submission Live Tracker
        </h3>
        <span className="text-[10px] font-black bg-stone-200 px-3 py-1 rounded-full text-stone-500 uppercase tracking-widest flex items-center gap-1">
          <File size={10} /> {history.length} RECORDS FOUND
        </span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] uppercase font-black tracking-[0.2em] text-stone-400 border-b border-stone-100 bg-stone-50/30">
              <th className="px-8 py-5">Article Title</th>
              <th className="px-8 py-5">Submitted On</th>
              <th className="px-8 py-5">Status Protocol</th>
              <th className="px-8 py-5">Reviewer Remarks</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {history.map((meta) => {
              // Find original article for file URL
              const original = articles.find(a => a.id === meta.articleId);
              
              return (
                <tr key={meta.articleId} className="hover:bg-stone-50 transition-colors group">
                  <td className="px-8 py-6">
                    <span className="font-bold text-agri-primary text-sm line-clamp-1 max-w-[200px]" title={meta.title}>
                      {meta.title}
                    </span>
                    <span className="text-[9px] text-stone-400 font-mono block mt-1">{meta.articleId.slice(0, 8)}...</span>
                  </td>
                  <td className="px-8 py-6 text-xs font-medium text-stone-500">
                    {new Date(meta.submittedAt).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getStatusBadge(meta.status)}`}>
                      {meta.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-xs text-stone-500 max-w-xs">
                    <p className="line-clamp-1 italic text-stone-400 group-hover:text-stone-600 transition-colors">
                      {meta.remarks || 'No remarks yet'}
                    </p>
                  </td>
                  <td className="px-8 py-6 text-right">
                    {original?.fileUrl ? (
                      <button 
                        onClick={() => window.open(original.fileUrl, '_blank')}
                        className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-agri-secondary hover:text-agri-primary transition-colors bg-white border border-stone-100 px-3 py-2 rounded-lg shadow-sm hover:shadow-md"
                      >
                        <Eye size={12} /> View File
                      </button>
                    ) : (
                      <span className="text-[9px] font-bold text-stone-300 uppercase">File Syncing...</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Tracker;
