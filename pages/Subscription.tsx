import React, { useEffect, useState } from 'react';
import { useAuth } from '../App';
import { SubscriptionPlan, SiteSettings, Coupon } from '../types';
import { 
  Check, Star, ShieldCheck, QrCode, X, 
  UploadCloud, MessageCircle, FileText, 
  PenTool, ChevronRight, Zap, Smartphone, CheckCircle, Tag, CreditCard, Lock, Globe
} from 'lucide-react';
import { mockBackend } from '../services/mockBackend';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { applyCoupon, CouponResult } from '../extensions/coupons/engine';
import { sendNotification } from '../extensions/notifications/service';
import { useConfirm } from '../components/ContextualConfirm';
import OptimizedImage from '../components/OptimizedImage';
import SEO from '../components/SEO';

const COUNTRIES = [
  { code: 'IN', name: 'India', currency: 'INR' },
  { code: 'US', name: 'United States', currency: 'USD' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP' },
  { code: 'AE', name: 'United Arab Emirates', currency: 'AED' },
  { code: 'CA', name: 'Canada', currency: 'CAD' },
  { code: 'AU', name: 'Australia', currency: 'AUD' },
  { code: 'EU', name: 'Europe', currency: 'EUR' },
  { code: 'BD', name: 'Bangladesh', currency: 'BDT' },
  { code: 'PK', name: 'Pakistan', currency: 'PKR' },
  { code: 'LK', name: 'Sri Lanka', currency: 'LKR' },
  { code: 'NG', name: 'Nigeria', currency: 'NGN' },
];

const Subscription: React.FC = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const { confirm } = useConfirm();
  
  // Modal State
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'DETAILS' | 'SUCCESS'>('DETAILS');

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [couponResult, setCouponResult] = useState<CouponResult | null>(null);
  const [showCouponList, setShowCouponList] = useState(false);
  const [activeCoupons, setActiveCoupons] = useState<Coupon[]>([]);

  // Country & Currency State
  const [billingCountry, setBillingCountry] = useState(user?.country || 'IN');

  // UPI Form State
  const [upiForm, setUpiForm] = useState({
    txnId: '',
    screenshot: null as File | null
  });

  // Toggle between Payment Modes
  const [paymentMode, setPaymentMode] = useState<'ONLINE' | 'MANUAL'>('ONLINE');

  // Derived Settings
  const selectedCountryObj = COUNTRIES.find(c => c.code === billingCountry) || COUNTRIES[0];
  const isIndianUser = billingCountry === 'IN';
  const targetCurrency = selectedCountryObj.currency;

  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  useEffect(() => {
    const loadScript = () =>
      new Promise<boolean>((resolve) => {
        if (document.getElementById("razorpay-script")) {
          resolve(true);
          return;
        }

        const script = document.createElement("script");
        script.id = "razorpay-script";
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });

    loadScript().then(setRazorpayLoaded);
  }, []);

  useEffect(() => {
    const load = async () => {
      let p = await mockBackend.getPlans();
      if (p.length === 0) {
        await mockBackend.checkAndSeedData();
        p = await mockBackend.getPlans();
      }
      setPlans(p.filter(plan => plan.isActive));
    };
    load();
    setSettings(mockBackend.getSettings());

    const unsubCoupons = mockBackend.subscribeToCoupons((data) => {
        const now = new Date();
        const valid = data.filter(c => {
            if (!c.isActive) return false;
            if (c.expiryDate) {
                const expiry = new Date(c.expiryDate);
                if (expiry < now) return false;
            }
            return true;
        });
        setActiveCoupons(valid);
    });

    return () => unsubCoupons();
  }, []);

  // Update billing country if user profile loads late
  useEffect(() => {
      if (user?.country) {
          setBillingCountry(user.country);
      }
  }, [user]);

  // Auto-switch payment mode when country changes
  useEffect(() => {
      if (billingCountry === 'IN') {
          setPaymentMode('ONLINE');
      } else {
          setPaymentMode('MANUAL');
      }
  }, [billingCountry]);

  const handlePlanSelect = async (plan: SubscriptionPlan, e: React.MouseEvent) => {
    if (!user) {
      const isConfirmed = await confirm({
          message: "Login is required to purchase a plan. Redirect to login?",
          trigger: e.currentTarget
      });
      if(isConfirmed) {
        navigate('/login');
      }
      return;
    }
    setSelectedPlan(plan);
    setUpiForm({ txnId: '', screenshot: null });
    setCouponCode('');
    setCouponResult(null);
    setShowCouponList(false);
    
    // Initialize with user's country or default
    setBillingCountry(user.country || 'IN');
    setStep('DETAILS');
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setBillingCountry(e.target.value);
  };

  const handleApplyCoupon = (codeToApply?: string) => {
    const code = codeToApply || couponCode;
    if (!selectedPlan || !code) return;
    
    const result = applyCoupon(code, selectedPlan.price, activeCoupons);
    setCouponResult(result);
    if (result.valid) {
        setCouponCode(code);
        setShowCouponList(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setCouponResult(null);
  };

  // --- COST CALCULATION ---
  const subTotal = selectedPlan 
    ? (couponResult?.valid ? couponResult.finalAmount : selectedPlan.price) 
    : 0;
  
  // Calculate 2% Gateway Charge
  const gatewayCharges = Math.ceil(subTotal * 0.02);
  
  // Final Amount to Charge in INR
  const payableAmount = subTotal + gatewayCharges;

  // Display Amount for International Users
  // Use the derived targetCurrency to calculate display price
  const displayPrice = (selectedPlan && targetCurrency !== 'INR') 
    ? mockBackend.getDisplayPrice(selectedPlan.price, targetCurrency) 
    : null;



  const handleOnlinePayment = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!razorpayLoaded) {
      alert("Payment gateway failed to load.");
      return;
    }

    if (!selectedPlan || !user) return;

    setIsProcessing(true);

    try {
      // 1. Create Order from Backend
      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: payableAmount,
          planId: selectedPlan.id,
          userId: user.id,
        }),
      });

      if (!orderRes.ok) {
        throw new Error('Failed to create order');
      }

      const order = await orderRes.json();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_live_SHIcdrtKQLFYHv",
        amount: order.amount,
        currency: order.currency,
        name: "Agrigence",
        description: `Plan Upgrade: ${selectedPlan.name}`,
        order_id: order.id, // Pass the order ID created from backend
        handler: async function (response: any) {
          try {
            // 2. Verify Payment on Backend
            const verifyResponse = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userId: user.id,
                planId: selectedPlan.id
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.status === 'success') {
                // 3. Update User Subscription in Database
                await mockBackend.purchasePlan(user.id, selectedPlan.id, {
                  method: 'ONLINE',
                  status: 'COMPLETED',
                  txnId: response.razorpay_payment_id,
                  amount: payableAmount,
                  gatewayFee: gatewayCharges,
                  billingCountry: billingCountry
                });

               sendNotification('PAYMENT_SUCCESS', {
                  name: user.name,
                  email: user.email,
                  amount: payableAmount,
                  plan: selectedPlan.name,
                  txnId: response.razorpay_payment_id
                });
                
                setIsProcessing(false);
                setStep('SUCCESS');
            } else {
                throw new Error('Payment verification failed');
            }

          } catch (error: any) {
            console.error(error.message || error);
            setIsProcessing(false);
            alert("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
            name: user.name,
            email: user.email,
            contact: user.mobileNumber || "",
        },
        theme: {
          color: "#000000",
        },
        modal: {
            ondismiss: function() {
                setIsProcessing(false);
            }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (error: any) {
      console.error(error);
      setIsProcessing(false);
      alert("Failed to initiate payment. Please try again.");
    }
  };

  const handleUpiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan || !user) return;
    if (!upiForm.txnId) return alert("Please enter Transaction ID");
    
    // Manual validation for screenshot
    if (!upiForm.screenshot) return alert("Please upload payment screenshot");
    
    setIsProcessing(true);

    try {
      let screenshotUrl: string | undefined = undefined;
      if (upiForm.screenshot) {
        screenshotUrl = await mockBackend.uploadFile(upiForm.screenshot, 'payments');
      }

      await mockBackend.purchasePlan(user.id, selectedPlan.id, {
        method: isIndianUser ? 'QR' : 'INTERNATIONAL', 
        txnId: upiForm.txnId,
        screenshotUrl: screenshotUrl, // Correct property name matching types.ts
        amount: payableAmount,
        gatewayFee: gatewayCharges,
        displayCurrency: displayPrice?.currency || targetCurrency || 'INR', 
        displayAmount: displayPrice?.amount || payableAmount,
        billingCountry: billingCountry
      });
      
      sendNotification('PAYMENT_SUCCESS', {
        name: user.name,
        email: user.email,
        amount: payableAmount,
        plan: selectedPlan.name,
        txnId: upiForm.txnId
      });

      setIsProcessing(false);
      setStep('SUCCESS');
    } catch (error: any) {
      console.error(error.message || error);
      setIsProcessing(false);
      alert("Payment submission failed. Please try again.");
    }
  };

  const getWhatsAppVerificationLink = () => {
    if (!selectedPlan) return '#';
    const text = isIndianUser 
        ? `Payment Completed - Sharing Details\n\nPlan: ${selectedPlan.name}\nAmount Paid: ₹${payableAmount}\nTransaction ID: ${upiForm.txnId || 'Online Payment'}\n\nPlease verify my subscription.`
        : `International Payment Request\n\nUser ID: ${user?.id}\nPlan: ${selectedPlan.name}\nCountry: ${billingCountry}\n\nI want to pay via Bank Transfer/Paypal. Please share details.`;
    
    const number = settings?.whatsappNumber?.replace('+', '') || '919452571317'; 
    return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
  };

  const articlePlans = plans.filter(p => p.type === 'ARTICLE_ACCESS');
  const blogPlans = plans.filter(p => p.type === 'BLOG_ACCESS');
  const toolPlans = plans.filter(p => p.type === 'TOOL_ACCESS');
  const comboPlan = plans.find(p => p.type === 'COMBO_ACCESS');

  const PlanCard: React.FC<{ plan: SubscriptionPlan }> = ({ plan }) => {
    const localPrice = user ? mockBackend.getDisplayPrice(plan.price, user.currency) : null;
    const showLocal = user && user.country !== 'IN' && localPrice;

    return (
        <motion.div 
        whileHover={{ y: -5 }}
        className="bg-white/40 backdrop-blur-xl border border-white/20 p-8 rounded-[2.5rem] shadow-premium flex flex-col group relative overflow-hidden"
        >
        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            {plan.type === 'ARTICLE_ACCESS' ? <FileText size={80} /> : 
             plan.type === 'BLOG_ACCESS' ? <PenTool size={80} /> :
             plan.type === 'TOOL_ACCESS' ? <Zap size={80} /> :
             <Star size={80} />}
        </div>
        
        <div className="mb-6">
            <h3 className="text-xl font-serif font-bold text-agri-primary group-hover:text-agri-secondary transition-colors">{plan.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-stone-400 text-[10px] font-black uppercase tracking-widest">Validity: {plan.validityLabel}</p>
              {plan.is_research_enabled && (
                <span className="bg-blue-100 text-blue-800 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Research Enabled
                </span>
              )}
            </div>
        </div>
        
        <div className="mb-8">
            {showLocal ? (
               <span className="text-4xl font-black text-agri-primary">{localPrice.symbol}{localPrice.amount.toLocaleString()}</span>
            ) : (
               <span className="text-4xl font-black text-agri-primary">₹{plan.price}</span>
            )}
            
            <span className="text-stone-400 text-xs font-bold uppercase tracking-tight ml-2">Total Tax Inc.</span>
            
            {!showLocal && user && user.country !== 'IN' && (
                <div className="mt-2 text-agri-secondary text-[10px] font-bold uppercase tracking-widest">
                    Login to view local price
                </div>
            )}
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
            onClick={(e) => handlePlanSelect(plan, e)}
            className="w-full bg-agri-primary text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-agri-secondary transition-all shadow-xl shadow-agri-primary/10 flex items-center justify-center gap-2"
        >
            Select Plan <ChevronRight size={14} />
        </button>
        </motion.div>
    );
  };

  return (
    <div className="min-h-screen pb-24 bg-agri-bg">
      <SEO 
        title="Subscription Plans | Agrigence"
        description="Choose a subscription plan that fits your agricultural research needs. Secure access to peer-reviewed publishing and exclusive content."
      />
      <div className="h-[40vh] relative overflow-hidden flex items-center justify-center bg-agri-primary">
         <div className="absolute inset-0">
            <OptimizedImage 
              src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80" 
              className="w-full h-full object-cover opacity-40" 
              alt="Wheat Field" 
              priority={true}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-agri-primary via-transparent to-transparent"></div>
         </div>
         <div className="relative z-10 text-center px-6">
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4">Pricing & Plans</h1>
            <p className="text-white/60 text-lg font-light max-w-xl mx-auto">Choose a plan that fits your research needs. Secure access to peer-reviewed publishing and exclusive content.</p>
         </div>
      </div>

      <div className="bg-white border-b border-agri-secondary/20 py-3 text-center sticky top-[80px] z-30 shadow-sm">
         <p className="text-[10px] font-black uppercase tracking-[0.25em] flex items-center justify-center gap-3 text-agri-primary">
           <Zap size={14} className="text-agri-secondary animate-pulse" />
           Instant Activation Available via Online Payment
         </p>
      </div>

      <div className="container mx-auto px-6 py-16">
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
                   <div className="flex items-center gap-2 mb-4">
                     {comboPlan.is_research_enabled && (
                       <span className="bg-blue-500/20 text-blue-200 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-blue-500/30">
                         Research Enabled
                       </span>
                     )}
                   </div>
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
                   
                   {/* Conditional Price Display for Combo */}
                   {user && user.country !== 'IN' && mockBackend.getDisplayPrice(comboPlan.price, user.currency) ? (
                        <div className="text-6xl font-black text-white mb-2 tracking-tighter">
                            {mockBackend.getDisplayPrice(comboPlan.price, user.currency)?.symbol}
                            {mockBackend.getDisplayPrice(comboPlan.price, user.currency)?.amount.toLocaleString()}
                        </div>
                   ) : (
                        <div className="text-6xl font-black text-white mb-2 tracking-tighter">₹{comboPlan.price}</div>
                   )}

                   <div className="text-agri-secondary font-serif italic text-lg mb-10">{comboPlan.validityLabel} Access</div>
                   <button 
                     onClick={(e) => handlePlanSelect(comboPlan, e)}
                     className="w-full bg-agri-secondary text-agri-primary py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-white transition-all shadow-2xl shadow-agri-secondary/20"
                   >
                     Get Combo Access
                   </button>
                </div>
             </motion.div>
          </div>
        )}

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

        {toolPlans.length > 0 && (
          <div className="mb-24">
             <div className="flex items-center gap-4 mb-12">
                <div className="h-px flex-1 bg-stone-200"></div>
                <h2 className="text-2xl font-serif font-bold text-agri-primary px-8">Researcher Tool Access</h2>
                <div className="h-px flex-1 bg-stone-200"></div>
             </div>
             <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {toolPlans.map(plan => <PlanCard key={plan.id} plan={plan} />)}
             </div>
          </div>
        )}

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

      <AnimatePresence>
        {selectedPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-agri-primary/80 backdrop-blur-md">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
             >
                <div className="bg-agri-primary p-8 text-white flex justify-between items-center relative overflow-hidden shrink-0">
                   <div className="absolute right-0 top-0 p-10 opacity-5">
                      <QrCode size={120} />
                   </div>
                   <div className="relative z-10">
                      <h2 className="text-2xl font-serif font-bold">{selectedPlan.name}</h2>
                      <p className="text-agri-secondary font-black text-[10px] uppercase tracking-widest mt-1 flex items-center gap-2">
                        <Smartphone size={12} fill="currentColor"/> {isIndianUser ? 'Secure Checkout' : 'International Transfer'}
                      </p>
                   </div>
                   <button onClick={() => setSelectedPlan(null)} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all relative z-10">
                      <X size={20} />
                   </button>
                </div>

                <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                   {step === 'DETAILS' ? (
                     <div className="space-y-8">
                        
                        {/* Country Selection Dropdown */}
                        <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200">
                            <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 block flex items-center gap-2">
                                <Globe size={12}/> Select Billing Country
                            </label>
                            <select 
                                value={billingCountry}
                                onChange={handleCountryChange}
                                className="w-full bg-white border border-stone-300 rounded-xl p-3 text-sm font-bold text-stone-700 outline-none focus:border-agri-secondary shadow-sm transition-all"
                            >
                                {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name} ({c.currency})</option>)}
                            </select>
                        </div>

                        <div className="bg-stone-50 rounded-[2rem] p-6 border border-stone-100">
                           <div className="mb-6">
                              <div className="flex justify-between items-center text-sm font-bold text-stone-500 mb-4">
                                <span>Base Plan Cost</span>
                                <span>
                                    {isIndianUser 
                                        ? `₹${selectedPlan.price}` 
                                        : `${displayPrice?.symbol || ''}${displayPrice?.amount.toLocaleString() || ''} ${displayPrice?.currency || targetCurrency}`}
                                </span>
                              </div>
                              <div className="h-px bg-stone-200 my-2"></div>
                              <div className="flex justify-between items-center">
                                 <span className="font-serif font-bold text-lg text-agri-primary">Total to Pay</span>
                                 <span className="text-3xl font-black text-agri-primary">
                                    {isIndianUser 
                                        ? `₹${selectedPlan.price}` 
                                        : `${displayPrice?.symbol || ''}${displayPrice?.amount.toLocaleString() || ''}`}
                                 </span>
                              </div>
                              {paymentMode === 'MANUAL' && (
                                <p className="text-[9px] text-stone-400 text-right uppercase font-bold mt-1">Manual Pay includes verification delays</p>
                              )}
                           </div>
                        </div>

                        {isIndianUser && (
                            <div className="flex bg-stone-100 p-1 rounded-xl">
                                <button 
                                    onClick={() => setPaymentMode('ONLINE')}
                                    className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${paymentMode === 'ONLINE' ? 'bg-white shadow-sm text-agri-primary' : 'text-stone-400 hover:text-stone-600'}`}
                                >
                                    Razorpay
                                </button>
                                <button 
                                    onClick={() => setPaymentMode('MANUAL')}
                                    className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${paymentMode === 'MANUAL' ? 'bg-white shadow-sm text-agri-primary' : 'text-stone-400 hover:text-stone-600'}`}
                                >
                                    QR Code
                                </button>
                            </div>
                        )}

                        {paymentMode === 'ONLINE' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="bg-white border border-stone-200 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                                    <div className="w-16 h-16 bg-agri-primary/5 rounded-full flex items-center justify-center mb-4">
                                        <CreditCard size={24} className="text-agri-primary" />
                                    </div>
                                    <h4 className="font-bold text-stone-800 mb-2">Secure Online Payment</h4>
                                    <p className="text-xs text-stone-500 mb-6">Pay instantly via UPI, Credit/Debit Card, or NetBanking using Razorpay.</p>
                                    
                                    <button 
                                        onClick={handleOnlinePayment}
                                        disabled={isProcessing || !razorpayLoaded}
                                        className="w-full bg-agri-primary text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-agri-secondary transition-all shadow-xl shadow-agri-primary/20 flex items-center justify-center gap-3"
                                    >
                                        {isProcessing ? 'PROCESSING...' : `PAY ₹${payableAmount} NOW`}
                                    </button>
                                </div>
                            </div>
                        )}

                        {paymentMode === 'MANUAL' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                                
                                {isIndianUser ? (
                                    // INDIAN MANUAL FLOW
                                    <div className="flex flex-col md:flex-row items-center gap-8">
                                        <div className="bg-white p-3 rounded-2xl shadow-sm border border-stone-100 shrink-0">
                                            {(() => {
                                                const upiId = settings?.upiId || 'agrigence@upi';
                                                const isDynamic = settings?.upiQrUrl?.includes('api.qrserver.com');
                                                const manualAmount = payableAmount; 
                                                const qrSrc = !isDynamic && settings?.upiQrUrl 
                                                    ? settings.upiQrUrl 
                                                    : `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=upi://pay?pa=${upiId}&pn=Agrigence&am=${manualAmount}&cu=INR`;
                                                
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
                                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Scan to Pay ₹{payableAmount}</p>
                                            <div className="bg-stone-100 border border-stone-200 rounded-xl p-3 flex items-center justify-between font-mono text-xs font-bold text-stone-600 mb-2">
                                                <span>{settings?.upiId || 'agrigence@upi'}</span>
                                                <Zap size={12} className="text-agri-secondary"/>
                                            </div>
                                            <p className="text-[9px] text-stone-400 font-bold uppercase">Manual Verification Required (12-24 Hrs)</p>
                                        </div>
                                    </div>
                                ) : (
                                    // INTERNATIONAL MANUAL FLOW
                                    <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl">
                                        <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                                            <Globe size={16} /> International Payment Required
                                        </h4>
                                        <p className="text-xs text-blue-700 leading-relaxed mb-6">
                                            To complete your subscription from <strong>{selectedCountryObj.name}</strong>, please contact our support team. We will guide you through a secure bank transfer or PayPal transaction.
                                        </p>
                                        <a 
                                            href={getWhatsAppVerificationLink()} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="w-full bg-[#25D366] text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#20bd5a] transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
                                        >
                                            <MessageCircle size={16} /> Get Payment Instructions
                                        </a>
                                    </div>
                                )}

                                <form onSubmit={handleUpiSubmit} className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 block">Transaction ID / Ref No</label>
                                            <input 
                                            required
                                            value={upiForm.txnId}
                                            onChange={e => setUpiForm({...upiForm, txnId: e.target.value})}
                                            placeholder="Enter Reference Number"
                                            className="w-full bg-stone-50 border border-stone-200 p-4 rounded-xl focus:ring-2 focus:ring-agri-secondary/20 outline-none text-sm font-bold"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 block">Payment Proof</label>
                                            <div className="relative group">
                                                <input 
                                                type="file" 
                                                accept="image/*"
                                                // IMPORTANT: Removed 'required' attribute to fix browser validation issue with hidden input
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                onChange={e => setUpiForm({...upiForm, screenshot: e.target.files?.[0] || null})}
                                                />
                                                <div className="w-full bg-stone-50 border-2 border-dashed border-stone-200 p-4 rounded-xl text-center group-hover:bg-white transition-all flex items-center justify-center gap-3 h-[54px]">
                                                <UploadCloud size={16} className="text-agri-secondary" />
                                                <span className="text-[10px] font-black uppercase text-stone-500 truncate max-w-[100px]">
                                                    {upiForm.screenshot ? 'Attached' : "Upload Screenshot"}
                                                </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <button 
                                        type="submit" 
                                        disabled={isProcessing}
                                        className="w-full bg-agri-secondary text-agri-primary py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-agri-primary hover:text-white transition-all shadow-xl shadow-agri-secondary/20 flex items-center justify-center gap-3"
                                    >
                                        {isProcessing ? 'VERIFYING...' : `SUBMIT PAYMENT DETAILS`}
                                    </button>
                                </form>
                            </div>
                        )}
                     </div>
                   ) : (
                     <div className="text-center py-10">
                        <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-300">
                           <CheckCircle size={40} />
                        </div>
                        <h3 className="text-2xl font-serif font-bold text-agri-primary mb-4">
                            {paymentMode === 'ONLINE' ? 'Plan Activated!' : 'Request Submitted'}
                        </h3>
                        <p className="text-stone-500 text-sm leading-relaxed mb-8 max-w-md mx-auto">
                           {paymentMode === 'ONLINE' 
                             ? "Your payment was successful and your subscription is now active. You can start submitting articles immediately."
                             : "Your payment details have been received. To speed up verification, please share your confirmation on WhatsApp."}
                        </p>
                        
                        {paymentMode === 'MANUAL' && (
                            <a 
                            href={getWhatsAppVerificationLink()} 
                            target="_blank" 
                            rel="noreferrer"
                            className="block w-full bg-[#25D366] text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-[#20bd5a] transition-all shadow-lg shadow-green-500/20 mb-4 flex items-center justify-center gap-2"
                            >
                            <MessageCircle size={16} /> Share on WhatsApp
                            </a>
                        )}

                        <button 
                           onClick={() => navigate('/dashboard')}
                           className="text-stone-400 font-bold text-xs uppercase tracking-widest hover:text-agri-primary transition-colors"
                        >
                           Return to Dashboard
                        </button>
                     </div>
                   )}
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Subscription;