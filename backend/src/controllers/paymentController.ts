import { Request, Response } from 'express';
import Stripe from 'stripe';
import { env } from '../config/env';
import { db, isFirebaseAdminInitialized } from '../firebase';
import { paymentService } from '../modules/payments/payment.service';
import logger from '../config/logger';

let stripeInstance: Stripe | null = null;

const getStripe = (): Stripe | null => {
  if (stripeInstance) return stripeInstance;
  const stripeKey = (process.env.STRIPE_SECRET_KEY || env.STRIPE_SECRET_KEY || '').trim();
  if (!stripeKey) {
    return null;
  }
  try {
    stripeInstance = new Stripe(stripeKey, {
      apiVersion: '2025-02-24.acacia' as any,
    });
    return stripeInstance;
  } catch (err) {
    logger.error('[PaymentController] Failed to initialize Stripe client:', err);
    return null;
  }
};

export class PaymentController {
  /**
   * Create Stripe Hosted Checkout Session with Server-Authoritative Price & Coupon Recalculation
   */
  public async createCheckoutSession(req: Request, res: Response): Promise<void> {
    try {
      const studentId = req.body.studentId || (req as any).user?.uid;
      const studentEmail = req.body.studentEmail || (req as any).user?.email;
      const studentName = req.body.studentName || (req as any).user?.displayName || 'Student';
      const { courseIds, couponCode } = req.body;

      if (!studentId || !courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
        res.status(400).json({ success: false, message: 'studentId and an array of courseIds are required.' });
        return;
      }

      const primaryCourseId = courseIds[0];

      // 1. Authoritative Server-Side Order & Coupon Recalculation
      const orderResult = await paymentService.createOrder({
        studentId,
        studentEmail,
        studentName,
        courseId: primaryCourseId,
        couponCode,
      });

      if (!orderResult.success) {
        res.status(400).json({
          success: false,
          message: orderResult.error || 'Failed to create payment order.',
        });
        return;
      }

      // If student is already actively enrolled in this course
      if (orderResult.alreadyEnrolled) {
        res.status(200).json({
          success: true,
          alreadyEnrolled: true,
          message: 'You are already enrolled in this course.',
        });
        return;
      }

      // 2. 100% Coupon / Free Tier Path: Zero-amount order bypasses Stripe payment charge
      if (orderResult.freeCourse || orderResult.finalAmount === 0) {
        res.status(200).json({
          success: true,
          freeCourse: true,
          orderId: orderResult.orderId,
          amount: 0,
          finalAmount: 0,
          message: 'Free enrollment granted successfully.',
        });
        return;
      }

      const finalAmountInRupees = orderResult.finalAmount || 0;
      // Stripe expects integer amounts in paise for INR currency (₹1 = 100 paise)
      const amountInPaise = Math.round(finalAmountInRupees * 100);

      // 3. Initialize Stripe Gateway
      const stripe = getStripe();
      if (!stripe) {
        res.status(503).json({
          success: false,
          message: 'Stripe payment gateway is not configured on this server.',
        });
        return;
      }

      const orderId = orderResult.orderId!;
      const courseTitle = orderResult.course?.title || primaryCourseId;
      const frontendUrl = (process.env.FRONTEND_URL || env.FRONTEND_URL || 'http://localhost:5173').split(',')[0].trim();

      // 4. Create Stripe Hosted Checkout Session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'inr',
              product_data: {
                name: `Enrollment: ${courseTitle}`,
                description: `KaizenQ Course Track (${primaryCourseId})`,
              },
              unit_amount: amountInPaise,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${frontendUrl}/dashboard?payment_success=true&order_id=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${frontendUrl}/dashboard?payment_canceled=true&order_id=${orderId}`,
        client_reference_id: orderId,
        metadata: {
          studentId,
          studentEmail: studentEmail || '',
          studentName: studentName || '',
          courseIds: courseIds.join(','),
          courseId: primaryCourseId,
          orderId,
          couponCode: orderResult.couponCode || '',
          originalAmount: String(orderResult.originalAmount || finalAmountInRupees),
          discountAmount: String(orderResult.discountAmount || 0),
          finalAmount: String(finalAmountInRupees),
          amountInPaise: String(amountInPaise),
        },
      });

      // Update Firestore payment record with Stripe provider details
      if (isFirebaseAdminInitialized()) {
        await db.collection('payments').doc(orderId).set(
          {
            provider: 'stripe',
            stripeSessionId: session.id,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        ).catch(() => null);
      }

      res.status(200).json({
        success: true,
        checkoutUrl: session.url,
        orderId,
        sessionId: session.id,
        amount: finalAmountInRupees,
        amountInPaise,
      });
    } catch (error: any) {
      logger.error('[PaymentController] Error creating checkout session:', error);
      res.status(500).json({ success: false, message: error.message || 'Payment processing failed' });
    }
  }

  /**
   * Stripe Webhook Handler (Idempotent signature validation & event handling)
   */
  public async stripeWebhook(req: Request, res: Response): Promise<void> {
    const stripe = getStripe();
    if (!stripe) {
      res.status(500).send('Stripe is not configured');
      return;
    }

    const sig = req.headers['stripe-signature'] as string;
    let event: Stripe.Event;

    const webhookSecret = (process.env.STRIPE_WEBHOOK_SECRET || env.STRIPE_WEBHOOK_SECRET || '').trim();

    try {
      if (webhookSecret && sig) {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      } else {
        // If raw webhook body is already parsed or in development without secret signature
        event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      }
    } catch (err: any) {
      logger.error('[PaymentController] Webhook signature verification failed:', err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const { studentId, studentEmail, studentName, courseIds, courseId, orderId } = session.metadata || {};
      const actualOrderId = orderId || session.client_reference_id;
      const targetCourseId = courseId || (courseIds ? courseIds.split(',')[0] : '');

      if (actualOrderId && studentId && targetCourseId) {
        try {
          // Idempotently verify payment in Firestore, activate enrollment, and record coupon usage
          await paymentService.verifyPayment({
            orderId: actualOrderId,
            paymentId: (session.payment_intent as string) || session.id,
            signature: 'stripe_webhook_verified',
            studentId,
            studentEmail,
            studentName,
            courseId: targetCourseId,
          });
        } catch (dbError) {
          logger.error('[PaymentController] Database error during webhook processing:', dbError);
        }
      }
    } else if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata?.orderId;
      if (orderId && isFirebaseAdminInitialized()) {
        await db.collection('payments').doc(orderId).set(
          { status: 'FAILED', updatedAt: new Date().toISOString() },
          { merge: true }
        ).catch(() => null);
      }
    }

    res.json({ received: true });
  }

  /**
   * Authoritative Free Enrollment with dynamic 100% coupon or Free Tier validation
   */
  public async enrollFreeWithCoupon(req: Request, res: Response): Promise<void> {
    try {
      const studentId = req.body.studentId || (req as any).user?.uid;
      const studentEmail = req.body.studentEmail || (req as any).user?.email;
      const studentName = req.body.studentName || (req as any).user?.displayName || 'Student';
      const { courseIds, couponCode } = req.body;

      if (!studentId || !courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
        res.status(400).json({ success: false, message: 'studentId and courseIds array are required.' });
        return;
      }

      const primaryCourseId = courseIds[0];

      // Authoritatively validate course price and coupon via PaymentService
      const orderResult = await paymentService.createOrder({
        studentId,
        studentEmail,
        studentName,
        courseId: primaryCourseId,
        couponCode: couponCode || (courseIds.length === 1 ? undefined : undefined),
      });

      if (!orderResult.success) {
        res.status(400).json({ success: false, message: orderResult.error || 'Invalid coupon or enrollment request.' });
        return;
      }

      if (orderResult.finalAmount === 0 || orderResult.freeCourse || orderResult.alreadyEnrolled) {
        res.status(200).json({
          success: true,
          message: 'Successfully enrolled for free.',
          alreadyEnrolled: orderResult.alreadyEnrolled,
          orderId: orderResult.orderId,
        });
        return;
      }

      // If the course is not free and coupon doesn't provide 100% discount
      res.status(400).json({
        success: false,
        message: `This course requires payment of ₹${orderResult.finalAmount}. Please proceed to checkout.`,
      });
    } catch (error: any) {
      logger.error('[PaymentController] Error in free enrollment:', error);
      res.status(500).json({ success: false, message: error.message || 'Free enrollment failed' });
    }
  }
}
