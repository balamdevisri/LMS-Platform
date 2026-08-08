/**
 * SHAIVIKA LMS AI Platform - Modular Email Dispatcher Service
 * KaizenQ - Powered by SHAIVIKA GROUPS
 */

import { env } from '../../config/env';
import logger from '../../config/logger';
import { EmailEventType, EmailStatus, EmailLogRecord } from '../../types/emailTypes';
import { isFirestoreInitialized } from '../../firebase/collections';
import { IEmailProvider } from './IEmailProvider';
import { NodemailerProvider } from './providers/NodemailerProvider';
import { ResendProvider } from './providers/ResendProvider';
import { MockProvider } from './providers/MockProvider';
import { EmailAuditLogger } from './audit/EmailAuditLogger';
import { EmailRetryManager } from './queue/EmailRetryManager';
import { EmailTemplateEngine } from './templates/EmailTemplateEngine';

export class EmailService {
  private emailProvider: IEmailProvider;
  private auditLogger: EmailAuditLogger;
  private templateEngine: EmailTemplateEngine;
  private retryManager: EmailRetryManager;

  public provider: 'nodemailer' | 'resend' | 'mock';
  public fromAddress: string;
  public isTransporterVerified: boolean = false;
  public lastVerificationError: string | null = null;

  constructor() {
    this.provider = (env.EMAIL_PROVIDER as 'nodemailer' | 'resend' | 'mock') || 'nodemailer';
    this.fromAddress = env.SMTP_FROM || 'KaizenQ AI LMS <kaizenq.lms@gmail.com>';

    // Instantiate appropriate provider
    if (this.provider === 'resend' && env.RESEND_API_KEY) {
      this.emailProvider = new ResendProvider();
    } else if (this.provider === 'nodemailer') {
      this.emailProvider = new NodemailerProvider();
    } else {
      this.emailProvider = new MockProvider();
    }

    this.auditLogger = new EmailAuditLogger();
    this.templateEngine = new EmailTemplateEngine();
    this.retryManager = new EmailRetryManager(this.emailProvider, this.templateEngine);

    // Run verification asynchronously
    this.verifyTransporterAsync().catch((err) => {
      this.lastVerificationError = err?.message || String(err);
      this.isTransporterVerified = false;
    });
  }

  /**
   * Asynchronously verify connection to the mail transport server
   */
  public async verifyTransporterAsync(): Promise<boolean> {
    try {
      logger.info(`[SMTP AUDIT] ⚡ Verifying connection to ${this.provider} service...`);
      const success = await this.emailProvider.verify();
      if (success) {
        this.isTransporterVerified = true;
        this.lastVerificationError = null;
        logger.info(`[SMTP AUDIT] ✅ Connection to ${this.provider} verified successfully.`);
        return true;
      } else {
        throw new Error(`Verification failed for provider ${this.provider}`);
      }
    } catch (err: any) {
      this.lastVerificationError = err?.message || String(err);
      this.isTransporterVerified = false;
      logger.error(`[SMTP AUDIT] ❌ Connection verification failed: ` + this.lastVerificationError);
      return false;
    }
  }

  /**
   * Main method to send event emails
   */
  async sendEventEmail<T = any>(
    eventType: EmailEventType,
    recipientEmail: string,
    payload: T
  ): Promise<{ success: boolean; messageId?: string; logId?: string; error?: string }> {
    const { subject, html } = this.templateEngine.build(eventType, payload);

    logger.info(`[EMAIL SERVICE] Sending event email: ${eventType} | To: ${recipientEmail}`);

    const logRecord = {
      eventType,
      recipientEmail,
      subject,
      provider: this.provider,
      payload,
    };

    // 1. Create Pending Log Record in Firestore
    const logDocId = await this.auditLogger.logPending(logRecord);

    // 2. Dispatch Email through transport provider
    try {
      const result = await this.emailProvider.send({
        to: recipientEmail,
        subject,
        html,
      });

      if (!result.success) {
        throw new Error(result.error || 'Provider failed to dispatch email');
      }

      logger.info(`[EMAIL SERVICE] ✅ Email sent successfully. MsgID: ${result.messageId}`);

      // 3. Update Log status to 'sent'
      await this.auditLogger.updateStatus(logDocId, 'sent', result.messageId);

      return {
        success: true,
        messageId: result.messageId,
        logId: logDocId,
      };
    } catch (sendError: any) {
      const errorMessage = sendError?.message || String(sendError);
      logger.error(`[EMAIL SERVICE] ❌ Failed to send ${eventType} to ${recipientEmail}: ` + errorMessage);

      // 4. Update Log status to 'failed'
      await this.auditLogger.updateStatus(logDocId, 'failed', undefined, errorMessage);

      return {
        success: false,
        logId: logDocId,
        error: errorMessage,
      };
    }
  }

