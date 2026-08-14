import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { enrollmentService } from '../modules/enrollments/enrollment.service';

/**
 * Middleware to strictly require active course enrollment
 * Never trusts studentId, paymentStatus, or enrollmentStatus from the frontend.
 */
export const requireCourseEnrollment = (courseIdParam: string = 'courseId') => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const studentId = req.user?.uid || (req.query.userId as string) || (req.headers['x-user-id'] as string);
    const userRole = req.user?.role || (req.query.userRole as string) || (req.headers['x-user-role'] as string);
    const userEmail = req.user?.email || (req.query.userEmail as string) || (req.headers['x-user-email'] as string);

    // Extract course ID from params, body, or query
    const courseId = req.params[courseIdParam] || req.body[courseIdParam] || (req.query[courseIdParam] as string);

    if (!courseId) {
      res.status(400).json({ success: false, message: 'Missing course identifier' });
      return;
    }

    const { hasAccess, reason } = await enrollmentService.verifyCourseAccess(
      studentId || '',
      courseId,
      userRole,
      userEmail
    );

    if (!hasAccess) {
      res.status(403).json({
        success: false,
        message: reason || 'You are not enrolled in this course.',
      });
      return;
    }

    next();
  };
};
