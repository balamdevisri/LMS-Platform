import { env, maskSensitiveString } from '../../config/env';
import logger from '../../config/logger';
import { IEmailProvider } from './providers/EmailProvider.interface';
import { NodemailerProvider } from './providers/NodemailerProvider';
import { ResendProvider } from './providers/ResendProvider';
import { MockProvider } from './providers/MockProvider';
import { AuditLogger } from './AuditLogger';
import { RetryManager } from './RetryManager';
import { buildEventEmailTemplate } from './emailTemplates';
import { EmailEventType, EmailLogRecord, EmailStatus } from '../../types/emailTypes';

export class EmailService {
  private activeProvider: IEmailProvider;
  private providerType: 'nodemailer' | 'resend' | 'mock';
  private fromAddress: string;
  private isTransporterVerified: boolean = false;
  private lastVerificationError?: string;

  constructor() {
    this.fromAddress = env.SMTP_FROM || env.EMAIL_FROM || 'KaizenQ AI LMS <kaizenq.lms@gmail.com>';
    
    if (process.env.NODE_ENV === 'test' || env.NODE_ENV === 'test') {
      this.providerType = 'mock';
      this.activeProvider = new MockProvider();
    } else {
      this.providerType = (env.EMAIL_PROVIDER as 'nodemailer' | 'resend' | 'mock') || 'nodemailer';
      this.activeProvider = this.initializeProvider();
    }
  }

  private initializeProvider(): IEmailProvider {
    logger.info(`[SMTP AUDIT] Loading SMTP configuration for provider: ${this.providerType}`);

    const smtpHost = env.SMTP_HOST || process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = Number(env.SMTP_PORT || process.env.SMTP_PORT || 587);
    const isSecure = (env.SMTP_SECURE || process.env.SMTP_SECURE) === 'true';
    const smtpUser = env.SMTP_EMAIL || process.env.SMTP_EMAIL || env.SMTP_USER || 'kaizenqlms@gmail.com';
    const smtpPass = env.SMTP_PASSWORD || process.env.SMTP_PASSWORD || env.SMTP_PASS || 'nslv bymb dnnq swcw';

    const maskedPass = maskSensitiveString(smtpPass);
    logger.info(`[SMTP AUDIT] Config Loaded -> Host: ${smtpHost} | Port: ${smtpPort} | Secure: ${isSecure} | User: ${smtpUser} | Pass: ${maskedPass}`);

    if (this.providerType === 'nodemailer' || (smtpHost && smtpUser && smtpPass)) {
      this.providerType = 'nodemailer';
      const provider = new NodemailerProvider({
        host: smtpHost,
        port: smtpPort,
        secure: isSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
      
      this.verifyNodemailerAsync(provider);
      return provider;
    } else if (this.providerType === 'resend' && env.RESEND_API_KEY) {
      logger.info('[SMTP AUDIT] ✅ Initializing Resend API Client.');
      return new ResendProvider(env.RESEND_API_KEY);
    } else {
      this.providerType = 'mock';
      logger.info('[SMTP AUDIT] ℹ️ Fallback: Using Mock Email Provider.');
      return new MockProvider();
    }
  }

  private async verifyNodemailerAsync(provider: NodemailerProvider): Promise<void> {
    try {
      const verified = await provider.verify();
      this.isTransporterVerified = verified;
      if (verified) {
        console.log("✅ SMTP Connected");
        logger.info("[SMTP AUDIT] ✅ SMTP Connected");
      } else {
        this.lastVerificationError = 'Nodemailer verify failed';
      }
    } catch (err: any) {
      this.isTransporterVerified = false;
      this.lastVerificationError = err?.message || String(err);
      console.error("❌ SMTP Error:", err);
    }
  }

  public async verifyTransporterAsync(): Promise<boolean> {
    if (this.providerType === 'nodemailer' && this.activeProvider instanceof NodemailerProvider) {
      const verified = await this.activeProvider.verify();
      this.isTransporterVerified = verified;
      return verified;
    }
    return true;
  }

  async sendEventEmail<T = any>(
    eventType: EmailEventType,
    recipientEmail: string,
    payload: T
  ): Promise<{ success: boolean; messageId?: string; logId?: string; error?: string }> {
    const { subject, html } = buildEventEmailTemplate(eventType, payload);
    const nowIso = new Date().toISOString();

    logger.info(`[EMAIL SERVICE] Sending email... Event: ${eventType} | To: ${recipientEmail}`);

    const logRecord: EmailLogRecord = {
      eventType,
      recipientEmail,
      subject,
      status: 'pending',
      attempts: 1,
      maxRetries: 3,
      provider: this.providerType,
      payload,
      createdAt: nowIso,
      updatedAt: nowIso,
      lastAttemptAt: nowIso,
    };

    let logDocId: string | undefined;

    // 1. Log pending status
    logDocId = await AuditLogger.createPendingLog(logRecord);

    // 2. Dispatch
    try {
      const result = await this.activeProvider.send({
        from: this.fromAddress,
        to: recipientEmail,
        subject,
        html,
      });

      if (result.success) {
        logger.info(`[EMAIL SERVICE] ✅ Email sent successfully. MsgID: ${result.messageId}`);
        await AuditLogger.updateLogStatus(logDocId, 'sent', result.messageId);
        return {
          success: true,
          messageId: result.messageId,
          logId: logDocId,
        };
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      const errorMessage = err?.message || String(err);
      logger.error(`[EMAIL SERVICE] ❌ Failed to send ${eventType} to ${recipientEmail}:`, errorMessage);
      await AuditLogger.updateLogStatus(logDocId, 'failed', undefined, errorMessage);
      return {
        success: false,
        logId: logDocId,
        error: errorMessage,
      };
    }
  }

  async sendDirectHtmlEmail(
    recipientEmail: string,
    subject: string,
    html: string,
    plainText?: string
  ): Promise<{ success: boolean; messageId?: string; accepted?: any[]; rejected?: any[]; response?: string; error?: string }> {
    logger.info(`[SMTP TEST] Preparing direct HTML email to: ${recipientEmail} with subject: ${subject}`);
    try {
      const result = await this.activeProvider.send({
        from: this.fromAddress,
        to: recipientEmail,
        subject,
        html,
        text: plainText,
      });

      if (result.success) {
        return {
          success: true,
          messageId: result.messageId,
          accepted: [recipientEmail],
          rejected: [],
          response: '250 OK',
        };
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      const errorMsg = err?.message || String(err);
      logger.error(`[SMTP TEST] ❌ Failed sending direct HTML email:`, errorMsg);
      return {
        success: false,
        error: errorMsg,
        accepted: [],
        rejected: [recipientEmail],
      };
    }
  }

  public getTransporterStatus() {
    return {
      provider: this.providerType,
      host: env.SMTP_HOST || process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(env.SMTP_PORT || process.env.SMTP_PORT || 587),
      user: env.SMTP_EMAIL || process.env.SMTP_EMAIL || env.SMTP_USER || 'kaizenqlms@gmail.com',
      from: this.fromAddress,
      verified: this.isTransporterVerified,
      lastError: this.lastVerificationError || null,
    };
  }

  async retryFailedEmails(maxRetries: number = 3): Promise<{ retriedCount: number; succeededCount: number; failedCount: number }> {
    return RetryManager.retryFailedEmails(this.activeProvider, this.fromAddress, maxRetries);
  }

  async getEmailLogs(limitCount: number = 50): Promise<EmailLogRecord[]> {
    return AuditLogger.getLogs(limitCount);
  }
}

export const emailService = new EmailService();
