import React from 'react';
import { Download, Lock, FileText, FileSpreadsheet, File } from 'lucide-react';
import { useAuth } from '../src/authContext';
import { canAccessResearch, isPlanExpired } from '../utils/planAccess';

interface ExportControlProps {
  onExport: (format: 'docx' | 'xlsx' | 'pdf') => void;
  disabled?: boolean;
}

const ExportControl: React.FC<ExportControlProps> = ({ onExport, disabled = false }) => {
  const { user, planDetails } = useAuth();
  const isSubscribed = user && planDetails && planDetails.id !== 'free' && !isPlanExpired(user);

  if (!isSubscribed) {
    return (
      <div className="relative group">
        <button 
          disabled
          className="flex items-center gap-2 px-6 py-3 bg-stone-100 text-stone-400 border border-stone-200 rounded-xl text-xs font-black uppercase tracking-widest cursor-not-allowed opacity-70"
        >
          <Lock size={14} /> Export Results
        </button>
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 bg-stone-900 text-white text-xs p-3 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-center">
          <p className="font-bold mb-1">Feature Locked</p>
          <p className="text-stone-400">Subscribe to export your research data in DOCX, Excel, and PDF formats.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative group">
        <button 
          disabled={disabled}
          className="flex items-center gap-2 px-6 py-3 bg-agri-primary text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-agri-primary/20 hover:bg-agri-secondary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={16} /> Export Results
        </button>
        
        {/* Dropdown Menu */}
        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-stone-100 overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 transform origin-top-right">
          <div className="p-1">
            <button 
              onClick={() => onExport('docx')}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-stone-50 rounded-lg text-left transition-colors group/item"
            >
              <div className="bg-blue-50 text-blue-600 p-2 rounded-lg group-hover/item:bg-blue-100 transition-colors">
                <FileText size={16} />
              </div>
              <span className="text-xs font-bold text-stone-600 uppercase tracking-wide">Word (.docx)</span>
            </button>
            
            <button 
              onClick={() => onExport('xlsx')}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-stone-50 rounded-lg text-left transition-colors group/item"
            >
              <div className="bg-emerald-50 text-emerald-600 p-2 rounded-lg group-hover/item:bg-emerald-100 transition-colors">
                <FileSpreadsheet size={16} />
              </div>
              <span className="text-xs font-bold text-stone-600 uppercase tracking-wide">Excel (.xlsx)</span>
            </button>
            
            <button 
              onClick={() => onExport('pdf')}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-stone-50 rounded-lg text-left transition-colors group/item"
            >
              <div className="bg-red-50 text-red-600 p-2 rounded-lg group-hover/item:bg-red-100 transition-colors">
                <File size={16} />
              </div>
              <span className="text-xs font-bold text-stone-600 uppercase tracking-wide">PDF (.pdf)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportControl;
