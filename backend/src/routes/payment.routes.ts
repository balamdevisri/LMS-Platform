import { Router } from 'express';
import express from 'express';
import { PaymentController as StripePaymentController } from '../controllers/paymentController';
import { paymentController } from '../modules/payments/payment.controller';
import { extractOptionalUser } from '../middleware/auth.middleware';

const router = Router();
const stripeController = new StripePaymentController();

// 1. In-house Secure Payment Order Creation (with coupon calculation)
router.post('/create-order', extractOptionalUser as any, (req, res, next) =>
  paymentController.createOrder(req as any, res, next)
);

// 2. In-house Server-side Payment Verification (with atomic coupon usage tracking)
router.post('/verify', extractOptionalUser as any, (req, res, next) =>
  paymentController.verifyPayment(req as any, res, next)
);

// 3. Payment History
router.get('/history', extractOptionalUser as any, (req, res, next) =>
  paymentController.getPaymentHistory(req as any, res, next)
);

router.get('/my-payments', extractOptionalUser as any, (req, res, next) =>
  paymentController.getPaymentHistory(req as any, res, next)
);

router.get('/:id', extractOptionalUser as any, (req, res, next) =>
  paymentController.getPayment(req as any, res, next)
);

// 4. Stripe Checkout Session & Free Grant
router.post('/create-checkout-session', express.json(), (req, res, next) =>
  stripeController.createCheckoutSession(req, res).catch(next)
);

router.post('/enroll-free', express.json(), (req, res, next) =>
  stripeController.enrollFreeWithCoupon(req, res).catch(next)
);

// 5. Stripe Webhook (with raw payload parsing)
router.post('/webhook', express.raw({ type: 'application/json' }), (req, res, next) =>
  stripeController.stripeWebhook(req, res).catch(next)
);

export default router;
