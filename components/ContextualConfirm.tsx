
import React, { createContext, useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmOptions {
  message: string;
  type?: 'danger' | 'default';
  trigger?: EventTarget | HTMLElement | null;
}

interface ConfirmationContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmationContext = createContext<ConfirmationContextType | undefined>(undefined);

export const useConfirm = () => {
  const context = useContext(ConfirmationContext);
  if (!context) throw new Error("useConfirm must be used within a ConfirmationProvider");
  return context;
};

export const ConfirmationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<{
    isOpen: boolean;
    message: string;
    type: 'danger' | 'default';
    position: { top: number; left: number; align: 'left' | 'right' };
    resolve: ((value: boolean) => void) | null;
  }>({
    isOpen: false,
    message: '',
    type: 'default',
    position: { top: 0, left: 0, align: 'left' },
    resolve: null,
  });

  const confirm = (options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      let position: { top: number; left: number; align: 'left' | 'right' } = { 
        top: window.innerHeight / 2, 
        left: window.innerWidth / 2, 
        align: 'left' 
      };
      
      if (options.trigger) {
        const el = options.trigger as HTMLElement;
        const rect = el.getBoundingClientRect();
        
        // Default: Below the element, aligned left
        let top = rect.bottom + 12;
        let left = rect.left;
        let align: 'left' | 'right' = 'left';

        // Responsive positioning logic
        // If close to bottom of viewport, flip to above
        if (top + 160 > window.innerHeight) {
            top = rect.top - 140; 
        }

        // If close to right edge, align right
        if (left + 300 > window.innerWidth) {
            left = rect.right;
            align = 'right';
        }

        // Small mobile adjustment
        if (window.innerWidth < 640) {
            left = window.innerWidth / 2 - 140; // Center roughly
            align = 'left';
        }

        position = { top, left, align };
      }

      setState({
        isOpen: true,
        message: options.message,
        type: options.type || 'default',
        position,
        resolve,
      });
    });
  };

  const handleClose = (result: boolean) => {
    if (state.resolve) state.resolve(result);
    setState(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <ConfirmationContext.Provider value={{ confirm }}>
      {children}
      <AnimatePresence>
        {state.isOpen && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
              onClick={() => handleClose(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.1 } }}
              className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 flex flex-col gap-6 font-sans border border-stone-100"
            >
               <p className="text-base font-bold text-stone-800 leading-relaxed text-center">{state.message}</p>
               <div className="flex justify-center gap-3">
                  <button 
                    onClick={() => handleClose(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-black uppercase tracking-widest transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => handleClose(true)}
                    className={`flex-1 px-4 py-2.5 rounded-xl text-white text-xs font-black uppercase tracking-widest transition-all shadow-lg hover:shadow-xl ${
                        state.type === 'danger' ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' : 'bg-agri-primary hover:bg-agri-secondary shadow-agri-primary/20'
                    }`}
                  >
                    Confirm
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ConfirmationContext.Provider>
  );
};

