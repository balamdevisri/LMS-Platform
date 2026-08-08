import { Request, Response, NextFunction } from 'express';
import { emailService } from '../services/email/EmailService';
import { db } from '../firebase';
import logger from '../config/logger';

export class EmailController {
  /**
   * Flow 6: Fetch email logs
   */
  public async getLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limitCount = parseInt(req.query.limit as string, 10) || 50;
      const logs = await emailService.getEmailLogs(limitCount);

      res.status(200).json({
        success: true,
        count: logs.length,
        logs,
      });
    } catch (err: any) {
      logger.error(`[emailController] getLogs error: ${err?.message || err}`);
      res.status(500).json({ success: false, error: err?.message || 'Internal server error' });
    }
  }

  /**
   * Flow 7: Manual resend/retry a failed email log
   */
  public async resendEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { logId } = req.body;
      if (!logId) {
        res.status(400).json({ success: false, error: 'logId is required in request body' });
        return;
      }

      if (!db) {
        res.status(500).json({ success: false, error: 'Database service is unavailable' });
        return;
      }

      // Fetch the log document from Firestore
      const docRef = db.collection('email_logs').doc(logId);
      const docSnap = await docRef.get();

      if (!docSnap.exists) {
        res.status(404).json({ success: false, error: `Email log with ID ${logId} not found` });
        return;
      }

      const logData = docSnap.data() || {};
      const { eventType, recipientEmail, payload } = logData;

      if (!eventType || !recipientEmail || !payload) {
        res.status(400).json({ success: false, error: 'Invalid email log structure: missing event type, recipient, or payload.' });
        return;
      }

      logger.info(`[EMAIL RETRY] Manually triggering email resend for log ID: ${logId}`);
      
      // Dispatch email
      const result = await emailService.sendEventEmail(eventType, recipientEmail, payload);

      if (result.success) {
        // Increment attempts count on original document or update status
        const attempts = (logData.attempts || 1) + 1;
        await docRef.update({
          status: 'sent',
          attempts,
          updatedAt: new Date().toISOString(),
          error: null,
        }).catch(() => null);

        res.status(200).json({
          success: true,
          message: `Email re-sent successfully to ${recipientEmail}`,
          messageId: result.messageId,
        });
      } else {
        // Increment attempts count and log new error
        const attempts = (logData.attempts || 1) + 1;
        await docRef.update({
          status: 'failed',
          attempts,
          updatedAt: new Date().toISOString(),
          error: result.error,
        }).catch(() => null);

        res.status(500).json({
          success: false,
          error: 'Resend attempt failed',
          details: result.error,
        });
      }
    } catch (err: any) {
      logger.error(`[emailController] resendEmail error: ${err?.message || err}`);
      res.status(500).json({ success: false, error: err?.message || 'Internal server error' });
    }
  }
}
