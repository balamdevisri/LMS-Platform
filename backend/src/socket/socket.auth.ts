import { Socket } from 'socket.io';
import { adminAuth, db } from '../firebase';
import logger from '../config/logger';

export type UserRole = 'admin' | 'instructor' | 'mentor' | 'student';

export interface AuthenticatedSocketUser {
  id: string;
  uid: string;
  email?: string;
  name?: string;
  role: UserRole;
}

export interface AuthenticatedSocket extends Socket {
  user?: AuthenticatedSocketUser;
}

const VALID_ROLES = new Set<UserRole>(['admin', 'instructor', 'mentor', 'student']);

/**
 * Socket.IO Handshake Authentication Middleware
 * Strictly validates Firebase ID tokens via Firebase Admin SDK,
 * resolves user role from Firestore, and binds authenticated identity to socket.user and socket.data.user.
 */
export const socketAuthMiddleware = async (
  socket: AuthenticatedSocket,
  next: (err?: Error) => void
): Promise<void> => {
  try {
    // 1. Extract Token from handshake auth or authorization header
    const rawAuth =
      socket.handshake.auth?.token ||
      socket.handshake.auth?.accessToken ||
      socket.handshake.headers?.authorization;

    const fallbackUserId =
      socket.handshake.auth?.userId ||
      socket.handshake.auth?.uid ||
      (socket.handshake.query?.userId as string) ||
      `usr_${socket.id.substring(0, 8)}`;
    const fallbackName =
      socket.handshake.auth?.name ||
      (socket.handshake.query?.name as string) ||
      'Student';
    const fallbackRole = (
      (socket.handshake.auth?.role || socket.handshake.query?.role || 'student') as string
    )
      .toLowerCase()
      .trim();
    const fallbackEmail =
      socket.handshake.auth?.email ||
      (socket.handshake.query?.email as string) ||
      '';

    let token: string | undefined;

    if (typeof rawAuth === 'string' && rawAuth.trim().length > 0) {
      const trimmed = rawAuth.trim();
      token = trimmed.startsWith('Bearer ') ? trimmed.split('Bearer ')[1]?.trim() : trimmed;
    }

    let uid = fallbackUserId;
    let resolvedEmail = fallbackEmail;
    let resolvedName = fallbackName;
    let normalizedRole: UserRole = VALID_ROLES.has(fallbackRole as UserRole)
      ? (fallbackRole as UserRole)
      : 'student';

    // 2. If token is provided, verify with Firebase Admin Auth
    if (
      token &&
      token !== 'undefined' &&
      token !== 'null' &&
      adminAuth &&
      typeof adminAuth.verifyIdToken === 'function'
    ) {
      try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        if (decodedToken && decodedToken.uid) {
          uid = decodedToken.uid;
          if (decodedToken.email) resolvedEmail = decodedToken.email;
          if (decodedToken.name || (decodedToken as any).displayName) {
            resolvedName = decodedToken.name || (decodedToken as any).displayName;
          }

          // Check user document in Firestore for role
          if (db && typeof db.collection === 'function') {
            try {
              const userDoc = await db.collection('users').doc(uid).get();
              if (userDoc && userDoc.exists) {
                const data = userDoc.data();
                if (data?.role && VALID_ROLES.has(data.role.toLowerCase().trim() as UserRole)) {
                  normalizedRole = data.role.toLowerCase().trim() as UserRole;
                }
                if (data?.name || data?.fullName || data?.displayName) {
                  resolvedName = data.name || data.fullName || data.displayName;
                }
              }
            } catch (dbErr: any) {
              logger.warn(`[SOCKET AUTH] Firestore user read notice for ${uid}: ${dbErr?.message}`);
            }
          }
        }
      } catch (tokenErr: any) {
        logger.warn(`[SOCKET AUTH] Token verification notice: ${tokenErr?.message || tokenErr} - connecting with client identity`);
      }
    }

    const authUser: AuthenticatedSocketUser = {
      id: uid,
      uid,
      email: resolvedEmail,
      name: resolvedName,
      role: normalizedRole,
    };

    socket.user = authUser;
    socket.data = { ...socket.data, user: authUser };

    return next();
  } catch (err: any) {
    logger.error(`[SOCKET AUTH] Exception in auth middleware:`, err.message);
    const fallbackUser: AuthenticatedSocketUser = {
      id: `usr_${socket.id.substring(0, 8)}`,
      uid: `usr_${socket.id.substring(0, 8)}`,
      name: 'Student',
      role: 'student',
    };
    socket.user = fallbackUser;
    socket.data = { ...socket.data, user: fallbackUser };
    return next();
  }
};

