const API_BASE = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000').replace(/\/$/, '');

export interface CouponItem {
  id: string;
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxDiscountAmount?: number | null;
  minPurchaseAmount?: number | null;
  applicableCourses?: string[] | null;
  startDate?: string | null;
  endDate?: string | null;
  totalUsageLimit?: number | null;
  perUserLimit?: number | null;
  totalUsed: number;
  isActive: boolean;
  isArchived: boolean;
  version: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CouponUsageItem {
  id: string;
  couponId: string;
  couponCode: string;
  orderId: string;
  paymentId: string;
  userId: string;
  userEmail?: string;
  courseId: string;
  courseTitle?: string;
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
  usedAt: string;
}

export interface ValidateCouponParams {
  couponCode: string;
  courseId: string;
  coursePrice?: number;
}

export interface CouponValidationResponse {
  success: boolean;
  valid: boolean;
  code?: string;
  couponId?: string;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  originalPrice?: number;
  discountAmount?: number;
  finalPrice?: number;
  message?: string;
  error?: string;
  data?: any;
}

export interface CreateCouponPayload {
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxDiscountAmount?: number | null;
  minPurchaseAmount?: number | null;
  applicableCourses?: string[] | null;
  startDate?: string | null;
  endDate?: string | null;
  totalUsageLimit?: number | null;
  perUserLimit?: number | null;
  isActive?: boolean;
}

export interface UpdateCouponPayload extends Partial<CreateCouponPayload> {
  expectedRevision?: number;
}

class CouponService {
  /**
   * Public / Student: Validate a coupon code for a specific course
   */
  async validateCoupon(
    params: ValidateCouponParams,
    token?: string,
    userId?: string
  ): Promise<CouponValidationResponse> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else if (userId) {
        headers['x-user-id'] = userId;
      }

      const res = await fetch(`${API_BASE}/api/coupons/validate`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          couponCode: params.couponCode.trim().toUpperCase(),
          courseId: params.courseId,
          coursePrice: params.coursePrice,
        }),
      });

      const data = await res.json();
      return data;
    } catch (err: any) {
      console.error('[CouponService] validateCoupon error:', err);
      return {
        success: false,
        valid: false,
        error: err?.message || 'Failed to validate coupon',
        message: err?.message || 'Failed to validate coupon',
      };
    }
  }

  /**
   * Admin: List coupons with search and active filters
   */
  async listCoupons(
    params: { search?: string; isActive?: boolean; includeArchived?: boolean } = {},
    token?: string
  ): Promise<{ success: boolean; data: CouponItem[]; count: number; error?: string }> {
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const query = new URLSearchParams();
      if (params.search) query.append('search', params.search);
      if (params.isActive !== undefined) query.append('isActive', String(params.isActive));
      if (params.includeArchived) query.append('includeArchived', 'true');

      const res = await fetch(`${API_BASE}/api/coupons?${query.toString()}`, { headers });
      const data = await res.json();

      if (data.success && data.data) {
        return {
          success: true,
          data: data.data.coupons || [],
          count: data.data.count || 0,
        };
      }
      return { success: false, data: [], count: 0, error: data.message || 'Failed to fetch coupons' };
    } catch (err: any) {
      console.error('[CouponService] listCoupons error:', err);
      return { success: false, data: [], count: 0, error: err.message };
    }
  }

  /**
   * Admin: Create a new coupon
   */
  async createCoupon(
    payload: CreateCouponPayload,
    token?: string
  ): Promise<{ success: boolean; data?: CouponItem; error?: string; message?: string }> {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/api/coupons`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      return data;
    } catch (err: any) {
      console.error('[CouponService] createCoupon error:', err);
      return { success: false, error: err.message, message: err.message };
    }
  }

  /**
   * Admin: Update coupon with optimistic concurrency support
   */
  async updateCoupon(
    id: string,
    payload: UpdateCouponPayload,
    token?: string
  ): Promise<{ success: boolean; data?: CouponItem; error?: string; conflict?: boolean; message?: string }> {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/api/coupons/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.status === 409) {
        return { success: false, conflict: true, error: data.message || 'Revision conflict', message: data.message };
      }
      return data;
    } catch (err: any) {
      console.error('[CouponService] updateCoupon error:', err);
      return { success: false, error: err.message, message: err.message };
    }
  }

  /**
   * Admin: Toggle Active/Inactive status
   */
  async toggleCoupon(
    id: string,
    isActive: boolean,
    token?: string
  ): Promise<{ success: boolean; data?: CouponItem; error?: string }> {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/api/coupons/${id}/toggle`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ isActive }),
      });
      return await res.json();
    } catch (err: any) {
      console.error('[CouponService] toggleCoupon error:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Admin: Archive coupon
   */
  async archiveCoupon(id: string, token?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/api/coupons/${id}`, {
        method: 'DELETE',
        headers,
      });
      return await res.json();
    } catch (err: any) {
      console.error('[CouponService] archiveCoupon error:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Admin: Get usage audit history for a coupon
   */
  async getCouponUsages(
    id: string,
    limit: number = 50,
    token?: string
  ): Promise<{ success: boolean; data: CouponUsageItem[]; error?: string }> {
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/api/coupons/${id}/usages?limit=${limit}`, { headers });
      const data = await res.json();
      if (data.success && data.data) {
        return { success: true, data: data.data };
      }
      return { success: false, data: [], error: data.message || 'Failed to fetch usages' };
    } catch (err: any) {
      console.error('[CouponService] getCouponUsages error:', err);
      return { success: false, data: [], error: err.message };
    }
  }
}

export const couponService = new CouponService();
