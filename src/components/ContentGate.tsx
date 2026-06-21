import React, { useState } from 'react';
import { useSubscription } from '../hooks/useSubscription';
import Paywall from './Paywall';

interface PreviewWrapperProps {
  limit: number;
  onLimitReached: () => void;
  children: React.ReactNode;
}

export const PreviewWrapper: React.FC<PreviewWrapperProps> = ({ limit, onLimitReached, children }) => {
  const childrenArray = React.Children.toArray(children);
  
  if (childrenArray.length <= limit) {
    return <>{children}</>;
  }

  const allowedChildren = childrenArray.slice(0, limit);

  return (
    <div className="space-y-4">
      {allowedChildren}
      <div className="p-6 border-2 border-dashed border-stone-200 rounded-2xl bg-amber-50/50 text-center space-y-3">
        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-800 font-bold">
          🔒
        </div>
        <div>
          <p className="text-xs font-bold text-stone-800">Dynamic Free Preview Limit Reached</p>
          <p className="text-[10px] text-stone-500 max-w-sm mx-auto mt-1 leading-relaxed">
            You have successfully previewed {limit} questions of this test pack. Upgrade your subscription pass to unlock all remaining questions.
          </p>
        </div>
        <button
          type="button"
          onClick={onLimitReached}
          className="px-6 py-2 bg-[#1a6b3a] hover:bg-[#0f4225] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md inline-block"
        >
          Unlock Full Access Now
        </button>
      </div>
    </div>
  );
};

interface ContentGateProps {
  content: any;
  children: React.ReactNode;
}

export default function ContentGate({ content, children }: ContentGateProps) {
  const { canAccessContent } = useSubscription();
  const [showPaywall, setShowPaywall] = useState(false);
  const access = canAccessContent(content);

  if (access.allowed) return <>{children}</>;

  // show partial preview if freePreviewQuestions > 0
  if (access.preview > 0) {
    return (
      <div className="relative">
        <PreviewWrapper
          limit={access.preview}
          onLimitReached={() => setShowPaywall(true)}
        >
          {children}
        </PreviewWrapper>
        {showPaywall && (
          <Paywall
            content={content}
            reason={access.reason}
            onClose={() => setShowPaywall(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <div
        className="blur-md pointer-events-none select-none"
        onClick={() => setShowPaywall(true)}
      >
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-[#faf9f6]/80 backdrop-blur-xs p-6">
        <div className="bg-white p-6 rounded-2xl border border-stone-200/60 shadow-xl text-center max-w-sm space-y-4">
          <div className="w-11 h-11 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto">
            <span className="text-xl">🔒</span>
          </div>
          <div>
            <h4 className="font-bold text-stone-900 text-sm font-serif">Pro Pass Content</h4>
            <p className="text-xs text-stone-500 mt-1 leading-snug">
              {access.message || 'Unlock all mock tests, full study materials, and revision boards with a premium pass.'}
            </p>
          </div>
          <button
            onClick={() => setShowPaywall(true)}
            className="w-full bg-[#1a6b3a] text-white hover:bg-[#0f4225] py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-md"
          >
            🔒 Unlock with Pro
          </button>
        </div>
      </div>
      {showPaywall && (
        <Paywall
          content={content}
          reason={access.reason}
          onClose={() => setShowPaywall(false)}
        />
      )}
    </div>
  );
}
