import nodemailer from 'nodemailer';
import { IEmailProvider } from '../IEmailProvider';
import { env } from '../../../config/env';

export class NodemailerProvider implements IEmailProvider {
  private transporter: nodemailer.Transporter;

  constructor() {
    const rawPort = process.env.SMTP_PORT || env.SMTP_PORT || '465';
    const port = parseInt(rawPort, 10);
    const isSecure = (process.env.SMTP_SECURE || env.SMTP_SECURE) === 'true' || port === 465;
    const rawUser = process.env.SMTP_USER || env.SMTP_USER || process.env.SMTP_EMAIL || env.SMTP_EMAIL || 'kaizenqlms@gmail.com';
    const rawPass = process.env.SMTP_PASS || env.SMTP_PASS || process.env.SMTP_PASSWORD || env.SMTP_PASSWORD || 'gmjv leoa tadp vdyg';

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || env.SMTP_HOST || 'smtp.gmail.com',
      port,
      secure: isSecure,
      auth: {
        user: rawUser.trim(),
        pass: rawPass.trim().replace(/\s+/g, ''),
      },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 15000,
      greetingTimeout: 10000,
      socketTimeout: 20000,
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
      const fromAddress = process.env.SMTP_FROM || env.SMTP_FROM || 'KaizenQ AI LMS <kaizenqlms@gmail.com>';
      const plainText = options.text || options.html.replace(/<[^>]*>?/gm, '');
      const info = await this.transporter.sendMail({
        from: fromAddress,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: plainText,
        attachments: options.attachments || [],
      });
      return { success: true, messageId: info.messageId };
    } catch (err: any) {
      console.error('[NodemailerProvider] Email send error:', err?.message || err);
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

