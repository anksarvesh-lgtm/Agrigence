
import React, { useState, useEffect } from 'react';
import { mockBackend } from '../../services/mockBackend';
import { SEOSettings as SEOTypes } from '../../types';
import { Save, Globe, Code, Search, ImageIcon, Terminal, Upload, Loader2 } from 'lucide-react';

const SEOSettings: React.FC = () => {
  const [seo, setSeo] = useState<SEOTypes | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const init = async () => {
        // Force refresh to ensure we don't load stale/default data if sync is pending
        await mockBackend.refreshSettings();
        const settings = mockBackend.getSettings();
        setSeo(settings.seo || {
            metaTitle: '',
            metaDescription: '',
            ogImage: '',
            googleAnalyticsId: '',
            robotsTxt: ''
        });
    };
    init();
  }, []);

  const handleSave = async () => {
    if (!seo) return;
    setIsSaving(true);
    
    // Refresh base settings before merging to prevent overwriting other fields (e.g. navigation) with stale data
    await mockBackend.refreshSettings();
    const settings = mockBackend.getSettings();
    
    await mockBackend.updateSettings({ ...settings, seo });
    
    setTimeout(() => {
      setIsSaving(false);
      alert('Global SEO protocols updated!');
    }, 800);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && seo) {
      setIsUploading(true);
      try {
        const url = await mockBackend.uploadFile(file, 'seo');
        setSeo({ ...seo, ogImage: url });
      } catch (error) {
        console.error("Upload failed", error);
        alert("Image upload failed");
      } finally {
        setIsUploading(false);
      }
    }
  };

  if (!seo) return <div className="text-white/50 p-10 text-center animate-pulse">Loading SEO Architecture...</div>;

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex justify-between items-center bg-agri-secondary/10 p-6 rounded-2xl border border-agri-secondary/20">
        <div>
          <h1 className="text-2xl font-bold text-white">SEO Infrastructure</h1>
          <p className="text-white/40 text-xs mt-1 uppercase tracking-widest font-bold">Indexing & search configuration</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className="bg-agri-secondary text-agri-primary px-10 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform active:scale-95 disabled:opacity-50"
        >
           <Save size={18} /> {isSaving ? 'UPDATING...' : 'SYNC_SEO_DATA'}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
         <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-8 space-y-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-agri-secondary flex items-center gap-2 mb-4">
                <Globe size={16} /> Meta Architecture
            </h3>
            <div>
               <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block tracking-widest">Global Meta Title</label>
               <input className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-agri-secondary text-sm" value={seo.metaTitle} onChange={e => setSeo({...seo, metaTitle: e.target.value})} />
            </div>
            <div>
               <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block tracking-widest">Global Description</label>
               <textarea className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-agri-secondary text-sm h-32 leading-relaxed resize-none" value={seo.metaDescription} onChange={e => setSeo({...seo, metaDescription: e.target.value})} />
            </div>
            <div>
               <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block tracking-widest">OpenGraph Social Image URL</label>
               <div className="flex gap-4 items-center">
                  <div className="w-14 h-14 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-white/20 overflow-hidden shrink-0 relative">
                     {isUploading && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                            <Loader2 className="animate-spin text-agri-secondary" size={16} />
                        </div>
                     )}
                     {seo.ogImage ? <img src={seo.ogImage} className="w-full h-full object-cover" /> : <ImageIcon size={24} />}
                  </div>
                  <div className="flex-1 flex gap-2">
                      <input className="flex-1 bg-black/40 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-agri-secondary text-xs" value={seo.ogImage} onChange={e => setSeo({...seo, ogImage: e.target.value})} placeholder="https://..." />
                      <label className={`bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 flex items-center justify-center cursor-pointer transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                          <Upload size={16} className="text-white/40" />
                      </label>
                  </div>
               </div>
            </div>
         </div>

         <div className="space-y-8">
            <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-8 space-y-6">
               <h3 className="text-sm font-bold uppercase tracking-widest text-agri-secondary flex items-center gap-2 mb-4">
                   <Code size={16} /> Tracking & Scripts
               </h3>
               <div>
                  <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block tracking-widest">Google Analytics ID</label>
                  <input className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-agri-secondary font-mono text-xs" value={seo.googleAnalyticsId} onChange={e => setSeo({...seo, googleAnalyticsId: e.target.value})} placeholder="G-XXXXXXXXXX" />
               </div>
               <div>
                  <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block tracking-widest">Robots.txt Content</label>
                  <textarea className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-agri-secondary font-mono text-xs h-32 leading-relaxed resize-none" value={seo.robotsTxt} onChange={e => setSeo({...seo, robotsTxt: e.target.value})} />
               </div>
            </div>

            <div className="p-8 bg-black/20 rounded-[2.5rem] border border-white/5 text-center">
               <Search size={40} className="mx-auto text-white/5 mb-4" />
               <p className="text-[10px] text-white/20 uppercase tracking-widest leading-relaxed">System automatically generates sitemaps at root node every 24 hours based on these configurations.</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default SEOSettings;
