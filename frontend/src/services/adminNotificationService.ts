export interface AdminNotification {
  id: string;
  type: 'NEW_STUDENT' | 'APPROVAL' | 'REJECTION' | 'COURSE_CREATED' | 'ASSIGNMENT_SUBMITTED' | 'QUIZ_COMPLETED';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  avatar?: string;
}

const STORAGE_KEY = 'shaivika_admin_notifications_v1';

const INITIAL_NOTIFICATIONS: AdminNotification[] = [
  {
    id: 'notif_1',
    type: 'NEW_STUDENT',
    title: 'New Student Application',
    message: 'Vikram Sharma registered and completed email verification.',
    timestamp: '2 mins ago',
    read: false,
  },
  {
    id: 'notif_2',
    type: 'ASSIGNMENT_SUBMITTED',
    title: 'Assignment Submission',
    message: 'Ananya Rao submitted Linux Shell Scripting Lab #3.',
    timestamp: '15 mins ago',
    read: false,
  },
  {
    id: 'notif_3',
    type: 'APPROVAL',
    title: 'Student Approved',
    message: 'Rahul Verma account was approved by Admin.',
    timestamp: '1 hour ago',
    read: true,
  },
  {
    id: 'notif_4',
    type: 'QUIZ_COMPLETED',
    title: 'AI Quiz Passed',
    message: 'Neha Gupta scored 95% on System Architecture Mastery.',
    timestamp: '2 hours ago',
    read: true,
  }
];

class AdminNotificationService {
  private listeners: Array<(notifs: AdminNotification[]) => void> = [];

  getNotifications(): AdminNotification[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse notifications from localStorage:', e);
    }
    return INITIAL_NOTIFICATIONS;
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

  subscribe(callback: (notifs: AdminNotification[]) => void): () => void {
    this.listeners.push(callback);
    callback(this.getNotifications());
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notifyListeners(notifs: AdminNotification[]) {
    this.listeners.forEach(l => l(notifs));
  }
}

export const adminNotificationService = new AdminNotificationService();
