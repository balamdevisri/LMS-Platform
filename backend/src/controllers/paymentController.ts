import { Request, Response } from 'express';
import { env } from '../config/env';
import { db, isFirebaseAdminInitialized } from '../firebase';
import { paymentService, getRazorpay } from '../modules/payments/payment.service';
import logger from '../config/logger';

export class PaymentController {
  /**
   * 1. Create Razorpay Payment Order with Server-Authoritative Price & Coupon Recalculation
   */
  public async createCheckoutSession(req: Request, res: Response): Promise<void> {
    try {
      const studentId = req.body.studentId || (req as any).user?.uid;
      const studentEmail = req.body.studentEmail || (req as any).user?.email;
      const studentName = req.body.studentName || (req as any).user?.displayName || 'Student';
      const { courseIds, courseId, couponCode } = req.body;

      const targetCourseIds = Array.isArray(courseIds) && courseIds.length > 0
        ? courseIds
        : (courseId ? [courseId] : []);

      if (!studentId || targetCourseIds.length === 0) {
        res.status(400).json({ success: false, message: 'studentId and courseIds are required.' });
        return;
      }

      const primaryCourseId = targetCourseIds[0];

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

      // 2. 100% Coupon / Free Tier Path: Zero-amount order bypasses Razorpay payment gateway
      if (orderResult.freeCourse || orderResult.finalAmount === 0) {
        res.status(200).json({
          success: true,
          freeCourse: true,
          orderId: orderResult.orderId,
          amount: 0,
          amountInPaise: 0,
          finalAmount: 0,
          message: 'Free enrollment granted successfully.',
        });
        return;
      }

      const finalAmountInRupees = orderResult.finalAmount || 0;
      const amountInPaise = orderResult.amountInPaise || Math.round(finalAmountInRupees * 100);
      const publicRazorpayKeyId = (process.env.RAZORPAY_KEY_ID || env.RAZORPAY_KEY_ID || '').trim();

      res.status(200).json({
        success: true,
        orderId: orderResult.orderId,
        razorpayOrderId: orderResult.razorpayOrderId,
        keyId: publicRazorpayKeyId,
        amount: finalAmountInRupees,
        amountInPaise,
        currency: 'INR',
        course: orderResult.course,
      });
    } catch (error: any) {
      logger.error('[PaymentController] Error creating Razorpay checkout session:', error);
      res.status(500).json({ success: false, message: error.message || 'Payment order processing failed' });
    }
  }

  /**
   * 2. Verify Razorpay Payment Server-Side
   */
  public async verifyPayment(req: Request, res: Response): Promise<void> {
    try {
      const studentId = req.body.studentId || (req as any).user?.uid;
      const studentEmail = req.body.studentEmail || (req as any).user?.email;
      const studentName = (req.body.studentName as string) || 'Student';
      const {
        orderId,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        paymentId,
        signature,
        courseId,
      } = req.body;

      if (!studentId) {
        res.status(401).json({ success: false, error: 'Unauthorized: Student authentication required' });
        return;
      }

      const effectiveOrderId = orderId || razorpay_order_id;
      if (!effectiveOrderId) {
        res.status(400).json({ success: false, error: 'orderId or razorpay_order_id is required' });
        return;
      }

      const result = await paymentService.verifyPayment({
        orderId: effectiveOrderId,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        paymentId,
        signature,
        studentId,
        studentEmail,
        studentName,
        courseId,
      });

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.json(result);
    } catch (error: any) {
      logger.error('[PaymentController] Error verifying Razorpay payment:', error);
      res.status(500).json({ success: false, error: error.message || 'Payment verification failed' });
    }
  }

  /**
   * 3. Razorpay Webhook Handler (Idempotent signature validation & event handling)
   */
  public async razorpayWebhook(req: Request, res: Response): Promise<void> {
    try {
      const rawSig = req.headers['x-razorpay-signature'] || req.headers['x-signature'] || req.headers['stripe-signature'];
      const signature = Array.isArray(rawSig) ? rawSig[0] : (rawSig as string | undefined);
      
      const rawBody = typeof req.body === 'string'
        ? req.body
        : (req.body instanceof Buffer ? req.body.toString('utf8') : JSON.stringify(req.body));

      let parsedEvent = req.body;
      if (typeof req.body === 'string' || req.body instanceof Buffer) {
        try {
          parsedEvent = JSON.parse(req.body.toString());
        } catch (e) {
          parsedEvent = {};
        }
      }

      const result = await paymentService.handleWebhook(parsedEvent, signature, rawBody);
      res.status(result.success ? 200 : 400).json(result);
    } catch (err: any) {
      logger.error('[PaymentController] Razorpay webhook processing error:', err);
      res.status(500).json({ success: false, message: err.message || 'Webhook processing failed' });
    }
  }

  /**
   * Legacy alias for webhook endpoint
   */
  public async stripeWebhook(req: Request, res: Response): Promise<void> {
    return this.razorpayWebhook(req, res);
  }

  /**
   * 4. Authoritative Free Enrollment with dynamic 100% coupon or Free Tier validation
   */
  public async enrollFreeWithCoupon(req: Request, res: Response): Promise<void> {
    try {
      const studentId = req.body.studentId || (req as any).user?.uid;
      const studentEmail = req.body.studentEmail || (req as any).user?.email;
      const studentName = req.body.studentName || (req as any).user?.displayName || 'Student';
      const { courseIds, courseId, couponCode } = req.body;

      const targetCourseIds = Array.isArray(courseIds) && courseIds.length > 0
        ? courseIds
        : (courseId ? [courseId] : []);

      if (!studentId || targetCourseIds.length === 0) {
        res.status(400).json({ success: false, message: 'studentId and courseIds are required.' });
        return;
      }

      const primaryCourseId = targetCourseIds[0];

      // Authoritatively validate course price and coupon via PaymentService
      const orderResult = await paymentService.createOrder({
        studentId,
        studentEmail,
        studentName,
        courseId: primaryCourseId,
        couponCode,
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

export const paymentController = new PaymentController();
