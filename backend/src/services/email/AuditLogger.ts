import { emailLogsCollection, isFirestoreInitialized } from '../../firebase/collections';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { EmailLogRecord, EmailEventType, EmailStatus } from '../../types/emailTypes';
import logger from '../../config/logger';

export class AuditLogger {
  public static async createPendingLog(logRecord: EmailLogRecord): Promise<string | undefined> {
    if (!isFirestoreInitialized()) return undefined;

    try {
      const docRef = await emailLogsCollection().add(logRecord);
      return docRef.id;
    } catch (err: any) {
      logger.warn('⚠️ AuditLogger: Failed to create pending record in Firestore:', err?.message || err);
      return undefined;
    }
  }

  public static async updateLogStatus(
    logDocId?: string,
    status?: EmailStatus,
    messageId?: string,
    errorMsg?: string
  ): Promise<void> {
    if (!logDocId || !isFirestoreInitialized()) return;

    try {
      const updateData: Partial<EmailLogRecord> = {
        updatedAt: new Date().toISOString(),
      };

      if (status) updateData.status = status;
      if (messageId) updateData.messageId = messageId;
      if (errorMsg) updateData.error = errorMsg;

      await emailLogsCollection().doc(logDocId).update(updateData);
    } catch (err: any) {
      logger.warn(`⚠️ AuditLogger: Failed updating status for log ${logDocId}:`, err?.message || err);
    }
  }

  public static async getLogs(limitCount: number = 50): Promise<EmailLogRecord[]> {
    if (!isFirestoreInitialized()) return [];

    try {
      const snapshot = await emailLogsCollection()
        .orderBy('createdAt', 'desc')
        .limit(limitCount)
        .get();

      return snapshot.docs.map((docSnap: QueryDocumentSnapshot) => ({
        id: docSnap.id,
        ...(docSnap.data() as EmailLogRecord),
      }));
    } catch (err: any) {
      logger.warn('⚠️ AuditLogger: Failed to fetch logs from Firestore:', err?.message || err);
      return [];
    }
  }
}
