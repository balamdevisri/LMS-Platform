import { db, isFirebaseAdminInitialized } from '../../firebase';
import logger from '../../config/logger';

export interface ILiveClassData {
  id: string;
  classId: string;
  courseId: string;
  courseName?: string;
  instructorId: string;
  instructorName?: string;
  title: string;
  description: string;
  scheduledAt?: string;
  startTime: string;
  endTime?: string;
  duration: number;
  status: 'scheduled' | 'live' | 'ended' | 'cancelled' | 'Scheduled' | 'Live' | 'Completed' | 'Cancelled' | 'Draft';
  meetingProvider?: 'jitsi' | 'google_meet' | 'zoom' | 'teams';
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

// In-Memory Fallback Store
const memoryDb = {
  liveClasses: new Map<string, ILiveClassData>(),
  attendance: new Map<string, IAttendanceData[]>(),
  chat: new Map<string, IChatMessageData[]>(),
  questions: new Map<string, IQuestionData[]>(),
  polls: new Map<string, IPollData[]>(),
  notes: new Map<string, INoteData[]>(),
  resources: new Map<string, IResourceData[]>(),
};

// Seed initial memory store
const seedMemory = () => {
  const sample: ILiveClassData = {
    id: 'class_linux_101_live',
    classId: 'class_linux_101_live',
    courseId: 'course_linux_101',
    courseName: 'Linux Kernel & System Architecture',
    instructorId: 'inst_kaizen',
    instructorName: 'Prof. Manoj Acharya',
    title: 'Linux Kernel Monolithic Architecture & Memory Management',
    description: 'Deep dive into virtual memory management, page tables, and process schedulers.',
    startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    duration: 90,
    status: 'live',
    meetingProvider: 'jitsi',
    meetingRoomId: 'kaizenq-linux-kernel-101',
    meetingUrl: 'https://meet.jit.si/kaizenq-linux-kernel-101',
    recordingUrl: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  memoryDb.liveClasses.set(sample.id, sample);
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
      title: data.title || 'Live Classroom Session',
      description: data.description || '',
      scheduledAt: data.scheduledAt || data.startTime || now,
      startTime: data.startTime || now,
      endTime: data.endTime,
      duration: data.duration || 60,
      status: (data.status as any) || 'scheduled',
      meetingProvider: data.meetingProvider || 'jitsi',
      meetingRoomId: data.meetingRoomId || `kaizenq-room-${Date.now().toString().slice(-4)}`,
      meetingUrl: data.meetingUrl || `https://meet.jit.si/kaizenq-room-${Date.now().toString().slice(-4)}`,
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
}

export const liveClassroomRepository = new LiveClassroomRepository();
