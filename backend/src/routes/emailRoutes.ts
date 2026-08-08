/**
 * SHAIVIKA LMS AI Platform - Email System API Routes
 * KaizenQ - Powered by SHAIVIKA GROUPS
 */

import { Router, Request, Response } from 'express';
import { emailService } from '../services/email/EmailService';
import { EmailEventType } from '../types/emailTypes';
import { env } from '../config/env';
import { z } from 'zod';
import { EmailController } from '../controllers/emailController';
import { verifyFirebaseToken, requireRole } from '../middleware/auth.middleware';

const router = Router();
const emailController = new EmailController();

const sendEmailSchema = z.object({
  eventType: z.nativeEnum(EmailEventType),
  recipientEmail: z.string().email(),
  payload: z.record(z.any()),
});

router.get('/test-email', async (req: Request, res: Response) => {
  try {
    const targetEmail = (req.query.email as string) || (req.body && req.body.email) || env.SMTP_EMAIL || 'shaivikagroups@gmail.com';
    const result = await emailService.sendDirectHtmlEmail(
      targetEmail,
      'SMTP Test',
      '<h1>KaizenQ AI LMS</h1><p>Hello Mawa</p>',
      'Hello Mawa'
    );

    const info = {
      accepted: result.accepted || [targetEmail],
      rejected: result.rejected || [],
      response: result.response || '250 OK',
      messageId: result.messageId || null,
    };

    console.log(info);
    return res.json(info);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json(err);
  }
});

/**
 * POST /api/email/send
 */
router.post('/send', async (req: Request, res: Response) => {
  try {
    const parseResult = sendEmailSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Invalid request payload',
        details: parseResult.error.flatten(),
      });
    }

    const { eventType, recipientEmail, payload } = parseResult.data;

    const result = await emailService.sendEventEmail(eventType, recipientEmail, payload);

    if (result.success) {
      return res.status(200).json({
        message: `Email for event '${eventType}' dispatched successfully.`,
        messageId: result.messageId,
        logId: result.logId,
      });
    } else {
      return res.status(500).json({
        error: 'Failed to send email',
        details: result.error,
        logId: result.logId,
      });
    }
  } catch (err: any) {
    return res.status(500).json({
      error: 'Internal server error processing email request',
      message: err?.message || String(err),
    });
  }
});

/**
 * POST /api/email/retry
 */
router.post('/retry', verifyFirebaseToken as any, requireRole('admin') as any, async (req: Request, res: Response) => {
  try {
    const maxRetries = parseInt(req.body.maxRetries as string, 10) || 3;
    const result = await emailService.retryFailedEmails(maxRetries);

    return res.status(200).json({
      message: 'Email retry worker completed execution.',
      summary: result,
    });
  } catch (err: any) {
    return res.status(500).json({
      error: 'Failed executing email retry worker',
      message: err?.message || String(err),
    });
  }
});

/**
 * GET /api/email/logs
 */
router.get('/logs', verifyFirebaseToken as any, requireRole('admin') as any, (req, res, next) => emailController.getLogs(req, res, next));

/**
 * POST /api/email/resend
 */
router.post('/resend', verifyFirebaseToken as any, requireRole('admin') as any, (req, res, next) => emailController.resendEmail(req, res, next));

/**
 * POST /api/email/test
 */
router.post('/test', verifyFirebaseToken as any, requireRole('admin') as any, async (req: Request, res: Response) => {
  try {
    const targetEmail = req.body.email || env.SMTP_EMAIL || 'kaizenqlms@gmail.com';
    const result = await emailService.sendEventEmail(
      EmailEventType.STUDENT_REGISTRATION,
      targetEmail,
      {
        studentName: 'Shaivika Tester',
        email: targetEmail,
        verificationLink: 'https://shaivika.com/verify?token=demo_test_token_123',
        dashboardUrl: 'https://shaivika.com/dashboard',
      }
    );

    return res.status(200).json({
      message: 'Test registration email sent successfully.',
      result,
    });
  } catch (err: any) {
    return res.status(500).json({
      error: 'Failed sending test email',
      message: err?.message || String(err),
    });
  }
});

export default router;
