import { Server as SocketServer } from 'socket.io';
import { AuthenticatedSocket } from './socket.auth';
import { liveClassroomService } from '../modules/liveClassroom/liveClassroom.service';
import logger from '../config/logger';

// In-memory sliding window rate limiter: userId -> array of timestamps
const userMessageTimestamps = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 5000; // 5 seconds
const MAX_MESSAGES_PER_WINDOW = 5; // Max 5 messages in 5 seconds

const isRateLimited = (userId: string): boolean => {
  const now = Date.now();
  let timestamps = userMessageTimestamps.get(userId) || [];
  timestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (timestamps.length >= MAX_MESSAGES_PER_WINDOW) {
    userMessageTimestamps.set(userId, timestamps);
    return true;
  }
  timestamps.push(now);
  userMessageTimestamps.set(userId, timestamps);
  return false;
};

// Basic HTML/script tag sanitization helper
const sanitizeContent = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/javascript:/gi, '')
    .trim();
};

export const registerChatHandlers = (io: SocketServer, socket: AuthenticatedSocket) => {
  // 1. Send Chat Message
  socket.on(
    'chat:send',
    async (
      data: {
        liveClassId: string;
        message: string;
        messageType?: 'normal' | 'announcement';
        replyToId?: string;
      },
      callback?: (res: any) => void
    ) => {
      try {
        const user = socket.user;
        const liveClassId = data?.liveClassId;

        if (!user || !liveClassId) {
          const errRes = { success: false, error: 'UNAUTHORIZED_SOCKET', message: 'Authentication required' };
          socket.emit('chat:error', errRes);
          if (callback) callback(errRes);
          return;
        }

        const rawMessage = (data.message || '').trim();
        if (!rawMessage) {
          const errRes = { success: false, error: 'INVALID_PAYLOAD', message: 'Message text cannot be empty' };
          socket.emit('chat:error', errRes);
          if (callback) callback(errRes);
          return;
        }

        if (rawMessage.length > 500) {
          const errRes = { success: false, error: 'MESSAGE_TOO_LONG', message: 'Message exceeds maximum length of 500 characters' };
          socket.emit('chat:error', errRes);
          if (callback) callback(errRes);
          return;
        }

        // Rate limiting check
        if (isRateLimited(user.uid || user.id)) {
          const errRes = { success: false, error: 'CHAT_RATE_LIMITED', message: 'You are sending messages too quickly. Please wait a few seconds.' };
          socket.emit('chat:error', errRes);
          if (callback) callback(errRes);
          return;
        }

        const cleanMessage = sanitizeContent(rawMessage);
        const roomName = `live-class:${liveClassId}`;

        // Save in Database
        const savedMessage = await liveClassroomService.saveChatMessage({
          classId: liveClassId,
          userId: user.uid || user.id,
          userName: user.name || 'User',
          userRole: user.role as any,
          message: cleanMessage,
          createdAt: new Date().toISOString(),
        });

        const chatPayload = {
          id: (savedMessage as any).id || `msg_${Date.now()}`,
          liveClassId,
          userId: user.uid || user.id,
          userName: user.name || 'User',
          role: user.role,
          message: cleanMessage,
          status: 'VISIBLE',
          messageType: data.messageType || 'normal',
          replyToId: data.replyToId,
          createdAt: new Date().toISOString(),
        };

        // Broadcast to entire room
        io.to(roomName).emit('chat:message', chatPayload);

        if (callback) callback({ success: true, message: chatPayload });
      } catch (err: any) {
        logger.error('[SOCKET] chat:send exception:', err);
        const errRes = { success: false, error: 'SERVER_ERROR', message: err.message };
        socket.emit('chat:error', errRes);
        if (callback) callback(errRes);
      }
    }
  );

  // 2. Delete / Moderate Message (Admin/Instructor/Mentor only)
  socket.on(
    'chat:delete',
    async (data: { liveClassId: string; messageId: string }, callback?: (res: any) => void) => {
      try {
        const user = socket.user;
        if (!user || (user.role !== 'admin' && user.role !== 'instructor' && user.role !== 'mentor')) {
          const errRes = { success: false, error: 'INVALID_PERMISSION', message: 'Only instructors and moderators can delete messages' };
          socket.emit('chat:error', errRes);
          if (callback) callback(errRes);
          return;
        }

        const { liveClassId, messageId } = data;
        const roomName = `live-class:${liveClassId}`;

        // Broadcast deletion event
        io.to(roomName).emit('chat:delete', {
          liveClassId,
          messageId,
          deletedBy: user.name || user.email,
        });

        if (callback) callback({ success: true });
      } catch (err: any) {
        if (callback) callback({ success: false, error: err.message });
      }
    }
  );

  // 3. Moderate / Pin Message
  socket.on(
    'chat:moderate',
    async (data: { liveClassId: string; messageId: string; action: 'pin' | 'unpin' | 'hide' }, callback?: (res: any) => void) => {
      try {
        const user = socket.user;
        if (!user || (user.role !== 'admin' && user.role !== 'instructor' && user.role !== 'mentor')) {
          if (callback) callback({ success: false, error: 'INVALID_PERMISSION' });
          return;
        }

        const { liveClassId, messageId, action } = data;
        const roomName = `live-class:${liveClassId}`;

        io.to(roomName).emit('chat:moderate', {
          liveClassId,
          messageId,
          action,
          moderatedBy: user.name || user.email,
        });

        if (callback) callback({ success: true });
      } catch (err: any) {
        if (callback) callback({ success: false, error: err.message });
      }
    }
  );
};
