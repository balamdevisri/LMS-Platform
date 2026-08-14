import { Server as SocketServer } from 'socket.io';
import { AuthenticatedSocket } from './socket.auth';
import { liveClassroomService } from '../modules/liveClassroom/liveClassroom.service';
import logger from '../config/logger';

interface ActiveAttendance {
  studentId: string;
  studentName: string;
  liveClassId: string;
  joinedAt: number;
}

// In-memory active student sessions: socketId -> ActiveAttendance
const activeSessions = new Map<string, ActiveAttendance>();

export const registerAttendanceHandlers = (io: SocketServer, socket: AuthenticatedSocket) => {
  // 1. Join Attendance
  socket.on('attendance:join', (data: { liveClassId: string }) => {
    const user = socket.user;
    const liveClassId = data?.liveClassId;
    if (!user || !liveClassId) return;

    const studentId = user.uid || user.id;
    activeSessions.set(socket.id, {
      studentId,
      studentName: user.name || 'Student',
      liveClassId,
      joinedAt: Date.now(),
    });

    logger.info(`[ATTENDANCE] Recorded join session for student ${user.name} in ${liveClassId}`);
  });

  // 2. Leave Attendance
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

      activeSessions.delete(socket.id);
      logger.info(`[ATTENDANCE] Student ${session.studentName} logged session: ${durationSeconds}s`);
    }
  });

  // 3. Disconnect cleanup
  socket.on('disconnect', () => {
    const session = activeSessions.get(socket.id);
    if (session) {
      const leftAt = Date.now();
      const durationSeconds = Math.round((leftAt - session.joinedAt) / 1000);

      liveClassroomService.recordAttendance({
        classId: session.liveClassId,
        studentId: session.studentId,
        studentName: session.studentName,
        joinedAt: new Date(session.joinedAt).toISOString(),
        leftAt: new Date(leftAt).toISOString(),
        durationMinutes: Math.round(durationSeconds / 60),
      }).catch((e) => logger.warn('[ATTENDANCE] Record error:', e));

      activeSessions.delete(socket.id);
    }
  });
};
