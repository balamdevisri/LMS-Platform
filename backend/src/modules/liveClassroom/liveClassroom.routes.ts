import { Router } from 'express';
import { liveClassroomController } from './liveClassroom.controller';

const router = Router();

// Live Class Sessions
router.get('/', (req, res, next) => liveClassroomController.getAllClasses(req, res, next));
router.get('/:id', (req, res, next) => liveClassroomController.getClassById(req, res, next));
router.post('/', (req, res, next) => liveClassroomController.createClass(req, res, next));
router.put('/:id', (req, res, next) => liveClassroomController.updateClass(req, res, next));
router.delete('/:id', (req, res, next) => liveClassroomController.deleteClass(req, res, next));

// Quizzes
router.post('/quiz/publish', (req, res, next) => liveClassroomController.publishQuiz(req, res, next));
router.post('/quiz/submit', (req, res, next) => liveClassroomController.submitQuizResponse(req, res, next));
router.get('/quiz/responses/:quizId', (req, res, next) => liveClassroomController.getQuizResponses(req, res, next));

// Chat
router.get('/chat/:classId', (req, res, next) => liveClassroomController.getChatMessages(req, res, next));

// Attendance
router.get('/attendance/:classId', (req, res, next) => liveClassroomController.getAttendanceReport(req, res, next));

// AI Report & Recommendations
router.get('/ai-report/:classId', (req, res, next) => liveClassroomController.getAIReport(req, res, next));
router.post('/ai-report/generate/:classId', (req, res, next) => liveClassroomController.generateAIInsights(req, res, next));

export default router;
