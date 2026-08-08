import { Resend } from 'resend';
import { IEmailProvider } from '../IEmailProvider';
import { env } from '../../../config/env';

export class ResendProvider implements IEmailProvider {
  private resendClient: Resend;

  constructor() {
    this.resendClient = new Resend(env.RESEND_API_KEY);
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
      const resendRes = await this.resendClient.emails.send({
        from: env.SMTP_FROM,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || '',
        attachments: (options.attachments || []).map((att) => ({
          filename: att.filename,
          content: att.content,
        })),
      });

      if (resendRes.error) {
        return { success: false, error: resendRes.error.message };
      }

      return { success: true, messageId: resendRes.data?.id };
    } catch (err: any) {
      return { success: false, error: err?.message || String(err) };
    }
  }

  async verify(): Promise<boolean> {
    // Resend client verify is usually implicitly verified via the API key,
    // we can return true if API key is present.
    return !!env.RESEND_API_KEY;
  }
}
