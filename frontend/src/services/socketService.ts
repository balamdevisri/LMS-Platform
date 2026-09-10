import { io, Socket } from 'socket.io-client';
import type { User as FirebaseUser } from 'firebase/auth';
import { liveClassService } from './liveClassService';
import { webNotificationService } from './webNotificationService';
import { notificationService } from './notificationService';
import type { ClassroomInteractionSettings } from '@/types/liveClassroomSettings';

const getSocketUrl = (): string => {
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return window.location.origin;
  }
  const envUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL;
  if (envUrl) {
    return envUrl.replace(/\/api\/?$/, '');
  }
  return 'http://localhost:5000';
};

export type ConnectionStatus = 'connected' | 'reconnecting' | 'disconnected' | 'idle';

type StatusListener = (status: ConnectionStatus) => void;

class SocketService {
  private socket: Socket | null = null;
  private currentLiveClassId: string | null = null;
  private connectionStatus: ConnectionStatus = 'idle';
  private statusListeners: Set<StatusListener> = new Set();

  public getSocket(): Socket | null {
    return this.socket;
  }

  public getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  /** Subscribe to connection status changes. Returns an unsubscribe function. */
  public onStatusChange(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    listener(this.connectionStatus);
    return () => this.statusListeners.delete(listener);
  }

  private emitStatus(status: ConnectionStatus): void {
    this.connectionStatus = status;
    this.statusListeners.forEach((l) => l(status));
  }

  /**
   * Connect using a Firebase User object.
   * Forces a fresh ID token via getIdToken(true) to prevent 1-hour expiry issues
   * that would silently drop students from long live class sessions.
   */
  public async connectWithFirebaseUser(
    firebaseUser: FirebaseUser,
    userInfo?: { name?: string; role?: string }
  ): Promise<Socket> {
    let freshToken = '';
    try {
      freshToken = await firebaseUser.getIdToken(true);
    } catch (e) {
      console.warn('[SocketService] Could not get fresh Firebase token, falling back to localStorage:', e);
      freshToken =
        localStorage.getItem('token') ||
        localStorage.getItem('shaivika_auth_token') ||
        localStorage.getItem('firebase_token') ||
        '';
    }

    return this.connect(freshToken, {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      name: userInfo?.name || firebaseUser.displayName || '',
      role: userInfo?.role || 'student',
    });
  }

