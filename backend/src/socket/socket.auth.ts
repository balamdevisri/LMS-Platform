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

    let token: string | undefined;

    if (typeof rawAuth === 'string' && rawAuth.trim().length > 0) {
      const trimmed = rawAuth.trim();
      token = trimmed.startsWith('Bearer ') ? trimmed.split('Bearer ')[1]?.trim() : trimmed;
    }

    if (!token) {
      logger.warn(`[SOCKET AUTH] Connection rejected: Missing Firebase ID token. Socket: ${socket.id}`);
      return next(new Error('UNAUTHORIZED_SOCKET'));
    }

    // 2. Verify Firebase ID Token via Firebase Admin Auth
    if (!adminAuth || typeof adminAuth.verifyIdToken !== 'function') {
      logger.error(`[SOCKET AUTH] Server configuration error: Firebase Admin Auth not initialized.`);
      return next(new Error('UNAUTHORIZED_SOCKET'));
    }

    let decodedToken: any;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (verifyErr: any) {
      logger.warn(`[SOCKET AUTH] Firebase token verification failed for socket ${socket.id}: ${verifyErr.code || verifyErr.message}`);
      return next(new Error('UNAUTHORIZED_SOCKET'));
    }

    if (!decodedToken || !decodedToken.uid) {
      logger.warn(`[SOCKET AUTH] Token verification yielded no UID. Socket: ${socket.id}`);
      return next(new Error('UNAUTHORIZED_SOCKET'));
    }

    const uid = decodedToken.uid;
    const tokenEmail = decodedToken.email || '';
    const tokenName = decodedToken.name || (decodedToken as any).displayName || '';

    // 3. Load User Document from Firestore users/{uid}
    if (!db || typeof db.collection !== 'function') {
      logger.error(`[SOCKET AUTH] Server configuration error: Firestore DB not initialized.`);
      return next(new Error('UNAUTHORIZED_SOCKET'));
    }

    let userData: any = null;
    try {
      const userDoc = await db.collection('users').doc(uid).get();
      if (userDoc.exists) {
        userData = userDoc.data();
      } else {
        // Fallback for admins collection if configured
        const adminDoc = await db.collection('admins').doc(uid).get().catch(() => null);
        if (adminDoc && adminDoc.exists) {
          userData = { ...adminDoc.data(), role: 'admin' };
        }
      }
    } catch (dbErr: any) {
      logger.error(`[SOCKET AUTH] Firestore error retrieving user profile for ${uid}:`, dbErr.message);
      return next(new Error('UNAUTHORIZED_SOCKET'));
    }

    if (!userData) {
      logger.warn(`[SOCKET AUTH] User document users/${uid} does not exist in Firestore. Socket rejected.`);
      return next(new Error('UNAUTHORIZED_SOCKET'));
    }

    // 4. Resolve and Validate KaizenQ Role strictly from Firestore document
    const rawRole = userData.role;

    if (!rawRole || typeof rawRole !== 'string') {
      logger.warn(`[SOCKET AUTH] User ${uid} has missing role in Firestore document. Socket rejected.`);
      return next(new Error('UNAUTHORIZED_SOCKET'));
    }

    const normalizedRole = rawRole.toLowerCase().trim() as UserRole;

    if (!VALID_ROLES.has(normalizedRole)) {
      logger.warn(`[SOCKET AUTH] User ${uid} has unsupported role '${rawRole}' in Firestore. Socket rejected.`);
      return next(new Error('UNAUTHORIZED_SOCKET'));
    }

    // 5. Attach Authenticated Identity
    const resolvedEmail = tokenEmail || userData?.email || '';
    const resolvedName = userData?.name || userData?.fullName || userData?.displayName || tokenName || 'User';

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
    logger.error(`[SOCKET AUTH] Unexpected exception during handshake authentication:`, err.message);
    return next(new Error('UNAUTHORIZED_SOCKET'));
  }
};

