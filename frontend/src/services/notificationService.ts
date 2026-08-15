import { db } from '@/firebase';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';

export interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  read: boolean;
  type?: 'course' | 'assignment' | 'live_class' | 'achievement' | 'system' | 'info' | 'success' | 'warning' | 'certificate';
  createdAt: string;
  link?: string;
  recipientId?: string;
  recipientRole?: 'student' | 'admin' | 'all';
}

const LOCAL_STORAGE_KEY = 'shaivika_realtime_notifications_v2';
const DELETED_NOTIFS_KEY = 'shaivika_deleted_notifications_v1';

const DEFAULT_ENTERPRISE_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_welcome_system',
    title: 'Welcome to KaizenQ AI LMS 3.0',
    desc: 'Your AI learning engine, interactive sandboxes, and skill analytics are fully active.',
    time: 'Just now',
    read: false,
    type: 'system',
    createdAt: new Date().toISOString(),
    link: '/dashboard',
    recipientRole: 'all',
  },
  {
    id: 'notif_c_compiler_ready',
    title: 'C Programming Sandbox Active',
    desc: 'Interactive GCC Compiler is now live in Practice Hub with 10+ code labs and live console.',
    time: '15m ago',
    read: false,
    type: 'assignment',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    link: '/dashboard?tab=practice-hub',
    recipientRole: 'all',
  },
  {
    id: 'notif_live_class_scheduled',
    title: 'Live Interactive Session Ready',
    desc: 'Join the upcoming Live Engineering Masterclass with real-time Q&A and code reviews.',
    time: '1h ago',
    read: true,
    type: 'live_class',
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    link: '/dashboard/live-classroom',
    recipientRole: 'all',
  },
  {
    id: 'notif_leaderboard_update',
    title: 'Cohort Leaderboard Live Sync',
    desc: 'Rankings have been updated with latest XP and module completion metrics.',
    time: '2h ago',
    read: true,
    type: 'achievement',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    link: '/dashboard?tab=leaderboard',
    recipientRole: 'all',
  },
];

class NotificationService {
  private listeners: Set<(items: NotificationItem[]) => void> = new Set();

  private getDeletedIds(): Set<string> {
    try {
      const saved = localStorage.getItem(DELETED_NOTIFS_KEY);
      if (saved) return new Set(JSON.parse(saved));
    } catch {}
    return new Set();
  }

  private addDeletedId(id: string): void {
    const set = this.getDeletedIds();
    set.add(id);
    try {
      localStorage.setItem(DELETED_NOTIFS_KEY, JSON.stringify(Array.from(set)));
    } catch {}
  }

