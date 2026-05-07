
import React, { useState, useEffect } from 'react';
import { mockBackend } from '../../services/mockBackend';
import { SiteSettings, PopupSettings } from '../../types';
import { Save, Megaphone, Image as ImageIcon, Link as LinkIcon, Power, Eye, Loader2 } from 'lucide-react';

const PopupManager: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [popup, setPopup] = useState<PopupSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const s = mockBackend.getSettings();
    setSettings(s);
    setPopup(s.popup);
  }, []);

  const handleSave = async () => {
    if (!settings || !popup) return;
    setIsSaving(true);
    await mockBackend.updateSettings({ ...settings, popup });
    setTimeout(() => {
        setIsSaving(false);
        alert('Popup settings updated successfully!');
    }, 800);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && popup) {
      setIsUploading(true);
      try {
        const url = await mockBackend.uploadToBlob(file, 'popup');
        setPopup({ ...popup, imageUrl: url });
      } finally {
        setIsUploading(false);
      }
    }
  };

  if (!popup) return null;

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl border border-stone-200 shadow-sm gap-4">
        <div>
          <h1 className="text-2xl font-bold text-black">Announcement Popup</h1>
          <p className="text-stone-500 text-xs mt-1 uppercase tracking-widest font-bold">Manage system-wide alerts</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className="bg-agri-secondary text-white px-10 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform active:scale-95 disabled:opacity-50 w-full md:w-auto justify-center"
        >
           <Save size={18} /> {isSaving ? 'SYNCING...' : 'SAVE POPUP'}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="bg-white border border-stone-200 rounded-3xl p-8 space-y-8 shadow-sm">
           <div className="flex items-center justify-between p-6 bg-stone-50 rounded-2xl border border-stone-200">
              <div className="flex items-center gap-4">
                 <div className={`p-3 rounded-xl ${popup.isEnabled ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    <Power size={20} />
                 </div>
                 <div>
                    <p className="text-xs font-bold text-stone-500 uppercase tracking-widest">Popup Status</p>
                    <p className={`text-sm font-black ${popup.isEnabled ? 'text-green-600' : 'text-red-600'}`}>{popup.isEnabled ? 'LIVE' : 'DISABLED'}</p>
                 </div>
              </div>
              <button 
                onClick={() => setPopup({...popup, isEnabled: !popup.isEnabled})}
                className={`px-6 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all ${popup.isEnabled ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
              >
                {popup.isEnabled ? 'TURN OFF' : 'TURN ON'}
              </button>
           </div>

           <div>
              <label className="text-[10px] uppercase font-bold text-stone-500 mb-2 block tracking-widest">Popup Title</label>
              <input 
                className="w-full bg-white border border-stone-300 rounded-xl p-4 text-black outline-none focus:border-agri-secondary focus:ring-1 focus:ring-agri-secondary" 
                value={popup.title} 
                onChange={e => setPopup({...popup, title: e.target.value})}
              />
           </div>

           <div>
              <label className="text-[10px] uppercase font-bold text-stone-500 mb-2 block tracking-widest">Announcement Text</label>
              <textarea 
                className="w-full bg-white border border-stone-300 rounded-xl p-4 text-black outline-none focus:border-agri-secondary focus:ring-1 focus:ring-agri-secondary h-32 leading-relaxed" 
                value={popup.description} 
                onChange={e => setPopup({...popup, description: e.target.value})}
              />
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div>
                 <label className="text-[10px] uppercase font-bold text-stone-500 mb-2 block tracking-widest">Button Text</label>
                 <input className="w-full bg-white border border-stone-300 rounded-xl p-4 text-black outline-none focus:border-agri-secondary focus:ring-1 focus:ring-agri-secondary text-xs" value={popup.buttonText} onChange={e => setPopup({...popup, buttonText: e.target.value})} />
              </div>
              <div>
                 <label className="text-[10px] uppercase font-bold text-stone-500 mb-2 block tracking-widest">Redirect Path</label>
                 <div className="relative">
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={14} />
                    <input className="w-full bg-white border border-stone-300 rounded-xl pl-10 pr-4 py-4 text-black outline-none focus:border-agri-secondary focus:ring-1 focus:ring-agri-secondary text-xs" value={popup.buttonLink} onChange={e => setPopup({...popup, buttonLink: e.target.value})} />
                 </div>
              </div>
           </div>
        </div>

        {/* Preview & Image */}
        <div className="space-y-8">
            <div className="bg-white border border-stone-200 rounded-3xl p-8 shadow-sm">
               <h3 className="text-xs font-bold text-agri-secondary uppercase tracking-widest mb-6 flex items-center gap-2">
                  <ImageIcon size={16} /> Cover Image
               </h3>
               <div className="aspect-video rounded-2xl bg-stone-100 border border-stone-200 overflow-hidden mb-6 relative group">
                  {isUploading && (
                     <div className="absolute inset-0 z-20 bg-white/80 flex items-center justify-center text-agri-secondary">
                        <Loader2 size={32} className="animate-spin" />
                     </div>
                  )}
                  <img src={popup.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                     <p className="text-[10px] font-bold text-white uppercase tracking-widest">Replace Photo</p>
                  </div>
               </div>
               <input 
                 type="file" 
                 id="popup-img" 
                 className="hidden" 
                 onChange={handleImageUpload} 
                 disabled={isUploading}
               />
               <label 
                htmlFor="popup-img"
                className={`w-full bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl py-4 flex items-center justify-center gap-3 text-xs font-bold transition-all cursor-pointer text-stone-600 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
               >
                  {isUploading ? 'UPLOADING...' : 'SELECT NEW IMAGE'}
               </label>
            </div>

            <div className="bg-stone-50 border border-stone-200 rounded-3xl p-8">
               <h3 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Eye size={16} /> Live Preview
               </h3>
               <div className="border border-stone-200 rounded-2xl overflow-hidden shadow-2xl scale-90 origin-top bg-white">
                  <div className="h-24 bg-cover bg-center" style={{backgroundImage: `url(${popup.imageUrl})`}}></div>
                  <div className="p-6 bg-white text-black text-center">
                     <p className="font-bold text-sm mb-1">{popup.title}</p>
                     <p className="text-[8px] text-gray-500 mb-4">{popup.description.slice(0, 60)}...</p>
                     <div className="bg-agri-primary text-white text-[8px] font-bold py-2 px-4 rounded-lg inline-block">
                        {popup.buttonText}
                     </div>
                  </div>
               </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PopupManager;
