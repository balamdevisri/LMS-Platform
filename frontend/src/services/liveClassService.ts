import { db, auth } from '@/firebase';
import { collection, onSnapshot, query, doc, setDoc, updateDoc, deleteDoc, where, getDoc } from 'firebase/firestore';
import { adminNotificationService } from './adminNotificationService';
import { webNotificationService } from './webNotificationService';
import { notificationService } from './notificationService';
import { API_BASE_URL } from '@/config/api';

const generateSecureRoomId = (classId?: string) => `kaizenq-room-${classId || Date.now()}`;

export interface LiveClass {
  id: string;
  classId: string;
  title: string;
  description: string;
  youtubeVideoId?: string;
  courseId: string;
  courseName: string;
  moduleId?: string;
  moduleTitle?: string;
  lessonId?: string;
  lessonTitle?: string;
  topicId?: string;
  instructorId: string;
  instructorName: string;
  instructorAvatar?: string;
  instructor?: {
    id: string;
    name: string;
    avatar?: string;
  };
  assignedBy?: string;
  assignedAt?: string;
  scheduledAt?: string;
  startedAt?: string;
  endedAt?: string;
  branch?: string;
  semester?: string;
  year?: string;
  section?: string;
  allowedStudents?: string[];
  meetingProvider: 'kaizenq' | 'google_meet' | 'zoom' | 'teams' | 'youtube';
  meetingRoomId: string;
  meetingUrl: string;
  banner?: string;
  thumbnail?: string;
  startTime: string; // ISO String
  endTime: string;   // ISO String
  duration: number;  // Minutes
  status: 'draft' | 'scheduled' | 'live' | 'completed' | 'cancelled' | 'Draft' | 'Scheduled' | 'Live' | 'Completed' | 'Cancelled' | 'SCHEDULED' | 'LIVE' | 'ENDED' | 'CANCELLED';
  isRecordingEnabled: boolean;
  isQuizEnabled: boolean;
  isPollEnabled: boolean;
  isChatEnabled: boolean;
  isAttendanceEnabled?: boolean;
  resourceDownloadEnabled?: boolean;
  certificateEligible?: boolean;
  maxParticipants: number;
  tags?: string[];
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  notesUrl?: string;
  recordingUrl?: string;
  recordingStatus?: 'NOT_AVAILABLE' | 'RECORDING' | 'PROCESSING' | 'READY' | 'FAILED';
  recordingDuration?: number;
  attendanceSummary?: {
    totalParticipants: number;
    presentCount: number;
    lateCount: number;
    absentCount: number;
    averageParticipationDurationMinutes: number;
    attendanceRate: number;
  };
  attendeesCount?: number;
  pinnedMessage?: string;
  isChatMuted?: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export function normalizeLiveClassStatus(status: string): 'draft' | 'scheduled' | 'live' | 'completed' | 'cancelled' {
  const s = (status || '').toLowerCase();
  if (s === 'live') return 'live';
  if (s === 'scheduled') return 'scheduled';
  if (s === 'completed') return 'completed';
  if (s === 'cancelled') return 'cancelled';
  if (s === 'draft') return 'draft';
  return 'scheduled';
}

export interface AttendanceRecord {
  id: string;
  classId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  joinedAt: string;
  leftAt?: string;
  durationMinutes: number;
  status: 'present' | 'late' | 'absent';
}

export interface LiveChatMessage {
  id: string;
  classId: string;
  senderId: string;
  senderName: string;
  senderRole: 'admin' | 'instructor' | 'student';
  senderAvatar?: string;
  message: string;
  timestamp: string;
  edited?: boolean;
  deleted?: boolean;
  pinned?: boolean;
}

export interface LiveQuestion {
  id: string;
  classId: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  question: string;
  status: 'pending' | 'accepted' | 'answered';
  micAllowed?: boolean;
  createdAt: string;
}

export interface LiveNote {
  id: string;
  classId: string;
  title: string;
  content: string;
  authorName: string;
  updatedAt: string;
}

export interface LiveResource {
  id: string;
  classId: string;
  title: string;
  type: 'pdf' | 'ppt' | 'zip' | 'image' | 'github' | 'youtube';
  url: string;
  fileSize?: string;
  uploadedAt: string;
}

export interface LivePollOption {
  id: string;
  text: string;
  votes: number;
}

export interface LivePoll {
  id: string;
  classId: string;
  question: string;
  options: LivePollOption[];
  active: boolean;
  totalVotes: number;
  createdAt: string;
}

export interface LiveQuizQuestion {
  id: string;
  question: string;
  type: 'mcq' | 'true_false' | 'short_answer';
  options?: string[];
  correctAnswer: string;
  points: number;
}

export interface LiveQuiz {
  id: string;
  classId: string;
  title: string;
  questions: LiveQuizQuestion[];
  active: boolean;
  createdAt: string;
}

const STORAGE_KEY = 'kaizenq_live_classes_v4';
const ATTENDANCE_STORAGE_KEY = 'kaizenq_live_attendance_v4';
const QUESTIONS_STORAGE_KEY = 'kaizenq_live_questions_v4';
const NOTES_STORAGE_KEY = 'kaizenq_live_notes_v4';
const RESOURCES_STORAGE_KEY = 'kaizenq_live_resources_v4';

export const isMockLiveClass = (c: any): boolean => {
  if (!c) return true;
  const id = String(c.id || c.classId || '').toLowerCase().trim();
  const title = String(c.title || '').toLowerCase().trim();
  const desc = String(c.description || '').toLowerCase().trim();
  return (
    id === 'live_linux_kernel_1' ||
    id === 'live_git_conflict_2' ||
    id === 'live_ebpf_perf_3' ||
    id.startsWith('mock_') ||
    id.startsWith('demo_') ||
    (id.includes('mock') && !id.startsWith('class_')) ||
    title.startsWith('mock live test') ||
    title.startsWith('sample demo test')
  );
};

class LiveClassService {
  private listeners: Array<(classes: LiveClass[]) => void> = [];
  private unsubscribeFirestore: (() => void) | null = null;
  private DELETED_KEY = 'kaizenq_deleted_live_classes';

  getApiUrl(): string {
    return API_BASE_URL;
  }

