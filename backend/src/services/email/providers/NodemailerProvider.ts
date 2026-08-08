import nodemailer from 'nodemailer';
import { IEmailProvider } from '../IEmailProvider';
import { env } from '../../../config/env';

export class NodemailerProvider implements IEmailProvider {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: parseInt(env.SMTP_PORT, 10),
      secure: env.SMTP_SECURE === 'true',
      auth: {
        user: env.SMTP_USER || env.SMTP_EMAIL,
        pass: env.SMTP_PASS || env.SMTP_PASSWORD,
      },
    });
  }

  async send(options: {
    to: string;
    subject: string;
    html: string;
    text?: string;
    attachments?: Array<{
      filename: string;
      content: any;
      contentType?: string;
    }>;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const info = await this.transporter.sendMail({
        from: env.SMTP_FROM,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || '',
        attachments: options.attachments || [],
      });
      return { success: true, messageId: info.messageId };
    } catch (err: any) {
      return { success: false, error: err?.message || String(err) };
    }
  }

  async verify(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (err) {
      console.error('[NodemailerProvider] Verify failed:', err);
      return false;
    }
  }
}
