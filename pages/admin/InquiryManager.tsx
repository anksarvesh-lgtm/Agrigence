
import React, { useState, useEffect } from 'react';
import { mockBackend } from '../../services/mockBackend';
import { Inquiry } from '../../types';
import { MessageSquare, CheckCircle, Clock, Trash2, Mail, User, Reply } from 'lucide-react';

const InquiryManager: React.FC = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);

  useEffect(() => {
    const load = async () => {
        setInquiries(await mockBackend.getInquiries());
    };
    load();
  }, []);

  const handleResolve = async (id: string) => {
    await mockBackend.resolveInquiry(id);
    setInquiries(await mockBackend.getInquiries());
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Contact Inquiries</h1>
        <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/5">
           <span className="text-agri-secondary font-black text-xs uppercase tracking-widest">{inquiries.filter(i => i.status === 'PENDING').length} PENDING_MSGS</span>
        </div>
      </div>

      <div className="grid gap-6">
        {inquiries.map(inquiry => (
          <div key={inquiry.id} className={`bg-white/5 border border-white/5 rounded-[2rem] p-8 transition-all hover:bg-white/10 ${inquiry.status === 'RESOLVED' ? 'opacity-60' : ''}`}>
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-agri-secondary/10 rounded-2xl flex items-center justify-center text-agri-secondary">
                    <User size={24} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">{inquiry.name}</h3>
                    <p className="text-[10px] text-white/30 uppercase font-black tracking-widest flex items-center gap-2">
                       <Mail size={12} /> {inquiry.email}
                    </p>
                  </div>
                </div>
                <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
                  <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">{inquiry.message}</p>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-black uppercase text-white/20 tracking-widest">
                  <Clock size={12} /> {new Date(inquiry.date).toLocaleString()}
                </div>
              </div>

              <div className="flex md:flex-col gap-3 shrink-0">
                {inquiry.status === 'PENDING' ? (
                  <button 
                    onClick={() => handleResolve(inquiry.id)}
                    className="flex-1 md:flex-none bg-green-500/20 text-green-400 border border-green-500/20 px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={14} /> Resolve
                  </button>
                ) : (
                  <div className="flex-1 md:flex-none bg-white/5 text-white/40 border border-white/5 px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                    <CheckCircle size={14} /> Resolved
                  </div>
                )}
                <a 
                  href={`mailto:${inquiry.email}`}
                  className="flex-1 md:flex-none bg-agri-secondary/10 text-agri-secondary border border-agri-secondary/20 px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-agri-secondary hover:text-agri-primary transition-all flex items-center justify-center gap-2"
                >
                  <Reply size={14} /> Reply
                </a>
              </div>
            </div>
          </div>
        ))}
        {inquiries.length === 0 && <div className="text-center py-20 text-white/10 italic">No inquiries received yet.</div>}
      </div>
    </div>
  );
};

export default InquiryManager;
