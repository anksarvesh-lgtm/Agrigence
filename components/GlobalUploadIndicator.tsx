
import React, { useState, useEffect } from 'react';
import { mockBackend } from '../services/mockBackend';
import { UploadCloud, CheckCircle, XCircle, Loader2, File } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const GlobalUploadIndicator = () => {
  const [status, setStatus] = useState<'IDLE' | 'UPLOADING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    mockBackend.setUploadListener((p, s, f) => {
        setProgress(p);
        setStatus(s);
        if (f) setFileName(f);
        
        if (s === 'SUCCESS' || s === 'ERROR') {
            setTimeout(() => {
                setStatus('IDLE');
                setProgress(0);
                setFileName('');
            }, 4000);
        }
    });
  }, []);

  return (
    <AnimatePresence>
      {status !== 'IDLE' && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="fixed top-24 right-6 z-[100] w-80 bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden"
        >
          <div className="p-4 flex items-center gap-4">
             <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                 status === 'SUCCESS' ? 'bg-green-100 text-green-600' :
                 status === 'ERROR' ? 'bg-red-100 text-red-600' :
                 'bg-agri-secondary/10 text-agri-secondary'
             }`}>
                 {status === 'SUCCESS' ? <CheckCircle size={20} /> :
                  status === 'ERROR' ? <XCircle size={20} /> :
                  <UploadCloud size={20} className={status === 'UPLOADING' ? 'animate-bounce' : ''} />}
             </div>
             
             <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-0.5">
                    {status === 'UPLOADING' ? 'System Upload' : status === 'SUCCESS' ? 'Complete' : 'Failed'}
                </p>
                <p className="text-xs font-bold text-stone-800 truncate" title={fileName}>
                    {fileName || 'File'}
                </p>
             </div>

             {status === 'UPLOADING' && (
                 <span className="text-xs font-black text-agri-secondary">{Math.round(progress)}%</span>
             )}
          </div>

          {/* Progress Bar */}
          {status === 'UPLOADING' && (
              <div className="h-1 bg-stone-100 w-full">
                  <motion.div 
                    className="h-full bg-agri-secondary"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ type: "spring", stiffness: 50 }}
                  />
              </div>
          )}
          {status === 'SUCCESS' && <div className="h-1 bg-green-500 w-full" />}
          {status === 'ERROR' && <div className="h-1 bg-red-500 w-full" />}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GlobalUploadIndicator;
