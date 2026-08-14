import { Server as SocketServer } from 'socket.io';
import { AuthenticatedSocket } from './socket.auth';
import logger from '../config/logger';

export const registerAnnouncementHandlers = (io: SocketServer, socket: AuthenticatedSocket) => {
  // 1. Send Announcement (Instructor / Admin only)
  socket.on(
    'announcement:send',
    (
      data: { liveClassId: string; message: string; priority?: 'normal' | 'urgent' },
      callback?: (res: any) => void
    ) => {
      try {
        const user = socket.user;
        if (!user || (user.role !== 'admin' && user.role !== 'instructor' && user.role !== 'mentor')) {
          const err = { success: false, error: 'INVALID_PERMISSION', message: 'Only instructors/admins can broadcast announcements' };
          socket.emit('announcement:error', err);
          if (callback) callback(err);
          return;
        }

        const { liveClassId, message, priority = 'normal' } = data;
        if (!liveClassId || !message) {
          const err = { success: false, error: 'INVALID_PAYLOAD', message: 'Message cannot be empty' };
          socket.emit('announcement:error', err);
          if (callback) callback(err);
          return;
        }

        const roomName = `live-class:${liveClassId}`;
        const announcementPayload = {
          id: `ann_${Date.now()}`,
          liveClassId,
          message: message.trim(),
          priority,
          senderId: user.uid || user.id,
          senderName: user.name || 'Instructor',
          senderRole: user.role,
          createdAt: new Date().toISOString(),
        };

        logger.info(`[ANNOUNCEMENT] Broadcast in ${roomName} by ${user.name}: ${message}`);

        // Broadcast announcement to entire room
        io.to(roomName).emit('announcement:receive', announcementPayload);

        if (callback) callback({ success: true, announcement: announcementPayload });
      } catch (err: any) {
        logger.error('[SOCKET] announcement:send exception:', err);
        if (callback) callback({ success: false, error: err.message });
      }
    }
  );
};