  private getLocalNotifications(): NotificationItem[] {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      const deletedIds = this.getDeletedIds();
      if (saved !== null) {
        const parsed: NotificationItem[] = JSON.parse(saved);
        if (parsed.length > 0) {
          return parsed.filter((item) => !deletedIds.has(item.id));
        }
      }
      // If empty or never saved, seed with default enterprise notifications
      return DEFAULT_ENTERPRISE_NOTIFICATIONS.filter((item) => !deletedIds.has(item.id));
    } catch (e) {
      console.warn('Failed to parse local notifications cache:', e);
    }
    return DEFAULT_ENTERPRISE_NOTIFICATIONS;
  }

  private saveLocalNotifications(items: NotificationItem[]): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
      this.notifyListeners(items);
    } catch (e) {
      console.warn('Failed to save local notifications cache:', e);
    }
  }

  private notifyListeners(items: NotificationItem[]): void {
    this.listeners.forEach((cb) => cb(items));
  }

  /**
   * Subscribe to real-time notification updates from Firestore database & local store.
   */
  subscribeToNotifications(
    userId: string | undefined,
    callback: (notifications: NotificationItem[]) => void
  ): () => void {
    this.listeners.add(callback);
    const initialData = this.getLocalNotifications();
    callback(initialData);

    const unsubscribers: (() => void)[] = [];

    if (!userId) {
      console.log('[Firestore Audit] Skipped notifications listener: No authenticated userId.');
      return () => {
        this.listeners.delete(callback);
      };
    }

    if (db) {
      try {
        const notifRef = collection(db, 'notifications');
        const deletedIds = this.getDeletedIds();

        // Check if user is admin
        const isAdminUser = userId === 'admin_system' || (userId && (userId.toLowerCase().startsWith('admin') || userId.includes('admin')));

        console.log(`[Firestore Audit] Collection: notifications | Authenticated UID: ${userId} | Subscribing...`);

        // Global map to hold and merge notifications from all query snapshot channels
        const notificationCacheMap = new Map<string, NotificationItem>();

        const handleSnapshot = (snapshot: any, sourceLabel: string) => {
          console.log(`[Firestore Audit] Received update from: ${sourceLabel} | Count: ${snapshot.size}`);
          
          snapshot.forEach((docSnap: any) => {
            const data = docSnap.data();
            if (!deletedIds.has(docSnap.id)) {
              notificationCacheMap.set(docSnap.id, {
                id: docSnap.id,
                title: data.title || 'Platform Alert',
                desc: data.desc || '',
                time: data.createdAt ? this.formatTimeAgo(data.createdAt) : 'Recently',
                read: Boolean(data.read),
                type: data.type || 'info',
                createdAt: data.createdAt || new Date().toISOString(),
                link: data.link,
                recipientId: data.recipientId,
                recipientRole: data.recipientRole,
              });
            }
          });

          // Sort and save
          const mergedList = Array.from(notificationCacheMap.values());
          mergedList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          this.saveLocalNotifications(mergedList);
        };

        if (isAdminUser || !userId) {
          // Admin can listen to everything
          const unsub = onSnapshot(
            notifRef,
            (snap) => handleSnapshot(snap, 'admin_all_notifications'),
            (error) => {
              console.error(`[Firestore Permission Audit] Collection: notifications | Authenticated UID: ${userId} | Error: ${error.message}`);
              callback(this.getLocalNotifications());
            }
          );
          unsubscribers.push(unsub);
        } else {
          // Constrained role-based queries matching Firestore rules
          const qUser = query(notifRef, where('recipientId', '==', userId));
          const qAll = query(notifRef, where('recipientRole', '==', 'all'));
          const qStudent = query(notifRef, where('recipientRole', '==', 'student'));

          const unsubUser = onSnapshot(
            qUser,
            (snap) => handleSnapshot(snap, `user_${userId}_notifications`),
            (error) => {
              console.error(`[Firestore Permission Audit] Query: recipientId==${userId} | Authenticated UID: ${userId} | Error: ${error.message}`);
            }
          );

          const unsubAll = onSnapshot(
            qAll,
            (snap) => handleSnapshot(snap, 'global_all_notifications'),
            (error) => {
              console.error(`[Firestore Permission Audit] Query: recipientRole==all | Authenticated UID: ${userId} | Error: ${error.message}`);
            }
          );

          const unsubStudent = onSnapshot(
            qStudent,
            (snap) => handleSnapshot(snap, 'global_student_notifications'),
            (error) => {
              console.error(`[Firestore Permission Audit] Query: recipientRole==student | Authenticated UID: ${userId} | Error: ${error.message}`);
            }
          );

          unsubscribers.push(unsubUser, unsubAll, unsubStudent);
        }
      } catch (e: any) {
        console.error(`[Firestore Audit] Subscription error on notifications: ${e.message || e}`);
      }
    }

    return () => {
      this.listeners.delete(callback);
      unsubscribers.forEach((unsub) => unsub());
    };
  }

  /**
   * Toggle read/unread state for a single notification.
   */
  async toggleRead(notificationId: string): Promise<void> {
    const current = this.getLocalNotifications();
    let nextReadState = true;
    const updated = current.map((item) => {
      if (item.id === notificationId) {
        nextReadState = !item.read;
        return { ...item, read: nextReadState };
      }
      return item;
    });
    this.saveLocalNotifications(updated);

    if (db) {
      try {
        const docRef = doc(db, 'notifications', notificationId);
        await updateDoc(docRef, { read: nextReadState });
      } catch (e) {
        console.warn('Firestore toggle read notice:', e);
      }
    }
  }

  /**
   * Mark a single notification as read.
   */
  async markAsRead(notificationId: string): Promise<void> {
    const current = this.getLocalNotifications();
    const updated = current.map((item) =>
      item.id === notificationId ? { ...item, read: true } : item
    );
    this.saveLocalNotifications(updated);

    if (db) {
      try {
        const docRef = doc(db, 'notifications', notificationId);
        await updateDoc(docRef, { read: true });
      } catch (e) {
        console.warn('Firestore mark as read notice:', e);
      }
    }
  }

  /**
   * Delete a single notification.
   */
  async deleteNotification(notificationId: string): Promise<void> {
    this.addDeletedId(notificationId);

    const current = this.getLocalNotifications();
    const updated = current.filter((item) => item.id !== notificationId);
    this.saveLocalNotifications(updated);

    if (db) {
      try {
        const docRef = doc(db, 'notifications', notificationId);
        await deleteDoc(docRef);
      } catch (e) {
        console.warn('Firestore delete notification notice:', e);
      }
    }
  }

  /**
   * Mark all notifications as read.
   */
  async markAllAsRead(): Promise<void> {
    const current = this.getLocalNotifications();
    const updated = current.map((item) => ({ ...item, read: true }));
    this.saveLocalNotifications(updated);

    if (!db) return;

    try {
      const notifRef = collection(db, 'notifications');
      const snapshot = await getDocs(notifRef);
      snapshot.forEach(async (docSnap) => {
        if (db) {
          await updateDoc(doc(db, 'notifications', docSnap.id), { read: true }).catch(() => null);
        }
      });
    } catch (e) {
      console.warn('Firestore mark all read notice:', e);
    }
  }

  /**
   * Clear all notifications.
   */
  async clearAll(): Promise<void> {
    const current = this.getLocalNotifications();
    current.forEach((item) => this.addDeletedId(item.id));

    this.saveLocalNotifications([]);

    if (!db) return;

    try {
      const notifRef = collection(db, 'notifications');
      const snapshot = await getDocs(notifRef);
      snapshot.forEach(async (docSnap) => {
        if (db) {
          await deleteDoc(doc(db, 'notifications', docSnap.id)).catch(() => null);
        }
      });
    } catch (e) {
      console.warn('Firestore clear all notice:', e);
    }
  }

  /**
   * Send a new real-time notification doc to Firestore & Local storage.
   */
  async sendNotification(payload: {
    title: string;
    desc: string;
    type?: 'info' | 'success' | 'warning' | 'certificate' | 'assignment';
    recipientId?: string;
    recipientRole?: 'student' | 'admin' | 'all';
    link?: string;
  }): Promise<void> {
    const newId = `notif_${Date.now()}`;
    const newItem: NotificationItem = {
      id: newId,
      title: payload.title,
      desc: payload.desc,
      time: 'Just now',
      read: false,
      type: payload.type || 'info',
      createdAt: new Date().toISOString(),
      link: payload.link,
      recipientId: payload.recipientId,
      recipientRole: payload.recipientRole || 'all',
    };

    const current = this.getLocalNotifications();
    const updated = [newItem, ...current];
    this.saveLocalNotifications(updated);

    if (db) {
      try {
        await setDoc(doc(db, 'notifications', newId), newItem);
      } catch (e) {
        console.warn('Firestore send notification notice:', e);
      }
    }
  }

  private formatTimeAgo(isoString: string): string {
    const sec = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (sec < 60) return 'Just now';
    if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
    if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
    return `${Math.floor(sec / 86400)}d ago`;
  }
}

export const notificationService = new NotificationService();