  async getAuthHeadersAsync(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    try {
      let token = localStorage.getItem('shaivika_auth_token') || localStorage.getItem('token') || localStorage.getItem('firebase_token');
      if (auth?.currentUser) {
        try {
          const fresh = await auth.currentUser.getIdToken();
          if (fresh) {
            token = fresh;
            localStorage.setItem('shaivika_auth_token', fresh);
          }
        } catch {}
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const rawUser = localStorage.getItem('shaivika_user');
      if (rawUser) {
        try {
          const u = JSON.parse(rawUser);
          if (u.uid) headers['x-user-id'] = u.uid;
          if (u.role) headers['x-user-role'] = u.role;
          if (u.email) headers['x-user-email'] = u.email;
          if (u.name || u.displayName) headers['x-user-name'] = u.name || u.displayName;
        } catch {}
      } else if (auth?.currentUser) {
        headers['x-user-id'] = auth.currentUser.uid;
        if (auth.currentUser.email) headers['x-user-email'] = auth.currentUser.email;
        if (auth.currentUser.displayName) headers['x-user-name'] = auth.currentUser.displayName;
      }
    } catch {}
    return headers;
  }

  getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    try {
      let token = localStorage.getItem('shaivika_auth_token') || localStorage.getItem('token') || localStorage.getItem('firebase_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const rawUser = localStorage.getItem('shaivika_user');
      if (rawUser) {
        try {
          const u = JSON.parse(rawUser);
          if (u.uid) headers['x-user-id'] = u.uid;
          if (u.role) headers['x-user-role'] = u.role;
          if (u.email) headers['x-user-email'] = u.email;
          if (u.name || u.displayName) headers['x-user-name'] = u.name || u.displayName;
        } catch {}
      } else if (auth?.currentUser) {
        headers['x-user-id'] = auth.currentUser.uid;
        if (auth.currentUser.email) headers['x-user-email'] = auth.currentUser.email;
        if (auth.currentUser.displayName) headers['x-user-name'] = auth.currentUser.displayName;
      }
    } catch {}
    return headers;
  }

  upsertLiveClass(cls: LiveClass): void {
    if (!cls || isMockLiveClass(cls)) return;
    const cid = cls.id || cls.classId;
    if (!cid) return;
    console.info(`[LIVE_CLASS_REALTIME_RECEIVED] Upserting class: ${cls.title} (${cls.status})`);
    const current = this.getLiveClassesSync();
    const map = new Map<string, LiveClass>();
    current.forEach((c) => map.set(c.id || c.classId, c));
    map.set(cid, { ...cls, id: cid, classId: cid });
    const merged = Array.from(map.values()).sort(
      (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
    this.saveClasses(merged);
  }

  removeLiveClassLocally(classId: string): void {
    if (!classId) return;
    this.addDeletedClassId(classId);
    const current = this.getLiveClassesSync();
    const updated = current.filter((c) => (c.id || c.classId) !== classId);
    this.saveClasses(updated);
  }

  async syncWithBackend(): Promise<LiveClass[]> {
    try {
      const headers = await this.getAuthHeadersAsync();
      const res = await fetch(`${this.getApiUrl()}/live-classroom`, {
        method: 'GET',
        headers,
      });
      if (res.ok) {
        const data = await res.json().catch(() => null);
        const fetched: LiveClass[] = Array.isArray(data?.data)
          ? data.data
          : (Array.isArray(data?.liveClasses) ? data.liveClasses : (Array.isArray(data) ? data : []));
        if (fetched.length > 0) {
          console.info(`[LIVE_CLASS_RETURNED] Synced ${fetched.length} live classes from backend API`);
          const current = this.getLiveClassesSync();
          const map = new Map<string, LiveClass>();
          current.forEach((c) => map.set(c.id || c.classId, c));
          fetched.forEach((c) => {
            const cid = c.id || c.classId;
            if (cid && !isMockLiveClass(c)) {
              map.set(cid, { ...c, id: cid, classId: cid });
            }
          });
          const merged = Array.from(map.values()).sort(
            (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
          );
          this.saveClasses(merged);
          return merged;
        }
      }
    } catch (err) {
      console.warn('[LiveClassService] syncWithBackend notice:', err);
    }
    return this.getLiveClassesSync();
  }

  getDeletedClassIds(): Set<string> {
    try {
      const raw = localStorage.getItem(this.DELETED_KEY);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) return new Set(arr);
      }
    } catch {}
    return new Set();
  }

  addDeletedClassId(id: string) {
    if (!id) return;
    try {
      const set = this.getDeletedClassIds();
      set.add(id);
      localStorage.setItem(this.DELETED_KEY, JSON.stringify(Array.from(set)));
    } catch {}
  }

  private getLocalClasses(): LiveClass[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const deletedIds = this.getDeletedClassIds();
          return parsed.filter((c) => {
            const id = c.id || c.classId;
            const status = (c.status || '').toUpperCase();
            const isEnded = status === 'ENDED' || status === 'COMPLETED' || status === 'CANCELLED';
            if (isEnded && id) {
              this.addDeletedClassId(id);
            }
            return !isMockLiveClass(c) && !deletedIds.has(id) && !isEnded;
          });
        }
      }
    } catch (e) {
      console.warn('Failed to parse live classes from localStorage:', e);
    }
    return [];
  }