  /**
   * Direct Custom HTML Email Dispatcher (e.g. for SMTP Test endpoint)
   */
  async sendDirectHtmlEmail(
    recipientEmail: string,
    subject: string,
    html: string,
    plainText?: string
  ): Promise<{ success: boolean; messageId?: string; accepted?: any[]; rejected?: any[]; response?: string; error?: string }> {
    try {
      logger.info(`[EMAIL SERVICE] Sending direct email to ${recipientEmail}`);

      const result = await this.emailProvider.send({
        to: recipientEmail,
        subject,
        html,
        text: plainText,
      });

      if (!result.success) {
        throw new Error(result.error || 'Provider failed sending direct email');
      }

      return {
        success: true,
        messageId: result.messageId,
        accepted: [recipientEmail],
        rejected: [],
        response: '200 OK',
      };
    } catch (err: any) {
      logger.error(`[EMAIL SERVICE] Direct email send failed to ${recipientEmail}: ` + (err?.message || err));
      return {
        success: false,
        error: err?.message || String(err),
        accepted: [],
        rejected: [recipientEmail],
      };
    }
  }

  /**
   * Check SMTP Transporter Status
   */
  public getTransporterStatus() {
    return {
      provider: this.provider,
      host: env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(env.SMTP_PORT || 587),
      user: env.SMTP_EMAIL || env.SMTP_USER || 'kaizenqlms@gmail.com',
      from: this.fromAddress,
      verified: this.isTransporterVerified,
      lastError: this.lastVerificationError || null,
    };
  }

  /**
   * Automated Retry Worker: Retries failed emails from Firestore email_logs
   */
  async retryFailedEmails(maxRetries: number = 3): Promise<{ retriedCount: number; succeededCount: number; failedCount: number }> {
    return this.retryManager.retryFailedEmails(maxRetries);
  }

  /**
   * Fetches recent email delivery logs from Firestore
   */
  async getEmailLogs(limitCount: number = 50): Promise<EmailLogRecord[]> {
    return this.auditLogger.fetchRecent(limitCount);
  }

  /**
   * Dispatches Email with Attachments (e.g. Certificate PDF) with automatic retry
   */
  async sendEmailWithAttachments(
    recipientEmail: string,
    subject: string,
    html: string,
    attachments: Array<{ filename: string; content: Buffer; contentType?: string }>,
    maxRetries: number = 3
  ): Promise<{ success: boolean; messageId?: string; accepted?: any[]; rejected?: any[]; error?: string }> {
    let attempt = 0;
    let lastError: any = null;

    const logDocId = await this.auditLogger.logPending({
      eventType: EmailEventType.CERTIFICATE_GENERATED,
      recipientEmail,
      subject,
      provider: this.provider,
      payload: { attachmentCount: attachments.length },
    });

    while (attempt < maxRetries) {
      attempt++;
      logger.info(`[SMTP ATTACHMENT EMAIL] Attempt ${attempt}/${maxRetries} to ${recipientEmail} | Subject: "${subject}"`);

      try {
        const result = await this.emailProvider.send({
          to: recipientEmail,
          subject,
          html,
          attachments: attachments.map(att => ({
            filename: att.filename,
            content: att.content,
            contentType: att.contentType,
          })),
        });

        if (!result.success) {
          throw new Error(result.error || 'Provider attachment email send failed');
        }

        logger.info(`[SMTP ATTACHMENT EMAIL] ✅ Delivered! MsgId: ${result.messageId}`);
        await this.auditLogger.updateStatus(logDocId, 'sent', result.messageId);

        return {
          success: true,
          messageId: result.messageId,
          accepted: [recipientEmail],
          rejected: [],
        };
      } catch (err: any) {
        lastError = err;
        logger.error(`[SMTP ATTACHMENT EMAIL] ❌ Attempt ${attempt}/${maxRetries} Failed for ${recipientEmail}: ` + (err?.message || err));

        if (attempt < maxRetries) {
          const backoffMs = Math.pow(2, attempt) * 1000;
          logger.info(`[SMTP ATTACHMENT EMAIL] Retrying in ${backoffMs}ms...`);
          await new Promise((res) => setTimeout(res, backoffMs));
        }
      }
    }

    const errorMsg = lastError?.message || String(lastError);
    await this.auditLogger.updateStatus(logDocId, 'failed', undefined, errorMsg);
    logger.error(`[SMTP ATTACHMENT EMAIL] ❌ ALL ${maxRetries} ATTEMPTS FAILED for ${recipientEmail}`);

    return {
      success: false,
      error: errorMsg,
    };
  }
}

export const emailService = new EmailService();
