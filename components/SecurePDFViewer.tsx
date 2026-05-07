import React, { useState } from 'react';
import { FileText, Shield, Loader2, Lock, Download } from 'lucide-react';

export interface SecurePDFViewerProps {
  /** The Google Drive file ID */
  fileId: string;
  /** Title of the document */
  title?: string;
  /** Use the advanced PDF.js iframe which provides maximum restriction (no native download button) */
  advancedMode?: boolean;
  /** Allow downloading the file */
  allowDownload?: boolean;
}

export const SecurePDFViewer: React.FC<SecurePDFViewerProps> = ({ 
  fileId, 
  title = "Secure Document", 
  advancedMode = true,
  allowDownload = false
}) => {
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'PDF_READY') {
        setLoading(false);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const iframeSrc = `/pdf-viewer.html?file=${fileId}&download=${allowDownload}`;

  return (
    <div className="w-full mx-auto flex flex-col border border-stone-200 dark:border-stone-800 rounded-3xl overflow-hidden bg-white dark:bg-stone-900 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-5 bg-white dark:bg-stone-900 border-b border-stone-100 dark:border-stone-800/50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br from-agri-primary/20 to-agri-secondary/20 flex items-center justify-center text-agri-primary shadow-inner">
            <FileText size={24} />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100 truncate pr-4 leading-tight">{title}</h3>
            <div className="flex items-center gap-3 mt-1">
               <p className="text-[10px] uppercase tracking-wider font-bold text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                <Shield size={12} className="text-emerald-500" />
                Verified Secure
              </p>
              <div className="w-1 h-1 rounded-full bg-stone-300 dark:bg-stone-700" />
              <p className="text-[10px] uppercase tracking-wider font-bold text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                <Lock size={12} className="text-amber-500" />
                {allowDownload ? "Encrypted Access" : "Read Only"}
              </p>
            </div>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          {allowDownload && (
            <a 
              href={`/api/pdf/${fileId}?download=true`}
              download={`${title}.pdf`}
              className="flex items-center gap-2 text-xs font-bold text-agri-primary bg-agri-primary/10 hover:bg-agri-primary hover:text-white transition-all duration-300 px-5 py-2.5 rounded-xl cursor-pointer"
            >
              <Download size={14} />
              Save Offline
            </a>
          )}
        </div>
      </div>

      {/* Viewer Container */}
      <div className="relative w-full h-[75vh] min-h-[500px] bg-stone-100 dark:bg-stone-950">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-stone-100 dark:bg-stone-950">
            <Loader2 size={32} className="animate-spin text-agri-primary mb-3" />
            <span className="text-sm font-medium text-stone-500 dark:text-stone-400">Requesting Encrypted Document...</span>
          </div>
        )}
        <iframe
          src={iframeSrc}
          className="w-full h-full relative z-20 border-none"
          title={title}
          loading="lazy"
        />
      </div>
    </div>
  );
};
