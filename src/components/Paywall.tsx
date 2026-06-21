import React, { useState } from 'react';
import { Lock, Sparkles, Check, Loader2, CreditCard, Shield, X, AlertTriangle } from 'lucide-react';
import { useAuth } from '../authContext';
import { useSubscription, PlanInfo } from '../hooks/useSubscription';
import { useNavigate } from 'react-router-dom';
import { getRelevantPlans } from '../hooks/useExamAccess';

interface PaywallProps {
  content?: any;
  reason?: 'login' | 'not_invited' | 'expired' | 'upgrade' | string;
  onClose?: () => void;
  // Legacy support props
  contentId?: string;
  contentType?: 'mock-test' | 'exam-prep' | 'article' | 'blog' | 'tool';
  examId?: string;
  examName?: string;
  title?: string;
  description?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const Paywall: React.FC<PaywallProps> = ({
  content,
  reason,
  onClose,
  contentId,
  contentType = 'mock-test',
  examId,
  examName,
  title,
  description,
  onSuccess,
  onCancel
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { plans, subscription } = useSubscription();
  const [selectedPlanId, setSelectedPlanId] = useState<string>('quarterly');
  const [isProcessing, setIsProcessing] = useState(false);

  // Fallback plans if not populated from Firestore yet
  const defaultPlans: PlanInfo[] = [
    {
      id: "free",
      name: "Free",
      price: 0,
      duration: null,
      color: "#4a6356",
      features: [
        "5 questions per day",
        "2 mock tests per month",
        "Basic performance stats"
      ],
      limits: {
        questionsPerDay: 5,
        testsPerMonth: 2,
        canViewExplanations: false,
        canDownload: false,
        canAccessPYQ: false
      }
    },
    {
      id: "monthly",
      name: "Pro Monthly",
      price: 99,
      duration: 30,
      color: "#2d8a52",
      features: [
        "Unlimited questions",
        "All mock tests",
        "Full explanations",
        "Performance analytics"
      ],
      limits: {
        questionsPerDay: -1,
        testsPerMonth: -1,
        canViewExplanations: true,
        canDownload: false,
        canAccessPYQ: true
      }
    },
    {
      id: "quarterly",
      name: "Pro Quarterly",
      price: 249,
      duration: 90,
      color: "#1a6b3a",
      popular: true,
      features: [
        "Everything in Monthly",
        "Download question banks",
        "Offline mode",
        "Priority support"
      ],
      limits: {
        questionsPerDay: -1,
        testsPerMonth: -1,
        canViewExplanations: true,
        canDownload: true,
        canAccessPYQ: true
      }
    },
    {
      id: "annual",
      name: "Pro Annual",
      price: 799,
      duration: 365,
      color: "#0f4225",
      features: [
        "Everything in Quarterly",
        "Early access to content",
        "Certificate of completion"
      ],
      limits: {
        questionsPerDay: -1,
        testsPerMonth: -1,
        canViewExplanations: true,
        canDownload: true,
        canAccessPYQ: true
      }
    }
  ];

  const activePlans = (plans && plans.length > 0) ? plans : defaultPlans;
  const paidPlans = activePlans.filter(p => p.price > 0);

  // Filter plans based on content's required plan if specified
  const targetExamId = examId || content?.examId || content?.examTarget;

  let relevantPlans = paidPlans;
  if (targetExamId) {
    relevantPlans = getRelevantPlans(targetExamId, paidPlans as any) as any;
  } else if (content?.accessControl?.plans?.length > 0) {
    const requiredPlans = content.accessControl.plans;
    relevantPlans = paidPlans.filter(p => requiredPlans.includes(p.id));
  }
  if (relevantPlans.length === 0) relevantPlans = paidPlans; // Fallback so we don't break UI

  // Sync selectedPlanId if not in relevantPlans or if it's the first render
  React.useEffect(() => {
    if (relevantPlans.length > 0 && !relevantPlans.some(p => p.id === selectedPlanId)) {
      setSelectedPlanId(relevantPlans[0].id);
    }
  }, [relevantPlans, selectedPlanId]);

  const activeSelectedPlan = activePlans.find(p => p.id === selectedPlanId) || relevantPlans[0] || paidPlans[0];

  const handlePayNow = async () => {
    if (!user) {
      alert("Please login to purchase a subscription pass.");
      navigate('/login');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Create order on backend via payments route
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlanId,
          userId: user.id
        })
      });

      if (!res.ok) {
        throw new Error('Failed to create purchase order on server.');
      }

      const orderData = await res.json();

