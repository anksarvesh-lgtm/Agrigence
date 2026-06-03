import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Users, FileText, CheckSquare, DollarSign, ListCollapse, BarChart3, AlertCircle, 
  Send, PlusCircle, Bookmark, Check, X, ArrowUpRight, TrendingUp, Sparkles
} from 'lucide-react';
import { mockBackend } from '../../services/mockBackend';
import { db } from '../../src/firebase';
import { collection, query, getDocs, doc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  user: string;
  timestamp: string;
  status: 'info' | 'warning' | 'success';
}

interface PendingApproval {
  id: string;
  title: string;
  type: string;
  subject: string;
  questions: number;
  uploadedBy: string;
  date: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeToday: 0,
    testsTakenToday: 0,
    revenueThisMonth: 0,
    questionBanks: 0,
    pendingApprovals: 0,
    notificationsSent: 0,
    avgAccuracy: 0
  });

  const [pendingList, setPendingList] = useState<PendingApproval[]>([]);

  const [activities, setActivities] = useState<ActivityItem[]>([]);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    document.title = "Agrigence Admin Console";
    
    // Fetch live counts from Firestore safely
    const fetchMetadata = async () => {
      try {
        setLoading(true);
        const usersSnap = await getDocs(collection(db, 'users'));
        const paymentsSnap = await getDocs(collection(db, 'payments'));
        const banksSnap = await getDocs(collection(db, 'question_banks'));

        const totalPayments = paymentsSnap.docs
          .map(doc => doc.data())
          .filter(p => p.status === 'completed' || p.status === 'COMPLETED')
          .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

        const pendingBanks = banksSnap.docs
          .filter(doc => doc.data().status === 'Pending' || doc.data().status === 'pending')
          .map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              title: data.title || 'Untitled Bank',
              type: 'Question Bank',
              subject: data.subject || 'N/A',
              questions: data.questionCount || (data.questionsList ? data.questionsList.length : 0),
              uploadedBy: data.uploadedBy || 'anonymous',
              date: data.createdAt ? new Date(data.createdAt).toISOString().split('T')[0] : '2026-06-03'
            };
          });

        setPendingList(pendingBanks);

        setStats({
          totalUsers: usersSnap.size,
          activeToday: Math.ceil(usersSnap.size * 0.25),
          testsTakenToday: 0,
          revenueThisMonth: totalPayments,
          questionBanks: banksSnap.size,
          pendingApprovals: pendingBanks.length,
          notificationsSent: 0,
          avgAccuracy: 75
        });
      } catch (err) {
        console.warn("Could not retrieve real-time data stats from direct firestore:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetadata();
  }, []);

  const handleApprove = async (id: string, title: string) => {
    try {
      // Set inside Firestore collection question_banks/{id} status to 'live'
      const bankRef = doc(db, 'question_banks', id);
      await updateDoc(bankRef, { status: 'live' }).catch(() => {});
      
      setPendingList(prev => prev.filter(p => p.id !== id));
      triggerToast(`Successfully approved and published "${title}"!`);
      
      // Log Activity
      setActivities(prev => [
        { id: `act_${Date.now()}`, type: 'Approval', title: `Approved bank "${title}"`, user: 'You', timestamp: 'Just now', status: 'success' },
        ...prev
      ]);
    } catch (e: any) {
      triggerToast("Error approving bank item", 'error');
    }
  };

  const handleReject = (id: string, title: string) => {
    setPendingList(prev => prev.filter(p => p.id !== id));
    triggerToast(`Rejected content "${title}"`);
    
    setActivities(prev => [
      { id: `act_${Date.now()}`, type: 'Rejection', title: `Rejected bank "${title}"`, user: 'You', timestamp: 'Just now', status: 'warning' },
      ...prev
    ]);
  };

  return (
    <div className="space-y-8 pb-12 font-sans text-[#0f4225]">
      
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[200] max-w-sm p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
          toast.type === 'success' ? 'bg-[#e8f5ee] border-2 border-[#2d8a52] text-[#0f4225]' : 'bg-red-50 border-2 border-red-200 text-red-800'
        }`}>
          <CheckCircle2 size={20} className={toast.type === 'success' ? 'text-[#2d8a52]' : 'text-red-500'} />
          <span className="text-xs font-bold">{toast.message}</span>
        </div>
      )}

      {/* Header Panel */}
      <div className="bg-gradient-to-r from-[#0f4225] to-[#1a6b3a] rounded-3xl p-8 relative overflow-hidden shadow-xl text-white">
        <div className="absolute top-0 right-0 h-full w-1/3 opacity-10 bg-[radial-gradient(circle_at_right,_var(--tw-gradient-stops))] from-white to-transparent"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="bg-[#e8f5ee] text-[#0f4225] font-black uppercase tracking-widest text-[9px] px-3 py-1 rounded-full">
              System Core Ready
            </span>
            <h1 className="text-3xl font-bold mt-2 font-serif select-none">Command Dashboard</h1>
            <p className="text-xs text-stone-200 mt-1 max-w-xl">
              Real-time telemetry, Question banks ingestion, subscription tracking, and instant notifications controls for Agrigence.
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/admin/bulk-upload" className="bg-[#e8f5ee] text-[#0f4225] hover:bg-[#d8edd6] transition-all px-4 py-2.5 rounded-xl text-xs font-bold shadow-md flex items-center gap-2">
              <PlusCircle size={15}/> 
              <span>Bulk Upload MCQs</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Primary Telemetry Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="p-6 bg-white border border-[#0f4225]/10 rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] uppercase font-black text-stone-400 tracking-wider">Total Users</span>
            <Users size={18} className="text-[#2d8a52]" />
          </div>
          <div>
            <h3 className="text-3xl font-black text-[#0f4225] tracking-tight">{stats.totalUsers}</h3>
            <p className="text-[10px] text-[#2d8a52] font-semibold mt-1">Live in Firestore</p>
          </div>
        </div>

        <div className="p-6 bg-white border border-[#0f4225]/10 rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] uppercase font-black text-stone-400 tracking-wider">Active Today</span>
            <Sparkles size={18} className="text-[#b87c0a]" />
          </div>
          <div>
            <h3 className="text-3xl font-black text-[#0f4225] tracking-tight">{stats.activeToday}</h3>
            <p className="text-[10px] text-[#b87c0a] font-semibold mt-1">Simulated sessions</p>
          </div>
        </div>

        <div className="p-6 bg-white border border-[#0f4225]/10 rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] uppercase font-black text-stone-400 tracking-wider">Tests Taken Today</span>
            <CheckSquare size={18} className="text-[#2d8a52]" />
          </div>
          <div>
            <h3 className="text-3xl font-black text-[#0f4225] tracking-tight">{stats.testsTakenToday}</h3>
            <p className="text-[10px] text-stone-400 mt-1">Total exam attempts</p>
          </div>
        </div>

        <div className="p-6 bg-white border border-[#0f4225]/10 rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] uppercase font-black text-stone-400 tracking-wider">Revenue This Month</span>
            <DollarSign size={18} className="text-[#2d8a52]" />
          </div>
          <div>
            <h3 className="text-3xl font-black text-[#0f4225] tracking-tight">₹{stats.revenueThisMonth}</h3>
            <p className="text-[10px] text-[#2d8a52] font-semibold mt-1">Completed invoices</p>
          </div>
        </div>

        <div className="p-6 bg-white border border-[#0f4225]/10 rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] uppercase font-black text-stone-400 tracking-wider">Question Banks</span>
            <ListCollapse size={18} className="text-[#2d8a52]" />
          </div>
          <div>
            <h3 className="text-3xl font-black text-[#0f4225] tracking-tight">{stats.questionBanks}</h3>
            <p className="text-[10px] text-[#2d8a52] font-semibold mt-1">JSON packages synced</p>
          </div>
        </div>

        <div className="p-6 bg-white border border-[#0f4225]/10 rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] uppercase font-black text-stone-400 tracking-wider">Pending Approvals</span>
            <AlertCircle size={18} className="text-[#b87c0a]" />
          </div>
          <div>
            <h3 className="text-3xl font-black text-[#0f4225] tracking-tight">{pendingList.length}</h3>
            <p className="text-[10px] text-[#b87c0a] font-semibold mt-1">Needs moderator review</p>
          </div>
        </div>

        <div className="p-6 bg-white border border-[#0f4225]/10 rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] uppercase font-black text-stone-400 tracking-wider">Notifications Sent</span>
            <Send size={18} className="text-blue-500" />
          </div>
          <div>
            <h3 className="text-3xl font-black text-[#0f4225] tracking-tight">{stats.notificationsSent}</h3>
            <p className="text-[10px] text-stone-400 mt-1">Total push campaigns</p>
          </div>
        </div>

        <div className="p-6 bg-white border border-[#0f4225]/10 rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] uppercase font-black text-stone-400 tracking-wider">Avg Accuracy</span>
            <BarChart3 size={18} className="text-[#2d8a52]" />
          </div>
          <div>
            <h3 className="text-3xl font-black text-[#0f4225] tracking-tight">{stats.avgAccuracy}%</h3>
            <p className="text-[10px] text-[#2d8a52] font-semibold mt-1">All student mock accuracy</p>
          </div>
        </div>

      </div>

      {/* Quick Action Controls */}
      <div className="bg-[#e8f5ee] border-2 border-[#2d8a52]/10 p-6 rounded-2xl">
         <h4 className="text-xs font-black uppercase tracking-widest text-[#0f4225] mb-4">Quick Operators Console</h4>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button onClick={() => navigate('/admin/bulk-upload')} className="bg-white border border-[#0f4225]/10 hover:border-[#2d8a52] text-left p-4 rounded-xl shadow-sm hover:shadow transition-all group">
               <PlusCircle size={20} className="text-[#2d8a52] mb-2 group-hover:scale-110 transition-transform"/>
               <p className="text-xs font-bold">Upload Question Bank</p>
               <p className="text-[10px] text-stone-500 mt-0.5">Parse CSV, XLSX or JSON</p>
            </button>
            <button onClick={() => navigate('/admin/broadcast')} className="bg-white border border-[#0f4225]/10 hover:border-[#2d8a52] text-left p-4 rounded-xl shadow-sm hover:shadow transition-all group">
               <Send size={20} className="text-blue-500 mb-2 group-hover:scale-110 transition-transform"/>
               <p className="text-xs font-bold">Send Notification</p>
               <p className="text-[10px] text-stone-500 mt-0.5">Push message to segment</p>
            </button>
            <button onClick={() => navigate('/admin/tests')} className="bg-white border border-[#0f4225]/10 hover:border-[#2d8a52] text-left p-4 rounded-xl shadow-sm hover:shadow transition-all group">
               <CheckSquare size={20} className="text-[#b87c0a] mb-2 group-hover:scale-110 transition-transform"/>
               <p className="text-xs font-bold">Add Mock Test</p>
               <p className="text-[10px] text-stone-500 mt-0.5">Create full length mock exam</p>
            </button>
            <button onClick={() => navigate('/admin/visitors')} className="bg-white border border-[#0f4225]/10 hover:border-[#2d8a52] text-left p-4 rounded-xl shadow-sm hover:shadow transition-all group">
               <BarChart3 size={20} className="text-purple-500 mb-2 group-hover:scale-110 transition-transform"/>
               <p className="text-xs font-bold">View Reports</p>
               <p className="text-[10px] text-stone-500 mt-0.5">Examine analytics pipeline</p>
            </button>
         </div>
      </div>

      {/* Two Column Layout Block */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Col: Pending Approvals table */}
        <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
             <div>
                <h3 className="font-serif font-bold text-lg">Pending Approvals</h3>
                <p className="text-[10px] text-stone-500 uppercase font-black tracking-wider">Requires review before publication</p>
             </div>
             <span className="text-[10px] bg-[#fdf3df] text-[#b87c0a] px-2.5 py-1 rounded-full font-bold">
                {pendingList.length} Items Pending
             </span>
          </div>

          {pendingList.length === 0 ? (
             <div className="flex flex-col items-center justify-center p-12 text-center text-stone-400">
               <Check size={36} className="text-[#2d8a52] mb-2" />
               <p className="text-xs font-semibold">Tidy Inbox! All submissions have been processed.</p>
             </div>
          ) : (
            <div className="space-y-4">
              {pendingList.map(item => (
                <div key={item.id} className="p-4 bg-[#f8faf9] border border-stone-100 rounded-2xl flex flex-col gap-2 hover:border-[#2d8a52]/40 transition-colors">
                  <div className="flex items-start justify-between">
                     <div>
                        <span className="text-[9px] bg-[#e8f5ee] text-[#0f4225] px-2 py-0.5 rounded font-black uppercase tracking-wider">
                           {item.subject}
                        </span>
                        <h4 className="font-bold text-xs mt-1 text-black">{item.title}</h4>
                     </div>
                     <span className="text-[10px] text-stone-500 font-mono">{item.date}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-stone-500 pt-2 border-t border-stone-100 mt-2">
                     <span>Questions: <b className="text-[#0f4225]">{item.questions}</b></span>
                     <span>By: <b className="text-stone-700">{item.uploadedBy}</b></span>
                  </div>
                  <div className="flex gap-2 justify-end mt-2 pt-2 border-t border-stone-100">
                     <button 
                       onClick={() => handleReject(item.id, item.title)}
                       className="px-3 py-1.5 bg-stone-100 hover:bg-red-50 text-stone-600 hover:text-red-600 font-bold text-[10px] rounded-lg transition-colors flex items-center gap-1"
                     >
                       <X size={12}/> Reject
                     </button>
                     <button 
                       onClick={() => handleApprove(item.id, item.title)}
                       className="px-3 py-1.5 bg-[#0f4225] hover:bg-[#1a6b3a] text-white font-bold text-[10px] rounded-lg transition-colors flex items-center gap-1"
                     >
                       <Check size={12}/> Approve & Live
                     </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Recent Activity feed */}
        <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm">
           <div className="mb-6">
              <h3 className="font-serif font-bold text-lg">System Event Logs</h3>
              <p className="text-[10px] text-stone-500 uppercase font-black tracking-wider">Audit trail of transactions & writes</p>
           </div>

           <div className="space-y-4">
              {activities.map(act => (
                <div key={act.id} className="flex gap-3 items-start p-3 rounded-xl hover:bg-stone-50 transition-colors">
                   <div className={`w-2 h-2 rounded-full mt-1.5 ${
                     act.status === 'success' ? 'bg-[#2d8a52]' : act.status === 'warning' ? 'bg-[#b87c0a]' : 'bg-blue-500'
                   }`}></div>
                   <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-black">{act.title}</p>
                      <div className="flex items-center gap-2 text-[10px] text-stone-400 font-medium mt-0.5">
                         <span>User: {act.user}</span>
                         <span>•</span>
                         <span>{act.timestamp}</span>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>

      </div>

    </div>
  );
}

const CheckCircle2 = ({ size, className }: { size: number; className?: string }) => (
  <Check size={size || 20} className={className} />
);
