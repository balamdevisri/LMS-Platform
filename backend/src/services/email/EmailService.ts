/**
 * SHAIVIKA LMS AI Platform - Core Email Service Engine
 * KaizenQ - Powered by SHAIVIKA GROUPS
 *
 * Supports Nodemailer (SMTP), Resend API, and Mock transport fallback.
 * Includes complete SMTP audit, transporter verification, and diagnostic logging.
 */

import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { env, maskSensitiveString } from '../../config/env';
import logger from '../../config/logger';
import { emailLogsCollection, isFirestoreInitialized } from '../../firebase/collections';
import {
  EmailEventType,
  EmailLogRecord,
  EmailStatus,
} from '../../types/emailTypes';
import { buildEventEmailTemplate } from './emailTemplates';

export class EmailService {
  private nodemailerTransporter?: nodemailer.Transporter;
  private resendClient?: Resend;
  private provider: 'nodemailer' | 'resend' | 'mock';
  private fromAddress: string;
  private isTransporterVerified: boolean = false;
  private lastVerificationError?: string;

  constructor() {
    this.fromAddress = env.SMTP_FROM || env.EMAIL_FROM || 'KaizenQ AI LMS <kaizenq.lms@gmail.com>';
    this.provider = (env.EMAIL_PROVIDER as 'nodemailer' | 'resend' | 'mock') || 'nodemailer';

    this.initializeTransports();
  }

  /**
   * Audit & Initialize Nodemailer SMTP or Resend API Transporters
   */
  private initializeTransports(): void {
    logger.info('[SMTP AUDIT] 1. Loading SMTP configuration...');

    const smtpHost = env.SMTP_HOST || process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = Number(env.SMTP_PORT || process.env.SMTP_PORT || 587);
    const isSecure = (env.SMTP_SECURE || process.env.SMTP_SECURE) === 'true';
    const smtpUser = env.SMTP_EMAIL || process.env.SMTP_EMAIL || env.SMTP_USER || 'kaizenqlms@gmail.com';
    const smtpPass = env.SMTP_PASSWORD || process.env.SMTP_PASSWORD || env.SMTP_PASS || 'nslv bymb dnnq swcw';

    const maskedPass = maskSensitiveString(smtpPass);

    logger.info(`[SMTP AUDIT] 2. Config Loaded -> Host: ${smtpHost} | Port: ${smtpPort} | Secure: ${isSecure} | User: ${smtpUser} | Pass: ${maskedPass}`);

    if (this.provider === 'nodemailer' || (smtpHost && smtpUser && smtpPass)) {
      this.provider = 'nodemailer';
      logger.info('[SMTP AUDIT] 3. Creating Nodemailer Transporter...');

      this.nodemailerTransporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: isSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
        connectionTimeout: 10000, // 10 seconds timeout
        greetingTimeout: 5000,
      });

      logger.info('[SMTP AUDIT] 4. Running transporter.verify()...');