      // 2. Open Razorpay checkout
      const options = {
        key: orderData.keyId,
        amount: orderData.amount * 100, // in paise
        currency: orderData.currency || 'INR',
        name: 'AgriTest Prep',
        description: `Upgrade Pass: ${activeSelectedPlan.name}`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            setIsProcessing(true);
            // 3. Verify Payment
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                userId: user.id,
                planId: selectedPlanId
              })
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success || verifyData.status === 'success') {
              if (onSuccess) {
                onSuccess();
              } else if (onClose) {
                alert('Success! Subscription granted.');
                onClose();
                window.location.reload();
              } else {
                alert('Purchase successful! Plan activated.');
                window.location.reload();
              }
            } else {
              alert('Verification failed. Contact support for offline verification.');
            }
          } catch (error: any) {
            console.error("Verification error:", error);
            alert("Verification failed: " + error.message);
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: user.name || '',
          email: user.email || '',
        },
        theme: {
          color: '#1a6b3a'
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error("Razorpay checkout initiation error:", err);
      alert("Failed to connect with payment gateway: " + err.message);
      setIsProcessing(false);
    }
  };

  const handleClose = onClose || onCancel;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md font-sans">
      <div className="relative bg-[#faf9f6] border border-stone-200 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[92vh] text-stone-800 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        {handleClose && (
          <button 
            type="button"
            onClick={handleClose}
            className="absolute top-5 right-5 p-2 text-stone-400 hover:text-stone-900 rounded-full hover:bg-stone-100 border border-stone-200 transition-all z-10"
          >
            <X size={16} />
          </button>
        )}

        {/* Header Block with Lock Icon */}
        <div className="p-8 pb-4 shrink-0 text-center space-y-2.5 bg-gradient-to-b from-[#e8f5ee]/40 to-transparent">
          <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <Lock size={20} className="text-[#1a6b3a]" />
          </div>
          <h3 className="text-xl font-bold font-serif text-stone-900">
            {reason === 'expired' ? 'Subscription Expired' : (title || 'Premium Plan Required')}
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
            {examName ? `Unlock full access to ${examName} by upgrading your plan below.` :
             content?.name || content?.bankName
              ? `"${content.name || content.bankName}" requires an active membership to access all items.`
              : (description || 'Unlock advanced study planners, analytical scorecards, and unlimited questions.')}
          </p>

          {reason === 'expired' && subscription?.endDate && (
            <div className="text-[10px] text-red-600 font-bold bg-red-50 py-1.5 px-3 rounded-full inline-block">
              Expired on {new Date(subscription.endDate).toLocaleDateString('en-IN')}
            </div>
          )}
        </div>

        {/* Content Body: Plan selector */}
        <div className="flex-1 overflow-y-auto px-8 py-2 progress-scrollbar space-y-4">
          <div className="space-y-2.5">
            {relevantPlans.map((plan) => (
              <div 
                key={plan.id}
                onClick={() => setSelectedPlanId(plan.id)}
                className={`relative p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  selectedPlanId === plan.id 
                    ? 'bg-emerald-50/40 border-[#1a6b3a] shadow-md shadow-emerald-500/5' 
                    : 'bg-white border-stone-200 hover:border-stone-300'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-3 right-4 bg-[#1a6b3a] text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                    MOST POPULAR
                  </div>
                )}
                
                <div className="flex items-center justify-between w-full">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        selectedPlanId === plan.id ? 'border-[#1a6b3a]' : 'border-stone-300'
                      }`}>
                        {selectedPlanId === plan.id && <div className="w-2 h-2 rounded-full bg-[#1a6b3a]" />}
                      </div>
                      <span className="font-bold text-stone-900 text-sm">{plan.name}</span>
                    </div>
                    <div className="text-[10px] text-stone-500 mt-1 pl-6 leading-snug">
                      {plan.features.slice(0, 2).map(f => f).join(' • ')}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-black text-lg text-[#1a6b3a]">₹{plan.price}</div>
                    <div className="text-[9px] text-stone-400 font-mono">
                      {plan.duration === 30 ? '/month'
                        : plan.duration === 90 ? '/3 months'
                        : plan.duration === 365 ? '/year'
                        : '/term'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Free preview questions alert */}
          {content?.accessControl?.freePreviewQuestions > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center text-xs text-amber-800 font-medium">
              🎁 Dynamic Free Try: You can answer up to {content.accessControl.freePreviewQuestions} questions for free.
            </div>
          )}

          {/* Secure transaction info */}
          <div className="bg-stone-50 border border-stone-200 p-3 rounded-2xl flex items-center gap-2.5">
            <Shield size={16} className="text-[#1a6b3a] shrink-0" />
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-stone-800">Secure Razorpay Processing</p>
              <p className="text-[9px] text-stone-500">Transactions are encrypted and activated instantly.</p>
            </div>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="p-6 border-t border-stone-100 shrink-0 bg-stone-50 flex items-center justify-between">
          <button 
            type="button"
            onClick={handleClose || (() => navigate('/'))}
            className="text-xs font-bold text-stone-400 hover:text-stone-700 uppercase tracking-wider"
          >
            Cancel
          </button>
          
          <button
            onClick={handlePayNow}
            disabled={isProcessing}
            className="bg-[#1a6b3a] text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-[#0f4225] transition-all shadow-md disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="animate-spin" size={13} /> Processing...
              </>
            ) : (
              <>
                <CreditCard size={13} /> Subscribe Now • ₹{activeSelectedPlan?.price}
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Paywall;
