
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../src/authContext';
import { mockBackend } from '../../services/mockBackend';
import { Magazine, Article } from '../../types';
import { FileText, BookOpen, Plus, X, Upload, Save, FileCheck, Image as ImageIcon, Trash2, Globe, Star, Calendar, Bookmark, File as FileIcon, Loader2, Bold, Italic, Underline, Heading1, Heading2, List, Eye, Edit3, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';
import { useConfirm } from '../../components/ContextualConfirm';
import JoditEditor from 'jodit-react';

import * as mammoth from 'mammoth';

const ContentManagement: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'articles' | 'magazines' | 'blogs'>('articles');

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  useEffect(() => {
    if (location.pathname.includes('magazines')) setActiveTab('magazines');
    else if (location.pathname.includes('blogs')) setActiveTab('blogs');
    else setActiveTab('articles');
  }, [location.pathname]);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-admin-text">Content Repository</h1>
        <div className="flex flex-wrap bg-white rounded-xl p-1 border border-admin-border shadow-sm">
            <button onClick={() => setActiveTab('articles')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'articles' ? 'bg-agri-secondary text-white' : 'text-admin-secondary hover:bg-admin-hover'}`}>Articles</button>
            <button onClick={() => setActiveTab('blogs')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'blogs' ? 'bg-agri-secondary text-white' : 'text-admin-secondary hover:bg-admin-hover'}`}>Blogs</button>
            {isSuperAdmin && (
                <button onClick={() => setActiveTab('magazines')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'magazines' ? 'bg-agri-secondary text-white' : 'text-admin-secondary hover:bg-admin-hover'}`}>Magazines</button>
            )}
        </div>
      </div>

      <div className="bg-admin-card border border-admin-border rounded-3xl min-h-[60vh] p-8 shadow-admin">
        {activeTab === 'magazines' && isSuperAdmin ? <MagazineManager /> : <ArticleManager type={activeTab} isSuperAdmin={isSuperAdmin} />}
      </div>
    </div>
  );
};

const ArticleManager = ({ type, isSuperAdmin }: { type: string, isSuperAdmin: boolean }) => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingArticle, setEditingArticle] = useState<Partial<Article>>({});
    const [isUploading, setIsUploading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [strictWordMode, setStrictWordMode] = useState(true);
    const [defaultFont, setDefaultFont] = useState('Arial, Helvetica, sans-serif');
    const [defaultFontSize, setDefaultFontSize] = useState('14px');
    const editorRef = useRef(null);
    const { confirm } = useConfirm();

    useEffect(() => {
      const unsub = mockBackend.subscribeToArticles((data) => {
        const filtered = data.filter(a => type === 'articles' ? a.type === 'ARTICLE' : a.type === 'BLOG');
        setArticles(filtered);
      });
      return () => unsub();
    }, [type]);

    const uploadBase64ImagesInHTML = async (html: string): Promise<string> => {
        if (!html || !html.includes('data:image/')) return html;
        
        setIsUploading(true);
        try {
            const div = document.createElement('div');
            div.innerHTML = html;
            
            const images = div.querySelectorAll('img[src^="data:image/"]');
            
            for (let i = 0; i < images.length; i++) {
                const img = images[i] as HTMLImageElement;
                const src = img.getAttribute('src');
                if (src && src.startsWith('data:image/')) {
                    try {
                        const arr = src.split(',');
                        const mimeMatch = arr[0].match(/:(.*?);/);
                        if (!mimeMatch) continue;
                        const mime = mimeMatch[1];
                        const bstr = atob(arr[1]);
                        let n = bstr.length;
                        const u8arr = new Uint8Array(n);
                        while (n--) {
                            u8arr[n] = bstr.charCodeAt(n);
                        }
                        const ext = mime.split('/')[1] || 'png';
                        const file = new File([u8arr], `inline-${Date.now()}-${i}.${ext}`, { type: mime });
                        
                        const url = await mockBackend.uploadFile(file, 'articles');
                        img.setAttribute('src', url);
                    } catch (e) {
                        console.error('Failed to upload inline image:', e);
                    }
                }
            }
            return div.innerHTML;
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async () => {
        if (!editingArticle.title) return alert("Title is required");
        try {
            let finalContent = editingArticle.content || '';
            if (finalContent.includes('data:image/')) {
                finalContent = await uploadBase64ImagesInHTML(finalContent);
            }

            const payload = {
                ...editingArticle,
                content: finalContent,
                type: type === 'articles' ? 'ARTICLE' : 'BLOG',
                status: editingArticle.status || 'PUBLISHED',
                authorName: editingArticle.authorName || 'Admin'
            };

            const payloadStr = JSON.stringify(payload);
            const sizeInBytes = new Blob([payloadStr]).size;
            if (sizeInBytes > 1000000) {
                 return alert("The content is still too large (" + Math.round(sizeInBytes/1024) + " KB). Please remove large inline images and try again.");
            }

            if (editingArticle.id) await mockBackend.updateArticle(payload as Article);
            else await mockBackend.addArticle(payload as Article);
            
            setIsModalOpen(false);
            setEditingArticle({});
            setShowPreview(false);
        } catch (e: any) {
            alert(e.message || "Failed to save article.");
        }
    };

    const handleDeleteArticle = async (id: string, e: React.MouseEvent) => {
        const isConfirmed = await confirm({
            message: 'Delete?',
            type: 'danger',
            trigger: e.currentTarget
        });
        if (isConfirmed) {
            await mockBackend.deleteArticle(id);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setIsUploading(true);
        try {
            const url = await mockBackend.uploadFile(file, 'articles');
            setEditingArticle({ ...editingArticle, featuredImage: url });
        } finally {
            setIsUploading(false);
        }
      }
    };

    const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if(!file) return;
        if(file.size > 5 * 1024 * 1024) {
             return alert("File must be less than 5MB");
        }
        setIsUploading(true);
        try {
            const url = await mockBackend.uploadFile(file, 'articles/docs');
            
            // Extract text from the docx file
            const arrayBuffer = await file.arrayBuffer();
            const result = await mammoth.convertToHtml({ arrayBuffer });
            const extractedHtml = result.value;
            
            setEditingArticle({
                ...editingArticle, 
                fileUrl: url,
                content: extractedHtml || editingArticle.content // Set content if extracted
            });
            
            if (result.messages && result.messages.length > 0) {
                console.warn("Mammoth extraction messages:", result.messages);
            }
            
        } catch (e: any) {
            alert(e.message || "Failed to upload document");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-10">
                <h3 className="text-lg font-bold text-admin-secondary uppercase tracking-widest">Manage {type}</h3>
                <button onClick={() => { setEditingArticle({ isFeatured: false, status: 'PUBLISHED', downloadAccess: 'FREE' }); setIsModalOpen(true); }} className="bg-agri-secondary text-white px-8 py-3 rounded-xl flex items-center gap-2 text-xs font-bold shadow-md hover:bg-agri-primary transition-colors">
                    <Plus size={16} /> Create {type.slice(0, -1)}
                </button>
            </div>
            
            <div className="space-y-4">
                {articles.map(article => (
                    <div key={article.id} className="flex items-center justify-between p-6 bg-white rounded-3xl border border-admin-border hover:border-agri-secondary transition-all group shadow-sm">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-admin-bg rounded-2xl flex items-center justify-center text-admin-muted group-hover:text-agri-secondary transition-colors overflow-hidden border border-admin-border">
                                {article.featuredImage ? <img src={article.featuredImage} className="w-full h-full object-cover" /> : <FileText size={24} />}
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                  {article.isFeatured && <Star size={12} className="text-agri-secondary fill-agri-secondary" />}
                                  <h4 className="text-admin-text font-bold text-lg">{article.title}</h4>
                                </div>
                                <div className="flex items-center gap-3">
                                    <p className="text-[10px] text-admin-secondary flex items-center gap-2 uppercase font-black tracking-widest">
                                        <span>{article.authorName}</span>
                                        <span>•</span>
                                        <span>{article.status}</span>
                                    </p>
                                    
                                    {article.plagiarismReport && (
                                        <div className="flex flex-col gap-0.5 border-l border-admin-border pl-3">
                                            <div className="text-[9px] font-bold text-admin-secondary">
                                                Plagiarism Risk: <span className={article.plagiarismReport.plagiarism_score > 20 ? "text-red-600" : "text-green-600"}>{article.plagiarismReport.plagiarism_score}%</span>
                                            </div>
                                            <div className="text-[9px] font-bold text-admin-secondary">
                                                AI-Generated Probability: <span className={article.plagiarismReport.ai_generated_score > 40 ? "text-amber-600" : "text-blue-600"}>{article.plagiarismReport.ai_generated_score}%</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button onClick={() => { setEditingArticle(article); setIsModalOpen(true); }} className="p-3 bg-admin-hover rounded-xl text-admin-secondary hover:text-agri-primary"><ImageIcon size={18} /></button>
                            {isSuperAdmin && (
                                <button onClick={(e) => handleDeleteArticle(article.id, e)} className="p-3 bg-admin-hover rounded-xl text-admin-secondary hover:text-red-500"><Trash2 size={18} /></button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
                   <div className="bg-white w-full max-w-5xl rounded-[2rem] border border-admin-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                      <div className="p-8 border-b border-admin-border flex justify-between items-center bg-admin-header">
                         <div>
                            <h3 className="text-2xl font-serif font-bold text-admin-text">Editor Control Panel</h3>
                            <p className="text-admin-secondary text-[10px] font-black uppercase tracking-widest mt-1">Refining: {editingArticle.title || 'New Content'}</p>
                         </div>
                         <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white rounded-full text-admin-muted hover:text-admin-text shadow-sm"><X size={20} /></button>
                      </div>
                      
                      <div className="p-10 space-y-8 overflow-y-auto custom-scrollbar flex-1 bg-admin-bg">
                         <div className="grid lg:grid-cols-2 gap-10">
                            {/* Left Side: Core Info */}
                            <div className="space-y-6">
                               <div>
                                  <label className="text-[10px] uppercase font-bold text-admin-secondary mb-2 block tracking-widest">Title</label>
                                  <input className="w-full bg-white border border-admin-inputBorder rounded-xl p-4 text-admin-text outline-none focus:border-admin-inputFocus focus:ring-1 focus:ring-admin-inputFocus" value={editingArticle.title || ''} onChange={e => setEditingArticle({...editingArticle, title: e.target.value})} />
                               </div>
                               <div className="grid grid-cols-2 gap-4">
                                  <div>
                                     <label className="text-[10px] uppercase font-bold text-admin-secondary mb-2 block tracking-widest">Author</label>
                                     <input className="w-full bg-white border border-admin-inputBorder rounded-xl p-4 text-admin-text outline-none focus:border-admin-inputFocus focus:ring-1 focus:ring-admin-inputFocus" value={editingArticle.authorName || ''} onChange={e => setEditingArticle({...editingArticle, authorName: e.target.value})} />
                                  </div>
                                  <div>
                                     <label className="text-[10px] uppercase font-bold text-admin-secondary mb-2 block tracking-widest">Status</label>
                                     <select className="w-full bg-white border border-admin-inputBorder rounded-xl p-4 text-admin-text outline-none focus:border-admin-inputFocus focus:ring-1 focus:ring-admin-inputFocus appearance-none" value={editingArticle.status || 'PUBLISHED'} onChange={e => setEditingArticle({...editingArticle, status: e.target.value as any})}>
                                        { (type !== 'articles' || isSuperAdmin) && <option value="PUBLISHED">PUBLISHED</option>}
                                        <option value="PENDING">PENDING</option>
                                        <option value="APPROVED">APPROVED (VERIFIED)</option>
                                        <option value="REJECTED">REJECTED</option>
                                        <option value="DRAFT">DRAFT</option>
                                     </select>
                                  </div>
                               </div>
                               <div>
                                  <label className="text-[10px] uppercase font-bold text-admin-secondary mb-2 block tracking-widest">Drive Link (Optional)</label>
                                  <input className="w-full bg-white border border-admin-inputBorder rounded-xl p-4 text-admin-text outline-none focus:border-admin-inputFocus focus:ring-1 focus:ring-admin-inputFocus" value={editingArticle.driveUrl || ''} onChange={e => setEditingArticle({...editingArticle, driveUrl: e.target.value})} placeholder="https://drive.google.com/..." />
                               </div>
                               
                               {/* Plagiarism Report Box in Edit Modal */}
                               {editingArticle.plagiarismReport && (
                                   <div className="bg-white p-6 rounded-xl border border-admin-border shadow-sm">
                                       <h4 className="text-[10px] uppercase font-black text-admin-muted mb-4 tracking-widest">AI Integrity Report</h4>
                                       <div className="flex gap-4">
                                           <div className={`p-4 rounded-xl border flex-1 text-center ${editingArticle.plagiarismReport.plagiarism_score < 20 ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                                               <p className="text-2xl font-bold">{editingArticle.plagiarismReport.plagiarism_score}%</p>
                                               <p className="text-[9px] uppercase font-bold">Plagiarism</p>
                                           </div>
                                           <div className={`p-4 rounded-xl border flex-1 text-center ${editingArticle.plagiarismReport.ai_generated_score < 40 ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                                               <p className="text-2xl font-bold">{editingArticle.plagiarismReport.ai_generated_score}%</p>
                                               <p className="text-[9px] uppercase font-bold">AI Prob</p>
                                           </div>
                                       </div>
                                       <p className="text-[9px] text-admin-muted mt-3 font-mono">Analyzed: {new Date(editingArticle.plagiarismReport.generatedAt).toLocaleString()}</p>
                                   </div>
                               )}

                               <div>
                                  <div className="flex justify-between items-center mb-2">
                                    <label className="text-[10px] uppercase font-bold text-admin-secondary block tracking-widest">
                                        Content Body (HTML Supported)
                                    </label>
                                    <div className="flex items-center gap-2">
                                        {isSuperAdmin && (
                                            <div className="flex items-center gap-2 bg-admin-hover px-3 py-1 rounded-lg border border-admin-border text-[10px] font-bold text-admin-secondary">
                                                <label className="flex items-center gap-1 cursor-pointer">
                                                    <input type="checkbox" checked={strictWordMode} onChange={e => setStrictWordMode(e.target.checked)} className="rounded text-agri-secondary focus:ring-agri-secondary" />
                                                    Strict Word Paste
                                                </label>
                                                <div className="w-px h-3 bg-admin-border mx-1"></div>
                                                <select value={defaultFont} onChange={e => setDefaultFont(e.target.value)} className="bg-transparent outline-none cursor-pointer">
                                                    <option value="Arial, Helvetica, sans-serif">Arial</option>
                                                    <option value="'Times New Roman', Times, serif">Times New Roman</option>
                                                    <option value="'Courier New', Courier, monospace">Courier New</option>
                                                    <option value="'Plus Jakarta Sans', sans-serif">Plus Jakarta Sans</option>
                                                    <option value="'Playfair Display', serif">Playfair Display</option>
                                                </select>
                                                <div className="w-px h-3 bg-admin-border mx-1"></div>
                                                <select value={defaultFontSize} onChange={e => setDefaultFontSize(e.target.value)} className="bg-transparent outline-none cursor-pointer">
                                                    <option value="12px">12px</option>
                                                    <option value="14px">14px</option>
                                                    <option value="16px">16px</option>
                                                    <option value="18px">18px</option>
                                                </select>
                                            </div>
                                        )}
                                        <button 
                                            onClick={() => setShowPreview(!showPreview)}
                                            className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border transition-all ${showPreview ? 'bg-agri-secondary text-white border-agri-secondary' : 'bg-white text-admin-secondary border-admin-border'}`}
                                        >
                                            {showPreview ? <><Edit3 size={12}/> Edit Mode</> : <><Eye size={12}/> Live Preview</>}
                                        </button>
                                    </div>
                                  </div>
                                  
                                  <div className="bg-white border border-admin-inputBorder rounded-2xl overflow-hidden relative shadow-inner">
                                     {!showPreview ? (
                                        <JoditEditor
                                            ref={editorRef as any}
                                            value={editingArticle.content || ''}
                                            config={{
                                                readonly: false,
                                                placeholder: 'Write here... Paste from Word supported.',
                                                height: 600,
                                                uploader: {
                                                    insertImageAsBase64URI: true
                                                },
                                                askBeforePasteHTML: false,
                                                askBeforePasteFromWord: false,
                                                defaultActionOnPaste: strictWordMode ? 'insert_as_html' : 'insert_clear_html',
                                                cleanHTML: {
                                                    fillEmptyParagraph: true,
                                                    removeEmptyElements: false,
                                                    replaceNBSP: false,
                                                    removeOnError: true,
                                                    denyTags: 'script,applet,embed,object'
                                                },
                                                style: {
                                                    fontFamily: defaultFont,
                                                    fontSize: defaultFontSize
                                                },
                                                buttons: [
                                                    'source', '|',
                                                    'bold', 'strikethrough', 'underline', 'italic', '|',
                                                    'superscript', 'subscript', '|',
                                                    'ul', 'ol', '|',
                                                    'outdent', 'indent', '|',
                                                    'font', 'fontsize', 'brush', 'paragraph', '|',
                                                    'image', 'table', 'link', '|',
                                                    'align', 'undo', 'redo', '|',
                                                    'hr', 'eraser', 'copyformat', 'fullsize'
                                                ],
                                                removeButtons: [],
                                                showXPathInStatusbar: false,
                                                showCharsCounter: false,
                                                showWordsCounter: false,
                                                toolbarAdaptive: false
                                            }}
                                            onBlur={newContent => {
                                                if (typeof newContent === 'string') {
                                                    setEditingArticle({...editingArticle, content: newContent});
                                                }
                                            }}
                                            onChange={newContent => {
                                                if (typeof newContent === 'string') {
                                                    setEditingArticle({...editingArticle, content: newContent});
                                                }
                                            }}
                                        />
                                     ) : (
                                        <div className="w-full bg-white p-6 h-[600px] overflow-y-auto">
                                            <div 
                                                className="prose prose-stone prose-sm max-w-none font-serif text-stone-700"
                                                dangerouslySetInnerHTML={{ __html: editingArticle.content || '<p>Start writing to see preview...</p>' }}
                                            />
                                        </div>
                                     )}
                                  </div>
                               </div>
                            </div>

                            {/* Right Side: Media & SEO */}
                            <div className="space-y-8">
                               <div className="bg-white p-8 rounded-3xl border border-admin-border shadow-sm">
                                  <h4 className="text-[10px] font-black uppercase text-agri-secondary tracking-[0.2em] mb-6 flex items-center justify-between">
                                     SEO & META <Globe size={14}/>
                                  </h4>
                                  <div className="space-y-4">
                                     <input className="w-full bg-white border border-admin-inputBorder rounded-xl p-3 text-xs text-admin-text outline-none focus:border-admin-inputFocus focus:ring-1 focus:ring-admin-inputFocus" placeholder="SEO Meta Title" value={editingArticle.seoTitle || ''} onChange={e => setEditingArticle({...editingArticle, seoTitle: e.target.value})} />
                                     <textarea className="w-full bg-white border border-admin-inputBorder rounded-xl p-3 text-xs text-admin-text outline-none focus:border-admin-inputFocus focus:ring-1 focus:ring-admin-inputFocus h-20" placeholder="Meta Description for Google" value={editingArticle.metaDescription || ''} onChange={e => setEditingArticle({...editingArticle, metaDescription: e.target.value})} />
                                  </div>
                               </div>

                               <div>
                                  <label className="text-[10px] uppercase font-bold text-admin-secondary mb-4 block tracking-widest">Featured Thumbnail</label>
                                  <div className="aspect-video bg-admin-hover rounded-[2rem] border border-admin-border overflow-hidden mb-4 relative group">
                                     {isUploading && (
                                        <div className="absolute inset-0 z-20 bg-white/80 flex items-center justify-center text-agri-secondary">
                                            <Loader2 size={32} className="animate-spin" />
                                        </div>
                                     )}
                                     {editingArticle.featuredImage ? <img src={editingArticle.featuredImage} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-admin-muted"><ImageIcon size={40}/></div>}
                                     <label htmlFor="art-img" className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer">
                                        <span className="text-[10px] font-black text-white uppercase tracking-widest">UPLOAD_NEW_IMG</span>
                                     </label>
                                     <input type="file" id="art-img" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                                  </div>
                               </div>

                               {type === 'blogs' && (
                               <div>
                                  <label className="text-[10px] uppercase font-bold text-admin-secondary mb-4 block tracking-widest">Document Attachment (.docx)</label>
                                  <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-admin-border shadow-sm group">
                                     <div className="flex items-center gap-3">
                                         <FileIcon size={20} className={editingArticle.fileUrl ? "text-agri-secondary" : "text-admin-muted"} />
                                         <div className="flex flex-col max-w-[120px]">
                                            <span className="text-[10px] font-bold text-admin-text uppercase truncate">
                                                {editingArticle.fileUrl ? 'DOC_LOADED' : 'NO_DOC_QUEUED'}
                                            </span>
                                            <span className="text-[9px] text-admin-muted uppercase">Max: 5MB</span>
                                         </div>
                                     </div>
                                     <label className="px-4 py-2 bg-admin-hover text-admin-text rounded-lg text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:bg-admin-border transition-colors">
                                        Upload
                                        <input type="file" className="hidden" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleDocUpload} disabled={isUploading} />
                                     </label>
                                  </div>
                               </div>
                               )}

                               <div className="flex items-center justify-between p-6 bg-white rounded-2xl border border-admin-border shadow-sm">
                                  <div>
                                     <p className="text-xs font-bold text-admin-text uppercase tracking-widest">Feature on Home</p>
                                     <p className="text-[10px] text-admin-muted uppercase mt-1">Priority visibility flag</p>
                                  </div>
                                  <button 
                                    onClick={() => setEditingArticle({...editingArticle, isFeatured: !editingArticle.isFeatured})}
                                    className={`px-6 py-2 rounded-lg font-bold text-[10px] tracking-widest ${editingArticle.isFeatured ? 'bg-agri-secondary text-white' : 'bg-admin-hover text-admin-muted'}`}
                                  >
                                    {editingArticle.isFeatured ? 'ACTIVE' : 'INACTIVE'}
                                  </button>
                               </div>
                            </div>
                         </div>
                      </div>

                      <div className="p-8 border-t border-admin-border flex justify-end gap-6 bg-admin-header">
                         <button onClick={() => setIsModalOpen(false)} className="px-10 py-3 text-admin-secondary hover:text-admin-text font-bold text-xs uppercase tracking-widest">Cancel</button>
                         <button onClick={handleSave} className="bg-agri-secondary text-white px-16 py-3 rounded-2xl font-bold flex items-center gap-3 shadow-lg hover:bg-agri-primary transition-colors">
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
    const [uploadingField, setUploadingField] = useState<string | null>(null);
    const { confirm } = useConfirm();

    useEffect(() => {
        const unsub = mockBackend.subscribeToMagazines(setMagazines);
        return () => unsub();
    }, []);

    const handleSave = async () => {
        if (!editingMag.title) return alert("Title is required");
        
        await mockBackend.addMagazine(editingMag as Magazine);
        setIsModalOpen(false);
        setEditingMag({});
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        const isConfirmed = await confirm({
            message: "Delete this magazine issue?",
            type: 'danger',
            trigger: e.currentTarget
        });
        if(isConfirmed) {
            await mockBackend.deleteMagazine(id);
        }
    };

    const handleFileUpload = (field: 'coverImage' | 'pdfUrl') => async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setUploadingField(field);
        try {
            const url = await mockBackend.uploadFile(file, 'magazines');
            setEditingMag(prev => ({ ...prev, [field]: url }));
        } finally {
            setUploadingField(null);
        }
      }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-10">
                <h3 className="text-lg font-bold text-admin-secondary uppercase tracking-widest">Manage Magazines</h3>
                <button onClick={() => { setEditingMag({ status: 'PUBLISHED', downloadAccess: 'SUBSCRIBERS_ONLY', month: 'January', year: 2025 }); setIsModalOpen(true); }} className="bg-agri-secondary text-white px-8 py-3 rounded-xl flex items-center gap-2 text-xs font-bold shadow-md hover:bg-agri-primary">
                    <Plus size={16} /> Add New Issue
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {magazines.map(mag => (
                    <div key={mag.id} className="bg-white rounded-[2.5rem] border border-admin-border overflow-hidden hover:border-agri-secondary transition-all group shadow-sm">
                        <div className="aspect-[3/4] relative overflow-hidden bg-admin-hover">
                            {mag.coverImage ? (
                                <img src={mag.coverImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-admin-muted/20">
                                    <BookOpen size={64} />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                <button onClick={() => { setEditingMag(mag); setIsModalOpen(true); }} className="p-4 bg-white text-agri-primary rounded-2xl hover:scale-110 transition-transform shadow-2xl">
                                    <ImageIcon size={20} />
                                </button>
                                {mag.pdfUrl && (
                                    <a href={mag.pdfUrl} target="_blank" rel="noreferrer" className="p-4 bg-agri-secondary text-white rounded-2xl hover:scale-110 transition-transform shadow-2xl">
                                        <FileIcon size={20} />
                                    </a>
                                )}
                            </div>
                        </div>
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="text-admin-text font-bold text-xl">{mag.title}</h4>
                                    <p className="text-[10px] text-admin-muted uppercase font-black tracking-widest mt-1">Vol {mag.volume} • Issue {mag.issueNumber}</p>
                                </div>
                                <span className="bg-agri-secondary/10 text-agri-secondary text-[8px] font-black uppercase px-2 py-1 rounded">{mag.month} {mag.year}</span>
                            </div>
                            <div className="flex items-center justify-between pt-6 border-t border-admin-border">
                                <span className={`text-[9px] font-black uppercase tracking-widest ${mag.downloadAccess === 'FREE' ? 'text-green-500' : 'text-agri-secondary'}`}>
                                    {mag.downloadAccess.replace('_', ' ')}
                                </span>
                                <button onClick={(e) => handleDelete(mag.id, e)} className="text-admin-muted hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
                   <div className="bg-white w-full max-w-4xl rounded-[3rem] border border-admin-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                      <div className="p-8 border-b border-admin-border flex justify-between items-center bg-admin-header">
                         <div>
                            <h3 className="text-2xl font-serif font-bold text-admin-text">Magazine Issue Control</h3>
                            <p className="text-admin-secondary text-[10px] font-black uppercase tracking-widest mt-1">{editingMag.id ? 'Refining Node' : 'Initializing New Protocol'}</p>
                         </div>
                         <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white rounded-full text-admin-muted hover:text-admin-text shadow-sm"><X size={20} /></button>
                      </div>
                      
                      <div className="p-10 space-y-8 overflow-y-auto custom-scrollbar flex-1 bg-admin-bg">
                         <div className="grid lg:grid-cols-12 gap-10">
                            {/* Left: Metadata */}
                            <div className="lg:col-span-7 space-y-6">
                               <div>
                                  <label className="text-[10px] uppercase font-bold text-admin-secondary mb-2 block tracking-widest">Issue Title</label>
                                  <input className="w-full bg-white border border-admin-inputBorder rounded-2xl p-4 text-admin-text outline-none focus:border-admin-inputFocus focus:ring-1 focus:ring-admin-inputFocus" placeholder="e.g. Sustainable Futures" value={editingMag.title || ''} onChange={e => setEditingMag({...editingMag, title: e.target.value})} />
                               </div>
                               
                               <div className="grid grid-cols-2 gap-6">
                                  <div>
                                     <label className="text-[10px] uppercase font-bold text-admin-secondary mb-2 block tracking-widest">Volume No.</label>
                                     <input className="w-full bg-white border border-admin-inputBorder rounded-2xl p-4 text-admin-text outline-none focus:border-admin-inputFocus focus:ring-1 focus:ring-admin-inputFocus" value={editingMag.volume || ''} onChange={e => setEditingMag({...editingMag, volume: e.target.value})} />
                                  </div>
                                  <div>
                                     <label className="text-[10px] uppercase font-bold text-admin-secondary mb-2 block tracking-widest">Issue No.</label>
                                     <input className="w-full bg-white border border-admin-inputBorder rounded-2xl p-4 text-admin-text outline-none focus:border-admin-inputFocus focus:ring-1 focus:ring-admin-inputFocus" value={editingMag.issueNumber || ''} onChange={e => setEditingMag({...editingMag, issueNumber: e.target.value})} />
                                  </div>
                               </div>

                               <div className="grid grid-cols-2 gap-6">
                                  <div>
                                     <label className="text-[10px] uppercase font-bold text-admin-secondary mb-2 block tracking-widest">Publication Month</label>
                                     <select className="w-full bg-white border border-admin-inputBorder rounded-2xl p-4 text-admin-text outline-none focus:border-admin-inputFocus focus:ring-1 focus:ring-admin-inputFocus" value={editingMag.month} onChange={e => setEditingMag({...editingMag, month: e.target.value})}>
                                        {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                                            <option key={m}>{m}</option>
                                        ))}
                                     </select>
                                  </div>
                                  <div>
                                     <label className="text-[10px] uppercase font-bold text-admin-secondary mb-2 block tracking-widest">Year</label>
                                     <input type="number" className="w-full bg-white border border-admin-inputBorder rounded-2xl p-4 text-admin-text outline-none focus:border-admin-inputFocus focus:ring-1 focus:ring-admin-inputFocus" value={editingMag.year} onChange={e => setEditingMag({...editingMag, year: parseInt(e.target.value)})} />
                                  </div>
                               </div>

                               <div>
                                  <label className="text-[10px] uppercase font-bold text-admin-secondary mb-2 block tracking-widest">Access Permission</label>
                                  <select className="w-full bg-white border border-admin-inputBorder rounded-2xl p-4 text-admin-text outline-none focus:border-admin-inputFocus focus:ring-1 focus:ring-admin-inputFocus" value={editingMag.downloadAccess} onChange={e => setEditingMag({...editingMag, downloadAccess: e.target.value as any})}>
                                     <option value="FREE">FREE ACCESS (PUBLIC)</option>
                                     <option value="SUBSCRIBERS_ONLY">SUBSCRIBERS ONLY (PRIVATE)</option>
                                  </select>
                               </div>
                               <div>
                                  <label className="text-[10px] uppercase font-bold text-admin-secondary mb-2 block tracking-widest">Drive Link (Optional)</label>
                                  <input className="w-full bg-white border border-admin-inputBorder rounded-2xl p-4 text-admin-text outline-none focus:border-admin-inputFocus focus:ring-1 focus:ring-admin-inputFocus" value={editingMag.driveUrl || ''} onChange={e => setEditingMag({...editingMag, driveUrl: e.target.value})} placeholder="https://drive.google.com/..." />
                               </div>
                            </div>

                            {/* Right: Files */}
                            <div className="lg:col-span-5 space-y-8">
                               <div>
                                  <label className="text-[10px] uppercase font-bold text-admin-secondary mb-3 block tracking-widest">Cover Artwork</label>
                                  <div className="aspect-[3/4] bg-admin-hover rounded-3xl border-2 border-dashed border-admin-border overflow-hidden relative group">
                                     {uploadingField === 'coverImage' && (
                                        <div className="absolute inset-0 z-20 bg-white/80 flex items-center justify-center text-agri-secondary">
                                            <Loader2 size={32} className="animate-spin" />
                                        </div>
                                     )}
                                     {editingMag.coverImage ? <img src={editingMag.coverImage} className="w-full h-full object-cover" /> : <div className="w-full h-full flex flex-col items-center justify-center text-admin-muted"><ImageIcon size={40}/><span className="text-[8px] mt-2">MISSING_ART</span></div>}
                                     <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer">
                                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Replace Cover</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload('coverImage')} disabled={!!uploadingField} />
                                     </label>
                                  </div>
                               </div>

                               <div className="bg-white p-8 rounded-3xl border border-admin-border shadow-sm">
                                  <h4 className="text-[10px] font-black uppercase text-agri-secondary tracking-[0.2em] mb-6 flex items-center justify-between">
                                     PDF BROADCAST <Bookmark size={14}/>
                                  </h4>
                                  <div className="space-y-4">
                                     <div className="flex items-center justify-between p-4 bg-admin-bg rounded-2xl border border-admin-border">
                                        <div className="flex items-center gap-3">
                                            <FileIcon size={20} className={editingMag.pdfUrl ? 'text-green-500' : 'text-admin-muted'} />
                                            <span className="text-[10px] font-bold text-admin-secondary uppercase truncate max-w-[120px]">
                                                {uploadingField === 'pdfUrl' ? 'UPLOADING...' : editingMag.pdfUrl ? 'PROTOCOL_LOADED' : 'NO_FILE_QUEUED'}
                                            </span>
                                        </div>
                                        <label className={`px-4 py-2 bg-agri-secondary text-white rounded-xl text-[9px] font-black cursor-pointer hover:scale-105 transition-transform ${!!uploadingField ? 'opacity-50 pointer-events-none' : ''}`}>
                                            {uploadingField === 'pdfUrl' ? <Loader2 size={12} className="animate-spin inline" /> : 'UPLOAD PDF'}
                                            <input type="file" accept="application/pdf" className="hidden" onChange={handleFileUpload('pdfUrl')} disabled={!!uploadingField} />
                                        </label>
                                     </div>
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>

                      <div className="p-8 border-t border-admin-border flex justify-end gap-6 bg-admin-header">
                         <button onClick={() => setIsModalOpen(false)} className="px-10 py-3 text-admin-secondary hover:text-admin-text font-bold text-xs uppercase tracking-widest">Terminate</button>
                         <button onClick={handleSave} className="bg-agri-secondary text-white px-16 py-3 rounded-[2rem] font-bold flex items-center gap-3 shadow-lg hover:bg-agri-primary transition-colors">
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
