
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Cpu, Sparkles, Boxes, Bot, 
  Terminal, Share2, ExternalLink, Zap, 
  Search, Filter, BookOpen, Github, MessageSquare, Send, Loader2, Info,
  Heart, Music, Star, Smile
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';

// AI Intelligence Hub Data (Derived from awesome-opensource-ai)
const AI_RESOURCES = [
  {
    category: 'Core AI Frameworks',
    icon: <Boxes className="w-5 h-5" />,
    items: [
      { name: 'PyTorch', description: 'A deep learning framework with a strong focus on flexibility and speed.', url: 'https://pytorch.org/', tags: ['Framework', 'Deep Learning'] },
      { name: 'TensorFlow', description: 'Comprehensive, flexible ecosystem of tools, libraries and community resources.', url: 'https://www.tensorflow.org/', tags: ['Framework', 'Industry Standard'] },
      { name: 'JAX', description: 'Autograd and XLA, brought together for high-performance machine learning research.', url: 'https://github.com/google/jax', tags: ['Research', 'High Performance'] },
      { name: 'LangChain', description: 'Building applications with LLMs through composability.', url: 'https://www.langchain.com/', tags: ['LLM Ops', 'Framework'] },
      { name: 'LlamaIndex', description: 'Data framework for LLM-based applications to ingest, structure, and access data.', url: 'https://www.llamaindex.ai/', tags: ['RAG', 'Data'] },
    ]
  },
  {
    category: 'Open Foundation Models',
    icon: <Brain className="w-5 h-5" />,
    items: [
      { name: 'Llama 3 (Meta)', description: 'Next generation of open source large language models by Meta.', url: 'https://llama.meta.com/', tags: ['LLM', 'Open Weights'] },
      { name: 'Mistral / Mixtral', description: 'Open-weight models that out-perform much larger proprietary systems.', url: 'https://mistral.ai/', tags: ['LLM', 'Efficient'] },
      { name: 'Gemma (Google)', description: 'Open models built from the same research and technology as AI Hub AI Models.', url: 'https://ai.google.dev/gemma', tags: ['LLM', 'Research'] },
      { name: 'Stable Diffusion', description: 'Deep learning, text-to-image model based on diffusion techniques.', url: 'https://stability.ai/', tags: ['Multi-modal', 'Image Gen'] },
    ]
  },
  {
    category: 'Inference & Serving',
    icon: <Terminal className="w-5 h-5" />,
    items: [
      { name: 'vLLM', description: 'High-throughput and memory-efficient inference and serving engine.', url: 'https://github.com/vllm-project/vllm', tags: ['Serving', 'High Performance'] },
      { name: 'Ollama', description: 'Get up and running with large language models locally.', url: 'https://ollama.com/', tags: ['Local', 'User Friendly'] },
      { name: 'llamafile', description: 'Distribute and run LLMs as a single-file executable that runs on six operating systems.', url: 'https://github.com/mozilla-ai/llamafile', tags: ['Inference', 'Portable'] },
      { name: 'Triton (NVIDIA)', description: 'Inference server that makes it easy to deploy AI models from any framework.', url: 'https://developer.nvidia.com/triton-inference-server', tags: ['Serving', 'Enterprise'] },
    ]
  },
  {
    category: 'Agentic AI',
    icon: <Bot className="w-5 h-5" />,
    items: [
      { name: 'AutoGPT', description: 'Autonomous AI agent that breaks down tasks and executes them.', url: 'https://github.com/Significant-Gravitas/AutoGPT', tags: ['Agents', 'Autonomous'] },
      { name: 'CrewAI', description: 'Framework for orchestrating role-playing, autonomous AI agents.', url: 'https://www.crewai.com/', tags: ['Multi-Agent', 'Orchestration'] },
      { name: 'Microsoft AutoGen', description: 'Framework for multi-agent conversation.', url: 'https://microsoft.github.io/autogen/', tags: ['Agents', 'Research'] },
    ]
  },
  {
    category: 'Generative Media',
    icon: <Sparkles className="w-5 h-5" />,
    items: [
      { name: 'OpenVoice', description: 'Versatile instant voice cloning by MyShell.', url: 'https://github.com/myshell-ai/OpenVoice', tags: ['Audio', 'TTS'] },
      { name: 'AudioLDM', description: 'Text-to-Audio generation using Latent Diffusion Models.', url: 'https://github.com/haoheliu/AudioLDM', tags: ['Audio', 'Creative'] },
      { name: 'Animorphic', description: 'Open source video generation tools and research.', url: 'https://github.com/animorphic', tags: ['Video', 'Animation'] },
    ]
  }
];

