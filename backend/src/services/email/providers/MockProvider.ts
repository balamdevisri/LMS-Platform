import { IEmailProvider, SendEmailOptions } from './EmailProvider.interface';
import logger from '../../../config/logger';

export class MockProvider implements IEmailProvider {
  public async send(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const messageId = `mock_msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    logger.info(`[MOCK EMAIL SENT] To: ${options.to} | Subject: "${options.subject}" | MsgId: ${messageId}`);
    return {
      success: true,
      messageId,
    };
  }
}
