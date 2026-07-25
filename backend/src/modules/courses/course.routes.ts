import { Router } from 'express';
import { CourseController } from './course.controller';
import { verifyFirebaseToken, requireRole } from '../../middleware/auth.middleware';

const router = Router();
const controller = new CourseController();

// Public / Student endpoints
router.get('/', controller.getCourses);
router.get('/:id', controller.getCourseByIdOrSlug);

// Admin-only endpoints
router.post('/', verifyFirebaseToken, requireRole('admin'), controller.createCourse);
router.put('/:id', verifyFirebaseToken, requireRole('admin'), controller.updateCourse);
router.delete('/:id', verifyFirebaseToken, requireRole('admin'), controller.deleteCourse);

router.patch('/:id/publish', verifyFirebaseToken, requireRole('admin'), controller.publishCourse);
router.patch('/:id/unpublish', verifyFirebaseToken, requireRole('admin'), controller.unpublishCourse);
router.patch('/:id/archive', verifyFirebaseToken, requireRole('admin'), controller.archiveCourse);
router.post('/:id/duplicate', verifyFirebaseToken, requireRole('admin'), controller.duplicateCourse);

export default router;
