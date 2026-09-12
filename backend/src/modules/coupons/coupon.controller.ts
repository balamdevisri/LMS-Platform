import { Request, Response, NextFunction } from 'express';
import { couponService } from './coupon.service';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { formatResponse } from '../../utils/responseFormatter';

export class CouponController {
  /**
   * POST /api/coupons/validate (Public / Student preview)
   */
  public async validateCoupon(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { couponCode, courseId, coursePrice } = req.body;
      const userId = req.user?.uid || (req.headers['x-user-id'] as string);

      if (!couponCode || !courseId) {
        res.status(400).json(
          formatResponse(false, null, 'couponCode and courseId are required for validation')
        );
        return;
      }

      const result = await couponService.validateCoupon({
        couponCode,
        courseId,
        userId,
        coursePrice: typeof coursePrice === 'number' ? coursePrice : undefined,
      });

      if (!result.valid) {
        res.status(400).json({
          success: false,
          valid: false,
          code: result.code,
          message: result.message,
          error: result.message,
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: result,
        ...result,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/coupons (Admin only)
   */
  public async listCoupons(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const search = (req.query.search as string) || undefined;
      const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;
      const includeArchived = req.query.includeArchived === 'true';

      const result = await couponService.listCoupons({ search, isActive, includeArchived });
      res.status(200).json(formatResponse(true, result, 'Coupons fetched successfully'));
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/coupons (Admin only)
   */
  public async createCoupon(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const adminUserId = req.user?.uid || 'admin';
      const coupon = await couponService.createCoupon(req.body, adminUserId);
      res.status(201).json(formatResponse(true, coupon, 'Coupon created successfully'));
    } catch (err: any) {
      res.status(400).json(formatResponse(false, null, err.message || 'Failed to create coupon'));
    }
  }

  /**
   * GET /api/coupons/:id (Admin only)
   */
  public async getCouponById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const couponId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const coupon = await couponService.getCouponById(couponId);
      if (!coupon) {
        res.status(404).json(formatResponse(false, null, 'Coupon not found'));
        return;
      }
      res.status(200).json(formatResponse(true, coupon, 'Coupon retrieved successfully'));
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/coupons/:id (Admin only)
   */
  public async updateCoupon(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const couponId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const adminUserId = req.user?.uid || 'admin';
      const updated = await couponService.updateCoupon(couponId, req.body, adminUserId);
      res.status(200).json(formatResponse(true, updated, 'Coupon updated successfully'));
    } catch (err: any) {
      if (err.status === 409 || err.code === 409) {
        res.status(409).json({ success: false, conflict: true, message: err.message, error: err.message });
        return;
      }
      res.status(400).json(formatResponse(false, null, err.message || 'Failed to update coupon'));
    }
  }

  /**
   * PATCH /api/coupons/:id/toggle (Admin only)
   */
  public async toggleCoupon(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const couponId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { isActive } = req.body;
      const adminUserId = req.user?.uid || 'admin';
      const updated = await couponService.toggleCouponStatus(couponId, Boolean(isActive), adminUserId);
      res.status(200).json(formatResponse(true, updated, `Coupon ${isActive ? 'activated' : 'deactivated'} successfully`));
    } catch (err: any) {
      res.status(400).json(formatResponse(false, null, err.message || 'Failed to toggle coupon status'));
    }
  }

  /**
   * DELETE /api/coupons/:id (Admin only)
   */
  public async archiveCoupon(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const couponId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const adminUserId = req.user?.uid || 'admin';
      await couponService.archiveCoupon(couponId, adminUserId);
      res.status(200).json(formatResponse(true, null, 'Coupon archived successfully'));
    } catch (err: any) {
      res.status(400).json(formatResponse(false, null, err.message || 'Failed to archive coupon'));
    }
  }

  /**
   * GET /api/coupons/:id/usages (Admin only)
   */
  public async getCouponUsages(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const couponId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const limit = req.query.limit ? Number(req.query.limit) : 50;
      const usages = await couponService.getCouponUsages(couponId, limit);
      res.status(200).json(formatResponse(true, usages, 'Coupon usages fetched successfully'));
    } catch (err) {
      next(err);
    }
  }
}

export const couponController = new CouponController();
