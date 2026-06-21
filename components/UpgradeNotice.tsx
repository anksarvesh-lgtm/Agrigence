import React from 'react';
import { Lock, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface UpgradeNoticeProps {
  title?: string;
  message?: string;
  type?: 'tools' | 'history' | 'general' | 'research';
}

const UpgradeNotice: React.FC<UpgradeNoticeProps> = ({ 
  title = "Pass Feature Locked", 
  message = "Your current Pass plan has expired or doesn't include access to this feature. Renew your Pass to continue your research.",
  type = 'general'
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-amber-100 rounded-2xl p-8 text-center shadow-sm max-w-2xl mx-auto"
    >
      <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <Lock className="w-8 h-8 text-amber-600" />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-3">{title}</h2>
      <p className="text-gray-600 mb-8 leading-relaxed">
        {message}
      </p>
      
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link 
          to="/subscription" 
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 w-full sm:w-auto justify-center"
        >
          <Zap className="w-4 h-4 fill-current" />
          Renew Pass
          <ArrowRight className="w-4 h-4" />
        </Link>
        
        <Link 
          to="/about-contact" 
          className="px-6 py-3 text-gray-600 font-medium hover:text-gray-900 transition-colors w-full sm:w-auto"
        >
          Contact Support
        </Link>
      </div>
      
      {type === 'history' && (
        <p className="mt-8 text-sm text-gray-400 italic">
          * Your data is safe and will be restored immediately upon renewal.
        </p>
      )}
    </motion.div>
  );
};

export default UpgradeNotice;
