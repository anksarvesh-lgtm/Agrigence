import React, { useState, useEffect } from 'react';
import { X, CreditCard, QrCode, AlertCircle, CheckCircle2, ChevronRight, Copy, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockBackend } from '../services/mockBackend';
import { useAuth } from '../src/authContext';
import { SubscriptionPlan, SiteSettings } from '../types';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  plan: {
    id: string;
    name: string;
    price: number | string;
  };
  onSuccess: () => void;
}

const PaymentDialog: React.FC<PaymentDialogProps> = ({ isOpen, onClose, plan, onSuccess }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [method, setMethod] = useState<'CHOICE' | 'RAZORPAY' | 'UPI'>('CHOICE');
  const [isProcessing, setIsProcessing] = useState(false);
  const [txnId, setTxnId] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [status, setStatus] = useState<'IDLE' | 'PENDING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    mockBackend.refreshSettings().then(() => {
      setSettings(mockBackend.getSettings());
    });
  }, []);

  const totalAmount = typeof plan.price === 'string' ? parseFloat(plan.price) : plan.price;
  const [guestInfo, setGuestInfo] = useState({ name: '', email: '', mobile: '' });

  const handleRazorpay = async () => {
    // If not logged in, ensure guest info is provided
    if (!user) {
      if (!guestInfo.name || !guestInfo.email || !guestInfo.mobile) {
        alert("Please provide your Name, Email and Mobile number for the receipt.");
        return;
      }
    }
    
    setIsProcessing(true);
    setErrorMessage('');

    try {
      // 1. Create order
      const order = await mockBackend.createRazorpayOrder(totalAmount);
      
      const options = {
        key: order.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_dummy",
        amount: order.amount,
        currency: order.currency,
        name: "Agrigence Journal",
        description: `Unlock ${plan.name}`,
        image: "/logo-icon.svg",
        order_id: order.id,
        handler: async (response: any) => {
          try {
            setIsProcessing(true);
            await mockBackend.verifyRazorpayPayment(response);
            // If verified, process online payment in our DB
            const paymentUserId = user?.id || `guest_${Date.now()}`;
            await mockBackend.processOnlinePayment(paymentUserId, plan.id, response.razorpay_payment_id, totalAmount, !user ? guestInfo : undefined);
            setStatus('SUCCESS');
            onSuccess();
          } catch (err: any) {
            setErrorMessage(err.message || "Payment verification failed");
            setStatus('ERROR');
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: user?.name || guestInfo.name,
          email: user?.email || guestInfo.email,
          contact: user?.mobileNumber || guestInfo.mobile || ""
        },
        theme: {
          color: "#002147"
        },
        modal: {
          ondismiss: () => setIsProcessing(false)
        }
      };

      if (options.key === "rzp_test_dummy") {
        // Mock successful flow
        setTimeout(async () => {
          try {
            // Mock verficiation
            const paymentUserId = user?.id || `guest_${Date.now()}`;
            await mockBackend.processOnlinePayment(paymentUserId, plan.id, `mock_pay_${Date.now()}`, totalAmount, !user ? guestInfo : undefined);
            setStatus('SUCCESS');
            onSuccess();
          } catch (e: any) {
            setErrorMessage(e.message || "Payment verification failed");
            setStatus('ERROR');
          } finally {
            setIsProcessing(false);
          }
        }, 1500);
        return;
      }

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to initiate Razorpay");
      setIsProcessing(false);
    }
  };

  const handleManualUPI = async () => {
    if (!txnId) {
      alert("Please enter Transaction ID");
      return;
    }

    if (!user && (!guestInfo.name || !guestInfo.email)) {
      alert("Please provide your Name and Email for verification.");
      return;
    }

    setIsProcessing(true);
    try {
      let screenshotUrl = '';
      if (screenshot) {
        screenshotUrl = await mockBackend.uploadToBlob(screenshot, 'payments');
      }

      // Add payment record as PENDING
      await mockBackend.addPaymentRecord({
        userId: user?.id || 'GUEST',
        userName: user?.name || guestInfo.name,
        userEmail: user?.email || guestInfo.email,
        userMobile: user?.mobileNumber || guestInfo.mobile,
        planId: plan.id,
        planName: plan.name,
        amount: totalAmount,
        method: 'QR',
        status: 'PENDING',
        upiTxnId: txnId,
        screenshotUrl,
        date: new Date().toISOString()
      });

      setStatus('SUCCESS');
      // No immediate onSuccess() call for manual UPI as it needs admin verification
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to submit payment details");
      setStatus('ERROR');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyUPI = () => {
    if (settings?.upiId) {
      navigator.clipboard.writeText(settings.upiId);
      alert("UPI ID copied to clipboard!");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-lg bg-white rounded-[2rem] overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-serif font-bold text-agri-primary">Complete Payment</h2>
            <p className="text-xs text-stone-500">Plan: {plan.name} • Amount: ₹{totalAmount}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
            <X size={20} className="text-stone-400" />
          </button>
        </div>

        <div className="p-8 max-h-[70vh] overflow-y-auto">
          <AnimatePresence mode="wait">
            {!user && status === 'IDLE' && method !== 'CHOICE' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-3"
              >
                <div className="flex items-center gap-2 text-blue-700 font-bold text-xs uppercase tracking-wider mb-2">
                  <AlertCircle size={14} />
                  Guest Checkout Info
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <input 
                    type="text" 
                    placeholder="Full Name" 
                    className="w-full p-3 bg-white border border-stone-200 rounded-xl text-sm outline-none focus:border-agri-primary"
                    value={guestInfo.name}
                    onChange={e => setGuestInfo({...guestInfo, name: e.target.value})}
                  />
                  <input 
                    type="email" 
                    placeholder="Email Address" 
                    className="w-full p-3 bg-white border border-stone-200 rounded-xl text-sm outline-none focus:border-agri-primary"
                    value={guestInfo.email}
                    onChange={e => setGuestInfo({...guestInfo, email: e.target.value})}
                  />
                  <input 
                    type="tel" 
                    placeholder="Mobile Number" 
                    className="w-full p-3 bg-white border border-stone-200 rounded-xl text-sm outline-none focus:border-agri-primary"
                    value={guestInfo.mobile}
                    onChange={e => setGuestInfo({...guestInfo, mobile: e.target.value})}
                  />
                </div>
              </motion.div>
            )}

            {status === 'SUCCESS' ? (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10"
              >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={40} className="text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-agri-primary mb-2">Payment Received!</h3>
                <p className="text-stone-600 mb-8 max-w-xs mx-auto">
                  {method === 'RAZORPAY' 
                    ? "Your subscription is now active. You can access all benefits immediately."
                    : "Your payment details have been submitted for verification. Access will be granted shortly."}
                </p>
                <button 
                  onClick={onClose}
                  className="w-full bg-agri-primary text-white py-4 rounded-xl font-bold uppercase tracking-widest text-sm"
                >
                  Close & Continue
                </button>
              </motion.div>
            ) : method === 'CHOICE' ? (
              <motion.div key="choice" className="space-y-4">
                <button 
                  onClick={() => setMethod('RAZORPAY')}
                  className="w-full group flex items-center justify-between p-6 bg-stone-50 hover:bg-agri-primary hover:text-white rounded-2xl border border-stone-200 transition-all text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white group-hover:bg-white/10 rounded-xl">
                      <CreditCard className="text-agri-primary group-hover:text-white" size={24} />
                    </div>
                    <div>
                      <div className="font-bold">Online Gateway (Razorpay)</div>
                      <div className="text-xs opacity-70">Pay via Card, UPI, Net Banking or Wallet</div>
                    </div>
                  </div>
                  <ChevronRight size={20} className="opacity-40 group-hover:opacity-100" />
                </button>

                <button 
                  onClick={() => setMethod('UPI')}
                  className="w-full group flex items-center justify-between p-6 bg-stone-50 hover:bg-agri-secondary hover:text-white rounded-2xl border border-stone-200 transition-all text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white group-hover:bg-white/10 rounded-xl">
                      <QrCode className="text-agri-secondary group-hover:text-white" size={24} />
                    </div>
                    <div>
                      <div className="font-bold">Direct UPI QR Code</div>
                      <div className="text-xs opacity-70">Scan & Pay manually (Zero Gateway Fee)</div>
                    </div>
                  </div>
                  <ChevronRight size={20} className="opacity-40 group-hover:opacity-100" />
                </button>

                <div className="pt-6 text-center">
                  <p className="text-[10px] uppercase tracking-tighter text-stone-400 font-bold">100% Secure Payments Powered by SSL</p>
                </div>
              </motion.div>
            ) : method === 'RAZORPAY' ? (
              <motion.div key="razorpay" className="text-center py-6">
                <div className="mb-8">
                  <div className="text-4xl font-black text-agri-primary mb-2">₹{totalAmount}</div>
                  <p className="text-sm text-stone-500">Secure Online Checkout</p>
                </div>
                
                {errorMessage && (
                  <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-start gap-3 text-left border border-red-100">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button 
                  onClick={handleRazorpay}
                  disabled={isProcessing}
                  className="w-full bg-agri-primary text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-3 shadow-xl shadow-agri-primary/20 transition-transform active:scale-95 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : <CreditCard size={18} />}
                  Proceed to Payment
                </button>
                
                <button 
                  onClick={() => setMethod('CHOICE')}
                  className="mt-6 text-sm font-bold text-stone-400 hover:text-agri-primary transition-colors"
                >
                  Go Back
                </button>
              </motion.div>
            ) : (
            <motion.div key="upi" className="space-y-6 text-center">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-left text-sm text-amber-800">
                  <p className="font-bold mb-1 flex items-center gap-2">⚠️ UPI Payment Note</p>
                  <p>For better convenience and faster confirmation, kindly share the payment screenshot with us on WhatsApp after completing the UPI payment.</p>
                  <p className="mt-2 text-amber-900 font-medium">Thank you for your cooperation.</p>
                </div>
                <div className="flex justify-center bg-white p-4 rounded-3xl border border-stone-200 shadow-inner relative overflow-hidden group">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(`upi://pay?pa=${settings?.upiId || 'agrigence@upi'}&pn=Agrigence&am=${totalAmount}&cu=INR`)}`} 
                    alt="UPI QR" 
                    className="w-48 h-48 object-contain" 
                  />
                  <div className="absolute inset-0 bg-agri-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>

                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                  <p className="text-stone-500 text-xs uppercase font-bold tracking-widest mb-1">Payable Amount</p>
                  <p className="text-2xl font-black text-agri-primary">₹{totalAmount}</p>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-widest px-1">UPI ID</label>
                  <div className="flex items-center gap-2 p-4 bg-stone-50 rounded-2xl border border-stone-200">
                    <code className="flex-1 font-mono text-sm font-bold">{settings?.upiId}</code>
                    <button onClick={copyUPI} className="p-2 hover:bg-stone-200 rounded-lg transition-colors">
                      <Copy size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-dashed border-stone-200">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-500 uppercase tracking-widest px-1">Enter Transaction ID / UTR</label>
                    <input 
                      type="text" 
                      value={txnId}
                      onChange={(e) => setTxnId(e.target.value)}
                      placeholder="12-digit UPI Transaction ID"
                      className="w-full p-4 bg-white border border-stone-300 rounded-2xl focus:ring-2 focus:ring-agri-secondary outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-500 uppercase tracking-widest px-1">Payment Screenshot (Optional)</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                      className="w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200 cursor-pointer"
                    />
                  </div>

                  <button 
                    onClick={handleManualUPI}
                    disabled={isProcessing || !txnId}
                    className="w-full bg-agri-secondary text-white py-4 rounded-xl font-bold uppercase tracking-widest text-sm shadow-xl shadow-agri-secondary/20 disabled:opacity-50 transition-transform active:scale-95"
                  >
                    {isProcessing ? "Submitting..." : "Submit for Verification"}
                  </button>

                  <button 
                    onClick={() => setMethod('CHOICE')}
                    className="w-full text-sm font-bold text-stone-400 hover:text-agri-primary py-2 transition-colors"
                  >
                    Use Online Payment Instead
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentDialog;
