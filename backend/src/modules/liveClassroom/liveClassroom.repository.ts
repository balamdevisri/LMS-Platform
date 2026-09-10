import { db, isFirebaseAdminInitialized } from '../../firebase';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
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
  status: 'scheduled' | 'live' | 'ended' | 'cancelled' | 'Scheduled' | 'Live' | 'Completed' | 'Cancelled' | 'Draft' | 'SCHEDULED' | 'LIVE' | 'ENDED' | 'CANCELLED' | 'COMPLETED';
  mode?: 'interactive' | 'youtube';
  meetingProvider?: 'kaizenq' | 'google_meet' | 'zoom' | 'teams' | 'youtube';
  meetingRoomId?: string;
  meetingUrl: string;
  recordingUrl?: string;
  recordingStatus?: 'NOT_AVAILABLE' | 'RECORDING' | 'PROCESSING' | 'READY' | 'FAILED';
  recordingDuration?: number;
  notesUrl?: string;
  maxParticipants?: number;
  isRecordingEnabled?: boolean;
  isQuizEnabled?: boolean;
  isPollEnabled?: boolean;
  isChatEnabled?: boolean;
  isAttendanceEnabled?: boolean;
  attendanceSummary?: IAttendanceSummary;
  resourceDownloadEnabled?: boolean;
  certificateEligible?: boolean;
  tags?: string[];
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IAttendanceSessionInterval {
  joinedAt: string;
  leftAt?: string;
  durationSeconds?: number;
}

export interface IAttendanceSummary {
  totalAttendees: number;
  totalPresent: number;
  totalLate: number;
  totalAbsent: number;
  averageDurationMinutes: number;
  attendanceRate: number;
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
  sessions?: IAttendanceSessionInterval[];
  status: 'present' | 'late' | 'absent' | 'JOINED' | 'LEFT' | 'COMPLETED';
  attendancePercentage?: number;
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

// Seed initial memory store (demo live classes removed; only live sessions created dynamically are served)
const seedMemory = () => {
  // Empty seed - no mock/demo classes
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
      mode: (data as any).mode || (data.youtubeVideoId ? 'youtube' : 'interactive'),
      meetingProvider: data.meetingProvider || ((data as any).mode === 'youtube' || data.youtubeVideoId ? 'youtube' : 'kaizenq'),
      meetingRoomId: data.meetingRoomId || `live-class:${classId}`,
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
    if (!id) return null;
    if (isFirebaseAdminInitialized()) {
      try {
        const snap = await db.collection('liveClasses').doc(id).get();
        if (snap.exists) {
          return { ...snap.data(), id: snap.id, classId: snap.data()?.classId || snap.id } as ILiveClassData;
        }

        // Fallback: search by classId property
        const qSnap = await db.collection('liveClasses').where('classId', '==', id).limit(1).get().catch(() => null);
        if (qSnap && !qSnap.empty) {
          const doc = qSnap.docs[0];
          return { ...doc.data(), id: doc.id, classId: doc.data()?.classId || doc.id } as ILiveClassData;
        }

        // Fallback: search by id property
        const idSnap = await db.collection('liveClasses').where('id', '==', id).limit(1).get().catch(() => null);
        if (idSnap && !idSnap.empty) {
          const doc = idSnap.docs[0];
          return { ...doc.data(), id: doc.id, classId: doc.data()?.classId || doc.id } as ILiveClassData;
        }
      } catch (err) {
        logger.error('[REPO] Failed to fetch liveClass from Firestore:', err);
      }
    }
    // Check in-memory store
    if (memoryDb.liveClasses.has(id)) {
      return memoryDb.liveClasses.get(id) || null;
    }
    for (const item of memoryDb.liveClasses.values()) {
      if (item.classId === id || item.id === id) {
        return item;
      }
    }
    return null;
  }

  public async deleteLiveClass(id: string): Promise<boolean> {
    if (isFirebaseAdminInitialized()) {
      try {
        await db.collection('liveClasses').doc(id).delete();
        const snap = await db.collection('liveClasses').where('classId', '==', id).get().catch(() => null);
        if (snap && !snap.empty) {
          for (const doc of snap.docs) {
            await doc.ref.delete().catch(() => null);
          }
        }
      } catch (err) {
        logger.error('[REPO] Failed to delete liveClass in Firestore:', err);
      }
    }
    return memoryDb.liveClasses.delete(id);
  }

