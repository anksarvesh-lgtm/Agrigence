import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, User, Bot, Loader2, Maximize2, Minimize2, Paperclip, Mic } from 'lucide-react';
import { useAuth } from '../App';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export const KisanMitraChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
       id: 'welcome',
       role: 'model',
       text: 'Namaste! I am Kisan Mitra, your personal agriculture expert. How can I assist you with your farming today? (e.g. crop advice, weather, mandi prices, or pest control)'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const currentInput = input;
    setInput('');
    
    const historyToSend = messages.filter(m => m.id !== 'welcome').map(m => ({
      role: m.role,
      text: m.text
    }));

    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: currentInput }]);
    setIsLoading(true);

    try {
        let prefix = "";
        if (messages.length === 1 && user) {
             prefix = `[System Note: The user's name is ${user.name}. Keep responses natural.]\n\n`;
        }

        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: prefix + currentInput, history: historyToSend })
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const tempId = Date.now().toString();
        setMessages(prev => [...prev, { id: tempId, role: 'model', text: '' }]);

        const reader = response.body?.getReader();
        const decoder = new TextDecoder('utf-8');
        let fullText = '';

        if (reader) {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                if (value) {
                    fullText += decoder.decode(value, { stream: true });
                    setMessages(prev => prev.map(msg => msg.id === tempId ? { ...msg, text: fullText } : msg));
                }
            }
        }

    } catch (error: any) {
        console.error("Chat error:", error);
        setMessages(prev => [...prev, { 
            id: Date.now().toString(), 
            role: 'model', 
            text: 'I am sorry, I am having trouble connecting right now. Please try again later.' 
        }]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-[#2d5a27] text-white shadow-[0_10px_30px_rgba(45,90,39,0.4)] flex items-center justify-center border-2 border-white/20"
          >
            <MessageSquare size={28} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ 
                opacity: 1, 
                y: 0, 
                scale: 1,
                width: isExpanded ? 'calc(100vw - 48px)' : '380px',
                height: isExpanded ? 'calc(100vh - 48px)' : '600px',
                bottom: isExpanded ? '24px' : '24px',
                right: isExpanded ? '24px' : '24px',
                maxWidth: isExpanded ? '1200px' : 'calc(100vw - 48px)',
                maxHeight: isExpanded ? '800px' : 'calc(100vh - 48px)'
            }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`fixed z-50 bg-white rounded-3xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.2)] border border-stone-200 flex flex-col overflow-hidden origin-bottom-right`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#2d5a27] to-emerald-700 p-4 text-white flex items-center justify-between shrink-0">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center p-1 border border-white/30">
                     <img src="https://api.dicebear.com/7.x/bottts/svg?seed=KisanMitra&backgroundColor=transparent" alt="Bot" className="w-full h-full" />
                  </div>
                  <div>
                     <h3 className="font-bold text-lg leading-tight">Kisan Mitra</h3>
                     <p className="text-[10px] text-emerald-200 font-bold uppercase tracking-widest">AI Agriculture Assistant</p>
                  </div>
               </div>
               <div className="flex items-center gap-2">
                  <button 
                     onClick={() => setIsExpanded(!isExpanded)} 
                     className="p-2 hover:bg-white/20 rounded-full transition-colors hidden md:block"
                     title={isExpanded ? "Collapse" : "Expand"}
                  >
                     {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                  </button>
                  <button 
                     onClick={() => setIsOpen(false)} 
                     className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                     <X size={20} />
                  </button>
               </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-stone-50/50 space-y-4">
                {messages.map((msg) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={msg.id} 
                        className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-[#2d5a27] text-white' : 'bg-emerald-100 text-[#2d5a27]'}`}>
                           {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                        </div>
                        <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
                            msg.role === 'user' 
                            ? 'bg-[#2d5a27] text-white rounded-tr-none' 
                            : 'bg-white border text-stone-800 border-stone-200 rounded-tl-none'
                        }`}>
                            <div className={`prose prose-sm max-w-none ${msg.role === 'user' ? 'prose-invert' : ''}`}>
                                <ReactMarkdown>{msg.text}</ReactMarkdown>
                            </div>
                        </div>
                    </motion.div>
                ))}
                {isLoading && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex gap-3"
                    >
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#2d5a27] flex items-center justify-center shrink-0 shadow-sm">
                           <Bot size={16} />
                        </div>
                        <div className="bg-white border border-stone-200 rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-2">
                            <Loader2 size={18} className="animate-spin text-emerald-600" />
                            <span className="text-sm text-stone-500 font-medium tracking-wide animate-pulse">Thinking...</span>
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white/80 backdrop-blur-md border-t border-stone-200 shrink-0">
               <div className="max-w-4xl mx-auto">
                   <div className="flex items-end gap-3 bg-stone-100 rounded-3xl p-2.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] border border-stone-200 focus-within:border-[#2d5a27] focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all duration-200">
                      
                      <button className="p-3 text-stone-500 hover:text-[#2d5a27] hover:bg-emerald-50 transition-colors shrink-0 rounded-full flex items-center justify-center">
                         <Paperclip size={20} />
                      </button>

                      <textarea
                         value={input}
                         onChange={(e) => setInput(e.target.value)}
                         onKeyDown={handleKeyDown}
                         placeholder="Ask me anything about farming..."
                         className="w-full bg-transparent border-none focus:ring-0 resize-none py-3 font-medium text-stone-800 placeholder:text-stone-400 outline-none"
                         rows={Math.min(3, Math.max(1, input.split('\n').length))}
                         style={{ minHeight: '48px', maxHeight: '120px' }}
                      />

                      {input.trim() ? (
                          <button 
                             onClick={handleSend}
                             disabled={isLoading}
                             className="w-12 h-12 bg-[#2d5a27] text-white rounded-full flex items-center justify-center shadow-md hover:bg-emerald-800 transition-all shrink-0 ml-auto disabled:opacity-50"
                          >
                             <Send size={20} className="transform translate-x-0.5 -translate-y-0.5" />
                          </button>
                      ) : (
                          <button 
                             className="w-12 h-12 bg-[#2d5a27] text-white rounded-full flex items-center justify-center shadow-md hover:bg-emerald-800 transition-all shrink-0 ml-auto group"
                          >
                             <Mic size={20} className="group-hover:scale-110 transition-transform" />
                          </button>
                      )}
                   </div>
                   <p className="text-center font-medium text-xs text-stone-400 mt-3">
                       Kisan Mitra can make mistakes. Please verify important decisions.
                   </p>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
