
import React, { useState, useEffect } from 'react';
import { mockBackend } from '../../services/mockBackend';
import { StaticPage } from '../../types';
import { Save, FileText, Globe, Clock, ChevronRight, Layout, Edit } from 'lucide-react';

const StaticPagesEditor: React.FC = () => {
  const [pages, setPages] = useState<StaticPage[]>([]);
  const [selectedPage, setSelectedPage] = useState<StaticPage | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    const data = await mockBackend.getPages();
    // Pre-seed if empty
    if (data.length === 0) {
      const defaults = [
        { id: '1', title: 'About Us', slug: 'about', content: 'Our story...', lastUpdated: '' },
        { id: '2', title: 'Privacy Policy', slug: 'privacy', content: 'We value your data...', lastUpdated: '' },
        { id: '3', title: 'Author Guidelines', slug: 'guidelines', content: 'Follow these rules...', lastUpdated: '' },
      ];
      for(const p of defaults) {
         await mockBackend.updatePage(p as StaticPage);
      }
      setPages(await mockBackend.getPages());
    } else {
      setPages(data);
    }
  };

  const handleSave = async () => {
    if (!selectedPage) return;
    setIsSaving(true);
    await mockBackend.updatePage(selectedPage);
    setTimeout(() => {
      setIsSaving(false);
      setSelectedPage(null);
      loadPages();
      alert('Page content published!');
    }, 800);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
         <h1 className="text-2xl font-bold text-white">Static Content Architecture</h1>
      </div>

      {!selectedPage ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
           {pages.map(page => (
             <div key={page.id} className="bg-white/5 border border-white/5 rounded-[2rem] p-8 hover:bg-white/10 transition-all group cursor-pointer" onClick={() => setSelectedPage(page)}>
                <div className="w-14 h-14 bg-agri-secondary/10 rounded-2xl flex items-center justify-center text-agri-secondary mb-6 group-hover:scale-110 transition-transform">
                   <FileText size={28} />
                </div>
                <h3 className="text-white font-bold text-xl mb-1">{page.title}</h3>
                <p className="text-[10px] text-white/30 uppercase font-black tracking-widest font-mono">/{page.slug}</p>
                <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
                   <span className="text-[9px] text-white/20 font-black uppercase">Modified: {new Date(page.lastUpdated || Date.now()).toLocaleDateString()}</span>
                   <Edit size={16} className="text-agri-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
             </div>
           ))}
        </div>
      ) : (
        <div className="bg-white/5 border border-white/5 rounded-[3rem] overflow-hidden">
           <div className="p-8 border-b border-white/5 flex justify-between items-center bg-black/20">
              <div className="flex items-center gap-4">
                 <button onClick={() => setSelectedPage(null)} className="p-2 text-white/40 hover:text-white"><ChevronRight size={20} className="rotate-180" /></button>
                 <div>
                    <h2 className="text-white font-bold">Refining: {selectedPage.title}</h2>
                    <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mt-0.5">Slug_Reference: {selectedPage.slug}</p>
                 </div>
              </div>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="bg-agri-secondary text-agri-primary px-8 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:scale-105 transition-transform shadow-xl shadow-agri-secondary/10"
              >
                 {isSaving ? 'PUBLISHING...' : 'PUBLISH CHANGES'}
              </button>
           </div>
           
           <div className="p-10 space-y-8">
              <div className="grid lg:grid-cols-12 gap-10">
                 <div className="lg:col-span-8 space-y-6">
                    <label className="text-[10px] uppercase font-bold text-white/40 block tracking-widest">Main Page Content (Standard HTML/Markdown Support)</label>
                    <textarea 
                      className="w-full bg-black/40 border border-white/10 rounded-3xl p-8 text-white text-sm outline-none focus:border-agri-secondary h-[500px] leading-relaxed resize-none font-serif" 
                      value={selectedPage.content} 
                      onChange={e => setSelectedPage({...selectedPage, content: e.target.value})}
                    />
                 </div>
                 <div className="lg:col-span-4 space-y-8">
                    <div className="bg-agri-secondary/5 border border-agri-secondary/20 p-8 rounded-[2.5rem]">
                       <h4 className="text-[10px] font-black uppercase text-agri-secondary mb-6 flex items-center gap-2"><Layout size={14}/> Page Metadata</h4>
                       <div className="space-y-6">
                          <div>
                             <label className="text-[9px] font-black text-white/40 uppercase block mb-2">Internal Title</label>
                             <input className="w-full bg-black/20 border border-white/5 rounded-xl p-3 text-xs text-white" value={selectedPage.title} onChange={e => setSelectedPage({...selectedPage, title: e.target.value})} />
                          </div>
                          <div>
                             <label className="text-[9px] font-black text-white/40 uppercase block mb-2">Internal Slug</label>
                             <input className="w-full bg-black/20 border border-white/5 rounded-xl p-3 text-xs text-white font-mono" value={selectedPage.slug} readOnly />
                          </div>
                       </div>
                    </div>
                    
                    <div className="p-8 border border-white/5 rounded-[2.5rem] bg-black/20 text-center">
                       <Globe size={40} className="mx-auto text-white/10 mb-4" />
                       <p className="text-xs text-white/40 leading-relaxed font-light">Changes to static pages reflect immediately across the public user nodes. Ensure all academic guidelines are met before publishing.</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default StaticPagesEditor;
