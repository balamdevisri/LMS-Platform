import { db } from '../../../firebase';
import { 
  LiveClass, 
  LiveStatus, 
  Attendance, 
  ChatMessage, 
  Question, 
  LiveNote, 
  Resource, 
  Poll, 
  Quiz, 
  QuizAttempt, 
  Recording, 
  Announcement, 
  Analytics 
} from '../types';

export class LiveClassRepository {
  private collectionName = 'liveClasses';

  // --- ROOT LIVE CLASS MANIPULATION ---
  async create(data: LiveClass): Promise<LiveClass> {
    if (!db) return data;
    await db.collection(this.collectionName).doc(data.classId).set(data);
    return data;
  }

  async findById(classId: string): Promise<LiveClass | null> {
    if (!db) return null;
    const doc = await db.collection(this.collectionName).doc(classId).get();
    return doc.exists ? (doc.data() as LiveClass) : null;
  }

  async update(classId: string, updates: Partial<LiveClass>): Promise<void> {
    if (!db) return;
    await db.collection(this.collectionName).doc(classId).update({
      ...updates,
      updatedAt: new Date().toISOString()
    });
  }

  async delete(classId: string): Promise<void> {
    if (!db) return;
    await db.collection(this.collectionName).doc(classId).delete();
  }

  async findUpcoming(): Promise<LiveClass[]> {
    if (!db) return [];
    const snapshot = await db.collection(this.collectionName)
      .where('status', 'in', [LiveStatus.Scheduled, LiveStatus.Live])
      .orderBy('startTime', 'asc')
      .get();
    return snapshot.docs.map((d: any) => d.data() as LiveClass);
  }

  async findByInstructor(instructorId: string): Promise<LiveClass[]> {
    if (!db) return [];
    const snapshot = await db.collection(this.collectionName)
      .where('instructorId', '==', instructorId)
      .orderBy('startTime', 'desc')
      .get();
    return snapshot.docs.map((d: any) => d.data() as LiveClass);
  }

  async findByCourse(courseId: string): Promise<LiveClass[]> {
    if (!db) return [];
    const snapshot = await db.collection(this.collectionName)
      .where('courseId', '==', courseId)
      .orderBy('startTime', 'desc')
      .get();
    return snapshot.docs.map((d: any) => d.data() as LiveClass);
  }

  // --- SUBCOLLECTION: ATTENDANCE ---
  async addAttendance(classId: string, attendance: Attendance): Promise<Attendance> {
    if (db) {
      await db.collection(this.collectionName)
        .doc(classId)
        .collection('attendance')
        .doc(attendance.attendanceId)
        .set(attendance);
    }
    return attendance;
  }

  // --- SUBCOLLECTION: CHAT ---
  async addChatMessage(classId: string, message: ChatMessage): Promise<ChatMessage> {
    if (db) {
      await db.collection(this.collectionName)
        .doc(classId)
        .collection('chat')
        .doc(message.messageId)
        .set(message);
    }
    return message;
  }

  // --- SUBCOLLECTION: QUESTIONS ---
  async addQuestion(classId: string, question: Question): Promise<Question> {
    if (db) {
      await db.collection(this.collectionName)
        .doc(classId)
        .collection('questions')
        .doc(question.questionId)
        .set(question);
    }
    return question;
  }

  // --- SUBCOLLECTION: NOTES ---
  async saveNote(classId: string, note: LiveNote): Promise<LiveNote> {
    if (db) {
      await db.collection(this.collectionName)
        .doc(classId)
        .collection('notes')
        .doc(note.noteId)
        .set(note);
    }
    return note;
  }

  // --- SUBCOLLECTION: RESOURCES ---
  async addResource(classId: string, resource: Resource): Promise<Resource> {
    if (db) {
      await db.collection(this.collectionName)
        .doc(classId)
        .collection('resources')
        .doc(resource.resourceId)
        .set(resource);
    }
    return resource;
  }

  // --- SUBCOLLECTION: POLLS ---
  async createPoll(classId: string, poll: Poll): Promise<Poll> {
    if (db) {
      await db.collection(this.collectionName)
        .doc(classId)
        .collection('polls')
        .doc(poll.pollId)
        .set(poll);
    }
    return poll;
  }

  // --- SUBCOLLECTION: QUIZZES ---
  async createQuiz(classId: string, quiz: Quiz): Promise<Quiz> {
    if (db) {
      await db.collection(this.collectionName)
        .doc(classId)
        .collection('quizzes')
        .doc(quiz.quizId)
        .set(quiz);
    }
    return quiz;
  }

  // --- SUBCOLLECTION: QUIZ ATTEMPTS ---
  async submitQuizAttempt(classId: string, attempt: QuizAttempt): Promise<QuizAttempt> {
    if (db) {
      await db.collection(this.collectionName)
        .doc(classId)
        .collection('quizAttempts')
        .doc(attempt.attemptId)
        .set(attempt);
    }
    return attempt;
  }

  // --- SUBCOLLECTION: RECORDINGS ---
  async addRecording(classId: string, recording: Recording): Promise<Recording> {
    if (db) {
      await db.collection(this.collectionName)
        .doc(classId)
        .collection('recordings')
        .doc(recording.recordingId)
        .set(recording);
    }
    return recording;
  }

  // --- SUBCOLLECTION: ANNOUNCEMENTS ---
  async addAnnouncement(classId: string, announcement: Announcement): Promise<Announcement> {
    if (db) {
      await db.collection(this.collectionName)
        .doc(classId)
        .collection('announcements')
        .doc(announcement.announcementId)
        .set(announcement);
    }
    return announcement;
  }

  // --- SUBCOLLECTION: ANALYTICS ---
  async updateAnalytics(classId: string, analytics: Analytics): Promise<Analytics> {
    if (db) {
      await db.collection(this.collectionName)
        .doc(classId)
        .collection('analytics')
        .doc(analytics.analyticsId)
        .set(analytics);
    }
    return analytics;
  }
}

export const liveClassRepository = new LiveClassRepository();
