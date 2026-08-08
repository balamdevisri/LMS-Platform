import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { createSmtpTransporter, smtpConfig } from '../../config/smtp.config';

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
  private transporter: nodemailer.Transporter;
  private recentSends: Map<string, number> = new Map();
  private DUP_TTL_MS = 2 * 60 * 1000; // 2 minutes deduplication window

  constructor() {
    this.transporter = createSmtpTransporter();
  }

  /**
   * Tests the SMTP connection on server startup.
   */
  public async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('✅ [SMTP AUDIT] Connection to Gmail SMTP service verified successfully.');
      return true;
    } catch (error: any) {
      console.error('❌ [SMTP AUDIT] Failed to connect to Gmail SMTP service:', error?.message || error);
      return false;
    }
  }

  /**
   * Computes deduplication hash for an email send request.
   */
  private getDeduplicationHash(to: string, subject: string, html: string): string {
    return crypto.createHash('md5').update(`${to.toLowerCase()}:${subject}:${html}`).digest('hex');
  }

  /**
   * Sends an email via Gmail SMTP with logging, error handling, HTML support, and duplicate prevention.
   */
  public async sendEmail(options: SendEmailOptions): Promise<{
    success: boolean;
    messageId?: string;
    duplicated?: boolean;
    error?: string;
  }> {
    const { to, subject, html, text, attachments } = options;

    if (!to || !subject || !html) {
      const errorMsg = 'Missing required email fields: to, subject, or html content';
      console.error(`[EmailService] ValidationError: ${errorMsg}`);
      return { success: false, error: errorMsg };
    }

    // 1. Prevent duplicate sends within 2 minutes
    const hash = this.getDeduplicationHash(to, subject, html);
    const now = Date.now();
    const lastSentTime = this.recentSends.get(hash);

    if (lastSentTime && now - lastSentTime < this.DUP_TTL_MS) {
      console.warn(`[EmailService] ⚠️ Duplicate send prevented for: ${to} | Subject: "${subject}"`);
      return {
        success: true,
        duplicated: true,
        messageId: `dup_prevented_${hash}`,
      };
    }

    try {
      console.log(`[EmailService] ⚡ Dispatching email to: ${to} | Subject: "${subject}"...`);
      
      const mailOptions = {
        from: smtpConfig.from,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>?/gm, ''), // fallback plain text
        attachments: attachments || [],
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      // Update deduplication timestamp
      this.recentSends.set(hash, now);
      this.cleanDeduplicationCache(now);

      console.log(`[EmailService] ✅ Email dispatched successfully. MessageID: ${info.messageId}`);
      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error: any) {
      console.error(`[EmailService] ❌ SMTP Error dispatching email to ${to}:`, error?.message || error);
      return {
        success: false,
        error: error?.message || 'SMTP dispatch failure',
      };
    }
  }

  /**
   * Helper to clean expired deduplication hashes.
   */
  private cleanDeduplicationCache(now: number) {
    for (const [hash, timestamp] of this.recentSends.entries()) {
      if (now - timestamp > this.DUP_TTL_MS) {
        this.recentSends.delete(hash);
      }
    }
  }
}

export const emailService = new EmailService();
