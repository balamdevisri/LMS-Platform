import { Router } from 'express';
import express from 'express';
import { PaymentController } from '../controllers/paymentController';

const router = Router();
const controller = new PaymentController();

// Use express.raw for webhook to validate Stripe signature
router.post('/webhook', express.raw({ type: 'application/json' }), (req, res, next) => controller.stripeWebhook(req, res).catch(next));

// Checkout session creation
router.post('/create-checkout-session', express.json(), (req, res, next) => controller.createCheckoutSession(req, res).catch(next));

// Free enrollment with coupon
router.post('/enroll-free', express.json(), (req, res, next) => controller.enrollFreeWithCoupon(req, res).catch(next));

export default router;
