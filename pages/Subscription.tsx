import React, { useState, useEffect } from "react";
import { useAuth } from "../src/authContext";
import { mockBackend } from "../services/mockBackend";
import { SubscriptionPlan } from "../types";
import { CheckCircle, Crown, CreditCard, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Subscription() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const allPlans = await mockBackend.getPlans();
      // Normally filter active ones, testing showing all
      setPlans(allPlans.filter((p: SubscriptionPlan) => p.isActive !== false));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (plan: SubscriptionPlan) => {
    if (!user) {
      alert("Please login first");
      navigate("/login");
      return;
    }

    if (plan.price === 0) {
      try {
        await mockBackend.processOnlinePayment(
          user.id,
          plan.id,
          "free_activation_" + Date.now(),
          0,
        );
        alert("Free Plan activated successfully!");
        navigate("/dashboard");
      } catch (e) {
        console.error(e);
        alert("Error activating plan.");
      }
      return;
    }

    initiateRazorpay(plan);
  };

  const initiateRazorpay = async (plan: SubscriptionPlan) => {
    const options = {
      key: "rzp_test_YourTestKeyHere", // mock/test key
      amount: plan.price * 100, // paise
      currency: "INR",
      name: "Agrigence Exam Platform",
      description: plan.name + " Access",
      handler: async function (response: any) {
        if (user) {
          try {
            await mockBackend.processOnlinePayment(
              user.id,
              plan.id,
              response.razorpay_payment_id,
              plan.price,
            );
            alert("Your Pass has been activated successfully!");
            navigate("/dashboard");
          } catch (e) {
            console.error(e);
            alert("Error processing activation. Contact support.");
          }
        }
      },
      prefill: {
        name: user?.name || "",
        email: user?.email || "",
        contact: user?.mobileNumber || "",
      },
      theme: {
        color: "#10b981",
      },
    };
    if (!(window as any).Razorpay) {
      alert("Razorpay SDK not loaded");
      return;
    }
    const rzp1 = new (window as any).Razorpay(options);
    rzp1.on("payment.failed", function (response: any) {
      alert("Payment Failed: " + response.error.description);
    });
    rzp1.open();
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center text-slate-400">
        Loading plans...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 py-12 px-6">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-4 pt-10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20">
              <ShieldCheck size={32} className="text-amber-500" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white">
            Upgrade to Agrigence{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
              Pro Pass
            </span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base">
            Get unlimited access to mock tests, AI mentor, premium current
            affairs, and comprehensive revision tools tailored to your
            agriculture exams.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 relative hover:border-emerald-500/50 transition-colors group flex flex-col"
            >
              {plan.isRecommended && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-emerald-500/25">
                  Most Popular
                </div>
              )}

              <div className="mb-6 flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {plan.name}
                  </h3>
                  <span className="text-xs text-slate-400 font-medium">
                    Valid for{" "}
                    {plan.validityLabel || `${plan.durationMonths} Months`}
                  </span>
                </div>
                <Crown
                  className={
                    plan.isRecommended ? "text-amber-400" : "text-emerald-500"
                  }
                  size={28}
                />
              </div>

              <div className="mb-8">
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-4xl font-black text-white">
                    ₹{plan.price}
                  </span>
                </div>
                <p className="text-sm text-slate-400">{plan.description}</p>
              </div>

              <div className="flex-1 space-y-4 mb-8">
                {plan.features?.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle
                      size={18}
                      className="text-emerald-500 shrink-0 mt-0.5"
                    />
                    <span className="text-sm text-slate-300">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleCheckout(plan)}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${plan.isRecommended || plan.price > 0 ? "bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-xl shadow-emerald-900/40 hover:scale-[1.02]" : "bg-slate-800 text-white hover:bg-slate-700"}`}
              >
                <CreditCard size={18} />{" "}
                {plan.price === 0 ? "Get Started" : `Buy ${plan.name}`}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
