
import React, { useState, useEffect } from 'react';
import { mockBackend } from '../../services/mockBackend';
import { NewsItem } from '../../types';
import { Plus, Trash2, Edit, Save, X, Newspaper, Calendar, Megaphone, Image as ImageIcon, Link as LinkIcon, ExternalLink } from 'lucide-react';

const AdminNewsManagement: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<Partial<NewsItem>>({
    isBreaking: false,
    relevantLink: ''
  });

  useEffect(() => { loadNews(); }, []);

  const loadNews = async () => {
    setNews([...(await mockBackend.getNews())]);
  };

  const handleSave = async () => {
    if (!editingNews.title) return alert("Title is required");
    
    if (editingNews.id) {
       await mockBackend.deleteNews(editingNews.id);
    }
    await mockBackend.addNews(editingNews);
    
    setIsModalOpen(false);
    setEditingNews({ isBreaking: false, relevantLink: '' });
    loadNews();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this news post?')) {
      await mockBackend.deleteNews(id);
      loadNews();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">News Center</h1>
        <button onClick={() => { setEditingNews({ isBreaking: false, relevantLink: '' }); setIsModalOpen(true); }} className="bg-agri-secondary text-agri-primary px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-xl shadow-agri-secondary/10 text-xs">
           <Plus size={18} /> POST NEWS
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {news.map(item => (
          <div key={item.id} className="bg-white/5 border border-white/5 rounded-2xl p-6 group hover:bg-white/10 transition-all flex items-center gap-6">
             <div className="w-20 h-20 bg-black/40 rounded-xl overflow-hidden shrink-0 border border-white/5">
                {item.thumbnail ? (
                   <img src={item.thumbnail} className="w-full h-full object-cover" />
                ) : (
                   <div className="w-full h-full flex items-center justify-center text-white/10">
                      <Newspaper size={32} />
                   </div>
                )}
             </div>
             
             <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                   {item.isBreaking && (
                      <span className="bg-red-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-tighter flex items-center gap-1">
                         <Megaphone size={10} /> BREAKING
                      </span>
                   )}
                   <span className="text-white/30 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                      <Calendar size={12} /> {item.date}
                   </span>
                </div>
                <h3 className="text-white font-bold text-lg truncate group-hover:text-agri-secondary transition-colors">{item.title}</h3>
                <p className="text-white/40 text-xs line-clamp-1">{item.description}</p>
                {item.relevantLink && (
                  <a href={item.relevantLink} target="_blank" rel="noreferrer" className="text-agri-secondary text-[10px] font-bold uppercase flex items-center gap-1 mt-1 hover:underline">
                    <ExternalLink size={10} /> Attached Resource
                  </a>
                )}
             </div>

             <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => { setEditingNews(item); setIsModalOpen(true); }} className="p-3 bg-white/5 rounded-xl text-white/40 hover:text-agri-secondary hover:bg-white/10 transition-all">
                   <Edit size={18}/>
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-3 bg-white/5 rounded-xl text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-all">
                   <Trash2 size={18}/>
                </button>
             </div>
          </div>
        ))}
        {news.length === 0 && <div className="text-center py-20 text-white/10 italic">No news updates posted.</div>}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
           <div className="bg-[#1C2A22] w-full max-w-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-white/5 flex justify-between items-center bg-black/20">
                 <h3 className="text-2xl font-serif font-bold text-white">{editingNews.id ? 'Edit News Update' : 'Post News Update'}</h3>
                 <button onClick={() => setIsModalOpen(false)}><X className="text-white/40 hover:text-white" /></button>
              </div>
              <div className="p-8 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
                 <div>
                    <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block tracking-widest">News Title</label>
                    <input className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-agri-secondary" placeholder="Breaking: New Wheat Variety Discovered" value={editingNews.title || ''} onChange={e => setEditingNews({...editingNews, title: e.target.value})} />
                 </div>
                 
                 <div>
                    <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block tracking-widest">Short Description</label>
                    <textarea className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-agri-secondary h-20" placeholder="A brief summary for the feed..." value={editingNews.description || ''} onChange={e => setEditingNews({...editingNews, description: e.target.value})}></textarea>
                 </div>

                 <div>
                    <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block tracking-widest">Relevant Link (External Resource)</label>
                    <div className="relative">
                      <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                      <input className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white text-xs outline-none focus:border-agri-secondary transition-all" placeholder="https://external-report-link.com" value={editingNews.relevantLink || ''} onChange={e => setEditingNews({...editingNews, relevantLink: e.target.value})} />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div>
                       <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block tracking-widest">Featured Photo URL</label>
                       <div className="flex gap-2">
                          <div className="w-12 h-12 bg-white/5 rounded-xl border border-white/10 shrink-0 flex items-center justify-center text-white/20 overflow-hidden">
                             {editingNews.thumbnail ? <img src={editingNews.thumbnail} className="w-full h-full object-cover" /> : <ImageIcon size={20} />}
                          </div>
                          <input className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-agri-secondary text-xs" placeholder="https://images.unsplash.com/..." value={editingNews.thumbnail || ''} onChange={e => setEditingNews({...editingNews, thumbnail: e.target.value})} />
                       </div>
                    </div>
                    <div>
                       <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block tracking-widest">News Options</label>
                       <button 
                          onClick={() => setEditingNews({...editingNews, isBreaking: !editingNews.isBreaking})}
                          className={`w-full py-4 px-4 rounded-xl border font-bold text-[10px] transition-all flex items-center justify-center gap-2 ${editingNews.isBreaking ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-white/5 border-white/10 text-white/40'}`}
                       >
                          <Megaphone size={14} /> BREAKING NEWS MODE
                       </button>
                    </div>
                 </div>

                 <div>
                    <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block tracking-widest">Full Detailed Content</label>
                    <textarea className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-agri-secondary h-40 text-xs" placeholder="Full details of the announcement..." value={editingNews.content || ''} onChange={e => setEditingNews({...editingNews, content: e.target.value})}></textarea>
                 </div>
              </div>
              <div className="p-8 border-t border-white/5 flex justify-end gap-4 bg-black/10">
                 <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-white/40 hover:text-white font-bold text-xs uppercase tracking-widest">Cancel</button>
                 <button onClick={handleSave} className="bg-agri-secondary text-agri-primary px-10 py-3 rounded-xl font-bold flex items-center gap-2 shadow-xl shadow-agri-secondary/10">
                    <Save size={18} /> SAVE ANNOUNCEMENT
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminNewsManagement;
