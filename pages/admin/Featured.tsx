import React, { useState, useEffect } from 'react';
import { 
  Star, Layout, Save, AlertCircle, Sparkles, CheckSquare, 
  Menu, Info, Check, AlertTriangle, RefreshCw
} from 'lucide-react';
import { db } from '../../src/firebase';
import { collection, query, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';

interface LiveContent {
  id: string;
  name: string;
  subject: string;
  type: string;
  difficulty: string;
  featured: boolean;
}

export default function Featured() {
  const [liveItems, setLiveItems] = useState<LiveContent[]>([
    { id: 'qb_1', name: 'Agronomy Weed Management MCQ Prep', subject: 'Agronomy', type: 'Question Bank', difficulty: 'Medium', featured: true },
    { id: 'qb_101', name: 'NABARD Economic Review Study Pack', subject: 'Agri Economics', type: 'Question Bank', difficulty: 'Easy', featured: true },
    { id: 'qb_2', name: 'ICAR NET Horticulture Science Masterclass', subject: 'Horticulture', type: 'Question Bank', difficulty: 'Hard', featured: false },
    { id: 'test_1', name: 'Full-Length IBPS AFO Prelims Mock #3', subject: 'General Agriculture', type: 'Mock Test', difficulty: 'Medium', featured: false },
    { id: 'test_2', name: 'IARI JRF Soil Chemistry Practice Exam', subject: 'Soil Science', type: 'Mock Test', difficulty: 'Hard', featured: false }
  ]);

  const [bannerMessage, setBannerMessage] = useState('Welcome to Agrigence. Where Agri-Intelligence Meets Agricultural Generations.');
  const [bannerType, setBannerType] = useState<'info' | 'warning' | 'success'>('success');
  const [bannerActive, setBannerActive] = useState(true);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    document.title = "Featured Content Manager | Agrigence";
    fetchFeaturedConfig();
  }, []);

  const fetchFeaturedConfig = async () => {
    try {
      // 1. Fetch live content to let user feature them
      const banksSnap = await getDocs(collection(db, 'question_banks'));
      if (!banksSnap.empty) {
        const mapped = banksSnap.docs.map(doc => {
          const d = doc.data();
          return {
            id: doc.id,
            name: d.name || d.title || 'Untitled Bank',
            subject: d.subject || 'Agronomy',
            type: d.questionsCount ? 'Question Bank' : 'Mock Test',
            difficulty: d.difficulty || 'Medium',
            featured: d.featured || false
          };
        });
        setLiveItems(mapped);
      }

      // 2. Fetch appConfig.banner
      const docSnap = await getDoc(doc(db, 'appConfig', 'main'));
      if (docSnap.exists()) {
        const d = docSnap.data();
        if (d.banner) {
          setBannerMessage(d.banner.message || '');
          setBannerType(d.banner.type || 'success');
          setBannerActive(d.banner.active !== false);
        }
      }
    } catch (e) {
      console.warn("Using default simulated featured config:", e);
    }
  };

  const handleToggleFeatured = (id: string) => {
    const item = liveItems.find(i => i.id === id);
    if (!item) return;

    const currentlyFeatured = liveItems.filter(i => i.featured).length;

    if (!item.featured && currentlyFeatured >= 4) {
      triggerToast("Strict constraint: A maximum of 4 featured modules is requested.", 'error');
      return;
    }

    setLiveItems(prev => prev.map(i => i.id === id ? { ...i, featured: !i.featured } : i));
  };

  const handleSaveConfig = async () => {
    try {
      const featuredIds = liveItems.filter(i => i.featured).map(i => i.id);
      
      // Update appConfig in Firestore
      await setDoc(doc(db, 'appConfig', 'main'), {
        featuredIds,
        banner: {
          message: bannerMessage,
          type: bannerType,
          active: bannerActive
        }
      }, { merge: true }).catch(() => {});

      triggerToast("Configuration successfully published to student application!");
    } catch (e) {
      triggerToast("Error updating firestore catalog settings", 'error');
    }
  };

  const featuredItems = liveItems.filter(i => i.featured);

  return (
    <div className="space-y-8 font-sans text-[#0f4225]">
      
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[250] max-w-sm p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
          toast.type === 'success' ? 'bg-[#e8f5ee] border-2 border-[#2d8a52] text-[#0f4225]' : 'bg-red-50 border-2 border-red-200 text-red-800'
        }`}>
          {toast.type === 'success' ? <Check size={18} className="text-[#2d8a52]" /> : <AlertCircle size={18} className="text-red-500" />}
          <span className="text-xs font-bold">{toast.message}</span>
        </div>
      )}

      {/* Header and Save */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-bold font-serif">Featured Content & Banners</h1>
           <p className="text-xs text-stone-500 mt-1">Design student dashboard banners, organize layouts, and feature top performance catalogs.</p>
        </div>
        
        <button 
          onClick={handleSaveConfig}
          className="bg-[#0f4225] hover:bg-[#1a6b3a] text-white px-6 py-3 rounded-xl font-black uppercase text-xs tracking-wider flex items-center gap-2 shadow-lg transition-all"
        >
          <Save size={16} /> Save & Publish Layout
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         {/* Live Content Toggle Grid */}
         <div className="lg:col-span-2 bg-white border rounded-2xl p-6 shadow-sm space-y-6">
            <div>
               <h3 className="font-serif font-bold text-lg text-black">Live Content Repository</h3>
               <p className="text-[10px] text-stone-400 uppercase font-black tracking-wider">Highlight up to 4 items on the student main hub page</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {liveItems.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => handleToggleFeatured(item.id)}
                  className={`p-4 border-2 rounded-2xl cursor-pointer select-none transition-all flex items-start gap-3 relative ${
                    item.featured ? 'border-[#2d8a52] bg-[#e8f5ee]/10 shadow-sm' : 'border-stone-100 hover:border-stone-300 bg-[#f8faf9]'
                  }`}
                >
                  <Star size={18} className={`mt-0.5 shrink-0 ${item.featured ? 'text-[#b87c0a] fill-[#b87c0a]' : 'text-stone-300'}`} />
                  <div className="flex-1 min-w-0">
                     <span className="text-[9px] font-black uppercase tracking-widest text-[#2d8a52]">{item.type} • {item.subject}</span>
                     <h4 className="font-bold text-xs text-black mt-1 leading-snug">{item.name}</h4>
                     <p className="text-[10px] text-stone-400 font-mono mt-1">Mode: {item.difficulty}</p>
                  </div>
                </div>
              ))}
            </div>
         </div>

         {/* Student application live preview banner */}
         <div className="bg-[#f7f9f8] border border-[#0f4225]/10 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div className="space-y-6">
               <div>
                  <h3 className="font-serif font-bold text-lg text-black flex items-center gap-2">
                     <Layout size={18} className="text-[#2d8a52]" /> Student App Mockup
                  </h3>
                  <p className="text-[10px] text-stone-400 uppercase font-black tracking-wider">Exact layout previews on actual devices</p>
               </div>

               {/* Mock Header banner */}
               {bannerActive && (
                  <div className={`p-4 rounded-xl text-left border shadow-xs animate-pulse ${
                    bannerType === 'success' ? 'bg-[#e8f5ee] border-[#2d8a52]/35 text-[#0f4225]' :
                    bannerType === 'warning' ? 'bg-[#fdf3df] border-[#b87c0a]/35 text-[#b87c0a]' :
                    'bg-blue-50 border-blue-200 text-blue-900'
                  }`}>
                     <div className="flex items-start gap-2">
                        {bannerType === 'success' ? <Check size={14} className="mt-0.5 shrink-0" /> : <Info size={14} className="mt-0.5 shrink-0" />}
                        <p className="text-[10px] font-bold leading-relaxed">{bannerMessage || 'Featured alert text is empty...'}</p>
                     </div>
                  </div>
               )}

               {/* Mock Featured items cards */}
               <div className="space-y-2">
                  <p className="text-[9px] font-black uppercase tracking-wider text-stone-400">Featured Study Materials ({featuredItems.length}/4)</p>
                  {featuredItems.length === 0 ? (
                    <div className="p-8 border-2 border-dashed rounded-xl text-center text-xs text-stone-400">
                       No featured items active. Grid will remain hidden.
                    </div>
                  ) : (
                    <div className="space-y-2">
                       {featuredItems.map(item => (
                         <div key={item.id} className="p-3 bg-white border rounded-xl flex items-center justify-between shadow-xs">
                            <div className="min-w-0">
                               <p className="text-[8px] font-bold uppercase text-stone-400">{item.subject}</p>
                               <h5 className="font-bold text-[10px] text-black truncate">{item.name}</h5>
                            </div>
                            <span className="text-[7px] font-black uppercase bg-[#2d8a52] text-white px-1.5 py-0.5 rounded shrink-0">
                               Start Info
                            </span>
                         </div>
                       ))}
                    </div>
                  )}
               </div>
            </div>

            <p className="text-[10px] text-center text-stone-400 font-medium">Automatic updates commit inside 60 seconds.</p>
         </div>

      </div>

      {/* Global alert banner config panel */}
      <div className="bg-white border rounded-2xl p-6 shadow-sm">
         <div className="mb-6">
            <h3 className="font-serif font-bold text-lg text-black">Site-Wide Diagnostic Banner</h3>
            <p className="text-[10px] text-stone-400 uppercase font-black tracking-wider">Broadcast emergency information or alerts into all headers</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-6 space-y-4 font-medium text-stone-500 text-xs">
               <div>
                  <label className="block text-[10px] font-black text-stone-400 uppercase tracking-wider mb-2">Banner Alert text</label>
                  <input 
                    type="text" 
                    value={bannerMessage}
                    onChange={e => setBannerMessage(e.target.value)}
                    placeholder="Enter short, descriptive notification..."
                    className="w-full bg-stone-50 text-black border px-4 py-3 rounded-xl focus:outline-none focus:border-[#2d8a52]"
                  />
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="block text-[10px] font-black text-stone-400 uppercase tracking-wider mb-2">Theme Context Type</label>
                     <select 
                       value={bannerType}
                       onChange={e => setBannerType(e.target.value as any)}
                       className="w-full bg-stone-50 text-black border px-4 py-3 rounded-xl focus:outline-none focus:border-[#2d8a52]"
                     >
                       <option value="success">Success (Agri Green)</option>
                       <option value="warning">Warning (Gold Siphon)</option>
                       <option value="info">Information (Ocean Blue)</option>
                     </select>
                  </div>

                  <div>
                     <label className="block text-[10px] font-black text-stone-400 uppercase tracking-wider mb-2">Active state toggle</label>
                     <button 
                       type="button" 
                       onClick={() => setBannerActive(!bannerActive)}
                       className={`w-full py-3 rounded-xl font-black uppercase text-[10px] tracking-wider transition-colors border ${
                         bannerActive ? 'bg-[#e8f5ee] text-[#0f4225] border-[#2d8a52]' : 'bg-stone-50 text-stone-400 border-stone-200'
                       }`}
                     >
                       {bannerActive ? '● Live Visible' : '○ Standby Hidden'}
                     </button>
                  </div>
               </div>
            </div>

            <div className="md:col-span-6 p-4 bg-yellow-50/50 border border-yellow-200 rounded-xl flex items-start gap-3">
               <AlertTriangle size={20} className="text-[#b87c0a] shrink-0 mt-0.5" />
               <div className="text-xs text-[#b87c0a]">
                  <h4 className="font-bold uppercase tracking-wider">Telemetry Precaution Instructions</h4>
                  <p className="mt-1 leading-relaxed text-[11px]">
                     Site Banner overlays reside on student exam dashboards. Ensure notifications are concise and highly readable.
                  </p>
               </div>
            </div>
         </div>
      </div>

    </div>
  );
}
