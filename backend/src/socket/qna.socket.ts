import { Server as SocketServer } from 'socket.io';
import { AuthenticatedSocket } from './socket.auth';
import { liveClassroomService } from '../modules/liveClassroom/liveClassroom.service';
import logger from '../config/logger';

// In-memory Q&A store for active live classes
const activeQuestions = new Map<string, any[]>();

export const registerQnaHandlers = (io: SocketServer, socket: AuthenticatedSocket) => {
  // 1. Student Asks Question
  socket.on(
    'qna:ask',
    async (
      data: { liveClassId: string; question: string },
      callback?: (res: any) => void
    ) => {
      try {
        const user = socket.user;
        const liveClassId = data?.liveClassId;

        if (!user || !liveClassId) {
          const err = { success: false, error: 'UNAUTHORIZED_SOCKET', message: 'Authentication required' };
          socket.emit('qna:error', err);
          if (callback) callback(err);
          return;
        }

        const questionText = (data.question || '').trim();
        if (!questionText) {
          const err = { success: false, error: 'INVALID_PAYLOAD', message: 'Question cannot be empty' };
          socket.emit('qna:error', err);
          if (callback) callback(err);
          return;
        }

        const roomName = `live-class:${liveClassId}`;
        const newQuestion = {
          id: `qna_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          liveClassId,
          studentId: user.uid || user.id,
          studentName: user.name || 'Student',
          question: questionText,
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

        // Also save to database
        liveClassroomService
          .createQuestion({
            classId: liveClassId,
            studentId: user.uid || user.id,
            studentName: user.name || 'Student',
            question: questionText,
          } as any)
          .catch((dbErr: any) => logger.warn('[SOCKET QNA] DB save warning:', dbErr));

        // Broadcast to entire room
        io.to(roomName).emit('qna:question', newQuestion);

        if (callback) callback({ success: true, question: newQuestion });
      } catch (err: any) {
        logger.error('[SOCKET] qna:ask exception:', err);
        const errPayload = { success: false, error: 'SERVER_ERROR', message: err.message };
        socket.emit('qna:error', errPayload);
        if (callback) callback(errPayload);
      }
    }
  );

  // 2. Instructor Answers Question
  socket.on(
    'qna:answer',
    async (
      data: { liveClassId: string; questionId: string; answer: string },
      callback?: (res: any) => void
    ) => {
      try {
        const user = socket.user;
        if (!user || (user.role !== 'admin' && user.role !== 'instructor' && user.role !== 'mentor')) {
          const err = { success: false, error: 'INVALID_PERMISSION', message: 'Only instructors and moderators can answer questions' };
          socket.emit('qna:error', err);
          if (callback) callback(err);
          return;
        }

        const { liveClassId, questionId, answer } = data;
        const roomName = `live-class:${liveClassId}`;

        const list = activeQuestions.get(liveClassId) || [];
        const q = list.find((item) => item.id === questionId);
        if (q) {
          q.answer = answer;
          q.status = 'ANSWERED';
          q.answeredBy = user.name || user.email || 'Instructor';
          q.answeredAt = new Date().toISOString();
        }

        // Broadcast answered question to the room
        io.to(roomName).emit('qna:answer', {
          liveClassId,
          questionId,
          answer,
          status: 'ANSWERED',
          answeredBy: user.name || 'Instructor',
          answeredAt: new Date().toISOString(),
        });

        if (callback) callback({ success: true });
      } catch (err: any) {
        if (callback) callback({ success: false, error: err.message });
      }
    }
  );

  // 3. Resolve / Remove Question
  socket.on(
    'qna:resolve',
    async (data: { liveClassId: string; questionId: string }, callback?: (res: any) => void) => {
      const user = socket.user;
      if (!user || (user.role !== 'admin' && user.role !== 'instructor' && user.role !== 'mentor')) {
        if (callback) callback({ success: false, error: 'INVALID_PERMISSION' });
        return;
      }

      const { liveClassId, questionId } = data;
      io.to(`live-class:${liveClassId}`).emit('qna:resolve', { liveClassId, questionId });
      if (callback) callback({ success: true });
    }
  );

  socket.on(
    'qna:remove',
    async (data: { liveClassId: string; questionId: string }, callback?: (res: any) => void) => {
      const user = socket.user;
      if (!user || (user.role !== 'admin' && user.role !== 'instructor' && user.role !== 'mentor')) {
        if (callback) callback({ success: false, error: 'INVALID_PERMISSION' });
        return;
      }

      const { liveClassId, questionId } = data;
      const list = activeQuestions.get(liveClassId) || [];
      activeQuestions.set(liveClassId, list.filter((q) => q.id !== questionId));

      io.to(`live-class:${liveClassId}`).emit('qna:remove', { liveClassId, questionId });
      if (callback) callback({ success: true });
    }
  );
};
