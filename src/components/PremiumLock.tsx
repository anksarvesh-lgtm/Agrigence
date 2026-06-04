import React from 'react';
import { Lock, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const PremiumLock: React.FC<{ title?: string }> = ({ title = "Premium AI Feature" }) => {
  return (
    <div className="max-w-3xl mx-auto mt-12 p-8 bg-white rounded-3xl shadow-sm border border-purple-100 text-center">
      <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <Lock className="w-10 h-10 text-purple-600" />
      </div>
      <h2 className="text-3xl font-serif font-bold text-stone-800 mb-4 flex items-center justify-center gap-2">
        {title} <Sparkles className="text-purple-500" size={24} />
      </h2>
      <p className="text-stone-600 mb-8 max-w-md mx-auto">
        This advanced AI-powered tool is available exclusively to our premium subscribers. Upgrade your plan to unlock this and other powerful features.
      </p>
      <Link 
        to="/subscription" 
        className="inline-flex items-center justify-center px-8 py-4 bg-purple-600 text-white font-bold rounded-2xl hover:bg-purple-700 transition-colors"
      >
        View Subscription Plans
      </Link>
    </div>
  );
};

export default PremiumLock;
