import { UserSubscription, SubscriptionPlan } from '../../types';

export function canAccessExam(userSubscription: UserSubscription | undefined, examId: string): boolean {
  if (!userSubscription) {
    return false;
  }

  if (userSubscription.status !== 'active') {
    return false;
  }

  if (new Date(userSubscription.endDate) < new Date()) {
    return false;
  }

  // all exams unlocked
  if (userSubscription.unlockType === 'all_exams') {
    return true;
  }

  // specific exams
  if (userSubscription.allowedExams?.includes(examId)) {
    return true;
  }

  return false;
}

export function getRelevantPlans(examId: string, allPlans: SubscriptionPlan[]) {
  return allPlans.filter(plan => {
    if (plan.unlockType === 'all_exams') {
      return true;
    }
    return plan.allowedExams?.includes(examId);
  });
}
