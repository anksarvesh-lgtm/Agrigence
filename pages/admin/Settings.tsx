
import React, { useState, useEffect } from 'react';
import { mockBackend } from '../../services/mockBackend';
import { SiteSettings } from '../../types';
import { 
  Save, Twitter, Instagram, Facebook, Linkedin, Youtube, 
  Smartphone, Mail, Globe, Hash, Upload, ShieldAlert, Palette, Type, Layout, Share2
} from 'lucide-react';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    setSettings(mockBackend.getSettings());
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    await mockBackend.updateSettings(settings);
    
    if (newPassword) {
      alert('Master admin security credentials have been updated.');
    }

    setTimeout(() => {
        setIsSaving(false);
        alert('Site configurations synced successfully!');
        setNewPassword('');
    }, 1000);
  };

  const handleFileUpload = (field: keyof SiteSettings) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (settings) {
          setSettings({ ...settings, [field]: reader.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (!settings) return null;

  return (
    <div className="space-y-8 max-w-5xl pb-20">
      <div className="flex justify-between items-center bg-agri-secondary/10 p-6 rounded-2xl border border-agri-secondary/20 backdrop-blur-md sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-bold text-white">Global Controls</h1>
          <p className="text-white/40 text-xs mt-1 uppercase tracking-widest font-bold">System-wide configurations</p>
        </div>
        <button onClick={handleSave} disabled={isSaving} className="bg-agri-secondary text-agri-primary px-10 py-3 rounded-xl font-bold flex items-center gap-2 shadow-xl shadow-agri-secondary/10 hover:scale-105 transition-transform active:scale-95 disabled:opacity-50">
           <Save size={18} /> {isSaving ? 'UPDATING...' : 'APPLY ALL SETTINGS'}
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* Branding & Visuals */}
        <div className="space-y-8">
            <div className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-agri-secondary flex items-center gap-2 mb-4">
                  <Palette size={16} /> Visual Identity
              </h3>
              
              <div>
                  <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block tracking-widest">Site Logo</label>
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-2xl bg-black/40 flex items-center justify-center border border-white/10 p-2 overflow-hidden shrink-0">
                        <img src={settings.logoUrl} className="max-h-full object-contain" alt="Logo" />
                    </div>
                    <div className="flex-1">
                      <input type="file" id="logo-up" className="hidden" onChange={handleFileUpload('logoUrl')} />
                      <label htmlFor="logo-up" className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 text-[10px] font-black cursor-pointer transition-all flex items-center justify-center gap-2">
                         <Upload size={14} /> REPLACE LOGO
                      </label>
                    </div>
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block tracking-widest">Primary Color</label>
                    <div className="flex gap-2">
                       <input type="color" className="w-12 h-12 rounded bg-transparent border-none" value={settings.primaryColor} onChange={e => setSettings({...settings, primaryColor: e.target.value})} />
                       <input className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs font-mono" value={settings.primaryColor} readOnly />
                    </div>
                 </div>
                 <div>
                    <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block tracking-widest">Secondary Color</label>
                    <div className="flex gap-2">
                       <input type="color" className="w-12 h-12 rounded bg-transparent border-none" value={settings.secondaryColor} onChange={e => setSettings({...settings, secondaryColor: e.target.value})} />
                       <input className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs font-mono" value={settings.secondaryColor} readOnly />
                    </div>
                 </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-agri-secondary flex items-center gap-2 mb-4">
                  <Type size={16} /> Mission & Copy
              </h3>
              <div>
                  <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block tracking-widest">Site Mission Text</label>
                  <textarea 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white text-sm outline-none focus:border-agri-secondary h-32 leading-relaxed resize-none" 
                    value={settings.missionText} 
                    onChange={e => setSettings({...settings, missionText: e.target.value})} 
                  />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block tracking-widest">Home Featured Limit</label>
                    <input type="number" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-agri-secondary" value={settings.homeFeaturedLimit} onChange={e => setSettings({...settings, homeFeaturedLimit: parseInt(e.target.value)})} />
                 </div>
                 <div>
                    <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block tracking-widest">ISSN Number</label>
                    <input className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-agri-secondary" value={settings.issn} onChange={e => setSettings({...settings, issn: e.target.value})} />
                 </div>
              </div>
            </div>
        </div>

        {/* Connections & Security */}
        <div className="space-y-8">
            <div className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-agri-secondary flex items-center gap-2 mb-4">
                  <Smartphone size={16} /> Payments & Support
              </h3>
              <div className="grid gap-6">
                 <div>
                    <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block">Merchant UPI ID</label>
                    <input className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-agri-secondary font-mono" value={settings.upiId} onChange={e => setSettings({...settings, upiId: e.target.value})} />
                 </div>
                 
                 <div>
                    <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block">Payment QR Code</label>
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 rounded-2xl bg-white p-2 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                            <img src={settings.upiQrUrl} className="w-full h-full object-contain" alt="QR Code" />
                        </div>
                        <div className="flex-1">
                            <input type="file" id="qr-up" className="hidden" onChange={handleFileUpload('upiQrUrl')} accept="image/*" />
                            <label htmlFor="qr-up" className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 text-[10px] font-black cursor-pointer transition-all flex items-center justify-center gap-2 text-white">
                                <Upload size={14} /> UPLOAD NEW QR
                            </label>
                            <p className="text-[9px] text-white/30 mt-2 font-bold uppercase tracking-wide">Upload custom QR to override dynamic generation</p>
                        </div>
                    </div>
                 </div>

                 <div>
                    <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block">WhatsApp Support</label>
                    <input className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-agri-secondary" value={settings.whatsappNumber} onChange={e => setSettings({...settings, whatsappNumber: e.target.value})} />
                 </div>
                 <div>
                    <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block">Support Email</label>
                    <input className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-agri-secondary" value={settings.contactEmail} onChange={e => setSettings({...settings, contactEmail: e.target.value})} />
                 </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-agri-secondary flex items-center gap-2 mb-4">
                  <Share2 size={16} /> Social Media Connections
              </h3>
              <div className="space-y-4">
                 <div className="flex items-center gap-3">
                    <Twitter size={16} className="text-white/40" />
                    <input className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs outline-none focus:border-agri-secondary" placeholder="Twitter URL" value={settings.footerSocials.twitter} onChange={e => setSettings({...settings, footerSocials: {...settings.footerSocials, twitter: e.target.value}})} />
                 </div>
                 <div className="flex items-center gap-3">
                    <Instagram size={16} className="text-white/40" />
                    <input className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs outline-none focus:border-agri-secondary" placeholder="Instagram URL" value={settings.footerSocials.instagram} onChange={e => setSettings({...settings, footerSocials: {...settings.footerSocials, instagram: e.target.value}})} />
                 </div>
                 <div className="flex items-center gap-3">
                    <Facebook size={16} className="text-white/40" />
                    <input className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs outline-none focus:border-agri-secondary" placeholder="Facebook URL" value={settings.footerSocials.facebook} onChange={e => setSettings({...settings, footerSocials: {...settings.footerSocials, facebook: e.target.value}})} />
                 </div>
                 <div className="flex items-center gap-3">
                    <Linkedin size={16} className="text-white/40" />
                    <input className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs outline-none focus:border-agri-secondary" placeholder="LinkedIn URL" value={settings.footerSocials.linkedin} onChange={e => setSettings({...settings, footerSocials: {...settings.footerSocials, linkedin: e.target.value}})} />
                 </div>
                 <div className="flex items-center gap-3">
                    <Youtube size={16} className="text-white/40" />
                    <input className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs outline-none focus:border-agri-secondary" placeholder="YouTube URL" value={settings.footerSocials.youtube} onChange={e => setSettings({...settings, footerSocials: {...settings.footerSocials, youtube: e.target.value}})} />
                 </div>
              </div>
            </div>

            <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-8 space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-red-400 flex items-center gap-2 mb-4">
                  <ShieldAlert size={16} /> Admin Security
              </h3>
              <div>
                  <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block tracking-widest">New Master Password</label>
                  <input 
                    type="password"
                    className="w-full bg-black/40 border border-red-500/20 rounded-xl p-4 text-white outline-none focus:border-red-500 font-mono text-sm" 
                    placeholder="Enter new password to update" 
                    value={newPassword} 
                    onChange={e => setNewPassword(e.target.value)} 
                  />
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
