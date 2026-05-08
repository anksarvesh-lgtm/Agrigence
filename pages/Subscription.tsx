import React, { useState, useEffect } from 'react';
import { Check, Loader2 } from 'lucide-react';
import SEO from '../components/SEO';
import PaymentDialog from '../components/PaymentDialog';
import { useNavigate } from 'react-router-dom';
import { mockBackend } from '../services/mockBackend';
import { SubscriptionPlan } from '../types';

const Subscription: React.FC = () => {
    const navigate = useNavigate();
    const [selectedPlan, setSelectedPlan] = useState<any>(null);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                // Fetch dynamic plans from the mock backend
                const fetchedPlans = await mockBackend.getPlans();
                setPlans(fetchedPlans.filter(p => p.isActive));
            } catch (error) {
                console.error("Failed to fetch plans", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPlans();
    }, []);

    const handlePayNow = (plan: SubscriptionPlan) => {
        setSelectedPlan({
            id: plan.id,
            name: plan.name,
            price: plan.price
        });
        setIsPaymentOpen(true);
    };

  return (
    <div className="min-h-screen py-20 bg-stone-50">
      <SEO 
        title="Subscription & Access | Agrigence"
        description="Flexible subscription plans for accessing high-quality agricultural research."
      />
      
      <div className="container mx-auto px-6 max-w-6xl">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-agri-primary text-center mb-16">Subscription & Article Access</h1>

        {isLoading ? (
            <div className="flex justify-center items-center py-20">
                <Loader2 size={48} className="text-agri-primary animate-spin" />
            </div>
        ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
                {plans.map((plan, i) => (
                    <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200 flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <h3 className="text-xl font-bold text-agri-primary mb-2 line-clamp-2 min-h-[3.5rem]">{plan.name}</h3>
                        <div className="text-4xl font-black text-agri-primary my-6">₹{plan.price}<span className="text-sm text-stone-500 font-normal">/-</span></div>
                        <p className="text-xs font-bold text-agri-secondary uppercase tracking-widest mb-6">Validity: {plan.validityLabel}</p>
                        
                        <ul className="space-y-4 mb-10 flex-1">
                            {plan.features.map((feature, j) => (
                                <li key={j} className="flex items-start gap-3 text-sm text-stone-600">
                                    <Check size={16} className="text-green-500 mt-1 shrink-0" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <button 
                            onClick={() => handlePayNow(plan)}
                            className="w-full bg-agri-primary text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-agri-secondary transition-all active:scale-95"
                        >
                            Pay Now
                        </button>
                    </div>
                ))}
            </div>
        )}

        {selectedPlan && (
            <PaymentDialog 
                isOpen={isPaymentOpen}
                onClose={() => setIsPaymentOpen(false)}
                plan={selectedPlan}
                onSuccess={() => {
                    setTimeout(() => {
                        navigate('/dashboard');
                    }, 2000);
                }}
            />
        )}

        <div className="bg-white p-12 rounded-3xl shadow-sm border border-stone-200 mb-20">
            <h2 className="text-2xl font-serif font-bold text-agri-primary mb-10">Payment Options</h2>
            <p className="text-stone-600 mb-8">We accept a wide range of payment methods for your convenience:</p>
            <div className="flex flex-wrap gap-6 items-center justify-center p-8 bg-stone-100 rounded-2xl">
                {['UPI', 'Razorpay', 'PhonePe', 'Google Pay', 'Paytm', 'Debit/Credit Card', 'Net Banking'].map(method => (
                    <div key={method} className="bg-white px-6 py-3 rounded-lg font-bold text-sm text-agri-primary shadow-sm border border-stone-200">
                        {method}
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
