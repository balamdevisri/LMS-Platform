import { Router } from 'express';
import { liveClassController } from '../controllers/liveClass.controller';
import { validateCreateLiveClass } from '../validators/liveClass.validator';

const router = Router();

router.post('/', validateCreateLiveClass, (req, res) => liveClassController.create(req, res));
router.get('/upcoming', (req, res) => liveClassController.getUpcoming(req, res));
router.get('/instructor/:instructorId', (req, res) => liveClassController.getByInstructor(req, res));
router.get('/course/:courseId', (req, res) => liveClassController.getByCourse(req, res));
router.get('/:classId', (req, res) => liveClassController.getById(req, res));
router.put('/:classId', (req, res) => liveClassController.update(req, res));
router.delete('/:classId', (req, res) => liveClassController.delete(req, res));

export default router;
