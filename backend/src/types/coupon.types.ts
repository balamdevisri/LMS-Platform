/**
 * Canonical Coupon & Discount Domain Types (Firestore Native)
 */

export type CouponDiscountType = 'percentage' | 'fixed';

export interface ICoupon {
  id: string;
  code: string;                          // Display code (e.g., "KAIZEN50")
  normalizedCode: string;                // Normalized for deterministic lookup (trim + uppercase)
  description?: string;
  discountType: CouponDiscountType;      // 'percentage' or 'fixed'
  discountValue: number;                 // Percentage (1-100) or Fixed INR Amount (> 0)
  maxDiscountAmount?: number | null;     // Cap for percentage discounts in INR (null = unlimited)
  minimumPurchaseAmount?: number | null; // Minimum purchase required in INR (null = no minimum)
  applicableCourseIds: string[];         // Empty array = all courses; specific IDs restrict usage
  startsAt?: string | null;              // ISO timestamp
  expiresAt?: string | null;             // ISO timestamp
  totalUsageLimit?: number | null;       // Total times coupon can be redeemed globally
  perUserUsageLimit?: number | null;     // Max redemptions allowed per student (default 1)
  totalUsed: number;                     // Current count of completed redemptions
  isActive: boolean;                     // Admin active toggle
  isArchived?: boolean;                  // Soft-delete flag
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  revision: number;
  version: number;
}

export interface ICouponUsage {
  id: string;                            // Unique usage ID (${orderId}_${couponId})
  couponId: string;
  couponCode: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  courseId: string;
  courseTitle?: string;
  orderId: string;
  discountType: CouponDiscountType;
  discountValue: number;
  discountAmount: number;                // Actual discount applied in INR
  originalAmount: number;                // Base course price in INR
  finalAmount: number;                   // Final payable amount in INR
  usedAt: string;                        // ISO timestamp
}

export interface ValidateCouponDTO {
  couponCode: string;
  courseId: string;
  userId?: string;
  coursePrice?: number;
}

export interface CouponValidationResult {
  valid: boolean;
  code?: string;
  message?: string;
  coupon?: ICoupon;
  couponId?: string;
  couponCode?: string;
  discountType?: CouponDiscountType;
  discountValue?: number;
  discountAmount?: number;
  originalAmount?: number;
  finalAmount?: number;
  originalPrice?: number;
  finalPrice?: number;
  maxDiscountAmount?: number | null;
  minimumPurchaseAmount?: number | null;
}

export interface CreateCouponDTO {
  code: string;
  description?: string;
  discountType: CouponDiscountType;
  discountValue: number;
  maxDiscountAmount?: number | null;
  minimumPurchaseAmount?: number | null;
  applicableCourseIds?: string[];
  startsAt?: string | null;
  expiresAt?: string | null;
  totalUsageLimit?: number | null;
  perUserUsageLimit?: number | null;
  isActive?: boolean;
}

export interface UpdateCouponDTO {
  description?: string;
  discountType?: CouponDiscountType;
  discountValue?: number;
  maxDiscountAmount?: number | null;
  minimumPurchaseAmount?: number | null;
  applicableCourseIds?: string[];
  startsAt?: string | null;
  expiresAt?: string | null;
  totalUsageLimit?: number | null;
  perUserUsageLimit?: number | null;
  isActive?: boolean;
  expectedRevision?: number;
}
