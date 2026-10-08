
import React, { useState, useEffect } from 'react';
import { mockBackend } from '../../services/mockBackend';
import { PaymentRecord } from '../../types';
import { Search, CheckCircle, XCircle, Eye, ShieldCheck, QrCode, Loader2 } from 'lucide-react';
import { useConfirm } from '../../components/ContextualConfirm';

const Payments: React.FC = () => {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('ALL');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const { confirm } = useConfirm();

  useEffect(() => {
    // Real-time subscription handles updates immediately
    const unsub = mockBackend.subscribeToPayments((data) => {
      if (filter === 'ALL') setPayments(data);
      else setPayments(data.filter(p => p.status === filter));
    });
    return () => unsub();
  }, [filter]);

  const handleVerify = async (id: string, e: React.MouseEvent) => {
    const isConfirmed = await confirm({
        message: 'Verify this payment? The user plan will be activated immediately.',
        trigger: e.currentTarget
    });

    if (isConfirmed) {
      setVerifyingId(id);
      try {
        await mockBackend.verifyPayment(id);
        // No manual reload needed, subscription will update UI
      } catch (error: any) {
        alert('Verification failed: ' + error.message);
      } finally {
        setVerifyingId(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Payment Management</h1>
        <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
          <button onClick={() => setFilter('ALL')} className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${filter === 'ALL' ? 'bg-agri-secondary text-white' : 'text-gray-500 hover:bg-gray-100'}`}>All</button>
          <button onClick={() => setFilter('PENDING')} className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${filter === 'PENDING' ? 'bg-agri-secondary text-white' : 'text-gray-500 hover:bg-gray-100'}`}>Pending</button>
          <button onClick={() => setFilter('COMPLETED')} className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${filter === 'COMPLETED' ? 'bg-agri-secondary text-white' : 'text-gray-500 hover:bg-gray-100'}`}>Completed</button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-admin-header text-[10px] uppercase font-bold text-white">
              <tr>
                <th className="p-6">Transaction</th>
                <th className="p-6">User</th>
                <th className="p-6">Plan / Amount</th>
                <th className="p-6">Status</th>
                <th className="p-6 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
              {payments.map(p => {
                // Handle mixed data properties due to legacy code
                const imageUrl = p.screenshotUrl || (p as any).screenshot;
                
                return (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 border border-gray-200">
                         <QrCode size={20} />
                      </div>
                      <div>
                        <p className="text-gray-900 font-bold text-xs">{p.method}</p>
                        <p className="text-[10px] text-gray-500 font-mono">{p.upiTxnId || 'NO_TXN_ID'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <p className="text-gray-900 font-bold">{p.userName}</p>
                    <p className="text-[10px] text-gray-500">{new Date(p.date).toLocaleString()}</p>
                  </td>
                  <td className="p-6">
                    <p className="text-gray-900 font-bold">{p.planName}</p>
                    <p className="text-agri-secondary font-bold text-xs">₹{p.amount}</p>
                  </td>
                  <td className="p-6">
                    <span className={`px-2 py-1 rounded-[4px] text-[10px] font-bold uppercase ${
                      p.status === 'COMPLETED' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {imageUrl && (
                        <button onClick={() => setSelectedImage(imageUrl)} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 hover:text-gray-900 transition-all shadow-sm" title="View Screenshot">
                          <Eye size={18} />
                        </button>
                      )}
                      {p.status === 'PENDING' && (
                        <button 
                          onClick={(e) => handleVerify(p.id, e)} 
                          disabled={verifyingId === p.id}
                          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-green-700 transition-all shadow-sm disabled:opacity-50"
                        >
                          {verifyingId === p.id ? (
                            <Loader2 size={14} className="animate-spin" /> 
                          ) : (
                            <CheckCircle size={14} /> 
                          )}
                          Verify
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )})}
              {payments.length === 0 && (
                <tr><td colSpan={5} className="p-20 text-center text-gray-400 italic">No payment records found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Screenshot Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-8 bg-black/90 backdrop-blur-md">
          <div className="relative max-w-2xl w-full">
             <button onClick={() => setSelectedImage(null)} className="absolute -top-12 right-0 text-white/50 hover:text-white flex items-center gap-2">
                CLOSE PREVIEW <XCircle size={24} />
             </button>
             <img src={selectedImage} className="w-full h-auto rounded-2xl shadow-2xl border border-white/10" alt="Screenshot" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
