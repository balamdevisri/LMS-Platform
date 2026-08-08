import { emailLogsCollection, isFirestoreInitialized } from '../../../firebase/collections';
import { EmailLogRecord } from '../../../types/emailTypes';
import { IEmailProvider } from '../IEmailProvider';
import { EmailTemplateEngine } from '../templates/EmailTemplateEngine';
import logger from '../../../config/logger';

export class EmailRetryManager {
  private provider: IEmailProvider;
  private templateEngine: EmailTemplateEngine;

  constructor(provider: IEmailProvider, templateEngine: EmailTemplateEngine) {
    this.provider = provider;
    this.templateEngine = templateEngine;
  }

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
          const { subject, html } = this.templateEngine.build(log.eventType, log.payload);
          
          const result = await this.provider.send({
            to: log.recipientEmail,
            subject,
            html,
          });

          if (!result.success) {
            throw new Error(result.error || 'Failed sending email during retry');
          }

          await docSnap.ref.update({
            status: 'sent',
            attempts,
            messageId: result.messageId,
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
      logger.error('❌ EmailRetryManager: Error executing retry worker: ' + (err?.message || err));
      return { retriedCount: 0, succeededCount: 0, failedCount: 0 };
    }
  }
}
