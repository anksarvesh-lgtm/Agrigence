
import React, { useState, useEffect } from 'react';
import { mockBackend } from '../../services/mockBackend';
import { Notification, Role } from '../../types';
import { Megaphone, Send, Bell, Calendar, User, CheckCircle, Trash2, X } from 'lucide-react';

const NotificationManager: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newNote, setNewNote] = useState<Partial<Notification>>({
    title: '',
    message: '',
    type: 'DASHBOARD',
    targetRole: 'ALL'
  });

  useEffect(() => {
    setNotifications(mockBackend.getNotifications());
  }, []);

  const handleBroadcast = async () => {
    if (!newNote.title || !newNote.message) return alert("Title and Message required");
    await mockBackend.addNotification(newNote);
    setNotifications(mockBackend.getNotifications());
    setIsModalOpen(false);
    setNewNote({ title: '', message: '', type: 'DASHBOARD', targetRole: 'ALL' });
    alert("Broadcasting successful!");
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Notification Broadcast</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-agri-secondary text-agri-primary px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-xl text-xs uppercase tracking-widest">
           <Megaphone size={18} /> INITIALIZE BROADCAST
        </button>
      </div>

      <div className="space-y-4">
        {notifications.map(note => (
          <div key={note.id} className="bg-white/5 border border-white/5 rounded-[2rem] p-8 hover:bg-white/10 transition-all flex items-start gap-6">
             <div className="w-14 h-14 bg-agri-secondary/10 rounded-2xl flex items-center justify-center text-agri-secondary shrink-0">
                <Bell size={28} />
             </div>
             <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                   <span className="bg-agri-secondary text-agri-primary px-2 py-0.5 rounded text-[8px] font-black uppercase">{note.targetRole}</span>
                   <span className="text-white/20 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1"><Calendar size={12}/> {new Date(note.date).toLocaleString()}</span>
                </div>
                <h3 className="text-white font-bold text-xl mb-1">{note.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{note.message}</p>
             </div>
             <button className="text-white/10 hover:text-red-400 transition-colors p-2"><Trash2 size={20}/></button>
          </div>
        ))}
        {notifications.length === 0 && <div className="text-center py-20 text-white/10 italic">No historical broadcasts.</div>}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
           <div className="bg-[#1C2A22] w-full max-w-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-white/5 flex justify-between items-center bg-black/20">
                 <h3 className="text-2xl font-serif font-bold text-white">Global Dispatch</h3>
                 <button onClick={() => setIsModalOpen(false)}><X size={20} className="text-white/40 hover:text-white" /></button>
              </div>
              <div className="p-8 space-y-6">
                 <div>
                    <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block tracking-widest">Target Audience</label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-agri-secondary" value={newNote.targetRole} onChange={e => setNewNote({...newNote, targetRole: e.target.value as any})}>
                       <option value="ALL" className="bg-agri-primary">Broadcast to All Users</option>
                       <option value="USER" className="bg-agri-primary">Subscribers Only</option>
                       <option value="EDITOR" className="bg-agri-primary">Editors only</option>
                       <option value="ADMIN" className="bg-agri-primary">Internal Admin Team</option>
                    </select>
                 </div>
                 <div>
                    <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block tracking-widest">Headline</label>
                    <input className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-agri-secondary" placeholder="System Maintenance / New Issue Alert" value={newNote.title} onChange={e => setNewNote({...newNote, title: e.target.value})} />
                 </div>
                 <div>
                    <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block tracking-widest">Message Details</label>
                    <textarea className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-agri-secondary h-32 leading-relaxed" placeholder="Detailed announcement copy..." value={newNote.message} onChange={e => setNewNote({...newNote, message: e.target.value})} />
                 </div>
              </div>
              <div className="p-8 border-t border-white/5 flex justify-end gap-4 bg-black/10">
                 <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-white/40 hover:text-white font-bold text-xs uppercase tracking-widest">Abort</button>
                 <button onClick={handleBroadcast} className="bg-agri-secondary text-agri-primary px-10 py-3 rounded-xl font-bold flex items-center gap-2 shadow-xl">
                    <Send size={18} /> INITIATE_PUSH
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default NotificationManager;
