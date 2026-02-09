
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { mockBackend } from '../../services/mockBackend';
import { Magazine, Article } from '../../types';
import { FileText, BookOpen, Plus, X, Upload, Save, FileCheck, Image as ImageIcon, Trash2, Globe, Star, Calendar, Bookmark, File } from 'lucide-react';

const ContentManagement: React.FC = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'articles' | 'magazines' | 'blogs'>('articles');

  useEffect(() => {
    if (location.pathname.includes('magazines')) setActiveTab('magazines');
    else if (location.pathname.includes('blogs')) setActiveTab('blogs');
    else setActiveTab('articles');
  }, [location.pathname]);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-white">Content Repository</h1>
        <div className="flex bg-white/5 backdrop-blur-md rounded-xl p-1 border border-white/5">
            <button onClick={() => setActiveTab('articles')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'articles' ? 'bg-agri-secondary text-agri-primary' : 'text-white/40 hover:text-white'}`}>Articles</button>
            <button onClick={() => setActiveTab('blogs')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'blogs' ? 'bg-agri-secondary text-agri-primary' : 'text-white/40 hover:text-white'}`}>Blogs</button>
            <button onClick={() => setActiveTab('magazines')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'magazines' ? 'bg-agri-secondary text-agri-primary' : 'text-white/40 hover:text-white'}`}>Magazines</button>
        </div>
      </div>

      <div className="bg-white/5 border border-white/5 rounded-3xl min-h-[60vh] p-8">
        {activeTab === 'magazines' ? <MagazineManager /> : <ArticleManager type={activeTab} />}
      </div>
    </div>
  );
};

const ArticleManager = ({ type }: { type: string }) => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingArticle, setEditingArticle] = useState<Partial<Article>>({});

    useEffect(() => { loadArticles(); }, [type]);

    const loadArticles = () => {
        const data = mockBackend.getArticles().filter(a => type === 'articles' ? a.type === 'ARTICLE' : a.type === 'BLOG');
        setArticles([...data]);
    };

    const handleSave = async () => {
        if (!editingArticle.title) return alert("Title is required");
        if (editingArticle.id) await mockBackend.updateArticle(editingArticle as Article);
        else await mockBackend.addArticle({
                ...editingArticle,
                type: type === 'articles' ? 'ARTICLE' : 'BLOG',
                status: editingArticle.status || 'PUBLISHED',
                authorName: editingArticle.authorName || 'Admin'
            } as Article);
        
        setIsModalOpen(false);
        setEditingArticle({});
        loadArticles();
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setEditingArticle({ ...editingArticle, featuredImage: reader.result as string });
        };
        reader.readAsDataURL(file);
      }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-10">
                <h3 className="text-lg font-bold text-agri-secondary uppercase tracking-widest">Manage {type}</h3>
                <button onClick={() => { setEditingArticle({ isFeatured: false, status: 'PUBLISHED', downloadAccess: 'FREE' }); setIsModalOpen(true); }} className="bg-agri-secondary text-agri-primary px-8 py-3 rounded-xl flex items-center gap-2 text-xs font-bold shadow-xl shadow-agri-secondary/10">
                    <Plus size={16} /> Create {type.slice(0, -1)}
                </button>
            </div>
            
            <div className="space-y-4">
                {articles.map(article => (
                    <div key={article.id} className="flex items-center justify-between p-6 bg-black/20 rounded-3xl border border-white/5 hover:border-agri-secondary transition-all group">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-white/10 group-hover:text-agri-secondary transition-colors overflow-hidden border border-white/5">
                                {article.featuredImage ? <img src={article.featuredImage} className="w-full h-full object-cover" /> : <FileText size={24} />}
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                  {article.isFeatured && <Star size={12} className="text-agri-secondary fill-agri-secondary" />}
                                  <h4 className="text-white font-bold text-lg">{article.title}</h4>
                                </div>
                                <p className="text-[10px] text-white/30 flex items-center gap-2 uppercase font-black tracking-widest">
                                    <span>{article.authorName}</span>
                                    <span>•</span>
                                    <span>{article.status}</span>
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button onClick={() => { setEditingArticle(article); setIsModalOpen(true); }} className="p-3 bg-white/5 rounded-xl text-white/20 hover:text-white"><ImageIcon size={18} /></button>
                            <button onClick={async () => { if(confirm('Delete?')) { await mockBackend.deleteArticle(article.id); loadArticles(); } }} className="p-3 bg-white/5 rounded-xl text-white/20 hover:text-red-400"><Trash2 size={18} /></button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md">
                   <div className="bg-[#1C2A22] w-full max-w-4xl rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                      <div className="p-10 border-b border-white/5 flex justify-between items-center bg-black/20">
                         <div>
                            <h3 className="text-2xl font-serif font-bold text-white">Editor Control Panel</h3>
                            <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mt-1">Refining: {editingArticle.title || 'New Content'}</p>
                         </div>
                         <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white/5 rounded-full text-white/40 hover:text-white"><X size={20} /></button>
                      </div>
                      
                      <div className="p-10 space-y-8 overflow-y-auto custom-scrollbar flex-1">
                         <div className="grid lg:grid-cols-2 gap-10">
                            {/* Left Side: Core Info */}
                            <div className="space-y-6">
                               <div>
                                  <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block tracking-widest">Title</label>
                                  <input className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-agri-secondary" value={editingArticle.title || ''} onChange={e => setEditingArticle({...editingArticle, title: e.target.value})} />
                               </div>
                               <div className="grid grid-cols-2 gap-4">
                                  <div>
                                     <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block tracking-widest">Author</label>
                                     <input className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-agri-secondary" value={editingArticle.authorName || ''} onChange={e => setEditingArticle({...editingArticle, authorName: e.target.value})} />
                                  </div>
                                  <div>
                                     <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block tracking-widest">Submission Status</label>
                                     <select className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-agri-secondary appearance-none" value={editingArticle.status || 'PUBLISHED'} onChange={e => setEditingArticle({...editingArticle, status: e.target.value as any})}>
                                        <option className="bg-agri-primary">PUBLISHED</option>
                                        <option className="bg-agri-primary">PENDING</option>
                                        <option className="bg-agri-primary">REJECTED</option>
                                        <option className="bg-agri-primary">DRAFT</option>
                                     </select>
                                  </div>
                               </div>
                               <div>
                                  <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block tracking-widest">Main Content Body</label>
                                  <textarea className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-agri-secondary h-64 text-sm" value={editingArticle.content || ''} onChange={e => setEditingArticle({...editingArticle, content: e.target.value})} />
                               </div>
                            </div>

                            {/* Right Side: Media & SEO */}
                            <div className="space-y-8">
                               <div className="bg-black/20 p-8 rounded-3xl border border-white/5">
                                  <h4 className="text-[10px] font-black uppercase text-agri-secondary tracking-[0.2em] mb-6 flex items-center justify-between">
                                     SEO & META <Globe size={14}/>
                                  </h4>
                                  <div className="space-y-4">
                                     <input className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-agri-secondary" placeholder="SEO Meta Title" value={editingArticle.seoTitle || ''} onChange={e => setEditingArticle({...editingArticle, seoTitle: e.target.value})} />
                                     <textarea className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-agri-secondary h-20" placeholder="Meta Description for Google" value={editingArticle.metaDescription || ''} onChange={e => setEditingArticle({...editingArticle, metaDescription: e.target.value})} />
                                  </div>
                               </div>

                               <div>
                                  <label className="text-[10px] uppercase font-bold text-white/40 mb-4 block tracking-widest">Featured Thumbnail</label>
                                  <div className="aspect-video bg-black/40 rounded-[2rem] border border-white/5 overflow-hidden mb-4 relative group">
                                     {editingArticle.featuredImage ? <img src={editingArticle.featuredImage} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white/10"><ImageIcon size={40}/></div>}
                                     <label htmlFor="art-img" className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer">
                                        <span className="text-[10px] font-black text-white uppercase tracking-widest">UPLOAD_NEW_IMG</span>
                                     </label>
                                     <input type="file" id="art-img" className="hidden" onChange={handleImageUpload} />
                                  </div>
                               </div>

                               <div className="flex items-center justify-between p-6 bg-agri-secondary/10 rounded-2xl border border-agri-secondary/20">
                                  <div>
                                     <p className="text-xs font-bold text-white uppercase tracking-widest">Feature on Home</p>
                                     <p className="text-[10px] text-white/30 uppercase mt-1">Priority visibility flag</p>
                                  </div>
                                  <button 
                                    onClick={() => setEditingArticle({...editingArticle, isFeatured: !editingArticle.isFeatured})}
                                    className={`px-6 py-2 rounded-lg font-bold text-[10px] tracking-widest ${editingArticle.isFeatured ? 'bg-agri-secondary text-agri-primary' : 'bg-white/5 text-white/40'}`}
                                  >
                                    {editingArticle.isFeatured ? 'ACTIVE' : 'INACTIVE'}
                                  </button>
                               </div>
                            </div>
                         </div>
                      </div>

                      <div className="p-10 border-t border-white/5 flex justify-end gap-6 bg-black/10">
                         <button onClick={() => setIsModalOpen(false)} className="px-10 py-4 text-white/20 hover:text-white font-bold text-xs uppercase tracking-widest">Cancel</button>
                         <button onClick={handleSave} className="bg-agri-secondary text-agri-primary px-16 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-xl shadow-agri-secondary/10 hover:scale-105 transition-transform active:scale-95">
                            <Save size={20} /> SYNC CONTENT
                         </button>
                      </div>
                   </div>
                </div>
            )}
        </div>
    );
};

const MagazineManager = () => {
    const [magazines, setMagazines] = useState<Magazine[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMag, setEditingMag] = useState<Partial<Magazine>>({});

    useEffect(() => { loadMagazines(); }, []);

    const loadMagazines = () => {
        setMagazines([...mockBackend.getMagazines()]);
    };

    const handleSave = async () => {
        if (!editingMag.title) return alert("Title is required");
        
        if (editingMag.id) {
          // In a real app we'd have an updateMagazine method
          const all = mockBackend.getMagazines().map(m => m.id === editingMag.id ? editingMag as Magazine : m);
          localStorage.setItem('agri_magazines', JSON.stringify(all));
        } else {
          await mockBackend.addMagazine(editingMag as Magazine);
        }
        
        setIsModalOpen(false);
        setEditingMag({});
        loadMagazines();
    };

    const handleFileUpload = (field: 'coverImage' | 'pdfUrl') => (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setEditingMag(prev => ({ ...prev, [field]: reader.result as string }));
        };
        reader.readAsDataURL(file);
      }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-10">
                <h3 className="text-lg font-bold text-agri-secondary uppercase tracking-widest">Manage Magazines</h3>
                <button onClick={() => { setEditingMag({ status: 'PUBLISHED', downloadAccess: 'SUBSCRIBERS_ONLY', month: 'January', year: 2025 }); setIsModalOpen(true); }} className="bg-agri-secondary text-agri-primary px-8 py-3 rounded-xl flex items-center gap-2 text-xs font-bold shadow-xl shadow-agri-secondary/10">
                    <Plus size={16} /> Add New Issue
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {magazines.map(mag => (
                    <div key={mag.id} className="bg-black/20 rounded-[2.5rem] border border-white/5 overflow-hidden hover:border-agri-secondary transition-all group">
                        <div className="aspect-[3/4] relative overflow-hidden bg-black/40">
                            {mag.coverImage ? (
                                <img src={mag.coverImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-white/5">
                                    <BookOpen size={64} />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                <button onClick={() => { setEditingMag(mag); setIsModalOpen(true); }} className="p-4 bg-white text-agri-primary rounded-2xl hover:scale-110 transition-transform shadow-2xl">
                                    <ImageIcon size={20} />
                                </button>
                                {mag.pdfUrl && (
                                    <a href={mag.pdfUrl} target="_blank" rel="noreferrer" className="p-4 bg-agri-secondary text-agri-primary rounded-2xl hover:scale-110 transition-transform shadow-2xl">
                                        <File size={20} />
                                    </a>
                                )}
                            </div>
                        </div>
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="text-white font-bold text-xl">{mag.title}</h4>
                                    <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mt-1">Vol {mag.volume} • Issue {mag.issueNumber}</p>
                                </div>
                                <span className="bg-agri-secondary/10 text-agri-secondary text-[8px] font-black uppercase px-2 py-1 rounded">{mag.month} {mag.year}</span>
                            </div>
                            <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                <span className={`text-[9px] font-black uppercase tracking-widest ${mag.downloadAccess === 'FREE' ? 'text-green-400' : 'text-agri-secondary'}`}>
                                    {mag.downloadAccess.replace('_', ' ')}
                                </span>
                                <button className="text-white/20 hover:text-red-400 transition-colors"><Trash2 size={16}/></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md">
                   <div className="bg-[#1C2A22] w-full max-w-4xl rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                      <div className="p-10 border-b border-white/5 flex justify-between items-center bg-black/20">
                         <div>
                            <h3 className="text-2xl font-serif font-bold text-white">Magazine Issue Control</h3>
                            <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mt-1">{editingMag.id ? 'Refining Node' : 'Initializing New Protocol'}</p>
                         </div>
                         <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white/5 rounded-full text-white/40 hover:text-white"><X size={20} /></button>
                      </div>
                      
                      <div className="p-10 space-y-8 overflow-y-auto custom-scrollbar flex-1">
                         <div className="grid lg:grid-cols-12 gap-10">
                            {/* Left: Metadata */}
                            <div className="lg:col-span-7 space-y-6">
                               <div>
                                  <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block tracking-widest">Issue Title</label>
                                  <input className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-agri-secondary" placeholder="e.g. Sustainable Futures" value={editingMag.title || ''} onChange={e => setEditingMag({...editingMag, title: e.target.value})} />
                               </div>
                               
                               <div className="grid grid-cols-2 gap-6">
                                  <div>
                                     <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block tracking-widest">Volume No.</label>
                                     <input className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-agri-secondary" value={editingMag.volume || ''} onChange={e => setEditingMag({...editingMag, volume: e.target.value})} />
                                  </div>
                                  <div>
                                     <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block tracking-widest">Issue No.</label>
                                     <input className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-agri-secondary" value={editingMag.issueNumber || ''} onChange={e => setEditingMag({...editingMag, issueNumber: e.target.value})} />
                                  </div>
                               </div>

                               <div className="grid grid-cols-2 gap-6">
                                  <div>
                                     <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block tracking-widest">Publication Month</label>
                                     <select className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-agri-secondary" value={editingMag.month} onChange={e => setEditingMag({...editingMag, month: e.target.value})}>
                                        {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                                            <option key={m} className="bg-agri-primary">{m}</option>
                                        ))}
                                     </select>
                                  </div>
                                  <div>
                                     <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block tracking-widest">Year</label>
                                     <input type="number" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-agri-secondary" value={editingMag.year} onChange={e => setEditingMag({...editingMag, year: parseInt(e.target.value)})} />
                                  </div>
                               </div>

                               <div>
                                  <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block tracking-widest">Access Permission</label>
                                  <select className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-agri-secondary" value={editingMag.downloadAccess} onChange={e => setEditingMag({...editingMag, downloadAccess: e.target.value as any})}>
                                     <option value="FREE" className="bg-agri-primary">FREE ACCESS (PUBLIC)</option>
                                     <option value="SUBSCRIBERS_ONLY" className="bg-agri-primary">SUBSCRIBERS ONLY (PRIVATE)</option>
                                  </select>
                               </div>
                            </div>

                            {/* Right: Files */}
                            <div className="lg:col-span-5 space-y-8">
                               <div>
                                  <label className="text-[10px] uppercase font-bold text-white/40 mb-3 block tracking-widest">Cover Artwork</label>
                                  <div className="aspect-[3/4] bg-black/40 rounded-3xl border-2 border-dashed border-white/10 overflow-hidden relative group">
                                     {editingMag.coverImage ? <img src={editingMag.coverImage} className="w-full h-full object-cover" /> : <div className="w-full h-full flex flex-col items-center justify-center text-white/10"><ImageIcon size={40}/><span className="text-[8px] mt-2">MISSING_ART</span></div>}
                                     <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer">
                                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Replace Cover</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload('coverImage')} />
                                     </label>
                                  </div>
                               </div>

                               <div className="bg-black/20 p-8 rounded-3xl border border-white/5">
                                  <h4 className="text-[10px] font-black uppercase text-agri-secondary tracking-[0.2em] mb-6 flex items-center justify-between">
                                     PDF BROADCAST <Bookmark size={14}/>
                                  </h4>
                                  <div className="space-y-4">
                                     <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                                        <div className="flex items-center gap-3">
                                            <File size={20} className={editingMag.pdfUrl ? 'text-green-400' : 'text-white/20'} />
                                            <span className="text-[10px] font-bold text-white/40 uppercase truncate max-w-[120px]">
                                                {editingMag.pdfUrl ? 'PROTOCOL_LOADED' : 'NO_FILE_QUEUED'}
                                            </span>
                                        </div>
                                        <label className="px-4 py-2 bg-agri-secondary text-agri-primary rounded-xl text-[9px] font-black cursor-pointer hover:scale-105 transition-transform">
                                            UPLOAD PDF
                                            <input type="file" accept="application/pdf" className="hidden" onChange={handleFileUpload('pdfUrl')} />
                                        </label>
                                     </div>
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>

                      <div className="p-10 border-t border-white/5 flex justify-end gap-6 bg-black/10">
                         <button onClick={() => setIsModalOpen(false)} className="px-10 py-4 text-white/20 hover:text-white font-bold text-xs uppercase tracking-widest">Terminate</button>
                         <button onClick={handleSave} className="bg-agri-secondary text-agri-primary px-16 py-4 rounded-[2rem] font-bold flex items-center gap-3 shadow-2xl shadow-agri-secondary/10 hover:scale-105 transition-transform active:scale-95">
                            <Save size={20} /> SYNCHRONIZE ISSUE
                         </button>
                      </div>
                   </div>
                </div>
            )}
        </div>
    );
};

export default ContentManagement;
