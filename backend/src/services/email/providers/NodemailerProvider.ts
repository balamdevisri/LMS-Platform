import nodemailer from 'nodemailer';
import { IEmailProvider, SendEmailOptions } from './EmailProvider.interface';
import logger from '../../../config/logger';

export class NodemailerProvider implements IEmailProvider {
  private transporter: nodemailer.Transporter;

  constructor(config: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  }) {
    this.transporter = nodemailer.createTransport({
      ...config,
      connectionTimeout: 10000,
      greetingTimeout: 5000,
    });
  }

  public async verify(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (err: any) {
      logger.error(`[NodemailerProvider] SMTP verify failed: ${err?.message || err}`);
      return false;
    }
  }

  public async send(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const mailOptions = {
        from: options.from,
        to: options.to,
        subject: options.subject,
        text: options.text || options.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
        html: options.html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || String(err),
      };
    }
  }
}
