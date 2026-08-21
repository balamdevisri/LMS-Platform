import { Request, Response } from 'express';
import Stripe from 'stripe';
import { env } from '../config/env';
import { db, isFirebaseAdminInitialized } from '../firebase';
import { emailService } from '../services/email/EmailService';

const stripeKey = process.env.STRIPE_SECRET_KEY || env.STRIPE_SECRET_KEY || '';
const stripe = new Stripe(stripeKey, {
  apiVersion: '2025-02-24.acacia',
});

// Mock Prices fallback if not fetched from DB
const COURSE_PRICES: Record<string, number> = {
  'linux-systems-administration-mastery': 399,
  'git-github-mastery': 199,
  'dbms-beginner-to-advanced': 299,
  'kubernetes-complete-course': 499,
  'react-js-complete-course': 299,
  'c-programming': 199,
  'python-through-oops': 299,
  'java-through-oops': 299,
};

const BUNDLE_PRICES: Record<number, number> = {
  2: 249,
  3: 349,
  5: 449,
  8: 499,
};

export class PaymentController {
  
  public async createCheckoutSession(req: Request, res: Response): Promise<void> {
    try {
      const { studentId, studentEmail, studentName, courseIds } = req.body;

      if (!studentId || !courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
        res.status(400).json({ success: false, message: 'studentId and an array of courseIds are required.' });
        return;
      }

      // Calculate Total Amount
      let totalAmount = 0;
      const numCourses = courseIds.length;

      if (numCourses === 1) {
        // Individual course pricing
        const price = COURSE_PRICES[courseIds[0]] || 499; // fallback
        totalAmount = price;
      } else {
        // Bundle pricing
        if (numCourses === 2) totalAmount = BUNDLE_PRICES[2];
        else if (numCourses === 3) totalAmount = BUNDLE_PRICES[3];
        else if (numCourses === 5) totalAmount = BUNDLE_PRICES[5];
        else if (numCourses >= 8) totalAmount = BUNDLE_PRICES[8];
        else {
          totalAmount = numCourses * 199; // fallback
        }
      }

      // In INR, Stripe expects amount in paise (1 INR = 100 paise)
      const amountInPaise = totalAmount * 100;
      
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      // Create Payment records in PENDING state in Firestore
      if (isFirebaseAdminInitialized()) {
        for (const courseId of courseIds) {
          const courseAmount = numCourses === 1 ? totalAmount : (totalAmount / numCourses);
          await db.collection('payments').doc(`${orderId}_${courseId}`).set({
            studentId,
            studentEmail: studentEmail || '',
            studentName: studentName || '',
            courseId,
            orderId,
            amount: courseAmount,
            currency: 'INR',
            status: 'PENDING',
            provider: 'stripe',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'inr',
              product_data: {
                name: numCourses === 1 ? `Enrollment for ${courseIds[0]}` : `Bundle Enrollment (${numCourses} courses)`,
                description: `KaizenQ Learning Platform (${numCourses} courses)`,
              },
              unit_amount: amountInPaise,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL || 'https://www.kaizenq.in'}/dashboard?payment_success=true&order_id=${orderId}`,
        cancel_url: `${process.env.FRONTEND_URL || 'https://www.kaizenq.in'}/dashboard?payment_canceled=true`,
        client_reference_id: orderId,
        metadata: {
          studentId,
          studentEmail: studentEmail || '',
          studentName: studentName || '',
          courseIds: courseIds.join(','),
          orderId,
        },
      });

      res.status(200).json({ success: true, checkoutUrl: session.url, orderId });
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async stripeWebhook(req: Request, res: Response): Promise<void> {
    const sig = req.headers['stripe-signature'] as string;
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      );
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      const { studentId, studentEmail, studentName, courseIds, orderId } = session.metadata || {};
      
      if (orderId && courseIds && studentId && isFirebaseAdminInitialized()) {
        const courseArray = courseIds.split(',');
        
        try {
          const nowIso = new Date().toISOString();
          
          for (const courseId of courseArray) {
            const paymentDocId = `${orderId}_${courseId}`;
            await db.collection('payments').doc(paymentDocId).set(
              {
                status: 'SUCCESS',
                transactionId: (session.payment_intent as string) || session.id,
                paidAt: nowIso,
                updatedAt: nowIso,
              },
              { merge: true }
            );

            // Upsert enrollment in Firestore
            const enrollDocId = `${studentId}_${courseId}`;
            await db.collection('enrollments').doc(enrollDocId).set(
              {
                studentId,
                studentEmail: studentEmail || '',
                studentName: studentName || '',
                courseId,
                paymentId: orderId,
                status: 'ACTIVE',
                accessType: 'PAID',
                enrolledAt: nowIso,
                updatedAt: nowIso,
              },
              { merge: true }
            );

            // Send confirmation email asynchronously
            if (studentEmail) {
              emailService
                .sendCourseEnrollmentEmail({
                  studentName: studentName || 'Student',
                  studentEmail,
                  courseTitle: courseId.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
                  courseId,
                  courseUrl: `https://www.kaizenq.in/courses/${courseId}`,
                  certificateAvailable: true,
                  enrollmentId: enrollDocId,
                })
                .catch((emailErr) => {
                  console.warn('[PaymentController] Stripe webhook email notice:', emailErr?.message || emailErr);
                });
            }
          }
        } catch (dbError) {
          console.error('Database error during webhook processing:', dbError);
        }
      }
    }

    res.json({ received: true });
  }

  public async enrollFreeWithCoupon(req: Request, res: Response): Promise<void> {
    try {
      const { studentId, studentEmail, studentName, courseIds, couponCode } = req.body;

      if (!studentId || !courseIds || !Array.isArray(courseIds) || courseIds.length === 0 || !couponCode) {
        res.status(400).json({ success: false, message: 'studentId, courseIds array, and couponCode are required.' });
        return;
      }

      if (couponCode !== 'SG2026') {
        res.status(400).json({ success: false, message: 'Invalid or expired coupon code.' });
        return;
      }

      const orderId = `free_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const nowIso = new Date().toISOString();

      for (const courseId of courseIds) {
        if (isFirebaseAdminInitialized()) {
          const paymentDocId = `${orderId}_${courseId}`;
          await db.collection('payments').doc(paymentDocId).set({
            studentId,
            studentEmail: studentEmail || '',
            studentName: studentName || '',
            courseId,
            orderId,
            amount: 0,
            currency: 'INR',
            status: 'SUCCESS',
            provider: 'free_grant',
            paidAt: nowIso,
            createdAt: nowIso,
            updatedAt: nowIso,
          });

          const enrollDocId = `${studentId}_${courseId}`;
          await db.collection('enrollments').doc(enrollDocId).set(
            {
              studentId,
              studentEmail: studentEmail || '',
              studentName: studentName || '',
              courseId,
              paymentId: orderId,
              status: 'ACTIVE',
              accessType: 'FREE',
              enrolledAt: nowIso,
              updatedAt: nowIso,
            },
            { merge: true }
          );
        }

        // Asynchronous non-blocking confirmation email with idempotency
        if (studentEmail) {
          emailService
            .sendCourseEnrollmentEmail({
              studentName: studentName || 'Student',
              studentEmail,
              courseTitle: courseId.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
              courseId,
              courseUrl: `https://www.kaizenq.in/courses/${courseId}`,
              certificateAvailable: true,
              enrollmentId: `${orderId}_${courseId}`,
            })
            .catch((emailErr) => {
              console.warn('[PaymentController] Free enrollment email notice:', emailErr?.message || emailErr);
            });
        }
      }

      res.status(200).json({ success: true, message: 'Successfully enrolled for free.' });
    } catch (error: any) {
      console.error('Error in free enrollment:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
