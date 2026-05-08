import React from 'react';
import { Check, Star, ShieldCheck, Zap, Mail, MessageCircle, FileText, PenTool } from 'lucide-react';
import SEO from '../components/SEO';

const Subscription: React.FC = () => {
    
    const plans = [
        { name: 'Single Article Subscription', price: '149', validity: '1 Article', features: ['Full article PDF access', 'Research download access', 'Citation-ready format'] },
        { name: 'Annual Subscription', price: '499', validity: '8 Articles OR 12 Months', features: ['Multi-article access', 'Current issue access', 'Archive access during subscription period', 'Priority research updates'] },
        { name: 'Lifetime Subscription', price: '1999', validity: '5 Years', features: ['Extended research access', 'Current and archived issue access', 'Priority journal notifications', 'Academic resource access'] },
        { name: 'Institute / Library Subscription', price: '4999', validity: '5 Years', features: ['Institutional research access', 'Multi-user academic usage', 'Journal archive availability', 'Institutional support access'] },
    ];

  return (
    <div className="min-h-screen py-20 bg-stone-50">
      <SEO 
        title="Subscription & Access | Agrigence"
        description="Flexible subscription plans for accessing high-quality agricultural research."
      />
      
      <div className="container mx-auto px-6 max-w-6xl">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-agri-primary text-center mb-16">Subscription & Article Access</h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {plans.map((plan, i) => (
                <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200 flex flex-col">
                    <h3 className="text-xl font-bold text-agri-primary mb-2 line-clamp-2">{plan.name}</h3>
                    <div className="text-4xl font-black text-agri-primary my-6">₹{plan.price}<span className="text-sm text-stone-500 font-normal">/-</span></div>
                    <p className="text-xs font-bold text-agri-secondary uppercase tracking-widest mb-6">Validity: {plan.validity}</p>
                    
                    <ul className="space-y-4 mb-10 flex-1">
                        {plan.features.map((feature, j) => (
                            <li key={j} className="flex items-start gap-3 text-sm text-stone-600">
                                <Check size={16} className="text-green-500 mt-1 shrink-0" />
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>

                    <button className="w-full bg-agri-primary text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-agri-secondary transition-all">
                        Pay Now
                    </button>
                </div>
            ))}
        </div>

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
