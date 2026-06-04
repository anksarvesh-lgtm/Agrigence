
import React, { useState, useEffect } from 'react';
import { mockBackend } from '../../services/mockBackend';
import { HomepageSection, SiteSettings } from '../../types';
import { Save, ChevronUp, ChevronDown, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../src/authContext';

const LayoutManager: React.FC = () => {
  const { user } = useAuth();
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const s = mockBackend.getSettings();
    setSettings(s);
    setSections([...s.homepageLayout].sort((a,b) => a.order - b.order));
  }, []);

  const handleToggle = (id: string) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, isEnabled: !s.isEnabled } : s));
  };

  const handleFeatureToggle = (feature: keyof SiteSettings['featureVisibility']) => {
    if (!settings || !settings.featureVisibility) return;
    setSettings({
      ...settings,
      featureVisibility: {
        ...settings.featureVisibility,
        [feature]: !settings.featureVisibility[feature]
      }
    });
  };

  const updateCount = (id: string, count: number) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, itemsToShow: count } : s));
  };

  const move = (index: number, direction: 'up' | 'down') => {
    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSections.length) return;
    
    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
    
    // Update orders
    const final = newSections.map((s, i) => ({ ...s, order: i + 1 }));
    setSections(final);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const currentSettings = mockBackend.getSettings();
    await mockBackend.updateSettings({ ...currentSettings, homepageLayout: sections, featureVisibility: settings?.featureVisibility || currentSettings.featureVisibility });
    setTimeout(() => {
      setIsSaving(false);
      alert('Layout and visibility settings synced!');
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-black">Homepage Layout</h1>
          <p className="text-black text-xs mt-1 uppercase tracking-widest font-bold">Priority ordering & visibility</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className="bg-stone-200 text-black border border-stone-300 px-10 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-stone-300 transition-all active:scale-95 disabled:opacity-50 w-full md:w-auto"
        >
           <Save size={18} /> {isSaving ? 'SYNCING...' : 'SAVE LAYOUT'}
        </button>
      </div>
      
      {/* Super Admin Section Controls */}
      {user?.role === 'SUPER_ADMIN' && settings && (
        <div className="bg-stone-900 text-white p-8 rounded-[2rem] border border-stone-800 shadow-xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
            <ShieldCheck size={120} />
          </div>
          
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 rounded-xl bg-agri-secondary/20 flex items-center justify-center border border-agri-secondary/30">
              <ShieldCheck className="text-agri-secondary" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Terminal Controls (Super Admin Only)</h2>
              <p className="text-stone-400 text-xs">Global feature visibility and system-level overrides</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {settings.featureVisibility && Object.entries(settings.featureVisibility).map(([key, isVisible]) => (
              <button
                key={key}
                onClick={() => handleFeatureToggle(key as any)}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                  isVisible 
                    ? 'bg-stone-800/50 border-emerald-500/30 text-emerald-400' 
                    : 'bg-stone-900 border-red-500/30 text-red-400 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  {isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                  <span className="font-bold uppercase tracking-widest text-[10px]">
                    {key} Protocol
                  </span>
                </div>
                <div className={`w-8 h-4 rounded-full relative transition-colors ${isVisible ? 'bg-emerald-500' : 'bg-red-500'}`}>
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${isVisible ? 'right-0.5' : 'left-0.5'}`} />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {sections.map((section, idx) => (
          <div key={section.id} className={`bg-white border border-stone-200 p-6 rounded-3xl flex items-center justify-between group transition-all shadow-sm ${section.isEnabled ? 'opacity-100' : 'opacity-60 bg-stone-50'}`}>
             <div className="flex items-center gap-6">
                <div className="flex flex-col gap-2">
                   <button onClick={() => move(idx, 'up')} className="text-black hover:bg-stone-100 rounded p-1 transition-colors"><ChevronUp size={20}/></button>
                   <button onClick={() => move(idx, 'down')} className="text-black hover:bg-stone-100 rounded p-1 transition-colors"><ChevronDown size={20}/></button>
                </div>
                <div className="w-12 h-12 bg-stone-100 rounded-2xl flex items-center justify-center font-black text-black text-xl border border-stone-200">
                   {idx + 1}
                </div>
                <div>
                   <h3 className="text-black font-bold text-lg">{section.label}</h3>
                   <div className="flex items-center gap-4 mt-1">
                      <span className="text-[10px] text-black uppercase font-black tracking-widest">Section_ID: {section.id}</span>
                      <div className="flex items-center gap-2 bg-stone-100 px-2 py-1 rounded-lg border border-stone-200">
                         <span className="text-[9px] text-black font-black uppercase">Limit:</span>
                         <input 
                           type="number" 
                           className="bg-transparent text-black font-black text-xs w-8 outline-none border-none text-center" 
                           value={section.itemsToShow} 
                           onChange={e => updateCount(section.id, parseInt(e.target.value))}
                         />
                      </div>
                   </div>
                </div>
             </div>

             <button 
               onClick={() => handleToggle(section.id)}
               className={`px-8 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all border ${section.isEnabled ? 'bg-green-200 text-black border-green-300' : 'bg-red-200 text-black border-red-300'}`}
             >
                {section.isEnabled ? 'Protocol_ON' : 'Protocol_OFF'}
             </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LayoutManager;
