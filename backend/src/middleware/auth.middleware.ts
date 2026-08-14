import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../firebase';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    role?: string;
  };
}

export const verifyFirebaseToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: No Bearer token provided' });
    return;
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    if (adminAuth && typeof adminAuth.verifyIdToken === 'function') {
      const decodedToken = await adminAuth.verifyIdToken(token);
      const email = decodedToken.email || '';
      // Determine role: prefer custom claim, fallback to email-based detection
      const isAdminEmail = email.includes('admin') || email === 'admin@gmail.com';
      const role = (decodedToken as any).role || (isAdminEmail ? 'admin' : 'student');
      req.user = {
        uid: decodedToken.uid,
        email,
        role,
      };
      next();
    } else {
      // Firebase Admin cert not configured (local dev) — decode JWT manually to extract email
      // Note: This does NOT verify signature — only for local dev use
      console.warn('[Auth Middleware] Firebase Admin not configured — using email-based role detection fallback');
      try {
        const payloadBase64 = token.split('.')[1];
        if (payloadBase64) {
          const decoded = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf-8'));
          const email = decoded.email || decoded.sub || 'dev@shaivika.ai';
          const isAdminEmail = email.includes('admin') || email === 'admin@gmail.com';
          req.user = {
            uid: decoded.user_id || decoded.sub || 'dev-user-id',
            email,
            role: isAdminEmail ? 'admin' : (decoded.role || 'student'),
          };
        } else {
          req.user = { uid: 'dev-user-id', email: 'dev@shaivika.ai', role: 'student' };
        }
      } catch {
        req.user = { uid: 'dev-user-id', email: 'dev@shaivika.ai', role: 'student' };
      }
      next();
    }
  } catch (err: any) {
    console.error('Firebase token verification error:', err?.message || err);
    res.status(401).json({ error: 'Unauthorized: Invalid or expired Firebase ID token' });
  }
};

export const extractOptionalUser = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split('Bearer ')[1];
    try {
      if (adminAuth && typeof adminAuth.verifyIdToken === 'function') {
        const decodedToken = await adminAuth.verifyIdToken(token).catch(() => null);
        if (decodedToken) {
          const email = decodedToken.email || '';
          const isAdminEmail = email.includes('admin') || email === 'admin@gmail.com';
          const role = (decodedToken as any).role || (isAdminEmail ? 'admin' : 'student');
          req.user = {
            uid: decodedToken.uid,
            email,
            role,
          };
          return next();
        }
      }

      // Fallback decode
      const payloadBase64 = token.split('.')[1];
      if (payloadBase64) {
        const decoded = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf-8'));
        const email = decoded.email || decoded.sub || 'dev@shaivika.ai';
        const isAdminEmail = email.includes('admin') || email === 'admin@gmail.com';
        req.user = {
          uid: decoded.user_id || decoded.sub || decoded.uid || 'dev-user-id',
          email,
          role: isAdminEmail ? 'admin' : (decoded.role || 'student'),
        };
        return next();
      }
    } catch {
      // Ignore token parse error for optional middleware
    }
  }

  // Fallback to headers or query
  const queryUid = (req.query.userId as string) || (req.headers['x-user-id'] as string);
  const queryRole = (req.query.userRole as string) || (req.headers['x-user-role'] as string);
  const queryEmail = (req.query.userEmail as string) || (req.headers['x-user-email'] as string);

  if (queryUid) {
    req.user = {
      uid: queryUid,
      role: queryRole || 'student',
      email: queryEmail || '',
    };
  }

  next();
};

export const requireRole = (roles: string | string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized: User authentication required' });
      return;
    }

    const userRole = req.user.role || 'student';
    const userEmail = req.user.email || '';
    const isAdminByEmail = userEmail.includes('admin') || userEmail === 'admin@gmail.com';
    const isAdmin = userRole === 'admin' || isAdminByEmail;

    // Admins bypass all role checks
    if (isAdmin) {
      next();
      return;
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    if (!allowedRoles.includes(userRole)) {
      res.status(403).json({ error: `Forbidden: Requires one of [${allowedRoles.join(', ')}] privileges` });
      return;
    }

    next();
  };
};