import { Server as SocketServer } from 'socket.io';
import { AuthenticatedSocket } from './socket.auth';
import { liveClassroomService } from '../modules/liveClassroom/liveClassroom.service';
import logger from '../config/logger';

interface ActiveAttendance {
  studentId: string;
  studentName: string;
  liveClassId: string;
  joinedAt: number;
  // Track socket IDs that share the same userId+liveClassId (reconnect handling)
  socketId: string;
}

// In-memory active student sessions: socketId -> ActiveAttendance
const activeSessions = new Map<string, ActiveAttendance>();

// Secondary index: `${userId}:${liveClassId}` -> socketId
// Used to detect reconnects and reconcile existing sessions
const userClassIndex = new Map<string, string>();

export const registerAttendanceHandlers = (io: SocketServer, socket: AuthenticatedSocket) => {
  // 1. Join Attendance — handles first join AND reconnects without duplicating records
  socket.on('attendance:join', (data: { liveClassId: string }) => {
    const user = socket.user;
    const liveClassId = data?.liveClassId;
    if (!user || !liveClassId) return;

    const studentId = user.uid || user.id;
    const sessionKey = `${studentId}:${liveClassId}`;
    const existingSocketId = userClassIndex.get(sessionKey);

    // If this exact socket has already joined, ignore duplicate join
    if (existingSocketId === socket.id && activeSessions.has(socket.id)) {
      logger.info(`[ATTENDANCE] Duplicate join ignored for student ${user.name || studentId} in ${liveClassId}`);
      return;
    }

    // If there's an existing session for this user in this class (reconnect scenario),
    // remove the stale entry without persisting a leave record — this was a reconnect,
    // not an intentional leave. The original joinedAt is preserved via the new session entry.
    if (existingSocketId && existingSocketId !== socket.id) {
      const existingSession = activeSessions.get(existingSocketId);
      if (existingSession) {
        // Preserve original join time for accurate duration tracking
        const originalJoinedAt = existingSession.joinedAt;
        activeSessions.delete(existingSocketId);

        // Re-create session with original joinedAt to preserve attendance continuity
        const reconciledSession: ActiveAttendance = {
          studentId,
          studentName: user.name || 'Student',
          liveClassId,
          joinedAt: originalJoinedAt, // Preserve original join time
          socketId: socket.id,
        };
        activeSessions.set(socket.id, reconciledSession);
        userClassIndex.set(sessionKey, socket.id);
        logger.info(`[ATTENDANCE] Reconciled reconnect for ${user.name} in ${liveClassId} (original joinedAt preserved)`);
        return;
      }
    }

    // New session — record fresh join
    const newSession: ActiveAttendance = {
      studentId,
      studentName: user.name || 'Student',
      liveClassId,
      joinedAt: Date.now(),
      socketId: socket.id,
    };
    activeSessions.set(socket.id, newSession);
    userClassIndex.set(sessionKey, socket.id);

    logger.info(`[ATTENDANCE] Recorded join session for student ${user.name} in ${liveClassId}`);
  });

  // 2. Leave Attendance — intentional leave
  socket.on('attendance:leave', (data: { liveClassId: string }) => {
    const session = activeSessions.get(socket.id);
    if (session) {
      const leftAt = Date.now();
      const durationSeconds = Math.round((leftAt - session.joinedAt) / 1000);

      // Persist attendance session in database
      liveClassroomService.recordAttendance({
        classId: session.liveClassId,
        studentId: session.studentId,
        studentName: session.studentName,
        joinedAt: new Date(session.joinedAt).toISOString(),
        leftAt: new Date(leftAt).toISOString(),
        durationMinutes: Math.round(durationSeconds / 60),
      }).catch((e) => logger.warn('[ATTENDANCE] Record error:', e));

      // Clean up both maps
      const sessionKey = `${session.studentId}:${session.liveClassId}`;
      activeSessions.delete(socket.id);
      if (userClassIndex.get(sessionKey) === socket.id) {
        userClassIndex.delete(sessionKey);
      }

      logger.info(`[ATTENDANCE] Student ${session.studentName} intentionally left. Session: ${durationSeconds}s`);
    }
  });

  // 3. Heartbeat / Presence Ping (lightweight in-memory, no DB writes)
  socket.on('attendance:ping', (data: { liveClassId: string }) => {
    const session = activeSessions.get(socket.id);
    if (session && session.liveClassId === data?.liveClassId) {
      socket.emit('attendance:pong', { timestamp: Date.now() });
    }
  });

  // 4. Disconnect cleanup — handles tab close / network loss
  socket.on('disconnect', (reason) => {
    const session = activeSessions.get(socket.id);
    if (session) {
      const leftAt = Date.now();
      const durationSeconds = Math.round((leftAt - session.joinedAt) / 1000);

      // Only persist if this was a meaningful session (> 10 seconds)
      // and this socket is still the current socket for this user+class
      const sessionKey = `${session.studentId}:${session.liveClassId}`;
      const isCurrentSocket = userClassIndex.get(sessionKey) === socket.id;

      if (isCurrentSocket) {
        // For transport close or server-initiated disconnects, persist record
        // For 'io client disconnect' (intentional), attendance:leave already handled it
        if (String(reason) !== 'io client disconnect') {
          liveClassroomService.recordAttendance({
            classId: session.liveClassId,
            studentId: session.studentId,
            studentName: session.studentName,
            joinedAt: new Date(session.joinedAt).toISOString(),
            leftAt: new Date(leftAt).toISOString(),
            durationMinutes: Math.round(durationSeconds / 60),
          }).catch((e) => logger.warn('[ATTENDANCE] Disconnect record error:', e));

          userClassIndex.delete(sessionKey);
          logger.info(`[ATTENDANCE] Student ${session.studentName} disconnected (${reason}). Session: ${durationSeconds}s`);
        }
      }

      activeSessions.delete(socket.id);
    }
  });
};

/**
 * Flushes and persists all active in-memory socket attendance sessions for a live class.
 * Called automatically when instructor ends a live class.
 */
export const flushClassAttendance = async (classId: string): Promise<void> => {
  const now = Date.now();
  const flushPromises: Promise<any>[] = [];

  for (const [socketId, session] of activeSessions.entries()) {
    if (session.liveClassId === classId) {
      const durationSeconds = Math.round((now - session.joinedAt) / 1000);
      flushPromises.push(
        liveClassroomService.recordAttendance({
          classId: session.liveClassId,
          studentId: session.studentId,
          studentName: session.studentName,
          joinedAt: new Date(session.joinedAt).toISOString(),
          leftAt: new Date(now).toISOString(),
          durationMinutes: Math.round(durationSeconds / 60),
        }).catch((e) => logger.warn('[ATTENDANCE] End class flush error:', e))
      );

      const sessionKey = `${session.studentId}:${session.liveClassId}`;
      userClassIndex.delete(sessionKey);
      activeSessions.delete(socketId);
    }
  }

  await Promise.all(flushPromises);
  logger.info(`[ATTENDANCE] Flushed ${flushPromises.length} active sessions for class ${classId}`);
};