  public async getAllLiveClasses(): Promise<ILiveClassData[]> {
    const classMap = new Map<string, ILiveClassData>();

    // 1. First populate from memoryDb
    for (const [id, item] of memoryDb.liveClasses.entries()) {
      const cid = item.id || item.classId || id;
      classMap.set(cid, { ...item, id: cid, classId: cid });
    }

    // 2. Fetch all from Firestore via Admin SDK
    if (isFirebaseAdminInitialized()) {
      try {
        const snap = await db.collection('liveClasses').get();
        if (!snap.empty) {
          snap.docs.forEach((docSnap: any) => {
            const data = docSnap.data() as ILiveClassData;
            const cid = docSnap.id || data.id || data.classId;
            const mergedItem = { ...data, id: cid, classId: cid };
            classMap.set(cid, mergedItem);
            memoryDb.liveClasses.set(cid, mergedItem);
          });
        }
      } catch (err) {
        logger.error('[REPO] Failed to fetch all liveClasses from Firestore:', err);
      }
    }

    return Array.from(classMap.values()).sort(
      (a, b) => new Date(b.startTime || b.scheduledAt || 0).getTime() - new Date(a.startTime || a.scheduledAt || 0).getTime()
    );
  }

  // --- 2. Attendance Operations ---

  public async recordJoinAttendance(classId: string, studentId: string, studentName: string, studentEmail: string): Promise<IAttendanceData> {
    const now = new Date().toISOString();
    const docId = `${classId}_${studentId}`;

    let record: IAttendanceData = {
      id: docId,
      classId,
      studentId,
      studentName,
      studentEmail,
      joinedAt: now,
      sessions: [{ joinedAt: now }],
      status: 'JOINED',
      durationMinutes: 0,
      durationSeconds: 0,
    };

    if (isFirebaseAdminInitialized()) {
      try {
        const docRef = db.collection('liveClasses').doc(classId).collection('attendance').doc(studentId);
        const snap = await docRef.get();
        if (snap.exists) {
          const existing = snap.data() as IAttendanceData;
          const existingSessions = existing.sessions || [];
          
          // Reconnection: preserve original joinedAt and append new open session interval
          const updatedSessions: IAttendanceSessionInterval[] = [
            ...existingSessions,
            { joinedAt: now }
          ];

          record = {
            ...existing,
            studentName: studentName || existing.studentName,
            studentEmail: studentEmail || existing.studentEmail,
            sessions: updatedSessions,
            status: 'JOINED',
          };
        }
        await docRef.set(record, { merge: true });
      } catch (err) {
        logger.error('[REPO] Failed to record join attendance in Firestore:', err);
      }
    }

    const currentList = memoryDb.attendance.get(classId) || [];
    const idx = currentList.findIndex((a) => a.studentId === studentId);
    if (idx >= 0) {
      const existing = currentList[idx];
      const existingSessions = existing.sessions || [];
      const updatedSessions: IAttendanceSessionInterval[] = [
        ...existingSessions,
        { joinedAt: now }
      ];
      record = {
        ...existing,
        studentName: studentName || existing.studentName,
        studentEmail: studentEmail || existing.studentEmail,
        sessions: updatedSessions,
        status: 'JOINED',
      };
      currentList[idx] = record;
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
          const sessions = existing.sessions || [{ joinedAt: existing.joinedAt }];

          // Close the latest session if not already closed
          if (sessions.length > 0) {
            const lastSession = sessions[sessions.length - 1];
            if (!lastSession.leftAt) {
              lastSession.leftAt = now;
              lastSession.durationSeconds = Math.max(1, Math.round((new Date(now).getTime() - new Date(lastSession.joinedAt).getTime()) / 1000));
            }
          }

          // Compute aggregated total duration across all session intervals
          const totalSecs = sessions.reduce((sum, s) => sum + (s.durationSeconds || 0), 0);
          const durationMins = Math.round(totalSecs / 60);

          record = {
            ...existing,
            leftAt: now,
            sessions,
            durationSeconds: totalSecs,
            durationMinutes: durationMins,
            status: 'LEFT',
          };
          await docRef.set(record, { merge: true });
        }
      } catch (err) {
        logger.error('[REPO] Failed to record leave attendance in Firestore:', err);
      }
    }

    const currentList = memoryDb.attendance.get(classId) || [];
    const idx = currentList.findIndex((a) => a.studentId === studentId);
    if (idx >= 0) {
      const existing = currentList[idx];
      const sessions = existing.sessions || [{ joinedAt: existing.joinedAt }];

      if (sessions.length > 0) {
        const lastSession = sessions[sessions.length - 1];
        if (!lastSession.leftAt) {
          lastSession.leftAt = now;
          lastSession.durationSeconds = Math.max(1, Math.round((new Date(now).getTime() - new Date(lastSession.joinedAt).getTime()) / 1000));
        }
      }

      const totalSecs = sessions.reduce((sum, s) => sum + (s.durationSeconds || 0), 0);
      const durationMins = Math.round(totalSecs / 60);

      record = {
        ...existing,
        leftAt: now,
        sessions,
        durationSeconds: totalSecs,
        durationMinutes: durationMins,
        status: 'LEFT',
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
          return snap.docs.map((d: QueryDocumentSnapshot) => d.data() as IAttendanceData);
        }
      } catch (err) {
        logger.error('[REPO] Failed to get attendance from Firestore:', err);
      }
    }
    return memoryDb.attendance.get(classId) || [];
  }

  public async getStudentAttendance(classId: string, studentId: string): Promise<IAttendanceData | null> {
    if (isFirebaseAdminInitialized()) {
      try {
        const doc = await db.collection('liveClasses').doc(classId).collection('attendance').doc(studentId).get();
        if (doc.exists) {
          return doc.data() as IAttendanceData;
        }
      } catch (err) {
        logger.error('[REPO] Failed to get student attendance from Firestore:', err);
      }
    }
    const list = memoryDb.attendance.get(classId) || [];
    return list.find((a) => a.studentId === studentId) || null;
  }

  public async finalizeClassAttendance(
    classId: string,
    classStartTime?: string,
    classDurationMinutes: number = 60
  ): Promise<{ attendance: IAttendanceData[]; summary: IAttendanceSummary }> {
    const now = new Date().toISOString();
    const records = await this.getAttendanceReport(classId);

    const finalizedRecords: IAttendanceData[] = [];
    const classStartMs = classStartTime ? new Date(classStartTime).getTime() : Date.now() - (classDurationMinutes * 60000);

    for (const rec of records) {
      const sessions = rec.sessions || [{ joinedAt: rec.joinedAt }];
      
      // Close any session still open
      for (const s of sessions) {
        if (!s.leftAt) {
          s.leftAt = now;
          s.durationSeconds = Math.max(1, Math.round((new Date(now).getTime() - new Date(s.joinedAt).getTime()) / 1000));
        }
      }

      const totalSecs = sessions.reduce((sum, s) => sum + (s.durationSeconds || 0), 0);
      const totalMins = Math.round(totalSecs / 60);

      // Percentage of class attended
      const percent = Math.min(100, Math.round((totalMins / Math.max(1, classDurationMinutes)) * 100));

      // Threshold evaluation:
      // - Joined > 15 mins late -> late
      // - Attended < 10% -> absent
      // - Attended >= 50% -> present / COMPLETED
      const firstJoinMs = new Date(rec.joinedAt).getTime();
      const joinedLate = (firstJoinMs - classStartMs) > (15 * 60 * 1000);

      let status: 'present' | 'late' | 'absent' = 'present';
      if (percent < 10) {
        status = 'absent';
      } else if (joinedLate) {
        status = 'late';
      } else {
        status = 'present';
      }

      const updated: IAttendanceData = {
        ...rec,
        leftAt: rec.leftAt || now,
        sessions,
        durationSeconds: totalSecs,
        durationMinutes: totalMins,
        attendancePercentage: percent,
        status,
      };

      finalizedRecords.push(updated);

      // Update in Firestore
      if (isFirebaseAdminInitialized()) {
        try {
          await db.collection('liveClasses').doc(classId).collection('attendance').doc(rec.studentId).set(updated, { merge: true });
        } catch (e) {
          logger.warn('[REPO] Failed to persist finalized attendance item:', e);
        }
      }
    }

    // Update memory
    memoryDb.attendance.set(classId, finalizedRecords);

    // Compute aggregate summary
    const totalAttendees = finalizedRecords.length;
    const totalPresent = finalizedRecords.filter((r) => r.status === 'present').length;
    const totalLate = finalizedRecords.filter((r) => r.status === 'late').length;
    const totalAbsent = finalizedRecords.filter((r) => r.status === 'absent').length;
    const averageDurationMinutes = totalAttendees > 0
      ? Math.round(finalizedRecords.reduce((sum, r) => sum + (r.durationMinutes || 0), 0) / totalAttendees)
      : 0;
    const attendanceRate = totalAttendees > 0
      ? Math.round(((totalPresent + totalLate) / totalAttendees) * 100)
      : 0;

    const summary: IAttendanceSummary = {
      totalAttendees,
      totalPresent,
      totalLate,
      totalAbsent,
      averageDurationMinutes,
      attendanceRate,
    };

    // Save summary onto the liveClass document
    await this.updateLiveClass(classId, {
      attendanceSummary: summary,
    });

    return { attendance: finalizedRecords, summary };
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
          return snap.docs.map((d: QueryDocumentSnapshot) => d.data() as IChatMessageData);
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
          return snap.docs.map((d: QueryDocumentSnapshot) => d.data() as IQuestionData);
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
          return snap.docs.map((d: QueryDocumentSnapshot) => d.data() as IPollData);
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
          return snap.docs.map((d: QueryDocumentSnapshot) => d.data() as INoteData);
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
          return snap.docs.map((d: QueryDocumentSnapshot) => d.data() as IResourceData);
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
          return snap.docs.map((d: QueryDocumentSnapshot) => d.data() as IAnnouncementData);
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
          return snap.docs.map((d: QueryDocumentSnapshot) => d.data() as IQuizData);
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
