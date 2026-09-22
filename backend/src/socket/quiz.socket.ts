import { Server as SocketServer } from 'socket.io';
import { AuthenticatedSocket } from './socket.auth';
import { canPerformClassroomAction } from '../modules/liveClassroom/permissions';
import logger from '../config/logger';

interface LiveQuizItem {
  id: string;
  liveClassId: string;
  title: string;
  question: string;
  options: string[];
  correctAnswer: string; // Concealed from students until quiz ends
  marks: number;
  timerSeconds: number;
  status: 'ACTIVE' | 'ENDED';
  createdAt: string;
  targetAudience?: 'all' | 'selected_batch' | 'selected_section' | 'restricted';
  targetBatch?: string;
  targetSection?: string;
  submissions: Map<
    string,
    {
      studentId: string;
      studentName: string;
      answer: string;
      isCorrect: boolean;
      score: number;
      timeTakenSeconds: number;
      submittedAt: string;
    }
  >;
}

// In-memory active live quizzes: liveClassId -> LiveQuizItem
const activeQuizzesMap = new Map<string, LiveQuizItem>();

export const registerQuizHandlers = (io: SocketServer, socket: AuthenticatedSocket) => {
  // Common Quiz Launch Function
  const launchQuiz = (
    liveClassId: string,
    question: string,
    options: any[],
    correctAnswer: string,
    marks: number = 10,
    timerSeconds: number = 30,
    title: string = 'Live Concept Check',
    callback?: (res: any) => void,
    targetAudience: 'all' | 'selected_batch' | 'selected_section' | 'restricted' = 'all',
    targetBatch?: string,
    targetSection?: string
  ) => {
    try {
      const user = socket.user;
      const allowed = user && canPerformClassroomAction('createQuiz', {
        userId: user.uid || user.id,
        role: user.role,
      });

      if (!allowed) {
        const err = { success: false, error: 'INVALID_PERMISSION', message: 'Only instructors can launch live quizzes' };
        socket.emit('quiz:error', err);
        if (callback) callback(err);
        return;
      }

      if (!liveClassId || !question || !Array.isArray(options) || options.length < 2) {
        const err = { success: false, error: 'INVALID_PAYLOAD', message: 'Valid question and options required' };
        socket.emit('quiz:error', err);
        if (callback) callback(err);
        return;
      }

      const formattedOptions = options.map((opt) => (typeof opt === 'string' ? opt.trim() : (opt as any).text || 'Option'));
      const effectiveCorrectAnswer = (correctAnswer || formattedOptions[0] || '').trim();
      const quizId = `quiz_${Date.now()}`;

      const newQuiz: LiveQuizItem = {
        id: quizId,
        liveClassId,
        title: title || 'Live Concept Check',
        question: question.trim(),
        options: formattedOptions,
        correctAnswer: effectiveCorrectAnswer,
        marks: marks || 10,
        timerSeconds: timerSeconds || 30,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        targetAudience,
        targetBatch,
        targetSection,
        submissions: new Map(),
      };

      activeQuizzesMap.set(liveClassId, newQuiz);

      const roomName = `live-class:${liveClassId}`;
      logger.info(`[QUIZ] Launched quiz ${quizId} in ${roomName}`);

      // Broadcast quiz WITHOUT correct answer to all students in room
      const broadcastPayload = {
        id: newQuiz.id,
        _id: newQuiz.id,
        classId: newQuiz.liveClassId,
        liveClassId: newQuiz.liveClassId,
        title: newQuiz.title,
        question: newQuiz.question,
        options: newQuiz.options, // Options only! Correct answer is securely withheld.
        marks: newQuiz.marks,
        timerSeconds: newQuiz.timerSeconds,
        status: 'ACTIVE',
        createdAt: newQuiz.createdAt,
      };

      io.to(roomName).emit('quiz:start', broadcastPayload);
      io.to(roomName).emit('quiz_published', broadcastPayload);

      if (callback) callback({ success: true, quizId });
    } catch (err: any) {
      if (callback) callback({ success: false, error: err.message });
    }
  };

  // Common Quiz Submit Function
  const recordSubmission = (
    liveClassId: string,
    quizId: string,
    answer: string,
    timeTakenSeconds?: number,
    callback?: (res: any) => void
  ) => {
    try {
      const user = socket.user;
      if (!user || !liveClassId) {
        const err = { success: false, error: 'UNAUTHORIZED_SOCKET' };
        socket.emit('quiz:error', err);
        if (callback) callback(err);
        return;
      }

      const activeQuiz = activeQuizzesMap.get(liveClassId);
      if (!activeQuiz || activeQuiz.id !== quizId || activeQuiz.status !== 'ACTIVE') {
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

      // Audience membership validation
      if (user.role === 'student') {
        if (activeQuiz.targetAudience === 'selected_batch' && activeQuiz.targetBatch) {
          const userBatch = String((user as any).batch || (user as any).cohort || '').toLowerCase().trim();
          const targetBatch = activeQuiz.targetBatch.toLowerCase().trim();
          if (userBatch && targetBatch && !userBatch.includes(targetBatch) && !targetBatch.includes(userBatch)) {
            const err = { success: false, error: 'AUDIENCE_RESTRICTED', message: 'This quiz is restricted to a different batch.' };
            socket.emit('quiz:error', err);
            if (callback) callback(err);
            return;
          }
        }
        if (activeQuiz.targetAudience === 'selected_section' && activeQuiz.targetSection) {
          const userSection = String((user as any).section || (user as any).branch || '').toLowerCase().trim();
          const targetSection = activeQuiz.targetSection.toLowerCase().trim();
          if (userSection && targetSection && !userSection.includes(targetSection) && !targetSection.includes(userSection)) {
            const err = { success: false, error: 'AUDIENCE_RESTRICTED', message: 'This quiz is restricted to a different section/branch.' };
            socket.emit('quiz:error', err);
            if (callback) callback(err);
            return;
          }
        }
      }

      const studentAnswer = (answer || '').trim();
      const isCorrect = studentAnswer.toLowerCase() === activeQuiz.correctAnswer.toLowerCase();
      const score = isCorrect ? activeQuiz.marks : 0;
      const speedSeconds = typeof timeTakenSeconds === 'number' && timeTakenSeconds > 0 ? timeTakenSeconds : 1;

      activeQuiz.submissions.set(userId, {
        studentId: userId,
        studentName: user.name || 'Student',
        answer: studentAnswer,
        isCorrect,
        score,
        timeTakenSeconds: speedSeconds,
        submittedAt: new Date().toISOString(),
      });

      logger.info(`[QUIZ] Submission from ${user.name} for ${quizId}: Correct? ${isCorrect} (${speedSeconds}s)`);

      const roomName = `live-class:${liveClassId}`;

      // Notify instructor & classroom
      io.to(roomName).emit('quiz_submission_update', {
        quizId: activeQuiz.id,
        userId,
        userName: user.name || 'Student',
        studentId: userId,
        studentName: user.name || 'Student',
        isCorrect,
        score,
        timeTakenSeconds: speedSeconds,
      });

      const responses = Array.from(activeQuiz.submissions.values());
      const totalAnswered = responses.length;
      const correctCount = responses.filter((r) => r.isCorrect).length;
      const wrongCount = totalAnswered - correctCount;
      const accuracyPercent = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
      const avgTime = totalAnswered > 0 ? Math.round(responses.reduce((acc, r) => acc + r.timeTakenSeconds, 0) / totalAnswered) : 0;

      io.to(roomName).emit('quiz:accuracy_update', {
        quizId: activeQuiz.id,
        totalAnswered,
        correct: correctCount,
        wrong: wrongCount,
        accuracyPercent,
        avgTime,
        studentResults: responses.map((r) => ({
          studentId: r.studentId,
          studentName: r.studentName,
          answer: r.answer,
          isCorrect: r.isCorrect,
          score: r.score,
          timeTakenSeconds: r.timeTakenSeconds,
        })),
      });

      // Update real-time speed leaderboard
      const leaderboard = responses
        .sort((a, b) => {
          if (b.score !== a.score) return (b.score || 0) - (a.score || 0);
          return a.timeTakenSeconds - b.timeTakenSeconds;
        })
        .map((r, idx) => ({
          rank: idx + 1,
          studentName: r.studentName,
          timeTaken: `${r.timeTakenSeconds}s`,
          isCorrect: r.isCorrect,
          score: r.score,
          xpEarned: r.score,
        }));

      io.to(roomName).emit('leaderboard_update', leaderboard);

      if (callback) {
        callback({
          success: true,
          message: 'Answer recorded server-side',
          isCorrect,
          score,
          submittedAt: new Date().toISOString(),
        });
      }
    } catch (err: any) {
      if (callback) callback({ success: false, error: err.message });
    }
  };

  // 1. Modern Quiz Start
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
        targetAudience?: 'all' | 'selected_batch' | 'selected_section' | 'restricted';
        targetBatch?: string;
        targetSection?: string;
      },
      callback?: (res: any) => void
    ) => {
      launchQuiz(
        data?.liveClassId,
        data?.question,
        data?.options,
        data?.correctAnswer,
        data?.marks,
        data?.timerSeconds,
        data?.title,
        callback,
        data?.targetAudience,
        data?.targetBatch,
        data?.targetSection
      );
    }
  );

  // 2. Legacy Quiz Publish Alias
  socket.on(
    'publish_quiz',
    (data: {
      classId?: string;
      liveClassId?: string;
      question: string;
      options: string[];
      correctAnswer?: string;
      marks?: number;
      timerSeconds?: number;
      title?: string;
    }, callback?: (res: any) => void) => {
      const classId = data.liveClassId || data.classId || '';
      launchQuiz(
        classId,
        data?.question,
        data?.options,
        data?.correctAnswer || '',
        data?.marks,
        data?.timerSeconds,
        data?.title,
        callback
      );
    }
  );

  // 3. Modern Quiz Submit
  socket.on(
    'quiz:submit',
    (
      data: { liveClassId: string; quizId: string; answer: string; timeTakenSeconds?: number },
      callback?: (res: any) => void
    ) => {
      recordSubmission(data?.liveClassId, data?.quizId, data?.answer, data?.timeTakenSeconds, callback);
    }
  );

  // 4. Legacy Quiz Submit Alias
  socket.on(
    'submit_quiz',
    (
      data: {
        classId?: string;
        liveClassId?: string;
        quizId: string;
        answer: string;
        timeTakenSeconds?: number;
      },
      callback?: (res: any) => void
    ) => {
      const classId = data.liveClassId || data.classId || '';
      recordSubmission(classId, data?.quizId, data?.answer, data?.timeTakenSeconds, callback);
    }
  );

  // 5. Instructor Ends Quiz & Broadcasts Results with Correct Answer
  const finishQuiz = (liveClassId: string, quizId?: string, callback?: (res: any) => void) => {
    try {
      const user = socket.user;
      if (!user || (user.role !== 'admin' && user.role !== 'instructor')) {
        if (callback) callback({ success: false, error: 'INVALID_PERMISSION' });
        return;
      }

      const activeQuiz = activeQuizzesMap.get(liveClassId);
      if (activeQuiz) {
        activeQuiz.status = 'ENDED';

        const totalSubmissions = activeQuiz.submissions.size;
        const correctCount = Array.from(activeQuiz.submissions.values()).filter((s) => s.isCorrect).length;
        const accuracyPercentage = totalSubmissions > 0 ? Math.round((correctCount / totalSubmissions) * 100) : 0;

        const roomName = `live-class:${liveClassId}`;

        const resultPayload = {
          quizId: activeQuiz.id,
          liveClassId,
          correctAnswer: activeQuiz.correctAnswer, // Now safely revealed
          totalSubmissions,
          correctCount,
          accuracyPercentage,
          status: 'ENDED',
        };

        // Broadcast final result with revealed correct answer
        io.to(roomName).emit('quiz:result', resultPayload);
        io.to(roomName).emit('quiz_ended', resultPayload);
      }

      if (callback) callback({ success: true });
    } catch (err: any) {
      if (callback) callback({ success: false, error: err.message });
    }
  };

  socket.on('quiz:end', (data: { liveClassId: string; quizId: string }, callback?: (res: any) => void) => {
    finishQuiz(data?.liveClassId, data?.quizId, callback);
  });

  socket.on('end_quiz', (data: { classId?: string; liveClassId?: string; quizId?: string }, callback?: (res: any) => void) => {
    const classId = data.liveClassId || data.classId || '';
    finishQuiz(classId, data?.quizId, callback);
  });

  // 6. Hydrate Active Quiz on Join / Reconnect / Mount
  socket.on(
    'quiz:get_active',
    (data: { liveClassId?: string; classId?: string }, callback?: (res: any) => void) => {
      const classId = data?.liveClassId || data?.classId || '';
      const activeQuiz = activeQuizzesMap.get(classId);
      const user = socket.user;
      const userId = user?.uid || user?.id || '';
      const isInstructor = user?.role === 'admin' || user?.role === 'instructor' || user?.role === 'mentor';

      if (activeQuiz && activeQuiz.status === 'ACTIVE') {
        const userSubmission = activeQuiz.submissions.get(userId);
        const hasSubmitted = Boolean(userSubmission);

        const quizPayload: any = {
          id: activeQuiz.id,
          _id: activeQuiz.id,
          classId: activeQuiz.liveClassId,
          liveClassId: activeQuiz.liveClassId,
          title: activeQuiz.title,
          question: activeQuiz.question,
          options: activeQuiz.options,
          marks: activeQuiz.marks,
          timerSeconds: activeQuiz.timerSeconds,
          status: 'ACTIVE',
          createdAt: activeQuiz.createdAt,
          hasSubmitted,
          userAnswer: userSubmission?.answer,
        };

        if (isInstructor) {
          const list = Array.from(activeQuiz.submissions.values());
          const totalAnswered = list.length;
          const correct = list.filter((s) => s.isCorrect).length;
          const wrong = totalAnswered - correct;
          const accuracyPercent = totalAnswered > 0 ? Math.round((correct / totalAnswered) * 100) : 0;
          const avgTime = totalAnswered > 0 ? Math.round(list.reduce((acc, s) => acc + s.timeTakenSeconds, 0) / totalAnswered) : 0;

          quizPayload.correctAnswer = activeQuiz.correctAnswer;
          quizPayload.stats = {
            totalAnswered,
            correct,
            wrong,
            accuracyPercent,
            avgTime,
            studentResults: list.map((r) => ({
              studentId: r.studentId,
              studentName: r.studentName,
              answer: r.answer,
              isCorrect: r.isCorrect,
              score: r.score,
              timeTakenSeconds: r.timeTakenSeconds,
            })),
          };
        }

        const res = { success: true, quiz: quizPayload };
        socket.emit('quiz:active', res);
        if (callback) callback(res);
      } else {
        const res = { success: true, quiz: null };
        socket.emit('quiz:active', res);
        if (callback) callback(res);
      }
    }
  );

  // 7. Reveal Correct Answers
  socket.on(
    'quiz:reveal',
    (data: { liveClassId?: string; classId?: string; quizId?: string }, callback?: (res: any) => void) => {
      try {
        const user = socket.user;
        if (!user || (user.role !== 'admin' && user.role !== 'instructor' && user.role !== 'mentor')) {
          if (callback) callback({ success: false, error: 'INVALID_PERMISSION' });
          return;
        }
        const classId = data.liveClassId || data.classId || '';
        const activeQuiz = activeQuizzesMap.get(classId);
        if (!activeQuiz) {
          if (callback) callback({ success: false, error: 'QUIZ_NOT_FOUND' });
          return;
        }

        const roomName = `live-class:${classId}`;
        const list = Array.from(activeQuiz.submissions.values());
        const totalSubmissions = list.length;
        const correctCount = list.filter((s) => s.isCorrect).length;
        const accuracyPercentage = totalSubmissions > 0 ? Math.round((correctCount / totalSubmissions) * 100) : 0;

        const revealPayload = {
          quizId: activeQuiz.id,
          liveClassId: classId,
          correctAnswer: activeQuiz.correctAnswer,
          totalSubmissions,
          correctCount,
          accuracyPercentage,
          status: 'REVEALED',
        };

        io.to(roomName).emit('quiz:revealed', revealPayload);
        io.to(roomName).emit('quiz_revealed', revealPayload);

        if (callback) callback({ success: true });
      } catch (err: any) {
        if (callback) callback({ success: false, error: err.message });
      }
    }
  );
};
