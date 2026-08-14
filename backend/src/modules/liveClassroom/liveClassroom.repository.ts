import { db, isFirebaseAdminInitialized } from '../../firebase';
import logger from '../../config/logger';

export interface ILiveClassData {
  id: string;
  classId: string;
  courseId: string;
  courseName?: string;
  instructorId: string;
  instructorName?: string;
  instructorAvatar?: string;
  title: string;
  description: string;
  youtubeVideoId?: string;
  scheduledAt?: string;
  startTime: string;
  startedAt?: string;
  endTime?: string;
  endedAt?: string;
  duration: number;
  status: 'scheduled' | 'live' | 'ended' | 'cancelled' | 'Scheduled' | 'Live' | 'Completed' | 'Cancelled' | 'Draft' | 'SCHEDULED' | 'LIVE' | 'ENDED' | 'CANCELLED';
  meetingProvider?: 'kaizenq' | 'google_meet' | 'zoom' | 'teams' | 'youtube';
  meetingRoomId?: string;
  meetingUrl: string;
  recordingUrl?: string;
  notesUrl?: string;
  maxParticipants?: number;
  isRecordingEnabled?: boolean;
  isQuizEnabled?: boolean;
  isPollEnabled?: boolean;
  isChatEnabled?: boolean;
  isAttendanceEnabled?: boolean;
  resourceDownloadEnabled?: boolean;
  certificateEligible?: boolean;
  tags?: string[];
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IAttendanceData {
  id?: string;
  classId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  joinedAt: string;
  leftAt?: string;
  durationMinutes?: number;
  durationSeconds?: number;
  status: 'present' | 'late' | 'absent';
}

export interface IChatMessageData {
  id?: string;
  classId: string;
  userId: string;
  userName: string;
  userRole?: 'admin' | 'instructor' | 'student';
  message: string;
  createdAt: string;
}

export interface IQuestionData {
  id?: string;
  classId: string;
  studentId: string;
  studentName: string;
  question: string;
  status: 'pending' | 'answered';
  answer?: string;
  createdAt: string;
  answeredAt?: string;
}

export interface IPollData {
  id?: string;
  classId: string;
  title: string;
  options: Array<{
    text: string;
    votesCount: number;
    voters: string[];
  }>;
  status: 'open' | 'closed';
  createdBy: string;
  createdAt: string;
}

export interface INoteData {
  id?: string;
  classId: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt?: string;
}

export interface IResourceData {
  id?: string;
  classId: string;
  courseId: string;
  title: string;
  fileUrl: string;
  fileType: string;
  createdAt: string;
}

export interface IAnnouncementData {
  id?: string;
  classId: string;
  authorId: string;
  authorName: string;
  authorRole?: 'admin' | 'instructor';
  message: string;
  createdAt: string;
}

export interface IQuizData {
  id?: string;
  classId: string;
  question: string;
  options: string[];
  correctAnswer: string;
  timerSeconds?: number;
  points?: number;
  active: boolean;
  submissions?: Array<{
    userId: string;
    userName: string;
    answer: string;
    isCorrect: boolean;
    submittedAt: string;
  }>;
  createdAt: string;
}

// In-Memory Fallback Store
const memoryDb = {
  liveClasses: new Map<string, ILiveClassData>(),
  attendance: new Map<string, IAttendanceData[]>(),
  chat: new Map<string, IChatMessageData[]>(),
  questions: new Map<string, IQuestionData[]>(),
  polls: new Map<string, IPollData[]>(),
  quizzes: new Map<string, IQuizData[]>(),
  notes: new Map<string, INoteData[]>(),
  resources: new Map<string, IResourceData[]>(),
  announcements: new Map<string, IAnnouncementData[]>(),
};

// Seed initial memory store
const seedMemory = () => {
  const sample1: ILiveClassData = {
    id: 'class_react_101_live',
    classId: 'class_react_101_live',
    courseId: 'react-101',
    courseName: 'React & Next.js AI Masterclass',
    instructorId: 'inst_kaizen',
    instructorName: 'Prof. Manoj Acharya',
    instructorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
    title: 'React Fundamentals - Live Class 01',
    description: 'Interactive deep dive into React Component Architecture, State Management, and Next.js App Router hooks.',
    youtubeVideoId: 'bMknfKXIFA8',
    scheduledAt: new Date().toISOString(),
    startTime: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    startedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    duration: 90,
    status: 'LIVE',
    meetingProvider: 'youtube',
    meetingRoomId: 'kaizenq-react-101-live',
    meetingUrl: '/student/live-class/class_react_101_live',
    recordingUrl: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const sample2: ILiveClassData = {
    id: 'class_linux_101_live',
    classId: 'class_linux_101_live',
    courseId: 'course_linux_101',
    courseName: 'Linux Kernel & System Architecture',
    instructorId: 'inst_kaizen',
    instructorName: 'Prof. Manoj Acharya',
    instructorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
    title: 'Linux Kernel Monolithic Architecture & Memory Management',
    description: 'Deep dive into virtual memory management, page tables, and process schedulers.',
    youtubeVideoId: 'jfKfPfyJRdk',
    scheduledAt: new Date().toISOString(),
    startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    startedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    duration: 90,
    status: 'LIVE',
    meetingProvider: 'youtube',
    meetingRoomId: 'kaizenq-linux-kernel-101',
    meetingUrl: '/student/live-class/class_linux_101_live',
    recordingUrl: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  memoryDb.liveClasses.set(sample1.id, sample1);
  memoryDb.liveClasses.set(sample2.id, sample2);
};
seedMemory();

export class LiveClassroomRepository {
  // --- 1. Live Class Operations ---

  public async createLiveClass(data: Partial<ILiveClassData>): Promise<ILiveClassData> {
    const classId = data.id || data.classId || `class_${Date.now()}`;
    const now = new Date().toISOString();
    const payload: ILiveClassData = {
      id: classId,
      classId,
      courseId: data.courseId || 'course_default',
      courseName: data.courseName || 'Enterprise Technical Track',
      instructorId: data.instructorId || 'inst_default',
      instructorName: data.instructorName || 'Lead Instructor',
      instructorAvatar: data.instructorAvatar || '',
      title: data.title || 'Live Classroom Session',
      description: data.description || '',
      youtubeVideoId: data.youtubeVideoId || '',
      scheduledAt: data.scheduledAt || data.startTime || now,
      startTime: data.startTime || data.scheduledAt || now,
      startedAt: data.startedAt || (data.status === 'live' || data.status === 'LIVE' ? now : undefined),
      endTime: data.endTime,
      endedAt: data.endedAt,
      duration: data.duration || 60,
      status: (data.status as any) || 'scheduled',
      meetingProvider: data.meetingProvider || (data.youtubeVideoId ? 'youtube' : 'kaizenq'),
      meetingRoomId: data.meetingRoomId || `kaizenq-room-${Date.now().toString().slice(-4)}`,
      meetingUrl: data.meetingUrl || `/student/live-class/${classId}`,
      recordingUrl: data.recordingUrl || '',
      notesUrl: data.notesUrl || '',
      maxParticipants: data.maxParticipants || 100,
      isRecordingEnabled: data.isRecordingEnabled ?? true,
      isQuizEnabled: data.isQuizEnabled ?? true,
      isPollEnabled: data.isPollEnabled ?? true,
      isChatEnabled: data.isChatEnabled ?? true,
      isAttendanceEnabled: data.isAttendanceEnabled ?? true,
      resourceDownloadEnabled: data.resourceDownloadEnabled ?? true,
      certificateEligible: data.certificateEligible ?? true,
      tags: data.tags || ['Live', 'Engineering'],
      difficulty: data.difficulty || 'Intermediate',
      createdBy: data.createdBy || 'admin_sys',
      createdAt: data.createdAt || now,
      updatedAt: now,
    };

    if (isFirebaseAdminInitialized()) {
      try {
        await db.collection('liveClasses').doc(classId).set(payload, { merge: true });
      } catch (err) {
        logger.error('[REPO] Failed to create liveClass in Firestore:', err);
      }
    }

    memoryDb.liveClasses.set(classId, payload);
    return payload;
  }

  public async updateLiveClass(id: string, updates: Partial<ILiveClassData>): Promise<ILiveClassData | null> {
    const now = new Date().toISOString();
    const patch = { ...updates, updatedAt: now };

    if (isFirebaseAdminInitialized()) {
      try {
        await db.collection('liveClasses').doc(id).set(patch, { merge: true });
      } catch (err) {
        logger.error('[REPO] Failed to update liveClass in Firestore:', err);
      }
    }

    const existing = memoryDb.liveClasses.get(id);
    if (existing) {
      const updated = { ...existing, ...patch };
      memoryDb.liveClasses.set(id, updated);
      return updated;
    }
    return null;
  }

  public async getLiveClassById(id: string): Promise<ILiveClassData | null> {
    if (isFirebaseAdminInitialized()) {
      try {
        const snap = await db.collection('liveClasses').doc(id).get();
        if (snap.exists) {
          return snap.data() as ILiveClassData;
        }
      } catch (err) {
        logger.error('[REPO] Failed to fetch liveClass from Firestore:', err);
      }
    }
    return memoryDb.liveClasses.get(id) || null;
  }

  public async deleteLiveClass(id: string): Promise<boolean> {
    if (isFirebaseAdminInitialized()) {
      try {
        await db.collection('liveClasses').doc(id).delete();
      } catch (err) {
        logger.error('[REPO] Failed to delete liveClass in Firestore:', err);
      }
    }
    return memoryDb.liveClasses.delete(id);
  }

  public async getAllLiveClasses(): Promise<ILiveClassData[]> {
    if (isFirebaseAdminInitialized()) {
      try {
        const snap = await db.collection('liveClasses').get();
        if (!snap.empty) {
          return snap.docs.map((doc) => doc.data() as ILiveClassData);
        }
      } catch (err) {
        logger.error('[REPO] Failed to fetch all liveClasses from Firestore:', err);
      }
    }
    return Array.from(memoryDb.liveClasses.values());
  }

  // --- 2. Attendance Operations ---

  public async recordJoinAttendance(classId: string, studentId: string, studentName: string, studentEmail: string): Promise<IAttendanceData> {
    const now = new Date().toISOString();
    const docId = `${classId}_${studentId}`;

    const record: IAttendanceData = {
      id: docId,
      classId,
      studentId,
      studentName,
      studentEmail,
      joinedAt: now,
      status: 'present',
    };

    if (isFirebaseAdminInitialized()) {
      try {
        const docRef = db.collection('liveClasses').doc(classId).collection('attendance').doc(studentId);
        const snap = await docRef.get();
        if (snap.exists) {
          // Reconnect logic: preserve original joinedAt
          const existing = snap.data() as IAttendanceData;
          record.joinedAt = existing.joinedAt;
        }
        await docRef.set(record, { merge: true });
      } catch (err) {
        logger.error('[REPO] Failed to record join attendance in Firestore:', err);
      }
    }

    const currentList = memoryDb.attendance.get(classId) || [];
    const idx = currentList.findIndex((a) => a.studentId === studentId);
    if (idx >= 0) {
      currentList[idx] = { ...currentList[idx], ...record };
    } else {
      currentList.push(record);
    }
    memoryDb.attendance.set(classId, currentList);
    return record;
  }

  public async recordLeaveAttendance(classId: string, studentId: string): Promise<IAttendanceData | null> {
    const now = new Date().toISOString();

    let record: IAttendanceData | null = null;

    if (isFirebaseAdminInitialized()) {
      try {
        const docRef = db.collection('liveClasses').doc(classId).collection('attendance').doc(studentId);
        const snap = await docRef.get();
        if (snap.exists) {
          const existing = snap.data() as IAttendanceData;
          const joinedMs = new Date(existing.joinedAt).getTime();
          const leftMs = new Date(now).getTime();
          const durationMins = Math.max(1, Math.round((leftMs - joinedMs) / 60000));
          const durationSecs = Math.max(1, Math.round((leftMs - joinedMs) / 1000));

          record = {
            ...existing,
            leftAt: now,
            durationMinutes: durationMins,
            durationSeconds: durationSecs,
          };
          await docRef.update({
            leftAt: now,
            durationMinutes: durationMins,
            durationSeconds: durationSecs,
          });
        }
      } catch (err) {
        logger.error('[REPO] Failed to record leave attendance in Firestore:', err);
      }
    }

    const currentList = memoryDb.attendance.get(classId) || [];
    const idx = currentList.findIndex((a) => a.studentId === studentId);
    if (idx >= 0) {
      const existing = currentList[idx];
      const joinedMs = new Date(existing.joinedAt).getTime();
      const leftMs = new Date(now).getTime();
      const durationMins = Math.max(1, Math.round((leftMs - joinedMs) / 60000));
      const durationSecs = Math.max(1, Math.round((leftMs - joinedMs) / 1000));

      record = {
        ...existing,
        leftAt: now,
        durationMinutes: durationMins,
        durationSeconds: durationSecs,
      };
      currentList[idx] = record;
      memoryDb.attendance.set(classId, currentList);
    }

    return record;
  }

  public async getAttendanceReport(classId: string): Promise<IAttendanceData[]> {
    if (isFirebaseAdminInitialized()) {
      try {
        const snap = await db.collection('liveClasses').doc(classId).collection('attendance').get();
        if (!snap.empty) {
          return snap.docs.map((d) => d.data() as IAttendanceData);
        }
      } catch (err) {
        logger.error('[REPO] Failed to get attendance from Firestore:', err);
      }
    }
    return memoryDb.attendance.get(classId) || [];
  }

  // --- 3. Live Chat Operations ---

  public async saveChatMessage(data: IChatMessageData): Promise<IChatMessageData> {
    const msgId = data.id || `msg_${Date.now()}`;
    const payload: IChatMessageData = {
      ...data,
      id: msgId,
      createdAt: data.createdAt || new Date().toISOString(),
    };

    if (isFirebaseAdminInitialized()) {
      try {
        await db.collection('liveClasses').doc(data.classId).collection('chat').doc(msgId).set(payload);
      } catch (err) {
        logger.error('[REPO] Failed to save chat in Firestore:', err);
      }
    }

    const existing = memoryDb.chat.get(data.classId) || [];
    existing.push(payload);
    memoryDb.chat.set(data.classId, existing);
    return payload;
  }

  public async getChatMessages(classId: string): Promise<IChatMessageData[]> {
    if (isFirebaseAdminInitialized()) {
      try {
        const snap = await db.collection('liveClasses').doc(classId).collection('chat').orderBy('createdAt', 'asc').get();
        if (!snap.empty) {
          return snap.docs.map((d) => d.data() as IChatMessageData);
        }
      } catch (err) {
        logger.error('[REPO] Failed to fetch chat messages from Firestore:', err);
      }
    }
    return memoryDb.chat.get(classId) || [];
  }

  public async deleteChatMessage(classId: string, messageId: string): Promise<boolean> {
    if (isFirebaseAdminInitialized()) {
      try {
        await db.collection('liveClasses').doc(classId).collection('chat').doc(messageId).delete();
      } catch (err) {
        logger.error('[REPO] Failed to delete chat message in Firestore:', err);
      }
    }
    const current = memoryDb.chat.get(classId) || [];
    memoryDb.chat.set(classId, current.filter((m) => m.id !== messageId));
    return true;
  }

  // --- 4. Live Questions Operations ---

  public async createQuestion(data: IQuestionData): Promise<IQuestionData> {
    const qId = data.id || `q_${Date.now()}`;
    const payload: IQuestionData = {
      ...data,
      id: qId,
      status: 'pending',
      createdAt: data.createdAt || new Date().toISOString(),
    };

    if (isFirebaseAdminInitialized()) {
      try {
        await db.collection('liveClasses').doc(data.classId).collection('questions').doc(qId).set(payload);
      } catch (err) {
        logger.error('[REPO] Failed to create question in Firestore:', err);
      }
    }

    const existing = memoryDb.questions.get(data.classId) || [];
    existing.push(payload);
    memoryDb.questions.set(data.classId, existing);
    return payload;
  }

  public async updateQuestion(classId: string, questionId: string, updates: Partial<IQuestionData>): Promise<IQuestionData | null> {
    const patch = { ...updates };
    if (updates.status === 'answered' && !updates.answeredAt) {
      patch.answeredAt = new Date().toISOString();
    }

    if (isFirebaseAdminInitialized()) {
      try {
        await db.collection('liveClasses').doc(classId).collection('questions').doc(questionId).update(patch);
      } catch (err) {
        logger.error('[REPO] Failed to update question in Firestore:', err);
      }
    }

    const current = memoryDb.questions.get(classId) || [];
    const idx = current.findIndex((q) => q.id === questionId);
    if (idx >= 0) {
      const updated = { ...current[idx], ...patch };
      current[idx] = updated;
      memoryDb.questions.set(classId, current);
      return updated;
    }
    return null;
  }

  public async getQuestions(classId: string): Promise<IQuestionData[]> {
    if (isFirebaseAdminInitialized()) {
      try {
        const snap = await db.collection('liveClasses').doc(classId).collection('questions').orderBy('createdAt', 'asc').get();
        if (!snap.empty) {
          return snap.docs.map((d) => d.data() as IQuestionData);
        }
      } catch (err) {
        logger.error('[REPO] Failed to get questions from Firestore:', err);
      }
    }
    return memoryDb.questions.get(classId) || [];
  }

  // --- 5. Live Polls Operations ---

  public async createPoll(data: IPollData): Promise<IPollData> {
    const pollId = data.id || `poll_${Date.now()}`;
    const payload: IPollData = {
      ...data,
      id: pollId,
      status: 'open',
      createdAt: data.createdAt || new Date().toISOString(),
    };

    if (isFirebaseAdminInitialized()) {
      try {
        await db.collection('liveClasses').doc(data.classId).collection('polls').doc(pollId).set(payload);
      } catch (err) {
        logger.error('[REPO] Failed to create poll in Firestore:', err);
      }
    }

    const existing = memoryDb.polls.get(data.classId) || [];
    existing.push(payload);
    memoryDb.polls.set(data.classId, existing);
    return payload;
  }

  public async votePoll(classId: string, pollId: string, optionIndex: number, userId: string): Promise<IPollData | null> {
    let updatedPoll: IPollData | null = null;

    if (isFirebaseAdminInitialized()) {
      try {
        const docRef = db.collection('liveClasses').doc(classId).collection('polls').doc(pollId);
        const snap = await docRef.get();
        if (snap.exists) {
          const poll = snap.data() as IPollData;
          if (poll.status === 'open' && poll.options[optionIndex]) {
            // Remove previous vote if user voted
            poll.options.forEach((opt) => {
              opt.voters = opt.voters.filter((id) => id !== userId);
              opt.votesCount = opt.voters.length;
            });
            // Add new vote
            poll.options[optionIndex].voters.push(userId);
            poll.options[optionIndex].votesCount = poll.options[optionIndex].voters.length;

            await docRef.set(poll, { merge: true });
            updatedPoll = poll;
          }
        }
      } catch (err) {
        logger.error('[REPO] Failed to submit poll vote in Firestore:', err);
      }
    }

    const currentList = memoryDb.polls.get(classId) || [];
    const idx = currentList.findIndex((p) => p.id === pollId);
    if (idx >= 0) {
      const poll = currentList[idx];
      if (poll.status === 'open' && poll.options[optionIndex]) {
        poll.options.forEach((opt) => {
          opt.voters = opt.voters.filter((id) => id !== userId);
          opt.votesCount = opt.voters.length;
        });
        poll.options[optionIndex].voters.push(userId);
        poll.options[optionIndex].votesCount = poll.options[optionIndex].voters.length;

        currentList[idx] = poll;
        memoryDb.polls.set(classId, currentList);
        updatedPoll = poll;
      }
    }

    return updatedPoll;
  }

  public async getPolls(classId: string): Promise<IPollData[]> {
    if (isFirebaseAdminInitialized()) {
      try {
        const snap = await db.collection('liveClasses').doc(classId).collection('polls').get();
        if (!snap.empty) {
          return snap.docs.map((d) => d.data() as IPollData);
        }
      } catch (err) {
        logger.error('[REPO] Failed to get polls from Firestore:', err);
      }
    }
    return memoryDb.polls.get(classId) || [];
  }

  // --- 6. Live Notes Operations ---

  public async createNote(data: INoteData): Promise<INoteData> {
    const noteId = data.id || `note_${Date.now()}`;
    const payload: INoteData = {
      ...data,
      id: noteId,
      createdAt: data.createdAt || new Date().toISOString(),
    };

    if (isFirebaseAdminInitialized()) {
      try {
        await db.collection('liveClasses').doc(data.classId).collection('notes').doc(noteId).set(payload);
      } catch (err) {
        logger.error('[REPO] Failed to save note in Firestore:', err);
      }
    }

    const existing = memoryDb.notes.get(data.classId) || [];
    existing.push(payload);
    memoryDb.notes.set(data.classId, existing);
    return payload;
  }

  public async getNotes(classId: string): Promise<INoteData[]> {
    if (isFirebaseAdminInitialized()) {
      try {
        const snap = await db.collection('liveClasses').doc(classId).collection('notes').get();
        if (!snap.empty) {
          return snap.docs.map((d) => d.data() as INoteData);
        }
      } catch (err) {
        logger.error('[REPO] Failed to get notes from Firestore:', err);
      }
    }
    return memoryDb.notes.get(classId) || [];
  }

  // --- 7. Resource Operations ---

  public async createResource(data: IResourceData): Promise<IResourceData> {
    const resId = data.id || `res_${Date.now()}`;
    const payload: IResourceData = {
      ...data,
      id: resId,
      createdAt: data.createdAt || new Date().toISOString(),
    };

    if (isFirebaseAdminInitialized()) {
      try {
        await db.collection('liveClasses').doc(data.classId).collection('resources').doc(resId).set(payload);
      } catch (err) {
        logger.error('[REPO] Failed to save resource in Firestore:', err);
      }
    }

    const existing = memoryDb.resources.get(data.classId) || [];
    existing.push(payload);
    memoryDb.resources.set(data.classId, existing);
    return payload;
  }

  public async getResources(classId: string): Promise<IResourceData[]> {
    if (isFirebaseAdminInitialized()) {
      try {
        const snap = await db.collection('liveClasses').doc(classId).collection('resources').get();
        if (!snap.empty) {
          return snap.docs.map((d) => d.data() as IResourceData);
        }
      } catch (err) {
        logger.error('[REPO] Failed to get resources from Firestore:', err);
      }
    }
    return memoryDb.resources.get(classId) || [];
  }

  // --- 8. Live Announcements ---

  public async createAnnouncement(data: IAnnouncementData): Promise<IAnnouncementData> {
    const annId = data.id || `ann_${Date.now()}`;
    const payload: IAnnouncementData = {
      ...data,
      id: annId,
      createdAt: data.createdAt || new Date().toISOString(),
    };

    if (isFirebaseAdminInitialized()) {
      try {
        await db.collection('liveClasses').doc(data.classId).collection('announcements').doc(annId).set(payload);
      } catch (err) {
        logger.error('[REPO] Failed to save announcement in Firestore:', err);
      }
    }

    const existing = memoryDb.announcements.get(data.classId) || [];
    existing.unshift(payload);
    memoryDb.announcements.set(data.classId, existing);
    return payload;
  }

  public async getAnnouncements(classId: string): Promise<IAnnouncementData[]> {
    if (isFirebaseAdminInitialized()) {
      try {
        const snap = await db.collection('liveClasses').doc(classId).collection('announcements').orderBy('createdAt', 'desc').get();
        if (!snap.empty) {
          return snap.docs.map((d) => d.data() as IAnnouncementData);
        }
      } catch (err) {
        logger.error('[REPO] Failed to get announcements from Firestore:', err);
      }
    }
    return memoryDb.announcements.get(classId) || [];
  }

  public async deleteAnnouncement(classId: string, annId: string): Promise<boolean> {
    if (isFirebaseAdminInitialized()) {
      try {
        await db.collection('liveClasses').doc(classId).collection('announcements').doc(annId).delete();
      } catch (err) {
        logger.error('[REPO] Failed to delete announcement from Firestore:', err);
      }
    }
    const current = memoryDb.announcements.get(classId) || [];
    const filtered = current.filter((a) => a.id !== annId);
    memoryDb.announcements.set(classId, filtered);
    return true;
  }

  // --- 9. Live Interactive Quizzes ---

  public async createQuiz(data: Partial<IQuizData>): Promise<IQuizData> {
    const quizId = data.id || `quiz_${Date.now()}`;
    const payload: IQuizData = {
      id: quizId,
      classId: data.classId || '',
      question: data.question || '',
      options: data.options || [],
      correctAnswer: data.correctAnswer || '',
      timerSeconds: data.timerSeconds || 30,
      points: data.points || 10,
      active: data.active ?? true,
      submissions: data.submissions || [],
      createdAt: data.createdAt || new Date().toISOString(),
    };

    if (isFirebaseAdminInitialized()) {
      try {
        await db.collection('liveClasses').doc(payload.classId).collection('quizzes').doc(quizId).set(payload);
      } catch (err) {
        logger.error('[REPO] Failed to save quiz in Firestore:', err);
      }
    }

    const existing = memoryDb.quizzes.get(payload.classId) || [];
    existing.unshift(payload);
    memoryDb.quizzes.set(payload.classId, existing);
    return payload;
  }

  public async getQuizzes(classId: string): Promise<IQuizData[]> {
    if (isFirebaseAdminInitialized()) {
      try {
        const snap = await db.collection('liveClasses').doc(classId).collection('quizzes').orderBy('createdAt', 'desc').get();
        if (!snap.empty) {
          return snap.docs.map((d) => d.data() as IQuizData);
        }
      } catch (err) {
        logger.error('[REPO] Failed to get quizzes from Firestore:', err);
      }
    }
    return memoryDb.quizzes.get(classId) || [];
  }

  public async submitQuizAnswer(
    classId: string,
    quizId: string,
    submission: { userId: string; userName: string; answer: string }
  ): Promise<{ success: boolean; isCorrect: boolean; correctAnswer: string; points: number }> {
    let targetQuiz: IQuizData | undefined;
    const currentList = memoryDb.quizzes.get(classId) || [];
    const idx = currentList.findIndex((q) => q.id === quizId);

    if (idx >= 0) {
      targetQuiz = currentList[idx];
    } else if (isFirebaseAdminInitialized()) {
      const snap = await db.collection('liveClasses').doc(classId).collection('quizzes').doc(quizId).get().catch(() => null);
      if (snap && snap.exists) {
        targetQuiz = snap.data() as IQuizData;
      }
    }

    if (!targetQuiz) {
      throw new Error('Quiz not found.');
    }

    const isCorrect = String(targetQuiz.correctAnswer).trim().toLowerCase() === String(submission.answer).trim().toLowerCase();
    const subRecord = {
      userId: submission.userId,
      userName: submission.userName,
      answer: submission.answer,
      isCorrect,
      submittedAt: new Date().toISOString(),
    };

    targetQuiz.submissions = targetQuiz.submissions || [];
    targetQuiz.submissions = targetQuiz.submissions.filter((s) => s.userId !== submission.userId);
    targetQuiz.submissions.push(subRecord);

    if (isFirebaseAdminInitialized()) {
      try {
        await db.collection('liveClasses').doc(classId).collection('quizzes').doc(quizId).set(targetQuiz, { merge: true });
      } catch (err) {
        logger.error('[REPO] Failed to update quiz submission in Firestore:', err);
      }
    }

    if (idx >= 0) {
      currentList[idx] = targetQuiz;
      memoryDb.quizzes.set(classId, currentList);
    }

    return {
      success: true,
      isCorrect,
      correctAnswer: targetQuiz.correctAnswer,
      points: isCorrect ? (targetQuiz.points || 10) : 0,
    };
  }

  public async toggleQuizActive(classId: string, quizId: string, active: boolean): Promise<IQuizData | null> {
    const currentList = memoryDb.quizzes.get(classId) || [];
    const idx = currentList.findIndex((q) => q.id === quizId);
    let updated: IQuizData | null = null;

    if (idx >= 0) {
      currentList[idx].active = active;
      updated = currentList[idx];
      memoryDb.quizzes.set(classId, currentList);
    }

    if (isFirebaseAdminInitialized()) {
      try {
        await db.collection('liveClasses').doc(classId).collection('quizzes').doc(quizId).update({ active });
      } catch (err) {
        logger.error('[REPO] Failed to toggle quiz active in Firestore:', err);
      }
    }

    return updated;
  }
}

export const liveClassroomRepository = new LiveClassroomRepository();
