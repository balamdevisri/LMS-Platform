import { Request, Response, NextFunction } from 'express';
import { paymentService } from './payment.service';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export class PaymentController {
  // POST /api/payments/create-order
  public async createOrder(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentId = req.user?.uid || (req.body.studentId as string);
      const studentEmail = req.user?.email || (req.body.studentEmail as string);
      const studentName = (req.body.studentName as string) || 'Student';
      const { courseId } = req.body;

      if (!studentId) {
        res.status(401).json({ success: false, error: 'Unauthorized: Student authentication required' });
        return;
      }

      if (!courseId) {
        res.status(400).json({ success: false, error: 'courseId is required' });
        return;
      }

      const result = await paymentService.createOrder({
        studentId,
        studentEmail,
        studentName,
        courseId,
      });

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  // POST /api/payments/verify
  public async verifyPayment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentId = req.user?.uid || (req.body.studentId as string);
      const studentEmail = req.user?.email || (req.body.studentEmail as string);
      const studentName = (req.body.studentName as string) || 'Student';
      const { orderId, paymentId, signature, courseId } = req.body;

      if (!studentId) {
        res.status(401).json({ success: false, error: 'Unauthorized: Student authentication required' });
        return;
      }

      if (!orderId) {
        res.status(400).json({ success: false, error: 'orderId is required for payment verification' });
        return;
      }

      const result = await paymentService.verifyPayment({
        orderId,
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
    } catch (err) {
      next(err);
    }
  }

  // GET /api/payments/history or /api/payments/my-payments
  public async getPaymentHistory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentId = req.user?.uid || (req.query.studentId as string);
      if (!studentId) {
        res.status(401).json({ success: false, error: 'Unauthorized: Student authentication required' });
        return;
      }

      const history = await paymentService.getStudentPaymentHistory(studentId);
      res.json({ success: true, count: history.length, data: history });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/payments/:id
  public async getPayment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentId = req.user?.uid || (req.query.studentId as string);
      const userRole = req.user?.role || 'student';
      const paymentId = String(req.params.id || '');

      if (!studentId) {
        res.status(401).json({ success: false, error: 'Unauthorized: Student authentication required' });
        return;
      }

      const payment = await paymentService.getPayment(paymentId, studentId, userRole);
      if (!payment) {
        res.status(404).json({ success: false, error: 'Payment record not found' });
        return;
      }

      res.json({ success: true, payment });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/payments/webhook
  public async webhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rawSig = req.headers['x-razorpay-signature'] || req.headers['x-signature'];
      const signature = Array.isArray(rawSig) ? rawSig[0] : (rawSig as string | undefined);
      const result = await paymentService.handleWebhook(req.body, signature);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

export const paymentController = new PaymentController();
