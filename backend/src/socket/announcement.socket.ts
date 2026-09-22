import { Server as SocketServer } from 'socket.io';
import { AuthenticatedSocket } from './socket.auth';
import { liveClassroomService } from '../modules/liveClassroom/liveClassroom.service';
import { notificationService } from '../modules/notifications/notification.service';
import { canPerformClassroomAction } from '../modules/liveClassroom/permissions';
import logger from '../config/logger';

export interface ActiveAnnouncement {
  id: string;
  liveClassId: string;
  message: string;
  priority: 'normal' | 'urgent';
  pinned?: boolean;
  senderId: string;
  senderName: string;
  senderRole: string;
  createdAt: string;
  targetAudience?: 'all' | 'selected_batch' | 'selected_section' | 'restricted';
  targetBatch?: string;
  targetSection?: string;
}

// In-memory active announcements: liveClassId -> ActiveAnnouncement[]
const activeAnnouncementsMap = new Map<string, ActiveAnnouncement[]>();

export const registerAnnouncementHandlers = (io: SocketServer, socket: AuthenticatedSocket) => {
  // 1. Send Announcement (Instructor / Admin only)
  socket.on(
    'announcement:send',
    async (
      data: {
        liveClassId: string;
        message: string;
        priority?: 'normal' | 'urgent';
        pinned?: boolean;
        targetAudience?: 'all' | 'selected_batch' | 'selected_section' | 'restricted';
        targetBatch?: string;
        targetSection?: string;
      },
      callback?: (res: any) => void
    ) => {
      try {
        const user = socket.user;
        const allowed = user && canPerformClassroomAction('publishAnnouncement', {
          userId: user.uid || user.id,
          role: user.role,
        });

        if (!allowed) {
          const err = { success: false, error: 'INVALID_PERMISSION', message: 'Only instructors/admins can broadcast announcements' };
          socket.emit('announcement:error', err);
          if (callback) callback(err);
          return;
        }

        const { liveClassId, message, priority = 'normal', pinned = false, targetAudience = 'all', targetBatch, targetSection } = data;
        if (!liveClassId || !message) {
          const err = { success: false, error: 'INVALID_PAYLOAD', message: 'Message cannot be empty' };
          socket.emit('announcement:error', err);
          if (callback) callback(err);
          return;
        }

        const roomName = `live-class:${liveClassId}`;
        const announcementPayload: ActiveAnnouncement = {
          id: `ann_${Date.now()}`,
          liveClassId,
          message: message.trim(),
          priority,
          pinned,
          senderId: user.uid || user.id,
          senderName: user.name || 'Instructor',
          senderRole: user.role,
          createdAt: new Date().toISOString(),
          targetAudience,
          targetBatch,
          targetSection,
        };

        // Cache in room map
        if (!activeAnnouncementsMap.has(liveClassId)) {
          activeAnnouncementsMap.set(liveClassId, []);
        }
        const roomList = activeAnnouncementsMap.get(liveClassId)!;
        roomList.unshift(announcementPayload);
        if (roomList.length > 20) {
          roomList.pop();
        }

        // Persist in repository
        try {
          await liveClassroomService.createAnnouncement({
            classId: liveClassId,
            authorId: user.uid || user.id,
            authorName: user.name || 'Instructor',
            authorRole: (user.role as any) || 'instructor',
            message: message.trim(),
          });
        } catch (dbErr) {
          logger.warn('[SOCKET ANNOUNCEMENT] DB persist warning:', dbErr);
        }

        logger.info(`[ANNOUNCEMENT] Broadcast in ${roomName} by ${user.name}: ${message}`);

        // Dispatch notification to user dashboards
        try {
          await notificationService.dispatchAnnouncementNotification(announcementPayload, null, io);
        } catch (notifErr) {
          logger.warn('[SOCKET ANNOUNCEMENT] Notification dispatch warning:', notifErr);
        }

        if (callback) callback({ success: true, announcement: announcementPayload });
      } catch (err: any) {
        logger.error('[SOCKET] announcement:send exception:', err);
        if (callback) callback({ success: false, error: err.message });
      }
    }
  );

  // 2. Fetch active announcements on room join / reconnect
  socket.on(
    'announcement:list',
    (data: { liveClassId?: string; classId?: string }, callback?: (res: any) => void) => {
      try {
        const liveClassId = data?.liveClassId || data?.classId || '';
        const announcements = activeAnnouncementsMap.get(liveClassId) || [];
        const res = { success: true, announcements };
        socket.emit('announcement:list', res);
        if (callback) callback(res);
      } catch (err: any) {
        if (callback) callback({ success: false, error: err.message, announcements: [] });
      }
    }
  );

  // 3. Pin / Unpin Announcement
  socket.on(
    'announcement:pin',
    (data: { liveClassId?: string; classId?: string; announcementId: string; pinned: boolean }, callback?: (res: any) => void) => {
      try {
        const user = socket.user;
        if (!user || (user.role !== 'admin' && user.role !== 'instructor' && user.role !== 'mentor')) {
          if (callback) callback({ success: false, error: 'INVALID_PERMISSION' });
          return;
        }
        const liveClassId = data?.liveClassId || data?.classId || '';
        const roomList = activeAnnouncementsMap.get(liveClassId) || [];
        const target = roomList.find((a) => a.id === data.announcementId);
        if (target) {
          target.pinned = data.pinned;
          const roomName = `live-class:${liveClassId}`;
          io.to(roomName).emit('announcement:pinned', { announcementId: target.id, pinned: target.pinned });
        }
        if (callback) callback({ success: true });
      } catch (err: any) {
        if (callback) callback({ success: false, error: err.message });
      }
    }
  );
};
