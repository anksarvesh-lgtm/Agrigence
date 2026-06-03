import { useState, useEffect } from 'react';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../authContext';

export interface SubscriptionInfo {
  plan: 'free' | 'monthly' | 'quarterly' | 'annual';
  status: 'active' | 'expired' | 'cancelled' | 'trial';
  startDate?: string;
  endDate?: string;
  paymentId?: string;
  orderId?: string;
  grantedBy?: 'self' | 'admin';
  grantedAt?: string;
}

export interface PlanLimit {
  questionsPerDay: number;
  testsPerMonth: number;
  canViewExplanations: boolean;
  canDownload: boolean;
  canAccessPYQ: boolean;
}

export interface PlanInfo {
  id: string;
  name: string;
  price: number;
  duration: number | null;
  color: string;
  popular?: boolean;
  features: string[];
  limits: PlanLimit;
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [plans, setPlans] = useState<PlanInfo[]>([]);
  const [loading, setLoading] = useState(true);

  // real-time subscription listener
  useEffect(() => {
    if (!user) {
      setSubscription({ plan: 'free', status: 'active' });
      setLoading(false);
      return;
    }

    const unsub = onSnapshot(doc(db, 'users', user.id), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setSubscription(data.subscription || { plan: 'free', status: 'active' });
      } else {
        setSubscription({ plan: 'free', status: 'active' });
      }
      setLoading(false);
    }, (error) => {
      console.error("Subscription listener error:", error);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  // fetch plans once
  useEffect(() => {
    getDoc(doc(db, 'appConfig', 'plans')).then(snap => {
      if (snap.exists()) {
        setPlans(snap.data().plans || []);
      }
    }).catch(err => {
      console.error("Failed to load plans from FireStore appConfig/plans:", err);
    });
  }, []);

  function isActive() {
    if (!subscription) return false;
    if (subscription.plan === 'free') return true;
    if (subscription.status !== 'active') return false;
    if (!subscription.endDate) return false;
    return new Date(subscription.endDate) > new Date();
  }

  function isPlan(planId: string) {
    if (!isActive()) return false;
    if (planId === 'free') return true;
    return subscription?.plan === planId;
  }

  function isAtLeast(planId: string) {
    const order = ['free', 'monthly', 'quarterly', 'annual'];
    const userPlanIndex = order.indexOf(subscription?.plan || 'free');
    const requiredIndex = order.indexOf(planId);
    return isActive() && userPlanIndex >= requiredIndex;
  }

  function canAccessContent(content: any) {
    if (!content?.accessControl) return { allowed: true };

    const { type, plans: requiredPlans, specificUserIds, freePreviewQuestions } = content.accessControl;

    // everyone gets access
    if (type === 'all') return { allowed: true };

    // not logged in
    if (!user) {
      return {
        allowed: false,
        reason: 'login' as const,
        preview: freePreviewQuestions || 0,
        message: 'Login to access this content',
      };
    }

    // specific users only
    if (type === 'specific_users') {
      if (specificUserIds?.includes(user.id)) return { allowed: true };
      return {
        allowed: false,
        reason: 'not_invited' as const,
        message: 'This content is not available for your account',
      };
    }

    // plan based
    if (type === 'plan_based') {
      if (!requiredPlans || requiredPlans.length === 0) return { allowed: true };

      // free plan always allowed if 'free' is in list
      if (requiredPlans.includes('free')) return { allowed: true };

      // check if user has any of the required plans
      const userPlan = subscription?.plan || 'free';
      if (requiredPlans.includes(userPlan) && isActive()) {
        return { allowed: true };
      }

      // expired
      if (subscription?.plan !== 'free' && !isActive()) {
        return {
          allowed: false,
          reason: 'expired' as const,
          preview: freePreviewQuestions || 0,
          requiredPlans,
          message: 'Your subscription has expired',
        };
      }

      return {
        allowed: false,
        reason: 'upgrade' as const,
        preview: freePreviewQuestions || 0,
        requiredPlans,
        message: `Requires ${requiredPlans.map((p: string) => p).join(' or ')} plan`,
      };
    }

    return { allowed: true };
  }

  function getDailyLimit() {
    const plan = plans.find(p => p.id === (subscription?.plan || 'free'));
    return plan?.limits || { questionsPerDay: 5, testsPerMonth: 2 };
  }

  function daysRemaining() {
    if (!subscription?.endDate) return 0;
    const diff = new Date(subscription.endDate).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  return {
    subscription,
    plans,
    loading,
    isActive,
    isPlan,
    isAtLeast,
    canAccessContent,
    getDailyLimit,
    daysRemaining,
    currentPlan: subscription?.plan || 'free',
  };
}
