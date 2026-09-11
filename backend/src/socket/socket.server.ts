import { Server as SocketServer, Socket } from 'socket.io';
import { socketAuthMiddleware, AuthenticatedSocket } from './socket.auth';
import { registerLiveClassHandlers, initLiveClassScheduler } from './liveClass.socket';
import { registerChatHandlers } from './chat.socket';
import { registerQnaHandlers } from './qna.socket';
import { registerHandHandlers } from './hand.socket';
import { registerAnnouncementHandlers } from './announcement.socket';
import { registerPollHandlers } from './poll.socket';
import { registerQuizHandlers } from './quiz.socket';
import { registerAttendanceHandlers } from './attendance.socket';
import logger from '../config/logger';

let liveNS: any = null;

export const getLiveNamespace = () => liveNS;

/**
 * Initialize Modular Production-Ready Socket.IO Server
 */
export const setupSocketServer = (io: SocketServer) => {
  logger.info('[SOCKET SERVER] Initializing Production Real-Time Interaction Layer...');

  // Configure Live Classroom Namespace
  liveNS = io.of('/live-classroom');

  // Attach Handshake Authentication Middleware
  liveNS.use(socketAuthMiddleware);

  // Initialize live class background auto-transition scheduler
  initLiveClassScheduler(liveNS);

  liveNS.on('connection', (socket: Socket) => {
    const authSocket = socket as AuthenticatedSocket;
    const user = authSocket.user;
    logger.info(`[SOCKET CONNECTED] Socket ID: ${socket.id} | User: ${user?.name || user?.email || 'Anonymous'} (${user?.role || 'student'})`);

    // Ensure socket joins personal user room for direct real-time notifications
    const targetUserId = user?.uid || user?.id;
    if (targetUserId) {
      socket.join(`user:${targetUserId}`);
      logger.info(`[SOCKET ROOM] Socket ${socket.id} joined personal room user:${targetUserId}`);
    }

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