  public connect(token?: string, userInfo?: { uid?: string; name?: string; role?: string; email?: string }): Socket {
    const authToken =
      token ||
      localStorage.getItem('token') ||
      localStorage.getItem('shaivika_auth_token') ||
      localStorage.getItem('firebase_token') ||
      '';
    const targetUserId = userInfo?.uid || 'student_guest';
    const targetRole = userInfo?.role || 'student';

    if (this.socket && this.socket.connected) {
      const currentAuth = (this.socket as any).auth || {};
      const tokenChanged = Boolean(authToken && currentAuth.token !== authToken);
      const userChanged = Boolean(userInfo?.uid && currentAuth.userId !== targetUserId);
      const roleChanged = Boolean(userInfo?.role && currentAuth.role !== targetRole);
      if (!tokenChanged && !userChanged && !roleChanged) {
        return this.socket;
      }
      this.socket.disconnect();
      this.socket = null;
    } else if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    const socketUrl = `${getSocketUrl()}/live-classroom`;

    this.socket = io(socketUrl, {
      autoConnect: true,
      transports: ['websocket', 'polling'],
      auth: {
        token: authToken,
        userId: targetUserId,
        name: userInfo?.name || 'Student',
        role: targetRole,
        email: userInfo?.email || '',
      },
      reconnection: true,
      reconnectionAttempts: 15,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    // Connection lifecycle — drives the connection status indicator in the UI
    this.socket.on('connect', () => {
      this.emitStatus('connected');
    });

    this.socket.on('disconnect', () => {
      this.emitStatus('disconnected');
    });

    this.socket.on('connect_error', () => {
      this.emitStatus('disconnected');
    });

    this.socket.io.on('reconnect_attempt', () => {
      this.emitStatus('reconnecting');
    });

    this.socket.io.on('reconnect', () => {
      this.emitStatus('connected');
      // Automatically rejoin live classroom upon reconnect only
      if (this.currentLiveClassId && this.socket) {
        console.info(`[LIVE_CLASS_RECONNECT] Auto-rejoining live class ${this.currentLiveClassId} on socket reconnect`);
        this.socket.emit('join_class', {
          classId: this.currentLiveClassId,
          liveClassId: this.currentLiveClassId,
          userId: currentAuth.userId,
          name: currentAuth.name,
          role: currentAuth.role,
        });
        if (currentAuth.role !== 'instructor' && currentAuth.role !== 'admin') {
          this.socket.emit('attendance:join', { liveClassId: this.currentLiveClassId });
        }
      }
    });

    this.socket.io.on('reconnect_failed', () => {
      this.emitStatus('disconnected');
    });

    // Global real-time deletion listener for all connected clients
    this.socket.on('liveClass:deleted', (data: { liveClassId?: string; classId?: string }) => {
      const id = data?.liveClassId || data?.classId;
      if (id) {
        liveClassService.deleteLiveClass(id);
      }
    });

    this.socket.on('live_class_deleted', (data: { liveClassId?: string; classId?: string }) => {
      const id = data?.liveClassId || data?.classId;
      if (id) {
        liveClassService.deleteLiveClass(id);
      }
    });

    this.socket.on('live_class_ended', (data: { liveClassId?: string; classId?: string }) => {
      const id = data?.liveClassId || data?.classId;
      if (id) {
        liveClassService.deleteLiveClass(id);
      }
    });

    this.socket.on('liveClass:status', (data: { liveClassId?: string; status?: string }) => {
      const id = data?.liveClassId;
      const status = (data?.status || '').toUpperCase();
      if (id && (status === 'ENDED' || status === 'COMPLETED' || status === 'CANCELLED')) {
        liveClassService.deleteLiveClass(id);
      }
    });

    // Global real-time live class notification listeners
    this.socket.on('live_class_scheduled', (data: { liveClass?: any }) => {
      try {
        if (data?.liveClass) {
          liveClassService.upsertLiveClass(data.liveClass);
          webNotificationService.notifyLiveClassScheduled(data.liveClass);
          notificationService.addNotification({
            title: `Live Class Scheduled: ${data.liveClass.title}`,
            desc: `Instructor ${data.liveClass.instructorName || 'Lead Mentor'} scheduled a live session for ${data.liveClass.courseName || 'Course'}.`,
            type: 'live_class',
            link: data.liveClass.meetingUrl || `/live-classroom/room/${data.liveClass.id}`,
            recipientRole: 'all',
          });
        }
      } catch (err) {
        console.warn('[SocketService] live_class_scheduled handler notice:', err);
      }
    });

    this.socket.on('live_class_started', (data: { liveClass?: any; liveClassId?: string; status?: string }) => {
      try {
        const cls =
          data?.liveClass ||
          (data?.liveClassId
            ? liveClassService.getLiveClassesSync().find((c) => c.id === data.liveClassId || c.classId === data.liveClassId)
            : null);
        if (cls) {
          const updatedCls = { ...cls, status: 'live' as any };
          liveClassService.upsertLiveClass(updatedCls);
          webNotificationService.notifyLiveClassStarted(updatedCls);
          notificationService.addNotification({
            title: `🔴 LIVE NOW: ${updatedCls.title}`,
            desc: `Instructor ${updatedCls.instructorName || 'Lead Mentor'} started the live class for ${updatedCls.courseName || 'Course'}. Click to join!`,
            type: 'live_class',
            link: updatedCls.meetingUrl || `/live-classroom/room/${updatedCls.id}`,
            recipientRole: 'all',
          });
        }
      } catch (err) {
        console.warn('[SocketService] live_class_started handler notice:', err);
      }
    });

    this.socket.on('liveClass:created', (data: { liveClass?: any }) => {
      if (data?.liveClass) {
        liveClassService.upsertLiveClass(data.liveClass);
      }
    });

    this.socket.on('liveClass:published', (data: { liveClass?: any }) => {
      if (data?.liveClass) {
        liveClassService.upsertLiveClass(data.liveClass);
      }
    });

    this.socket.on('liveClass:updated', (data: { liveClass?: any; updates?: any }) => {
      const cls = data?.liveClass || data?.updates;
      if (cls) {
        liveClassService.upsertLiveClass(cls);
      }
    });

    this.socket.on('liveClass:deleted', (data: { liveClassId?: string; classId?: string }) => {
      const cid = data?.liveClassId || data?.classId;
      if (cid) {
        liveClassService.removeLiveClassLocally(cid);
      }
    });

    return this.socket;
  }

  public setCurrentLiveClassId(liveClassId: string | null): void {
    this.currentLiveClassId = liveClassId;
  }

  public getCurrentLiveClassId(): string | null {
    return this.currentLiveClassId;
  }

  public disconnect(): void {
    if (this.socket) {
      if (this.currentLiveClassId) {
        this.leaveLiveClass(this.currentLiveClassId);
      }
      this.socket.disconnect();
      this.socket = null;
    }
    this.emitStatus('idle');
  }

  public joinLiveClass(liveClassId: string, name?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        return reject(new Error('Socket not initialized. Please connect first.'));
      }
      this.currentLiveClassId = liveClassId;
      this.socket.emit('join_class', {
        classId: liveClassId,
        liveClassId,
        name: name || this.currentAuth?.name,
        userId: this.currentAuth?.userId,
        role: this.currentAuth?.role,
      }, (response: any) => {
        if (response && response.error) {
          reject(response);
        } else {
          resolve(response);
        }
      });
      // Join attendance tracking for students only
      if (this.currentAuth?.role !== 'instructor' && this.currentAuth?.role !== 'admin') {
        this.socket.emit('attendance:join', { liveClassId });
      }
    });
  }

  public leaveLiveClass(liveClassId: string): void {
    if (this.socket) {
      this.socket.emit('attendance:leave', { liveClassId });
      this.socket.emit('liveClass:leave', { liveClassId });
      if (this.currentLiveClassId === liveClassId) {
        this.currentLiveClassId = null;
      }
    }
  }

  // --- Chat ---
  public sendChat(liveClassId: string, message: string, messageType: 'normal' | 'announcement' = 'normal', replyToId?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket) return reject(new Error('Socket not connected'));
      this.socket.emit('chat:send', { liveClassId, message, messageType, replyToId }, (res: any) => {
        if (res && res.error) reject(res);
        else resolve(res);
      });
    });
  }

  public deleteChat(liveClassId: string, messageId: string): Promise<any> {
    return new Promise((resolve) => {
      if (!this.socket) return resolve({ success: false });
      this.socket.emit('chat:delete', { liveClassId, messageId }, resolve);
    });
  }

  public moderateChat(liveClassId: string, messageId: string, action: 'pin' | 'unpin' | 'hide'): Promise<any> {
    return new Promise((resolve) => {
      if (!this.socket) return resolve({ success: false });
      this.socket.emit('chat:moderate', { liveClassId, messageId, action }, resolve);
    });
  }

  // --- Q&A ---
  public askQuestion(liveClassId: string, question: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket) return reject(new Error('Socket not connected'));
      this.socket.emit('qna:ask', { liveClassId, question }, (res: any) => {
        if (res && res.error) reject(res);
        else resolve(res);
      });
    });
  }

  public answerQuestion(liveClassId: string, questionId: string, answer: string): Promise<any> {
    return new Promise((resolve) => {
      if (!this.socket) return resolve({ success: false });
      this.socket.emit('qna:answer', { liveClassId, questionId, answer }, resolve);
    });
  }

  public resolveQuestion(liveClassId: string, questionId: string): Promise<any> {
    return new Promise((resolve) => {
      if (!this.socket) return resolve({ success: false });
      this.socket.emit('qna:resolve', { liveClassId, questionId }, resolve);
    });
  }

  // --- Raise Hand ---
  public raiseHand(liveClassId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket) return reject(new Error('Socket not connected'));
      this.socket.emit('hand:raise', { liveClassId }, (res: any) => {
        if (res && res.error) reject(res);
        else resolve(res);
      });
    });
  }

  public lowerHand(liveClassId: string): Promise<any> {
    return new Promise((resolve) => {
      if (!this.socket) return resolve({ success: false });
      this.socket.emit('hand:lower', { liveClassId }, resolve);
    });
  }

  public acknowledgeHand(liveClassId: string, studentId: string): Promise<any> {
    return new Promise((resolve) => {
      if (!this.socket) return resolve({ success: false });
      this.socket.emit('hand:acknowledge', { liveClassId, studentId }, resolve);
    });
  }

  // --- Announcements ---
  public sendAnnouncement(liveClassId: string, message: string, priority: 'normal' | 'urgent' = 'normal'): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket) return reject(new Error('Socket not connected'));
      this.socket.emit('announcement:send', { liveClassId, message, priority }, (res: any) => {
        if (res && res.error) reject(res);
        else resolve(res);
      });
    });
  }

  // --- Live Polls ---
  public createPoll(liveClassId: string, question: string, options: string[], durationSeconds: number = 60): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket) return reject(new Error('Socket not connected'));
      this.socket.emit('poll:create', { liveClassId, question, options, durationSeconds }, (res: any) => {
        if (res && res.error) reject(res);
        else resolve(res);
      });
    });
  }

  public votePoll(liveClassId: string, pollId: string, optionId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket) return reject(new Error('Socket not connected'));
      this.socket.emit('poll:vote', { liveClassId, pollId, optionId }, (res: any) => {
        if (res && res.error) reject(res);
        else resolve(res);
      });
    });
  }

  public endPoll(liveClassId: string, pollId: string): Promise<any> {
    return new Promise((resolve) => {
      if (!this.socket) return resolve({ success: false });
      this.socket.emit('poll:end', { liveClassId, pollId }, resolve);
    });
  }

  // --- Live Quizzes ---
  public startQuiz(
    liveClassId: string,
    question: string,
    options: string[],
    correctAnswer: string,
    marks: number = 10,
    timerSeconds: number = 30,
    title: string = 'Live Concept Check'
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket) return reject(new Error('Socket not connected'));
      this.socket.emit('quiz:start', { liveClassId, title, question, options, correctAnswer, marks, timerSeconds }, (res: any) => {
        if (res && res.error) reject(res);
        else resolve(res);
      });
    });
  }

  public submitQuizAnswer(liveClassId: string, quizId: string, answer: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket) return reject(new Error('Socket not connected'));
      this.socket.emit('quiz:submit', { liveClassId, quizId, answer }, (res: any) => {
        if (res && res.error) reject(res);
        else resolve(res);
      });
    });
  }

  public endQuiz(liveClassId: string, quizId: string): Promise<any> {
    return new Promise((resolve) => {
      if (!this.socket) return resolve({ success: false });
      this.socket.emit('quiz:end', { liveClassId, quizId }, resolve);
    });
  }

  // --- Live Status ---
  public updateLiveClassStatus(liveClassId: string, status: 'SCHEDULED' | 'LIVE' | 'ENDED' | 'CANCELLED'): void {
    if (this.socket) {
      this.socket.emit('liveClass:status', { liveClassId, status });
    }
  }

  // --- Authoritative Interaction Settings ---
  public updateClassroomSettings(
    liveClassId: string,
    settings: Partial<ClassroomInteractionSettings>
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket) return reject(new Error('Socket not connected'));
      this.socket.emit('liveClass:settings:update', { liveClassId, settings }, (res: any) => {
        if (res && res.error) reject(res);
        else resolve(res);
      });
    });
  }

  public getClassroomSettings(liveClassId: string): Promise<any> {
    return new Promise((resolve) => {
      if (!this.socket) return resolve({ success: false });
      this.socket.emit('liveClass:settings:get', { liveClassId }, resolve);
    });
  }

  // --- Live Class Publish & Audience Notification ---
  public publishLiveClass(liveClass: any, audience?: any): void {
    if (this.socket) {
      this.socket.emit('liveClass:published', { liveClass, audience });
    }
  }
}

export const socketService = new SocketService();
export const getLiveClassroomSocket = (token?: string, userInfo?: { uid?: string; name?: string; role?: string; email?: string }): Socket => {
  return socketService.connect(token, userInfo);
};
export default socketService;
