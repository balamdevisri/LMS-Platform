import { Router } from 'express';
import { CourseController } from './course.controller';
import { verifyFirebaseToken, requireRole } from '../../middleware/auth.middleware';

const router = Router();
const controller = new CourseController();

// Public / Student endpoints
router.get('/', controller.getCourses);
router.get('/:id', controller.getCourseByIdOrSlug);
router.get('/:id/modules', controller.getCourseModules);
router.get('/:id/modules/:moduleId/lessons', controller.getModuleLessons);

// Admin-only module management endpoints
router.post('/:id/modules', verifyFirebaseToken, requireRole('admin'), controller.saveModule);
router.put('/:id/modules/:moduleId', verifyFirebaseToken, requireRole('admin'), controller.saveModule);
router.delete('/:id/modules/:moduleId', verifyFirebaseToken, requireRole('admin'), controller.deleteModule);

// Admin-only revision & audit trail endpoints
router.get('/:id/revisions', verifyFirebaseToken, requireRole('admin'), controller.getCourseRevisions);
router.post('/:id/revisions/:auditId/restore', verifyFirebaseToken, requireRole('admin'), controller.restoreCourseRevision);

// Admin-only course management endpoints
router.post('/', verifyFirebaseToken, requireRole('admin'), controller.createCourse);
router.put('/:id', verifyFirebaseToken, requireRole('admin'), controller.updateCourse);
router.delete('/:id', verifyFirebaseToken, requireRole('admin'), controller.deleteCourse);

router.patch('/:id/publish', verifyFirebaseToken, requireRole('admin'), controller.publishCourse);
router.patch('/:id/unpublish', verifyFirebaseToken, requireRole('admin'), controller.unpublishCourse);
router.patch('/:id/archive', verifyFirebaseToken, requireRole('admin'), controller.archiveCourse);
router.post('/:id/duplicate', verifyFirebaseToken, requireRole('admin'), controller.duplicateCourse);
router.post('/bulk-import', verifyFirebaseToken, requireRole('admin'), controller.bulkImportCourse);
router.post('/:id/bulk-import', verifyFirebaseToken, requireRole('admin'), controller.bulkImportToCourse);

export default router;
