import { isMongoConnected } from '../../config/mongo';
import {
  LiveClass,
  Participant,
  Attendance,
  LiveQuiz,
  LiveQuizResponse,
  LivePoll,
  LiveChatMessage,
  LiveNotification,
  LiveAIReport,
  ILiveClass,
  IParticipant,
  IAttendance,
  ILiveQuiz,
  ILiveQuizResponse,
  ILivePoll,
  ILiveChatMessage,
  ILiveAIReport,
} from '../../models/mongo/liveClassroom.model';
import { db } from '../../firebase';
import logger from '../../config/logger';

// Local In-Memory database fallback store
const memoryDb = {
  liveClasses: new Map<string, any>(),
  participants: new Map<string, any[]>(),
  attendance: new Map<string, any[]>(),
  quizzes: new Map<string, any[]>(),
  quizResponses: new Map<string, any[]>(),
  polls: new Map<string, any[]>(),
  chatMessages: new Map<string, any[]>(),
  notifications: new Map<string, any[]>(),
  aiReports: new Map<string, any>(),
};

// Seed sample live classes into in-memory store
const seedMemoryDb = () => {
  const now = new Date();
  const sampleClasses = [
    {
      id: 'class_linux_kernel_1',
      title: 'Linux Kernel Monolithic Architecture & Memory Management',
      courseId: 'course_linux_kernel',
      courseName: 'Advanced Linux Kernel Engineering',
      moduleName: 'Module 1: Kernel Core Architecture',
      instructorId: 'inst_kaizen',
      instructorName: 'Prof. Manoj Acharya',
      status: 'running',
      scheduledTime: new Date(now.getTime() - 30 * 60 * 1000),
      startTime: new Date(now.getTime() - 30 * 60 * 1000),
      chatEnabled: true,
      quizEnabled: true,
      pollEnabled: true,
      locked: false,
    },
    {
      id: 'class_linux_sys_2',
      title: 'Advanced System Calls & Concurrency Primitives',
      courseId: 'course_linux_systems',
      courseName: 'Linux Systems & Kernel Administration',
      moduleName: 'Module 2: Multithreading & POSIX',
      instructorId: 'inst_kaizen',
      instructorName: 'Prof. Manoj Acharya',
      status: 'scheduled',
      scheduledTime: new Date(now.getTime() + 2 * 60 * 60 * 1000),
      chatEnabled: true,
      quizEnabled: true,
      pollEnabled: true,
      locked: false,
    },
  ];
  sampleClasses.forEach((c) => memoryDb.liveClasses.set(c.id, c));
};

seedMemoryDb();

export class LiveClassroomRepository {
  // --- 1. Live Class Operations ---
  public async createLiveClass(data: any): Promise<any> {
    const classId = data.id || `class_${Date.now()}`;
    const payload = { ...data, id: classId, status: data.status || 'scheduled' };

    if (isMongoConnected) {
      try {
        const doc = new LiveClass(payload);
        const saved = await doc.save();
        return saved.toObject();
      } catch (err: any) {
        logger.error('[REPO] Failed to create live class in Mongo:', err);
      }
    }

    // Fallback
    memoryDb.liveClasses.set(classId, payload);
    return payload;
  }

  public async updateLiveClass(id: string, data: any): Promise<any> {
    if (isMongoConnected) {
      try {
        const updated = await LiveClass.findOneAndUpdate({ id }, data, { new: true });
        if (updated) return updated.toObject();
        const updatedById = await LiveClass.findByIdAndUpdate(id, data, { new: true });
        if (updatedById) return updatedById.toObject();
      } catch (err: any) {
        logger.error('[REPO] Failed to update live class in Mongo:', err);
      }
    }

    // Fallback
    const existing = memoryDb.liveClasses.get(id);
    if (existing) {
      const updatedPayload = { ...existing, ...data };
      memoryDb.liveClasses.set(id, updatedPayload);
      return updatedPayload;
    }
    return null;
  }

  public async getLiveClassById(id: string): Promise<any> {
    if (isMongoConnected) {
      try {
        const found = await LiveClass.findOne({ id });
        if (found) return found.toObject();
        const foundById = await LiveClass.findById(id);
        if (foundById) return foundById.toObject();
      } catch (err: any) {
        logger.error('[REPO] Failed to fetch live class in Mongo:', err);
      }
    }

    // Fallback
    return memoryDb.liveClasses.get(id) || null;
  }

