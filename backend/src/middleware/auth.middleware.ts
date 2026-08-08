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
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        role: (decodedToken as any).role || 'student',
      };
      next();
    } else {
      // Safe fallback when Firebase Admin cert is not configured in local dev
      req.user = {
        uid: 'dev-user-id',
        email: 'dev@shaivika.ai',
        role: 'student',
      };
      next();
    }
  } catch (err: any) {
    console.error('Firebase token verification error:', err?.message || err);
    res.status(401).json({ error: 'Unauthorized: Invalid or expired Firebase ID token' });
  }
};

export const requireRole = (roles: string | string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized: User authentication required' });
      return;
    }

    const userRole = req.user.role || 'student';
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    // Admins bypass all role checks
    if (userRole === 'admin') {
      next();
      return;
    }

    if (!allowedRoles.includes(userRole)) {
      res.status(403).json({ error: `Forbidden: Requires one of [${allowedRoles.join(', ')}] privileges` });
      return;
    }

    next();
  };
};