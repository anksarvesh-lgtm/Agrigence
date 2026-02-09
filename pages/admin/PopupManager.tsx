
import React, { useState, useEffect } from 'react';
import { mockBackend } from '../../services/mockBackend';
import { SiteSettings, PopupSettings } from '../../types';
import { Save, Megaphone, Image as ImageIcon, Link as LinkIcon, Power, Eye } from 'lucide-react';

const PopupManager: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [popup, setPopup] = useState<PopupSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && popup) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPopup({ ...popup, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  if (!popup) return null;

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex justify-between items-center bg-agri-secondary/10 p-6 rounded-2xl border border-agri-secondary/20">
        <div>
          <h1 className="text-2xl font-bold text-white">Announcement Popup</h1>
          <p className="text-white/40 text-xs mt-1 uppercase tracking-widest font-bold">Manage system-wide alerts</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className="bg-agri-secondary text-agri-primary px-10 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform active:scale-95 disabled:opacity-50"
        >
           <Save size={18} /> {isSaving ? 'SYNCING...' : 'SAVE POPUP'}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-8">
           <div className="flex items-center justify-between p-6 bg-black/20 rounded-2xl border border-white/5">
              <div className="flex items-center gap-4">
                 <div className={`p-3 rounded-xl ${popup.isEnabled ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    <Power size={20} />
                 </div>
                 <div>
                    <p className="text-xs font-bold text-white uppercase tracking-widest">Popup Status</p>
                    <p className={`text-sm font-black ${popup.isEnabled ? 'text-green-400' : 'text-red-400'}`}>{popup.isEnabled ? 'LIVE' : 'DISABLED'}</p>
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
              <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block tracking-widest">Popup Title</label>
              <input 
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-agri-secondary" 
                value={popup.title} 
                onChange={e => setPopup({...popup, title: e.target.value})}
              />
           </div>

           <div>
              <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block tracking-widest">Announcement Text</label>
              <textarea 
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-agri-secondary h-32 leading-relaxed" 
                value={popup.description} 
                onChange={e => setPopup({...popup, description: e.target.value})}
              />
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div>
                 <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block tracking-widest">Button Text</label>
                 <input className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-agri-secondary text-xs" value={popup.buttonText} onChange={e => setPopup({...popup, buttonText: e.target.value})} />
              </div>
              <div>
                 <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block tracking-widest">Redirect Path</label>
                 <div className="relative">
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                    <input className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-4 text-white outline-none focus:border-agri-secondary text-xs" value={popup.buttonLink} onChange={e => setPopup({...popup, buttonLink: e.target.value})} />
                 </div>
              </div>
           </div>
        </div>

        {/* Preview & Image */}
        <div className="space-y-8">
            <div className="bg-white/5 border border-white/5 rounded-3xl p-8">
               <h3 className="text-xs font-bold text-agri-secondary uppercase tracking-widest mb-6 flex items-center gap-2">
                  <ImageIcon size={16} /> Cover Image
               </h3>
               <div className="aspect-video rounded-2xl bg-black/40 border border-white/10 overflow-hidden mb-6 relative group">
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
               />
               <label 
                htmlFor="popup-img"
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-4 flex items-center justify-center gap-3 text-xs font-bold transition-all cursor-pointer"
               >
                  SELECT NEW IMAGE
               </label>
            </div>

            <div className="bg-agri-secondary/5 border border-agri-secondary/10 rounded-3xl p-8">
               <h3 className="text-xs font-bold text-agri-secondary uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Eye size={16} /> Live Preview
               </h3>
               <div className="border border-white/5 rounded-2xl overflow-hidden shadow-2xl scale-90 origin-top">
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
