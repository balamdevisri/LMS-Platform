import { Router } from 'express';
import { CourseController } from '../controllers/courseController';

const router = Router();
const controller = new CourseController();

// Course Completion & Certificate
router.post('/send-certificate', (req, res, next) => controller.sendCertificate(req, res, next));

export default router;
