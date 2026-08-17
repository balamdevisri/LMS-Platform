import { Server as SocketServer, Socket } from 'socket.io';
import { socketAuthMiddleware, AuthenticatedSocket } from './socket.auth';
import { registerLiveClassHandlers } from './liveClass.socket';
import { registerChatHandlers } from './chat.socket';
import { registerQnaHandlers } from './qna.socket';
import { registerHandHandlers } from './hand.socket';
import { registerAnnouncementHandlers } from './announcement.socket';
import { registerPollHandlers } from './poll.socket';
import { registerQuizHandlers } from './quiz.socket';
import { registerAttendanceHandlers } from './attendance.socket';
import logger from '../config/logger';

/**
 * Initialize Modular Production-Ready Socket.IO Server
 */
export const setupSocketServer = (io: SocketServer) => {
  logger.info('[SOCKET SERVER] Initializing Production Real-Time Interaction Layer...');

  // Configure Live Classroom Namespace
  const liveNS = io.of('/live-classroom');

  // Attach Handshake Authentication Middleware
  liveNS.use(socketAuthMiddleware);

  liveNS.on('connection', (socket: Socket) => {
    const authSocket = socket as AuthenticatedSocket;
    const user = authSocket.user;
    logger.info(`[SOCKET CONNECTED] Socket ID: ${socket.id} | User: ${user?.name || user?.email || 'Anonymous'} (${user?.role || 'student'})`);

    // Register All Feature Socket Handlers
    registerLiveClassHandlers(liveNS as any, authSocket);
    registerChatHandlers(liveNS as any, authSocket);
    registerQnaHandlers(liveNS as any, authSocket);
    registerHandHandlers(liveNS as any, authSocket);
    registerAnnouncementHandlers(liveNS as any, authSocket);
    registerPollHandlers(liveNS as any, authSocket);
    registerQuizHandlers(liveNS as any, authSocket);
    registerAttendanceHandlers(liveNS as any, authSocket);

    // Generic error listener
    socket.on('error', (err) => {
      logger.error(`[SOCKET ERROR] Client ${socket.id} encountered error:`, err);
    });
  });

  logger.info('[SOCKET SERVER] ✅ Dedicated /live-classroom Real-Time Interaction Layer Attached.');
};
