import { Server as SocketServer } from 'socket.io';
import { AuthenticatedSocket } from './socket.auth';
import { liveClassroomService } from '../modules/liveClassroom/liveClassroom.service';
import logger from '../config/logger';
import { getClassroomSettings, getModerationRecord } from './liveClass.socket';

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

// In-memory deduplication tracker: classId -> Set of recent finalMsgIds
const processedMessageIds = new Map<string, Set<string>>();

export const registerChatHandlers = (io: SocketServer, socket: AuthenticatedSocket) => {
  // 1. Send Chat Message
  socket.on(
    'chat:send',
    async (
      data: {
        liveClassId?: string;
        classId?: string;
        classroomId?: string;
        message: string;
        messageType?: 'normal' | 'announcement';
        replyToId?: string;
        clientMessageId?: string;
        id?: string;
        senderId?: string;
        senderName?: string;
        senderRole?: string;
        timestamp?: string;
      },
      callback?: (res: any) => void
    ) => {
      try {
        const user = socket.user;
        const liveClassId = data?.liveClassId || data?.classId || data?.classroomId;

        if (!user || !liveClassId) {
          const errRes = { success: false, error: 'UNAUTHORIZED_SOCKET', message: 'Authentication required' };
          socket.emit('chat:error', errRes);
          if (callback) callback(errRes);
          return;
        }

        // Live Class Access Authorization Check
        const accessCheck = await liveClassroomService.getLiveClassForStudent(liveClassId, {
          uid: user.uid || user.id,
          role: user.role,
          email: user.email,
        });
        if (!accessCheck.authorized) {
          const errRes = {
            success: false,
            error: 'LIVE_CLASS_ACCESS_DENIED',
            message: accessCheck.error || 'You are not authorized to participate in this class.',
          };
          socket.emit('chat:error', errRes);
          if (callback) callback(errRes);
          return;
        }

        // Authoritative Interaction Settings & Moderation Check
        const settings = getClassroomSettings(liveClassId);
        const modRecord = getModerationRecord(liveClassId, user.uid || user.id, user.role);

        if (user.role === 'student') {
          const chatEnabled = settings?.chat?.enabled !== false;
          const chatMode = settings?.chat?.mode || 'everyone';

          if (!chatEnabled || chatMode === 'disabled') {
            const errRes = { success: false, error: 'CHAT_DISABLED', message: 'Chat is currently disabled in this classroom.' };
            socket.emit('chat:error', errRes);
            if (callback) callback(errRes);
            return;
          }

          if (chatMode === 'instructor_only') {
            const errRes = { success: false, error: 'CHAT_INSTRUCTOR_ONLY', message: 'Chat is currently restricted to instructors only.' };
            socket.emit('chat:error', errRes);
            if (callback) callback(errRes);
            return;
          }

          if (chatMode === 'selected_students' && modRecord.chatPermission !== 'granted') {
            const errRes = { success: false, error: 'CHAT_PERMISSION_DENIED', message: 'Chat access has not been granted to you by the instructor.' };
            socket.emit('chat:error', errRes);
            if (callback) callback(errRes);
            return;
          }

          if (modRecord.chatPermission === 'denied') {
            const errRes = { success: false, error: 'CHAT_MUTED', message: 'Your chat access has been muted by the instructor.' };
            socket.emit('chat:error', errRes);
            if (callback) callback(errRes);
            return;
          }
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
        const finalMsgId = data.clientMessageId || data.id || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

        // Deduplication check: drop duplicate network retries / double-clicks
        let roomProcessed = processedMessageIds.get(liveClassId);
        if (!roomProcessed) {
          roomProcessed = new Set<string>();
          processedMessageIds.set(liveClassId, roomProcessed);
        }

        if (roomProcessed.has(finalMsgId)) {
          logger.info(`[CHAT_DEDUP] Duplicate message ignored: id=${finalMsgId} classId=${liveClassId}`);
          if (callback) callback({ success: true, messageId: finalMsgId, deduplicated: true });
          return;
        }
        roomProcessed.add(finalMsgId);
        if (roomProcessed.size > 500) {
          const firstKey = roomProcessed.values().next().value;
          if (firstKey) roomProcessed.delete(firstKey);
        }

        // Ensure sender socket is joined to the classroom room
        if (!socket.rooms.has(roomName)) {
          socket.join(roomName);
        }

        // Save in Database with deterministic message ID before broadcasting
        const savedMessage = await liveClassroomService.saveChatMessage({
          id: finalMsgId,
          classId: liveClassId,
          userId: user.uid || user.id,
          userName: user.name || 'User',
          userRole: user.role as any,
          message: cleanMessage,
          createdAt: new Date().toISOString(),
        });

        const clientMsgId = data.clientMessageId || data.id || finalMsgId;

        const chatPayload = {
          id: finalMsgId,
          messageId: finalMsgId,
          clientMessageId: clientMsgId,
          liveClassId,
          classId: liveClassId,
          classroomId: liveClassId,
          userId: user.uid || user.id,
          senderId: user.uid || user.id,
          userName: user.name || 'User',
          senderName: user.name || 'User',
          role: user.role,
          senderRole: user.role,
          message: cleanMessage,
          status: 'sent',
          messageType: data.messageType || 'normal',
          replyToId: data.replyToId,
          createdAt: savedMessage.createdAt || new Date().toISOString(),
          timestamp: savedMessage.createdAt || new Date().toISOString(),
        };

        // Broadcast to entire room strictly once on canonical chat:message event
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

  // 4. Compatibility Handlers for Legacy Frontend Widgets
  socket.on(
    'send_chat',
    async (data: {
      classId?: string;
      liveClassId?: string;
      message: string;
      messageType?: 'normal' | 'announcement';
      replyToId?: string;
    }) => {
      const liveClassId = data.liveClassId || data.classId;
      if (!liveClassId) return;

      const user = socket.user;
      if (!user) return;

      const settings = getClassroomSettings(liveClassId);
      const modRecord = getModerationRecord(liveClassId, user.uid || user.id, user.role);
      if (user.role === 'student' && (!settings.chat.enabled || modRecord.chatPermission === 'denied')) {
        socket.emit('chat:error', { success: false, error: 'CHAT_DISABLED', message: 'Chat is currently disabled by the instructor.' });
        return;
      }

      const rawMessage = (data.message || '').trim();
      if (!rawMessage || rawMessage.length > 500) return;
      if (isRateLimited(user.uid || user.id)) return;

      const cleanMessage = sanitizeContent(rawMessage);
      const roomName = `live-class:${liveClassId}`;

      try {
        const savedMessage = await liveClassroomService.saveChatMessage({
          classId: liveClassId,
          userId: user.uid || user.id,
          userName: user.name || 'User',
          userRole: (user.role as any) || 'student',
          message: cleanMessage,
          createdAt: new Date().toISOString(),
        });

        const finalMsgId = (data as any).clientMessageId || (data as any).id || (savedMessage as any).id || `msg_${Date.now()}`;
        const chatPayload = {
          id: finalMsgId,
          liveClassId,
          classId: liveClassId,
          userId: user.uid || user.id,
          userName: user.name || 'User',
          role: user.role,
          message: cleanMessage,
          status: 'VISIBLE',
          messageType: data.messageType || 'normal',
          replyToId: data.replyToId,
          createdAt: new Date().toISOString(),
        };

        // Broadcast once to room on canonical chat:message
        io.to(roomName).emit('chat:message', chatPayload);
      } catch (err: any) {
        logger.error('[SOCKET] send_chat exception:', err);
      }
    }
  );

  socket.on('pin_chat', (data: { classId?: string; liveClassId?: string; messageId: string; pinned: boolean }) => {
    const user = socket.user;
    if (!user || (user.role !== 'admin' && user.role !== 'instructor' && user.role !== 'mentor')) return;

    const liveClassId = data.liveClassId || data.classId;
    if (!liveClassId) return;

    const roomName = `live-class:${liveClassId}`;
    io.to(roomName).emit('chat_pinned', { messageId: data.messageId, pinned: data.pinned });
    io.to(roomName).emit('chat:moderate', {
      liveClassId,
      messageId: data.messageId,
      action: data.pinned ? 'pin' : 'unpin',
      moderatedBy: user.name || user.email,
    });
  });
};
