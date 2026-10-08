import React from 'react';
import { useAuth } from '../src/authContext';
import { isPlanExpired, canAccessResearch, canAccessTool } from '../utils/planAccess';
import UpgradeNotice from '../components/UpgradeNotice';

interface CheckPlanProps {
  children: React.ReactNode;
  type?: 'tools' | 'history' | 'general' | 'research';
  toolId?: string;
}

/**
 * A wrapper component that checks if the user has an active plan.
 * If the plan is expired or restricted, it shows an UpgradeNotice.
 */
export const CheckPlan: React.FC<CheckPlanProps> = ({ children, type = 'general', toolId }) => {
  const { user, planDetails, isLoading } = useAuth();
  
  if (isLoading) return null;
  
  // If user is admin, they always have access
  if (user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') return <>{children}</>;

  // Special check for research tools (Data Entry Tool)
  if (type === 'research') {
    const hasAccess = canAccessResearch(user, planDetails);
    if (!hasAccess) {
      return (
        <div className="py-20 px-4">
          <UpgradeNotice 
            type="research" 
            title="Research Plan Required"
            message="Access to the Research Data Lab and advanced experimental tools requires an active Research Plan. Upgrade your account to start entering and analyzing field data."
          />
        </div>
      );
    }
    return <>{children}</>;
  }

  // Tool-specific access control
  if (type === 'tools' && toolId) {
    const hasAccess = canAccessTool(user, planDetails, toolId);
    
    if (!hasAccess) {
      return (
        <div className="py-20 px-4">
          <UpgradeNotice 
            type="tools" 
            title="Tool Access Restricted"
            message="This tool is not included in your current subscription plan. Please upgrade your plan to gain access to this and other premium tools."
          />
        </div>
      );
    }
  }
  
  return <>{children}</>;
};
