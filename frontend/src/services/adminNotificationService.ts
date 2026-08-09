import { db, auth } from '@/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';

export interface AdminNotification {
  id: string;
  type: 'NEW_STUDENT' | 'APPROVAL' | 'REJECTION' | 'COURSE_CREATED' | 'ASSIGNMENT_SUBMITTED' | 'QUIZ_COMPLETED' | 'INSTRUCTOR_REGISTERED';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  avatar?: string;
  link?: string;
}

const STORAGE_KEY = 'shaivika_admin_notifications_v2';

class AdminNotificationService {
  private listeners: Array<(notifs: AdminNotification[]) => void> = [];
  private unsubscribeListener: (() => void) | null = null;
  private listenerCleanup: (() => void) | null = null;

  constructor() {
    // Lazily initialized when someone subscribes
  }

  private initFirestoreListener() {
    const firestore = db;
    if (!firestore) return;

    // Listen to Auth state changes to ensure we only subscribe to Firestore when authenticated
    const authUnsubscribe = auth?.onAuthStateChanged((user) => {
      if (user) {
        if (this.unsubscribeListener) return;

        try {
          const notifRef = collection(firestore, 'notifications');
          const q = query(notifRef, where('recipientRole', '==', 'admin'));
          
          this.unsubscribeListener = onSnapshot(
            q,
            (snapshot) => {
              const firestoreNotifs: AdminNotification[] = [];
              snapshot.forEach((docSnap) => {
                const data = docSnap.data();
                const titleStr = data.title || 'Notification';
                const defaultLink = titleStr.toLowerCase().includes('lecturer') || titleStr.toLowerCase().includes('instructor')
                  ? '/admin/instructors'
                  : '/admin/students?status=pending';

                firestoreNotifs.push({
                  id: docSnap.id,
                  type: data.type === 'info' ? 'NEW_STUDENT' : (data.type || 'NEW_STUDENT'),
                  title: titleStr,
                  message: data.message || data.desc || '',
                  timestamp: data.createdAt ? this.formatTimeAgo(data.createdAt) : 'Recently',
                  read: Boolean(data.read || data.isRead),
                  link: data.link || defaultLink,
                });
              });

              // Merge Firestore notifications with locally created real-time actions
              const local = this.getLocalNotifications();
              const mergedMap = new Map<string, AdminNotification>();
              
              local.forEach(n => mergedMap.set(n.id, n));
              firestoreNotifs.forEach(n => mergedMap.set(n.id, n));

              const merged = Array.from(mergedMap.values()).sort((a, b) => {
                return b.id.localeCompare(a.id);
              });

              this.saveNotifications(merged);
            },
            (error) => {
              console.error(`[Firestore Admin Notification Listener] Error: ${error.message}`);
            }
          );
        } catch (e: any) {
          console.error(`[Firestore Audit] Subscription error on admin notifications: ${e.message || e}`);
        }
      } else {
        if (this.unsubscribeListener) {
          this.unsubscribeListener();
          this.unsubscribeListener = null;
        }
      }
    });

    return () => {
      if (authUnsubscribe) authUnsubscribe();
      if (this.unsubscribeListener) {
        this.unsubscribeListener();
        this.unsubscribeListener = null;
      }
    };
  }

  private formatTimeAgo(dateStr: string): string {
    try {
      const seconds = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
      if (seconds < 60) return 'Just now';
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return 'Recently';
    }
  }

  private getLocalNotifications(): AdminNotification[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse notifications from localStorage:', e);
    }
    return [];
  }

  getNotifications(): AdminNotification[] {
    return this.getLocalNotifications();
  }

  saveNotifications(notifs: AdminNotification[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifs));
    } catch (e) {
      console.warn('Failed to save notifications to localStorage:', e);
    }
    this.notifyListeners(notifs);
  }

  addNotification(notif: Omit<AdminNotification, 'id' | 'timestamp' | 'read'>) {
    const current = this.getNotifications();
    const newEntry: AdminNotification = {
      ...notif,
      id: `notif_${Date.now()}`,
      timestamp: 'Just now',
      read: false
    };
    const updated = [newEntry, ...current];
    this.saveNotifications(updated);
  }

  markAllAsRead() {
    const current = this.getNotifications().map(n => ({ ...n, read: true }));
    this.saveNotifications(current);
  }

  markAsRead(id: string) {
    const current = this.getNotifications().map(n => n.id === id ? { ...n, read: true } : n);
    this.saveNotifications(current);
  }

  toggleRead(id: string) {
    const current = this.getNotifications().map(n => n.id === id ? { ...n, read: !n.read } : n);
    this.saveNotifications(current);
  }

  deleteNotification(id: string) {
    const current = this.getNotifications().filter(n => n.id !== id);
    this.saveNotifications(current);
  }

  clearAll() {
    this.saveNotifications([]);
  }

  subscribe(callback: (notifs: AdminNotification[]) => void): () => void {
    this.listeners.push(callback);
    callback(this.getNotifications());

    if (this.listeners.length === 1) {
      this.listenerCleanup = this.initFirestoreListener() || null;
    }

    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
      if (this.listeners.length === 0 && this.listenerCleanup) {
        this.listenerCleanup();
        this.listenerCleanup = null;
      }
    };
  }

  private notifyListeners(notifs: AdminNotification[]) {
    this.listeners.forEach(l => l(notifs));
  }
}

export const adminNotificationService = new AdminNotificationService();
