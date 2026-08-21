import nodemailer from 'nodemailer';
import { IEmailProvider } from '../IEmailProvider';
import {
  getSharedSmtpTransporter,
  getSmtpCredentials,
  verifySmtpWithBackoff,
  handleSmtpSendError,
} from '../../../config/smtp.config';

export class NodemailerProvider implements IEmailProvider {
  private get transporter(): nodemailer.Transporter {
    return getSharedSmtpTransporter();
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
      const { from } = getSmtpCredentials();
      const plainText = options.text || options.html.replace(/<[^>]*>?/gm, '');

      const info = await this.transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: plainText,
        attachments: options.attachments || [],
      });

      return { success: true, messageId: info.messageId };
    } catch (err: any) {
      handleSmtpSendError(err);
      const msg = err?.message || String(err);
      console.error('[NodemailerProvider] Email send error:', msg);
      return { success: false, error: msg };
    }
  }

  async verify(): Promise<boolean> {
    return verifySmtpWithBackoff(false);
  }
}
