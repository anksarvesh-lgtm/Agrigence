
import React, { useState, useEffect } from 'react';
import { mockBackend } from '../../services/mockBackend';
import { EmailTemplate } from '../../types';
import { Mail, Save, X, Hash, ChevronRight, Edit } from 'lucide-react';

const TemplateManager: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);

  useEffect(() => {
    setTemplates(mockBackend.getTemplates());
  }, []);

  const handleSave = async () => {
    if (!selectedTemplate) return;
    await mockBackend.updateTemplate(selectedTemplate);
    setTemplates(mockBackend.getTemplates());
    setSelectedTemplate(null);
    alert('Email template synced successfully!');
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Communications Engine</h1>
      </div>

      {!selectedTemplate ? (
        <div className="grid md:grid-cols-2 gap-6">
           {templates.map(tpl => (
             <div key={tpl.id} className="bg-white/5 border border-white/5 rounded-[2rem] p-8 hover:bg-white/10 transition-all group cursor-pointer" onClick={() => setSelectedTemplate(tpl)}>
                <div className="flex items-center justify-between mb-6">
                   <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400">
                      <Mail size={24} />
                   </div>
                   <span className="text-[10px] font-black uppercase text-white/20 tracking-tighter">ID: {tpl.id}</span>
                </div>
                <h3 className="text-white font-bold text-xl mb-1">{tpl.name}</h3>
                <p className="text-xs text-white/40 line-clamp-1 italic mb-8">"{tpl.subject}"</p>
                <button className="flex items-center gap-2 text-[10px] font-black uppercase text-agri-secondary opacity-0 group-hover:opacity-100 transition-opacity">
                   REFINE TEMPLATE <ChevronRight size={14}/>
                </button>
             </div>
           ))}
        </div>
      ) : (
        <div className="bg-white/5 border border-white/5 rounded-[3rem] overflow-hidden">
           <div className="p-8 border-b border-white/5 flex justify-between items-center bg-black/20">
              <div className="flex items-center gap-4">
                 <button onClick={() => setSelectedTemplate(null)} className="p-2 text-white/40 hover:text-white"><ChevronRight size={20} className="rotate-180" /></button>
                 <h2 className="text-white font-bold">Mail Protocol: {selectedTemplate.name}</h2>
              </div>
              <button 
                onClick={handleSave}
                className="bg-agri-secondary text-agri-primary px-8 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-agri-secondary/10"
              >
                 SAVE PROTOCOL
              </button>
           </div>
           
           <div className="p-10 space-y-8">
              <div>
                 <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block tracking-widest">E-Mail Subject Line</label>
                 <input className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-agri-secondary font-bold" value={selectedTemplate.subject} onChange={e => setSelectedTemplate({...selectedTemplate, subject: e.target.value})} />
              </div>
              <div>
                 <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block tracking-widest">Message Body (Rich Text Architecture)</label>
                 <textarea 
                   className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-white text-sm outline-none focus:border-agri-secondary h-80 leading-relaxed font-mono" 
                   value={selectedTemplate.body} 
                   onChange={e => setSelectedTemplate({...selectedTemplate, body: e.target.value})}
                 />
              </div>
              <div className="bg-agri-secondary/5 border border-agri-secondary/10 p-6 rounded-2xl">
                 <h4 className="text-[10px] font-black uppercase text-agri-secondary mb-3 flex items-center gap-2"><Hash size={12}/> Variable Injection Nodes</h4>
                 <p className="text-[10px] text-white/40 tracking-wider leading-relaxed">Available shortcodes: <span className="text-white/60">{`{name}, {email}, {title}, {date}, {plan_name}, {expiry}`}</span>. These will be automatically replaced during the SMTP broadcast.</p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default TemplateManager;
