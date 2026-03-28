import React, { useEffect, useState } from "react";
import { mockBackend } from "../services/mockBackend";
import { useAuth } from "../App";
import { SubscriptionPlan } from "../types";
import { CreditCard } from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Checkout = ({
  finalTotal,
  selectedPlan,
}: {
  finalTotal: number;
  selectedPlan: SubscriptionPlan;
}) => {
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  // Load Razorpay script dynamically
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

  // Razorpay Payment Flow (Online Only)
  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!razorpayLoaded) {
      alert("Payment gateway failed to load.");
      return;
    }

    if (!user) {
      alert("Session expired. Please login again.");
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Create Order from Backend
      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: finalTotal,
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
        name: "Agrigence Journal",
        description: `Plan Upgrade: ${selectedPlan.name}`,
        order_id: order.id, // Pass the order ID
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
               window.location.href = "/dashboard?payment=success";
            } else {
               window.location.href = "/dashboard?payment=failed";
            }

          } catch (error: any) {
            console.error(error.message || error);
            alert("Payment verification failed.");
            window.location.href = "/dashboard?payment=failed";
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.mobileNumber || "",
        },
        theme: {
          color: "#16a34a", // agri-primary color
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error(error);
      setIsProcessing(false);
      alert("Failed to initiate payment.");
    }
  };

  return (
    <form onSubmit={handlePayment}>
      <button 
        type="submit" 
        disabled={isProcessing}
        className="w-full bg-agri-primary text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-agri-secondary transition-colors shadow-lg shadow-agri-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isProcessing ? (
          <span className="animate-pulse">Processing...</span>
        ) : (
          <>
            <CreditCard size={18} /> Pay ₹{finalTotal}
          </>
        )}
      </button>
    </form>
  );
};

export default Checkout;
