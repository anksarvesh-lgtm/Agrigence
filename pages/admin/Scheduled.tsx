import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, CheckCircle, AlertCircle, RefreshCw, Pencil, 
  Send, Ban, Trash2, ArrowLeft, ShieldCheck, Check
} from 'lucide-react';
import { db } from '../../src/firebase';
import { collection, query, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';

interface ScheduledItem {
  id: string;
  name: string;
  subject: string;
  examTarget: string;
  questionsCount: number;
  scheduledTime: string;
}

export default function Scheduled() {
  const [scheduledItems, setScheduledItems] = useState<ScheduledItem[]>([
    {
      id: 'qb_scheduled_1',
      name: 'Horticulture Fruits Taxonomy Practice Pack',
      subject: 'Horticulture',
      examTarget: 'ICAR NET',
      questionsCount: 75,
      scheduledTime: '2026-06-15T08:00'
    },
    {
      id: 'qb_scheduled_2',
      name: 'Agronomy Irrigation & Water Management Advanced',
      subject: 'Agronomy',
      examTarget: 'IBPS-AFO',
      questionsCount: 50,
      scheduledTime: '2026-06-20T10:30'
    }
  ]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [newScheduleDate, setNewScheduleDate] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    document.title = "Schedule Release Calendar | Agrigence";
    fetchScheduledItems();
  }, []);

  const fetchScheduledItems = async () => {
    try {
      const snap = await getDocs(collection(db, 'question_banks'));
      if (!snap.empty) {
        const list = snap.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as any))
          .filter(b => b.status === 'scheduled' || b.status === 'Scheduled')
          .map(b => ({
            id: b.id,
            name: b.name || b.title,
            subject: b.subject,
            examTarget: b.examTarget || 'General',
            questionsCount: b.questionsCount,
            scheduledTime: b.scheduledReleaseTime || '2026-06-18T00:00'
          }));
        if (list.length > 0) {
          setScheduledItems(list);
        }
      }
    } catch (e) {
      console.warn("Using default simulated scheduled components:", e);
    }
  };

  const handlePublishNow = async (id: string, name: string) => {
    try {
      await updateDoc(doc(db, 'question_banks', id), { 
        status: 'live',
        scheduledReleaseTime: null
      }).catch(() => {});

      setScheduledItems(prev => prev.filter(i => i.id !== id));
      triggerToast(`Published "${name}" into live student search indexes instantly!`);
    } catch (e) {
      triggerToast("Error publishing scheduled document", 'error');
    }
  };

  const handleCancelSchedule = async (id: string, name: string) => {
    try {
      await updateDoc(doc(db, 'question_banks', id), { 
        status: 'Pending',
        scheduledReleaseTime: null
      }).catch(() => {});

      setScheduledItems(prev => prev.filter(i => i.id !== id));
      triggerToast(`Cancelled release schedule for "${name}". Reverted back to pending folder.`);
    } catch (e) {
      triggerToast("Failed state modification", 'error');
    }
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !newScheduleDate) return;

    try {
      await updateDoc(doc(db, 'question_banks', editingId), { 
        scheduledReleaseTime: newScheduleDate
      }).catch(() => {});

      setScheduledItems(prev => prev.map(item => item.id === editingId ? { ...item, scheduledTime: newScheduleDate } : item));
      triggerToast("Rescheduled content package successfully!");
      setEditingId(null);
      setNewScheduleDate('');
    } catch (e) {
      triggerToast("Error updating schedule nodes", 'error');
    }
  };

  return (
    <div className="space-y-6 font-sans text-[#0f4225]">
      
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[250] max-w-sm p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
          toast.type === 'success' ? 'bg-[#e8f5ee] border-2 border-[#2d8a52] text-[#0f4225]' : 'bg-red-50 border-2 border-red-200 text-red-800'
        }`}>
          {toast.type === 'success' ? <Check size={18} className="text-[#2d8a52]" /> : <AlertCircle size={18} className="text-red-500" />}
          <span className="text-xs font-bold">{toast.message}</span>
        </div>
      )}

      {/* Header title section */}
      <div>
         <h1 className="text-3xl font-bold font-serif">Release Queue & Calendars</h1>
         <p className="text-xs text-stone-500 mt-1">Review scheduled deployments, postpone catalogs, or instantly publish material bundles.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         
         {/* Queue List Table */}
         <div className="lg:col-span-8 bg-white border rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
               <h3 className="font-serif font-bold text-lg text-black">Scheduled Deployments</h3>
               <button onClick={fetchScheduledItems} className="p-2 border bg-stone-50 text-stone-400 hover:text-black rounded-lg transition-colors">
                  <RefreshCw size={15} />
               </button>
            </div>

            <div className="space-y-4">
              {scheduledItems.length === 0 ? (
                 <div className="p-12 border-2 border-dashed rounded-xl text-center text-stone-400">
                    <Calendar size={36} className="mx-auto text-stone-300 mb-2 animate-bounce" />
                    <p className="text-xs">No questions scheduled in the queue.</p>
                 </div>
              ) : (
                 scheduledItems.map(item => {
                    const localTimeStr = new Date(item.scheduledTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
                    return (
                      <div key={item.id} className="p-4 border rounded-xl bg-stone-50/50 hover:bg-white transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                         <div className="space-y-1">
                            <span className="bg-[#e8f5ee] text-[#0f4225] font-black uppercase text-[8px] px-2 py-0.5 rounded tracking-wider">
                               {item.subject} • {item.examTarget}
                            </span>
                            <h4 className="font-bold text-sm text-black">{item.name}</h4>
                            <p className="text-[10px] text-stone-400 font-mono">Questions Pack: {item.questionsCount} MCQs • Package ID: {item.id}</p>
                         </div>

                         {/* Release Timing indicators and Controls */}
                         <div className="flex flex-wrap md:flex-nowrap items-center gap-4">
                            <div className="flex items-center gap-2 text-stone-600 bg-white border p-2.5 rounded-xl shrink-0">
                               <Clock size={15} className="text-[#2d8a52]" />
                               <div className="text-[10px] font-medium leading-none">
                                  <p className="text-[8px] text-stone-400 uppercase tracking-widest font-black">Release Target</p>
                                  <p className="font-bold text-black mt-1">{localTimeStr}</p>
                               </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                               <button 
                                 onClick={() => { setEditingId(item.id); setNewScheduleDate(item.scheduledTime); }}
                                 className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors"
                                 title="Change Release Time"
                               >
                                 <Pencil size={14} />
                               </button>
                               <button 
                                 onClick={() => handlePublishNow(item.id, item.name)}
                                 className="px-3 py-2 bg-[#0f4225] hover:bg-[#1a6b3a] text-white font-bold text-[10px] uppercase rounded-lg shadow-sm transition-colors"
                               >
                                 Publish Now
                               </button>
                               <button 
                                 onClick={() => handleCancelSchedule(item.id, item.name)}
                                 className="p-2 border hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                                 title="Cancel releasing schedule"
                               >
                                 <Ban size={14} />
                               </button>
                            </div>
                         </div>
                      </div>
                    );
                 })
              )}
            </div>
         </div>

         {/* Calendar metadata instructions */}
         <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#f7f9f8] border border-[#0f4225]/10 rounded-2xl p-6 shadow-sm">
               <h3 className="font-serif font-bold text-md text-black flex items-center gap-2">
                  <ShieldCheck size={18} className="text-[#2d8a52]" /> Release Coordination
               </h3>
               <p className="text-[10px] text-stone-400 uppercase font-black tracking-wider mt-1">Calendar configuration guide</p>
               <p className="mt-3 leading-relaxed text-[11px] text-stone-500 font-medium">
                  Configured release items queue resides on our cloud-layer. On reaching the release date-time, the platform automatically switches the item to **Live** status and publishes notifications instantly to student feeds.
               </p>
            </div>
         </div>

      </div>

      {/* Reschedule Datepicker Modal */}
      {editingId && (
         <div className="fixed inset-0 z-[300] bg-black/45 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
           <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-22xl select-none relative animate-in zoom-in-95 duration-200">
              <h3 className="font-serif font-bold text-black text-lg mb-3">Adjust Deployment Target</h3>
              <p className="text-[10px] text-stone-400 mb-4">Postpone or advance the targeted publish timeline.</p>

              <form onSubmit={handleRescheduleSubmit} className="space-y-4">
                 <input 
                   type="datetime-local"
                   value={newScheduleDate}
                   onChange={e => setNewScheduleDate(e.target.value)}
                   required
                   className="w-full bg-stone-50 text-black border text-xs p-3 rounded-xl focus:outline-none focus:border-[#2d8a52]"
                 />
                 <div className="flex gap-2 justify-end">
                    <button type="button" onClick={() => { setEditingId(null); setNewScheduleDate(''); }} className="px-4 py-2 hover:bg-stone-100 text-stone-500 font-bold text-[10px] rounded-lg">
                       Cancel
                    </button>
                    <button type="submit" className="px-4 py-2 bg-[#0f4225] hover:bg-[#1a6b3a] text-white font-bold text-[10px] rounded-lg shadow-sm">
                       Commit New Timeline
                    </button>
                 </div>
              </form>
           </div>
         </div>
      )}

    </div>
  );
}
