import { emailLogsCollection, isFirestoreInitialized } from '../../../firebase/collections';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { EmailLogRecord, EmailStatus } from '../../../types/emailTypes';
import logger from '../../../config/logger';

export class EmailAuditLogger {
  async logPending(record: Omit<EmailLogRecord, 'status' | 'attempts' | 'maxRetries' | 'createdAt' | 'updatedAt' | 'lastAttemptAt'>): Promise<string | undefined> {
    const nowIso = new Date().toISOString();
    const fullRecord: Record<string, any> = {
      type: record.type || record.eventType,
      eventType: record.eventType,
      recipient: record.recipient || record.recipientEmail,
      recipientEmail: record.recipientEmail,
      subject: record.subject,
      relatedEntityId: record.relatedEntityId || null,
      status: 'pending',
      provider: 'brevo',
      messageId: null,
      attempts: 1,
      maxRetries: 3,
      createdAt: nowIso,
      sentAt: null,
      errorMessage: null,
      updatedAt: nowIso,
      lastAttemptAt: nowIso,
      payload: JSON.parse(JSON.stringify(record.payload || {}, (_k, v) => (v === undefined ? null : v))),
    };

    if (isFirestoreInitialized()) {
      try {
        const docRef = await emailLogsCollection().add(fullRecord);
        return docRef.id;
      } catch (err: any) {
        logger.warn('⚠️ EmailAuditLogger: Failed to create pending record in Firestore: ' + (err?.message || err));
      }
    }
    return undefined;
  }

  async logSent(id: string, messageId?: string): Promise<void> {
    if (!isFirestoreInitialized()) return;
    try {
      const updateData: Record<string, any> = {
        status: 'sent',
        sentAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (messageId) updateData.messageId = messageId;
      await emailLogsCollection().doc(id).update(updateData);
    } catch (err: any) {
      logger.warn('⚠️ EmailAuditLogger: Failed updating sent status in Firestore: ' + (err?.message || err));
    }
  }

  async logFailure(id: string, error: any): Promise<void> {
    if (!isFirestoreInitialized()) return;
    try {
      const doc = await emailLogsCollection().doc(id).get();
      if (doc.exists) {
        const current = doc.data() as EmailLogRecord;
        const attempts = (current.attempts || 1) + 1;
        const status: EmailStatus = attempts >= (current.maxRetries || 3) ? 'failed' : 'pending';
        const errorMsg = error?.message || String(error);

        await emailLogsCollection().doc(id).update({
          status,
          attempts,
          error: errorMsg,
          errorMessage: errorMsg,
          lastError: errorMsg,
          lastAttemptAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (err: any) {
      logger.warn('⚠️ EmailAuditLogger: Failed logging failure in Firestore: ' + (err?.message || err));
    }
  }

  async updateStatus(logId?: string, status?: EmailStatus, messageId?: string, errorMsg?: string): Promise<void> {
    if (!logId || !isFirestoreInitialized()) return;

    try {
      const updateData: Record<string, any> = {
        updatedAt: new Date().toISOString(),
      };

      if (status) {
        updateData.status = status;
        if (status === 'sent') {
          updateData.sentAt = new Date().toISOString();
        }
      }
      if (messageId) updateData.messageId = messageId;
      if (errorMsg) {
        updateData.error = errorMsg;
        updateData.errorMessage = errorMsg;
      }

      await emailLogsCollection().doc(logId).update(updateData);
    } catch (err: any) {
      logger.warn(`⚠️ EmailAuditLogger: Failed updating status for log ${logId}: ` + (err?.message || err));
    }
  }

  async incrementAttempts(logId: string, errorMsg?: string): Promise<void> {
    if (!isFirestoreInitialized()) return;
    try {
      const doc = await emailLogsCollection().doc(logId).get();
      if (doc.exists) {
        const data = doc.data() as EmailLogRecord;
        const attempts = (data.attempts || 1) + 1;
        const updateData: Partial<EmailLogRecord> = {
          attempts,
          lastAttemptAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        if (errorMsg) updateData.error = errorMsg;
        await emailLogsCollection().doc(logId).update(updateData);
      }
    } catch (err: any) {
      logger.warn(`⚠️ EmailAuditLogger: Failed to increment attempts for log ${logId}: ` + (err?.message || err));
    }
  }

  async fetchFailed(limitCount: number = 25): Promise<EmailLogRecord[]> {
    if (!isFirestoreInitialized()) return [];
    try {
      const snapshot = await emailLogsCollection()
        .where('status', '==', 'failed')
        .limit(limitCount)
        .get();

      return snapshot.docs.map((doc: QueryDocumentSnapshot) => ({
        id: doc.id,
        ...(doc.data() as EmailLogRecord),
      }));
    } catch (err: any) {
      logger.error('⚠️ EmailAuditLogger: Failed fetching failed email logs: ' + (err?.message || err));
      return [];
    }
  }

  async fetchRecent(limitCount: number = 50): Promise<EmailLogRecord[]> {
    if (!isFirestoreInitialized()) return [];
    try {
      const snapshot = await emailLogsCollection()
        .orderBy('createdAt', 'desc')
        .limit(limitCount)
        .get();

      return snapshot.docs.map((doc: QueryDocumentSnapshot) => ({
        id: doc.id,
        ...(doc.data() as EmailLogRecord),
      }));
    } catch (err: any) {
      logger.error('⚠️ EmailAuditLogger: Failed fetching recent email logs: ' + (err?.message || err));
      return [];
    }
  }
}
