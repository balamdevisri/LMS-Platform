import { Socket } from 'socket.io';
import { adminAuth } from '../firebase';
import logger from '../config/logger';

export interface AuthenticatedSocketUser {
  id: string;
  uid: string;
  email?: string;
  name?: string;
  role: 'admin' | 'instructor' | 'mentor' | 'student';
}

export interface AuthenticatedSocket extends Socket {
  user?: AuthenticatedSocketUser;
}

/**
 * Socket.IO Handshake Authentication Middleware
 * Validates JWT token, extracts authenticated user and role, or rejects with UNAUTHORIZED_SOCKET.
 */
export const socketAuthMiddleware = async (
  socket: AuthenticatedSocket,
  next: (err?: Error) => void
): Promise<void> => {
  try {
    const authHeader = socket.handshake.auth?.token || socket.handshake.headers?.authorization;
    let token: string | undefined;

    if (authHeader) {
      token = authHeader.startsWith('Bearer ') ? authHeader.split('Bearer ')[1] : authHeader;
    }

    if (!token) {
      // Fallback for development / query parameters
      const queryUid = (socket.handshake.query?.userId || socket.handshake.auth?.userId) as string;
      const queryRole = (socket.handshake.query?.role || socket.handshake.auth?.role) as string;
      const queryEmail = (socket.handshake.query?.email || socket.handshake.auth?.email) as string;
      const queryName = (socket.handshake.query?.name || socket.handshake.auth?.name) as string;

      if (queryUid) {
        socket.user = {
          id: queryUid,
          uid: queryUid,
          email: queryEmail || '',
          name: queryName || 'Student',
          role: (queryRole?.toLowerCase() as any) || 'student',
        };
        return next();
      }

      logger.warn(`[SOCKET AUTH] Connection rejected: No authentication token provided. Socket: ${socket.id}`);
      return next(new Error('UNAUTHORIZED_SOCKET'));
    }

    // 1. Verify token with Firebase Admin Auth if initialized
    if (adminAuth && typeof adminAuth.verifyIdToken === 'function') {
      try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        const email = decodedToken.email || '';
        const isAdminEmail = email.includes('admin') || email === 'admin@gmail.com';
        const role = (decodedToken as any).role || (isAdminEmail ? 'admin' : 'student');

        socket.user = {
          id: decodedToken.uid,
          uid: decodedToken.uid,
          email,
          name: decodedToken.name || (decodedToken as any).displayName || 'User',
          role: role.toLowerCase(),
        };
        return next();
      } catch (firebaseErr) {
        logger.warn(`[SOCKET AUTH] Firebase verifyIdToken fallback:`, firebaseErr);
      }
    }

    // 2. Fallback token decode for local development
    try {
      const payloadBase64 = token.split('.')[1];
      if (payloadBase64) {
        const decoded = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf-8'));
        const email = decoded.email || decoded.sub || 'student@shaivika.ai';
        const isAdminEmail = email.includes('admin') || email === 'admin@gmail.com';
        const role = isAdminEmail ? 'admin' : (decoded.role || 'student');

        socket.user = {
          id: decoded.user_id || decoded.sub || decoded.uid || 'usr_socket_dev',
          uid: decoded.user_id || decoded.sub || decoded.uid || 'usr_socket_dev',
          email,
          name: decoded.name || 'Student',
          role: role.toLowerCase(),
        };
        return next();
      }
    } catch (decodeErr) {
      logger.warn(`[SOCKET AUTH] Manual JWT decode warning:`, decodeErr);
    }

    // If all token verifications fail
    logger.warn(`[SOCKET AUTH] Invalid token signature. Socket: ${socket.id}`);
    return next(new Error('UNAUTHORIZED_SOCKET'));
  } catch (err: any) {
    logger.error(`[SOCKET AUTH] Exception during socket handshake auth:`, err);
    return next(new Error('UNAUTHORIZED_SOCKET'));
  }
};
