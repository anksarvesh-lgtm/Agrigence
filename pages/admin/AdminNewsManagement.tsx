
import React, { useState, useEffect } from 'react';
import { mockBackend } from '../../services/mockBackend';
import { NewsItem } from '../../types';
import { Plus, Trash2, Edit, Save, X, Newspaper, Calendar, Megaphone, Image as ImageIcon, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { useConfirm } from '../../components/ContextualConfirm';

const AdminNewsManagement: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<Partial<NewsItem>>({
    isBreaking: false,
    relevantLink: ''
  });
  const { confirm } = useConfirm();

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

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    const isConfirmed = await confirm({
        message: 'Delete this news post?',
        type: 'danger',
        trigger: e.currentTarget
    });

    if (isConfirmed) {
      await mockBackend.deleteNews(id);
      loadNews();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-black">News Center</h1>
        <button onClick={() => { setEditingNews({ isBreaking: false, relevantLink: '' }); setIsModalOpen(true); }} className="bg-agri-secondary text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-xl shadow-agri-secondary/20 text-xs hover:bg-agri-primary transition-colors">
           <Plus size={18} /> POST NEWS
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {news.map(item => (
          <div key={item.id} className="bg-white border border-stone-200 rounded-2xl p-6 group hover:shadow-lg transition-all flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 relative">
             <div className="w-20 h-20 bg-stone-100 rounded-xl overflow-hidden shrink-0 border border-stone-200">
                {item.thumbnail ? (
                   <img src={item.thumbnail} className="w-full h-full object-cover" />
                ) : (
                   <div className="w-full h-full flex items-center justify-center text-stone-300">
                      <Newspaper size={32} />
                   </div>
                )}
             </div>
             
             <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                   {item.isBreaking && (
                      <span className="bg-red-100 text-red-600 text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-tighter flex items-center gap-1 border border-red-200">
                         <Megaphone size={10} /> BREAKING
                      </span>
                   )}
                   <span className="text-stone-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                      <Calendar size={12} /> {item.date}
                   </span>
                </div>
                <h3 className="text-black font-bold text-lg truncate group-hover:text-agri-secondary transition-colors">{item.title}</h3>
                <p className="text-stone-600 text-xs line-clamp-1">{item.description}</p>
                {item.relevantLink && (
                  <a href={item.relevantLink} target="_blank" rel="noreferrer" className="text-agri-secondary text-[10px] font-bold uppercase flex items-center gap-1 mt-1 hover:underline">
                    <ExternalLink size={10} /> Attached Resource
                  </a>
                )}
             </div>

             <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity absolute top-4 right-4 md:static">
                <button onClick={() => { setEditingNews(item); setIsModalOpen(true); }} className="p-2 md:p-3 bg-stone-100 rounded-xl text-stone-600 hover:text-agri-secondary hover:bg-white border border-transparent hover:border-stone-200 transition-all">
                   <Edit size={16} className="md:w-[18px] md:h-[18px]"/>
                </button>
                <button onClick={(e) => handleDelete(item.id, e)} className="p-2 md:p-3 bg-stone-100 rounded-xl text-stone-600 hover:text-red-500 hover:bg-white border border-transparent hover:border-stone-200 transition-all">
                   <Trash2 size={16} className="md:w-[18px] md:h-[18px]"/>
                </button>
             </div>
          </div>
        ))}
        {news.length === 0 && <div className="text-center py-20 text-stone-400 italic">No news updates posted.</div>}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
           <div className="bg-white w-full max-w-xl rounded-3xl border border-stone-200 shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-stone-200 flex justify-between items-center bg-stone-50">
                 <h3 className="text-2xl font-serif font-bold text-black">{editingNews.id ? 'Edit News Update' : 'Post News Update'}</h3>
                 <button onClick={() => setIsModalOpen(false)}><X className="text-stone-400 hover:text-black" /></button>
              </div>
              <div className="p-8 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
                 <div>
                    <label className="text-[10px] uppercase font-bold text-stone-500 mb-2 block tracking-widest">News Title</label>
                    <input className="w-full bg-white border border-stone-300 rounded-xl p-4 text-black outline-none focus:border-agri-secondary focus:ring-1 focus:ring-agri-secondary" placeholder="Breaking: New Wheat Variety Discovered" value={editingNews.title || ''} onChange={e => setEditingNews({...editingNews, title: e.target.value})} />
                 </div>
                 
                 <div>
                    <label className="text-[10px] uppercase font-bold text-stone-500 mb-2 block tracking-widest">Short Description</label>
                    <textarea className="w-full bg-white border border-stone-300 rounded-xl p-4 text-black outline-none focus:border-agri-secondary h-20" placeholder="A brief summary for the feed..." value={editingNews.description || ''} onChange={e => setEditingNews({...editingNews, description: e.target.value})}></textarea>
                 </div>

                 <div>
                    <label className="text-[10px] uppercase font-bold text-stone-500 mb-2 block tracking-widest">Relevant Link (External Resource)</label>
                    <div className="relative">
                      <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                      <input className="w-full bg-white border border-stone-300 rounded-xl pl-12 pr-4 py-4 text-black text-xs outline-none focus:border-agri-secondary transition-all" placeholder="https://external-report-link.com" value={editingNews.relevantLink || ''} onChange={e => setEditingNews({...editingNews, relevantLink: e.target.value})} />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div>
                       <label className="text-[10px] uppercase font-bold text-stone-500 mb-2 block tracking-widest">Featured Photo URL</label>
                       <div className="flex gap-2">
                          <div className="w-12 h-12 bg-stone-100 rounded-xl border border-stone-200 shrink-0 flex items-center justify-center text-stone-400 overflow-hidden">
                             {editingNews.thumbnail ? <img src={editingNews.thumbnail} className="w-full h-full object-cover" /> : <ImageIcon size={20} />}
                          </div>
                          <input className="flex-1 bg-white border border-stone-300 rounded-xl p-4 text-black outline-none focus:border-agri-secondary text-xs" placeholder="https://images.unsplash.com/..." value={editingNews.thumbnail || ''} onChange={e => setEditingNews({...editingNews, thumbnail: e.target.value})} />
                       </div>
                    </div>
                    <div>
                       <label className="text-[10px] uppercase font-bold text-stone-500 mb-2 block tracking-widest">News Options</label>
                       <button 
                          onClick={() => setEditingNews({...editingNews, isBreaking: !editingNews.isBreaking})}
                          className={`w-full py-4 px-4 rounded-xl border font-bold text-[10px] transition-all flex items-center justify-center gap-2 ${editingNews.isBreaking ? 'bg-red-50 border-red-200 text-red-600' : 'bg-stone-50 border-stone-200 text-stone-500'}`}
                       >
                          <Megaphone size={14} /> BREAKING NEWS MODE
                       </button>
                    </div>
                 </div>

                 <div>
                    <label className="text-[10px] uppercase font-bold text-stone-500 mb-2 block tracking-widest">Full Detailed Content</label>
                    <textarea className="w-full bg-white border border-stone-300 rounded-xl p-4 text-black outline-none focus:border-agri-secondary h-40 text-xs" placeholder="Full details of the announcement..." value={editingNews.content || ''} onChange={e => setEditingNews({...editingNews, content: e.target.value})}></textarea>
                 </div>
              </div>
              <div className="p-8 border-t border-stone-200 flex justify-end gap-4 bg-stone-50">
                 <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-stone-500 hover:text-black font-bold text-xs uppercase tracking-widest">Cancel</button>
                 <button onClick={handleSave} className="bg-agri-secondary text-white px-10 py-3 rounded-xl font-bold flex items-center gap-2 shadow-xl hover:bg-agri-primary transition-colors">
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
