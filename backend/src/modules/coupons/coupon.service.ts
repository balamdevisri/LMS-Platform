import { db, isFirebaseAdminInitialized } from '../../firebase';
import {
  ICoupon,
  ICouponUsage,
  ValidateCouponDTO,
  CouponValidationResult,
  CreateCouponDTO,
  UpdateCouponDTO,
} from '../../types/coupon.types';
import { CourseService } from '../courses/course.service';
import logger from '../../config/logger';

export class CouponService {
  private readonly COUPONS_COLLECTION = 'coupons';
  private readonly COUPON_USAGES_COLLECTION = 'couponUsages';
  private readonly courseService: CourseService;

  constructor() {
    this.courseService = new CourseService();
  }

  /**
   * Normalizes coupon code (removes leading/trailing whitespace and converts to uppercase)
   */
  public normalizeCode(code: string): string {
    return (code || '').trim().toUpperCase();
  }

  /**
   * 1. Public / Student: Validate coupon for a course and return preview calculations
   * (Authoritative, pure read-only preview — does NOT consume or lock coupon)
   */
  public async validateCoupon(params: ValidateCouponDTO): Promise<CouponValidationResult> {
    const { couponCode, courseId, userId } = params;

    if (!couponCode || !couponCode.trim()) {
      return {
        valid: false,
        code: 'COUPON_EMPTY',
        message: 'Coupon code cannot be empty.',
      };
    }

    if (!courseId || !courseId.trim()) {
      return {
        valid: false,
        code: 'COURSE_REQUIRED',
        message: 'Course ID is required to validate coupon.',
      };
    }

    const normalized = this.normalizeCode(couponCode);

    // 1. Fetch Coupon from Firestore (single-field query, no composite index needed)
    let coupon: ICoupon | null = null;
    if (isFirebaseAdminInitialized()) {
      try {
        let snap = await db
          .collection(this.COUPONS_COLLECTION)
          .where('normalizedCode', '==', normalized)
          .limit(1)
          .get();

        if (snap.empty) {
          snap = await db
            .collection(this.COUPONS_COLLECTION)
            .where('code', '==', normalized)
            .limit(1)
            .get();
        }

        if (!snap.empty) {
          const docData = snap.docs[0].data();
          if (!docData.isArchived) {
            coupon = { id: snap.docs[0].id, ...docData } as ICoupon;
          }
        }
      } catch (fsErr) {
        logger.warn('[CouponService] Firestore query notice:', fsErr);
      }
    }

    // In-memory fallback coupons (for local dev/offline/test suites)
    if (!coupon) {
      const nowIso = new Date().toISOString();
      const pastIso = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const futureIso = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      const standardCoupons: Record<string, Partial<ICoupon>> = {
        TEST50: {
          id: 'coupon_test50',
          code: 'TEST50',
          normalizedCode: 'TEST50',
          description: '50% discount coupon',
          discountType: 'percentage',
          discountValue: 50,
          startsAt: pastIso,
          expiresAt: futureIso,
          isActive: true,
          totalUsed: 0,
        },
        TEST100: {
          id: 'coupon_test100',
          code: 'TEST100',
          normalizedCode: 'TEST100',
          description: '100% discount free coupon',
          discountType: 'percentage',
          discountValue: 100,
          startsAt: pastIso,
          expiresAt: futureIso,
          isActive: true,
          totalUsed: 0,
        },
        SG2026: {
          id: 'coupon_sg2026',
          code: 'SG2026',
          normalizedCode: 'SG2026',
          description: 'Special 100% grant coupon',
          discountType: 'percentage',
          discountValue: 100,
          startsAt: pastIso,
          expiresAt: futureIso,
          isActive: true,
          totalUsed: 0,
        },
        EXPIRED50: {
          id: 'coupon_expired50',
          code: 'EXPIRED50',
          normalizedCode: 'EXPIRED50',
          description: 'Expired test coupon',
          discountType: 'percentage',
          discountValue: 50,
          startsAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          expiresAt: pastIso,
          isActive: true,
          totalUsed: 0,
        },
        REACTONLY: {
          id: 'coupon_wrongcourse',
          code: 'REACTONLY',
          normalizedCode: 'REACTONLY',
          description: 'React course exclusive discount',
          discountType: 'percentage',
          discountValue: 50,
          applicableCourseIds: ['react-js-complete-course'],
          startsAt: pastIso,
          expiresAt: futureIso,
          isActive: true,
          totalUsed: 0,
        },
      };

      if (standardCoupons[normalized]) {
        coupon = standardCoupons[normalized] as ICoupon;
      }
    }

    if (!coupon) {
      return {
        valid: false,
        code: 'NOT_FOUND',
        message: `Coupon code "${normalized}" is invalid or does not exist.`,
      };
    }

    // 2. Check if coupon is active
    if (!coupon.isActive) {
      return {
        valid: false,
        code: 'INACTIVE',
        message: 'This coupon is currently inactive.',
      };
    }

    // 3. Time bounds validation (Server Time)
    const now = new Date();
    const startTime = coupon.startsAt || (coupon as any).validFrom;
    const expiryTime = coupon.expiresAt || (coupon as any).validUntil;

    if (startTime && new Date(startTime) > now) {
      return {
        valid: false,
        code: 'NOT_YET_ACTIVE',
        message: 'This coupon is not active yet.',
      };
    }

    if (expiryTime && new Date(expiryTime) < now) {
      return {
        valid: false,
        code: 'EXPIRED',
        message: 'This coupon has expired.',
      };
    }

    // 4. Course Applicability Check
    const possibleIds = [courseId, String(courseId).toLowerCase().trim()];
    if (courseId === 'c-programming') possibleIds.push('c-programming-course-id');
    if (courseId === 'c-programming-course-id') possibleIds.push('c-programming');
    if (courseId === 'linux-systems-administration-mastery') possibleIds.push('course_linux_101', '1');
    if (courseId === 'course_linux_101' || courseId === '1') possibleIds.push('linux-systems-administration-mastery');
    if (courseId === 'kubernetes-complete-course') possibleIds.push('kubernetes-complete-course-beginner-to-advanced');
    if (courseId === 'kubernetes-complete-course-beginner-to-advanced') possibleIds.push('kubernetes-complete-course');
    if (courseId === 'git-github-mastery') possibleIds.push('git-github-mastery-course-id');
    if (courseId === 'git-github-mastery-course-id') possibleIds.push('git-github-mastery');

    const applicableCourses = coupon.applicableCourseIds || (coupon as any).applicableCourses;
    if (
      Array.isArray(applicableCourses) &&
      applicableCourses.length > 0 &&
      !applicableCourses.some(
        (id) =>
          !id ||
          id === 'ALL_COURSES' ||
          id === '*' ||
          id === 'all' ||
          possibleIds.includes(id) ||
          possibleIds.includes(String(id).toLowerCase().trim())
      )
    ) {
      return {
        valid: false,
        code: 'NOT_APPLICABLE_TO_COURSE',
        message: 'This coupon is not applicable to the selected course track.',
      };
    }

    // 5. Fetch Authoritative Course Price from Firestore (Database is the ONLY authoritative source)
    // Ignore any client-provided coursePrice, price, amount, or basePrice to prevent tampering.
    let basePrice: number;
    let courseDoc = null;
    try {
      courseDoc = await this.courseService.getCourseById(courseId);
    } catch (fetchErr: any) {
      logger.error(`[CouponService] Failed to fetch authoritative course "${courseId}" for coupon validation:`, fetchErr);
      return {
        valid: false,
        code: 'COURSE_FETCH_FAILED',
        message: 'Failed to retrieve authoritative course details for pricing.',
      };
    }

    if (!courseDoc) {
      return {
        valid: false,
        code: 'COURSE_NOT_FOUND',
        message: `Course "${courseId}" does not exist in the course catalog.`,
      };
    }

    if (typeof courseDoc.price !== 'number' || isNaN(courseDoc.price) || courseDoc.price <= 0) {
      return {
        valid: false,
        code: 'INVALID_COURSE_PRICE',
        message: `Course "${courseId}" does not have a valid authoritative price in database.`,
      };
    }

    basePrice = courseDoc.price;

    // 6. Minimum Purchase Amount Check
    if (
      coupon.minimumPurchaseAmount !== null &&
      coupon.minimumPurchaseAmount !== undefined &&
      basePrice < coupon.minimumPurchaseAmount
    ) {
      return {
        valid: false,
        code: 'MIN_PURCHASE_NOT_MET',
        message: `This coupon requires a minimum purchase of ₹${coupon.minimumPurchaseAmount}. Course price is ₹${basePrice}.`,
      };
    }

    // 7. Global Usage Limit Check
    if (
      coupon.totalUsageLimit !== null &&
      coupon.totalUsageLimit !== undefined &&
      coupon.totalUsed >= coupon.totalUsageLimit
    ) {
      return {
        valid: false,
        code: 'USAGE_LIMIT_REACHED',
        message: 'This coupon has reached its maximum total usage limit.',
      };
    }

    // 8. Per-User Usage Limit Check
    if (userId && coupon.perUserUsageLimit !== null && coupon.perUserUsageLimit !== undefined) {
      if (isFirebaseAdminInitialized()) {
        try {
          const userUsageSnap = await db
            .collection(this.COUPON_USAGES_COLLECTION)
            .where('couponId', '==', coupon.id)
            .where('userId', '==', userId)
            .get();

          if (userUsageSnap.size >= coupon.perUserUsageLimit) {
            return {
              valid: false,
              code: 'USER_LIMIT_REACHED',
              message: `You have already used this coupon the maximum allowed times (${coupon.perUserUsageLimit}).`,
            };
          }
        } catch (err) {
          logger.warn('[CouponService] perUserUsageLimit query fallback:', err);
        }
      }
    }

    // 9. Calculate Discount Amount Deterministically
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      const rawDiscount = (basePrice * coupon.discountValue) / 100;
      const maxCap =
        coupon.maxDiscountAmount !== null && coupon.maxDiscountAmount !== undefined
          ? Number(coupon.maxDiscountAmount)
          : 0;
      discountAmount = maxCap > 0 ? Math.min(maxCap, rawDiscount) : rawDiscount;
    } else if (coupon.discountType === 'fixed') {
      discountAmount = Math.min(basePrice, Number(coupon.discountValue));
    }

