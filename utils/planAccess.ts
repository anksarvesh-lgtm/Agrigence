import { User, SubscriptionPlan } from '../types';

export const hasActivePlan = (user: User | null): boolean => {
  if (!user) return false;
  
  // If user is admin or super admin, they always have access
  if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') return true;
  
  // Free users are considered "active" in terms of basic access, 
  // but they will have limited features (no history)
  if (!user.subscriptionTier || user.subscriptionTier === 'FREE') return true;
  
  // For paid tiers, check expiry
  const expiry = user.adminExpiryOverride || user.subscriptionExpiry;
  if (!expiry) return false;
  
  // Check if the current date is before or equal to the expiry date
  return new Date() <= new Date(expiry);
};

export const canAccessResearch = (user: User | null, planDetails?: SubscriptionPlan | null): boolean => {
  if (!user) return false;
  if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') return true;
  
  if (!planDetails) return false;
  
  if (planDetails.is_research_enabled !== true) return false;

  // If the user has an expiry date, check it
  const expiryDate = user.adminExpiryOverride || user.subscriptionExpiry;
  if (expiryDate) {
    const now = new Date();
    const expiry = new Date(expiryDate);
    return now <= expiry;
  }
  
  // If no expiry date (e.g., free plan without expiry), but the plan is research enabled
  return true;
};

export const isPlanExpired = (user: User | null): boolean => {
  if (!user) return false;
  if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') return false;
  if (!user.subscriptionTier || user.subscriptionTier === 'FREE') return false;
  const expiry = user.adminExpiryOverride || user.subscriptionExpiry;
  if (!expiry) return true;
  
  return new Date() > new Date(expiry);
};

export const canAccessTool = (user: User | null, planDetails: SubscriptionPlan | null, toolId: string): boolean => {
  if (!user) return false;
  if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') return true;
  
  // Check admin overrides first
  if (user.adminEnabledTools && user.adminEnabledTools.includes(toolId)) {
    return !isPlanExpired(user);
  }

  if (!planDetails) return false;
  
  // If allowedTools is defined, check if tool is included
  if (planDetails.allowedTools && planDetails.allowedTools.includes(toolId)) {
      return !isPlanExpired(user);
  }
  
  // Default to false if not explicitly allowed
  return false;
};
