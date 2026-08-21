import { Server as SocketServer } from 'socket.io';
import { AuthenticatedSocket } from './socket.auth';
import { liveClassroomService } from '../modules/liveClassroom/liveClassroom.service';
import logger from '../config/logger';

// In-memory Q&A store for active live classes
const activeQuestions = new Map<string, any[]>();

export const registerQnaHandlers = (io: SocketServer, socket: AuthenticatedSocket) => {
  // Helper for student question submission
  const handleAsk = async (liveClassId: string, questionText: string, callback?: (res: any) => void) => {
    try {
      const user = socket.user;
      if (!user || !liveClassId) {
        const err = { success: false, error: 'UNAUTHORIZED_SOCKET', message: 'Authentication required' };
        socket.emit('qna:error', err);
        if (callback) callback(err);
        return;
      }

      const cleanText = (questionText || '').trim();
      if (!cleanText) {
        const err = { success: false, error: 'INVALID_PAYLOAD', message: 'Question cannot be empty' };
        socket.emit('qna:error', err);
        if (callback) callback(err);
        return;
      }

      const roomName = `live-class:${liveClassId}`;
      const newQuestion = {
        id: `qna_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        _id: `qna_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        classId: liveClassId,
        liveClassId,
        studentId: user.uid || user.id,
        studentName: user.name || 'Student',
        question: cleanText,
        answer: null,
        status: 'OPEN',
        upvotes: 0,
        answeredBy: null,
        createdAt: new Date().toISOString(),
        answeredAt: null,
      };

      if (!activeQuestions.has(liveClassId)) {
        activeQuestions.set(liveClassId, []);
      }
      activeQuestions.get(liveClassId)!.push(newQuestion);

      // Save to database non-blockingly
      liveClassroomService.createQuestion({
        classId: liveClassId,
        studentId: user.uid || user.id,
        studentName: user.name || 'Student',
        question: cleanText,
      } as any).catch((dbErr: any) => {
        logger.warn('[SOCKET QNA] DB save notice:', dbErr?.message);
      });

      // Broadcast to entire room in both formats
      io.to(roomName).emit('qna:question', newQuestion);
      io.to(roomName).emit('question_submitted', newQuestion);

      if (callback) callback({ success: true, question: newQuestion });
    } catch (err: any) {
      logger.error('[SOCKET] qna:ask exception:', err);
      const errPayload = { success: false, error: 'SERVER_ERROR', message: err.message };
      socket.emit('qna:error', errPayload);
      if (callback) callback(errPayload);
    }
  };

  // Helper for answering a question
  const handleAnswer = async (liveClassId: string, questionId: string, answerText: string, callback?: (res: any) => void) => {
    try {
      const user = socket.user;
      if (!user || (user.role !== 'admin' && user.role !== 'instructor' && user.role !== 'mentor')) {
        const err = { success: false, error: 'INVALID_PERMISSION', message: 'Only instructors and moderators can answer questions' };
        socket.emit('qna:error', err);
        if (callback) callback(err);
        return;
      }

      const roomName = `live-class:${liveClassId}`;
      const list = activeQuestions.get(liveClassId) || [];
      const q = list.find((item) => item.id === questionId || item._id === questionId);
      if (q) {
        q.answer = answerText;
        q.status = 'ANSWERED';
        q.answeredBy = user.name || user.email || 'Instructor';
        q.answeredAt = new Date().toISOString();
      }

      // Persist answer in database non-blockingly
      liveClassroomService.updateQuestion(liveClassId, questionId, {
        answer: answerText,
        status: 'answered',
        answeredBy: user.name || 'Instructor',
      } as any).catch((dbErr: any) => {
        logger.warn('[SOCKET QNA] DB update notice:', dbErr?.message);
      });

      const answerPayload = {
        liveClassId,
        classId: liveClassId,
        questionId,
        answer: answerText,
        status: 'ANSWERED',
        answeredBy: user.name || 'Instructor',
        answeredAt: new Date().toISOString(),
      };

      // Broadcast answered question to the room
      io.to(roomName).emit('qna:answer', answerPayload);
      io.to(roomName).emit('question_answered', answerPayload);

      if (callback) callback({ success: true });
    } catch (err: any) {
      if (callback) callback({ success: false, error: err.message });
    }
  };

  // 1. Ask Question (Modern & Legacy)
  socket.on(
    'qna:ask',
    async (data: { liveClassId: string; question: string }, callback?: (res: any) => void) => {
      await handleAsk(data?.liveClassId, data?.question, callback);
    }
  );

  socket.on(
    'submit_question',
    async (data: { classId?: string; liveClassId?: string; question: string }, callback?: (res: any) => void) => {
      const classId = data?.liveClassId || data?.classId || '';
      await handleAsk(classId, data?.question, callback);
    }
  );

  // 2. Answer Question (Modern & Legacy)
  socket.on(
    'qna:answer',
    async (data: { liveClassId: string; questionId: string; answer: string }, callback?: (res: any) => void) => {
      await handleAnswer(data?.liveClassId, data?.questionId, data?.answer, callback);
    }
  );

  socket.on(
    'answer_question',
    async (data: { classId?: string; liveClassId?: string; questionId: string; answer: string }, callback?: (res: any) => void) => {
      const classId = data?.liveClassId || data?.classId || '';
      await handleAnswer(classId, data?.questionId, data?.answer, callback);
    }
  );

  // 3. Resolve / Remove Question
  socket.on(
    'qna:resolve',
    async (data: { liveClassId?: string; classId?: string; questionId: string }, callback?: (res: any) => void) => {
      const user = socket.user;
      if (!user || (user.role !== 'admin' && user.role !== 'instructor' && user.role !== 'mentor')) {
        if (callback) callback({ success: false, error: 'INVALID_PERMISSION' });
        return;
      }

      const classId = data.liveClassId || data.classId || '';
      const { questionId } = data;
      io.to(`live-class:${classId}`).emit('qna:resolve', { liveClassId: classId, questionId });
      io.to(`live-class:${classId}`).emit('question_resolved', { classId, questionId });
      if (callback) callback({ success: true });
    }
  );

  socket.on(
    'qna:remove',
    async (data: { liveClassId?: string; classId?: string; questionId: string }, callback?: (res: any) => void) => {
      const user = socket.user;
      if (!user || (user.role !== 'admin' && user.role !== 'instructor' && user.role !== 'mentor')) {
        if (callback) callback({ success: false, error: 'INVALID_PERMISSION' });
        return;
      }

      const classId = data.liveClassId || data.classId || '';
      const { questionId } = data;
      const list = activeQuestions.get(classId) || [];
      activeQuestions.set(classId, list.filter((q) => q.id !== questionId && q._id !== questionId));

      io.to(`live-class:${classId}`).emit('qna:remove', { liveClassId: classId, questionId });
      io.to(`live-class:${classId}`).emit('question_deleted', { classId, questionId });
      if (callback) callback({ success: true });
    }
  );
};
