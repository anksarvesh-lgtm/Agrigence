import React, { useState } from 'react';
import { useAuth } from '../src/authContext';
import { 
  Bot, Send, HelpCircle, AlertCircle, Sparkles, User, Brain, BookOpen, 
  ChevronRight, Compass, Stars, MessageSquareCode, Plus
} from 'lucide-react';

export default function AiMentor() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: `Hello ${user?.name}! I am your Agriculture Competitive Exam AI Mentor. Based on your target exam selection of [${user?.targetExams?.join(', ') || 'Agricultural Exams'}] and selection of ${user?.preparationLevel} preparation level, I am ready to guide you. \n\nOur current focus: Solubilizing your Weed Ecology weak areas! What agricultural doubt can I clarify for you today?`,
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Suggested prompt pills
  const promptPills = [
    { label: 'Explain Nitrogen nitrification steps', q: 'Explain Nitrogen nitrification steps, Nitrosomonas vs Nitrobacter roles' },
    { label: 'Why does Metribuzin have Tomato safety?', q: 'Explain Metribuzin selective herbicide safety in Tomato vs Sweet Potato' },
    { label: 'Calculate 1:1:1:1 Mendelian Spore segregation', q: 'Explain and calculate the 1:1:1:1 Neurospora Mendelian spore segregation' },
    { label: 'Help me with state exam syllabus preparation', q: 'Can you propose a syllabus study timeline for my target exam?' }
  ];

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;
    
    const userMsg = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = "I am parsing your query inside our advanced agricultural context database...\n\n";
      const q = text.toLowerCase();

      if (q.includes('nitrogen') || q.includes('nitrifi')) {
        reply += "Excellent query on Soil Microbiology! Nitrogen nitrification is a 2-step biological process:\n1. **Nitrosomonas** oxidizes NH4+ to Nitrite (NO2-).\n2. **Nitrobacter** quickly converts toxic NO2- to Nitrate (NO3-), which plants absorb.\nThis process is highly pH-sensitive. At soil pH < 5.5, Nitrobacter is inhibited, leading to toxic nitrite accumulation.";
      } else if (q.includes('metribuzin') || q.includes('tomato')) {
        reply += "Superb Herbicide Kinetics question! Tomato plants possess high levels of beta-glucosidase enzymes that rapidly conjugate Metribuzin into inactive glucose compounds. Sweet potato crops lack this capability, causing Metribuzin to bind to D1 proteins in sweet potato thylakoid membranes, resulting in heavy crop injury.";
      } else if (q.includes('segregation') || q.includes('spore')) {
        reply += "Ah, advanced Genetics! A 1:1:1:1 ratio in Neurospora tetrad analysis shows independent assortment without centromeric linkages between two non-allelic markers. It occurs in first-division segregation patterns when crossing linked markers with adequate interval distance.";
      } else {
        reply += `Acknowledged! For **${user?.targetExams?.[0] || 'your target exams'}**, high-yield weighting recommends dedicating 40% of mock practice hours specifically to agronomy crop-water ratios and 20% to genetics cytological crosses. I suggest Solvong 'Soil Science Targeted Pack' Mock Test 4 next to solidify your pH metrics!`;
      }

      setMessages(prev => [...prev, { role: 'ai', text: reply }]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 p-6 md:p-8 relative overflow-hidden font-sans">
      
      {/* Background Orbs */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-emerald-600/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-teal-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-4xl mx-auto flex flex-col h-[82vh] relative z-10 border border-slate-800/80 rounded-3xl overflow-hidden bg-slate-900/10 backdrop-blur-3xl shadow-2xl">
        
        {/* Chat Header */}
        <header className="bg-gradient-to-r from-emerald-600 to-teal-600 p-5 flex items-center justify-between text-white border-b border-emerald-500/10 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-white/20 border border-white/10 rounded-2xl flex items-center justify-center font-bold relative shadow-inner">
              <Bot size={22} className="text-white animate-bounce" style={{ animationDuration: '4s' }} />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-emerald-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">AI Agriculture Competitive Exam Mentor</h2>
              <span className="text-[9px] text-emerald-100 uppercase font-black tracking-widest block">Level: {user?.preparationLevel || 'Core'} &bull; Always Online</span>
            </div>
          </div>
          <Stars size={18} className="text-emerald-250 animate-pulse hidden sm:block" />
        </header>

        {/* Conversation Area & Sidebar panel */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Main Messages Area */}
          <div className="flex-1 flex flex-col overflow-y-auto p-5 space-y-4 python-scrollbar bg-slate-950/20">
            {messages.map((m, idx) => {
              const actsAi = m.role === 'ai';
              return (
                <div key={idx} className={`flex gap-3 max-w-[85%] ${actsAi ? 'self-start' : 'self-end flex-row-reverse'}`}>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
                    actsAi ? 'bg-emerald-600/10 border border-emerald-500/20 text-emerald-400' : 'bg-slate-800 border border-slate-700 text-slate-100'
                  }`}>
                    {actsAi ? <Bot size={15} /> : <User size={15} />}
                  </div>
                  <div className={`p-4 rounded-3xl ${
                    actsAi 
                      ? 'bg-slate-900 border border-slate-800 rounded-tl-sm text-slate-205 line-height-relaxed text-xs' 
                      : 'bg-emerald-600 text-white rounded-tr-sm text-xs font-semibold'
                  } whitespace-pre-wrap`}>
                    {m.text}
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex gap-3 self-start">
                <div className="w-8 h-8 rounded-xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">
                  <Bot size={15} />
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-3xl rounded-tl-sm text-xs text-slate-400 px-5 py-3 flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-550 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-550 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-550 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>

          {/* Quick Prompts Sidebar on Desktop */}
          <aside className="hidden lg:block w-72 border-l border-slate-800/80 p-5 space-y-4 overflow-y-auto python-scrollbar bg-slate-900/15">
            <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">High Yield Quick Prompts</h3>
            <div className="flex flex-col gap-2">
              {promptPills.map((pill, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(pill.q)}
                  className="text-left p-3.5 bg-slate-900/50 hover:bg-slate-800/60 border border-slate-850 hover:border-slate-700 rounded-xl transition text-[11px] font-semibold text-slate-300 leading-normal"
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </aside>

        </div>

        {/* Chat Input Footer */}
        <footer className="p-4 bg-slate-900 border-t border-slate-800 flex flex-col gap-3 shrink-0">
          
          {/* Drills suggestions list on mobile */}
          <div className="flex lg:hidden gap-1.5 overflow-x-auto scrollbar-none pb-1">
            {promptPills.map((pill, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(pill.q)}
                className="shrink-0 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-[10px] font-bold text-slate-400"
              >
                {pill.label}
              </button>
            ))}
          </div>

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputVal);
            }} 
            className="flex gap-2"
          >
            <input 
              type="text" 
              placeholder="Ask AI Mentor a competitive doubt or request a customized study plan..." 
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-805 rounded-xl px-4 py-3 text-xs outline-none text-slate-200 focus:border-emerald-500 transition font-medium"
            />
            <button 
              type="submit" 
              className="px-5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-slate-950 rounded-xl flex items-center justify-center transition border-none font-black text-xs uppercase"
            >
              <Send size={14} className="mr-1" /> Send
            </button>
          </form>
        </footer>

      </div>
    </div>
  );
}
