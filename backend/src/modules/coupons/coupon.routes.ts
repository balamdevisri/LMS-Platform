import { Router } from 'express';
import { couponController } from './coupon.controller';
import { verifyFirebaseToken, requireRole, extractOptionalUser } from '../../middleware/auth.middleware';

const router = Router();

// Student / Public endpoint for validating & previewing coupons
router.post('/validate', extractOptionalUser as any, (req, res, next) =>
  couponController.validateCoupon(req as any, res, next)
);

// Admin-only CRUD and analytics endpoints
router.get('/', verifyFirebaseToken as any, requireRole('admin') as any, (req, res, next) =>
  couponController.listCoupons(req as any, res, next)
);

router.post('/', verifyFirebaseToken as any, requireRole('admin') as any, (req, res, next) =>
  couponController.createCoupon(req as any, res, next)
);

router.get('/:id', verifyFirebaseToken as any, requireRole('admin') as any, (req, res, next) =>
  couponController.getCouponById(req as any, res, next)
);

router.put('/:id', verifyFirebaseToken as any, requireRole('admin') as any, (req, res, next) =>
  couponController.updateCoupon(req as any, res, next)
);

router.patch('/:id/toggle', verifyFirebaseToken as any, requireRole('admin') as any, (req, res, next) =>
  couponController.toggleCoupon(req as any, res, next)
);

router.delete('/:id', verifyFirebaseToken as any, requireRole('admin') as any, (req, res, next) =>
  couponController.archiveCoupon(req as any, res, next)
);

router.get('/:id/usages', verifyFirebaseToken as any, requireRole('admin') as any, (req, res, next) =>
  couponController.getCouponUsages(req as any, res, next)
);

export default router;
