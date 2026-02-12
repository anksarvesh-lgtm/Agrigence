
import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Trash2, Copy, Check, ExternalLink, Filter } from 'lucide-react';
import { mockBackend } from '../../services/mockBackend';

const MediaLibrary: React.FC = () => {
  const [media, setMedia] = useState<{url: string, source: string}[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
        const articles = await mockBackend.getArticles();
        const magazines = await mockBackend.getMagazines();
        const products = await mockBackend.getProducts();
        const news = await mockBackend.getNews();
        const lead = await mockBackend.getLeadership();
        const members = await mockBackend.getMembers();

        const assets = [
        ...articles.filter(a => a.featuredImage).map(a => ({ url: a.featuredImage!, source: 'Article' })),
        ...magazines.filter(m => m.coverImage).map(m => ({ url: m.coverImage!, source: 'Magazine' })),
        ...products.filter(p => p.imageUrl).map(p => ({ url: p.imageUrl!, source: 'Store' })),
        ...news.filter(n => n.thumbnail).map(n => ({ url: n.thumbnail!, source: 'News' })),
        ...lead.map(l => ({ url: l.imageUrl, source: 'Leadership' })),
        ...members.map(m => ({ url: m.imageUrl, source: 'Board' }))
        ];

        setMedia(assets);
    };
    load();
  }, []);

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(url);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Central Media Storage</h1>
        <div className="flex items-center gap-4 bg-white/5 p-2 rounded-xl border border-white/5">
           <Filter size={16} className="text-white/20 ml-2" />
           <span className="text-white/40 text-[10px] font-black uppercase tracking-widest mr-4">Indexing: {media.length} ASSETS</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {media.map((item, idx) => (
          <div key={idx} className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden group relative aspect-square shadow-2xl">
             <img src={item.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
             <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                <span className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-2">{item.source} NODE</span>
                <div className="flex gap-2">
                   <button onClick={() => copyUrl(item.url)} className="p-3 bg-agri-secondary text-agri-primary rounded-xl shadow-xl hover:scale-110 transition-transform">
                      {copiedId === item.url ? <Check size={18} /> : <Copy size={18} />}
                   </button>
                   <button className="p-3 bg-white/10 text-white rounded-xl shadow-xl hover:scale-110 hover:bg-red-500 transition-all">
                      <Trash2 size={18} />
                   </button>
                </div>
             </div>
          </div>
        ))}
        {media.length === 0 && <div className="col-span-full py-32 text-center text-white/10 italic">Library is empty.</div>}
      </div>
    </div>
  );
};

export default MediaLibrary;