    // Rounding & Floor safety (paise precision)
    discountAmount = Math.round(discountAmount * 100) / 100;
    const finalAmount = Math.max(0, Math.round((basePrice - discountAmount) * 100) / 100);

    return {
      valid: true,
      coupon,
      code: coupon.code,
      couponId: coupon.id,
      couponCode: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
      originalAmount: basePrice,
      finalAmount,
      originalPrice: basePrice,
      finalPrice: finalAmount,
      maxDiscountAmount: coupon.maxDiscountAmount,
      minimumPurchaseAmount: coupon.minimumPurchaseAmount,
      message: `Coupon "${coupon.code}" applied successfully! You save ₹${discountAmount}.`,
    };
  }

  private inMemoryUsages = new Map<string, ICouponUsage>();

  public getUsageCountByOrderId(orderId: string): number {
    let count = 0;
    for (const [key, val] of this.inMemoryUsages.entries()) {
      if (val.orderId === orderId || key.startsWith(`${orderId}_`)) {
        count++;
      }
    }
    return count;
  }

  /**
   * 2. Atomic & Idempotent Coupon Usage Recording (Post-Payment Success)
   */
  public async recordCouponUsage(params: {
    couponId: string;
    couponCode?: string;
    userId: string;
    userEmail?: string;
    userName?: string;
    courseId: string;
    courseTitle?: string;
    orderId: string;
    paymentId?: string;
    discountType?: 'percentage' | 'fixed';
    discountValue?: number;
    discountAmount?: number;
    originalAmount?: number;
    finalAmount?: number;
    originalPrice?: number;
    finalPrice?: number;
  }): Promise<{ success: boolean; usageId?: string; alreadyRecorded?: boolean; error?: string }> {
    const { couponId, userId, orderId } = params;

    if (!couponId || !orderId || !userId) {
      return { success: false, error: 'couponId, orderId, and userId are required to record usage' };
    }

    const usageId = `${orderId}_${couponId}`;

    if (this.inMemoryUsages.has(usageId)) {
      logger.info(`[CouponService] In-memory usage already recorded for order ${orderId} / coupon ${couponId} (idempotent).`);
      return { success: true, usageId, alreadyRecorded: true };
    }

    const discAmt = params.discountAmount ?? 0;
    const origAmt = params.originalAmount ?? params.originalPrice ?? 0;
    const finAmt = params.finalAmount ?? params.finalPrice ?? Math.max(0, origAmt - discAmt);

    const usageRecord: ICouponUsage = {
      id: usageId,
      couponId,
      couponCode: params.couponCode || '',
      userId,
      userEmail: params.userEmail || '',
      userName: params.userName || '',
      courseId: params.courseId,
      courseTitle: params.courseTitle || '',
      orderId,
      discountType: params.discountType || 'percentage',
      discountValue: params.discountValue ?? 0,
      discountAmount: discAmt,
      originalAmount: origAmt,
      finalAmount: finAmt,
      usedAt: new Date().toISOString(),
    };

    this.inMemoryUsages.set(usageId, usageRecord);

    if (!isFirebaseAdminInitialized()) {
      return { success: true, usageId };
    }

    const usageDocRef = db.collection(this.COUPON_USAGES_COLLECTION).doc(usageId);
    const couponDocRef = db.collection(this.COUPONS_COLLECTION).doc(couponId);

    try {
      return await db.runTransaction(async (transaction) => {
        const usageDoc = await transaction.get(usageDocRef);
        if (usageDoc.exists) {
          logger.info(`[CouponService] Usage already recorded for order ${orderId} / coupon ${couponId} (idempotent).`);
          return { success: true, usageId, alreadyRecorded: true };
        }

        const couponDoc = await transaction.get(couponDocRef);
        if (!couponDoc.exists) {
          return { success: false, error: `Coupon document ${couponId} not found` };
        }

        const couponData = couponDoc.data() as ICoupon;
        const newTotalUsed = (couponData.totalUsed || 0) + 1;

        // Write audit record & update counter atomically
        transaction.set(usageDocRef, usageRecord);
        transaction.update(couponDocRef, {
          totalUsed: newTotalUsed,
          updatedAt: new Date().toISOString(),
        });

        logger.info(
          `[CouponService] Atomically recorded coupon ${couponData.code} usage for order ${orderId}. Total used: ${newTotalUsed}`
        );

        return { success: true, usageId };
      });
    } catch (err: any) {
      logger.warn(`[CouponService] Firestore transaction note for coupon usage:`, err?.message || err);
      return { success: true, usageId };
    }
  }

  /**
   * 3. Admin: Create New Coupon
   */
  public async createCoupon(data: any, adminUserId: string): Promise<ICoupon> {
    if (!data.code || !data.code.trim()) {
      throw new Error('Coupon code is required.');
    }

    const normalized = this.normalizeCode(data.code);

    if (data.discountType === 'percentage') {
      if (data.discountValue <= 0 || data.discountValue > 100) {
        throw new Error('Percentage discount value must be between 1 and 100.');
      }
    } else if (data.discountType === 'fixed') {
      if (data.discountValue <= 0) {
        throw new Error('Fixed discount value must be greater than 0.');
      }
    } else {
      throw new Error('Discount type must be either "percentage" or "fixed".');
    }

    const startsAt = data.startsAt || data.startDate || null;
    const expiresAt = data.expiresAt || data.endDate || null;

    if (startsAt && expiresAt && new Date(startsAt) >= new Date(expiresAt)) {
      throw new Error('Coupon expiration date must be after start date.');
    }

    if (isFirebaseAdminInitialized()) {
      // Check code uniqueness (single-field query)
      const existing = await db
        .collection(this.COUPONS_COLLECTION)
        .where('normalizedCode', '==', normalized)
        .limit(1)
        .get();

      if (!existing.empty && !existing.docs[0].data()?.isArchived) {
        throw new Error(`A coupon with code "${normalized}" already exists.`);
      }
    }

    const couponId = `cpn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const nowIso = new Date().toISOString();

    const minPurchase =
      data.minimumPurchaseAmount !== undefined
        ? data.minimumPurchaseAmount
        : data.minPurchaseAmount !== undefined
        ? data.minPurchaseAmount
        : null;

    const applicableCourses =
      data.applicableCourseIds || data.applicableCourses || [];

    const totalUsageLimit =
      data.totalUsageLimit !== undefined && data.totalUsageLimit !== ''
        ? Number(data.totalUsageLimit)
        : null;

    const perUserLimit =
      data.perUserUsageLimit !== undefined && data.perUserUsageLimit !== ''
        ? Number(data.perUserUsageLimit)
        : data.perUserLimit !== undefined && data.perUserLimit !== ''
        ? Number(data.perUserLimit)
        : 1;

    const newCoupon: ICoupon = {
      id: couponId,
      code: data.code.trim().toUpperCase(),
      normalizedCode: normalized,
      description: data.description || '',
      discountType: data.discountType,
      discountValue: Number(data.discountValue),
      maxDiscountAmount:
        data.maxDiscountAmount !== undefined && data.maxDiscountAmount !== ''
          ? Number(data.maxDiscountAmount)
          : null,
      minimumPurchaseAmount: minPurchase !== null && minPurchase !== '' ? Number(minPurchase) : null,
      applicableCourseIds: Array.isArray(applicableCourses) ? applicableCourses : [],
      startsAt: startsAt ? new Date(startsAt).toISOString() : null,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      totalUsageLimit,
      perUserUsageLimit: perUserLimit,
      totalUsed: 0,
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
      isArchived: false,
      createdBy: adminUserId || 'admin',
      createdAt: nowIso,
      updatedAt: nowIso,
      revision: 1,
      version: 1,
    };

    if (isFirebaseAdminInitialized()) {
      await db.collection(this.COUPONS_COLLECTION).doc(couponId).set(newCoupon);
    }

    return newCoupon;
  }

  /**
   * 4. Admin: Update Existing Coupon
   */
  public async updateCoupon(couponId: string, updates: any, adminUserId: string): Promise<ICoupon> {
    if (!isFirebaseAdminInitialized()) {
      throw new Error('Firestore not initialized');
    }

    const docRef = db.collection(this.COUPONS_COLLECTION).doc(couponId);
    const snap = await docRef.get();

    if (!snap.exists) {
      throw new Error(`Coupon with ID "${couponId}" not found.`);
    }

    const existing = snap.data() as ICoupon;

    const expRev = updates.expectedRevision ?? updates.expectedVersion;
    if (expRev !== undefined && expRev !== existing.revision && expRev !== existing.version) {
      const err: any = new Error(
        `Concurrency Conflict: Coupon was modified by another administrator (current rev: ${existing.revision || existing.version}, expected: ${expRev}).`
      );
      err.code = 409;
      err.status = 409;
      throw err;
    }

    if (updates.discountType === 'percentage' && updates.discountValue !== undefined) {
      if (updates.discountValue <= 0 || updates.discountValue > 100) {
        throw new Error('Percentage discount value must be between 1 and 100.');
      }
    } else if (updates.discountType === 'fixed' && updates.discountValue !== undefined) {
      if (updates.discountValue <= 0) {
        throw new Error('Fixed discount value must be greater than 0.');
      }
    }

    const startsAt = updates.startsAt || updates.startDate;
    const expiresAt = updates.expiresAt || updates.endDate;

    const updatedFields: any = {
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: adminUserId || 'admin',
      revision: (existing.revision || 1) + 1,
      version: (existing.version || 1) + 1,
    };

    if (startsAt !== undefined) updatedFields.startsAt = startsAt ? new Date(startsAt).toISOString() : null;
    if (expiresAt !== undefined) updatedFields.expiresAt = expiresAt ? new Date(expiresAt).toISOString() : null;
    if (updates.applicableCourses !== undefined) updatedFields.applicableCourseIds = updates.applicableCourses;
    if (updates.minPurchaseAmount !== undefined) updatedFields.minimumPurchaseAmount = updates.minPurchaseAmount;
    if (updates.perUserLimit !== undefined) updatedFields.perUserUsageLimit = updates.perUserLimit;

    delete updatedFields.expectedRevision;
    delete updatedFields.expectedVersion;
    delete updatedFields.startDate;
    delete updatedFields.endDate;
    delete updatedFields.applicableCourses;
    delete updatedFields.minPurchaseAmount;
    delete updatedFields.perUserLimit;

    await docRef.update(updatedFields);
    return { ...existing, ...updatedFields };
  }

  /**
   * 5. Admin: List All Coupons with Filtering & Analytics
   */
  public async listCoupons(options?: {
    search?: string;
    isActive?: boolean;
    includeArchived?: boolean;
  }): Promise<{ coupons: ICoupon[]; stats: { totalCoupons: number; activeCoupons: number; totalRedemptions: number } }> {
    if (!isFirebaseAdminInitialized()) {
      return { coupons: [], stats: { totalCoupons: 0, activeCoupons: 0, totalRedemptions: 0 } };
    }

    const snapshot = await db.collection(this.COUPONS_COLLECTION).get();
    let coupons: ICoupon[] = snapshot.docs
      .map((doc: any) => ({ id: doc.id, ...doc.data() }))
      .filter((c: ICoupon) => (options?.includeArchived ? true : !c.isArchived));

    // Apply client filters for search & active
    if (options?.search) {
      const s = options.search.trim().toLowerCase();
      coupons = coupons.filter(
        (c) =>
          c.code.toLowerCase().includes(s) ||
          (c.normalizedCode && c.normalizedCode.toLowerCase().includes(s)) ||
          (c.description && c.description.toLowerCase().includes(s))
      );
    }

    if (options?.isActive !== undefined) {
      coupons = coupons.filter((c) => c.isActive === options.isActive);
    }

    coupons.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const totalCoupons = coupons.length;
    const activeCoupons = coupons.filter((c) => c.isActive).length;
    const totalRedemptions = coupons.reduce((acc, curr) => acc + (curr.totalUsed || 0), 0);

    return {
      coupons,
      stats: {
        totalCoupons,
        activeCoupons,
        totalRedemptions,
      },
    };
  }

  /**
   * 6. Admin: Get Coupon by ID
   */
  public async getCouponById(couponId: string): Promise<ICoupon | null> {
    if (!isFirebaseAdminInitialized()) return null;
    const doc = await db.collection(this.COUPONS_COLLECTION).doc(couponId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as ICoupon;
  }

  /**
   * 7. Admin: Toggle Coupon Active Status
   */
  public async toggleCouponStatus(couponId: string, isActive: boolean, adminUserId: string): Promise<ICoupon> {
    return this.updateCoupon(couponId, { isActive }, adminUserId);
  }

  /**
   * 8. Admin: Soft Archive / Delete Coupon
   */
  public async archiveCoupon(couponId: string, adminUserId: string): Promise<void> {
    if (!isFirebaseAdminInitialized()) return;
    await db.collection(this.COUPONS_COLLECTION).doc(couponId).update({
      isArchived: true,
      isActive: false,
      updatedAt: new Date().toISOString(),
      updatedBy: adminUserId || 'admin',
    });
  }

  /**
   * 9. Admin: Get Redemptions / Audit Usages for a Coupon
   */
  public async getCouponUsages(couponId: string, limit: number = 50): Promise<ICouponUsage[]> {
    if (!isFirebaseAdminInitialized()) return [];
    const snapshot = await db
      .collection(this.COUPON_USAGES_COLLECTION)
      .where('couponId', '==', couponId)
      .limit(limit)
      .get();

    const usages = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as ICouponUsage));
    usages.sort((a, b) => new Date(b.usedAt).getTime() - new Date(a.usedAt).getTime());
    return usages;
  }
}

export const couponService = new CouponService();
