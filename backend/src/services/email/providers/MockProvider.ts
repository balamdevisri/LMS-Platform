import { IEmailProvider } from '../IEmailProvider';
import logger from '../../../config/logger';

export class MockProvider implements IEmailProvider {
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
    logger.info(`[MockProvider] Simulated sending email:
    To: ${options.to}
    Subject: ${options.subject}
    Body snippet: ${options.html.substring(0, 100)}...
    Attachments count: ${options.attachments?.length || 0}`);
    return { success: true, messageId: `mock_id_${Math.random().toString(36).substring(2, 9)}` };
  }

  async verify(): Promise<boolean> {
    return true;
  }
}
