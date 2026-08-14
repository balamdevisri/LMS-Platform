import { Router } from 'express';
import { enrollmentController } from './enrollment.controller';
import { extractOptionalUser } from '../../middleware/auth.middleware';

const router = Router();

// Student enrolled courses
router.get('/my-courses', extractOptionalUser as any, (req, res, next) =>
  enrollmentController.getMyCourses(req as any, res, next)
);

// Specific course enrollment check
router.get('/:courseId', extractOptionalUser as any, (req, res, next) =>
  enrollmentController.getCourseEnrollment(req as any, res, next)
);

// Create enrollment (free course or administrative)
router.post('/', extractOptionalUser as any, (req, res, next) =>
  enrollmentController.createEnrollment(req as any, res, next)
);

// Course access verification endpoint
router.get('/:courseId/access', extractOptionalUser as any, (req, res, next) =>
  enrollmentController.checkCourseAccess(req as any, res, next)
);

export default router;
