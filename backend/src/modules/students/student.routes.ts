import { Router } from 'express';
import { StudentController } from './student.controller';

const router = Router();
const studentController = new StudentController();

// Public Student Manual Registration
router.post('/register-student', (req, res, next) => studentController.registerStudent(req, res, next));
router.post('/register', (req, res, next) => studentController.registerStudent(req, res, next));

// Admin Student Approval Workflow
router.get('/pending', (req, res, next) => studentController.getPendingStudents(req, res, next));
router.post('/:id/approve', (req, res, next) => studentController.approveStudent(req, res, next));
router.post('/:id/reject', (req, res, next) => studentController.rejectStudent(req, res, next));

export default router;
