import { Server as SocketServer } from 'socket.io';
import { AuthenticatedSocket } from './socket.auth';
import { liveClassroomService } from '../modules/liveClassroom/liveClassroom.service';
import { notificationService } from '../modules/notifications/notification.service';
import logger from '../config/logger';
import { ClassroomInteractionSettings, DEFAULT_CLASSROOM_SETTINGS } from '../validators/liveClassroomSettings';

export interface ParticipantInfo {
  socketId: string;
  userId: string;
  name: string;
  role: string;
  email?: string;
  joinedAt: Date;
  isAudioOn?: boolean;
  isVideoOn?: boolean;
  isScreenSharing?: boolean;
  isSpeaking?: boolean;
  audioLevel?: number;
  isMutedByInstructor?: boolean;
  micPermission?: 'prompt' | 'granted' | 'denied';
  isPinned?: boolean;
}

export interface ActiveSpeakerState {
  userId: string;
  name: string;
  role: string;
  startedAt: number;
  audioLevel: number;
}

export interface ActiveScreenShareState {
  userId: string;
  name: string;
  startedAt: string;
}

export interface ModerationRecord {
  mutedByInstructor: boolean;
  micPermission: 'prompt' | 'granted' | 'denied';
  chatPermission?: 'granted' | 'denied';
  updatedAt: string;
}

// In-memory active presence tracker: classId -> Map<socketId, ParticipantInfo>
const activeRoomPresences = new Map<string, Map<string, ParticipantInfo>>();
// In-memory locked / private classroom tracker: classId -> boolean
const lockedClassrooms = new Set<string>();
// In-memory authoratitative classroom interaction settings tracker: classId -> ClassroomInteractionSettings
const classroomSettingsMap = new Map<string, ClassroomInteractionSettings>();

// In-memory authoritative active speaker tracker: classId -> ActiveSpeakerState | null
const activeRoomSpeakers = new Map<string, ActiveSpeakerState | null>();
// In-memory authoritative screen share tracker: classId -> ActiveScreenShareState | null
const activeRoomScreenShares = new Map<string, ActiveScreenShareState | null>();
// In-memory authoritative pinned participant tracker: classId -> string (userId) | null
const activeRoomPinned = new Map<string, string | null>();
// In-memory authoritative student moderation state: classId -> Map<userId, ModerationRecord>
const activeRoomModeration = new Map<string, Map<string, ModerationRecord>>();

export const getRoomActiveSpeaker = (classId: string): ActiveSpeakerState | null => {
  return activeRoomSpeakers.get(classId) || null;
};

export const getRoomScreenShare = (classId: string): ActiveScreenShareState | null => {
  return activeRoomScreenShares.get(classId) || null;
};

export const getRoomPinned = (classId: string): string | null => {
  return activeRoomPinned.get(classId) || null;
};

export const getModerationRecord = (classId: string, userId: string, role?: string): ModerationRecord => {
  const roomMod = activeRoomModeration.get(classId);
  if (roomMod && roomMod.has(userId)) {
    return roomMod.get(userId)!;
  }
  const isStudent = (role || '').toLowerCase() === 'student';
  return {
    mutedByInstructor: isStudent,
    micPermission: isStudent ? 'denied' : 'granted',
    chatPermission: isStudent ? 'denied' : 'granted',
    updatedAt: new Date().toISOString(),
  };
};

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
  if (!roomMap) return [];
  // Authoritative deduplication by userId to prevent ghost sockets on reconnect
  const seenUsers = new Set<string>();
  const list: ParticipantInfo[] = [];
  for (const p of roomMap.values()) {
    if (p.userId && !seenUsers.has(p.userId)) {
      seenUsers.add(p.userId);
      list.push(p);
    }
  }
  return list;
};

export const isInstructorActiveInRoom = (classId: string): boolean => {
  const roomMap = activeRoomPresences.get(classId);
  if (!roomMap || roomMap.size === 0) return false;
  for (const p of roomMap.values()) {
    if (p.role === 'instructor' || p.role === 'admin' || p.role === 'mentor') {
      return true;
    }
  }
  return false;
};

