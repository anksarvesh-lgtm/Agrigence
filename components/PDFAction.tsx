
import React from 'react';
import { Eye, Download, Lock } from 'lucide-react';
import { useAuth } from '../App';
import { DownloadAccessLevel } from '../types';

interface PDFActionProps {
  title: string;
  fileUrl: string;
  accessLevel: DownloadAccessLevel;
  type: 'ARTICLE' | 'BLOG' | 'MAGAZINE';
  variant?: 'inline' | 'button';
}

const PDFAction: React.FC<PDFActionProps> = ({ title, fileUrl, accessLevel, type, variant = 'button' }) => {
  const { user } = useAuth();

  const hasAccess = () => {
    if (accessLevel === 'FREE') return true;
    if (!user) return false;
    
    // Check specific permissions from user object
    if (type === 'ARTICLE' || type === 'MAGAZINE') return user.permissions.canDownloadArticles;
    if (type === 'BLOG') return user.permissions.canDownloadBlogs;
    
    return false;
  };

  const handleView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!hasAccess()) {
      alert("Subscription Required: Please subscribe to access and read this content online.");
      return;
    }

    // Open PDF in new tab for direct browser viewing
    window.open(fileUrl, '_blank');
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!hasAccess()) {
      alert("Subscription Required: Please subscribe to download this content.");
      return;
    }

    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = `${title.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const label = type === 'MAGAZINE' ? 'Read Magazine' : 'Read Article PDF';

  if (variant === 'inline') {
    return (
      <div className="flex gap-2">
        <button 
          onClick={handleView}
          className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-agri-primary hover:text-agri-secondary transition-colors"
        >
          {hasAccess() ? <Eye size={12} /> : <Lock size={12} />} {label}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button 
        onClick={handleView}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-md group ${
          hasAccess() 
            ? 'bg-agri-primary text-white hover:bg-agri-secondary' 
            : 'bg-stone-200 text-stone-400 cursor-not-allowed'
        }`}
      >
        {hasAccess() ? <Eye size={14} className="group-hover:scale-110 transition-transform" /> : <Lock size={14} />}
        <span>{label}</span>
      </button>
      
      <button 
        onClick={handleDownload}
        className={`p-2.5 rounded-full transition-all border ${
          hasAccess() 
            ? 'border-agri-border text-agri-primary hover:bg-stone-50' 
            : 'border-stone-100 text-stone-300 cursor-not-allowed'
        }`}
        title="Download PDF"
      >
        <Download size={14} />
      </button>
    </div>
  );
};

export default PDFAction;
