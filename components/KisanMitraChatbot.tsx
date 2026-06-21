import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, User, Bot, Loader2, Maximize2, Minimize2, Paperclip, Mic, Settings, MapPin, Wind, Thermometer, Shovel } from 'lucide-react';
import { useAuth } from '../src/authContext';
import ReactMarkdown from 'react-markdown';
import pyqData from '../src/data/agriculture_pyqs.json';
import { GoogleGenAI } from "@google/genai";
import { KHETAI_SYSTEM_INSTRUCTION } from '../src/lib/khetai';

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
       text: 'Namaste! I am AI Ecosystem, your personal agriculture expert. How can I assist you today?\n\nI can help with:\n- 🌾 **Crop Advice & Pest Control**\n- 🌦️ **Weather & Mandi Prices**\n- 🎓 **Exam Prep (Previous Year Questions)**\n- 🚜 **Equipment Rentals & Marketplace**'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  
  // Agri Context State
  const [showConfig, setShowConfig] = useState(false);
  const [farmProfile, setFarmProfile] = useState({
    soilType: 'Alluvial',
    season: 'Kharif',
    weather: 'Sunny',
    location: 'Central India'
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const quickActions = [
    { label: 'ICAR JRF PYQs', icon: '🎓' },
    { label: 'Soil Science MCQs', icon: '🧪' },
    { label: 'Agronomy Questions', icon: '🌾' },
    { label: 'Mandi Prices', icon: '💰' }
  ];

  const handleQuickAction = (action: string) => {
    let query = "";
    if (action === 'ICAR JRF PYQs') query = "Give me some ICAR JRF Previous Year Questions from Agronomy.";
    if (action === 'Soil Science MCQs') query = "Show me some PYQs related to Soil Science (ICAR/AFO).";
    if (action === 'Agronomy Questions') query = "Give me some Agronomy PYQs with explanations.";
    if (action === 'Mandi Prices') query = "What are the latest Mandi prices for Wheat in my state?";
    
    setInput(query);
    setShowQuickActions(false);
  };


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'speechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).speechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev ? `${prev} ${transcript}` : transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const currentInput = input;
    setInput('');
    
    const historyToSend = messages.filter(m => m.id !== 'welcome').map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: currentInput }]);
    setIsLoading(true);

    try {
        let pyqContext = "";
        const lowerMsg = currentInput.toLowerCase();
        if (lowerMsg.includes('pyq') || lowerMsg.includes('previous year') || lowerMsg.includes('exam')) {
           pyqContext = `\n\n- Access to PYQs: ${JSON.stringify(pyqData.slice(0, 20))}... (and more in database)`;
        }

        const SYSTEM_INSTRUCTION = `${KHETAI_SYSTEM_INSTRUCTION}
        
        -----------------------------------
        🚜 USER FARM PROFILE
        -----------------------------------
        - Soil Type: ${farmProfile.soilType}
        - Current Season: ${farmProfile.season}
        - Current Weather: ${farmProfile.weather}
        - Location Context: ${farmProfile.location}
        
        IMPORTANT: Always tailor your crop advice, fertilizer recommendations, and irrigation schedules based on this farm profile unless the user specifies otherwise. Speak to the user as if you already know their farm's context.

        Your personality: Supportive, respectful, and speaks like a helpful village elder with deep scientific knowledge. 
        
        -----------------------------------
        🌍 LANGUAGE & MULTILINGUAL RULES
        -----------------------------------
        - You are multilingual. If the user asks in Hindi, Marathi, Gujarati, Telugu, etc., respond in that same language.
        - If the user uses "Hinglish", respond in Hinglish.
        - Always ensure the tone is culturally appropriate for Indian farmers.
        
        -----------------------------------
        🌾 AGRI-DOMAINS & WEBSITE DATA
        -----------------------------------
        - USE DATA FROM Agrigence: Guide users to specific sections like Mandi Bhav, Government Schemes, Crop Planner, Soil Analyzer, and Khatabook.
        - CROPS: Provide guidance for Rice, Wheat, Soybean, Cotton, Mustard, Horticulture crops, etc.
        - PEST CONTROL: Suggest sustainable and biological solutions alongside standard practices.
        - MANDI: If users ask for prices, guide them to the 'Mandi Bhav' tool.
        - SCHEMES: Guide to PM-Kisan, Fasal Bima Yojana, etc.
        ${pyqContext}`;

        const tempId = Date.now().toString();
        setMessages(prev => [...prev, { id: tempId, role: 'model', text: '' }]);

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
        const result = await ai.models.generateContentStream({
            model: 'gemini-1.5-flash',
            contents: [...historyToSend, { role: 'user', parts: [{ text: currentInput }] }],
            config: {
                systemInstruction: SYSTEM_INSTRUCTION
            }
        });

        let fullText = '';
        for await (const chunk of result) {
            if (chunk.text) {
                fullText += chunk.text;
                setMessages(prev => prev.map(msg => msg.id === tempId ? { ...msg, text: fullText } : msg));
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
                     <img src="https://api.dicebear.com/7.x/bottts/svg?seed=AIEcosystem&backgroundColor=transparent" alt="Bot" className="w-full h-full" />
                  </div>
                  <div>
                     <h3 className="font-bold text-lg leading-tight">AI Ecosystem</h3>
                     <p className="text-[10px] text-emerald-200 font-bold uppercase tracking-widest">AI Agriculture Assistant</p>
                  </div>
               </div>
               <div className="flex items-center gap-2">
                  <button 
                     onClick={() => setShowConfig(!showConfig)}
                     className={`p-2 hover:bg-white/20 rounded-full transition-colors ${showConfig ? 'bg-white/30' : ''}`}
                     title="Farm Profile"
                  >
                     <Settings size={18} />
                  </button>
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
            
            {/* Farm Profile Config Overlay */}
            <AnimatePresence>
              {showConfig && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-emerald-50 border-b border-emerald-100 overflow-hidden shrink-0"
                >
                  <div className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-[#2d5a27]">My Farm Profile</h4>
                      <button onClick={() => setShowConfig(false)} className="text-[#2d5a27] hover:bg-emerald-100 p-1 rounded transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-500 uppercase flex items-center gap-1">
                          <Shovel size={10} /> Soil Type
                        </label>
                        <select 
                          value={farmProfile.soilType}
                          onChange={(e) => setFarmProfile({...farmProfile, soilType: e.target.value})}
                          className="w-full bg-white border border-emerald-200 rounded-lg px-2 py-1.5 text-xs text-stone-700 outline-none focus:border-[#2d5a27] transition-all"
                        >
                          <option>Alluvial</option>
                          <option>Black Soil</option>
                          <option>Red Soil</option>
                          <option>Laterite</option>
                          <option>Arid/Desert</option>
                          <option>Peaty/Marshy</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-500 uppercase flex items-center gap-1">
                          <Wind size={10} /> Season
                        </label>
                        <select 
                          value={farmProfile.season}
                          onChange={(e) => setFarmProfile({...farmProfile, season: e.target.value})}
                          className="w-full bg-white border border-emerald-200 rounded-lg px-2 py-1.5 text-xs text-stone-700 outline-none focus:border-[#2d5a27] transition-all"
                        >
                          <option>Kharif</option>
                          <option>Rabi</option>
                          <option>Zaid</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-500 uppercase flex items-center gap-1">
                          <Thermometer size={10} /> Weather
                        </label>
                        <input 
                          type="text"
                          value={farmProfile.weather}
                          onChange={(e) => setFarmProfile({...farmProfile, weather: e.target.value})}
                          className="w-full bg-white border border-emerald-200 rounded-lg px-2 py-1.5 text-xs text-stone-700 outline-none focus:border-[#2d5a27] transition-all"
                          placeholder="e.g. Sunny, 32°C"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-500 uppercase flex items-center gap-1">
                          <MapPin size={10} /> Location
                        </label>
                        <input 
                          type="text"
                          value={farmProfile.location}
                          onChange={(e) => setFarmProfile({...farmProfile, location: e.target.value})}
                          className="w-full bg-white border border-emerald-200 rounded-lg px-2 py-1.5 text-xs text-stone-700 outline-none focus:border-[#2d5a27] transition-all"
                          placeholder="District, State"
                        />
                      </div>
                    </div>
                    <div className="pt-2">
                       <button 
                        onClick={() => setShowConfig(false)}
                        className="w-full py-2 bg-[#2d5a27] text-white text-[10px] font-bold uppercase tracking-widest rounded-lg shadow-sm hover:bg-emerald-800 transition-all"
                       >
                         Apply Profile Context
                       </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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

                {showQuickActions && messages.length === 1 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                        {quickActions.map((action, idx) => (
                            <motion.button
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * idx }}
                                onClick={() => handleQuickAction(action.label)}
                                className="px-4 py-2 bg-white border border-stone-200 rounded-full text-sm font-medium text-stone-700 hover:border-[#2d5a27] hover:text-[#2d5a27] hover:bg-emerald-50 transition-all shadow-sm"
                            >
                                <span className="mr-1">{action.icon}</span> {action.label}
                            </motion.button>
                        ))}
                    </div>
                )}
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
                             onClick={toggleListening}
                             className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-all shrink-0 ml-auto group ${isListening ? 'bg-rose-500 animate-pulse text-white' : 'bg-[#2d5a27] text-white hover:bg-emerald-800'}`}
                             title={isListening ? "Stop Listening" : "Start Voice Input"}
                          >
                             <Mic size={20} className={isListening ? 'scale-110' : 'group-hover:scale-110 transition-transform'} />
                          </button>
                      )}
                   </div>
                   <p className="text-center font-medium text-xs text-stone-400 mt-3">
                       AI Ecosystem can make mistakes. Please verify important decisions.
                   </p>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
