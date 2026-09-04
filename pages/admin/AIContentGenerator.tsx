
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, Sparkles, RefreshCw, CheckCircle2, AlertCircle, 
  Settings, History, Wand2, FileText, Globe, ExternalLink,
  Table as TableIcon, Calendar, ArrowRight, Zap, Megaphone
} from 'lucide-react';
import { db } from '../../src/firebase';
import { collection, query, orderBy, limit, getDocs, doc, setDoc } from 'firebase/firestore';
import { 
  generateDailyBlogPrompt, 
  generateDailyNewsAndInnovationsPrompt,
  generateDailySchemesAndSubsidiesPrompt
} from '../../src/server/autoContentGenerator';
import { addDoc } from 'firebase/firestore';
import { GoogleGenAI } from "@google/genai";
import { AGRIGENCE_ASSISTANT_SYSTEM_INSTRUCTION } from '../../src/lib/agrigenceAssistant';

const AIContentGenerator: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [recentBlogs, setRecentBlogs] = useState<any[]>([]);
  const [recentNews, setRecentNews] = useState<any[]>([]);
  const [recentSchemes, setRecentSchemes] = useState<any[]>([]);

  useEffect(() => {
    fetchAllRecent();
  }, []);

  const fetchAllRecent = async () => {
    fetchRecentBlogs();
    fetchRecentNews();
    fetchRecentSchemes();
  };

  const fetchRecentNews = async () => {
    try {
      const q = query(collection(db, 'news'), orderBy('date', 'desc'), limit(5));
      const snap = await getDocs(q);
      setRecentNews(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (e) {
      console.error("Error fetching news:", e);
    }
  };

  const fetchRecentSchemes = async () => {
    try {
      const q = query(collection(db, 'govt_schemes'), orderBy('createdAt', 'desc'), limit(5));
      const snap = await getDocs(q);
      setRecentSchemes(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (e) {
      console.error("Error fetching schemes:", e);
    }
  };


  const fetchRecentBlogs = async () => {
    try {
      const q = query(
        collection(db, 'articles'), 
        orderBy('submissionDate', 'desc'),
        limit(100)
      );
      const snapshot = await getDocs(q);
      const blogs = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((b: any) => b.type === 'BLOG' && b.authorName === 'Agrigence AI Publisher')
        .slice(0, 5);
      setRecentBlogs(blogs);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    }
  };

  const handleGenerateBlog = async () => {
    setIsGenerating(true);
    setStatus('running');
    setMessage('Connecting to Advanced AI Models Engine...');
    
    try {
      const prompt = generateDailyBlogPrompt();
      
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
      const result = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          systemInstruction: AGRIGENCE_ASSISTANT_SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json'
        }
      });

      const blogData = JSON.parse(result.text || '{}');

      if (!blogData || !blogData.slug) {
        throw new Error("Failed to generate valid blog data.");
      }

      setMessage('Saving blog to database...');

      const blogDoc = {
        title: blogData.title,
        slug: blogData.slug,
        metaDescription: blogData.meta_description,
        content: blogData.content_html,
        schema: blogData.schema,
        keyword: blogData.keyword,
        type: 'BLOG',
        status: 'PUBLISHED',
        authorName: 'Agrigence AI Publisher',
        authorId: '', // Empty ID ensures public visibility in Blogs.tsx logic
        submissionDate: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        featuredImage: blogData.featured_image || 'https://images.unsplash.com/photo-1592982537447-6f2a6a0c7c18?q=80&w=2070&auto=format&fit=crop',
        tags: ['AI Generated', 'Trending', blogData.keyword]
      };

      const docRef = doc(db, 'articles', blogData.slug);
      await setDoc(docRef, blogDoc);

      setStatus('success');
      setMessage('Successfully generated and published today\'s trending blog!');
      fetchRecentBlogs();
    } catch (error: any) {
      console.error("Frontend Gen Error:", error);
      setStatus('error');
      setMessage(error.message || 'Error occurred during AI generation.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateNews = async () => {
    setIsGenerating(true);
    setStatus('running');
    setMessage('Generating Daily News & Tech Innovations...');
    
    try {
      const prompt = generateDailyNewsAndInnovationsPrompt();
      
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
      const result = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          systemInstruction: AGRIGENCE_ASSISTANT_SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json'
        }
      });

      const jsonData = JSON.parse(result.text || '{}');

      if (!jsonData || !jsonData.news_items) {
        throw new Error("Failed to generate valid news data.");
      }

      for (const item of jsonData.news_items) {
        const newsDoc = {
          ...item,
          date: new Date().toISOString().split('T')[0],
          publishDate: new Date().toISOString()
        };
        await addDoc(collection(db, 'news'), newsDoc);
      }

      setStatus('success');
      setMessage(`Successfully generated ${jsonData.news_items.length} news items!`);
      fetchRecentNews();
    } catch (error: any) {
      console.error("News Gen Error:", error);
      setStatus('error');
      setMessage(error.message || 'Error code during News generation.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateSchemes = async () => {
    setIsGenerating(true);
    setStatus('running');
    setMessage('Generating Daily Schemes & Subsidies...');
    
    try {
      const prompt = generateDailySchemesAndSubsidiesPrompt();
      
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
      const result = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          systemInstruction: AGRIGENCE_ASSISTANT_SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json'
        }
      });

      const data = JSON.parse(result.text || '{}');

      if (!data || !data.schemes) {
        throw new Error("Failed to generate valid schemes data.");
      }

      for (const item of data.schemes) {
        const schemeDoc = {
          ...item,
          createdAt: new Date().toISOString(),
          isActive: true
        };
        await addDoc(collection(db, 'govt_schemes'), schemeDoc);
      }

      setStatus('success');
      setMessage(`Successfully generated ${data.schemes.length} schemes & subsidies!`);
      fetchRecentSchemes();
    } catch (error: any) {
      console.error("Schemes Gen Error:", error);
      setStatus('error');
      setMessage(error.message || 'Error occurred during Schemes generation.');
    } finally {
      setIsGenerating(false);
    }
  };
  const handleUpdateMandis = async () => {
    setIsGenerating(true);
    setStatus('running');
    setMessage('Connecting to Market Data Engine...');
    
    try {
      const adminKey = localStorage.getItem('admin_api_key') || '';
      const response = await fetch('/api/admin/trigger-mandi-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setStatus('success');
        setMessage('Successfully updated Mandi Bhav landing pages with latest data!');
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to update Mandi content.');
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || 'Network error occurred during update.');
    } finally {
      setIsGenerating(false);
    }
  };

  const automationStats = [
    { label: 'Cron Status', value: 'Active', icon: RefreshCw, color: 'text-green-600' },
    { label: 'Next Run', value: '07:00 AM (Daily)', icon: Calendar, color: 'text-blue-600' },
    { label: 'Model', value: 'Advanced AI Models', icon: Bot, color: 'text-purple-600' },
    { label: 'Target Regions', value: 'UP, Bihar, RJ', icon: Globe, color: 'text-amber-600' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900 flex items-center gap-3">
            <Bot className="text-agri-secondary" />
            AI Content Programming Hub
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage and monitor automated SEO-optimized content generation.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 text-xs font-black uppercase tracking-widest rounded-full border border-green-200">
           <Zap size={14} className="animate-pulse" /> Automation Live
        </div>
      </div>

      {/* Grid Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {automationStats.map((stat, idx) => (
          <div key={idx} className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
            <div className={`p-2 w-fit rounded-lg bg-gray-50 ${stat.color} mb-4`}>
              <stat.icon size={20} />
            </div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">{stat.label}</p>
            <p className="text-lg font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Management Actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded-[2rem] p-8 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Sparkles size={20} className="text-agri-secondary" /> 
              Manual Content Operations
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Blog Generator Card */}
              <div className="border border-gray-100 rounded-2xl p-6 bg-gradient-to-br from-white to-gray-50/30">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Wand2 size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Blog Generator</h3>
                    <p className="text-xs text-gray-400 tracking-tight">AI trends for farmers</p>
                  </div>
                </div>
                <button 
                  onClick={handleGenerateBlog}
                  disabled={isGenerating}
                  className="w-full py-3 bg-agri-secondary text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-agri-secondary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isGenerating ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />} 
                  Run Blog Gen
                </button>
              </div>

              {/* News Generator Card */}
              <div className="border border-gray-100 rounded-2xl p-6 bg-gradient-to-br from-white to-gray-50/30">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    <Megaphone size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">News & Job alerts</h3>
                    <p className="text-xs text-gray-400 tracking-tight">Innovations & Career</p>
                  </div>
                </div>
                <button 
                  onClick={handleGenerateNews}
                  disabled={isGenerating}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isGenerating ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />} 
                  Run News Gen
                </button>
              </div>

              {/* Schemes Generator Card */}
              <div className="border border-gray-100 rounded-2xl p-6 bg-gradient-to-br from-white to-gray-50/30">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Schemes & Subsidies</h3>
                    <p className="text-xs text-gray-400 tracking-tight">3 daily Govt offers</p>
                  </div>
                </div>
                <button 
                  onClick={handleGenerateSchemes}
                  disabled={isGenerating}
                  className="w-full py-3 bg-orange-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-orange-600/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isGenerating ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />} 
                  Run Scheme Gen
                </button>
              </div>

              {/* Mandi Page Updater (Existing) */}
              <div className="border border-gray-100 rounded-2xl p-6 bg-gradient-to-br from-white to-gray-50/30">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                    <TableIcon size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Mandi Updater</h3>
                    <p className="text-xs text-gray-400 tracking-tight">Latest market prices</p>
                  </div>
                </div>
                <button 
                  onClick={handleUpdateMandis}
                  disabled={isGenerating}
                  className="w-full py-3 bg-white border border-gray-200 text-gray-900 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isGenerating ? <RefreshCw size={14} className="animate-spin" /> : <RefreshCw size={14} />} 
                  Update Mandis
                </button>
              </div>
            </div>

            {/* Status Messages */}
            {status !== 'idle' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-8 p-4 rounded-xl border flex items-start gap-3 ${
                  status === 'running' ? 'bg-blue-50 border-blue-200 text-blue-800' :
                  status === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
                  'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                {status === 'running' ? <RefreshCw className="animate-spin mt-0.5" size={18} /> :
                 status === 'success' ? <CheckCircle2 className="mt-0.5" size={18} /> :
                 <AlertCircle className="mt-0.5" size={18} />}
                <div>
                  <p className="text-sm font-bold">{status === 'running' ? 'Process in Progress' : status === 'success' ? 'Success' : 'Operation Failed'}</p>
                  <p className="text-xs opacity-90 mt-1">{message}</p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Recent News & Schemes Logs */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white border border-gray-200 rounded-[2rem] p-8 shadow-sm">
               <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center justify-between">
                  <span className="flex items-center gap-2"><Megaphone size={20} className="text-blue-400" /> Recent News</span>
                  <button onClick={fetchRecentNews} className="text-[10px] uppercase font-black tracking-widest text-blue-600 hover:underline">Refresh</button>
               </h2>
               <div className="space-y-4">
                  {recentNews.length > 0 ? recentNews.map((n, i) => (
                    <div key={i} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <p className="text-sm font-bold text-gray-900 line-clamp-1">{n.title}</p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">
                          {n.date}
                        </p>
                        {n.relevantLink && (
                          <a href={n.relevantLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-[10px] font-bold">Reference</a>
                        )}
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-10 text-gray-400 text-xs italic">No news generated yet</div>
                  )}
               </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-[2rem] p-8 shadow-sm">
               <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center justify-between">
                  <span className="flex items-center gap-2"><CheckCircle2 size={20} className="text-orange-400" /> Recent Schemes</span>
                  <button onClick={fetchRecentSchemes} className="text-[10px] uppercase font-black tracking-widest text-orange-600 hover:underline">Refresh</button>
               </h2>
               <div className="space-y-4">
                  {recentSchemes.length > 0 ? recentSchemes.map((s, i) => (
                    <div key={i} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <p className="text-sm font-bold text-gray-900 line-clamp-1">{s.title}</p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">
                          {s.subsidyAmount || 'Subsidized'}
                        </p>
                        <span className="px-2 py-0.5 bg-white border border-gray-200 rounded text-[8px] font-bold uppercase">{s.state || 'Central'}</span>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-10 text-gray-400 text-xs italic">No schemes generated yet</div>
                  )}
               </div>
            </div>
          </div>
        </div>

        {/* Sidebar Settings/Help */}
        <div className="space-y-6">
           <div className="bg-agri-primary text-white rounded-[2rem] p-8 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-agri-secondary mb-6 flex items-center gap-2">
                <Settings size={14} /> System Configuration
              </h3>
              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/50 block mb-2">Target Market</label>
                    <p className="text-sm font-bold">India (Agricultural Sector)</p>
                 </div>
                 <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/50 block mb-2">Top Priority States</label>
                    <div className="flex flex-wrap gap-2">
                       {['UP', 'Bihar', 'Rajasthan', 'Haryana'].map(s => (
                         <span key={s} className="px-2 py-1 bg-white/10 rounded-md text-[10px] font-bold">{s}</span>
                       ))}
                    </div>
                 </div>
                 <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/50 block mb-2">Primary AI Engine</label>
                    <p className="text-sm font-bold flex items-center gap-2">
                       Advanced AI Models <span className="px-2 py-0.5 bg-green-500 text-white rounded text-[8px] uppercase tracking-tighter">Connected</span>
                    </p>
                 </div>
              </div>
              <div className="mt-10 pt-8 border-t border-white/10">
                 <p className="text-xs text-white/60 leading-relaxed italic">
                   "Automated SEO targeting helps Agrigence rank for daily spikes in mandi prices and government policy changes."
                 </p>
              </div>
           </div>

           <div className="bg-white border border-gray-200 rounded-[2rem] p-8 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 mb-6">Automation Benefits</h3>
              <ul className="space-y-4">
                 {[
                   'Improves Domain Authority',
                   'Captures Long-tail Keywords',
                   'AI Snippet Ready Content',
                   'Zero Manual Intervention'
                 ].map((item, i) => (
                   <li key={i} className="flex items-center gap-3 text-xs font-bold text-gray-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-agri-secondary shrink-0" />
                      {item}
                   </li>
                 ))}
              </ul>
              <button className="w-full mt-8 flex items-center justify-between group py-2">
                 <span className="text-[10px] font-black uppercase tracking-widest text-agri-secondary">View Content Strategy</span>
                 <ArrowRight size={14} className="text-agri-secondary group-hover:translate-x-1 transition-transform" />
              </button>
           </div>
        </div>

      </div>
    </div>
  );
};

export default AIContentGenerator;
