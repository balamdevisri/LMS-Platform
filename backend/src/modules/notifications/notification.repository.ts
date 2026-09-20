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

// In-memory cache fallback for development / fast retrieval
const memoryNotifications = new Map<string, IDurableNotification>();

export class NotificationRepository {
  private collection = db.collection('notifications');

  /**
   * Save a single notification deterministically in Firestore
   */
  public async saveNotification(notification: IDurableNotification): Promise<void> {
    memoryNotifications.set(notification.id, { ...notification });

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
    for (const notif of notifications) {
      memoryNotifications.set(notif.id, { ...notif });
    }

    if (!isFirebaseAdminInitialized() || notifications.length === 0) {
      return notifications.length;
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
   * Fetch notifications for a user (including personal + global notifications)
   */
  public async getNotificationsForUser(userId: string, limitCount: number = 50): Promise<IDurableNotification[]> {
    if (isFirebaseAdminInitialized()) {
      try {
        const [userSnap, globalSnap] = await Promise.all([
          this.collection
            .where('recipientId', '==', userId)
            .limit(limitCount)
            .get(),
          this.collection
            .where('recipientId', '==', 'global')
            .limit(20)
            .get(),
        ]);

        const notifMap = new Map<string, IDurableNotification>();
        userSnap.docs.forEach((d) => notifMap.set(d.id, d.data() as IDurableNotification));
        globalSnap.docs.forEach((d) => notifMap.set(d.id, d.data() as IDurableNotification));

        const list = Array.from(notifMap.values()).sort(
          (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
        return list.slice(0, limitCount);
      } catch (err: any) {
        logger.warn(`[NOTIFICATION REPO] Fetch notifications notice for ${userId}:`, err?.message || err);
      }
    }

    // Fallback to memory
    const list = Array.from(memoryNotifications.values())
      .filter((n) => n.recipientId === userId || n.recipientId === 'global')
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    return list.slice(0, limitCount);
  }

  /**
   * Mark a single notification as read
   */
  public async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    const mem = memoryNotifications.get(notificationId);
    if (mem) {
      mem.read = true;
    }

    if (!isFirebaseAdminInitialized()) {
      return true;
    }

    try {
      await this.collection.doc(notificationId).set({ read: true }, { merge: true });
      return true;
    } catch (err: any) {
      logger.error(`[NOTIFICATION REPO] Failed to mark as read ${notificationId}:`, err?.message || err);
      return false;
    }
  }

  /**
   * Mark all notifications for a user as read
   */
  public async markAllAsRead(userId: string): Promise<number> {
    let count = 0;
    memoryNotifications.forEach((n) => {
      if (n.recipientId === userId) {
        n.read = true;
        count++;
      }
    });

    if (!isFirebaseAdminInitialized()) {
      return count;
    }

    try {
      const snap = await this.collection.where('recipientId', '==', userId).where('read', '==', false).get();
      if (snap.empty) return 0;

      const batch = db.batch();
      snap.docs.forEach((doc) => {
        batch.update(doc.ref, { read: true });
      });
      await batch.commit();
      return snap.docs.length;
    } catch (err: any) {
      logger.error(`[NOTIFICATION REPO] Failed to mark all as read for ${userId}:`, err?.message || err);
      return 0;
    }
  }

  /**
   * Get unread notifications count for a user
   */
  public async getUnreadCount(userId: string): Promise<number> {
    if (isFirebaseAdminInitialized()) {
      try {
        const snap = await this.collection
          .where('recipientId', '==', userId)
          .where('read', '==', false)
          .get();
        return snap.size;
      } catch (err: any) {
        logger.warn(`[NOTIFICATION REPO] getUnreadCount notice for ${userId}:`, err?.message || err);
      }
    }

    let count = 0;
    memoryNotifications.forEach((n) => {
      if ((n.recipientId === userId || n.recipientId === 'global') && !n.read) {
        count++;
      }
    });
    return count;
  }
}