  public async deleteLiveClass(id: string): Promise<boolean> {
    if (isMongoConnected) {
      try {
        const res = await LiveClass.findOneAndDelete({ id });
        if (res) return true;
        const resById = await LiveClass.findByIdAndDelete(id);
        if (resById) return true;
      } catch (err: any) {
        logger.error('[REPO] Failed to delete live class in Mongo:', err);
      }
    }

    // Fallback
    return memoryDb.liveClasses.delete(id);
  }

  public async getAllLiveClasses(): Promise<any[]> {
    if (isMongoConnected) {
      try {
        const docs = await LiveClass.find().sort({ scheduledTime: 1 });
        return docs.map(d => d.toObject());
      } catch (err: any) {
        logger.error('[REPO] Failed to fetch all live classes in Mongo:', err);
      }
    }

    // Fallback
    return Array.from(memoryDb.liveClasses.values());
  }

  // --- 2. Live Quiz Operations ---
  public async createLiveQuiz(data: any): Promise<any> {
    const quizId = data.id || `quiz_${Date.now()}`;
    const payload = { ...data, id: quizId, active: true, publishedAt: new Date() };

    if (isMongoConnected) {
      try {
        const doc = new LiveQuiz(payload);
        const saved = await doc.save();
        return saved.toObject();
      } catch (err: any) {
        logger.error('[REPO] Failed to create live quiz in Mongo:', err);
      }
    }

    // Fallback
    const existing = memoryDb.quizzes.get(payload.classId) || [];
    existing.push(payload);
    memoryDb.quizzes.set(payload.classId, existing);
    return payload;
  }

  public async getActiveQuiz(classId: string): Promise<any> {
    if (isMongoConnected) {
      try {
        const found = await LiveQuiz.findOne({ classId, active: true }).sort({ publishedAt: -1 });
        if (found) return found.toObject();
      } catch (err: any) {
        logger.error('[REPO] Failed to get active quiz in Mongo:', err);
      }
    }

    const quizzes = memoryDb.quizzes.get(classId) || [];
    return quizzes.find(q => q.active) || null;
  }

