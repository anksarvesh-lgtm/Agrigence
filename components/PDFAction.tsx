
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Eye, X } from 'lucide-react';
import { DownloadAccessLevel } from '../types';
import { useNavigate } from 'react-router-dom';

interface PDFActionProps {
  title: string;
  fileUrl: string;
  driveUrl?: string;
  variant?: 'inline' | 'button';
  // Optional ID for secure viewer routing
  id?: string;
  // Props kept for interface compatibility
  accessLevel?: DownloadAccessLevel; 
  type?: string; 
  children?: React.ReactNode;
  className?: string;
}

const PDFAction: React.FC<PDFActionProps> = ({ title, fileUrl, driveUrl, variant = 'button', id, type, children, className }) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const handleView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Priority 1: Drive Link (Opens in new tab)
    if (driveUrl && driveUrl !== '' && driveUrl !== '#') {
        window.open(driveUrl, '_blank');
        return;
    }

    if (!fileUrl || fileUrl === '#') {
        alert("File not available.");
        return;
    }

    // Use Secure Viewer for Articles/Blogs if ID is present
    if (id && (type === 'ARTICLE' || type === 'BLOG')) {
        navigate(`/view-document/${id}`);
    } else {
        // Fallback for Magazines or Legacy items - show modal
        setShowModal(true);
    }
  };

  const renderModal = () => {
    if (!showModal) return null;
    
    const modalContent = (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 md:p-8">
        <div className="bg-white rounded-2xl w-full max-w-6xl h-full flex flex-col overflow-hidden relative">
          <div className="flex items-center justify-between p-4 border-b border-stone-200 bg-stone-50">
            <h3 className="font-bold text-lg text-stone-800 truncate pr-4">{title}</h3>
            <button 
              onClick={(e) => { e.stopPropagation(); setShowModal(false); }}
              className="p-2 hover:bg-stone-200 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 bg-stone-100 relative">
            <iframe 
              src={`${fileUrl}#view=FitH`} 
              className="w-full h-full border-none" 
              title={title}
            />
          </div>
        </div>
      </div>
    );

    return createPortal(modalContent, document.body);
  };

  if (variant === 'inline') {
    return (
      <>
        <button 
          onClick={handleView}
          className={className || "flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-agri-primary hover:text-agri-secondary transition-colors"}
        >
          {children || <><Eye size={12} /> Read PDF</>}
        </button>
        {renderModal()}
      </>
    );
  }

  return (
    <>
      <div className="flex flex-wrap gap-2 w-full md:w-auto">
        <button 
          onClick={handleView}
          className={className || "flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-full text-xs font-bold transition-all shadow-md group bg-agri-primary text-white hover:bg-agri-secondary hover:scale-[1.02] active:scale-[0.98]"}
        >
          {children || (
            <>
              <Eye size={16} className="group-hover:scale-110 transition-transform" />
              <span>Read PDF Online</span>
            </>
          )}
        </button>
      </div>
      {renderModal()}
    </>
  );
};

export default PDFAction;
