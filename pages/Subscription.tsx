import React, { useEffect, useState } from 'react';
import { useAuth } from '../App';
import { SubscriptionPlan, SiteSettings } from '../types';
import { 
  Check, Star, ShieldCheck, CreditCard, QrCode, X, 
  UploadCloud, MessageCircle, AlertTriangle, FileText, 
  PenTool, Layers, ChevronRight, Zap
} from 'lucide-react';
import { mockBackend } from '../services/mockBackend';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Subscription: React.FC = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  
  // Modal State
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'STRIPE' | 'UPI' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // UPI Form State
  const [upiForm, setUpiForm] = useState({
    txnId: '',
    screenshot: null as File | null
  });

  useEffect(() => {
    setPlans(mockBackend.getPlans().filter(p => p.isActive));
    setSettings(mockBackend.getSettings());
  }, []);

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    if (!user) {
      if(confirm("Login is required to purchase a plan. Redirect to login?")) {
        navigate('/login');
      }
      return;
    }
    setSelectedPlan(plan);
    setPaymentMethod(null);
    setUpiForm({ txnId: '', screenshot: null });
  };

  const handleStripePayment = async () => {
    if (!selectedPlan || !user) return;
    setIsProcessing(true);

    setTimeout(async () => {
      const updatedUser = await mockBackend.purchasePlan(user.id, selectedPlan.id, 'STRIPE');
      if (updatedUser) {
        login(updatedUser);
        alert(`Payment Verified! Your ${selectedPlan.name} is now active.`);
        navigate('/dashboard');
      }
      setIsProcessing(false);
      setSelectedPlan(null);
    }, 2000);
  };

  const handleUpiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan || !user) return;
    if (!upiForm.txnId) return alert("Please enter Transaction ID");

    setIsProcessing(true);

    // Prompt says: "On Submit → Immediately activate plan in user account"
    setTimeout(async () => {
      const updatedUser = await mockBackend.purchasePlan(user.id, selectedPlan.id, 'UPI');
      if (updatedUser) {
        login(updatedUser);
        alert("Verification Protocol Initialized! Your plan has been activated instantly.");
        navigate('/dashboard');
      }
      setIsProcessing(false);
      setSelectedPlan(null);
    }, 1500);
  };

  const articlePlans = plans.filter(p => p.type === 'ARTICLE_ACCESS');
  const blogPlans = plans.filter(p => p.type === 'BLOG_ACCESS');
  const comboPlan = plans.find(p => p.type === 'COMBO_ACCESS');

  const PlanCard: React.FC<{ plan: SubscriptionPlan }> = ({ plan }) => (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white/40 backdrop-blur-xl border border-white/20 p-8 rounded-[2.5rem] shadow-premium flex flex-col group relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
         {plan.type === 'ARTICLE_ACCESS' ? <FileText size={80} /> : <PenTool size={80} />}
      </div>
      
      <div className="mb-6">
        <h3 className="text-xl font-serif font-bold text-agri-primary group-hover:text-agri-secondary transition-colors">{plan.name}</h3>
        <p className="text-stone-400 text-[10px] font-black uppercase tracking-widest mt-1">Validity: {plan.validityLabel}</p>
      </div>
      
      <div className="mb-8">
        <span className="text-4xl font-black text-agri-primary">₹{plan.price}</span>
        <span className="text-stone-400 text-xs font-bold uppercase tracking-tight ml-2">Total Tax Inc.</span>
      </div>

      <div className="space-y-4 mb-10 flex-1">
        {plan.features.map((feature, i) => (
          <div key={i} className="flex items-start gap-3 text-sm text-stone-600 font-medium">
            <Check size={16} className="text-green-500 shrink-0 mt-0.5" />
            <span>{feature}</span>
          </div>
        ))}
      </div>

      <button 
        onClick={() => handlePlanSelect(plan)}
        className="w-full bg-agri-primary text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-agri-secondary transition-all shadow-xl shadow-agri-primary/10 flex items-center justify-center gap-2"
      >
        Select Plan <ChevronRight size={14} />
      </button>
    </motion.div>
  );

  return (
    <div className="min-h-screen pb-24 bg-agri-bg">
      
      {/* Notice Bar */}
      <div className="bg-agri-primary text-white py-3 text-center border-b border-agri-secondary/20">
         <p className="text-[10px] font-black uppercase tracking-[0.25em] flex items-center justify-center gap-3">
           <Zap size={14} className="text-agri-secondary animate-pulse" />
           Login required. Stripe activates instantly. QR activates after payment details submission.
         </p>
      </div>

      <div className="container mx-auto px-6 py-16">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-agri-primary mb-6 leading-tight">Investment in <span className="text-agri-secondary italic">Research</span></h1>
          <p className="text-stone-500 leading-relaxed font-light text-lg">Secure your publication protocol with our structured subscription modules, designed for individual and institutional academic growth.</p>
        </div>

        {/* Highlight Section: Combo Plan */}
        {comboPlan && (
          <div className="max-w-4xl mx-auto mb-24 relative group">
             <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-10">
                <span className="bg-agri-secondary text-agri-primary px-8 py-2 rounded-full shadow-2xl font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-2">
                  <Star fill="currentColor" size={14} /> RECOMMENDED_PROTOCOL
                </span>
             </div>
             
             <motion.div 
               whileHover={{ scale: 1.01 }}
               className="bg-agri-primary rounded-[3.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row relative"
             >
                <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80')] bg-cover"></div>
                <div className="relative z-10 md:w-1/2 p-12 lg:p-16 flex flex-col justify-center text-white">
                   <h2 className="text-4xl font-serif font-bold mb-4">Combo Access Max</h2>
                   <p className="text-white/60 mb-10 leading-relaxed">The ultimate academic and insight bundle. Unlock unrestricted submissions for both high-impact articles and community blogs.</p>
                   <div className="space-y-4">
                      {comboPlan.features.map((f, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm font-bold text-agri-secondary uppercase tracking-widest">
                           <Check size={18} /> {f}
                        </div>
                      ))}
                   </div>
                </div>
                <div className="relative z-10 md:w-1/2 p-12 lg:p-16 bg-white/5 backdrop-blur-3xl border-l border-white/10 flex flex-col items-center justify-center text-center">
                   <div className="mb-2 text-white/40 font-black text-[10px] uppercase tracking-widest">Premium Value Bundle</div>
                   <div className="text-6xl font-black text-white mb-2 tracking-tighter">₹{comboPlan.price}</div>
                   <div className="text-agri-secondary font-serif italic text-lg mb-10">{comboPlan.validityLabel} Access</div>
                   <button 
                     onClick={() => handlePlanSelect(comboPlan)}
                     className="w-full bg-agri-secondary text-agri-primary py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-white transition-all shadow-2xl shadow-agri-secondary/20"
                   >
                     Get Combo Access
                   </button>
                </div>
             </motion.div>
          </div>
        )}

        {/* Section A: Article Plans */}
        <div className="mb-24">
           <div className="flex items-center gap-4 mb-12">
              <div className="h-px flex-1 bg-stone-200"></div>
              <h2 className="text-2xl font-serif font-bold text-agri-primary px-8">Article Submission Plans</h2>
              <div className="h-px flex-1 bg-stone-200"></div>
           </div>
           <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {articlePlans.map(plan => <PlanCard key={plan.id} plan={plan} />)}
           </div>
        </div>

        {/* Section B: Blog Plans */}
        <div className="mb-24">
           <div className="flex items-center gap-4 mb-12">
              <div className="h-px flex-1 bg-stone-200"></div>
              <h2 className="text-2xl font-serif font-bold text-agri-primary px-8">Blog Publishing Plans</h2>
              <div className="h-px flex-1 bg-stone-200"></div>
           </div>
           <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {blogPlans.map(plan => <PlanCard key={plan.id} plan={plan} />)}
           </div>
        </div>

        {/* Footer Support */}
        <div className="bg-white/40 backdrop-blur-md border border-white/20 p-10 rounded-[3rem] text-center max-w-3xl mx-auto shadow-sm">
           <h3 className="text-lg font-bold text-agri-primary mb-4 flex items-center justify-center gap-3">
              <ShieldCheck className="text-agri-secondary" /> Verified Security Protocol
           </h3>
           <p className="text-sm text-stone-500 font-medium mb-8">All financial transmissions are processed through secure 256-bit encrypted gateways. Your publication limits are synced instantly with your profile node.</p>
           <a 
            href={`https://wa.me/${settings?.whatsappNumber?.replace('+', '') || '919452571317'}`} 
            target="_blank" 
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-agri-secondary font-black text-[10px] uppercase tracking-widest hover:text-agri-primary transition-colors"
           >
              Need Protocol Assistance? <MessageCircle size={14} />
           </a>
        </div>
      </div>

      {/* Payment Overlay Modal */}
      <AnimatePresence>
        {selectedPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-agri-primary/80 backdrop-blur-md">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
             >
                {/* Modal Header */}
                <div className="bg-agri-primary p-10 text-white flex justify-between items-center relative overflow-hidden">
                   <div className="absolute right-0 top-0 p-10 opacity-5">
                      <CreditCard size={120} />
                   </div>
                   <div className="relative z-10">
                      <h2 className="text-3xl font-serif font-bold">{selectedPlan.name}</h2>
                      <p className="text-agri-secondary font-black text-[10px] uppercase tracking-widest mt-2 flex items-center gap-2">
                        <Zap size={12} fill="currentColor"/> Payment Interface v2.0
                      </p>
                   </div>
                   <button onClick={() => setSelectedPlan(null)} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all relative z-10">
                      <X size={20} />
                   </button>
                </div>

                {/* Body: Select Method or Form */}
                {!paymentMethod ? (
                  <div className="p-12 space-y-10">
                     <div className="text-center">
                        <div className="text-5xl font-black text-agri-primary mb-2">₹{selectedPlan.price}</div>
                        <p className="text-stone-400 font-bold text-xs uppercase tracking-widest">Total Transaction Amount</p>
                     </div>
                     
                     <div className="grid md:grid-cols-2 gap-6">
                        <button 
                          onClick={() => setPaymentMethod('STRIPE')}
                          className="flex flex-col items-center gap-4 p-8 rounded-[2rem] bg-stone-50 border border-stone-100 hover:border-agri-secondary hover:bg-white transition-all group"
                        >
                           <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                              <CreditCard size={28} />
                           </div>
                           <div className="text-center">
                              <span className="block font-black text-[10px] uppercase tracking-widest text-stone-400 mb-1">Method_01</span>
                              <span className="block font-bold text-agri-primary">Card / Stripe</span>
                           </div>
                        </button>

                        <button 
                          onClick={() => setPaymentMethod('UPI')}
                          className="flex flex-col items-center gap-4 p-8 rounded-[2rem] bg-stone-50 border border-stone-100 hover:border-agri-secondary hover:bg-white transition-all group"
                        >
                           <div className="w-14 h-14 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                              <QrCode size={28} />
                           </div>
                           <div className="text-center">
                              <span className="block font-black text-[10px] uppercase tracking-widest text-stone-400 mb-1">Method_02</span>
                              <span className="block font-bold text-agri-primary">UPI / QR Scan</span>
                           </div>
                        </button>
                     </div>
                  </div>
                ) : (
                  <div className="p-12 overflow-y-auto custom-scrollbar">
                     <button onClick={() => setPaymentMethod(null)} className="mb-8 text-[10px] font-black text-agri-secondary uppercase tracking-widest flex items-center gap-2 hover:text-agri-primary transition-colors">
                        <ChevronRight size={14} className="rotate-180" /> Back to methods
                     </button>

                     {paymentMethod === 'STRIPE' ? (
                       <div className="text-center py-6">
                          <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                             <ShieldCheck size={40} />
                          </div>
                          <h3 className="text-2xl font-serif font-bold text-agri-primary mb-4">Secure Gateway Link</h3>
                          <p className="text-stone-500 text-sm leading-relaxed mb-10 px-10">You will be securely redirected to Stripe to authenticate your card details. Your plan activates immediately upon success.</p>
                          <button 
                            onClick={handleStripePayment}
                            disabled={isProcessing}
                            className="w-full bg-[#635BFF] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 shadow-xl shadow-indigo-200 transition-all flex items-center justify-center gap-3"
                          >
                             {isProcessing ? 'SYNCHRONIZING...' : `TRANSACT ₹${selectedPlan.price} VIA STRIPE`}
                          </button>
                       </div>
                     ) : (
                       <div className="space-y-10">
                          <div className="flex flex-col md:flex-row items-center gap-10 bg-stone-50 p-8 rounded-[2rem] border border-stone-100">
                             <div className="bg-white p-3 rounded-2xl shadow-sm border border-stone-100 shrink-0">
                                {(() => {
                                   const upiId = settings?.upiId || 'agrigence@upi';
                                   const isDynamic = settings?.upiQrUrl?.includes('api.qrserver.com');
                                   const qrSrc = !isDynamic && settings?.upiQrUrl 
                                      ? settings.upiQrUrl 
                                      : `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=upi://pay?pa=${upiId}&pn=Agrigence&am=${selectedPlan.price}&cu=INR`;
                                   
                                   return (
                                      <img 
                                        src={qrSrc}
                                        alt="Payment QR" 
                                        className="w-32 h-32 object-contain"
                                      />
                                   );
                                })()}
                             </div>
                             <div className="text-center md:text-left flex-1">
                                <p className="text-xs font-bold text-agri-primary mb-2 uppercase tracking-widest">UPI ID Configuration</p>
                                <div className="bg-white border border-stone-200 rounded-xl p-3 flex items-center justify-between font-mono text-sm font-bold text-agri-primary mb-4">
                                   <span>{settings?.upiId || 'agrigence@upi'}</span>
                                   <button className="text-agri-secondary hover:text-agri-primary transition-colors"><Zap size={14}/></button>
                                </div>
                                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-tighter">Scan with GPay, PhonePe, Paytm, or BHIM</p>
                             </div>
                          </div>

                          <form onSubmit={handleUpiSubmit} className="space-y-6">
                             <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                   <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 block">Transaction / Ref ID</label>
                                   <input 
                                     required
                                     value={upiForm.txnId}
                                     onChange={e => setUpiForm({...upiForm, txnId: e.target.value})}
                                     placeholder="12-digit UPI Number"
                                     className="w-full bg-stone-50 border border-stone-200 p-4 rounded-xl focus:ring-2 focus:ring-agri-secondary/20 outline-none text-sm font-bold"
                                   />
                                </div>
                                <div>
                                   <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 block">Verify Screenshot</label>
                                   <div className="relative group">
                                      <input 
                                        type="file" 
                                        accept="image/*"
                                        required
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        onChange={e => setUpiForm({...upiForm, screenshot: e.target.files?.[0] || null})}
                                      />
                                      <div className="w-full bg-stone-50 border-2 border-dashed border-stone-200 p-4 rounded-xl text-center group-hover:bg-white transition-all flex items-center justify-center gap-3">
                                         <UploadCloud size={16} className="text-agri-secondary" />
                                         <span className="text-[10px] font-black uppercase text-stone-500 truncate max-w-[120px]">
                                            {upiForm.screenshot ? upiForm.screenshot.name : "ATTACH_IMAGE"}
                                         </span>
                                      </div>
                                   </div>
                                </div>
                             </div>
                             
                             <button 
                               type="submit"
                               disabled={isProcessing}
                               className="w-full bg-agri-secondary text-agri-primary py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-agri-primary hover:text-white transition-all shadow-xl shadow-agri-secondary/20 flex items-center justify-center gap-3"
                             >
                                {isProcessing ? 'VERIFYING_TX...' : 'SUBMIT_AND_ACTIVATE_NOW'}
                             </button>
                          </form>
                       </div>
                     )}
                  </div>
                )}
             </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Subscription;