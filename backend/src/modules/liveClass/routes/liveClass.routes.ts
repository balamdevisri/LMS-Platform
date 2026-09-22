import { Router } from 'express';
import { liveClassController } from '../controllers/liveClass.controller';
import { validateCreateLiveClass } from '../validators/liveClass.validator';
import { verifyFirebaseToken, requireRole, extractOptionalUser } from '../../../middleware/auth.middleware';

const router = Router();

router.post(
  '/',
  verifyFirebaseToken as any,
  requireRole(['admin', 'instructor']) as any,
  validateCreateLiveClass,
  (req, res) => liveClassController.create(req, res)
);
router.get('/upcoming', extractOptionalUser as any, (req, res) => liveClassController.getUpcoming(req, res));
router.get('/instructor/:instructorId', extractOptionalUser as any, (req, res) => liveClassController.getByInstructor(req, res));
router.get('/course/:courseId', extractOptionalUser as any, (req, res) => liveClassController.getByCourse(req, res));
router.get('/:classId', extractOptionalUser as any, (req, res) => liveClassController.getById(req, res));
router.put(
  '/:classId',
  verifyFirebaseToken as any,
  requireRole(['admin', 'instructor']) as any,
  (req, res) => liveClassController.update(req, res)
);
router.delete(
  '/:classId',
  verifyFirebaseToken as any,
  requireRole(['admin', 'instructor']) as any,
  (req, res) => liveClassController.delete(req, res)
);

export default router;
