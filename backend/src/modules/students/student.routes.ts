import { Router } from 'express';
import { StudentController } from './student.controller';
import { verifyFirebaseToken, requireRole } from '../../middleware/auth.middleware';

const router = Router();
const studentController = new StudentController();

// Public Student Manual Registration
router.post('/register-student', (req, res, next) => studentController.registerStudent(req, res, next));
router.post('/register', (req, res, next) => studentController.registerStudent(req, res, next));

// Admin Student Approval Workflow
router.get('/pending', verifyFirebaseToken as any, requireRole('admin') as any, (req, res, next) => studentController.getPendingStudents(req, res, next));
router.post('/:id/approve', verifyFirebaseToken as any, requireRole('admin') as any, (req, res, next) => studentController.approveStudent(req, res, next));
router.post('/:id/reject', verifyFirebaseToken as any, requireRole('admin') as any, (req, res, next) => studentController.rejectStudent(req, res, next));

export default router;
