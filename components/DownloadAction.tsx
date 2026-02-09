import React from 'react';
import { Download, FileText } from 'lucide-react';
import { DownloadAccessLevel } from '../types';

interface DownloadActionProps {
  title: string;
  type: 'ARTICLE' | 'BLOG' | 'MAGAZINE';
  accessLevel: DownloadAccessLevel;
  fileUrl: string;
}

const DownloadAction: React.FC<DownloadActionProps> = ({ title, type, fileUrl }) => {
  const handleDownloadClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = `${title.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button 
      onClick={handleDownloadClick}
      className="flex items-center gap-2 bg-agri-primary text-white px-5 py-2.5 rounded-full text-xs font-bold hover:bg-agri-secondary transition-all shadow-md group"
    >
      <Download size={14} className="group-hover:-translate-y-0.5 transition-transform" />
      <span>Get PDF</span>
    </button>
  );
};

export default DownloadAction;