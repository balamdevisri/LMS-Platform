/**
 * KAIZENQ LMS AI Platform - Centralized Direct SMTP Email Service
 * Powered by Nodemailer Direct SMTP
 */

import { env } from '../../config/env';
import logger from '../../config/logger';
import { EmailEventType, EmailLogRecord } from '../../types/emailTypes';
import { IEmailProvider } from './IEmailProvider';
import { NodemailerProvider } from './providers/NodemailerProvider';
import { ResendProvider } from './providers/ResendProvider';
import { MockProvider } from './providers/MockProvider';
import { EmailAuditLogger } from './audit/EmailAuditLogger';
import { EmailRetryManager } from './queue/EmailRetryManager';
import { EmailTemplateEngine } from './templates/EmailTemplateEngine';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: any;
    contentType?: string;
  }>;
}

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
    this.fromAddress = process.env.SMTP_FROM || env.SMTP_FROM || 'KaizenQ <no-reply@kaizenq.in>';

    // Instantiate appropriate provider (Direct Nodemailer SMTP is default)
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

    // Asynchronously verify transporter on initialization
    this.verifyTransporterAsync().catch((err) => {
      this.lastVerificationError = err?.message || String(err);
      this.isTransporterVerified = false;
    });
  }

  /**
   * Verifies SMTP connection directly with the mail server
   */
  public async verifyTransporterAsync(): Promise<boolean> {
    try {
      const success = await this.emailProvider.verify();
      if (success) {
        this.isTransporterVerified = true;
        this.lastVerificationError = null;
        logger.info('[EMAIL] SMTP connection successful');
        return true;
      } else {
        throw new Error(`Verification failed for provider ${this.provider}`);
      }
    } catch (err: any) {
      this.lastVerificationError = err?.message || String(err);
      this.isTransporterVerified = false;
      logger.error(`[EMAIL] SMTP connection failed: ${this.lastVerificationError}`);
      return false;
    }
  }

  /**
   * Generic direct email sender (for raw HTML, attachments, or custom messages)
   */
  public async sendEmail(options: SendEmailOptions): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    const { to, subject, html, text, attachments } = options;

    if (!to || !subject || !html) {
      return { success: false, error: 'Missing required parameters: to, subject, or html' };
    }

    try {
      logger.info(`[EMAIL] Sending email to: ${to} | Subject: "${subject}"`);
      const result = await this.emailProvider.send({
        to,
        subject,
        html,
        text,
        attachments,
      });

      if (!result.success) {
        throw new Error(result.error || 'SMTP Provider failed to deliver message');
      }

      logger.info(`[EMAIL] ✅ Email delivered via SMTP. MessageID: ${result.messageId}`);
      return { success: true, messageId: result.messageId };
    } catch (err: any) {
      const msg = err?.message || String(err);
      logger.error(`[EMAIL] ❌ Failed delivering email to ${to}: ${msg}`);
      return { success: false, error: msg };
    }
  }

  /**
   * Core structured event-driven email dispatcher
   */
  public async sendEventEmail<T = any>(
    eventType: EmailEventType,
    recipientEmail: string,
    payload: T
  ): Promise<{ success: boolean; messageId?: string; logId?: string; error?: string }> {
    const { subject, html } = this.templateEngine.build(eventType, payload);
    const normalizedRecipient = (recipientEmail || '').toLowerCase().trim();

    logger.info(`[EMAIL] Dispatching event email: ${eventType} -> ${normalizedRecipient}`);

    const logRecord = {
      eventType,
      recipientEmail: normalizedRecipient,
      subject,
      provider: this.provider,
      payload,
    };

    // 1. Audit Log: Pending in Firestore
    const logDocId = await this.auditLogger.logPending(logRecord);

    // 2. Dispatch via Nodemailer Direct SMTP
    try {
      const result = await this.emailProvider.send({
        to: normalizedRecipient,
        subject,
        html,
      });

      if (!result.success) {
        throw new Error(result.error || 'Provider failed to dispatch email');
      }

      logger.info(`[EMAIL] ✅ Event ${eventType} delivered! MsgID: ${result.messageId}`);

      // 3. Update Audit Log status to 'sent'
      await this.auditLogger.updateStatus(logDocId, 'sent', result.messageId);

      return {
        success: true,
        messageId: result.messageId,
        logId: logDocId,
      };
    } catch (sendError: any) {
      const errorMessage = sendError?.message || String(sendError);
      logger.error(`[EMAIL] ❌ Failed event ${eventType} to ${normalizedRecipient}: ${errorMessage}`);

      // 4. Update Audit Log status to 'failed'
      await this.auditLogger.updateStatus(logDocId, 'failed', undefined, errorMessage);

      return {
        success: false,
        logId: logDocId,
        error: errorMessage,
      };
    }
  }

  /**
   * Flow 1: Student Signup Welcome Email
   */
  public async sendWelcomeEmail(
    email: string,
    studentName: string,
    dashboardUrl: string = 'https://www.kaizenq.in/dashboard'
  ) {
    return this.sendEventEmail(EmailEventType.STUDENT_REGISTRATION, email, {
      studentName: studentName || email.split('@')[0],
      email: email.toLowerCase().trim(),
      dashboardUrl,
    });
  }

  /**
   * Flow 2: Instructor Registration / Review Notification
   */
  public async sendInstructorRegistrationPendingEmail(
    email: string,
    instructorName: string,
    department: string = 'Computer Science & Systems',
    qualification: string = 'Pending Review',
    experience: string = 'Industry Specialist'
  ) {
    return this.sendEventEmail(EmailEventType.INSTRUCTOR_REGISTRATION_PENDING, email, {
      instructorName: instructorName || email.split('@')[0],
      email: email.toLowerCase().trim(),
      department,
      qualification,
      experience,
    });
  }

  /**
   * Flow 3: Instructor / Lecturer Approval Email
   */
  public async sendInstructorApprovalEmail(
    email: string,
    instructorName: string,
    portalUrl: string = 'https://www.kaizenq.in/auth/login'
  ) {
    return this.sendEventEmail(EmailEventType.LECTURER_APPROVED, email, {
      lecturerName: instructorName || email.split('@')[0],
      email: email.toLowerCase().trim(),
      dashboardUrl: portalUrl,
      portalUrl,
    });
  }

  /**
   * Flow 4: Password Reset Action Link Email (Using link generated by Firebase Admin SDK)
   */
  public async sendPasswordResetEmail(
    email: string,
    userName: string,
    resetUrl: string,
    expiresInMinutes: number = 15
  ) {
    return this.sendEventEmail(EmailEventType.PASSWORD_RESET, email, {
      userName: userName || email.split('@')[0],
      email: email.toLowerCase().trim(),
      resetUrl,
      expiresInMinutes,
    });
  }

  /**
   * Flow 5: Live Class Notification Email
   */
  public async sendLiveClassNotification(
    email: string,
    studentName: string,
    classTitle: string,
    scheduledAt: string,
    joinUrl: string = 'https://www.kaizenq.in/live-classroom'
  ) {
    return this.sendEventEmail(EmailEventType.ADMIN_NOTIFICATION, email, {
      title: `🔴 Live Class Alert: ${classTitle}`,
      message: `Hi ${studentName || 'Scholar'}, a live interactive session "${classTitle}" is scheduled for ${scheduledAt}. Click below to join.`,
      actionUrl: joinUrl,
      actionText: 'Join Live Class',
    });
  }

  /**
   * Flow 6: Course Enrollment / Publication Notification
   */
  public async sendCourseNotification(
    email: string,
    studentName: string,
    courseTitle: string,
    courseUrl: string = 'https://www.kaizenq.in/courses'
  ) {
    return this.sendEventEmail(EmailEventType.COURSE_PUBLISHED, email, {
      studentName: studentName || email.split('@')[0],
      courseTitle,
      courseUrl,
    });
  }

  /**
   * Flow 7: System & Academic Notification
   */
  public async sendSystemNotification(
    email: string,
    title: string,
    message: string,
    actionUrl: string = 'https://www.kaizenq.in/dashboard'
  ) {
    return this.sendEventEmail(EmailEventType.ADMIN_NOTIFICATION, email, {
      title,
      message,
      actionUrl,
      actionText: 'Open KaizenQ Dashboard',
    });
  }

  /**
   * Direct Custom HTML Email Dispatcher (e.g. Diagnostic / Test endpoints)
   */
  public async sendDirectHtmlEmail(
    recipientEmail: string,
    subject: string,
    html: string,
    plainText?: string
  ): Promise<{ success: boolean; messageId?: string; accepted?: any[]; rejected?: any[]; response?: string; error?: string }> {
    try {
      logger.info(`[EMAIL] Sending direct HTML email to ${recipientEmail}`);

      const result = await this.emailProvider.send({
        to: recipientEmail,
        subject,
        html,
        text: plainText || html.replace(/<[^>]*>?/gm, ''),
      });

      if (!result.success) {
        throw new Error(result.error || 'Provider failed sending direct email');
      }

      return {
        success: true,
        messageId: result.messageId,
        accepted: [recipientEmail],
        rejected: [],
        response: '250 OK',
      };
    } catch (err: any) {
      logger.error(`[EMAIL] Direct email send failed to ${recipientEmail}: ${err?.message || err}`);
      return {
        success: false,
        error: err?.message || String(err),
        accepted: [],
        rejected: [recipientEmail],
      };
    }
  }

  /**
   * Returns current SMTP Transporter status without leaking credentials
   */
  public getTransporterStatus() {
    return {
      provider: this.provider,
      host: env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(env.SMTP_PORT || 465),
      from: this.fromAddress,
      fromEmail: env.SMTP_FROM_EMAIL || 'no-reply@kaizenq.in',
      fromName: env.SMTP_FROM_NAME || 'KaizenQ',
      verified: this.isTransporterVerified,
      lastError: this.lastVerificationError || null,
    };
  }

  /**
   * Automated Retry Worker: Retries failed emails from Firestore email_logs
   */
  public async retryFailedEmails(maxRetries: number = 3): Promise<{ retriedCount: number; succeededCount: number; failedCount: number }> {
    return this.retryManager.retryFailedEmails(maxRetries);
  }

  /**
   * Fetches recent email delivery logs from Firestore
   */
  public async getEmailLogs(limitCount: number = 50): Promise<EmailLogRecord[]> {
    return this.auditLogger.fetchRecent(limitCount);
  }

  /**
   * Dispatches Email with Attachments (e.g. Certificate PDF) with automatic retry
   */
  public async sendEmailWithAttachments(
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
      logger.info(`[EMAIL ATTACHMENT] Attempt ${attempt}/${maxRetries} to ${recipientEmail} | Subject: "${subject}"`);

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

        logger.info(`[EMAIL ATTACHMENT] ✅ Delivered! MsgId: ${result.messageId}`);
        await this.auditLogger.updateStatus(logDocId, 'sent', result.messageId);

        return {
          success: true,
          messageId: result.messageId,
          accepted: [recipientEmail],
          rejected: [],
        };
      } catch (err: any) {
        lastError = err;
        logger.error(`[EMAIL ATTACHMENT] ❌ Attempt ${attempt}/${maxRetries} Failed for ${recipientEmail}: ${err?.message || err}`);

        if (attempt < maxRetries) {
          const backoffMs = Math.pow(2, attempt) * 1000;
          logger.info(`[EMAIL ATTACHMENT] Retrying in ${backoffMs}ms...`);
          await new Promise((res) => setTimeout(res, backoffMs));
        }
      }
    }

    const errorMsg = lastError?.message || String(lastError);
    await this.auditLogger.updateStatus(logDocId, 'failed', undefined, errorMsg);
    logger.error(`[EMAIL ATTACHMENT] ❌ ALL ${maxRetries} ATTEMPTS FAILED for ${recipientEmail}`);

    return {
      success: false,
      error: errorMsg,
    };
  }
}

export const emailService = new EmailService();
export default emailService;
