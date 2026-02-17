
import { Coupon } from '../../types';

export interface CouponResult {
  valid: boolean;
  discount: number;
  finalAmount: number;
  message: string;
  code?: string;
}

export const applyCoupon = (code: string, cartTotal: number, availableCoupons: Coupon[]): CouponResult => {
  try {
    const normalizedCode = code.trim().toUpperCase();
    
    // Find coupon in the provided dynamic list
    const coupon = availableCoupons.find(c => c.code.toUpperCase() === normalizedCode);

    if (!coupon) {
      return { 
        valid: false, 
        discount: 0, 
        finalAmount: cartTotal, 
        message: "Invalid or expired coupon code" 
      };
    }

    // Since availableCoupons is already filtered for validity (active/date) by the caller,
    // we just perform the math here. But redundant checks don't hurt.
    if (!coupon.isActive) {
        return { valid: false, discount: 0, finalAmount: cartTotal, message: "Coupon is no longer active" };
    }

    let discount = 0;

    // Use discountType matching the Firestore schema from types.ts
    if (coupon.discountType === "PERCENT") {
      discount = (cartTotal * coupon.value) / 100;
      // If DB has maxDiscount logic in future, add here. Currently basic implementation.
    } else if (coupon.discountType === "FLAT") {
      discount = coupon.value;
    }

    // Safety check: Discount cannot exceed total
    discount = Math.min(discount, cartTotal);
    
    // Round to avoid floating point issues in UI
    discount = Math.floor(discount);
    const finalAmount = Math.ceil(cartTotal - discount);

    return { 
      valid: true, 
      discount, 
      finalAmount, 
      message: `Coupon ${normalizedCode} applied successfully!`, 
      code: normalizedCode 
    };
  } catch (error) {
    console.error("Coupon engine error:", error);
    return { 
      valid: false, 
      discount: 0, 
      finalAmount: cartTotal, 
      message: "Unable to process coupon at this time" 
    };
  }
};