  public async submitQuizResponse(data: any): Promise<any> {
    const responseId = `resp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const payload = { ...data, id: responseId, submittedAt: new Date() };

    if (isMongoConnected) {
      try {
        const doc = new LiveQuizResponse(payload);
        const saved = await doc.save();
        return saved.toObject();
      } catch (err: any) {
        logger.error('[REPO] Failed to save quiz response in Mongo:', err);
      }
    }

    // Fallback
    const existing = memoryDb.quizResponses.get(payload.quizId) || [];
    existing.push(payload);
    memoryDb.quizResponses.set(payload.quizId, existing);
    return payload;
  }

  public async getQuizResponses(quizId: string): Promise<any[]> {
    if (isMongoConnected) {
      try {
        const docs = await LiveQuizResponse.find({ quizId }).sort({ submittedAt: 1 });
        return docs.map(d => d.toObject());
      } catch (err: any) {
        logger.error('[REPO] Failed to get quiz responses in Mongo:', err);
      }
    }

    return memoryDb.quizResponses.get(quizId) || [];
  }

  // --- 3. Live Poll Operations ---
  public async createLivePoll(data: any): Promise<any> {
    const pollId = data.id || `poll_${Date.now()}`;
    const payload = { ...data, id: pollId, active: true };

    if (isMongoConnected) {
      try {
        const doc = new LivePoll(payload);
        const saved = await doc.save();
        return saved.toObject();
      } catch (err: any) {
        logger.error('[REPO] Failed to create live poll in Mongo:', err);
      }
    }

    // Fallback
    const existing = memoryDb.polls.get(payload.classId) || [];
    existing.push(payload);
    memoryDb.polls.set(payload.classId, existing);
    return payload;
  }

  public async submitPollVote(pollId: string, optionIndex: number, userId: string): Promise<any> {
    if (isMongoConnected) {
      try {
        const poll = await LivePoll.findById(pollId);
        if (poll && poll.options[optionIndex]) {
          // Check if user already voted and remove previous vote
          poll.options.forEach(opt => {
            opt.votes = opt.votes.filter(uid => uid !== userId);
          });
          poll.options[optionIndex].votes.push(userId);
          const saved = await poll.save();
          return saved.toObject();
        }
      } catch (err: any) {
        logger.error('[REPO] Failed to submit poll vote in Mongo:', err);
      }
    }

    // Fallback search in memoryDb
    let foundPoll: any = null;
    let classIdMatch = '';
    for (const [classId, list] of memoryDb.polls.entries()) {
      const match = list.find((p: any) => p.id === pollId || p._id?.toString() === pollId);
      if (match) {
        foundPoll = match;
        classIdMatch = classId;
        break;
      }
    }

    if (foundPoll) {
      foundPoll.options.forEach((opt: any) => {
        opt.votes = opt.votes.filter((uid: string) => uid !== userId);
      });
      if (foundPoll.options[optionIndex]) {
        foundPoll.options[optionIndex].votes.push(userId);
      }
      memoryDb.polls.set(classIdMatch, [...(memoryDb.polls.get(classIdMatch) || [])]);
      return foundPoll;
    }
    return null;
  }

  // --- 4. Live Chat Operations ---
  public async saveChatMessage(data: any): Promise<any> {
    const msgId = `msg_${Date.now()}`;
    const payload = { ...data, id: msgId, createdAt: new Date() };

    if (isMongoConnected) {
      try {
        const doc = new LiveChatMessage(payload);
        const saved = await doc.save();
        return saved.toObject();
      } catch (err: any) {
        logger.error('[REPO] Failed to save chat message in Mongo:', err);
      }
    }

    // Fallback
    const existing = memoryDb.chatMessages.get(payload.classId) || [];
    existing.push(payload);
    memoryDb.chatMessages.set(payload.classId, existing);
    return payload;
  }

  public async getChatMessages(classId: string): Promise<any[]> {
    if (isMongoConnected) {
      try {
        const docs = await LiveChatMessage.find({ classId }).sort({ createdAt: 1 });
        return docs.map(d => d.toObject());
      } catch (err: any) {
        logger.error('[REPO] Failed to fetch chat messages in Mongo:', err);
      }
    }

    return memoryDb.chatMessages.get(classId) || [];
  }

  // --- 5. Attendance & Participants Operations ---
  public async recordAttendance(data: any): Promise<any> {
    if (isMongoConnected) {
      try {
        const doc = new Attendance(data);
        const saved = await doc.save();
        return saved.toObject();
      } catch (err: any) {
        logger.error('[REPO] Failed to save attendance in Mongo:', err);
      }
    }

    // Fallback
    const existing = memoryDb.attendance.get(data.classId) || [];
    existing.push(data);
    memoryDb.attendance.set(data.classId, existing);
    return data;
  }

  public async getAttendanceReport(classId: string): Promise<any[]> {
    if (isMongoConnected) {
      try {
        const docs = await Attendance.find({ classId });
        return docs.map(d => d.toObject());
      } catch (err: any) {
        logger.error('[REPO] Failed to fetch attendance report in Mongo:', err);
      }
    }

    return memoryDb.attendance.get(classId) || [];
  }

  // --- 6. AI Insights Reports ---
  public async saveAIReport(data: any): Promise<any> {
    if (isMongoConnected) {
      try {
        const doc = new LiveAIReport(data);
        const saved = await doc.save();
        return saved.toObject();
      } catch (err: any) {
        logger.error('[REPO] Failed to save AI report in Mongo:', err);
      }
    }

    // Fallback
    memoryDb.aiReports.set(data.classId, data);
    return data;
  }

  public async getAIReport(classId: string): Promise<any> {
    if (isMongoConnected) {
      try {
        const found = await LiveAIReport.findOne({ classId }).sort({ createdAt: -1 });
        if (found) return found.toObject();
      } catch (err: any) {
        logger.error('[REPO] Failed to fetch AI report in Mongo:', err);
      }
    }

    return memoryDb.aiReports.get(classId) || null;
  }
}
export const liveClassroomRepository = new LiveClassroomRepository();
