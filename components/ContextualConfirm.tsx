
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
      // Fix: Explicitly type position to allow align to be 'left' | 'right'
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
          <>
            <div 
              className="fixed inset-0 z-[9998] bg-transparent" 
              onClick={() => handleClose(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.1 } }}
              style={{ 
                position: 'fixed', 
                top: state.position.top, 
                left: state.position.left,
                transform: state.position.align === 'right' ? 'translateX(-100%)' : 'none'
              }}
              className="z-[9999] w-72 bg-white rounded-2xl shadow-2xl border border-stone-100 p-5 flex flex-col gap-4 font-sans"
            >
               <p className="text-sm font-bold text-stone-800 leading-relaxed">{state.message}</p>
               <div className="flex justify-end gap-3">
                  <button 
                    onClick={() => handleClose(false)}
                    className="px-4 py-2 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-500 text-xs font-black uppercase tracking-widest transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => handleClose(true)}
                    className={`px-5 py-2 rounded-xl text-white text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-black/5 hover:shadow-xl ${
                        state.type === 'danger' ? 'bg-red-500 hover:bg-red-600' : 'bg-agri-primary hover:bg-agri-secondary'
                    }`}
                  >
                    Confirm
                  </button>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </ConfirmationContext.Provider>
  );
};