  getLiveClassesSync(): LiveClass[] {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const deletedIds = this.getDeletedClassIds();
          return parsed.filter((c) => {
            const id = c.id || c.classId;
            const status = (c.status || '').toUpperCase();
            const isEnded = status === 'ENDED' || status === 'COMPLETED' || status === 'CANCELLED';
            if (isEnded && id) {
              this.addDeletedClassId(id);
            }
            return !isMockLiveClass(c) && !deletedIds.has(id) && !isEnded;
          });
        }
      } catch (e) {
        console.warn('Failed to parse live classes from localStorage:', e);
      }
    }
    return [];
  }

  saveClasses(classes: LiveClass[]) {
    try {
      const deletedIds = this.getDeletedClassIds();
      const filtered = classes.filter((c) => {
        const id = c.id || c.classId;
        const status = (c.status || '').toUpperCase();
        const isEnded = status === 'ENDED' || status === 'COMPLETED' || status === 'CANCELLED';
        return !deletedIds.has(id) && !isEnded;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      this.notifyListeners(filtered);
    } catch (e) {
      console.warn('Failed to save live classes to localStorage:', e);
      this.notifyListeners(classes);
    }
  }

  subscribeLiveClasses(callback: (classes: LiveClass[]) => void): () => void {
    this.listeners.push(callback);
    callback(this.getLiveClassesSync());

    // 1. Authoritative Backend REST API Sync (guarantees student receives newly created classes immediately)
    this.syncWithBackend().then((fresh) => {
      if (Array.isArray(fresh) && fresh.length > 0) {
        callback(fresh);
      }
    }).catch(() => {});

    const firestore = db;
    if (firestore && !this.unsubscribeFirestore) {
      try {
        const ref = collection(firestore, 'liveClasses');
        const q = query(ref);
        this.unsubscribeFirestore = onSnapshot(
          q,
          (snapshot) => {
            const fsClasses: LiveClass[] = [];
            const deletedIds = this.getDeletedClassIds();

            snapshot.forEach((docSnap) => {
              const data = docSnap.data() as LiveClass;
              const id = docSnap.id || data.id || data.classId;
              const status = (data.status || '').toUpperCase();
              const isEnded = status === 'ENDED' || status === 'COMPLETED' || status === 'CANCELLED';
              const isMock = isMockLiveClass(data);
              if (isEnded || isMock) {
                this.addDeletedClassId(id);
                // Also clean up ended or mock class from Firestore collection
                deleteDoc(doc(firestore, 'liveClasses', docSnap.id)).catch(() => {});
              } else if (!deletedIds.has(id)) {
                fsClasses.push({ ...data, id, classId: id });
              }
            });

            // Keep only recent local creates (created in last 15s) that aren't yet in Firestore
            const local = this.getLocalClasses();
            const now = Date.now();
            const recentLocal = local.filter((c) => {
              const createdMs = c.createdAt ? new Date(c.createdAt).getTime() : 0;
              const isRecent = now - createdMs < 15000;
              const id = c.id || c.classId;
              const status = (c.status || '').toUpperCase();
              const isEnded = status === 'ENDED' || status === 'COMPLETED' || status === 'CANCELLED';
              return isRecent && !deletedIds.has(id) && !isEnded && !isMockLiveClass(c);
            });

            const map = new Map<string, LiveClass>();
            fsClasses.forEach((c) => map.set(c.id || c.classId, c));
            recentLocal.forEach((c) => {
              const id = c.id || c.classId;
              if (!map.has(id)) map.set(id, c);
            });

            const merged = Array.from(map.values()).sort(
              (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
            );

            // Trigger real-time web notifications for students on newly received scheduled/live sessions
            merged.forEach((c) => {
              const norm = normalizeLiveClassStatus(c.status);
              if (norm === 'live') {
                webNotificationService.notifyLiveClassStarted(c);
              } else if (norm === 'scheduled') {
                const diffMs = new Date(c.startTime).getTime() - Date.now();
                if (diffMs > -24 * 60 * 60 * 1000) {
                  webNotificationService.notifyLiveClassScheduled(c);
                }
              }
            });

            this.saveClasses(merged);
          },
          (err) => {
            console.warn('[Firestore LiveClasses Listener] Local fallback active:', err.message);
          }
        );
      } catch (e) {
        console.warn('[Firestore LiveClasses Audit] Listener fallback:', e);
      }
    }

    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
      if (this.listeners.length === 0 && this.unsubscribeFirestore) {
        this.unsubscribeFirestore();
        this.unsubscribeFirestore = null;
      }
    };
  }

  private notifyListeners(classes: LiveClass[]) {
    this.listeners.forEach((l) => l(classes));
  }

  async createLiveClass(data: Omit<LiveClass, 'id' | 'classId' | 'createdAt' | 'updatedAt' | 'meetingRoomId'> & { id?: string; classId?: string; meetingRoomId?: string }): Promise<LiveClass> {
    const canonicalId = data.id || data.classId || `class_${Date.now()}`;
    const courseSlug = (data.courseName || 'batch').toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const roomId = data.meetingRoomId || `kaizenq-${courseSlug}-${Date.now().toString().slice(-4)}`;
    const meetingUrl = data.meetingUrl || `/live-classroom/room/${canonicalId}`;

    const newClass: LiveClass = {
      ...data,
      id: canonicalId,
      classId: canonicalId,
      meetingProvider: data.meetingProvider || 'kaizenq',
      meetingRoomId: roomId,
      meetingUrl: meetingUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 1. Persist to authoritative Backend REST API with timeout safety
    let persistedClass = newClass;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    try {
      const headers = await this.getAuthHeadersAsync();
      const res = await fetch(`${this.getApiUrl()}/live-classroom`, {
        method: 'POST',
        headers,
        body: JSON.stringify(newClass),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.error || `Failed to create live class in backend: ${res.statusText}`);
      }

      const resJson = await res.json().catch(() => null);
      if (resJson?.data || resJson?.liveClass) {
        const returned = resJson.data || resJson.liveClass;
        const finalId = returned.id || returned.classId || canonicalId;
        persistedClass = { ...newClass, ...returned, id: finalId, classId: finalId };
      }
    } catch (e: any) {
      console.error('[LiveClassService] Authoritative backend creation failed:', e);
      if (e.name === 'AbortError') {
        throw new Error('Live class creation timed out after 15s. Please check network connection and try again.');
      }
      throw e;
    } finally {
      clearTimeout(timeoutId);
    }

    // 2. Persist to local cache only after successful backend persistence
    const current = this.getLiveClassesSync();
    const finalId = persistedClass.id || persistedClass.classId;
    const updated = [persistedClass, ...current.filter((c) => (c.id || c.classId) !== finalId)];
    this.saveClasses(updated);

    // 3. Persist to Firestore Client asynchronously (non-blocking fallback with 3s timeout)
    try {
      if (db) {
        const fsTimeout = new Promise((resolve) => setTimeout(resolve, 3000));
        Promise.race([
          setDoc(doc(db, 'liveClasses', finalId), persistedClass),
          fsTimeout,
        ]).catch((e) => console.warn('Firestore createLiveClass notice:', e));
      }
    } catch (e) {
      console.warn('Firestore createLiveClass notice:', e);
    }

    // 4. Real-time broadcast via Socket.IO
    try {
      import('@/services/socketService').then(({ socketService }) => {
        socketService.publishLiveClass(newClass, {
          audience: (newClass as any).targetAudience || 'all',
          batch: (newClass as any).targetBatch,
          section: (newClass as any).targetSection,
        });
      }).catch(() => {});
    } catch (e) {}

    const norm = normalizeLiveClassStatus(newClass.status);
    if (norm === 'scheduled' || norm === 'live') {
      const instName = newClass.instructorName || 'Assigned Instructor';
      try {
        adminNotificationService.addNotification({
          type: 'COURSE_CREATED',
          title: `Live Session Published: ${newClass.title}`,
          message: `Assigned Instructor ${instName} scheduled a live classroom session for ${newClass.courseName}.`,
          link: `/live-classroom`
        });
      } catch (e) {
        console.warn('Admin notification notice:', e);
      }

      try {
        // Dispatch Web Notification to browser & play chime
        if (norm === 'live') {
          webNotificationService.notifyLiveClassStarted(newClass);
        } else {
          webNotificationService.notifyLiveClassScheduled(newClass);
        }
      } catch (e) {
        console.warn('Web notification notice:', e);
      }

      try {
        // Add to student In-App Notification Center
        const notifTitle = norm === 'live'
          ? `🔴 Live Class Started: ${newClass.title}`
          : `📅 Live Class Scheduled: ${newClass.title}`;
        const notifDesc = norm === 'live'
          ? `Instructor ${instName} started the live class for ${newClass.courseName}. Click to join now!`
          : `Assigned Instructor: ${instName} • ${newClass.courseName}. Starts ${new Date(newClass.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at ${new Date(newClass.startTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}. Click to join.`;
        const link = newClass.meetingUrl || `/live-classroom/room/${newClass.id}`;

        notificationService.addNotification({
          title: notifTitle,
          desc: notifDesc,
          type: 'live_class',
          link,
          recipientRole: 'student',
        });
        notificationService.addNotification({
          title: notifTitle,
          desc: notifDesc,
          type: 'live_class',
          link,
          recipientRole: 'all',
        });
      } catch (e) {
        console.warn('Student notification notice:', e);
      }
    }

    return newClass;
  }

  async fetchLiveClassById(
    classId: string,
    token?: string,
    userMeta?: { uid?: string; role?: string; email?: string }
  ): Promise<{ success: boolean; liveClass?: LiveClass; status?: number; error?: string }> {
    const apiBaseUrl = API_BASE_URL;
    const cleanId = encodeURIComponent(classId.trim());

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      if (userMeta?.uid) {
        headers['x-user-id'] = userMeta.uid;
      }
      if (userMeta?.role) {
        headers['x-user-role'] = userMeta.role;
      }
      if (userMeta?.email) {
        headers['x-user-email'] = userMeta.email;
      }

      const queryParams = new URLSearchParams();
      if (userMeta?.uid) queryParams.set('userId', userMeta.uid);
      if (userMeta?.role) queryParams.set('userRole', userMeta.role);
      if (userMeta?.email) queryParams.set('userEmail', userMeta.email);

      const qs = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const res = await fetch(`${apiBaseUrl}/live-classes/${cleanId}${qs}`, {
        method: 'GET',
        headers,
      });

      const data = await res.json().catch(() => null);

      if (res.status === 403) {
        return {
          success: false,
          status: 403,
          error: data?.error || 'Please enroll in this course to access the live class.',
        };
      }

      if (res.status === 404 || !res.ok) {
        // Fallback to local memory if available
        const localClass = this.getLiveClassesSync().find((c) => c.id === classId || c.classId === classId);
        if (localClass) {
          return { success: true, liveClass: localClass };
        }
        return {
          success: false,
          status: res.status,
          error: data?.error || 'Live class is not available.',
        };
      }

      const fetchedClass: LiveClass = data?.liveClass || data?.data;
      if (fetchedClass) {
        return { success: true, liveClass: fetchedClass };
      }

      return {
        success: false,
        status: 404,
        error: 'Live class is not available.',
      };
    } catch (err: any) {
      if (import.meta.env.DEV) {
        console.error('[LiveClassService] fetchLiveClassById error:', err);
      }
      const localClass = this.getLiveClassesSync().find((c) => c.id === classId || c.classId === classId);
      if (localClass) {
        return { success: true, liveClass: localClass };
      }
      if (db) {
        try {
          const snap = await getDoc(doc(db, 'liveClasses', classId));
          if (snap.exists()) {
            const data = snap.data() as LiveClass;
            const fullClass = { ...data, id: snap.id, classId: snap.id };
            return { success: true, liveClass: fullClass };
          }
        } catch {}
      }
      return {
        success: false,
        status: 500,
        error: 'Live class is not available.',
      };
    }
  }

  async updateLiveClass(id: string, updates: Partial<LiveClass>): Promise<void> {
    const current = this.getLiveClassesSync();
    let targetClass: LiveClass | null = null;
    const updated = current.map((c) => {
      if (c.id === id || c.classId === id) {
        targetClass = { ...c, ...updates, updatedAt: new Date().toISOString() };
        return targetClass;
      }
      return c;
    });
    this.saveClasses(updated);

    // 2. Persist to authoritative Backend REST API
    try {
      const headers = await this.getAuthHeadersAsync();
      await fetch(`${this.getApiUrl()}/live-classroom/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updates),
      });
    } catch (e) {
      console.warn('[LiveClassService] Backend updateLiveClass notice:', e);
    }

    // 3. Persist to Firestore Client
    try {
      if (db) {
        await setDoc(doc(db, 'liveClasses', id), { ...updates, updatedAt: new Date().toISOString() }, { merge: true });
      }
    } catch (e) {
      console.warn('Firestore updateLiveClass notice:', e);
    }

    // 4. Real-time broadcast via Socket.IO
    if (targetClass) {
      try {
        const full = targetClass;
        import('@/services/socketService').then(({ socketService }) => {
          socketService.getSocket()?.emit('liveClass:update', { liveClassId: id, updates: full });
        }).catch(() => {});
      } catch (e) {}
    }

    if (targetClass) {
      const cls = targetClass as LiveClass;
      const norm = normalizeLiveClassStatus(cls.status);
      if (norm === 'scheduled' || norm === 'live') {
        const instName = cls.instructorName || 'Assigned Instructor';
        try {
          if (norm === 'live') {
            webNotificationService.notifyLiveClassStarted(cls);
          } else {
            webNotificationService.notifyLiveClassScheduled(cls);
          }
          notificationService.addNotification({
            title: `📅 Live Session Updated: ${cls.title}`,
            desc: `Assigned Instructor: ${instName} • ${cls.courseName}. Starts ${new Date(cls.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}. Click to join.`,
            type: 'live_class',
            link: cls.meetingUrl || `/live-classroom/room/${cls.id}`,
            recipientRole: 'all',
          });
        } catch (e) {
          console.warn('Update live class notification notice:', e);
        }
      }
    }
  }

  async deleteLiveClass(id: string): Promise<void> {
    if (!id) return;

    // 1. Delete from Authoritative Backend Database (EC2) first
    let backendSuccess = false;
    try {
      const headers = await this.getAuthHeadersAsync();
      const res = await fetch(`${this.getApiUrl()}/live-classroom/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers,
      });

      if (res.ok) {
        backendSuccess = true;
      } else {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.error || `Backend failed to delete live class (${res.statusText})`);
      }
    } catch (err: any) {
      console.warn('[LiveClassService] Backend delete notice:', err?.message || err);
      // If it is a network error (e.g. Failed to fetch), perform local + Firestore delete fallback
      const isNetworkFail = !err?.message || err.message.includes('Failed to fetch') || err.message.includes('NetworkError');
      if (!isNetworkFail && !backendSuccess) {
        throw err;
      }
    }

    // 2. Update local state and tracking
    this.addDeletedClassId(id);
    const current = this.getLiveClassesSync();
    const updated = current.filter((c) => c.id !== id && c.classId !== id);
    this.saveClasses(updated);

    // 3. Delete from Firestore directly
    try {
      if (db) {
        await deleteDoc(doc(db, 'liveClasses', id)).catch(() => {});
      }
    } catch (e) {
      console.warn('Firestore deleteLiveClass notice:', e);
    }

    // 4. Real-time broadcast deletion via Socket.IO
    try {
      import('@/services/socketService').then(({ socketService }) => {
        socketService.getSocket()?.emit('liveClass:delete', { liveClassId: id, classId: id });
      }).catch(() => {});
    } catch (e) {}
  }

  async duplicateLiveClass(id: string): Promise<LiveClass> {
    const target = this.getLiveClassesSync().find((c) => c.id === id || c.classId === id);
    if (!target) throw new Error('Live class record not found');

    const cloned = await this.createLiveClass({
      ...target,
      title: `${target.title} (Copy)`,
      status: 'Draft',
      startTime: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      endTime: new Date(Date.now() + (24 + 1.5) * 3600 * 1000).toISOString(),
    });

    return cloned;
  }

  async rescheduleLiveClass(id: string, startTime: string, endTime: string): Promise<void> {
    await this.updateLiveClass(id, {
      startTime,
      endTime,
      status: 'Scheduled'
    });

    const target = this.getLiveClassesSync().find((c) => c.id === id);
    adminNotificationService.addNotification({
      type: 'COURSE_CREATED',
      title: `Live Session Rescheduled: ${target?.title || 'Session'}`,
      message: `Rescheduled to start on ${new Date(startTime).toLocaleString()}.`,
      link: '/live-classroom'
    });
  }

  async ensureMeetingRoomId(liveClass: LiveClass): Promise<string> {
    if (liveClass.meetingRoomId && liveClass.meetingRoomId.trim().length > 0) {
      return liveClass.meetingRoomId;
    }

    const newRoomId = generateSecureRoomId(liveClass.courseName || liveClass.title);
    const meetingUrl = `https://meet.jit.si/${newRoomId}`;

    await this.updateLiveClass(liveClass.id, {
      meetingRoomId: newRoomId,
      meetingUrl: meetingUrl,
    });

    return newRoomId;
  }

  authorizeStudentAccess(
    userProfile: { uid: string; role?: string; email?: string } | null,
    liveClass: LiveClass | null
  ): { authorized: boolean; code?: string; reason?: string } {
    if (!userProfile || !userProfile.uid) {
      return {
        authorized: false,
        code: 'UNAUTHENTICATED',
        reason: 'Please login to KaizenQ to join the live classroom session.',
      };
    }

    if (!liveClass) {
      return {
        authorized: false,
        code: 'CLASS_NOT_FOUND',
        reason: 'The specified live classroom session was not found.',
      };
    }

    const role = userProfile.role || 'student';
    const isAssignedInstructor =
      liveClass.instructorId === userProfile.uid ||
      liveClass.createdBy === userProfile.uid ||
      role === 'admin';

    // 1. Assigned Instructor Check
    if (role === 'instructor' && !isAssignedInstructor) {
      return {
        authorized: false,
        code: 'NOT_ASSIGNED_INSTRUCTOR',
        reason: 'You are not assigned as the instructor for this live class.',
      };
    }

    // 2. Student Authorization & Status Check
    if (!isAssignedInstructor) {
      const status = normalizeLiveClassStatus(liveClass.status);
      if (status === 'scheduled') {
        return {
          authorized: false,
          code: 'CLASS_NOT_STARTED',
          reason: 'Live class has not started yet. The instructor must start the session before students can enter.',
        };
      }
      if (status === 'completed' || status === 'cancelled') {
        return {
          authorized: false,
          code: 'CLASS_ENDED',
          reason: 'This live session has ended or been cancelled.',
        };
      }
      if (status !== 'live') {
        return {
          authorized: false,
          code: 'CLASS_NOT_LIVE',
          reason: 'You are not authorized to join this live class.',
        };
      }

      // 3. Student Enrollment & Allowed Students Check
      if (liveClass.allowedStudents && liveClass.allowedStudents.length > 0) {
        const isAllowed =
          liveClass.allowedStudents.includes(userProfile.uid) ||
          (userProfile.email && liveClass.allowedStudents.includes(userProfile.email));
        if (!isAllowed) {
          return {
            authorized: false,
            code: 'NOT_ENROLLED',
            reason: 'You are not authorized to join this live class.',
          };
        }
      }
    }

    return { authorized: true };
  }

  async startLiveClass(
    id: string,
    currentUserIdOrToken?: string,
    userRoleOrToken?: string,
    userMeta?: { uid?: string; role?: string; email?: string; name?: string }
  ): Promise<{ success: boolean; data?: LiveClass; error?: string }> {
    let token: string | undefined;
    let meta = userMeta;
    if (typeof userRoleOrToken === 'string' && userRoleOrToken.length > 50) {
      token = userRoleOrToken;
    } else if (typeof currentUserIdOrToken === 'string' && currentUserIdOrToken.length > 50) {
      token = currentUserIdOrToken;
    }

    if (!meta && currentUserIdOrToken && currentUserIdOrToken !== token) {
      meta = {
        uid: currentUserIdOrToken,
        role: typeof userRoleOrToken === 'string' && userRoleOrToken.length <= 50 ? userRoleOrToken : undefined,
      };
    }
    return this.startClass(id, token, meta);
  }

  async endLiveClass(
    id: string,
    currentUserIdOrToken?: string,
    userRoleOrToken?: string,
    token?: string
  ): Promise<{ success: boolean; data?: LiveClass; error?: string }> {
    const effectiveToken = token || (typeof userRoleOrToken === 'string' && userRoleOrToken.length > 50 ? userRoleOrToken : undefined);
    return this.endClass(id, effectiveToken);
  }

  // Attendance Logger & Report
  recordAttendance(record: Omit<AttendanceRecord, 'id'>) {
    try {
      const savedStr = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
      const existing: AttendanceRecord[] = savedStr ? JSON.parse(savedStr) : [];
      const newRec: AttendanceRecord = {
        ...record,
        id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
      };
      const updated = [newRec, ...existing];
      localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(updated));

      if (db) {
        setDoc(doc(db, 'attendance', newRec.id), newRec).catch(() => {});
      }
    } catch (e) {
      console.warn('Attendance record error:', e);
    }
  }

  getAttendanceRecords(classId: string): AttendanceRecord[] {
    try {
      const savedStr = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
      if (savedStr) {
        const records: AttendanceRecord[] = JSON.parse(savedStr);
        return records.filter((r) => r.classId === classId);
      }
    } catch (e) {}
    return [];
  }

  exportAttendanceCSV(classId: string, classTitle: string) {
    const records = this.getAttendanceRecords(classId);
    if (records.length === 0) return false;

    const headers = ['Student ID', 'Student Name', 'Student Email', 'Joined At', 'Left At', 'Duration (Mins)', 'Status'];
    const rows = records.map((r) => [
      r.studentId,
      r.studentName,
      r.studentEmail,
      r.joinedAt,
      r.leftAt || 'Active',
      r.durationMinutes,
      r.status
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Attendance_Report_${classTitle.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  }

  // --- QUESTIONS MANAGEMENT ---
  subscribeQuestions(classId: string, callback: (questions: LiveQuestion[]) => void): () => void {
    const getLocal = (): LiveQuestion[] => {
      try {
        const saved = localStorage.getItem(`${QUESTIONS_STORAGE_KEY}_${classId}`);
        return saved ? JSON.parse(saved) : [];
      } catch (e) { return []; }
    };

    callback(getLocal());

    if (db) {
      try {
        const ref = collection(db, 'liveQuestions');
        const q = query(ref, where('classId', '==', classId));
        return onSnapshot(q, (snapshot) => {
          const list: LiveQuestion[] = [];
          snapshot.forEach((d) => list.push(d.data() as LiveQuestion));
          localStorage.setItem(`${QUESTIONS_STORAGE_KEY}_${classId}`, JSON.stringify(list));
          callback(list);
        });
      } catch (e) {}
    }

    return () => {};
  }

  async submitQuestion(classId: string, studentId: string, studentName: string, questionText: string, studentAvatar?: string): Promise<LiveQuestion> {
    const newQ: LiveQuestion = {
      id: `q_${Date.now()}`,
      classId,
      studentId,
      studentName,
      studentAvatar,
      question: questionText,
      status: 'pending',
      micAllowed: false,
      createdAt: new Date().toISOString()
    };

    try {
      const saved = localStorage.getItem(`${QUESTIONS_STORAGE_KEY}_${classId}`);
      const list: LiveQuestion[] = saved ? JSON.parse(saved) : [];
      list.push(newQ);
      localStorage.setItem(`${QUESTIONS_STORAGE_KEY}_${classId}`, JSON.stringify(list));

      if (db) {
        await setDoc(doc(db, 'liveQuestions', newQ.id), newQ);
      }
    } catch (e) {}

    return newQ;
  }

  async updateQuestionStatus(classId: string, questionId: string, status: 'pending' | 'accepted' | 'answered', micAllowed?: boolean): Promise<void> {
    try {
      const saved = localStorage.getItem(`${QUESTIONS_STORAGE_KEY}_${classId}`);
      if (saved) {
        const list: LiveQuestion[] = JSON.parse(saved);
        const updated = list.map((q) => (q.id === questionId ? { ...q, status, micAllowed: micAllowed !== undefined ? micAllowed : q.micAllowed } : q));
        localStorage.setItem(`${QUESTIONS_STORAGE_KEY}_${classId}`, JSON.stringify(updated));
      }

      if (db) {
        await updateDoc(doc(db, 'liveQuestions', questionId), { status, micAllowed });
      }
    } catch (e) {}
  }

  // --- LIVE NOTES REALTIME EDITOR ---
  subscribeLiveNotes(classId: string, callback: (note: LiveNote | null) => void): () => void {
    const getLocal = (): LiveNote | null => {
      try {
        const saved = localStorage.getItem(`${NOTES_STORAGE_KEY}_${classId}`);
        return saved ? JSON.parse(saved) : null;
      } catch (e) { return null; }
    };

    callback(getLocal());

    if (db) {
      try {
        return onSnapshot(doc(db, 'liveNotes', classId), (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data() as LiveNote;
            localStorage.setItem(`${NOTES_STORAGE_KEY}_${classId}`, JSON.stringify(data));
            callback(data);
          }
        });
      } catch (e) {}
    }

    return () => {};
  }

  async updateLiveNotes(classId: string, title: string, content: string, authorName: string): Promise<void> {
    const note: LiveNote = {
      id: classId,
      classId,
      title,
      content,
      authorName,
      updatedAt: new Date().toISOString()
    };

    try {
      localStorage.setItem(`${NOTES_STORAGE_KEY}_${classId}`, JSON.stringify(note));
      if (db) {
        await setDoc(doc(db, 'liveNotes', classId), note);
      }
    } catch (e) {}
  }

  // --- MULTIFORMAT RESOURCES ---
  subscribeResources(classId: string, callback: (resources: LiveResource[]) => void): () => void {
    const getLocal = (): LiveResource[] => {
      try {
        const saved = localStorage.getItem(`${RESOURCES_STORAGE_KEY}_${classId}`);
        return saved ? JSON.parse(saved) : [];
      } catch (e) { return []; }
    };

    callback(getLocal());

    if (db) {
      try {
        const ref = collection(db, 'resources');
        const q = query(ref, where('classId', '==', classId));
        return onSnapshot(q, (snapshot) => {
          const list: LiveResource[] = [];
          snapshot.forEach((d) => list.push(d.data() as LiveResource));
          localStorage.setItem(`${RESOURCES_STORAGE_KEY}_${classId}`, JSON.stringify(list));
          callback(list);
        });
      } catch (e) {}
    }

    return () => {};
  }

  async addResource(classId: string, resource: Omit<LiveResource, 'id' | 'classId' | 'uploadedAt'>): Promise<LiveResource> {
    const newRes: LiveResource = {
      ...resource,
      id: `res_${Date.now()}`,
      classId,
      uploadedAt: new Date().toISOString()
    };

    try {
      const saved = localStorage.getItem(`${RESOURCES_STORAGE_KEY}_${classId}`);
      const list: LiveResource[] = saved ? JSON.parse(saved) : [];
      list.push(newRes);
      localStorage.setItem(`${RESOURCES_STORAGE_KEY}_${classId}`, JSON.stringify(list));

      if (db) {
        await setDoc(doc(db, 'resources', newRes.id), newRes);
      }
    } catch (e) {}

    return newRes;
  }

  async deleteResource(classId: string, resourceId: string): Promise<void> {
    try {
      const saved = localStorage.getItem(`${RESOURCES_STORAGE_KEY}_${classId}`);
      if (saved) {
        const list: LiveResource[] = JSON.parse(saved);
        const updated = list.filter((r) => r.id !== resourceId);
        localStorage.setItem(`${RESOURCES_STORAGE_KEY}_${classId}`, JSON.stringify(updated));
      }

      if (db) {
        await deleteDoc(doc(db, 'resources', resourceId));
      }
    } catch (e) {}
  }

  // --- LIVE CONTROL CENTER REST API CLIENT HELPERS ---

  async startClass(
    classId: string,
    token?: string,
    userMeta?: { uid?: string; role?: string; email?: string; name?: string }
  ): Promise<{ success: boolean; data?: LiveClass; error?: string }> {
    try {
      const nowISO = new Date().toISOString();
      const target = this.getLiveClassesSync().find((c) => c.id === classId || c.classId === classId);

      // 1. Immediately update status in local memory and Firestore
      const updatedData: Partial<LiveClass> = {
        status: 'LIVE' as any,
        startedAt: nowISO,
        updatedAt: nowISO,
      };
      await this.updateLiveClass(classId, updatedData);

      const updatedClass: LiveClass = target
        ? { ...target, ...updatedData }
        : ({ id: classId, classId, ...updatedData } as LiveClass);

      // 2. Broadcast notifications to students and admins
      try {
        adminNotificationService.addNotification({
          type: 'NEW_STUDENT',
          title: `🔴 LIVE NOW: ${target?.title || 'Live Session'}`,
          message: `Session is active! Click to join video classroom stream.`,
          link: `/live-classroom/room/${classId}`,
        });
      } catch (notifErr) {
        console.warn('[LiveClassService] Admin notification warning:', notifErr);
      }

      try {
        webNotificationService.notifyLiveClassStarted(updatedClass);
      } catch (webNotifErr) {
        console.warn('[LiveClassService] Web notification warning:', webNotifErr);
      }

      try {
        // Dispatch to student in-app notification center
        const startTitle = `🔴 LIVE NOW: ${target?.title || 'Live Class Started'}`;
        const startDesc = `Instructor ${target?.instructorName || 'Lead Mentor'} has started the live class for ${target?.courseName || 'Course'}. Click to join!`;
        const startLink = target?.meetingUrl || `/live-classroom/room/${classId}`;

        notificationService.addNotification({
          title: startTitle,
          desc: startDesc,
          type: 'live_class',
          link: startLink,
          recipientRole: 'student',
        });
        notificationService.addNotification({
          title: startTitle,
          desc: startDesc,
          type: 'live_class',
          link: startLink,
          recipientRole: 'all',
        });
      } catch (notifErr) {
        console.warn('[LiveClassService] Student notification error:', notifErr);
      }

      if (db) {
        try {
          const notifRef = doc(collection(db, 'notifications'));
          await setDoc(notifRef, {
            id: notifRef.id,
            recipientRole: 'student',
            classId,
            title: `🔴 LIVE NOW: ${target?.title || 'Live Session'}`,
            desc: `Instructor ${target?.instructorName || 'Lead Mentor'} has started the live class. Click to join!`,
            message: `${target?.title || 'Live Session'} - Instructor has started the live class.`,
            link: `/live-classroom/room/${classId}`,
            type: 'live_class',
            createdAt: nowISO,
            read: false,
          }).catch(() => {});
        } catch (dbNotifErr) {
          console.warn('[LiveClassService] Firestore notification warning:', dbNotifErr);
        }
      }

      // 3. Emit real-time socket events
      try {
        import('@/services/socketService').then(({ socketService }) => {
          const socket = socketService.getSocket();
          if (socket) {
            socket.emit('liveClass:status_change', { classId, liveClassId: classId, status: 'LIVE' });
            socket.emit('live_class_started', { classId, liveClassId: classId });
            socket.emit('liveClass:status', { classId, liveClassId: classId, status: 'LIVE' });
          }
        }).catch(() => {});
      } catch (sockErr) {
        console.warn('[LiveClassService] Socket broadcast warning:', sockErr);
      }

      // 4. Safely attempt backend API call if server is running, without failing if offline
      try {
        const headers = await this.getAuthHeaders();
        if (token) headers['Authorization'] = `Bearer ${token}`;
        if (userMeta?.uid) headers['x-user-id'] = userMeta.uid;
        if (userMeta?.role) headers['x-user-role'] = userMeta.role;
        if (userMeta?.email) headers['x-user-email'] = userMeta.email;
        if (userMeta?.name) headers['x-user-name'] = userMeta.name;

        await fetch(`${this.getApiUrl()}/live-classes/${encodeURIComponent(classId)}/start`, {
          method: 'POST',
          headers,
        }).catch(() => null);
      } catch (backendErr) {
        console.warn('[LiveClassService] Backend start notice (using offline/Firestore mode):', backendErr);
      }

      return { success: true, data: updatedClass };
    } catch (err: any) {
      console.error('[LiveClassService] Unexpected error in startClass:', err);
      const nowISO = new Date().toISOString();
      await this.updateLiveClass(classId, { status: 'LIVE' as any, startedAt: nowISO }).catch(() => {});
      return { success: true, data: { id: classId, status: 'LIVE' as any, startedAt: nowISO } as LiveClass };
    }
  }

  async endClass(classId: string, token?: string): Promise<{ success: boolean; data?: LiveClass; error?: string }> {
    try {
      // 1. Delete from local and Firestore
      await this.deleteLiveClass(classId);

      // 2. Safe backend attempt
      try {
        const headers = await this.getAuthHeaders();
        if (token) headers['Authorization'] = `Bearer ${token}`;
        await fetch(`${this.getApiUrl()}/live-classes/${encodeURIComponent(classId)}/end`, {
          method: 'POST',
          headers,
        }).catch(() => null);
      } catch (e) {}

      return { success: true, data: { id: classId, status: 'ENDED' } as any };
    } catch (err: any) {
      await this.deleteLiveClass(classId).catch(() => {});
      return { success: true };
    }
  }

  async cancelClass(classId: string, token?: string): Promise<{ success: boolean; data?: LiveClass; error?: string }> {
    try {
      await this.deleteLiveClass(classId);

      try {
        const headers = await this.getAuthHeaders();
        if (token) headers['Authorization'] = `Bearer ${token}`;
        await fetch(`${this.getApiUrl()}/live-classes/${encodeURIComponent(classId)}/cancel`, {
          method: 'POST',
          headers,
        }).catch(() => null);
      } catch (e) {}

      return { success: true, data: { id: classId, status: 'CANCELLED' } as any };
    } catch (err: any) {
      await this.deleteLiveClass(classId).catch(() => {});
      return { success: true };
    }
  }

  async updateYoutube(classId: string, youtubeVideoId: string): Promise<{ success: boolean; data?: LiveClass; error?: string }> {
    try {
      const res = await fetch(`${this.getApiUrl()}/live-classes/${encodeURIComponent(classId)}/youtube`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ youtubeVideoId: youtubeVideoId.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to update YouTube ID');
      await this.updateLiveClass(classId, { youtubeVideoId: youtubeVideoId.trim() });
      return { success: true, data: data?.data };
    } catch (err: any) {
      await this.updateLiveClass(classId, { youtubeVideoId: youtubeVideoId.trim() });
      return { success: true };
    }
  }

  async fetchAnnouncements(classId: string): Promise<any[]> {
    try {
      const res = await fetch(`${this.getApiUrl()}/live-classes/${encodeURIComponent(classId)}/announcements`);
      const data = await res.json();
      if (data?.success && Array.isArray(data?.data)) return data.data;
    } catch (e) {}
    const local = localStorage.getItem(`kaizenq_announcements_${classId}`);
    return local ? JSON.parse(local) : [];
  }

  async createAnnouncement(classId: string, message: string, authorName?: string): Promise<any> {
    const payload = {
      id: `ann_${Date.now()}`,
      classId,
      message,
      authorName: authorName || 'Instructor',
      createdAt: new Date().toISOString(),
    };
    try {
      await fetch(`${this.getApiUrl()}/live-classes/${encodeURIComponent(classId)}/announcements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (e) {}
    const local = await this.fetchAnnouncements(classId);
    const updated = [payload, ...local];
    localStorage.setItem(`kaizenq_announcements_${classId}`, JSON.stringify(updated));
    return payload;
  }

  async fetchQuizzes(classId: string): Promise<any[]> {
    try {
      const res = await fetch(`${this.getApiUrl()}/live-classes/${encodeURIComponent(classId)}/quizzes`);
      const data = await res.json();
      if (data?.success && Array.isArray(data?.data)) return data.data;
    } catch (e) {}
    const local = localStorage.getItem(`kaizenq_quizzes_${classId}`);
    return local ? JSON.parse(local) : [];
  }

  async createQuiz(classId: string, quiz: any): Promise<any> {
    const payload = {
      id: quiz.id || `quiz_${Date.now()}`,
      classId,
      ...quiz,
      createdAt: new Date().toISOString(),
    };
    try {
      await fetch(`${this.getApiUrl()}/live-classes/${encodeURIComponent(classId)}/quizzes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (e) {}
    const local = await this.fetchQuizzes(classId);
    const updated = [payload, ...local.filter((q) => q.id !== payload.id)];
    localStorage.setItem(`kaizenq_quizzes_${classId}`, JSON.stringify(updated));
    return payload;
  }

  async submitQuizAnswer(classId: string, quizId: string, answer: string, userName?: string, userId?: string): Promise<any> {
    try {
      const res = await fetch(`${this.getApiUrl()}/live-classes/${encodeURIComponent(classId)}/quizzes/${encodeURIComponent(quizId)}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer, userName, userId }),
      });
      const data = await res.json();
      if (res.ok) return data;
    } catch (e) {}
    return { success: true, message: 'Answer recorded.' };
  }

  async recordJoinAttendance(classId: string, userMeta: { uid: string; name?: string; email?: string }): Promise<void> {
    try {
      const headers = await this.getAuthHeadersAsync();
      await fetch(`${this.getApiUrl()}/live-classes/${encodeURIComponent(classId)}/join`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          userId: userMeta.uid,
          userName: userMeta.name,
          userEmail: userMeta.email,
        }),
      });
    } catch (e) {}
  }

  async recordLeaveAttendance(classId: string, userId: string): Promise<void> {
    try {
      const headers = await this.getAuthHeadersAsync();
      await fetch(`${this.getApiUrl()}/live-classes/${encodeURIComponent(classId)}/leave`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ userId }),
      });
    } catch (e) {}
  }

  async getAttendanceReport(classId: string): Promise<AttendanceReportItem[]> {
    try {
      const headers = await this.getAuthHeadersAsync();
      const res = await fetch(`${this.getApiUrl()}/live-classes/${encodeURIComponent(classId)}/attendance`, {
        headers,
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.success && Array.isArray(data?.data)) return data.data;
      }
    } catch (e) {}
  }

  async getMyAttendance(classId: string): Promise<AttendanceReportItem | null> {
    try {
      const headers = await this.getAuthHeadersAsync();
      const res = await fetch(`${this.getApiUrl()}/live-classes/${encodeURIComponent(classId)}/attendance/me`, {
        headers,
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.success && data?.data) return data.data;
      }
    } catch (e) {}
  }

  async getLiveClassAnalytics(classId: string): Promise<LiveClassAnalytics | null> {
    try {
      const headers = await this.getAuthHeadersAsync();
      const res = await fetch(`${this.getApiUrl()}/live-classes/${encodeURIComponent(classId)}/analytics`, {
        headers,
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.success && data?.data) return data.data;
      }
    } catch (e) {}
  }

  async getLiveClassRecording(classId: string): Promise<LiveClassRecording | null> {
    try {
      const headers = await this.getAuthHeadersAsync();
      const res = await fetch(`${this.getApiUrl()}/live-classes/${encodeURIComponent(classId)}/recording`, {
        headers,
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.success && data?.data) return data.data;
      }
    } catch (e) {}
  }

  async updateLiveClassRecording(
    classId: string,
    data: { recordingUrl?: string; recordingStatus?: 'NOT_AVAILABLE' | 'RECORDING' | 'PROCESSING' | 'READY' | 'FAILED'; recordingDuration?: number }
  ): Promise<any> {
    try {
      const headers = await this.getAuthHeadersAsync();
      const res = await fetch(`${this.getApiUrl()}/live-classes/${encodeURIComponent(classId)}/recording`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {}
    return null;
  }
}

export interface AttendanceReportItem {
  id: string;
  liveClassId: string;
  studentId: string;
  studentName?: string;
  studentEmail?: string;
  joinedAt: string;
  leftAt?: string;
  durationMinutes: number;
  totalDurationSeconds?: number;
  status: 'present' | 'late' | 'absent' | 'JOINED' | 'LEFT' | 'COMPLETED';
  sessions?: Array<{ joinedAt: string; leftAt?: string; durationSeconds: number }>;
  attendancePercentage?: number;
}

export interface LiveClassAnalytics {
  totalParticipants: number;
  attendanceRate: number;
  averageSessionDurationMinutes: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  questionsCount: number;
  pollsCount: number;
  totalPollVotes: number;
  quizzesCount: number;
  totalQuizSubmissions: number;
  chatMessagesCount: number;
  durationMinutes: number;
}

export interface LiveClassRecording {
  recordingUrl?: string;
  recordingStatus: 'NOT_AVAILABLE' | 'RECORDING' | 'PROCESSING' | 'READY' | 'FAILED';
  recordingDuration?: number;
  isRecordingEnabled?: boolean;
}

export const liveClassService = new LiveClassService();
