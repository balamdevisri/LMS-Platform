import { db } from '../../firebase';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import logger from '../../config/logger';

export interface AuditLogRecord {
  userId: string;
  userEmail?: string;
  userRole?: string;
  action: string;
  resource: string;
  ipAddress?: string;
  details?: any;
  timestamp: string;
}

export class AuditService {
  async log(record: AuditLogRecord): Promise<void> {
    if (db) {
      try {
        await db.collection('audit_logs').add({
          ...record,
          timestamp: record.timestamp || new Date().toISOString(),
        });
        logger.info(`[AUDIT LOG] ${record.action} on ${record.resource} by User: ${record.userId}`);
      } catch (err: any) {
        logger.warn(`⚠️ AuditService: Failed to record audit log: ${err?.message || err}`);
      }
    }
  }

  async getRecentLogs(limitCount: number = 50): Promise<AuditLogRecord[]> {
    if (!db) return [];
    try {
      const snap = await db.collection('audit_logs').orderBy('timestamp', 'desc').limit(limitCount).get();
      return snap.docs.map((doc: QueryDocumentSnapshot) => doc.data() as AuditLogRecord);
    } catch (err: any) {
      logger.error(`⚠️ AuditService: Failed fetching recent audit logs: ${err?.message || err}`);
      return [];
    }
  }
}

export const auditService = new AuditService();
