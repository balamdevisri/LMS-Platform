import { Router } from 'express';
import express from 'express';
import { paymentController } from '../controllers/paymentController';
import { paymentController as modulesPaymentController } from '../modules/payments/payment.controller';
import { extractOptionalUser } from '../middleware/auth.middleware';

const router = Router();

// 1. Authoritative Razorpay Payment Order Creation (with coupon calculation)
router.post('/create-order', extractOptionalUser as any, express.json(), (req, res, next) =>
  paymentController.createCheckoutSession(req, res).catch(next)
);

router.post('/create-checkout-session', extractOptionalUser as any, express.json(), (req, res, next) =>
  paymentController.createCheckoutSession(req, res).catch(next)
);

// 2. Server-side Razorpay Payment Verification (with HMAC signature & atomic coupon usage)
router.post('/verify', extractOptionalUser as any, express.json(), (req, res, next) =>
  paymentController.verifyPayment(req, res).catch(next)
);

// 3. Free Enrollment Grant (100% discount / free courses)
router.post('/enroll-free', extractOptionalUser as any, express.json(), (req, res, next) =>
  paymentController.enrollFreeWithCoupon(req, res).catch(next)
);

// 4. Payment History & Details
router.get('/history', extractOptionalUser as any, (req, res, next) =>
  modulesPaymentController.getPaymentHistory(req as any, res, next)
);

router.get('/my-payments', extractOptionalUser as any, (req, res, next) =>
  modulesPaymentController.getPaymentHistory(req as any, res, next)
);

router.get('/:id', extractOptionalUser as any, (req, res, next) =>
  modulesPaymentController.getPayment(req as any, res, next)
);

// 5. Razorpay Webhook (with raw payload preservation for signature verification)
router.post(
  '/webhook',
  express.raw({ type: '*/*' }),
  (req, res, next) => paymentController.razorpayWebhook(req, res).catch(next)
);

export default router;
