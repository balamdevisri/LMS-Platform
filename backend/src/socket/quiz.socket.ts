import { Server as SocketServer } from 'socket.io';
import { AuthenticatedSocket } from './socket.auth';
import logger from '../config/logger';

interface LiveQuizItem {
  id: string;
  liveClassId: string;
  title: string;
  question: string;
  options: string[];
  correctAnswer: string; // Concealed from students
  marks: number;
  timerSeconds: number;
  status: 'ACTIVE' | 'ENDED';
  createdAt: string;
  submissions: Map<string, { studentId: string; studentName: string; answer: string; isCorrect: boolean; score: number; submittedAt: string }>;
}

// In-memory active live quizzes: liveClassId -> LiveQuizItem
const activeQuizzesMap = new Map<string, LiveQuizItem>();

export const registerQuizHandlers = (io: SocketServer, socket: AuthenticatedSocket) => {
  // 1. Instructor Starts Quiz
  socket.on(
    'quiz:start',
    (
      data: {
        liveClassId: string;
        title?: string;
        question: string;
        options: string[];
        correctAnswer: string;
        marks?: number;
        timerSeconds?: number;
      },
      callback?: (res: any) => void
    ) => {
      try {
        const user = socket.user;
        if (!user || (user.role !== 'admin' && user.role !== 'instructor')) {
          const err = { success: false, error: 'INVALID_PERMISSION', message: 'Only instructors can launch live quizzes' };
          socket.emit('quiz:error', err);
          if (callback) callback(err);
          return;
        }

        const { liveClassId, question, options, correctAnswer, timerSeconds = 30, marks = 10 } = data;
        if (!liveClassId || !question || !Array.isArray(options) || options.length < 2 || !correctAnswer) {
          const err = { success: false, error: 'INVALID_PAYLOAD', message: 'Valid question, options, and correctAnswer required' };
          socket.emit('quiz:error', err);
          if (callback) callback(err);
          return;
        }

        const quizId = `quiz_${Date.now()}`;
        const newQuiz: LiveQuizItem = {
          id: quizId,
          liveClassId,
          title: data.title || 'Live Concept Check',
          question: question.trim(),
          options: options.map((opt) => opt.trim()),
          correctAnswer: correctAnswer.trim(),
          marks,
          timerSeconds,
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          submissions: new Map(),
        };

        activeQuizzesMap.set(liveClassId, newQuiz);

        const roomName = `live-class:${liveClassId}`;
        logger.info(`[QUIZ] Launched quiz ${quizId} in ${roomName}`);

        // Broadcast quiz WITHOUT correct answer to room
        io.to(roomName).emit('quiz:start', {
          id: newQuiz.id,
          liveClassId: newQuiz.liveClassId,
          title: newQuiz.title,
          question: newQuiz.question,
          options: newQuiz.options, // Options only! Correct answer is withheld.
          marks: newQuiz.marks,
          timerSeconds: newQuiz.timerSeconds,
          status: 'ACTIVE',
          createdAt: newQuiz.createdAt,
        });

        if (callback) callback({ success: true, quizId });
      } catch (err: any) {
        if (callback) callback({ success: false, error: err.message });
      }
    }
  );

  // 2. Student Submits Answer
  socket.on(
    'quiz:submit',
    (
      data: { liveClassId: string; quizId: string; answer: string },
      callback?: (res: any) => void
    ) => {
      try {
        const user = socket.user;
        const liveClassId = data?.liveClassId;

        if (!user || !liveClassId) {
          const err = { success: false, error: 'UNAUTHORIZED_SOCKET' };
          socket.emit('quiz:error', err);
          if (callback) callback(err);
          return;
        }

        const activeQuiz = activeQuizzesMap.get(liveClassId);
        if (!activeQuiz || activeQuiz.id !== data.quizId || activeQuiz.status !== 'ACTIVE') {
          const err = { success: false, error: 'QUIZ_NOT_ACTIVE', message: 'Quiz is no longer active' };
          socket.emit('quiz:error', err);
          if (callback) callback(err);
          return;
        }

        const userId = user.uid || user.id;
        if (activeQuiz.submissions.has(userId)) {
          const err = { success: false, error: 'ALREADY_SUBMITTED', message: 'You have already submitted an answer for this quiz' };
          socket.emit('quiz:error', err);
          if (callback) callback(err);
          return;
        }

        const studentAnswer = (data.answer || '').trim();
        // Server-Side Verification: Compare against stored correctAnswer
        const isCorrect = studentAnswer.toLowerCase() === activeQuiz.correctAnswer.toLowerCase();
        const score = isCorrect ? activeQuiz.marks : 0;

        activeQuiz.submissions.set(userId, {
          studentId: userId,
          studentName: user.name || 'Student',
          answer: studentAnswer,
          isCorrect,
          score,
          submittedAt: new Date().toISOString(),
        });

        logger.info(`[QUIZ] Submission received from ${user.name}: Correct? ${isCorrect}`);

        if (callback) {
          callback({
            success: true,
            message: 'Answer recorded server-side',
            submittedAt: new Date().toISOString(),
          });
        }
      } catch (err: any) {
        if (callback) callback({ success: false, error: err.message });
      }
    }
  );

  // 3. Instructor Ends Quiz & Broadcasts Results with Correct Answer
  socket.on(
    'quiz:end',
    (data: { liveClassId: string; quizId: string }, callback?: (res: any) => void) => {
      try {
        const user = socket.user;
        if (!user || (user.role !== 'admin' && user.role !== 'instructor')) {
          if (callback) callback({ success: false, error: 'INVALID_PERMISSION' });
          return;
        }

        const { liveClassId } = data;
        const activeQuiz = activeQuizzesMap.get(liveClassId);
        if (activeQuiz) {
          activeQuiz.status = 'ENDED';

          const totalSubmissions = activeQuiz.submissions.size;
          const correctCount = Array.from(activeQuiz.submissions.values()).filter((s) => s.isCorrect).length;
          const accuracyPercentage = totalSubmissions > 0 ? Math.round((correctCount / totalSubmissions) * 100) : 0;

          const roomName = `live-class:${liveClassId}`;

          // Broadcast final result with revealed correct answer
          io.to(roomName).emit('quiz:result', {
            quizId: activeQuiz.id,
            liveClassId,
            correctAnswer: activeQuiz.correctAnswer, // Now safely revealed
            totalSubmissions,
            correctCount,
            accuracyPercentage,
            status: 'ENDED',
          });
        }

        if (callback) callback({ success: true });
      } catch (err: any) {
        if (callback) callback({ success: false, error: err.message });
      }
    }
  );

  // 4. Compatibility Aliases for Legacy LiveQuizWidget
  socket.on(
    'publish_quiz',
    async (data: {
      classId?: string;
      liveClassId?: string;
      question: string;
      options: string[];
      correctAnswer?: string;
      marks?: number;
      timerSeconds?: number;
      title?: string;
    }) => {
      const liveClassId = data.liveClassId || data.classId;
      if (!liveClassId) return;

      const user = socket.user;
      if (!user || (user.role !== 'admin' && user.role !== 'instructor')) return;

      const quizId = `quiz_${Date.now()}`;
      const newQuiz: LiveQuizItem = {
        id: quizId,
        liveClassId,
        title: data.title || 'Live Concept Check',
        question: (data.question || '').trim(),
        options: (data.options || []).map((opt) => (typeof opt === 'string' ? opt.trim() : (opt as any).text || 'Option')),
        correctAnswer: (data.correctAnswer || (data.options && data.options[0]) || '').trim(),
        marks: data.marks || 10,
        timerSeconds: data.timerSeconds || 30,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        submissions: new Map(),
      };

      activeQuizzesMap.set(liveClassId, newQuiz);

      const roomName = `live-class:${liveClassId}`;
      const broadcastPayload = {
        id: newQuiz.id,
        classId: newQuiz.liveClassId,
        liveClassId: newQuiz.liveClassId,
        title: newQuiz.title,
        question: newQuiz.question,
        options: newQuiz.options,
        marks: newQuiz.marks,
        timerSeconds: newQuiz.timerSeconds,
        status: 'ACTIVE',
      };

      io.to(roomName).emit('quiz:start', broadcastPayload);
      io.to(roomName).emit('quiz_published', broadcastPayload);
    }
  );

  socket.on(
    'submit_quiz',
    async (data: {
      classId?: string;
      liveClassId?: string;
      quizId: string;
      answer: string;
      timeTakenSeconds?: number;
    }) => {
      const liveClassId = data.liveClassId || data.classId;
      if (!liveClassId) return;

      const user = socket.user;
      if (!user) return;

      const activeQuiz = activeQuizzesMap.get(liveClassId);
      if (!activeQuiz || activeQuiz.id !== data.quizId || activeQuiz.status !== 'ACTIVE') return;

      const userId = user.uid || user.id;
      if (activeQuiz.submissions.has(userId)) return;

      const studentAnswer = (data.answer || '').trim();
      const isCorrect = studentAnswer.toLowerCase() === activeQuiz.correctAnswer.toLowerCase();
      const score = isCorrect ? activeQuiz.marks : 0;

      const submission = {
        studentId: userId,
        studentName: user.name || 'Student',
        answer: studentAnswer,
        isCorrect,
        score,
        submittedAt: new Date().toISOString(),
      };

      activeQuiz.submissions.set(userId, submission);

      const roomName = `live-class:${liveClassId}`;
      io.to(roomName).emit('quiz_submission_update', {
        quizId: activeQuiz.id,
        studentId: userId,
        studentName: user.name,
        isCorrect,
        score,
      });

      const responses = Array.from(activeQuiz.submissions.values());
      const leaderboard = responses
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .map((r, idx) => ({
          rank: idx + 1,
          studentName: r.studentName,
          isCorrect: r.isCorrect,
          score: r.score,
        }));

      io.to(roomName).emit('leaderboard_update', leaderboard);
    }
  );
};
