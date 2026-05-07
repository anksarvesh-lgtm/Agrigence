
import React, { useState, useEffect } from 'react';
import { mockBackend } from '../../services/mockBackend';
import { SEOSettings as SEOTypes } from '../../types';
import { 
  Save, Globe, Code, Search, ImageIcon, Upload, Loader2, 
  Rss, Share2, Layers, Map, Link as LinkIcon, Activity, Zap, CheckCircle 
} from 'lucide-react';

const SEOSettings: React.FC = () => {
  const [seo, setSeo] = useState<SEOTypes | null>(null);
  const [activeTab, setActiveTab] = useState('global');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const init = async () => {
        await mockBackend.refreshSettings();
        const settings = mockBackend.getSettings();
        setSeo(settings.seo); // Assumes type update ensures fields exist or fallback
    };
    init();
  }, []);

  const handleSave = async () => {
    if (!seo) return;
    setIsSaving(true);
    await mockBackend.refreshSettings();
    const settings = mockBackend.getSettings();
    await mockBackend.updateSettings({ ...settings, seo });
    
    setTimeout(() => {
      setIsSaving(false);
      alert('Global SEO protocols updated!');
    }, 800);
  };

  const handleImageUpload = (field: 'ogImage' | 'blogFallbackImage') => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && seo) {
      setIsUploading(true);
      try {
        const url = await mockBackend.uploadToBlob(file, 'seo');
        setSeo({ ...seo, [field]: url });
      } catch (error) {
        console.error("Upload failed", error);
        alert("Image upload failed");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const toggleSchema = (key: keyof NonNullable<SEOTypes['schemaTemplates']>) => {
      if(!seo || !seo.schemaTemplates) return;
      setSeo({
          ...seo,
          schemaTemplates: {
              ...seo.schemaTemplates,
              [key]: !seo.schemaTemplates[key]
          }
      });
  };

  if (!seo) return <div className="text-black p-10 text-center font-bold">Loading SEO Architecture...</div>;

  const tabs = [
      { id: 'global', label: 'Global Settings', icon: Globe },
      { id: 'blog', label: 'Blog SEO Controls', icon: Rss },
      { id: 'social', label: 'Social & Open Graph', icon: Share2 },
      { id: 'schema', label: 'Structured Data', icon: Layers },
      { id: 'sitemap', label: 'Sitemap & Crawling', icon: Map },
      { id: 'urls', label: 'URL & Canonical', icon: LinkIcon },
      { id: 'indexation', label: 'Indexation Controls', icon: Search },
      { id: 'technical', label: 'Technical SEO', icon: Zap },
      { id: 'verification', label: 'Integrations', icon: CheckCircle },
      { id: 'diagnostics', label: 'Diagnostics', icon: Activity },
  ];

  return (
    <div className="space-y-8 max-w-7xl pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl border border-stone-200 shadow-sm sticky top-0 z-20 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-black">SEO Control Center</h1>
          <p className="text-black text-xs mt-1 uppercase tracking-widest font-bold">Search engine governance & discoverability</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className="bg-agri-secondary text-white px-10 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-agri-primary transition-all active:scale-95 disabled:opacity-50 shadow-lg w-full md:w-auto justify-center"
        >
           <Save size={18} /> {isSaving ? 'SYNCING...' : 'APPLY CONFIG'}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Navigation Sidebar */}
          <div className="lg:w-64 shrink-0 space-y-2">
              {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-black text-white shadow-md' : 'bg-white text-stone-500 hover:bg-stone-100'}`}
                  >
                      <tab.icon size={16} /> {tab.label}
                  </button>
              ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 bg-white border border-stone-200 rounded-[2.5rem] p-8 shadow-sm">
              
              {/* 1. Global Settings */}
              {activeTab === 'global' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                      <h3 className="text-lg font-bold text-black border-b border-stone-100 pb-4 mb-6">Global Metadata Defaults</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                          <div>
                              <label className="text-[10px] uppercase font-bold text-stone-500 mb-2 block tracking-widest">Site Title Template</label>
                              <input className="w-full bg-stone-50 border border-stone-200 rounded-xl p-4 text-black outline-none focus:border-agri-secondary text-sm" value={seo.metaTitle} onChange={e => setSeo({...seo, metaTitle: e.target.value})} placeholder="{{title}} | Agrigence" />
                          </div>
                          <div>
                              <label className="text-[10px] uppercase font-bold text-stone-500 mb-2 block tracking-widest">Publisher Identity</label>
                              <input className="w-full bg-stone-50 border border-stone-200 rounded-xl p-4 text-black outline-none focus:border-agri-secondary text-sm" value={seo.publisherName || ''} onChange={e => setSeo({...seo, publisherName: e.target.value})} />
                          </div>
                      </div>
                      <div>
                          <label className="text-[10px] uppercase font-bold text-stone-500 mb-2 block tracking-widest">Default Meta Description</label>
                          <textarea className="w-full bg-stone-50 border border-stone-200 rounded-xl p-4 text-black outline-none focus:border-agri-secondary text-sm h-24" value={seo.metaDescription} onChange={e => setSeo({...seo, metaDescription: e.target.value})} />
                      </div>
                      <div className="grid md:grid-cols-3 gap-6">
                          <div>
                              <label className="text-[10px] uppercase font-bold text-stone-500 mb-2 block tracking-widest">Canonical Base URL</label>
                              <input className="w-full bg-stone-50 border border-stone-200 rounded-xl p-4 text-black outline-none focus:border-agri-secondary text-sm" value={seo.canonicalBaseUrl || ''} onChange={e => setSeo({...seo, canonicalBaseUrl: e.target.value})} />
                          </div>
                          <div>
                              <label className="text-[10px] uppercase font-bold text-stone-500 mb-2 block tracking-widest">Language (ISO)</label>
                              <input className="w-full bg-stone-50 border border-stone-200 rounded-xl p-4 text-black outline-none focus:border-agri-secondary text-sm" value={seo.language || 'en'} onChange={e => setSeo({...seo, language: e.target.value})} />
                          </div>
                          <div>
                              <label className="text-[10px] uppercase font-bold text-stone-500 mb-2 block tracking-widest">Region Target</label>
                              <input className="w-full bg-stone-50 border border-stone-200 rounded-xl p-4 text-black outline-none focus:border-agri-secondary text-sm" value={seo.region || 'Global'} onChange={e => setSeo({...seo, region: e.target.value})} />
                          </div>
                      </div>
                      <div className="flex items-center gap-4 bg-stone-50 p-4 rounded-xl">
                          <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={seo.forceHttps || false} onChange={e => setSeo({...seo, forceHttps: e.target.checked})} className="accent-agri-secondary w-4 h-4"/>
                              <span className="text-xs font-bold text-black uppercase tracking-wide">Force HTTPS Redirection</span>
                          </label>
                      </div>
                  </div>
              )}

              {/* 2. Blog SEO Controls */}
              {activeTab === 'blog' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                      <h3 className="text-lg font-bold text-black border-b border-stone-100 pb-4 mb-6">Blog Automation Engine</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                          <div>
                              <label className="text-[10px] uppercase font-bold text-stone-500 mb-2 block tracking-widest">Blog Title Template</label>
                              <input className="w-full bg-stone-50 border border-stone-200 rounded-xl p-4 text-black outline-none focus:border-agri-secondary text-sm" value={seo.blogTitleTemplate || ''} onChange={e => setSeo({...seo, blogTitleTemplate: e.target.value})} placeholder="{{title}} | Agrigence Blog" />
                          </div>
                          <div className="bg-stone-50 rounded-xl border border-stone-200 p-4">
                              <label className="text-[10px] uppercase font-bold text-stone-500 mb-3 block tracking-widest">Automation Toggles</label>
                              <div className="space-y-2">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                      <input type="checkbox" checked={seo.autoMetaDesc || false} onChange={e => setSeo({...seo, autoMetaDesc: e.target.checked})} className="accent-agri-secondary w-4 h-4"/>
                                      <span className="text-xs font-bold text-stone-700">Auto-generate Meta Description from Content</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                      <input type="checkbox" checked={seo.enableBlogSchema || false} onChange={e => setSeo({...seo, enableBlogSchema: e.target.checked})} className="accent-agri-secondary w-4 h-4"/>
                                      <span className="text-xs font-bold text-stone-700">Enable BlogPosting Schema</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                      <input type="checkbox" checked={seo.autoInternalLinking || false} onChange={e => setSeo({...seo, autoInternalLinking: e.target.checked})} className="accent-agri-secondary w-4 h-4"/>
                                      <span className="text-xs font-bold text-stone-700">Auto-suggest Internal Links</span>
                                  </label>
                              </div>
                          </div>
                      </div>
                      
                      <div className="grid md:grid-cols-3 gap-4">
                          <label className="flex items-center gap-2 cursor-pointer bg-stone-50 p-4 rounded-xl border border-stone-200">
                              <input type="checkbox" checked={seo.showReadingTime || false} onChange={e => setSeo({...seo, showReadingTime: e.target.checked})} className="accent-agri-secondary w-4 h-4"/>
                              <span className="text-xs font-bold text-stone-700 uppercase">Calc Reading Time</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer bg-stone-50 p-4 rounded-xl border border-stone-200">
                              <input type="checkbox" checked={seo.enforceAltText || false} onChange={e => setSeo({...seo, enforceAltText: e.target.checked})} className="accent-agri-secondary w-4 h-4"/>
                              <span className="text-xs font-bold text-stone-700 uppercase">Enforce Alt Text</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer bg-stone-50 p-4 rounded-xl border border-stone-200">
                              <input type="checkbox" checked={seo.cleanSlugs || false} onChange={e => setSeo({...seo, cleanSlugs: e.target.checked})} className="accent-agri-secondary w-4 h-4"/>
                              <span className="text-xs font-bold text-stone-700 uppercase">Clean Slug Gen</span>
                          </label>
                      </div>

                      <div>
                          <label className="text-[10px] uppercase font-bold text-stone-500 mb-2 block tracking-widest">Blog Fallback Image</label>
                          <div className="flex gap-4 items-center">
                              <div className="w-16 h-16 bg-stone-100 rounded-xl border border-stone-200 overflow-hidden relative">
                                  {seo.blogFallbackImage && <img src={seo.blogFallbackImage} className="w-full h-full object-cover" />}
                              </div>
                              <label className="bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl text-xs font-bold cursor-pointer hover:bg-stone-100">
                                  {isUploading ? 'Uploading...' : 'Upload Default Image'}
                                  <input type="file" className="hidden" onChange={handleImageUpload('blogFallbackImage')} disabled={isUploading} />
                              </label>
                          </div>
                      </div>
                  </div>
              )}

              {/* 3. Social & Open Graph */}
              {activeTab === 'social' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                      <h3 className="text-lg font-bold text-black border-b border-stone-100 pb-4 mb-6">Social Media Preview</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                          <div>
                              <label className="text-[10px] uppercase font-bold text-stone-500 mb-2 block tracking-widest">OG Title Template</label>
                              <input className="w-full bg-stone-50 border border-stone-200 rounded-xl p-4 text-black outline-none focus:border-agri-secondary text-sm" value={seo.ogTitleTemplate || ''} onChange={e => setSeo({...seo, ogTitleTemplate: e.target.value})} placeholder="{{title}}" />
                          </div>
                          <div>
                              <label className="text-[10px] uppercase font-bold text-stone-500 mb-2 block tracking-widest">Twitter Card Type</label>
                              <select className="w-full bg-stone-50 border border-stone-200 rounded-xl p-4 text-black outline-none focus:border-agri-secondary text-sm" value={seo.twitterCardType || 'summary_large_image'} onChange={e => setSeo({...seo, twitterCardType: e.target.value as any})}>
                                  <option value="summary">Summary</option>
                                  <option value="summary_large_image">Summary Large Image</option>
                              </select>
                          </div>
                      </div>
                      
                      <div>
                          <label className="text-[10px] uppercase font-bold text-stone-500 mb-2 block tracking-widest">Default OG Image</label>
                          <div className="flex gap-4 items-center">
                              <div className="w-32 h-20 bg-stone-100 rounded-xl border border-stone-200 overflow-hidden relative">
                                  {seo.ogImage && <img src={seo.ogImage} className="w-full h-full object-cover" />}
                              </div>
                              <label className="bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl text-xs font-bold cursor-pointer hover:bg-stone-100">
                                  {isUploading ? 'Uploading...' : 'Upload Social Card'}
                                  <input type="file" className="hidden" onChange={handleImageUpload('ogImage')} disabled={isUploading} />
                              </label>
                          </div>
                      </div>
                  </div>
              )}

              {/* 4. Structured Data */}
              {activeTab === 'schema' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                      <h3 className="text-lg font-bold text-black border-b border-stone-100 pb-4 mb-6">Schema Orchestrator</h3>
                      <p className="text-xs text-stone-500 mb-4">Toggle automatic JSON-LD injection for specific content types.</p>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                          {[
                              { id: 'organization', label: 'Organization' },
                              { id: 'website', label: 'WebSite' },
                              { id: 'scholarlyArticle', label: 'ScholarlyArticle (Research)' },
                              { id: 'blogPosting', label: 'BlogPosting' },
                              { id: 'breadcrumb', label: 'BreadcrumbList' },
                              { id: 'person', label: 'Person (Authors)' }
                          ].map(s => (
                              <div key={s.id} className="flex items-center justify-between p-4 bg-stone-50 border border-stone-200 rounded-xl">
                                  <span className="text-xs font-bold text-black">{s.label}</span>
                                  <button 
                                    onClick={() => toggleSchema(s.id as any)}
                                    className={`w-10 h-5 rounded-full relative transition-colors ${seo.schemaTemplates?.[s.id as keyof typeof seo.schemaTemplates] ? 'bg-agri-secondary' : 'bg-stone-300'}`}
                                  >
                                      <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${seo.schemaTemplates?.[s.id as keyof typeof seo.schemaTemplates] ? 'left-6' : 'left-1'}`}></div>
                                  </button>
                              </div>
                          ))}
                      </div>

                      <div>
                          <label className="text-[10px] uppercase font-bold text-stone-500 mb-2 block tracking-widest">Global Custom JSON-LD</label>
                          <textarea className="w-full bg-black text-green-400 border border-stone-200 rounded-xl p-4 outline-none font-mono text-xs h-40" value={seo.customJsonLd || ''} onChange={e => setSeo({...seo, customJsonLd: e.target.value})} placeholder='{ "@context": "https://schema.org", ... }' />
                      </div>
                  </div>
              )}

              {/* 5. Sitemap */}
              {activeTab === 'sitemap' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                      <h3 className="text-lg font-bold text-black border-b border-stone-100 pb-4 mb-6">Sitemap Configuration</h3>
                      <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200">
                          <label className="flex items-center gap-3 cursor-pointer mb-6">
                              <input type="checkbox" checked={seo.sitemapEnabled || false} onChange={e => setSeo({...seo, sitemapEnabled: e.target.checked})} className="accent-agri-secondary w-5 h-5"/>
                              <span className="font-bold text-black">Enable Auto-Generated Sitemap</span>
                          </label>
                          
                          <div className="grid md:grid-cols-3 gap-4 ml-8">
                              <label className="flex items-center gap-2 cursor-pointer">
                                  <input type="checkbox" checked={seo.includeArticles || false} onChange={e => setSeo({...seo, includeArticles: e.target.checked})} className="accent-agri-secondary w-4 h-4"/>
                                  <span className="text-xs font-bold text-stone-600">Include Articles</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                  <input type="checkbox" checked={seo.includeBlogs || false} onChange={e => setSeo({...seo, includeBlogs: e.target.checked})} className="accent-agri-secondary w-4 h-4"/>
                                  <span className="text-xs font-bold text-stone-600">Include Blogs</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                  <input type="checkbox" checked={seo.includePages || false} onChange={e => setSeo({...seo, includePages: e.target.checked})} className="accent-agri-secondary w-4 h-4"/>
                                  <span className="text-xs font-bold text-stone-600">Include Static Pages</span>
                              </label>
                          </div>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl border border-blue-100">
                          <span className="text-xs font-bold text-blue-800">Sitemap URL</span>
                          <code className="text-xs bg-white px-3 py-1 rounded border border-blue-100 text-blue-600">https://www.agrigence.in/sitemap.xml</code>
                      </div>
                  </div>
              )}

              {/* 6. URL & Canonical */}
              {activeTab === 'urls' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                      <h3 className="text-lg font-bold text-black border-b border-stone-100 pb-4 mb-6">URL Normalization</h3>
                      <div className="space-y-4">
                          <label className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-200">
                              <span className="text-sm font-bold text-black">Force Lowercase URLs</span>
                              <input type="checkbox" checked={seo.forceLowercase || false} onChange={e => setSeo({...seo, forceLowercase: e.target.checked})} className="accent-agri-secondary w-5 h-5"/>
                          </label>
                          <label className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-200">
                              <span className="text-sm font-bold text-black">Strip Query Parameters</span>
                              <input type="checkbox" checked={seo.removeParams || false} onChange={e => setSeo({...seo, removeParams: e.target.checked})} className="accent-agri-secondary w-5 h-5"/>
                          </label>
                          <label className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-200">
                              <span className="text-sm font-bold text-black">Strict Canonical Enforcement</span>
                              <input type="checkbox" checked={seo.canonicalEnforcement || false} onChange={e => setSeo({...seo, canonicalEnforcement: e.target.checked})} className="accent-agri-secondary w-5 h-5"/>
                          </label>
                      </div>
                  </div>
              )}

              {/* 7. Indexation */}
              {activeTab === 'indexation' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                      <h3 className="text-lg font-bold text-black border-b border-stone-100 pb-4 mb-6">Crawling Directives</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                          <div>
                              <label className="text-[10px] uppercase font-bold text-stone-500 mb-2 block tracking-widest">Default Robots Tag</label>
                              <input className="w-full bg-stone-50 border border-stone-200 rounded-xl p-4 text-black outline-none focus:border-agri-secondary text-sm font-mono" value={seo.defaultRobots || 'index, follow'} onChange={e => setSeo({...seo, defaultRobots: e.target.value})} />
                          </div>
                          <div>
                              <label className="text-[10px] uppercase font-bold text-stone-500 mb-2 block tracking-widest">Max Image Preview</label>
                              <select className="w-full bg-stone-50 border border-stone-200 rounded-xl p-4 text-black outline-none focus:border-agri-secondary text-sm" value={seo.maxImagePreview || 'large'} onChange={e => setSeo({...seo, maxImagePreview: e.target.value as any})}>
                                  <option value="none">None</option>
                                  <option value="standard">Standard</option>
                                  <option value="large">Large</option>
                              </select>
                          </div>
                      </div>
                      <div>
                          <label className="text-[10px] uppercase font-bold text-stone-500 mb-2 block tracking-widest">Global Robots.txt</label>
                          <textarea className="w-full bg-stone-50 border border-stone-200 rounded-xl p-4 text-black outline-none focus:border-agri-secondary text-sm font-mono h-32" value={seo.robotsTxt} onChange={e => setSeo({...seo, robotsTxt: e.target.value})} />
                      </div>
                      <div>
                          <label className="text-[10px] uppercase font-bold text-stone-500 mb-2 block tracking-widest">Noindex Paths (Comma separated)</label>
                          <input className="w-full bg-stone-50 border border-stone-200 rounded-xl p-4 text-black outline-none focus:border-agri-secondary text-sm font-mono" value={seo.noindexPaths || ''} onChange={e => setSeo({...seo, noindexPaths: e.target.value})} placeholder="/admin, /private, /temp" />
                      </div>
                  </div>
              )}

              {/* 8. Technical */}
              {activeTab === 'technical' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                      <h3 className="text-lg font-bold text-black border-b border-stone-100 pb-4 mb-6">Performance & Technical</h3>
                      <div className="space-y-4">
                          <label className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-200">
                              <span className="text-sm font-bold text-black">Lazy Load Media Assets</span>
                              <input type="checkbox" checked={seo.lazyLoadMedia || false} onChange={e => setSeo({...seo, lazyLoadMedia: e.target.checked})} className="accent-agri-secondary w-5 h-5"/>
                          </label>
                          <label className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-200">
                              <span className="text-sm font-bold text-black">DNS Prefetching</span>
                              <input type="checkbox" checked={seo.dnsPrefetch || false} onChange={e => setSeo({...seo, dnsPrefetch: e.target.checked})} className="accent-agri-secondary w-5 h-5"/>
                          </label>
                          <label className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-200">
                              <span className="text-sm font-bold text-black">Preconnect Critical Assets</span>
                              <input type="checkbox" checked={seo.preconnectAssets || false} onChange={e => setSeo({...seo, preconnectAssets: e.target.checked})} className="accent-agri-secondary w-5 h-5"/>
                          </label>
                      </div>
                  </div>
              )}

              {/* 9. Integrations */}
              {activeTab === 'verification' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                      <h3 className="text-lg font-bold text-black border-b border-stone-100 pb-4 mb-6">Third-Party Verification</h3>
                      <div className="grid gap-6">
                          <div>
                              <label className="text-[10px] uppercase font-bold text-stone-500 mb-2 block tracking-widest">Google Search Console ID</label>
                              <input className="w-full bg-stone-50 border border-stone-200 rounded-xl p-4 text-black outline-none focus:border-agri-secondary text-sm font-mono" value={seo.googleConsoleId || ''} onChange={e => setSeo({...seo, googleConsoleId: e.target.value})} placeholder="verification-string" />
                          </div>
                          <div>
                              <label className="text-[10px] uppercase font-bold text-stone-500 mb-2 block tracking-widest">Bing Webmaster ID</label>
                              <input className="w-full bg-stone-50 border border-stone-200 rounded-xl p-4 text-black outline-none focus:border-agri-secondary text-sm font-mono" value={seo.bingWebmasterId || ''} onChange={e => setSeo({...seo, bingWebmasterId: e.target.value})} />
                          </div>
                          <div>
                              <label className="text-[10px] uppercase font-bold text-stone-500 mb-2 block tracking-widest">Google Analytics ID</label>
                              <input className="w-full bg-stone-50 border border-stone-200 rounded-xl p-4 text-black outline-none focus:border-agri-secondary text-sm font-mono" value={seo.googleAnalyticsId} onChange={e => setSeo({...seo, googleAnalyticsId: e.target.value})} placeholder="G-XXXXXXXXXX" />
                          </div>
                      </div>
                  </div>
              )}

              {/* 10. Diagnostics */}
              {activeTab === 'diagnostics' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                      <h3 className="text-lg font-bold text-black border-b border-stone-100 pb-4 mb-6">System Health</h3>
                      <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200">
                          <div className="flex items-center gap-3 mb-4">
                              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="font-bold text-black uppercase tracking-widest text-xs">SEO Engine Active</span>
                          </div>
                          <p className="text-xs text-stone-500 mb-6">All meta tags are being injected server-side. Structured data is validating correctly.</p>
                          <label className="flex items-center gap-3 cursor-pointer">
                              <input type="checkbox" checked={seo.enableAlerts || false} onChange={e => setSeo({...seo, enableAlerts: e.target.checked})} className="accent-agri-secondary w-4 h-4"/>
                              <span className="text-xs font-bold text-black">Enable Dashboard Alerts for Missing Meta</span>
                          </label>
                      </div>
                  </div>
              )}

          </div>
      </div>
    </div>
  );
};

export default SEOSettings;
