import { Resend } from 'resend';
import { IEmailProvider, SendEmailOptions } from './EmailProvider.interface';

export class ResendProvider implements IEmailProvider {
  private resendClient: Resend;

  constructor(apiKey: string) {
    this.resendClient = new Resend(apiKey);
  }

  public async send(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const res = await this.resendClient.emails.send({
        from: options.from,
        to: [options.to],
        subject: options.subject,
        html: options.html,
      });

      if (res.error) {
        return {
          success: false,
          error: res.error.message,
        };
      }

      return {
        success: true,
        messageId: res.data?.id || undefined,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || String(err),
      };
    }
  }
}
