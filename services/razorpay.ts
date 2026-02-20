
// This service handles the Razorpay checkout flow securely
import { User, SubscriptionPlan } from '../types';
import { mockBackend } from './mockBackend';

interface RazorpayOptions {
  key: string;
  amount: string | number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id: string;
  handler: (response: any) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes: {
    address: string;
  };
  theme: {
    color: string;
  };
}

// Helper to load the Razorpay script dynamically
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const triggerRazorpayPayment = async (
  user: User, 
  plan: SubscriptionPlan
): Promise<void> => {
  
  const res = await loadRazorpayScript();
  if (!res) {
    alert('Razorpay SDK failed to load. Are you online?');
    return;
  }

  try {
    // 1. Create Order on Backend (Dynamic Keys Handled Server-Side)
    const orderData = await mockBackend.startPaymentSession(user.id, plan.id);

    if (!orderData.success) {
      throw new Error(orderData.error || 'Server error creating order');
    }

    // 2. Configure Options
    const options: RazorpayOptions = {
      key: orderData.key_id, // Key ID from backend response
      amount: orderData.amount,
      currency: orderData.currency,
      name: "Agrigence",
      description: `Upgrade to ${plan.name}`,
      image: "https://agrigence.com/logo.png", // Replace with your logo URL
      order_id: orderData.order_id,
      handler: async function (response: any) {
        // 3. Verify Payment on Backend
        try {
          const backendUrl = 'https://agrigence-455779719985.us-west1.run.app';
          const verifyResponse = await fetch(`${backendUrl}/api/payment/verify-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              userId: user.id,
              planId: plan.id
            })
          });

          const verifyData = await verifyResponse.json();

          if (verifyData.success) {
            alert("Payment Successful! Plan Upgraded.");
            window.location.reload(); // Reload to reflect new plan status
          } else {
            alert("Payment verification failed. Please contact support.");
          }
        } catch (err) {
          console.error("Verification API Error", err);
          alert("Network error during verification. Your payment may have been processed.");
        }
      },
      prefill: {
        name: user.name,
        email: user.email,
        contact: user.mobileNumber || user.phone || ''
      },
      notes: {
        address: "Agrigence Corporate Office"
      },
      theme: {
        color: "#3D2B1F" // Your primary brand color
      }
    };

    // 4. Open Modal
    const paymentObject = new window.Razorpay(options);
    paymentObject.on('payment.failed', function (response: any) {
        console.error(response.error);
        alert(`Payment Failed: ${response.error.description}`);
    });
    paymentObject.open();

  } catch (error: any) {
    console.error("Payment Initiation Error:", error);
    alert(error.message || "Could not initiate payment.");
  }
};

// Legacy Export Alias if needed
export const upgradeUserPlan = triggerRazorpayPayment;
