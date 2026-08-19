import { Server as SocketServer } from 'socket.io';
import { AuthenticatedSocket } from './socket.auth';
import logger from '../config/logger';

// In-memory raised hands store: liveClassId -> Map<userId, { studentId, studentName, timestamp }>
const raisedHandsMap = new Map<string, Map<string, { studentId: string; studentName: string; timestamp: string }>>();

export const registerHandHandlers = (io: SocketServer, socket: AuthenticatedSocket) => {
  // Helper for raising hand
  const processRaiseHand = (liveClassId: string, customStudentName?: string, callback?: (res: any) => void) => {
    try {
      const user = socket.user;
      if (!user || !liveClassId) {
        const err = { success: false, error: 'UNAUTHORIZED_SOCKET' };
        socket.emit('hand:error', err);
        if (callback) callback(err);
        return;
      }

      const roomName = `live-class:${liveClassId}`;
      if (!raisedHandsMap.has(liveClassId)) {
        raisedHandsMap.set(liveClassId, new Map());
      }

      const studentId = user.uid || user.id;
      const studentName = customStudentName || user.name || 'Student';
      const timestamp = new Date().toISOString();

      const handEntry = {
        studentId,
        studentName,
        timestamp,
      };
      raisedHandsMap.get(liveClassId)!.set(studentId, handEntry);

      logger.info(`[HAND RAISE] ${studentName} raised hand in ${liveClassId}`);

      // Broadcast to entire room in both modern and legacy format
      io.to(roomName).emit('hand:raise', {
        liveClassId,
        ...handEntry,
        totalRaised: raisedHandsMap.get(liveClassId)!.size,
      });

      io.to(roomName).emit('hand_raised', {
        userId: studentId,
        userName: studentName,
        timestamp: new Date(timestamp),
      });

      if (callback) callback({ success: true, ...handEntry });
    } catch (err: any) {
      if (callback) callback({ success: false, error: err.message });
    }
  };

  // 1. Student Raises Hand (Modern & Legacy)
  socket.on('hand:raise', (data: { liveClassId: string }, callback?: (res: any) => void) => {
    processRaiseHand(data?.liveClassId, undefined, callback);
  });

  socket.on('raise_hand', (data: { classId?: string; liveClassId?: string; userName?: string; name?: string }, callback?: (res: any) => void) => {
    const classId = data?.liveClassId || data?.classId || '';
    processRaiseHand(classId, data?.userName || data?.name, callback);
  });

  // 2. Student Lowers Hand
  socket.on('hand:lower', (data: { liveClassId?: string; classId?: string }, callback?: (res: any) => void) => {
    try {
      const user = socket.user;
      const liveClassId = data?.liveClassId || data?.classId;
      if (!user || !liveClassId) return;

      const roomMap = raisedHandsMap.get(liveClassId);
      if (roomMap) {
        roomMap.delete(user.uid || user.id);
      }

      const roomName = `live-class:${liveClassId}`;
      io.to(roomName).emit('hand:lower', {
        liveClassId,
        studentId: user.uid || user.id,
        totalRaised: roomMap ? roomMap.size : 0,
      });

      if (callback) callback({ success: true });
    } catch (err: any) {
      if (callback) callback({ success: false, error: err.message });
    }
  });

  // 3. Instructor Acknowledges Hand
  socket.on(
    'hand:acknowledge',
    (data: { liveClassId?: string; classId?: string; studentId: string }, callback?: (res: any) => void) => {
      try {
        const user = socket.user;
        if (!user || (user.role !== 'admin' && user.role !== 'instructor' && user.role !== 'mentor')) {
          if (callback) callback({ success: false, error: 'INVALID_PERMISSION' });
          return;
        }

        const liveClassId = data.liveClassId || data.classId || '';
        const { studentId } = data;
        const roomMap = raisedHandsMap.get(liveClassId);
        if (roomMap) {
          roomMap.delete(studentId);
        }

        const roomName = `live-class:${liveClassId}`;
        io.to(roomName).emit('hand:acknowledge', {
          liveClassId,
          studentId,
          acknowledgedBy: user.name || 'Instructor',
          totalRaised: roomMap ? roomMap.size : 0,
        });

        if (callback) callback({ success: true });
      } catch (err: any) {
        if (callback) callback({ success: false, error: err.message });
      }
    }
  );
};
