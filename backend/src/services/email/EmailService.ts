/**
 * SHAIVIKA LMS AI Platform - Core Email Service Engine
 * KaizenQ - Powered by SHAIVIKA GROUPS
 *
 * Supports Nodemailer (SMTP), Resend API, and Mock transport fallback.
 * Tracks all delivery logs in Firestore `email_logs` and provides retry logic.
 */

import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { env } from '../../config/env';
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

  constructor() {
    this.fromAddress = env.EMAIL_FROM;
    this.provider = env.EMAIL_PROVIDER as 'nodemailer' | 'resend' | 'mock';

    this.initializeTransports();
  }

  /**
   * Initializes Nodemailer SMTP or Resend API clients
   */
  private initializeTransports(): void {
    if (this.provider === 'resend' && env.RESEND_API_KEY) {
      this.resendClient = new Resend(env.RESEND_API_KEY);
      console.log('✅ EmailService: Initialized Resend API Client.');
    } else if (this.provider === 'nodemailer' && env.SMTP_HOST) {
      this.nodemailerTransporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: parseInt(env.SMTP_PORT, 10) || 587,
        secure: env.SMTP_PORT === '465',
        auth: env.SMTP_USER && env.SMTP_PASS ? {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        } : undefined,
      });
      console.log('✅ EmailService: Initialized Nodemailer SMTP Transporter.');
    } else {
      // Fallback to mock transport if no explicit credentials or in dev/mock mode
      this.provider = 'mock';
      console.log('ℹ️ EmailService: Using simulated Mock Email Transport for local dev environment.');
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

    // 1. Create Initial Pending Log Record in Firestore if DB is ready
    if (isFirestoreInitialized()) {
      try {
        const docRef = await emailLogsCollection().add(logRecord);
        logDocId = docRef.id;
      } catch (err: any) {
        console.warn('⚠️ EmailService: Failed to create pending record in Firestore:', err?.message || err);
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
        const mailRes = await this.nodemailerTransporter.sendMail({
          from: this.fromAddress,
          to: recipientEmail,
          subject,
          html,
        });
        messageId = mailRes.messageId;
      } else {
        // Mock Transport Logic
        messageId = `mock_msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        console.log(`[MOCK EMAIL SENT] Event: ${eventType} | To: ${recipientEmail} | Subject: "${subject}" | MsgId: ${messageId}`);
      }

      // 3. Update Log status to 'sent'
      await this.updateLogStatus(logDocId, 'sent', messageId);

      return {
        success: true,
        messageId,
        logId: logDocId,
      };
    } catch (sendError: any) {
      const errorMessage = sendError?.message || String(sendError);
      console.error(`❌ EmailService: Failed to send ${eventType} to ${recipientEmail}:`, errorMessage);

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
      console.warn(`⚠️ EmailService: Failed updating status for log ${logDocId}:`, err?.message || err);
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
      console.error('❌ EmailService: Error executing retry worker:', err?.message || err);
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
      console.warn('⚠️ EmailService: Failed to fetch logs from Firestore:', err?.message || err);
      return [];
    }
  }
}

export const emailService = new EmailService();
