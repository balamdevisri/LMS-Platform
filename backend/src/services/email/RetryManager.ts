import { emailLogsCollection, isFirestoreInitialized } from '../../firebase/collections';
import { EmailLogRecord } from '../../types/emailTypes';
import { IEmailProvider } from './providers/EmailProvider.interface';
import { buildEventEmailTemplate } from './emailTemplates';
import logger from '../../config/logger';

export class RetryManager {
  public static async retryFailedEmails(
    provider: IEmailProvider,
    fromAddress: string,
    maxRetries: number = 3
  ): Promise<{ retriedCount: number; succeededCount: number; failedCount: number }> {
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
          const { subject, html } = buildEventEmailTemplate(log.eventType, log.payload);

          const sendRes = await provider.send({
            from: fromAddress,
            to: log.recipientEmail,
            subject,
            html,
          });

          if (sendRes.success) {
            await docSnap.ref.update({
              status: 'sent',
              attempts,
              messageId: sendRes.messageId,
              error: null,
              updatedAt: nowIso,
              lastAttemptAt: nowIso,
            });
            succeededCount++;
          } else {
            throw new Error(sendRes.error);
          }
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
      logger.error('❌ RetryManager: Error executing retry worker:', err?.message || err);
      return { retriedCount: 0, succeededCount: 0, failedCount: 0 };
    }
  }
}
