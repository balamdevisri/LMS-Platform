/**
 * SHAIVIKA LMS AI Platform - Email System API Routes
 * KaizenQ - Powered by SHAIVIKA GROUPS
 */

import { Router, Request, Response } from 'express';
import { emailService } from '../services/email/EmailService';
import { EmailEventType } from '../types/emailTypes';
import { z } from 'zod';

const router = Router();

const sendEmailSchema = z.object({
  eventType: z.nativeEnum(EmailEventType),
  recipientEmail: z.string().email(),
  payload: z.record(z.any()),
});

/**
 * POST /api/email/send
 * Programmatically send an event email notification
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
 * Triggers automated retry worker for failed emails
 */
router.post('/retry', async (req: Request, res: Response) => {
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
 * Fetches recent email delivery log records from Firestore
 */
router.get('/logs', async (req: Request, res: Response) => {
  try {
    const limitCount = parseInt(req.query.limit as string, 10) || 50;
    const logs = await emailService.getEmailLogs(limitCount);

    return res.status(200).json({
      count: logs.length,
      logs,
    });
  } catch (err: any) {
    return res.status(500).json({
      error: 'Failed fetching email logs',
      message: err?.message || String(err),
    });
  }
});

/**
 * POST /api/email/test
 * Send a sample verification/welcome email to test environment setup
 */
router.post('/test', async (req: Request, res: Response) => {
  try {
    const targetEmail = req.body.email || 'student.test@shaivika.com';
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