      this.verifyTransporterAsync();
    } else if (this.provider === 'resend' && env.RESEND_API_KEY) {
      this.resendClient = new Resend(env.RESEND_API_KEY);
      logger.info('[SMTP AUDIT] ✅ Initialized Resend API Client.');
    } else {
      this.provider = 'mock';
      logger.info('[SMTP AUDIT] ℹ️ Using simulated Mock Email Transport for local dev environment.');
    }
  }

  /**
   * Async Transporter Verification
   */
  public async verifyTransporterAsync(): Promise<boolean> {
    if (!this.nodemailerTransporter) return false;
    try {
      await this.nodemailerTransporter.verify();
      this.isTransporterVerified = true;
      this.lastVerificationError = undefined;
      console.log("✅ SMTP Connected");
      logger.info("[SMTP AUDIT] ✅ SMTP Connected");
      return true;
    } catch (err: any) {
      this.isTransporterVerified = false;
      this.lastVerificationError = err?.message || String(err);
      console.error("❌ SMTP Error:", err);
      logger.error("❌ SMTP Error:", err);
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
      provider: this.provider,
      payload,
      createdAt: nowIso,
      updatedAt: nowIso,
      lastAttemptAt: nowIso,
    };

    let logDocId: string | undefined;

    // 1. Create Initial Pending Log Record in Firestore
    if (isFirestoreInitialized()) {
      try {
        const docRef = await emailLogsCollection().add(logRecord);
        logDocId = docRef.id;
      } catch (err: any) {
        logger.warn('⚠️ EmailService: Failed to create pending record in Firestore:', err?.message || err);
      }
    }

    // 2. Dispatch Email through transport
    try {
      let messageId: string | undefined;

      if (this.provider === 'resend' && this.resendClient) {
        const resendRes = await this.resendClient.emails.send({
          from: this.fromAddress,
          to: [recipientEmail],
          subject,
          html,
        });

        if (resendRes.error) {
          throw new Error(resendRes.error.message);
        }
        messageId = resendRes.data?.id;
      } else if (this.provider === 'nodemailer' && this.nodemailerTransporter) {
        logger.info(`[SMTP STEP 3] Preparing Email (From: ${this.fromAddress} | To: ${recipientEmail} | Subject: "${subject}")`);
        logger.info(`[SMTP STEP 4] Sending email via Nodemailer...`);

        // Log exact student email & recipient before sending
        console.log("Student Email:", recipientEmail);
        console.log("Recipient:", recipientEmail);

        // Generate plain-text fallback from HTML
        const textFallback = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

        const mailOptions = {
          from: this.fromAddress,
          to: recipientEmail,
          subject,
          text: textFallback,
          html,
        };

        const mailRes = await this.nodemailerTransporter.sendMail(mailOptions);

        messageId = mailRes.messageId;

        console.log("accepted:", mailRes.accepted);
        console.log("rejected:", mailRes.rejected);
        console.log("response:", mailRes.response);
        console.log("messageId:", mailRes.messageId);

        logger.info(`[SMTP STEP 5] SMTP Response received from Gmail: "${mailRes.response || 'OK'}"`);
        logger.info(`[SMTP STEP 6] Delivery Summary -> Accepted: ${JSON.stringify(mailRes.accepted || [])} | Rejected: ${JSON.stringify(mailRes.rejected || [])} | MessageId: ${messageId}`);

        if (Array.isArray(mailRes.rejected) && mailRes.rejected.length > 0) {
          logger.error(`[SMTP DIAGNOSTIC] ⚠️ Recipients Rejected: ${JSON.stringify(mailRes.rejected)}`);
        }

        if (!Array.isArray(mailRes.accepted) || mailRes.accepted.length === 0) {
          logger.warn(`[SMTP DIAGNOSTIC] ⚠️ Accepted list is empty! Email may have been bounced or blocked by server filters.`);
        }
      } else {
        // Mock Transport Fallback
        messageId = `mock_msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        logger.info(`[MOCK EMAIL SENT] Event: ${eventType} | To: ${recipientEmail} | Subject: "${subject}" | MsgId: ${messageId}`);
      }

      logger.info(`[EMAIL SERVICE] ✅ Email sent successfully. MsgID: ${messageId}`);

      // 3. Update Log status to 'sent'
      await this.updateLogStatus(logDocId, 'sent', messageId);

      return {
        success: true,
        messageId,
        logId: logDocId,
      };
    } catch (sendError: any) {
      const errorMessage = sendError?.message || String(sendError);
      logger.error(`[EMAIL SERVICE] ❌ Failed to send ${eventType} to ${recipientEmail}:`, errorMessage);

      // 4. Update Log status to 'failed'
      await this.updateLogStatus(logDocId, 'failed', undefined, errorMessage);

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
    logger.info(`[SMTP TEST STEP 3] Preparing Email (From: ${this.fromAddress} | To: ${recipientEmail} | Subject: "${subject}")`);

    try {
      let messageId: string | undefined;
      let accepted: any[] = [];
      let rejected: any[] = [];
      let response: string = '';

      if (this.provider === 'nodemailer' && this.nodemailerTransporter) {
        logger.info(`[SMTP TEST STEP 4] Sending test email via Nodemailer...`);
        const textContent = plainText || html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

        const mailRes = await this.nodemailerTransporter.sendMail({
          from: this.fromAddress,
          to: recipientEmail,
          subject,
          text: textContent,
          html,
        });

        messageId = mailRes.messageId;
        accepted = mailRes.accepted || [];
        rejected = mailRes.rejected || [];
        response = mailRes.response || '';

        logger.info(`[SMTP TEST STEP 5] SMTP Response from Gmail: "${response}"`);
        logger.info(`[SMTP TEST STEP 6] Delivery Summary -> Accepted: ${JSON.stringify(accepted)} | Rejected: ${JSON.stringify(rejected)} | MessageId: ${messageId}`);

        if (rejected.length > 0) {
          logger.error(`[SMTP DIAGNOSTIC] ⚠️ Recipients Rejected: ${JSON.stringify(rejected)}`);
        }
      } else if (this.provider === 'resend' && this.resendClient) {
        const resendRes = await this.resendClient.emails.send({
          from: this.fromAddress,
          to: [recipientEmail],
          subject,
          html,
        });
        if (resendRes.error) throw new Error(resendRes.error.message);
        messageId = resendRes.data?.id;
        accepted = [recipientEmail];
        response = 'Resend API 200 OK';
      } else {
        messageId = `mock_test_${Date.now()}`;
        accepted = [recipientEmail];
        response = '250 Mock Sent';
        logger.info(`[MOCK TEST EMAIL SENT] To: ${recipientEmail} | MsgId: ${messageId}`);
      }

      logger.info(`[SMTP TEST STEP 7] ✅ Email sent successfully. MsgID: ${messageId}`);
      return { success: true, messageId, accepted, rejected, response };
    } catch (err: any) {
      const errorMsg = err?.message || String(err);
      logger.error(`[SMTP TEST STEP 7] ❌ Failed sending test email:`, errorMsg);
      return { success: false, error: errorMsg };
    }
  }

  /**
   * Check SMTP Transporter Status
   */
  public getTransporterStatus() {
    return {
      provider: this.provider,
      host: env.SMTP_HOST || process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(env.SMTP_PORT || process.env.SMTP_PORT || 587),
      user: env.SMTP_EMAIL || process.env.SMTP_EMAIL || env.SMTP_USER || 'kaizenqlms@gmail.com',
      from: this.fromAddress,
      verified: this.isTransporterVerified,
      lastError: this.lastVerificationError || null,
    };
  }

  /**
   * Updates an existing Firestore email_logs doc status
   */
  private async updateLogStatus(
    logDocId?: string,
    status?: EmailStatus,
    messageId?: string,
    errorMsg?: string
  ): Promise<void> {
    if (!logDocId || !isFirestoreInitialized()) return;

    try {
      const updateData: Partial<EmailLogRecord> = {
        updatedAt: new Date().toISOString(),
      };

      if (status) updateData.status = status;
      if (messageId) updateData.messageId = messageId;
      if (errorMsg) updateData.error = errorMsg;

      await emailLogsCollection().doc(logDocId).update(updateData);
    } catch (err: any) {
      logger.warn(`⚠️ EmailService: Failed updating status for log ${logDocId}:`, err?.message || err);
    }
  }

  /**
   * Automated Retry Worker: Retries failed emails from Firestore email_logs
   */
  async retryFailedEmails(maxRetries: number = 3): Promise<{ retriedCount: number; succeededCount: number; failedCount: number }> {
    if (!isFirestoreInitialized()) {
      return { retriedCount: 0, succeededCount: 0, failedCount: 0 };
    }

    try {
      const snapshot = await emailLogsCollection()
        .where('status', '==', 'failed')
        .where('attempts', '<', maxRetries)
        .limit(25)
        .get();

      if (snapshot.empty) {
        return { retriedCount: 0, succeededCount: 0, failedCount: 0 };
      }

      let succeededCount = 0;
      let failedCount = 0;

      for (const docSnap of snapshot.docs) {
        const log = docSnap.data() as EmailLogRecord;
        const attempts = (log.attempts || 1) + 1;
        const nowIso = new Date().toISOString();

        try {
          const { subject, html } = buildEventEmailTemplate(log.eventType, log.payload);
          let messageId: string | undefined;

          if (this.provider === 'resend' && this.resendClient) {
            const res = await this.resendClient.emails.send({
              from: this.fromAddress,
              to: [log.recipientEmail],
              subject,
              html,
            });
            if (res.error) throw new Error(res.error.message);
            messageId = res.data?.id;
          } else if (this.provider === 'nodemailer' && this.nodemailerTransporter) {
            const res = await this.nodemailerTransporter.sendMail({
              from: this.fromAddress,
              to: log.recipientEmail,
              subject,
              html,
            });
            messageId = res.messageId;
          } else {
            messageId = `mock_retry_msg_${Date.now()}`;
          }

          await docSnap.ref.update({
            status: 'sent',
            attempts,
            messageId,
            error: null,
            updatedAt: nowIso,
            lastAttemptAt: nowIso,
          });

          succeededCount++;
        } catch (retryError: any) {
          failedCount++;
          await docSnap.ref.update({
            attempts,
            error: retryError?.message || String(retryError),
            updatedAt: nowIso,
            lastAttemptAt: nowIso,
          });
        }
      }

      return {
        retriedCount: snapshot.docs.length,
        succeededCount,
        failedCount,
      };
    } catch (err: any) {
      logger.error('❌ EmailService: Error executing retry worker:', err?.message || err);
      return { retriedCount: 0, succeededCount: 0, failedCount: 0 };
    }
  }

  /**
   * Fetches recent email delivery logs from Firestore
   */
  async getEmailLogs(limitCount: number = 50): Promise<EmailLogRecord[]> {
    if (!isFirestoreInitialized()) return [];

    try {
      const snapshot = await emailLogsCollection()
        .orderBy('createdAt', 'desc')
        .limit(limitCount)
        .get();

      return snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as EmailLogRecord),
      }));
    } catch (err: any) {
      logger.warn('⚠️ EmailService: Failed to fetch logs from Firestore:', err?.message || err);
      return [];
    }
  }
}

export const emailService = new EmailService();
