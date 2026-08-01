import { db } from '@/firebase';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
} from 'firebase/firestore';

export interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  read: boolean;
  type?: 'info' | 'success' | 'warning' | 'certificate' | 'assignment';
  createdAt: string;
  link?: string;
  recipientId?: string;
  recipientRole?: 'student' | 'admin' | 'all';
}

const LOCAL_STORAGE_KEY = 'shaivika_realtime_notifications_v1';
const DELETED_NOTIFS_KEY = 'shaivika_deleted_notifications_v1';

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    title: 'Linux Lab Workstation Ready',
    desc: 'Ubuntu 24.04 LTS Terminal Environment initialized & connected.',
    time: 'Just now',
    read: false,
    type: 'success',
    createdAt: new Date().toISOString(),
    link: '/dashboard',
    recipientRole: 'all',
  },
  {
    id: 'notif_2',
    title: 'AI Quiz Released',
    desc: 'Module 4: Linux Virtual Filesystem Architecture score: 98/100',
    time: '15m ago',
    read: false,
    type: 'info',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    recipientRole: 'all',
  },
  {
    id: 'notif_3',
    title: 'Certificate Issued',
    desc: 'Fullstack Systems Engineering Certificate earned & ready for download.',
    time: '1d ago',
    read: true,
    type: 'certificate',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
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
      if (saved !== null) {
        const parsed: NotificationItem[] = JSON.parse(saved);
        const deletedIds = this.getDeletedIds();
        return parsed.filter((item) => !deletedIds.has(item.id));
      }
    } catch (e) {
      console.warn('Failed to parse local notifications cache:', e);
    }
    return DEFAULT_NOTIFICATIONS;
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

    let unsubscribeFirestore = () => {};

    if (db) {
      try {
        const notifRef = collection(db, 'notifications');
        unsubscribeFirestore = onSnapshot(
          notifRef,
          (snapshot) => {
            const fetched: NotificationItem[] = [];
            const deletedIds = this.getDeletedIds();

            snapshot.forEach((docSnap) => {
              const data = docSnap.data();
              const recipient = data.recipientId;
              const role = data.recipientRole || 'all';

              if (!deletedIds.has(docSnap.id) && (role === 'all' || role === 'student' || (userId && recipient === userId))) {
                fetched.push({
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

            if (fetched.length > 0) {
              fetched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
              this.saveLocalNotifications(fetched);
            }
          },
          (error) => {
            console.warn('Firestore notification snapshot notice:', error);
          }
        );
      } catch (e) {
        console.warn('Notification subscription notice:', e);
      }
    }

    return () => {
      this.listeners.delete(callback);
      unsubscribeFirestore();
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
