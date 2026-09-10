import { db, isFirebaseAdminInitialized } from '../../firebase';
import logger from '../../config/logger';
import { FieldValue } from 'firebase-admin/firestore';

export interface IDurableNotification {
  id: string;
  type: string;
  title: string;
  desc: string;
  message?: string;
  time: string;
  read: boolean;
  priority: 'high' | 'normal' | 'low';
  createdAt: string;
  serverCreatedAt?: any;
  link: string;
  recipientId: string;
  recipientRole: 'student' | 'admin' | 'all';
  liveClassId?: string;
  courseId?: string;
  instructorId?: string;
}

export class NotificationRepository {
  private collection = db.collection('notifications');

  /**
   * Save a single notification deterministically in Firestore
   */
  public async saveNotification(notification: IDurableNotification): Promise<void> {
    if (!isFirebaseAdminInitialized()) {
      return;
    }
    try {
      await this.collection.doc(notification.id).set({
        ...notification,
        serverCreatedAt: FieldValue.serverTimestamp(),
      }, { merge: true });
    } catch (err: any) {
      logger.error(`[NOTIFICATION REPO] Failed to save notification ${notification.id}:`, err?.message || err);
      throw err;
    }
  }

  /**
   * Batch save notifications in chunks of 500 (Firestore transaction/batch limit)
   */
  public async batchSaveNotifications(notifications: IDurableNotification[]): Promise<number> {
    if (!isFirebaseAdminInitialized() || notifications.length === 0) {
      return 0;
    }

    let savedCount = 0;
    const CHUNK_SIZE = 450; // safely below 500 operations per batch

    for (let i = 0; i < notifications.length; i += CHUNK_SIZE) {
      const chunk = notifications.slice(i, i + CHUNK_SIZE);
      const batch = db.batch();

      for (const notif of chunk) {
        const docRef = this.collection.doc(notif.id);
        batch.set(docRef, {
          ...notif,
          serverCreatedAt: FieldValue.serverTimestamp(),
        }, { merge: true });
      }

      try {
        await batch.commit();
        savedCount += chunk.length;
      } catch (err: any) {
        logger.error(`[NOTIFICATION REPO] Batch save error on chunk ${i} - ${i + chunk.length}:`, err?.message || err);
      }
    }

    return savedCount;
  }

  /**
   * Fetch unread notifications for a student
   */
  public async getNotificationsForUser(userId: string, limit: number = 50): Promise<IDurableNotification[]> {
    if (!isFirebaseAdminInitialized()) {
      return [];
    }
    try {
      const snap = await this.collection
        .where('recipientId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

      if (snap.empty) return [];
      return snap.docs.map(doc => doc.data() as IDurableNotification);
    } catch (err: any) {
      logger.warn(`[NOTIFICATION REPO] Fetch notifications notice for ${userId}:`, err?.message || err);
      return [];
    }
  }
}
