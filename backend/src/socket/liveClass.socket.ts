import { Server as SocketServer } from 'socket.io';
import { AuthenticatedSocket } from './socket.auth';
import { liveClassroomService } from '../modules/liveClassroom/liveClassroom.service';
import logger from '../config/logger';

export interface ParticipantInfo {
  socketId: string;
  userId: string;
  name: string;
  role: string;
  email?: string;
  joinedAt: Date;
}

// In-memory active presence tracker: classId -> Map<socketId, ParticipantInfo>
const activeRoomPresences = new Map<string, Map<string, ParticipantInfo>>();

export const getRoomParticipants = (classId: string): ParticipantInfo[] => {
  const roomMap = activeRoomPresences.get(classId);
  return roomMap ? Array.from(roomMap.values()) : [];
};

export const registerLiveClassHandlers = (io: SocketServer, socket: AuthenticatedSocket) => {
  // Helper to handle room join logic uniformly
  const processJoin = async (liveClassId: string, customName?: string, callback?: (res: any) => void) => {
    try {
      const user = socket.user;
      if (!liveClassId || !user) {
        const errPayload = { success: false, error: 'UNAUTHORIZED_SOCKET', message: 'Authentication required' };
        socket.emit('liveClass:error', errPayload);
        if (callback) callback(errPayload);
        return;
      }

      // Query class status from DB with non-blocking fallback
      let classStatus = 'SCHEDULED';
      try {
        const liveClass = await liveClassroomService.getLiveClassById(liveClassId);
        if (liveClass && liveClass.status) {
          classStatus = liveClass.status;
        }
      } catch (dbErr: any) {
        logger.warn(`[SOCKET] Notice fetching live class ${liveClassId}: ${dbErr?.message}`);
      }

      const roomName = `live-class:${liveClassId}`;
      socket.join(roomName);

      // Track presence
      if (!activeRoomPresences.has(liveClassId)) {
        activeRoomPresences.set(liveClassId, new Map());
      }

      const participant: ParticipantInfo = {
        socketId: socket.id,
        userId: user.uid || user.id,
        name: customName || user.name || 'Student',
        role: user.role || 'student',
        email: user.email,
        joinedAt: new Date(),
      };
      activeRoomPresences.get(liveClassId)!.set(socket.id, participant);

      const currentRoster = getRoomParticipants(liveClassId);
      const activeCount = currentRoster.length;

      logger.info(`[SOCKET] User ${participant.name} (${participant.role}) joined ${roomName}. Total online: ${activeCount}`);

      // Respond to joiner
      const successPayload = {
        success: true,
        liveClassId,
        roomName,
        status: classStatus.toUpperCase(),
        onlineCount: activeCount,
        participants: currentRoster.map((p) => ({ userId: p.userId, name: p.name, role: p.role })),
      };
      socket.emit('liveClass:joined', successPayload);
      if (callback) callback(successPayload);

      // Broadcast presence updates to entire room
      io.to(roomName).emit('liveClass:presence', {
        onlineCount: activeCount,
        participants: currentRoster.map((p) => ({ userId: p.userId, name: p.name, role: p.role })),
      });

      io.to(roomName).emit('participants_update', {
        count: activeCount,
        users: currentRoster.map((p) => ({ userId: p.userId, name: p.name, role: p.role })),
      });

      // Broadcast student:joined
      socket.to(roomName).emit('student:joined', {
        userId: participant.userId,
        name: participant.name,
        role: participant.role,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      logger.error('[SOCKET] liveClass:join exception:', err);
      const errPayload = { success: false, error: 'SERVER_ERROR', message: err.message };
      socket.emit('liveClass:error', errPayload);
      if (callback) callback(errPayload);
    }
  };

  // Helper to handle room leave logic uniformly
  const processLeave = (liveClassId: string) => {
    if (!liveClassId) return;

    const roomName = `live-class:${liveClassId}`;
    socket.leave(roomName);

    const roomMap = activeRoomPresences.get(liveClassId);
    if (roomMap && roomMap.has(socket.id)) {
      const leftParticipant = roomMap.get(socket.id);
      roomMap.delete(socket.id);

      const currentRoster = getRoomParticipants(liveClassId);
      const activeCount = currentRoster.length;

      // Broadcast presence and leave notifications
      io.to(roomName).emit('liveClass:presence', {
        onlineCount: activeCount,
        participants: currentRoster.map((p) => ({ userId: p.userId, name: p.name, role: p.role })),
      });

      io.to(roomName).emit('participants_update', {
        count: activeCount,
        users: currentRoster.map((p) => ({ userId: p.userId, name: p.name, role: p.role })),
      });

      if (leftParticipant) {
        socket.to(roomName).emit('student:left', {
          userId: leftParticipant.userId,
          name: leftParticipant.name,
          role: leftParticipant.role,
          timestamp: new Date().toISOString(),
        });
        socket.to(roomName).emit('user_left', {
          userId: leftParticipant.userId,
          name: leftParticipant.name,
          role: leftParticipant.role,
        });
      }
    }

    socket.emit('liveClass:left', { liveClassId });
  };

  // 1. Join Live Class Room (modern & legacy alias)
  socket.on('liveClass:join', async (data: { liveClassId: string; name?: string }, callback?: (res: any) => void) => {
    await processJoin(data?.liveClassId, data?.name, callback);
  });

  socket.on('join_class', async (data: { classId: string; liveClassId?: string; name?: string; userId?: string; role?: string }, callback?: (res: any) => void) => {
    const classId = data?.liveClassId || data?.classId;
    await processJoin(classId, data?.name, callback);
  });

  // 2. Leave Live Class Room (modern & legacy alias)
  socket.on('liveClass:leave', (data: { liveClassId: string }) => {
    processLeave(data?.liveClassId);
  });

  socket.on('leave_class', (data: { classId: string; liveClassId?: string }) => {
    const classId = data?.liveClassId || data?.classId;
    processLeave(classId);
  });

  // 3. Status Broadcast (Admin / Instructor only)
  socket.on('liveClass:status', async (data: { liveClassId: string; status: string }) => {
    const user = socket.user;
    if (!user || (user.role !== 'admin' && user.role !== 'instructor')) {
      socket.emit('liveClass:error', { error: 'INVALID_PERMISSION', message: 'Only instructors/admins can update live class status' });
      return;
    }

    const { liveClassId, status } = data;
    const normStatus = status.toUpperCase();
    const roomName = `live-class:${liveClassId}`;

    // Persist status change in Firestore
    try {
      await liveClassroomService.updateLiveClass(liveClassId, {
        status: (normStatus === 'LIVE' ? 'Live' : normStatus === 'ENDED' ? 'Completed' : 'Scheduled') as any,
      });
    } catch (e: any) {
      logger.warn('[SOCKET] Live class status DB update notice:', e?.message);
    }

    // Broadcast updated status to all sockets in the room
    io.to(roomName).emit('liveClass:status', {
      liveClassId,
      status: normStatus,
      updatedAt: new Date().toISOString(),
      updatedBy: user.name || user.email,
    });
  });

  // 4. Whiteboard Controls & Drawing Sync
  socket.on('toggle_whiteboard', (data: { classId: string; liveClassId?: string; isOpen: boolean }) => {
    const user = socket.user;
    if (!user || (user.role !== 'admin' && user.role !== 'instructor' && user.role !== 'mentor')) {
      return;
    }
    const classId = data.liveClassId || data.classId;
    const roomName = `live-class:${classId}`;
    io.to(roomName).emit('whiteboard_toggled', { isOpen: data.isOpen });
  });

  socket.on('whiteboard_draw', (data: { classId: string; liveClassId?: string; x: number; y: number; prevX?: number; prevY?: number; color: string; lineWidth: number; tool: string }) => {
    const classId = data.liveClassId || data.classId;
    const roomName = `live-class:${classId}`;
    socket.to(roomName).emit('whiteboard_draw_event', data);
  });

  socket.on('whiteboard_clear', (data: { classId: string; liveClassId?: string }) => {
    const user = socket.user;
    if (!user || (user.role !== 'admin' && user.role !== 'instructor' && user.role !== 'mentor')) {
      return;
    }
    const classId = data.liveClassId || data.classId;
    const roomName = `live-class:${classId}`;
    io.to(roomName).emit('whiteboard_clear_event');
  });

  // 5. Classroom Lock Control
  socket.on('toggle_lock', (data: { classId: string; liveClassId?: string; locked: boolean }) => {
    const user = socket.user;
    if (!user || (user.role !== 'admin' && user.role !== 'instructor')) {
      return;
    }
    const classId = data.liveClassId || data.classId;
    const roomName = `live-class:${classId}`;
    io.to(roomName).emit('lock_toggled', { locked: data.locked });
  });

  // 6. Moderation: Mute Student & Kick Participant
  socket.on('mute_student', (data: { classId: string; liveClassId?: string; userId: string; isMuted: boolean }) => {
    const user = socket.user;
    if (!user || (user.role !== 'admin' && user.role !== 'instructor' && user.role !== 'mentor')) {
      return;
    }
    const classId = data.liveClassId || data.classId;
    const roomName = `live-class:${classId}`;
    logger.info(`[SOCKET] Instructor ${user.name} muted student ${data.userId} in room ${roomName}`);
    io.to(roomName).emit('student_muted', { userId: data.userId, isMuted: data.isMuted });
  });

  socket.on('kick_participant', (data: { classId: string; liveClassId?: string; userId: string }) => {
    const user = socket.user;
    if (!user || (user.role !== 'admin' && user.role !== 'instructor' && user.role !== 'mentor')) {
      return;
    }
    const classId = data.liveClassId || data.classId;
    const roomName = `live-class:${classId}`;
    logger.info(`[SOCKET] Instructor ${user.name} kicked participant ${data.userId} from room ${roomName}`);

    const roomMap = activeRoomPresences.get(classId);
    if (roomMap) {
      for (const [sId, participant] of roomMap.entries()) {
        if (participant.userId === data.userId) {
          const targetSocket = io.sockets.sockets?.get(sId);
          if (targetSocket) {
            targetSocket.emit('kicked', { message: 'You have been removed from this live class by the instructor.' });
            targetSocket.leave(roomName);
          }
          roomMap.delete(sId);

          const currentRoster = getRoomParticipants(classId);
          io.to(roomName).emit('user_left', {
            userId: participant.userId,
            name: participant.name,
            role: participant.role,
          });
          io.to(roomName).emit('liveClass:presence', {
            onlineCount: currentRoster.length,
            participants: currentRoster.map((p) => ({ userId: p.userId, name: p.name, role: p.role })),
          });
          io.to(roomName).emit('participants_update', {
            count: currentRoster.length,
            users: currentRoster.map((p) => ({ userId: p.userId, name: p.name, role: p.role })),
          });
          break;
        }
      }
    }
  });

  // 7. WebRTC Track State Sync
  socket.on('webrtc_track_change', (data: { classId: string; liveClassId?: string; userId?: string; isAudioOn: boolean; isVideoOn: boolean; isScreenSharing: boolean }) => {
    const user = socket.user;
    const classId = data.liveClassId || data.classId;
    const roomName = `live-class:${classId}`;
    socket.to(roomName).emit('webrtc_track_change', {
      userId: user?.uid || user?.id || data.userId,
      isAudioOn: data.isAudioOn,
      isVideoOn: data.isVideoOn,
      isScreenSharing: data.isScreenSharing,
    });
  });

  // 8. Typing Indicator Sync
  socket.on('typing_status', (data: { classId: string; liveClassId?: string; isTyping: boolean }) => {
    const user = socket.user;
    const classId = data.liveClassId || data.classId;
    const roomName = `live-class:${classId}`;
    socket.to(roomName).emit('typing_received', {
      userName: user?.name || 'User',
      isTyping: data.isTyping,
    });
  });

  // 9. Handle Disconnection
  socket.on('disconnect', () => {
    activeRoomPresences.forEach((roomMap, classId) => {
      if (roomMap.has(socket.id)) {
        const leftParticipant = roomMap.get(socket.id);
        roomMap.delete(socket.id);

        const roomName = `live-class:${classId}`;
        const currentRoster = getRoomParticipants(classId);

        io.to(roomName).emit('liveClass:presence', {
          onlineCount: currentRoster.length,
          participants: currentRoster.map((p) => ({ userId: p.userId, name: p.name, role: p.role })),
        });

        io.to(roomName).emit('participants_update', {
          count: currentRoster.length,
          users: currentRoster.map((p) => ({ userId: p.userId, name: p.name, role: p.role })),
        });

        if (leftParticipant) {
          io.to(roomName).emit('student:left', {
            userId: leftParticipant.userId,
            name: leftParticipant.name,
            role: leftParticipant.role,
            timestamp: new Date().toISOString(),
          });
          io.to(roomName).emit('user_left', {
            userId: leftParticipant.userId,
            name: leftParticipant.name,
            role: leftParticipant.role,
          });
        }
      }
    });
  });
};
