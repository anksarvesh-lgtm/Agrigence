
import React from 'react';
import { Eye } from 'lucide-react';
import { DownloadAccessLevel } from '../types';
import { useNavigate } from 'react-router-dom';

interface PDFActionProps {
  title: string;
  fileUrl: string;
  variant?: 'inline' | 'button';
  // Optional ID for secure viewer routing
  id?: string;
  // Props kept for interface compatibility
  accessLevel?: DownloadAccessLevel; 
  type?: string; 
}

const PDFAction: React.FC<PDFActionProps> = ({ title, fileUrl, variant = 'button', id, type }) => {
  const navigate = useNavigate();

  const handleView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!fileUrl || fileUrl === '#') {
        alert("File not available.");
        return;
    }

    // Use Secure Viewer for Articles/Blogs if ID is present
    if (id && (type === 'ARTICLE' || type === 'BLOG')) {
        navigate(`/view-document/${id}`);
    } else {
        // Fallback for Magazines or Legacy items
        window.open(fileUrl, '_blank');
    }
  };

  if (variant === 'inline') {
    return (
      <button 
        onClick={handleView}
        className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-agri-primary hover:text-agri-secondary transition-colors"
      >
        <Eye size={12} /> Read PDF
      </button>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 w-full md:w-auto">
      <button 
        onClick={handleView}
        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-full text-xs font-bold transition-all shadow-md group bg-agri-primary text-white hover:bg-agri-secondary hover:scale-[1.02] active:scale-[0.98]"
      >
        <Eye size={16} className="group-hover:scale-110 transition-transform" />
        <span>Read PDF Online</span>
      </button>
    </div>
  );
};

export default PDFAction;
