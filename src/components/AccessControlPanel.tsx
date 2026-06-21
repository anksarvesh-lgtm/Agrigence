import React from 'react';
import { Shield, Sparkles, Mail, Eye, Check } from 'lucide-react';

export interface AccessControlState {
  type: 'all' | 'plan_based' | 'specific_users';
  plans: string[];
  freePreviewQuestions: number;
  specificUserIds?: string[];
  emails?: string[];
}

interface AccessControlPanelProps {
  access: AccessControlState;
  onChange: (updated: AccessControlState) => void;
}

export const AccessControlPanel: React.FC<AccessControlPanelProps> = ({ access, onChange }) => {
  const handleTypeChange = (type: 'all' | 'plan_based' | 'specific_users') => {
    onChange({
      ...access,
      type,
    });
  };

  const handlePlanToggle = (plan: string) => {
    const plans = access.plans.includes(plan)
      ? access.plans.filter(p => p !== plan)
      : [...access.plans, plan];
    onChange({
      ...access,
      plans,
    });
  };

  const handlePreviewChange = (val: number) => {
    onChange({
      ...access,
      freePreviewQuestions: Math.max(0, val),
    });
  };

  const handleEmailsChange = (eText: string) => {
    const list = eText.split(',').map(e => e.trim()).filter(Boolean);
    onChange({
      ...access,
      emails: list,
    });
  };

  const emailsString = access.emails ? access.emails.join(', ') : '';

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-5 shadow-sm text-stone-800 font-sans">
      
      {/* Panel Header */}
      <div className="flex items-center gap-2.5 border-b border-stone-100 pb-3">
        <div className="p-2 bg-[#e8f5ee] text-[#1a6b3a] rounded-xl">
          <Shield size={18} />
        </div>
        <div>
          <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider">Access Access Control Policies</h4>
          <p className="text-[10px] text-stone-400">Configure gating policies, free try thresholds, and restricted accounts.</p>
        </div>
      </div>

      {/* Access Type Grid */}
      <div className="space-y-2">
        <label className="block text-[10px] font-black uppercase text-stone-400 tracking-wider">Access Scope Selection</label>
        <div className="grid grid-cols-3 gap-2">
          
          {/* Free For All */}
          <button
            type="button"
            onClick={() => handleTypeChange('all')}
            className={`p-3 rounded-xl border text-center transition-all ${
              access.type === 'all'
                ? 'bg-[#e8f5ee]/40 border-[#1a6b3a] text-[#1a6b3a]'
                : 'bg-stone-50 border-stone-200 hover:border-stone-300'
            }`}
          >
            <span className="text-sm block">🔓</span>
            <span className="font-bold text-[10px] block mt-1 uppercase">Free To All</span>
          </button>

          {/* Plan Based */}
          <button
            type="button"
            onClick={() => handleTypeChange('plan_based')}
            className={`p-3 rounded-xl border text-center transition-all ${
              access.type === 'plan_based'
                ? 'bg-[#e8f5ee]/40 border-[#1a6b3a] text-[#1a6b3a]'
                : 'bg-stone-50 border-stone-200 hover:border-stone-300'
            }`}
          >
            <span className="text-sm block">💳</span>
            <span className="font-bold text-[10px] block mt-1 uppercase">Pro Only</span>
          </button>

          {/* Specific Users */}
          <button
            type="button"
            onClick={() => handleTypeChange('specific_users')}
            className={`p-3 rounded-xl border text-center transition-all ${
              access.type === 'specific_users'
                ? 'bg-[#e8f5ee]/40 border-[#1a6b3a] text-[#1a6b3a]'
                : 'bg-stone-50 border-stone-200 hover:border-stone-300'
            }`}
          >
            <span className="text-sm block">🎯</span>
            <span className="font-bold text-[10px] block mt-1 uppercase">Whitelist</span>
          </button>
        </div>
      </div>

      {/* Conditional Subsections */}
      {access.type === 'plan_based' && (
        <div className="space-y-3 bg-[#fbfbfa] p-4 rounded-xl border border-stone-100 animate-in fade-in duration-200">
          <label className="block text-[10px] font-black uppercase text-[#1a6b3a] tracking-wider mb-1">Select Allowed Subscription Passes</label>
          <div className="grid grid-cols-3 gap-2">
            {['monthly', 'quarterly', 'annual'].map((plan) => {
              const isSelected = access.plans.includes(plan);
              return (
                <button
                  key={plan}
                  type="button"
                  onClick={() => handlePlanToggle(plan)}
                  className={`py-2 px-3 rounded-lg text-[10px] font-bold border transition-colors flex items-center justify-center gap-1.5 capitalize ${
                    isSelected
                      ? 'bg-[#1a6b3a] text-white border-transparent'
                      : 'bg-white border-stone-200 text-stone-500 hover:border-stone-300'
                  }`}
                >
                  {isSelected && <Check size={10} />}
                  {plan}
                </button>
              );
            })}
          </div>
          <p className="text-[9px] text-[#2d8a52] flex items-center gap-1 mt-1">
            <Sparkles size={10} /> Active members holding checked passes will enjoy complete access.
          </p>
        </div>
      )}

      {access.type === 'specific_users' && (
        <div className="space-y-2.5 bg-[#fbfbfa] p-4 rounded-xl border border-stone-100 animate-in fade-in duration-200">
          <label className="block text-[10px] font-black uppercase text-amber-800 tracking-wider flex items-center gap-1.5">
            <Mail size={11} /> Whitelisted Student Emails (Comma Separated)
          </label>
          <textarea
            placeholder="student1@gmail.com, researcher2@agri.edu"
            value={emailsString}
            onChange={(e) => handleEmailsChange(e.target.value)}
            rows={2}
            className="w-full text-xs bg-white border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-[#1a6b3a] text-stone-800 font-mono resize-none focus:ring-1 focus:ring-[#1a6b3a]/20"
          />
          <p className="text-[9px] text-stone-400">Only user profiles signing-in with corresponding emails gain ingestion authority.</p>
        </div>
      )}

      {/* Free Previews Limit Slider */}
      {(access.type === 'plan_based' || access.type === 'specific_users') && (
        <div className="space-y-2 bg-[#fbfbfa] p-4 rounded-xl border border-stone-100">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider flex items-center gap-1.5 col-span-1">
              <Eye size={11} /> Free preview questions threshold
            </label>
            <span className="text-[10px] font-black bg-stone-200 text-stone-700 px-2 py-0.5 rounded font-mono">
              {access.freePreviewQuestions} Items
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="15"
            value={access.freePreviewQuestions}
            onChange={(e) => handlePreviewChange(parseInt(e.target.value))}
            className="w-full accent-[#1a6b3a] h-1.5 focus:outline-none rounded-lg"
          />
          <div className="flex justify-between text-[8px] text-stone-400 font-mono mt-1">
            <span>0 questions (Strict Gate)</span>
            <span>15 questions (Partial Try)</span>
          </div>
          <p className="text-[9px] text-stone-500 italic mt-1 bg-white p-2 border border-stone-250/20 rounded-md">
            🛡️ <b>Proactive Rule:</b> Non-authorized students can answer up to the first <b>{access.freePreviewQuestions}</b> questions before encountering the subscription lock.
          </p>
        </div>
      )}

    </div>
  );
};

export default AccessControlPanel;