export const registerLiveClassHandlers = (io: SocketServer, socket: AuthenticatedSocket) => {
  // Helper to handle room join logic uniformly
  const processJoin = async (liveClassId: string, customName?: string, callback?: (res: any) => void) => {
    try {
      const user = socket.user;
      if (!liveClassId || !user) {
        logger.warn(`[LiveClass][JOIN_REJECTED] classId=${liveClassId || 'UNKNOWN'} userUid=ANONYMOUS reason=AUTH_REQUIRED`);
        const errPayload = { success: false, error: 'UNAUTHORIZED_SOCKET', message: 'Authentication required' };
        socket.emit('liveClass:error', errPayload);
        if (callback) callback(errPayload);
        return;
      }

      const userUid = user.uid || user.id;
      const userRole = (user.role || 'student').toLowerCase();
      const roomName = `live-class:${liveClassId}`;

      // --- 1. IDEMPOTENCY CHECK: If this exact socket has already joined this class room, return snapshot and skip duplicate events ---
      const existingRoomMap = activeRoomPresences.get(liveClassId);
      if (existingRoomMap && existingRoomMap.has(socket.id)) {
        logger.info(`[LIVE_CLASS_JOIN_DEDUP] classId=${liveClassId} userUid=${userUid} socketId=${socket.id}`);
        if (!socket.rooms.has(roomName)) {
          socket.join(roomName);
        }
        const currentRoster = getRoomParticipants(liveClassId);
        const activeCount = currentRoster.length;
        const formattedParticipants = currentRoster.map((p) => ({
          userId: p.userId,
          name: p.name,
          role: p.role,
          isAudioOn: p.isAudioOn ?? false,
          isVideoOn: p.isVideoOn ?? false,
          isScreenSharing: p.isScreenSharing ?? false,
          isSpeaking: p.isSpeaking ?? false,
          audioLevel: p.audioLevel ?? 0,
          isMutedByInstructor: p.isMutedByInstructor ?? false,
          micPermission: p.micPermission ?? 'prompt',
          isPinned: p.isPinned ?? false,
        }));
        const existingClass = await liveClassroomService.getLiveClassById(liveClassId).catch(() => null);
        const classroomSettings = getClassroomSettings(liveClassId);
        const successPayload = {
          success: true,
          liveClassId,
          roomName,
          status: (existingClass?.status || 'SCHEDULED').toUpperCase(),
          onlineCount: activeCount,
          participants: formattedParticipants,
          settings: classroomSettings,
          activeSpeaker: getRoomActiveSpeaker(liveClassId),
          screenShare: getRoomScreenShare(liveClassId),
          pinnedUserId: getRoomPinned(liveClassId),
        };
        socket.emit('liveClass:joined', successPayload);
        if (callback) callback(successPayload);
        return;
      }

      // --- 2. RECONNECT RECONCILIATION: Check if user is reconnecting from an older socket ID ---
      if (existingRoomMap) {
        for (const [sId, p] of existingRoomMap.entries()) {
          if (p.userId === userUid && sId !== socket.id) {
            logger.info(`[LIVE_CLASS_RECONNECT] classId=${liveClassId} userUid=${userUid} oldSocketId=${sId} newSocketId=${socket.id}`);
            existingRoomMap.delete(sId);
          }
        }
      }

      logger.info(`[LIVE_CLASS_JOIN] classId=${liveClassId} userUid=${userUid} role=${userRole}`);

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
        logger.warn(`[LiveClass][JOIN_REJECTED] classId=${liveClassId} userUid=${userUid} reason=CLASS_NOT_FOUND`);
        const errPayload = { success: false, error: 'CLASS_NOT_FOUND', message: 'Live class session not found.' };
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

      // Authorization checks for students
      if (userRole === 'student') {
        // Enforce private / locked room check
        if (lockedClassrooms.has(liveClassId) || Boolean(liveClass.isLocked) || classroomSettings.isLocked) {
          logger.warn(`[LiveClass][JOIN_REJECTED] classId=${liveClassId} userUid=${userUid} reason=ROOM_LOCKED`);
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
          logger.warn(`[LiveClass][JOIN_REJECTED] classId=${liveClassId} userUid=${userUid} reason=CLASS_CANCELLED`);
          const errPayload = { success: false, error: 'CLASS_CANCELLED', message: 'This live class has been cancelled.' };
          socket.emit('liveClass:error', errPayload);
          if (callback) callback(errPayload);
          return;
        }

        if (normClassStatus === 'COMPLETED' || normClassStatus === 'ENDED') {
          socket.emit('liveClass:status', { liveClassId, status: 'COMPLETED' });
          socket.emit('live_class_ended', { classId: liveClassId, endedAt: liveClass.endedAt || new Date().toISOString() });
          logger.warn(`[LiveClass][JOIN_REJECTED] classId=${liveClassId} userUid=${userUid} reason=CLASS_COMPLETED`);
          const errPayload = { success: false, error: 'CLASS_COMPLETED', message: 'This live class session has ended.' };
          socket.emit('liveClass:error', errPayload);
          if (callback) callback(errPayload);
          return;
        }

        // Verify enrollment
        const { isEnrolled, reason } = await liveClassroomService.verifyCourseEnrollment(
          userUid,
          liveClass.courseId,
          user.role,
          user.email
        );
        logger.info(`[LiveClass][ENROLLMENT] classId=${liveClassId} userUid=${userUid} result=${isEnrolled ? 'ALLOWED' : 'REJECTED'}`);
        if (!isEnrolled) {
          logger.warn(`[LiveClass][JOIN_REJECTED] classId=${liveClassId} userUid=${userUid} reason=NOT_ENROLLED`);
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
          liveClass.instructorId === userUid ||
          liveClass.createdBy === userUid ||
          ['inst_kaizen', 'inst_default', 'instructor_lead', 'admin'].includes(liveClass.instructorId) ||
          (liveClass.instructorName && user.name && liveClass.instructorName.toLowerCase().includes(user.name.toLowerCase()));
        if (!isAssigned) {
          logger.info(`[LiveClass][AUTH] Co-instructor or platform instructor ${user.name} joining session ${liveClassId}`);
        } else {
          logger.info(`[LiveClass][AUTH] Authorized instructor ${user.name} verified for session ${liveClassId}`);
        }
      }

      socket.join(roomName);
      logger.info(`[LiveClass][ROOM_JOIN] classId=${liveClassId} userUid=${userUid} room=${roomName}`);

      // Track presence
      if (!activeRoomPresences.has(liveClassId)) {
        activeRoomPresences.set(liveClassId, new Map());
      }

      const roomMap = activeRoomPresences.get(liveClassId)!;
      // Remove stale socket ID for the same user if reconnecting
      for (const [sId, p] of roomMap.entries()) {
        if (p.userId === userUid && sId !== socket.id) {
          roomMap.delete(sId);
        }
      }

      if (!activeRoomModeration.has(liveClassId)) {
        activeRoomModeration.set(liveClassId, new Map());
      }
      const roomMod = activeRoomModeration.get(liveClassId)!;
      if (!roomMod.has(userUid)) {
        const isStudent = userRole === 'student';
        roomMod.set(userUid, {
          mutedByInstructor: isStudent,
          micPermission: isStudent ? 'denied' : 'granted',
          chatPermission: isStudent ? 'denied' : 'granted',
          updatedAt: new Date().toISOString(),
        });
      }
      const modRecord = roomMod.get(userUid)!;
      const isPinned = getRoomPinned(liveClassId) === userUid;
      const currentScreenShare = getRoomScreenShare(liveClassId);
      const isScreenSharing = currentScreenShare?.userId === userUid;

      const participant: ParticipantInfo = {
        socketId: socket.id,
        userId: userUid,
        name: customName || user.name || 'Student',
        role: user.role || 'student',
        email: user.email,
        joinedAt: new Date(),
        isAudioOn: false,
        isVideoOn: false,
        isScreenSharing,
        isSpeaking: false,
        audioLevel: 0,
        isMutedByInstructor: modRecord.mutedByInstructor,
        micPermission: modRecord.micPermission,
        isPinned,
      };
      roomMap.set(socket.id, participant);
      logger.info(`[LiveClass][PRESENCE] classId=${liveClassId} userUid=${userUid} action=JOIN`);

      const currentRoster = getRoomParticipants(liveClassId);
      const activeCount = currentRoster.length;

      const formattedParticipants = currentRoster.map((p) => {
        const pMod = getModerationRecord(liveClassId, p.userId, p.role);
        return {
          userId: p.userId,
          name: p.name,
          role: p.role,
          isAudioOn: p.isAudioOn ?? false,
          isVideoOn: p.isVideoOn ?? false,
          isScreenSharing: p.isScreenSharing ?? false,
          isSpeaking: p.isSpeaking ?? false,
          audioLevel: p.audioLevel ?? 0,
          isMutedByInstructor: pMod.mutedByInstructor,
          micPermission: pMod.micPermission,
          chatPermission: pMod.chatPermission,
          isPinned: p.isPinned ?? false,
        };
      });

      // Check whether instructor is actively connected to socket room
      const isInstructorOnline = isInstructorActiveInRoom(liveClassId);

      // Respond to joiner with full authoritative state snapshot
      const successPayload = {
        success: true,
        liveClassId,
        roomName,
        status: normClassStatus || 'SCHEDULED',
        isInstructorOnline,
        onlineCount: activeCount,
        participants: formattedParticipants,
        settings: classroomSettings,
        activeSpeaker: getRoomActiveSpeaker(liveClassId),
        screenShare: currentScreenShare,
        pinnedUserId: getRoomPinned(liveClassId),
        moderation: modRecord,
      };
      socket.emit('liveClass:joined', successPayload);
      if (callback) callback(successPayload);

      logger.info(`[LiveClass][JOIN_SUCCESS] classId=${liveClassId} userUid=${userUid} room=${roomName} isInstructorOnline=${isInstructorOnline} participantCount=${activeCount}`);

      // If joining participant is instructor/admin, notify all waiting students to auto-transition
      if (participant.role === 'instructor' || participant.role === 'admin' || participant.role === 'mentor') {
        logger.info(`[LiveClass][INSTRUCTOR_ONLINE] classId=${liveClassId} instructor=${participant.name}`);
        io.to(roomName).emit('liveClass:instructor_joined', {
          liveClassId,
          instructorId: participant.userId,
          name: participant.name,
          role: participant.role,
          timestamp: new Date().toISOString(),
        });
        io.to(roomName).emit('instructor:connected', {
          liveClassId,
          instructorId: participant.userId,
          name: participant.name,
          role: participant.role,
        });

        // Automatically transition scheduled class to LIVE upon instructor presence
        if (normClassStatus === 'SCHEDULED') {
          (async () => {
            try {
              await liveClassroomService.startLiveClass(liveClassId);
              logger.info(`[LiveClass][AUTO_TRANSITION_LIVE] classId=${liveClassId} transitioned to LIVE on instructor connection`);
              const startPayload = {
                liveClassId,
                status: 'LIVE',
                startedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                updatedBy: participant.name,
              };
              io.to(roomName).emit('liveClass:status', startPayload);
              io.to(roomName).emit('live_class_started', startPayload);
              io.emit('liveClass:status', startPayload);
              io.emit('live_class_started', startPayload);
            } catch (autoErr: any) {
              logger.warn(`[LiveClass][AUTO_START_NOTICE] ${autoErr?.message || autoErr}`);
            }
          })();
        }
      }

      // Broadcast presence updates to entire room
      io.to(roomName).emit('liveClass:presence', {
        onlineCount: activeCount,
        participants: formattedParticipants,
        activeSpeaker: getRoomActiveSpeaker(liveClassId),
        screenShare: currentScreenShare,
        pinnedUserId: getRoomPinned(liveClassId),
      });

      io.to(roomName).emit('participants_update', {
        count: activeCount,
        users: formattedParticipants,
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

        if (leftParticipant.role === 'instructor' || leftParticipant.role === 'admin' || leftParticipant.role === 'mentor') {
          const remainingInstructor = isInstructorActiveInRoom(liveClassId);
          if (!remainingInstructor) {
            logger.info(`[LiveClass][INSTRUCTOR_OFFLINE] classId=${liveClassId} instructor=${leftParticipant.name}`);
            io.to(roomName).emit('liveClass:instructor_left', {
              liveClassId,
              instructorId: leftParticipant.userId,
              name: leftParticipant.name,
              timestamp: new Date().toISOString(),
            });
            io.to(roomName).emit('instructor:disconnected', {
              liveClassId,
              instructorId: leftParticipant.userId,
            });
          }
        }
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

    logger.info(`[LiveClass][START] classId=${liveClassId} instructorUid=${user.uid || user.id} status=${normStatus}`);

    // Persist status change in Firestore
    let classDoc: any = null;
    try {
      await liveClassroomService.updateLiveClass(liveClassId, {
        status: (normStatus === 'LIVE' ? 'Live' : normStatus === 'ENDED' ? 'Completed' : 'Scheduled') as any,
      });
      classDoc = await liveClassroomService.getLiveClassById(liveClassId);
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
      const liveStartPayload = {
        liveClassId,
        status: 'LIVE',
        liveClass: classDoc || { id: liveClassId, classId: liveClassId, status: 'LIVE' },
        startedAt: new Date().toISOString(),
      };
      io.to(roomName).emit('live_class_started', liveStartPayload);
      io.emit('live_class_started', liveStartPayload);

      // Trigger durable notification pipeline to eligible students for live start
      (async () => {
        try {
          if (!classDoc) {
            classDoc = await liveClassroomService.getLiveClassById(liveClassId);
          }
          if (classDoc) {
            await notificationService.dispatchLiveClassNotification(classDoc, 'STARTED', io);
          }
        } catch (notifErr: any) {
          logger.warn(`[SOCKET] Live class started notification pipeline error for ${liveClassId}:`, notifErr?.message || notifErr);
        }
      })();
    } else if (normStatus === 'ENDED' || normStatus === 'COMPLETED') {
      const endPayload = {
        liveClassId,
        classId: liveClassId,
        status: normStatus,
        endedAt: new Date().toISOString(),
      };
      io.to(roomName).emit('live_class_ended', endPayload);
      io.to(roomName).emit('session:ended', endPayload);
      io.to(roomName).emit('liveClass:ended', endPayload);
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
  socket.on('liveClass:published', async (data: { liveClass: any; audience?: any }) => {
    logger.info(`[SOCKET] Live class published & broadcasting notification: ${data?.liveClass?.title}`);
    io.emit('liveClass:published', data);
    io.emit('live_class_scheduled', data);

    // Persist to authoritative repository (upsert without changing canonical classId)
    try {
      if (data?.liveClass) {
        const targetId = data.liveClass.id || data.liveClass.classId;
        if (targetId) {
          const exists = await liveClassroomService.getLiveClassById(targetId);
          if (exists) {
            await liveClassroomService.updateLiveClass(targetId, data.liveClass);
          } else {
            await liveClassroomService.createLiveClass(data.liveClass);
          }
        }
      }
    } catch (repoErr: any) {
      logger.warn('[SOCKET] Error persisting liveClass on publish:', repoErr?.message || repoErr);
    }

    // Trigger durable notification pipeline to eligible students
    try {
      if (data?.liveClass) {
        await notificationService.dispatchLiveClassNotification(data.liveClass, 'PUBLISHED', io);
      }
    } catch (notifErr: any) {
      logger.warn('[SOCKET] Error in liveClass:published notification dispatch:', notifErr?.message || notifErr);
    }
  });

  // 6. Moderation: Mute Student, Mute All Students, Allow Mic, Ask to Unmute & Kick Participant
  socket.on('liveClass:moderation:mute', (data: { classId: string; liveClassId?: string; userId: string; reason?: string }) => {
    const user = socket.user;
    if (!user || (user.role !== 'admin' && user.role !== 'instructor' && user.role !== 'mentor')) {
      socket.emit('liveClass:error', { success: false, error: 'FORBIDDEN', message: 'Only instructors can moderate audio.' });
      return;
    }
    const classId = data.liveClassId || data.classId;
    if (!classId || !data.userId) return;
    const roomName = `live-class:${classId}`;

    if (!activeRoomModeration.has(classId)) activeRoomModeration.set(classId, new Map());
    activeRoomModeration.get(classId)!.set(data.userId, {
      mutedByInstructor: true,
      micPermission: 'denied',
      updatedAt: new Date().toISOString(),
    });

    const roomMap = activeRoomPresences.get(classId);
    if (roomMap) {
      for (const p of roomMap.values()) {
        if (p.userId === data.userId) {
          p.isMutedByInstructor = true;
          p.isAudioOn = false;
          p.isSpeaking = false;
        }
      }
    }

    logger.info(`[SOCKET] Instructor ${user.name} muted student ${data.userId} in room ${roomName}`);
    io.to(roomName).emit('liveClass:moderation:muted', {
      userId: data.userId,
      mutedBy: user.name,
      mutedByInstructor: true,
    });
    io.to(roomName).emit('student_muted', { userId: data.userId, isMuted: true });
    // Real-time audio track revocation at socket layer
    io.to(roomName).emit('webrtc_track_change', {
      userId: data.userId,
      isAudioOn: false,
      isVideoOn: false,
      isScreenSharing: false,
    });
    const currentSpeaker = activeRoomSpeakers.get(classId);
    if (currentSpeaker && currentSpeaker.userId === data.userId) {
      activeRoomSpeakers.set(classId, null);
      io.to(roomName).emit('liveClass:speaker:changed', null);
      io.to(roomName).emit('liveClass:speaker:stopped', { userId: data.userId });
    }
  });

  socket.on('mute_student', (data: { classId: string; liveClassId?: string; userId: string; isMuted: boolean }) => {
    const user = socket.user;
    if (!user || (user.role !== 'admin' && user.role !== 'instructor' && user.role !== 'mentor')) {
      return;
    }
    const classId = data.liveClassId || data.classId;
    if (!classId || !data.userId) return;
    const roomName = `live-class:${classId}`;

    if (!activeRoomModeration.has(classId)) activeRoomModeration.set(classId, new Map());
    activeRoomModeration.get(classId)!.set(data.userId, {
      mutedByInstructor: data.isMuted,
      micPermission: data.isMuted ? 'denied' : 'granted',
      updatedAt: new Date().toISOString(),
    });

    const roomMap = activeRoomPresences.get(classId);
    if (roomMap) {
      for (const p of roomMap.values()) {
        if (p.userId === data.userId) {
          p.isMutedByInstructor = data.isMuted;
          if (data.isMuted) {
            p.isAudioOn = false;
            p.isSpeaking = false;
          }
        }
      }
    }

    logger.info(`[SOCKET] Instructor ${user.name} set mute to ${data.isMuted} for student ${data.userId} in ${roomName}`);
    io.to(roomName).emit('student_muted', { userId: data.userId, isMuted: data.isMuted });
    io.to(roomName).emit('liveClass:moderation:muted', {
      userId: data.userId,
      mutedBy: user.name,
      mutedByInstructor: data.isMuted,
    });
    if (data.isMuted) {
      io.to(roomName).emit('webrtc_track_change', {
        userId: data.userId,
        isAudioOn: false,
        isVideoOn: false,
        isScreenSharing: false,
      });
      const currentSpeaker = activeRoomSpeakers.get(classId);
      if (currentSpeaker && currentSpeaker.userId === data.userId) {
        activeRoomSpeakers.set(classId, null);
        io.to(roomName).emit('liveClass:speaker:changed', null);
        io.to(roomName).emit('liveClass:speaker:stopped', { userId: data.userId });
      }
    }
  });

  socket.on('liveClass:moderation:muteAll', (data: { classId: string; liveClassId?: string }) => {
    const user = socket.user;
    if (!user || (user.role !== 'admin' && user.role !== 'instructor' && user.role !== 'mentor')) {
      socket.emit('liveClass:error', { success: false, error: 'FORBIDDEN', message: 'Only instructors can mute all students.' });
      return;
    }
    const classId = data.liveClassId || data.classId;
    if (!classId) return;
    const roomName = `live-class:${classId}`;

    if (!activeRoomModeration.has(classId)) activeRoomModeration.set(classId, new Map());
    const modMap = activeRoomModeration.get(classId)!;
    const roomMap = activeRoomPresences.get(classId);

    if (roomMap) {
      for (const p of roomMap.values()) {
        if (p.role !== 'admin' && p.role !== 'instructor' && p.role !== 'mentor') {
          p.isMutedByInstructor = true;
          p.isAudioOn = false;
          p.isSpeaking = false;
          modMap.set(p.userId, {
            mutedByInstructor: true,
            micPermission: 'denied',
            updatedAt: new Date().toISOString(),
          });
        }
      }
    }

    logger.info(`[SOCKET] Instructor ${user.name} muted ALL students in ${roomName}`);
    io.to(roomName).emit('liveClass:moderation:muteAll', { classId, mutedBy: user.name });
    io.to(roomName).emit('mute_all_students', { classId, mutedBy: user.name });
  });

  socket.on('mute_all_students', (data: { classId: string; liveClassId?: string }) => {
    const user = socket.user;
    if (!user || (user.role !== 'admin' && user.role !== 'instructor' && user.role !== 'mentor')) {
      return;
    }
    const classId = data.liveClassId || data.classId;
    if (!classId) return;
    const roomName = `live-class:${classId}`;

    if (!activeRoomModeration.has(classId)) activeRoomModeration.set(classId, new Map());
    const modMap = activeRoomModeration.get(classId)!;
    const roomMap = activeRoomPresences.get(classId);

    if (roomMap) {
      for (const p of roomMap.values()) {
        if (p.role !== 'admin' && p.role !== 'instructor' && p.role !== 'mentor') {
          p.isMutedByInstructor = true;
          p.isAudioOn = false;
          p.isSpeaking = false;
          modMap.set(p.userId, {
            mutedByInstructor: true,
            micPermission: 'denied',
            updatedAt: new Date().toISOString(),
          });
        }
      }
    }

    logger.info(`[SOCKET] Instructor ${user.name} muted ALL students in room ${roomName}`);
    io.to(roomName).emit('mute_all_students', { classId, mutedBy: user.name });
    io.to(roomName).emit('liveClass:moderation:muteAll', { classId, mutedBy: user.name });
  });

  socket.on('liveClass:moderation:allowMic', (data: { classId: string; liveClassId?: string; userId: string }) => {
    const user = socket.user;
    if (!user || (user.role !== 'admin' && user.role !== 'instructor' && user.role !== 'mentor')) {
      return;
    }
    const classId = data.liveClassId || data.classId;
    if (!classId || !data.userId) return;
    const roomName = `live-class:${classId}`;

    if (!activeRoomModeration.has(classId)) activeRoomModeration.set(classId, new Map());
    activeRoomModeration.get(classId)!.set(data.userId, {
      mutedByInstructor: false,
      micPermission: 'granted',
      updatedAt: new Date().toISOString(),
    });

    const roomMap = activeRoomPresences.get(classId);
    if (roomMap) {
      for (const p of roomMap.values()) {
        if (p.userId === data.userId) {
          p.isMutedByInstructor = false;
          p.micPermission = 'granted';
        }
      }
    }

    logger.info(`[SOCKET] Instructor ${user.name} allowed mic for student ${data.userId}`);
    io.to(roomName).emit('liveClass:moderation:micAllowed', {
      userId: data.userId,
      allowedBy: user.name,
    });
  });

  socket.on('liveClass:moderation:allowChat', (data: { classId: string; liveClassId?: string; userId: string }) => {
    const user = socket.user;
    if (!user || (user.role !== 'admin' && user.role !== 'instructor' && user.role !== 'mentor')) {
      return;
    }
    const classId = data.liveClassId || data.classId;
    if (!classId || !data.userId) return;
    const roomName = `live-class:${classId}`;

    if (!activeRoomModeration.has(classId)) activeRoomModeration.set(classId, new Map());
    const existing = activeRoomModeration.get(classId)!.get(data.userId) || { mutedByInstructor: false, micPermission: 'denied', updatedAt: new Date().toISOString() };
    activeRoomModeration.get(classId)!.set(data.userId, {
      ...existing,
      chatPermission: 'granted',
      updatedAt: new Date().toISOString(),
    });

    logger.info(`[SOCKET] Instructor ${user.name} allowed chat for student ${data.userId}`);
    io.to(roomName).emit('liveClass:moderation:chatAllowed', {
      userId: data.userId,
      allowedBy: user.name,
    });
  });

  socket.on('liveClass:moderation:muteChat', (data: { classId: string; liveClassId?: string; userId: string }) => {
    const user = socket.user;
    if (!user || (user.role !== 'admin' && user.role !== 'instructor' && user.role !== 'mentor')) {
      return;
    }
    const classId = data.liveClassId || data.classId;
    if (!classId || !data.userId) return;
    const roomName = `live-class:${classId}`;

    if (!activeRoomModeration.has(classId)) activeRoomModeration.set(classId, new Map());
    const existing = activeRoomModeration.get(classId)!.get(data.userId) || { mutedByInstructor: false, micPermission: 'denied', updatedAt: new Date().toISOString() };
    activeRoomModeration.get(classId)!.set(data.userId, {
      ...existing,
      chatPermission: 'denied',
      updatedAt: new Date().toISOString(),
    });

    logger.info(`[SOCKET] Instructor ${user.name} muted chat for student ${data.userId}`);
    io.to(roomName).emit('liveClass:moderation:chatMuted', {
      userId: data.userId,
      mutedBy: user.name,
    });
  });

  socket.on('liveClass:moderation:requestUnmute', (data: { classId: string; liveClassId?: string; userId: string }) => {
    const user = socket.user;
    if (!user || (user.role !== 'admin' && user.role !== 'instructor' && user.role !== 'mentor')) {
      return;
    }
    const classId = data.liveClassId || data.classId;
    if (!classId || !data.userId) return;

    // Allow the student's mic permission first
    if (!activeRoomModeration.has(classId)) activeRoomModeration.set(classId, new Map());
    activeRoomModeration.get(classId)!.set(data.userId, {
      mutedByInstructor: false,
      micPermission: 'granted',
      updatedAt: new Date().toISOString(),
    });

    const roomMap = activeRoomPresences.get(classId);
    if (roomMap) {
      for (const [sId, p] of roomMap.entries()) {
        if (p.userId === data.userId) {
          p.isMutedByInstructor = false;
          p.micPermission = 'granted';
          const targetSocket = io.sockets.sockets?.get(sId);
          if (targetSocket) {
            targetSocket.emit('liveClass:moderation:requestUnmute', {
              classId,
              instructorName: user.name || 'Instructor',
            });
          }
          break;
        }
      }
    }
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

  // 7. Active Speaker Detection State Synchronization
  socket.on('liveClass:speaker:started', (data: { classId: string; liveClassId?: string; audioLevel?: number }) => {
    const user = socket.user;
    const classId = data.liveClassId || data.classId;
    if (!user || !classId) return;

    const userId = user.uid || user.id;
    const roomName = `live-class:${classId}`;

    // Verify participant is not muted by instructor
    const modRecord = getModerationRecord(classId, userId);
    if (modRecord.mutedByInstructor) {
      return;
    }

    const roomMap = activeRoomPresences.get(classId);
    const participant = roomMap?.get(socket.id);
    if (participant) {
      participant.isSpeaking = true;
      participant.audioLevel = data.audioLevel ?? 0.8;
    }

    const speakerInfo: ActiveSpeakerState = {
      userId,
      name: participant?.name || user.name || 'Speaker',
      role: participant?.role || user.role || 'student',
      startedAt: Date.now(),
      audioLevel: data.audioLevel ?? 0.8,
    };
    activeRoomSpeakers.set(classId, speakerInfo);

    io.to(roomName).emit('liveClass:speaker:changed', speakerInfo);
    io.to(roomName).emit('liveClass:speaker:started', speakerInfo);
  });

  socket.on('liveClass:speaker:stopped', (data: { classId: string; liveClassId?: string }) => {
    const user = socket.user;
    const classId = data.liveClassId || data.classId;
    if (!user || !classId) return;

    const userId = user.uid || user.id;
    const roomName = `live-class:${classId}`;

    const roomMap = activeRoomPresences.get(classId);
    const participant = roomMap?.get(socket.id);
    if (participant) {
      participant.isSpeaking = false;
      participant.audioLevel = 0;
    }

    const currentSpeaker = activeRoomSpeakers.get(classId);
    if (currentSpeaker && currentSpeaker.userId === userId) {
      activeRoomSpeakers.set(classId, null);
      io.to(roomName).emit('liveClass:speaker:changed', null);
      io.to(roomName).emit('liveClass:speaker:stopped', { userId });
    }
  });

  // 8. Authoritative Screen Sharing Signaling
  socket.on('liveClass:screenShare:start', (data: { classId: string; liveClassId?: string }) => {
    const user = socket.user;
    const classId = data.liveClassId || data.classId;
    if (!user || !classId) return;

    const userRole = (user.role || '').toLowerCase();
    const classroomSettings = getClassroomSettings(classId);

    // Server-side permission check: Admin / Instructor / Mentor or student with permission
    const canShare =
      userRole === 'admin' ||
      userRole === 'instructor' ||
      userRole === 'mentor' ||
      Boolean(classroomSettings?.studentScreenShare?.enabled);

    if (!canShare) {
      socket.emit('liveClass:error', {
        success: false,
        error: 'SCREEN_SHARE_UNAUTHORIZED',
        message: 'Only instructors can share their screen in this classroom.',
      });
      return;
    }

    const roomName = `live-class:${classId}`;
    const shareInfo: ActiveScreenShareState = {
      userId: user.uid || user.id || 'instructor',
      name: user.name || 'Instructor',
      startedAt: new Date().toISOString(),
    };
    activeRoomScreenShares.set(classId, shareInfo);

    const roomMap = activeRoomPresences.get(classId);
    const p = roomMap?.get(socket.id);
    if (p) p.isScreenSharing = true;

    logger.info(`[SOCKET] Screen share started by ${shareInfo.name} in ${roomName}`);
    io.to(roomName).emit('liveClass:screenShare:started', shareInfo);
    socket.to(roomName).emit('screen_share_started', {
      userId: shareInfo.userId,
      name: shareInfo.name,
    });
  });

  socket.on('liveClass:screenShare:stop', (data: { classId: string; liveClassId?: string }) => {
    const user = socket.user;
    const classId = data.liveClassId || data.classId;
    if (!user || !classId) return;

    const roomName = `live-class:${classId}`;
    const current = activeRoomScreenShares.get(classId);
    const isAuthorized =
      user.role === 'admin' ||
      user.role === 'instructor' ||
      current?.userId === (user.uid || user.id);

    if (!isAuthorized) return;

    activeRoomScreenShares.set(classId, null);
    const roomMap = activeRoomPresences.get(classId);
    if (roomMap) {
      for (const p of roomMap.values()) {
        if (p.userId === (user.uid || user.id)) p.isScreenSharing = false;
      }
    }

    logger.info(`[SOCKET] Screen share stopped in ${roomName}`);
    io.to(roomName).emit('liveClass:screenShare:stopped', { userId: user.uid || user.id });
    socket.to(roomName).emit('screen_share_stopped', { userId: user.uid || user.id });
  });

  socket.on('screen_share_started', (data: { classId: string; liveClassId?: string; userId?: string; name?: string }) => {
    const user = socket.user;
    const classId = data.liveClassId || data.classId;
    if (!user || !classId) return;

    const roomName = `live-class:${classId}`;
    const shareInfo: ActiveScreenShareState = {
      userId: user.uid || user.id || data.userId || 'instructor',
      name: user.name || data.name || 'Instructor',
      startedAt: new Date().toISOString(),
    };
    activeRoomScreenShares.set(classId, shareInfo);
    io.to(roomName).emit('liveClass:screenShare:started', shareInfo);
    socket.to(roomName).emit('screen_share_started', shareInfo);
  });

  socket.on('screen_share_stopped', (data: { classId: string; liveClassId?: string; userId?: string }) => {
    const user = socket.user;
    const classId = data.liveClassId || data.classId;
    if (!user || !classId) return;

    const roomName = `live-class:${classId}`;
    activeRoomScreenShares.set(classId, null);
    io.to(roomName).emit('liveClass:screenShare:stopped', { userId: user.uid || user.id });
    socket.to(roomName).emit('screen_share_stopped', { userId: user.uid || user.id });
  });

  // 9. Participant Pinning
  socket.on('liveClass:pin:set', (data: { classId: string; liveClassId?: string; userId: string }) => {
    const user = socket.user;
    if (!user || (user.role !== 'admin' && user.role !== 'instructor' && user.role !== 'mentor')) return;
    const classId = data.liveClassId || data.classId;
    if (!classId || !data.userId) return;

    activeRoomPinned.set(classId, data.userId);
    io.to(`live-class:${classId}`).emit('liveClass:pin:updated', { pinnedUserId: data.userId });
  });

  socket.on('liveClass:pin:clear', (data: { classId: string; liveClassId?: string }) => {
    const user = socket.user;
    if (!user || (user.role !== 'admin' && user.role !== 'instructor' && user.role !== 'mentor')) return;
    const classId = data.liveClassId || data.classId;
    if (!classId) return;

    activeRoomPinned.set(classId, null);
    io.to(`live-class:${classId}`).emit('liveClass:pin:updated', { pinnedUserId: null });
  });

  // 10. Reconnect State Reconciliation
  socket.on('liveClass:reconnect:sync', (data: { classId: string; liveClassId?: string }, callback?: (res: any) => void) => {
    const user = socket.user;
    const classId = data.liveClassId || data.classId;
    if (!user || !classId) return;

    const currentRoster = getRoomParticipants(classId);
    const userId = user.uid || user.id;

    const snapshot = {
      success: true,
      classId,
      participants: currentRoster.map((p) => ({
        userId: p.userId,
        name: p.name,
        role: p.role,
        isAudioOn: p.isAudioOn ?? false,
        isVideoOn: p.isVideoOn ?? false,
        isScreenSharing: p.isScreenSharing ?? false,
        isSpeaking: p.isSpeaking ?? false,
        audioLevel: p.audioLevel ?? 0,
        isMutedByInstructor: p.isMutedByInstructor ?? false,
        micPermission: p.micPermission ?? 'prompt',
        isPinned: p.isPinned ?? false,
      })),
      activeSpeaker: getRoomActiveSpeaker(classId),
      screenShare: getRoomScreenShare(classId),
      pinnedUserId: getRoomPinned(classId),
      settings: getClassroomSettings(classId),
      moderationState: getModerationRecord(classId, userId),
    };

    socket.emit('liveClass:reconnect:synced', snapshot);
    if (callback) callback(snapshot);
  });

  socket.on('webrtc_track_change', (data: { classId: string; liveClassId?: string; userId?: string; isAudioOn: boolean; isVideoOn: boolean; isScreenSharing: boolean }) => {
    const user = socket.user;
    const classId = data.liveClassId || data.classId;
    const userUid = (user?.uid || user?.id || data?.userId || '').toString();
    if (!classId || !userUid) return;
    const roomName = `live-class:${classId}`;
    const userRole = (user?.role || '').toLowerCase();

    // Server-Authoritative Microphone Permission Gate for Students
    if (userRole === 'student' && data.isAudioOn) {
      const settings = getClassroomSettings(classId);
      const modRecord = getModerationRecord(classId, userUid, 'student');
      const isMicAllowed = (Boolean(settings?.studentMic?.enabled) && !modRecord.mutedByInstructor) || modRecord.micPermission === 'granted';

      if (!isMicAllowed) {
        logger.warn(`[LiveClass][MIC_UNAUTHORIZED] Student ${user?.name || userUid} attempted unmute without permission in ${classId}`);
        socket.emit('liveClass:moderation:muted', { userId: userUid, mutedByInstructor: true });
        socket.emit('student_muted', { userId: userUid, isMuted: true });
        socket.emit('webrtc_track_change', {
          userId: userUid,
          isAudioOn: false,
          isVideoOn: data.isVideoOn,
          isScreenSharing: data.isScreenSharing,
        });
        return;
      }
    }

    const roomMap = activeRoomPresences.get(classId);
    const participant = roomMap?.get(socket.id);
    if (participant) {
      participant.isAudioOn = data.isAudioOn;
      participant.isVideoOn = data.isVideoOn;
      participant.isScreenSharing = data.isScreenSharing;
    }

    socket.to(roomName).emit('webrtc_track_change', {
      userId: userUid,
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
  socket.on('live_class_scheduled', async (data: { liveClass: any }) => {
    logger.info(`[SOCKET] Live class scheduled broadcast: ${data.liveClass?.title}`);
    io.emit('live_class_scheduled', data);
    try {
      if (data?.liveClass) {
        const targetId = data.liveClass.id || data.liveClass.classId;
        if (targetId) {
          const exists = await liveClassroomService.getLiveClassById(targetId);
          if (exists) {
            await liveClassroomService.updateLiveClass(targetId, data.liveClass);
          } else {
            await liveClassroomService.createLiveClass(data.liveClass);
          }
        }
      }
    } catch (err: any) {
      logger.warn('[SOCKET] Error persisting live_class_scheduled:', err?.message || err);
    }
  });

  // 9. Handle Disconnection
  socket.on('disconnect', () => {
    activeRoomPresences.forEach((roomMap, classId) => {
      if (roomMap.has(socket.id)) {
        const leftParticipant = roomMap.get(socket.id);
        roomMap.delete(socket.id);

        const roomName = `live-class:${classId}`;
        const currentRoster = getRoomParticipants(classId);

        // If disconnected participant was speaking, clear active speaker
        const currentSpeaker = activeRoomSpeakers.get(classId);
        if (leftParticipant && currentSpeaker && currentSpeaker.userId === leftParticipant.userId) {
          activeRoomSpeakers.set(classId, null);
          io.to(roomName).emit('liveClass:speaker:changed', null);
          io.to(roomName).emit('liveClass:speaker:stopped', { userId: leftParticipant.userId });
        }

        // If disconnected participant was sharing screen, clear screen share
        const currentScreen = activeRoomScreenShares.get(classId);
        if (leftParticipant && currentScreen && currentScreen.userId === leftParticipant.userId) {
          activeRoomScreenShares.set(classId, null);
          io.to(roomName).emit('liveClass:screenShare:stopped', { userId: leftParticipant.userId });
          io.to(roomName).emit('screen_share_stopped', { userId: leftParticipant.userId });
        }

        // If disconnected participant was pinned, clear pin
        const currentPinned = activeRoomPinned.get(classId);
        if (leftParticipant && currentPinned === leftParticipant.userId) {
          activeRoomPinned.set(classId, null);
          io.to(roomName).emit('liveClass:pin:updated', { pinnedUserId: null });
        }

        const formattedParticipants = currentRoster.map((p) => ({
          userId: p.userId,
          name: p.name,
          role: p.role,
          isAudioOn: p.isAudioOn ?? false,
          isVideoOn: p.isVideoOn ?? false,
          isScreenSharing: p.isScreenSharing ?? false,
          isSpeaking: p.isSpeaking ?? false,
          audioLevel: p.audioLevel ?? 0,
          isMutedByInstructor: p.isMutedByInstructor ?? false,
          micPermission: p.micPermission ?? 'prompt',
          isPinned: p.isPinned ?? false,
        }));

        io.to(roomName).emit('liveClass:presence', {
          onlineCount: currentRoster.length,
          participants: formattedParticipants,
          activeSpeaker: getRoomActiveSpeaker(classId),
          screenShare: getRoomScreenShare(classId),
          pinnedUserId: getRoomPinned(classId),
        });

        io.to(roomName).emit('participants_update', {
          count: currentRoster.length,
          users: formattedParticipants,
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

          if (leftParticipant.role === 'instructor' || leftParticipant.role === 'admin' || leftParticipant.role === 'mentor') {
            const remainingInstructor = isInstructorActiveInRoom(classId);
            if (!remainingInstructor) {
              logger.info(`[LiveClass][INSTRUCTOR_DISCONNECT] classId=${classId} instructor=${leftParticipant.name}`);
              io.to(roomName).emit('liveClass:instructor_left', {
                liveClassId: classId,
                instructorId: leftParticipant.userId,
                name: leftParticipant.name,
                timestamp: new Date().toISOString(),
              });
              io.to(roomName).emit('instructor:disconnected', {
                liveClassId: classId,
                instructorId: leftParticipant.userId,
              });
            }
          }
        }
      }
    });
  });
};

let schedulerRunning = false;

/**
 * Background scheduler that periodically scans for scheduled classes whose
 * scheduled start time has arrived, and automatically transitions them to LIVE.
 */
export const initLiveClassScheduler = (io: any) => {
  if (schedulerRunning || !io) return;
  schedulerRunning = true;

  logger.info('[LiveClassScheduler] Background auto-transition scheduler initialized (30s interval).');

  setInterval(async () => {
    try {
      const allClasses = await liveClassroomService.getAllLiveClasses();
      const now = Date.now();

      for (const cls of allClasses) {
        const status = (cls.status || '').toUpperCase();
        if (status === 'SCHEDULED') {
          const scheduleCandidate = cls.scheduledAt || cls.startTime;
          if (scheduleCandidate) {
            const scheduledMs = new Date(scheduleCandidate).getTime();
            if (!isNaN(scheduledMs) && scheduledMs <= now) {
              const classId = cls.id || cls.classId;
              logger.info(`[SCHEDULER_AUTO_TRANSITION] Class ${classId} reached scheduled time ${scheduleCandidate}. Transitioning to LIVE.`);
              await liveClassroomService.startLiveClass(classId);
              const roomName = `live-class:${classId}`;
              const startPayload = {
                liveClassId: classId,
                status: 'LIVE',
                startedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                updatedBy: 'System Auto-Scheduler',
              };
              io.to(roomName).emit('liveClass:status', startPayload);
              io.to(roomName).emit('live_class_started', startPayload);
              io.emit('liveClass:status', startPayload);
              io.emit('live_class_started', startPayload);
            }
          }
        }
      }
    } catch (err: any) {
      logger.warn(`[LiveClassScheduler] Poll notice: ${err?.message || err}`);
    }
  }, 30000);
};
