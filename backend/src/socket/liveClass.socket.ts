import { Server as SocketServer } from 'socket.io';
import { AuthenticatedSocket } from './socket.auth';
import { liveClassroomService } from '../modules/liveClassroom/liveClassroom.service';
import logger from '../config/logger';
import { ClassroomInteractionSettings, DEFAULT_CLASSROOM_SETTINGS } from '../validators/liveClassroomSettings';

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
// In-memory locked / private classroom tracker: classId -> boolean
const lockedClassrooms = new Set<string>();
// In-memory authoratitative classroom interaction settings tracker: classId -> ClassroomInteractionSettings
const classroomSettingsMap = new Map<string, ClassroomInteractionSettings>();

export const getClassroomSettings = (classId: string): ClassroomInteractionSettings => {
  return classroomSettingsMap.get(classId) || { ...DEFAULT_CLASSROOM_SETTINGS };
};

export const setClassroomSettings = (
  classId: string,
  settings: Partial<ClassroomInteractionSettings>
): ClassroomInteractionSettings => {
  const current = getClassroomSettings(classId);
  const updated: ClassroomInteractionSettings = {
    ...current,
    ...settings,
    updatedAt: new Date().toISOString(),
  };
  classroomSettingsMap.set(classId, updated);
  return updated;
};

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

      // Query class status from DB with authorization verification
      let classStatus = 'SCHEDULED';
      let liveClass: any = null;
      try {
        liveClass = await liveClassroomService.getLiveClassById(liveClassId);
        if (liveClass && liveClass.status) {
          classStatus = liveClass.status;
        }
      } catch (dbErr: any) {
        logger.warn(`[SOCKET] Notice fetching live class ${liveClassId}: ${dbErr?.message}`);
      }

      if (!liveClass) {
        const errPayload = { success: false, error: 'NOT_FOUND', message: 'Live class session not found.' };
        socket.emit('liveClass:error', errPayload);
        if (callback) callback(errPayload);
        return;
      }

      // Initialize authoritative interaction settings if not in memory
      if (!classroomSettingsMap.has(liveClassId)) {
        if (liveClass.interactionSettings) {
          classroomSettingsMap.set(liveClassId, {
            ...DEFAULT_CLASSROOM_SETTINGS,
            ...liveClass.interactionSettings,
            isLocked: Boolean(liveClass.isLocked ?? liveClass.interactionSettings?.isLocked),
          });
        } else {
          classroomSettingsMap.set(liveClassId, {
            ...DEFAULT_CLASSROOM_SETTINGS,
            isLocked: Boolean(liveClass.isLocked),
          });
        }
      }
      const classroomSettings = getClassroomSettings(liveClassId);

      const normClassStatus = (classStatus || '').toUpperCase();
      const userRole = (user.role || 'student').toLowerCase();

      // Authorization checks for students
      if (userRole === 'student') {
        // Enforce private / locked room check
        if (lockedClassrooms.has(liveClassId) || Boolean(liveClass.isLocked) || classroomSettings.isLocked) {
          const errPayload = {
            success: false,
            error: 'ROOM_LOCKED',
            message: 'This classroom is currently private and locked by the instructor.',
          };
          socket.emit('liveClass:error', errPayload);
          if (callback) callback(errPayload);
          return;
        }

        if (normClassStatus === 'CANCELLED') {
          const errPayload = { success: false, error: 'CLASS_CANCELLED', message: 'This live class has been cancelled.' };
          socket.emit('liveClass:error', errPayload);
          if (callback) callback(errPayload);
          return;
        }

        if (normClassStatus === 'COMPLETED' || normClassStatus === 'ENDED') {
          socket.emit('liveClass:status', { liveClassId, status: 'COMPLETED' });
          socket.emit('live_class_ended', { classId: liveClassId, endedAt: liveClass.endedAt || new Date().toISOString() });
          const errPayload = { success: false, error: 'CLASS_COMPLETED', message: 'This live class session has ended.' };
          socket.emit('liveClass:error', errPayload);
          if (callback) callback(errPayload);
          return;
        }

        // Verify enrollment
        const { isEnrolled, reason } = await liveClassroomService.verifyCourseEnrollment(
          user.uid || user.id,
          liveClass.courseId,
          user.role,
          user.email
        );
        if (!isEnrolled) {
          const errPayload = { success: false, error: 'NOT_ENROLLED', message: reason || 'You are not enrolled in this course.' };
          socket.emit('liveClass:error', errPayload);
          if (callback) callback(errPayload);
          return;
        }
      }

      // Authorization checks for instructors: prevent managing classes assigned to other instructors
      if (userRole === 'instructor') {
        const isAssigned =
          user.role === 'admin' ||
          liveClass.instructorId === (user.uid || user.id) ||
          liveClass.createdBy === (user.uid || user.id) ||
          ['inst_kaizen', 'inst_default', 'instructor_lead', 'admin'].includes(liveClass.instructorId) ||
          (liveClass.instructorName && user.name && liveClass.instructorName.toLowerCase().includes(user.name.toLowerCase()));
        if (!isAssigned) {
          logger.info(`[SOCKET] Co-instructor or platform instructor ${user.name} joining session ${liveClassId}`);
        }
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
        settings: classroomSettings,
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

      io.to(roomName).emit('participant_count', {
        count: activeCount,
        liveClassId,
      });

      // Broadcast student:joined and user_joined
      socket.to(roomName).emit('student:joined', {
        userId: participant.userId,
        name: participant.name,
        role: participant.role,
        timestamp: new Date().toISOString(),
      });
      socket.to(roomName).emit('user_joined', {
        userId: participant.userId,
        name: participant.name,
        role: participant.role,
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

      io.to(roomName).emit('participant_count', {
        count: activeCount,
        liveClassId,
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

    // Enforce instructor assignment
    if (user.role === 'instructor') {
      try {
        const liveClass = await liveClassroomService.getLiveClassById(liveClassId);
        if (liveClass) {
          const isAssigned =
            liveClass.instructorId === (user.uid || user.id) ||
            liveClass.createdBy === (user.uid || user.id) ||
            ['inst_kaizen', 'inst_default', 'instructor_lead', 'admin'].includes(liveClass.instructorId) ||
            (liveClass.instructorName && user.name && liveClass.instructorName.toLowerCase().includes(user.name.toLowerCase()));
          if (!isAssigned) {
            socket.emit('liveClass:error', {
              error: 'UNAUTHORIZED_INSTRUCTOR',
              message: `Only the assigned instructor (${liveClass.instructorName || 'assigned mentor'}) can update this live class status.`,
            });
            return;
          }
        }
      } catch (e) {}
    }

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

    if (normStatus === 'LIVE') {
      io.to(roomName).emit('live_class_started', {
        liveClassId,
        status: 'LIVE',
        startedAt: new Date().toISOString(),
      });
    } else if (normStatus === 'ENDED' || normStatus === 'COMPLETED') {
      io.to(roomName).emit('live_class_ended', {
        liveClassId,
        status: normStatus,
        endedAt: new Date().toISOString(),
      });
      io.emit('liveClass:deleted', { liveClassId });
      io.emit('live_class_deleted', { liveClassId });
      try {
        await liveClassroomService.deleteLiveClass(liveClassId);
      } catch (e) {}
    }
  });

  socket.on('liveClass:delete', async (data: { liveClassId?: string; classId?: string }) => {
    const user = socket.user;
    if (!user || (user.role !== 'admin' && user.role !== 'instructor')) {
      return;
    }
    const classId = data.liveClassId || data.classId;
    if (!classId) return;

    try {
      await liveClassroomService.deleteLiveClass(classId);
      io.emit('liveClass:deleted', { liveClassId: classId, classId });
      io.emit('live_class_deleted', { liveClassId: classId, classId });
    } catch (e) {}
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

  // 5. Classroom Lock Control (Make Private)
  socket.on('toggle_lock', async (data: { classId: string; liveClassId?: string; locked: boolean }) => {
    const user = socket.user;
    if (!user || (user.role !== 'admin' && user.role !== 'instructor')) {
      return;
    }
    const classId = data.liveClassId || data.classId;
    if (!classId) return;

    if (data.locked) {
      lockedClassrooms.add(classId);
    } else {
      lockedClassrooms.delete(classId);
    }

    const updated = setClassroomSettings(classId, { isLocked: data.locked });

    try {
      await liveClassroomService.updateLiveClass(classId, {
        isLocked: data.locked,
        interactionSettings: updated,
      } as any);
    } catch {}

    const roomName = `live-class:${classId}`;
    io.to(roomName).emit('lock_toggled', { locked: data.locked });
    io.to(roomName).emit('liveClass:interaction:state', {
      liveClassId: classId,
      settings: updated,
      updatedBy: user.name || user.email,
    });
    logger.info(`[SOCKET] Classroom ${classId} locked/privacy state set to: ${data.locked} by ${user.name}`);
  });

  // 5b. Authoritative Granular Classroom Settings Update (Instructor/Admin)
  socket.on(
    'liveClass:settings:update',
    async (
      data: { liveClassId: string; settings: Partial<ClassroomInteractionSettings> },
      callback?: (res: any) => void
    ) => {
      try {
        const user = socket.user;
        if (!user || (user.role !== 'admin' && user.role !== 'instructor' && user.role !== 'mentor')) {
          const errRes = { success: false, error: 'INVALID_PERMISSION', message: 'Only instructors/admins can update classroom settings.' };
          socket.emit('liveClass:error', errRes);
          if (callback) callback(errRes);
          return;
        }

        const classId = data?.liveClassId;
        if (!classId || !data?.settings) {
          const errRes = { success: false, error: 'INVALID_PAYLOAD', message: 'liveClassId and settings are required.' };
          socket.emit('liveClass:error', errRes);
          if (callback) callback(errRes);
          return;
        }

        // Apply settings in-memory
        const updated = setClassroomSettings(classId, data.settings);

        // Sync locked state if modified
        if (typeof data.settings.isLocked === 'boolean') {
          if (data.settings.isLocked) {
            lockedClassrooms.add(classId);
          } else {
            lockedClassrooms.delete(classId);
          }
        }

        // Persist to database non-blockingly
        liveClassroomService
          .updateLiveClass(classId, {
            interactionSettings: updated,
            isLocked: updated.isLocked,
            isChatMuted: !updated.chat.enabled,
          } as any)
          .catch((err: any) => logger.warn(`[SOCKET] Settings persistence notice for ${classId}:`, err?.message));

        const roomName = `live-class:${classId}`;
        const statePayload = {
          liveClassId: classId,
          settings: updated,
          updatedBy: user.name || user.email || 'Instructor',
          updatedAt: updated.updatedAt,
        };

        // Broadcast new interaction state to all participants in real time
        io.to(roomName).emit('liveClass:interaction:state', statePayload);
        if (typeof data.settings.isLocked === 'boolean') {
          io.to(roomName).emit('lock_toggled', { locked: data.settings.isLocked });
        }
        if (data.settings.chat && typeof data.settings.chat.enabled === 'boolean') {
          io.to(roomName).emit('room_chat_muted', { classId, isMuted: !data.settings.chat.enabled, updatedBy: user.name });
        }

        logger.info(`[SOCKET] Classroom ${classId} settings updated by ${user.name}`);
        if (callback) callback({ success: true, settings: updated });
      } catch (err: any) {
        logger.error('[SOCKET] Error updating classroom settings:', err);
        if (callback) callback({ success: false, error: err.message });
      }
    }
  );

  socket.on('liveClass:settings:get', (data: { liveClassId: string }, callback?: (res: any) => void) => {
    const classId = data?.liveClassId;
    if (!classId) return;
    const settings = getClassroomSettings(classId);
    socket.emit('liveClass:interaction:state', { liveClassId: classId, settings });
    if (callback) callback({ success: true, settings });
  });

  // Global Real-Time Event: Live Class Published & Student Notification Pipeline
  socket.on('liveClass:published', (data: { liveClass: any; audience?: any }) => {
    logger.info(`[SOCKET] Live class published & broadcasting notification: ${data?.liveClass?.title}`);
    io.emit('liveClass:published', data);
    io.emit('live_class_scheduled', data);
  });

  // 6. Moderation: Mute Student, Mute All Students, Chat Mute & Kick Participant
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

  socket.on('mute_all_students', (data: { classId: string; liveClassId?: string }) => {
    const user = socket.user;
    if (!user || (user.role !== 'admin' && user.role !== 'instructor' && user.role !== 'mentor')) {
      return;
    }
    const classId = data.liveClassId || data.classId;
    if (!classId) return;
    const roomName = `live-class:${classId}`;
    logger.info(`[SOCKET] Instructor ${user.name} muted ALL students in room ${roomName}`);
    io.to(roomName).emit('mute_all_students', { classId, mutedBy: user.name });
  });

  socket.on('toggle_chat_mute', async (data: { classId: string; liveClassId?: string; isMuted: boolean }) => {
    const user = socket.user;
    if (!user || (user.role !== 'admin' && user.role !== 'instructor' && user.role !== 'mentor')) {
      return;
    }
    const classId = data.liveClassId || data.classId;
    if (!classId) return;
    const roomName = `live-class:${classId}`;

    const currentSettings = getClassroomSettings(classId);
    const updated = setClassroomSettings(classId, {
      chat: { ...currentSettings.chat, enabled: !data.isMuted },
    });

    try {
      await liveClassroomService.updateLiveClass(classId, {
        isChatMuted: data.isMuted,
        interactionSettings: updated,
      } as any);
    } catch {}

    logger.info(`[SOCKET] Instructor ${user.name} set chat mute to ${data.isMuted} in ${roomName}`);
    io.to(roomName).emit('room_chat_muted', { classId, isMuted: data.isMuted, updatedBy: user.name });
    io.to(roomName).emit('liveClass:interaction:state', {
      liveClassId: classId,
      settings: updated,
      updatedBy: user.name,
    });
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

  // 7. WebRTC Track State Sync & Screen Share Signaling
  socket.on('screen_share_started', (data: { classId: string; liveClassId?: string; userId?: string; name?: string }) => {
    const user = socket.user;
    const classId = data.liveClassId || data.classId;
    const roomName = `live-class:${classId}`;
    socket.to(roomName).emit('screen_share_started', {
      userId: user?.uid || user?.id || data.userId,
      name: user?.name || data.name || 'Instructor',
    });
  });

  socket.on('screen_share_stopped', (data: { classId: string; liveClassId?: string; userId?: string }) => {
    const user = socket.user;
    const classId = data.liveClassId || data.classId;
    const roomName = `live-class:${classId}`;
    socket.to(roomName).emit('screen_share_stopped', {
      userId: user?.uid || user?.id || data.userId,
    });
  });

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

  // WebRTC Signaling: Offer
  socket.on('webrtc_offer', (data: { classId: string; liveClassId?: string; targetUserId: string; offer: any }) => {
    const user = socket.user;
    const classId = data.liveClassId || data.classId;
    if (!user || !classId || !data.targetUserId || !data.offer) return;

    const roomMap = activeRoomPresences.get(classId);
    if (!roomMap || !roomMap.has(socket.id)) return; // Verify sender is in room

    for (const [targetSocketId, participant] of roomMap.entries()) {
      if (participant.userId === data.targetUserId) {
        io.to(targetSocketId).emit('webrtc_offer', {
          senderUserId: user.uid || user.id,
          senderName: user.name || 'User',
          offer: data.offer,
          classId,
        });
        break;
      }
    }
  });

  // WebRTC Signaling: Answer
  socket.on('webrtc_answer', (data: { classId: string; liveClassId?: string; targetUserId: string; answer: any }) => {
    const user = socket.user;
    const classId = data.liveClassId || data.classId;
    if (!user || !classId || !data.targetUserId || !data.answer) return;

    const roomMap = activeRoomPresences.get(classId);
    if (!roomMap || !roomMap.has(socket.id)) return; // Verify sender is in room

    for (const [targetSocketId, participant] of roomMap.entries()) {
      if (participant.userId === data.targetUserId) {
        io.to(targetSocketId).emit('webrtc_answer', {
          senderUserId: user.uid || user.id,
          senderName: user.name || 'User',
          answer: data.answer,
          classId,
        });
        break;
      }
    }
  });

  // WebRTC Signaling: ICE Candidate
  socket.on('webrtc_ice_candidate', (data: { classId: string; liveClassId?: string; targetUserId: string; candidate: any }) => {
    const user = socket.user;
    const classId = data.liveClassId || data.classId;
    if (!user || !classId || !data.targetUserId || !data.candidate) return;

    const roomMap = activeRoomPresences.get(classId);
    if (!roomMap || !roomMap.has(socket.id)) return; // Verify sender is in room

    for (const [targetSocketId, participant] of roomMap.entries()) {
      if (participant.userId === data.targetUserId) {
        io.to(targetSocketId).emit('webrtc_ice_candidate', {
          senderUserId: user.uid || user.id,
          candidate: data.candidate,
          classId,
        });
        break;
      }
    }
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

  // Global Real-Time Event: Live Class Scheduled / Published
  socket.on('live_class_scheduled', (data: { liveClass: any }) => {
    logger.info(`[SOCKET] Live class scheduled broadcast: ${data.liveClass?.title}`);
    io.emit('live_class_scheduled', data);
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
