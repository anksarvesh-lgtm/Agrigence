
import React, { useState, useEffect } from 'react';
import { mockBackend } from '../../services/mockBackend';
import { PaymentRecord } from '../../types';
import { Search, CheckCircle, XCircle, Eye, ShieldCheck, QrCode } from 'lucide-react';

const Payments: React.FC = () => {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('ALL');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    loadPayments();
  }, [filter]);

  const loadPayments = () => {
    const data = mockBackend.getPayments();
    if (filter === 'ALL') setPayments(data);
    else setPayments(data.filter(p => p.status === filter));
  };

  const handleVerify = async (id: string) => {
    if (confirm('Verify this payment? The user plan will be activated immediately.')) {
      await mockBackend.verifyPayment(id);
      loadPayments();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-white">Payment Management</h1>
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
          <button onClick={() => setFilter('ALL')} className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${filter === 'ALL' ? 'bg-agri-secondary text-agri-primary' : 'text-white/40 hover:text-white'}`}>All</button>
          <button onClick={() => setFilter('PENDING')} className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${filter === 'PENDING' ? 'bg-agri-secondary text-agri-primary' : 'text-white/40 hover:text-white'}`}>Pending</button>
          <button onClick={() => setFilter('COMPLETED')} className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${filter === 'COMPLETED' ? 'bg-agri-secondary text-agri-primary' : 'text-white/40 hover:text-white'}`}>Completed</button>
        </div>
      </div>

      <div className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-[10px] uppercase font-bold text-white/20">
              <tr>
                <th className="p-6">Transaction</th>
                <th className="p-6">User</th>
                <th className="p-6">Plan / Amount</th>
                <th className="p-6">Status</th>
                <th className="p-6 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="text-sm text-white/70">
              {payments.map(p => (
                <tr key={p.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white">
                         <QrCode size={20} />
                      </div>
                      <div>
                        <p className="text-white font-bold text-xs">{p.method}</p>
                        <p className="text-[10px] text-white/40 font-mono">{p.upiTxnId || 'NO_TXN_ID'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <p className="text-white font-bold">{p.userName}</p>
                    <p className="text-[10px] text-white/40">{new Date(p.date).toLocaleString()}</p>
                  </td>
                  <td className="p-6">
                    <p className="text-white font-bold">{p.planName}</p>
                    <p className="text-agri-secondary font-bold text-xs">₹{p.amount}</p>
                  </td>
                  <td className="p-6">
                    <span className={`px-2 py-1 rounded-[4px] text-[10px] font-bold uppercase ${
                      p.status === 'COMPLETED' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {p.screenshotUrl && (
                        <button onClick={() => setSelectedImage(p.screenshotUrl!)} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all" title="View Screenshot">
                          <Eye size={18} />
                        </button>
                      )}
                      {p.status === 'PENDING' && (
                        <button onClick={() => handleVerify(p.id)} className="flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-lg font-bold text-xs hover:bg-green-500 hover:text-white transition-all">
                          <CheckCircle size={14} /> Verify
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr><td colSpan={5} className="p-20 text-center text-white/20 italic">No payment records found</td></tr>
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
