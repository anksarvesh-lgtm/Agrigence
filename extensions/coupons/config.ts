
export interface CouponConfig {
  type: 'percent' | 'flat';
  value: number;
  maxDiscount?: number;
  minOrder: number;
  description: string;
}

// Default coupons removed to enforce Firestore as source of truth.
export const COUPONS: Record<string, CouponConfig> = {};
