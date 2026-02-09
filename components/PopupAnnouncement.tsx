
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';
import { mockBackend } from '../services/mockBackend';
import { Link } from 'react-router-dom';

const PopupAnnouncement: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const config = mockBackend.getSettings().popup;
    const hasSeen = sessionStorage.getItem('agri_popup_seen');
    
    if (config?.isEnabled && !hasSeen) {
      setSettings(config);
      const timer = setTimeout(() => setIsOpen(true), 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('agri_popup_seen', 'true');
  };

  if (!settings) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/20"
          >
            <button 
              onClick={handleClose}
              className="absolute top-6 right-6 z-20 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-all backdrop-blur-md"
            >
              <X size={20} />
            </button>

            <div className="h-64 relative overflow-hidden">
               <img src={settings.imageUrl} className="w-full h-full object-cover" alt="Announcement" />
               <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
            </div>

            <div className="p-10 -mt-12 relative z-10 text-center">
              <span className="inline-block px-3 py-1 bg-agri-secondary/10 text-agri-secondary text-[10px] font-black uppercase tracking-widest rounded-full mb-4">
                Special Update
              </span>
              <h2 className="text-3xl font-serif font-bold text-agri-primary mb-4 leading-tight">
                {settings.title}
              </h2>
              <p className="text-stone-500 text-sm leading-relaxed mb-8">
                {settings.description}
              </p>
              
              {settings.buttonLink && (
                <Link 
                  to={settings.buttonLink} 
                  onClick={handleClose}
                  className="inline-flex items-center gap-2 bg-agri-primary text-white px-10 py-4 rounded-2xl font-bold hover:bg-agri-secondary transition-all shadow-xl shadow-agri-primary/10"
                >
                  {settings.buttonText || 'Learn More'} <ArrowRight size={18} />
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PopupAnnouncement;
