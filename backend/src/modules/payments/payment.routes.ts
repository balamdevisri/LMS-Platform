import { Router } from 'express';
import { paymentController } from './payment.controller';
import { extractOptionalUser, verifyFirebaseToken } from '../../middleware/auth.middleware';

const router = Router();

// Order creation & payment verification (accepts Firebase token or fallback session user)
router.post('/create-order', extractOptionalUser as any, (req, res, next) =>
  paymentController.createOrder(req as any, res, next)
);

router.post('/verify', extractOptionalUser as any, (req, res, next) =>
  paymentController.verifyPayment(req as any, res, next)
);

router.get('/:id', extractOptionalUser as any, (req, res, next) =>
  paymentController.getPayment(req as any, res, next)
);

// Payment Gateway Webhook
router.post('/webhook', (req, res, next) =>
  paymentController.webhook(req, res, next)
);

export default router;
