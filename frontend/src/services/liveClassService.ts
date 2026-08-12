import { db } from '@/firebase';
import { collection, onSnapshot, query, doc, setDoc, updateDoc, deleteDoc, where } from 'firebase/firestore';
import { adminNotificationService } from './adminNotificationService';

export interface LiveClass {
  id: string;
  classId: string;
  title: string;
  description: string;
  courseId: string;
  courseName: string;
  moduleId: string;
  moduleTitle: string;
  lessonId: string;
  lessonTitle: string;
  instructorId: string;
  instructorName: string;
  instructorAvatar?: string;
  assignedBy?: string;
  assignedAt?: string;
  startedAt?: string;
  endedAt?: string;
  branch?: string;
  semester?: string;
  year?: string;
  section?: string;
  allowedStudents?: string[];
  meetingProvider: 'jitsi' | 'google_meet' | 'zoom' | 'teams';
  meetingRoomId: string;
  meetingUrl: string;
  banner?: string;
  thumbnail?: string;
  startTime: string; // ISO String
  endTime: string;   // ISO String
  duration: number;  // Minutes
  status: 'draft' | 'scheduled' | 'live' | 'completed' | 'cancelled' | 'Draft' | 'Scheduled' | 'Live' | 'Completed' | 'Cancelled';
  isRecordingEnabled: boolean;
  isQuizEnabled: boolean;
  isPollEnabled: boolean;
  isChatEnabled: boolean;
  isAttendanceEnabled: boolean;
  resourceDownloadEnabled?: boolean;
  certificateEligible: boolean;
  maxParticipants: number;
  tags: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  notesUrl?: string;
  recordingUrl?: string;
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

const INITIAL_CLASSES: LiveClass[] = [
  {
    id: 'live_linux_kernel_1',
    classId: 'live_linux_kernel_1',
    title: 'Linux Kernel Monolithic Architecture & Memory Management',
    description: 'Interactive deep dive into Linux kernel memory layout, virtual address translation, and page tables.',
    courseId: 'course_linux_kernel',
    courseName: 'Advanced Linux Kernel Engineering',
    moduleId: 'mod_1',
    moduleTitle: 'Module 1: Kernel Core Architecture',
    lessonId: 'les_1',
    lessonTitle: 'Lesson 1.2: Page Tables & Memory Allocation',
    instructorId: 'inst_1',
    instructorName: 'Prof. Manoj Acharya',
    instructorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    branch: 'CSE',
    semester: 'Sem 5',
    year: '3rd Year',
    section: 'Sec A',
    meetingProvider: 'jitsi',
    meetingRoomId: 'kaizenq-linux-kernel-batch-01',
    meetingUrl: 'https://meet.jit.si/kaizenq-linux-kernel-batch-01',
    banner: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=400&q=80',
    startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    duration: 90,
    status: 'Live',
    isRecordingEnabled: true,
    isQuizEnabled: true,
    isPollEnabled: true,
    isChatEnabled: true,
    isAttendanceEnabled: true,
    resourceDownloadEnabled: true,
    certificateEligible: true,
    maxParticipants: 100,
    tags: ['Linux', 'Kernel', 'OS', 'Systems'],
    difficulty: 'Advanced',
    notesUrl: 'https://kaizenq.lms/notes/linux-kernel-mem.pdf',
    createdBy: 'admin_sys',
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'live_git_conflict_2',
    classId: 'live_git_conflict_2',
    title: 'Git Rebasing, Three-Way Merges & Conflict Sandboxes',
    description: 'Hands-on interactive lab resolving complex merge conflicts, interactive rebasing, and reflog recovery.',
    courseId: 'course_git_mastery',
    courseName: 'Git & GitHub Mastery for Enterprise Systems',
    moduleId: 'mod_2',
    moduleTitle: 'Module 3: Advanced Branching & Rebasing',
    lessonId: 'les_3',
    lessonTitle: 'Lesson 3.4: Interactive Rebase Sandbox',
    instructorId: 'inst_2',
    instructorName: 'Dr. Ananya Rao',
    instructorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    branch: 'AI & DS',
    semester: 'Sem 3',
    year: '2nd Year',
    section: 'Sec B',
    meetingProvider: 'jitsi',
    meetingRoomId: 'kaizenq-git-mastery-batch-02',
    meetingUrl: 'https://meet.jit.si/kaizenq-git-mastery-batch-02',
    banner: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=400&q=80',
    startTime: new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
    endTime: new Date(Date.now() + 4.5 * 3600 * 1000).toISOString(),
    duration: 90,
    status: 'Scheduled',
    isRecordingEnabled: true,
    isQuizEnabled: true,
    isPollEnabled: true,
    isChatEnabled: true,
    isAttendanceEnabled: true,
    resourceDownloadEnabled: true,
    certificateEligible: true,
    maxParticipants: 150,
    tags: ['Git', 'DevOps', 'Version Control'],
    difficulty: 'Intermediate',
    createdBy: 'admin_sys',
    createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'live_ebpf_perf_3',
    classId: 'live_ebpf_perf_3',
    title: 'eBPF Tracing & Observability in Production Systems',
    description: 'Production case study utilizing eBPF kprobes, tracepoints, and BPF Compiler Collection (BCC).',
    courseId: 'course_linux_perf',
    courseName: 'Linux Performance & eBPF Engineering',
    moduleId: 'mod_4',
    moduleTitle: 'Module 4: Runtime Analysis',
    lessonId: 'les_8',
    lessonTitle: 'Lesson 4.2: Writing Custom eBPF Programs',
    instructorId: 'inst_1',
    instructorName: 'Prof. Manoj Acharya',
    instructorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    branch: 'IT',
    semester: 'Sem 7',
    year: '4th Year',
    section: 'Sec C',
    meetingProvider: 'jitsi',
    meetingRoomId: 'kaizenq-ebpf-observability-batch-03',
    meetingUrl: 'https://meet.jit.si/kaizenq-ebpf-observability-batch-03',
    banner: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80',
    startTime: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
    endTime: new Date(Date.now() - 24.5 * 3600 * 1000).toISOString(),
    duration: 90,
    status: 'Completed',
    isRecordingEnabled: true,
    isQuizEnabled: true,
    isPollEnabled: true,
    isChatEnabled: true,
    isAttendanceEnabled: true,
    resourceDownloadEnabled: true,
    certificateEligible: true,
    maxParticipants: 120,
    tags: ['eBPF', 'Observability', 'Linux', 'Performance'],
    difficulty: 'Advanced',
    notesUrl: 'https://kaizenq.lms/notes/ebpf-tracing.pdf',
    recordingUrl: 'https://meet.jit.si/kaizenq-ebpf-observability-batch-03#recording',
    createdBy: 'admin_sys',
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

class LiveClassService {
  private listeners: Array<(classes: LiveClass[]) => void> = [];
  private unsubscribeFirestore: (() => void) | null = null;

  private getLocalClasses(): LiveClass[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse live classes from localStorage:', e);
    }
    return [];
  }

  getLiveClassesSync(): LiveClass[] {
    const local = this.getLocalClasses();
    if (local.length > 0) return local;
    return INITIAL_CLASSES;
  }

  saveClasses(classes: LiveClass[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(classes));
    } catch (e) {
      console.warn('Failed to save live classes to localStorage:', e);
    }
    this.notifyListeners(classes);
  }

  subscribeLiveClasses(callback: (classes: LiveClass[]) => void): () => void {
    this.listeners.push(callback);
    callback(this.getLiveClassesSync());

    const firestore = db;
    if (firestore && !this.unsubscribeFirestore) {
      try {
        const ref = collection(firestore, 'liveClasses');
        const q = query(ref);
        this.unsubscribeFirestore = onSnapshot(
          q,
          (snapshot) => {
            const fsClasses: LiveClass[] = [];
            snapshot.forEach((docSnap) => {
              fsClasses.push(docSnap.data() as LiveClass);
            });

            const local = this.getLocalClasses();
            const map = new Map<string, LiveClass>();
            INITIAL_CLASSES.forEach((c) => map.set(c.id, c));
            local.forEach((c) => map.set(c.id, c));
            fsClasses.forEach((c) => map.set(c.id || c.classId, c));

            const merged = Array.from(map.values()).sort(
              (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
            );

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

  async createLiveClass(data: Omit<LiveClass, 'id' | 'classId' | 'createdAt' | 'updatedAt' | 'meetingRoomId'> & { meetingRoomId?: string }): Promise<LiveClass> {
    const id = `live_class_${Date.now()}`;
    const courseSlug = (data.courseName || 'batch').toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const roomId = data.meetingRoomId || `kaizenq-${courseSlug}-${Date.now().toString().slice(-4)}`;
    const meetingUrl = data.meetingUrl || `https://meet.jit.si/${roomId}`;

    const newClass: LiveClass = {
      ...data,
      id,
      classId: id,
      meetingProvider: data.meetingProvider || 'jitsi',
      meetingRoomId: roomId,
      meetingUrl: meetingUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const current = this.getLiveClassesSync();
    const updated = [newClass, ...current];
    this.saveClasses(updated);

    try {
      if (db) {
        await setDoc(doc(db, 'liveClasses', id), newClass);
      }
    } catch (e) {
      console.warn('Firestore createLiveClass notice:', e);
    }

    if (newClass.status === 'Scheduled' || newClass.status === 'Live') {
      adminNotificationService.addNotification({
        type: 'COURSE_CREATED',
        title: `Live Session Published: ${newClass.title}`,
        message: `Instructor ${newClass.instructorName} scheduled a live classroom session for ${newClass.courseName}.`,
        link: `/live-classroom`
      });
    }

    return newClass;
  }

  async updateLiveClass(id: string, updates: Partial<LiveClass>): Promise<void> {
    const current = this.getLiveClassesSync();
    const updated = current.map((c) => (c.id === id || c.classId === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c));
    this.saveClasses(updated);

    try {
      if (db) {
        await updateDoc(doc(db, 'liveClasses', id), { ...updates, updatedAt: new Date().toISOString() });
      }
    } catch (e) {
      console.warn('Firestore updateLiveClass notice:', e);
    }
  }

  async deleteLiveClass(id: string): Promise<void> {
    const current = this.getLiveClassesSync();
    const updated = current.filter((c) => c.id !== id && c.classId !== id);
    this.saveClasses(updated);

    try {
      if (db) {
        await deleteDoc(doc(db, 'liveClasses', id));
      }
    } catch (e) {
      console.warn('Firestore deleteLiveClass notice:', e);
    }
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

  async startLiveClass(id: string, currentUserId?: string): Promise<void> {
    const target = this.getLiveClassesSync().find((c) => c.id === id || c.classId === id);
    if (!target) throw new Error('Live class not found');

    if (currentUserId && target.instructorId && target.instructorId !== currentUserId && target.createdBy !== currentUserId) {
      throw new Error('Unauthorized: Only the assigned instructor can start this live class.');
    }

    const currentStatus = normalizeLiveClassStatus(target.status);
    if (currentStatus === 'completed' || currentStatus === 'cancelled') {
      throw new Error(`Cannot start class. Current status is ${currentStatus}.`);
    }

    const nowISO = new Date().toISOString();
    await this.updateLiveClass(id, {
      status: 'live',
      startedAt: nowISO,
      updatedAt: nowISO,
    });

    adminNotificationService.addNotification({
      type: 'NEW_STUDENT',
      title: `🔴 LIVE NOW: ${target.title}`,
      message: `Session is active! Click to join video classroom stream.`,
      link: `/live-classroom/room/${id}`
    });
  }

  async endLiveClass(id: string, currentUserId?: string): Promise<void> {
    const target = this.getLiveClassesSync().find((c) => c.id === id || c.classId === id);
    if (!target) throw new Error('Live class not found');

    if (currentUserId && target.instructorId && target.instructorId !== currentUserId && target.createdBy !== currentUserId) {
      throw new Error('Unauthorized: Only the assigned instructor can end this live class.');
    }

    const nowISO = new Date().toISOString();
    await this.updateLiveClass(id, {
      status: 'completed',
      endedAt: nowISO,
      updatedAt: nowISO,
    });
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
}

export const liveClassService = new LiveClassService();
