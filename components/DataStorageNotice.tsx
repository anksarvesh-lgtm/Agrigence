import React from 'react';
import { Database, Clock, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../src/authContext';
import { isPlanExpired } from '../utils/planAccess';

const DataStorageNotice: React.FC = () => {
  const { user, planDetails } = useAuth();
  const isSubscribed = user && planDetails && planDetails.id !== 'free' && !isPlanExpired(user);

  return (
    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Database size={120} className="text-blue-500" />
      </div>
      
      <div className="relative z-10">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
            <Database size={20} />
          </div>
          <h3 className="text-lg font-serif font-bold text-blue-900">Data Storage Notice</h3>
          {isSubscribed ? (
            <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest flex items-center gap-1">
              <ShieldCheck size={12} /> Secure Storage Active
            </span>
          ) : (
            <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest flex items-center gap-1">
              <Clock size={12} /> Temporary Session
            </span>
          )}
        </div>

        <p className="text-sm text-blue-800/80 leading-relaxed max-w-3xl">
          If a user has an active subscription, the data generated while using tools on this platform will be securely stored for up to <span className="font-bold">365 days (1 year)</span>. The user can access and use this stored data anytime during their active plan validity.
        </p>

        {!isSubscribed && (
          <div className="mt-4 flex items-start gap-2 text-xs text-amber-700 bg-amber-50/50 p-3 rounded-lg border border-amber-100 max-w-fit">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <p>
              <strong>Public User Notice:</strong> Data created without a subscription is temporary and will be automatically deleted within 30 minutes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataStorageNotice;