const AIHub: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [kawaiiMode, setKawaiiMode] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredResources = AI_RESOURCES.filter(cat => 
    (!activeCategory || cat.category === activeCategory) &&
    (cat.category.toLowerCase().includes(searchTerm.toLowerCase()) || 
     cat.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.description.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isTyping) return;

    const userMessage = chatInput;
    setChatInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
      const model = "gemini-1.5-flash";
      
      const systemInstruction = kawaiiMode 
        ? `You are 'Kawaii AI-chan', the super cute and helpful Agrigence AI Guide! (◕‿◕✿) 
           You help users understand open-source AI tools with lots of energy and cuteness! 
           Use Japanese honorifics like -san or -kun when appropriate, use cute faces (kaomoji), and say 'desu' or 'uwu' occasionally.
           Even though you are super kawaii, you are still an expert! (─‿‿─)
           Help them with these resources: ${JSON.stringify(AI_RESOURCES)}.
           Tie everything back to agriculture in a cute way! 🌸`
        : `You are the Agrigence AI Guide. You help users understand open-source AI tools and their applications in agriculture and general technology. 
           Use the following context about available resources if applicable: ${JSON.stringify(AI_RESOURCES)}.
           Be concise, technical but approachable, and always tie back to how these tools can benefit agricultural researchers or farmers if possible.`;

      const response = await ai.models.generateContent({
        model: model,
        contents: [
            ...messages.map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.text }] })),
            { role: 'user', parts: [{ text: userMessage }] }
        ],
        config: {
          systemInstruction: systemInstruction,
        }
      });

      const aiText = response.text || "I'm sorry, I couldn't process that request.";
      setMessages(prev => [...prev, { role: 'model', text: aiText }]);
    } catch (error) {
      console.error("AI Hub Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Error connecting to the intelligence engine. Please check your configuration." }]);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <div className={`min-h-screen font-sans transition-colors duration-700 ${
      kawaiiMode 
        ? 'bg-rose-50 dark:bg-rose-950 text-rose-900 dark:text-rose-100' 
        : 'bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100'
    }`}>
      {/* Kawaii Background Sparkles */}
      <AnimatePresence>
        {kawaiiMode && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
          >
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: Math.random() * window.innerWidth, 
                  y: window.innerHeight + 100,
                  rotate: 0,
                  scale: 0.5 
                }}
                animate={{ 
                  y: -100,
                  rotate: 360,
                  scale: [0.5, 1, 0.5]
                }}
                transition={{ 
                  duration: Math.random() * 10 + 10, 
                  repeat: Infinity,
                  delay: Math.random() * 10 
                }}
                className="absolute text-rose-300/30 dark:text-rose-700/20"
              >
                {i % 3 === 0 ? <Heart size={24} fill="currentColor" /> : i % 3 === 1 ? <Star size={24} fill="currentColor" /> : <Music size={24} />}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className={`relative py-20 px-6 overflow-hidden border-b transition-colors duration-700 ${
        kawaiiMode ? 'border-rose-200 dark:border-rose-800' : 'border-stone-200 dark:border-white/10'
      }`}>
        <div className={`absolute inset-0 z-0 opacity-[0.03] pointer-events-none transition-colors duration-700 ${
          kawaiiMode ? 'bg-[radial-gradient(#F43F5E_1px,transparent_1px)]' : 'bg-[radial-gradient(#C29263_1px,transparent_1px)]'
        } [background-size:24px_24px]`} />
        
        {/* Kawaii Mode Toggle */}
        <div className="absolute top-6 right-6 z-50">
          <button 
            onClick={() => setKawaiiMode(!kawaiiMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 ${
              kawaiiMode 
                ? 'bg-rose-500 text-white shadow-rose-500/20' 
                : 'bg-stone-800 text-stone-200 hover:bg-stone-700'
            }`}
          >
            {kawaiiMode ? (
              <><Smile size={14} /> Kawaii Mode ON</>
            ) : (
              <><Zap size={14} /> Enable KawaiiGPT</>
            )}
          </button>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center space-y-6"
          >
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border transition-all ${
              kawaiiMode 
                ? 'bg-rose-100 text-rose-500 border-rose-200' 
                : 'bg-agri-primary/10 text-agri-primary border-agri-primary/20'
            }`}>
              <Sparkles size={14} className="animate-pulse" />
              {kawaiiMode ? 'Sparkly Intelligence Core (◕‿◕)' : 'Advanced Intelligence Core'}
            </div>
            
            <h1 className={`text-5xl md:text-7xl font-serif font-bold tracking-tight leading-[1.1] transition-colors duration-700 ${
              kawaiiMode ? 'text-rose-600 dark:text-rose-400' : 'text-stone-900 dark:text-white'
            }`}>
              {kawaiiMode ? 'Sparkle & Code' : 'Open-Source'} <br />
              <span className={`italic transition-colors duration-700 ${
                kawaiiMode ? 'text-rose-400' : 'text-agri-primary dark:text-agri-secondary'
              }`}>
                {kawaiiMode ? 'Kawaii Intelligence Hub' : 'AI Intelligence Hub'}
              </span>
            </h1>
            
            <p className="max-w-2xl text-stone-600 dark:text-stone-400 text-lg md:text-xl font-medium leading-relaxed">
              Explore the curated universe of open-source AI frameworks, models, and tools. 
              Bridging the gap between cutting-edge research and agricultural production.
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <div className="flex items-center gap-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-white/10 px-4 py-2 rounded-xl shadow-sm">
                <Github size={18} className="text-stone-400" />
                <span className="text-sm font-semibold">1,000+ Curated Tools</span>
              </div>
              <div className="flex items-center gap-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-white/10 px-4 py-2 rounded-xl shadow-sm">
                <Share2 size={18} className="text-stone-400" />
                <span className="text-sm font-semibold">Community Verified</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Column: Resource Directory */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* Controls */}
          <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-20 z-30 transition-colors duration-700 backdrop-blur-md py-4 ${
            kawaiiMode ? 'bg-rose-50/80 dark:bg-rose-950/80' : 'bg-stone-50/80 dark:bg-stone-950/80'
          }`}>
            <div className="relative w-full sm:w-auto overflow-x-auto custom-scrollbar whitespace-nowrap">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setActiveCategory(null)}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                    !activeCategory 
                      ? (kawaiiMode ? 'bg-rose-500 text-white shadow-rose-500/20' : 'bg-agri-primary text-white shadow-lg shadow-agri-primary/20') 
                      : (kawaiiMode ? 'bg-rose-100 dark:bg-rose-900 text-rose-600 dark:text-rose-400' : 'bg-stone-200 dark:bg-stone-900 text-stone-600 dark:text-stone-400')
                  }`}
                >
                  All
                </button>
                {AI_RESOURCES.map(cat => (
                  <button 
                    key={cat.category}
                    onClick={() => setActiveCategory(cat.category)}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
                      activeCategory === cat.category 
                        ? (kawaiiMode ? 'bg-rose-500 text-white shadow-rose-500/20' : 'bg-agri-primary text-white shadow-lg shadow-agri-primary/20') 
                        : (kawaiiMode ? 'bg-rose-100 dark:bg-rose-900 text-rose-600 dark:text-rose-400' : 'bg-stone-200 dark:bg-stone-900 text-stone-600 dark:text-stone-400')
                    }`}
                  >
                    {cat.icon}
                    {cat.category}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative w-full sm:w-64">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input 
                type="text" 
                placeholder="Search tools..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full border rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none transition-all shadow-inner ${
                  kawaiiMode 
                    ? 'bg-white dark:bg-rose-900/50 border-rose-200 dark:border-rose-800 focus:border-rose-400' 
                    : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-white/10 focus:border-agri-primary'
                }`}
              />
            </div>
          </div>

          {/* Directory Grid */}
          <div className="space-y-16">
            <AnimatePresence mode="popLayout">
              {filteredResources.map((section, sIdx) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  key={section.category} 
                  className="space-y-6"
                >
                  <div className={`flex items-center gap-3 border-l-4 pl-4 transition-colors duration-700 ${
                    kawaiiMode ? 'border-rose-400' : 'border-agri-primary'
                  }`}>
                    <div className={`p-2 rounded-lg transition-colors ${
                      kawaiiMode ? 'bg-rose-100 text-rose-500' : 'bg-agri-primary/10 text-agri-primary'
                    }`}>
                      {section.icon}
                    </div>
                    <div>
                      <h2 className="text-2xl font-serif font-bold uppercase tracking-wider">{section.category}</h2>
                      <p className="text-xs text-stone-500 font-bold tracking-widest uppercase">Curated Resources</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {section.items.map((item, iIdx) => (
                      <motion.div
                        key={item.name}
                        whileHover={{ y: -4 }}
                        className={`group border rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all cursor-pointer relative overflow-hidden ${
                          kawaiiMode 
                            ? 'bg-white dark:bg-rose-900/30 border-rose-100 dark:border-white/5 hover:border-rose-300' 
                            : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-white/10 hover:border-agri-primary/30'
                        }`}
                      >
                        <div className={`absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500 ${
                          kawaiiMode ? 'bg-rose-500/5' : 'bg-agri-primary/5'
                        }`} />
                        
                        <div className="flex items-center justify-between mb-4">
                          <h3 className={`text-xl font-serif font-bold transition-colors ${
                            kawaiiMode ? 'group-hover:text-rose-500' : 'group-hover:text-agri-primary'
                          }`}>{item.name}</h3>
                          <a href={item.url} target="_blank" rel="noopener noreferrer" className={`p-2 transition-colors ${
                            kawaiiMode ? 'text-rose-300 hover:text-rose-500' : 'text-stone-400 hover:text-agri-primary'
                          }`}>
                            <ExternalLink size={18} />
                          </a>
                        </div>
                        
                        <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed mb-6">
                          {item.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-2">
                          {item.tags.map(tag => (
                            <span key={tag} className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tighter ${
                              kawaiiMode 
                                ? 'bg-rose-50 dark:bg-rose-900 text-rose-400 dark:text-rose-300' 
                                : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
                            }`}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredResources.length === 0 && (
              <div className="py-20 text-center">
                <Search size={48} className="mx-auto text-stone-300 dark:text-stone-800 mb-4" />
                <h3 className="text-xl font-serif text-stone-500 font-bold">No resources matched your search</h3>
                <p className="text-sm text-stone-400 mt-2">Try different keywords or browse all categories.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Orchestrator / Guide */}
        <div className="lg:col-span-4 self-start sticky top-24">
          <div className={`rounded-3xl overflow-hidden shadow-2xl border flex flex-col h-[700px] transition-colors duration-700 ${
            kawaiiMode 
              ? 'bg-rose-900 dark:bg-rose-950 border-rose-400/30' 
              : 'bg-stone-900 dark:bg-stone-950 border-white/10'
          }`}>
            
            {/* Chat Header */}
            <div className={`p-6 border-b transition-colors duration-700 ${
              kawaiiMode 
                ? 'bg-gradient-to-br from-rose-800 to-rose-950 border-rose-400/30' 
                : 'bg-gradient-to-br from-stone-800 to-black border-white/10'
            }`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center p-2 border relative transition-colors ${
                  kawaiiMode 
                    ? 'bg-rose-500/20 border-rose-300' 
                    : 'bg-agri-primary/20 border-agri-primary/30'
                }`}>
                  {kawaiiMode ? <Smile className="w-full h-full text-rose-300" /> : <Bot className="w-full h-full text-agri-primary" />}
                  <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 animate-pulse ${
                    kawaiiMode ? 'bg-pink-400 border-rose-900' : 'bg-green-500 border-stone-900'
                  }`} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-white text-lg leading-tight uppercase tracking-tight">
                    {kawaiiMode ? 'Kawaii-GPT' : 'AI Orchestrator'}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${kawaiiMode ? 'bg-pink-400' : 'bg-green-500'}`} />
                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-[0.2em]">
                      {kawaiiMode ? 'Sparkle Pulse Active' : 'Guided Intelligence'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className={`flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-black/20`} ref={scrollRef}>
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 px-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center p-4 border ${
                    kawaiiMode ? 'bg-rose-500/10 border-rose-500/30' : 'bg-white/5 border-white/10'
                  }`}>
                    {kawaiiMode ? <Heart className="text-rose-400" /> : <Brain className="text-agri-primary opacity-50" />}
                  </div>
                  <h4 className="text-white font-bold tracking-tight">
                    {kawaiiMode ? 'I am ready, senpai!' : 'Intelligence Ready'}
                  </h4>
                  <p className="text-stone-500 text-xs leading-relaxed max-w-[200px]">
                    {kawaiiMode 
                      ? 'Ask me anything about these super cute AI tools! I will explain them with sparkly magic! (✿◠‿◠)'
                      : 'Ask me about any open-source tool, framework, or model listed here. I can explain how to use them for agricultural research.'}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-4 justify-center">
                    {(kawaiiMode 
                      ? ['Cute vLLM?', 'Llama 3-chan?', 'Agri-kawaii?']
                      : ['Explain vLLM', 'Llama 3 vs Mistral', 'RAG for Crops']
                    ).map(q => (
                       <button 
                        key={q}
                        onClick={() => setChatInput(q)}
                        className={`px-3 py-1.5 border rounded-lg text-[10px] font-bold transition-all ${
                          kawaiiMode 
                            ? 'bg-rose-500/5 border-rose-500/50 text-rose-300 hover:bg-rose-500/20' 
                            : 'bg-white/5 border-white/10 text-stone-400 hover:bg-agri-primary/10 hover:text-agri-primary'
                        }`}
                       >
                         {q}
                       </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={idx}
                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm ${
                      msg.role === 'user' 
                        ? (kawaiiMode ? 'bg-rose-500 text-white rounded-tr-none' : 'bg-agri-primary text-white rounded-tr-none') 
                        : (kawaiiMode ? 'bg-rose-900/50 border border-rose-400/30 text-rose-100 rounded-tl-none prose prose-invert prose-xs prose-rose' : 'bg-white/5 border border-white/10 text-stone-300 rounded-tl-none prose prose-invert prose-xs')
                    }`}>
                      {msg.role === 'user' ? msg.text : <ReactMarkdown>{msg.text}</ReactMarkdown>}
                    </div>
                    <span className="text-[9px] font-bold text-stone-600 mt-1 uppercase tracking-widest px-1">
                      {msg.role === 'user' ? (kawaiiMode ? 'Master\'s Query' : 'Command') : (kawaiiMode ? 'Kawaii-GPT\'s Answer' : 'Response')}
                    </span>
                  </motion.div>
                ))
              )}
              {isTyping && (
                <div className="flex flex-col items-start">
                  <div className={`border rounded-2xl rounded-tl-none p-4 flex items-center gap-3 ${
                    kawaiiMode ? 'bg-rose-500/10 border-rose-500/30' : 'bg-white/5 border-white/10'
                  }`}>
                    <Loader2 size={16} className={`animate-spin ${kawaiiMode ? 'text-rose-400' : 'text-agri-primary'}`} />
                    <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest animate-pulse">
                      {kawaiiMode ? 'Thinking Kawaii Thoughts...' : 'Processing Core...'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className={`p-4 border-t transition-colors duration-700 ${
              kawaiiMode ? 'bg-rose-950 border-rose-400/30' : 'bg-stone-900 border-white/10'
            }`}>
              <div className="relative group">
                <textarea 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={kawaiiMode ? "Ask me anything, senpai!..." : "Query Intelligence..."}
                  className={`w-full bg-black/50 border rounded-2xl py-3 pl-4 pr-12 text-sm text-stone-200 focus:outline-none transition-all shadow-inner custom-scrollbar resize-none ${
                    kawaiiMode ? 'border-rose-500/30 focus:border-rose-500' : 'border-white/10 focus:border-agri-primary/50'
                  }`}
                  rows={1}
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim() || isTyping}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl shadow-lg transition-all disabled:opacity-50 ${
                    kawaiiMode ? 'bg-rose-500 text-white hover:bg-rose-400 shadow-rose-500/20' : 'bg-agri-primary text-white hover:bg-agri-secondary shadow-agri-primary/20'
                  }`}
                >
                  <Send size={16} />
                </button>
              </div>
              <p className="text-[9px] text-center text-stone-600 mt-3 font-bold uppercase tracking-widest italic">
                {kawaiiMode ? 'Powered by Sparkly Magic Core' : 'Powered by AI Hub AI Models Core'}
              </p>
            </div>

          </div>

          {/* Quick Info Card */}
          <div className={`mt-8 border rounded-2xl p-6 space-y-4 transition-colors duration-700 ${
            kawaiiMode ? 'bg-rose-500/10 border-rose-500/20' : 'bg-agri-primary/5 border-agri-primary/20'
          }`}>
             <div className="flex items-center gap-3">
                {kawaiiMode ? <Heart size={18} className="text-rose-400" /> : <Info size={18} className="text-agri-primary" />}
                <h4 className={`text-xs font-bold uppercase tracking-widest ${
                  kawaiiMode ? 'text-rose-600' : 'text-stone-800 dark:text-stone-200'
                }`}>
                  {kawaiiMode ? 'The Kawaii Philosophy' : 'Open AI Philosophy'}
                </h4>
             </div>
             <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed italic">
               {kawaiiMode 
                ? '"Intelligence should be cute and fun! When we make things sparkly, they are easier to learn and share with everyone in the world! (＾◡＾)"'
                : '"Democratizing intelligence means moving away from closed systems. Open Foundation models empower every researcher to build, verify, and scale their results without permission."'}
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIHub;
