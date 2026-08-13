import { Router } from 'express';
import { liveClassroomController } from './liveClassroom.controller';

const router = Router();

// --- 1. LIVE CLASS CORE CRUD & MANAGEMENT ---
router.get('/', (req, res, next) => liveClassroomController.getAllClasses(req, res, next));
router.get('/:classId', (req, res, next) => liveClassroomController.getClassById(req, res, next));
router.post('/', (req, res, next) => liveClassroomController.createClass(req, res, next));
router.patch('/:classId', (req, res, next) => liveClassroomController.updateClass(req, res, next));
router.put('/:classId', (req, res, next) => liveClassroomController.updateClass(req, res, next));
router.delete('/:classId', (req, res, next) => liveClassroomController.deleteClass(req, res, next));

// --- 2. STATE TRANSITIONS & AUTHORIZATION ---
router.post('/:classId/start', (req, res, next) => liveClassroomController.startClass(req, res, next));
router.post('/:classId/end', (req, res, next) => liveClassroomController.endClass(req, res, next));
router.post('/:classId/join', (req, res, next) => liveClassroomController.joinClass(req, res, next));
router.post('/:classId/leave', (req, res, next) => liveClassroomController.leaveClass(req, res, next));
router.post('/:classId/token', (req, res, next) => liveClassroomController.generateRoomToken(req, res, next));
router.post('/token', (req, res, next) => liveClassroomController.generateRoomToken(req, res, next));

// --- 3. ATTENDANCE ---
router.get('/:classId/attendance', (req, res, next) => liveClassroomController.getAttendanceReport(req, res, next));

// --- 4. LIVE CHAT ---
router.get('/:classId/chat', (req, res, next) => liveClassroomController.getChatMessages(req, res, next));
router.get('/chat/:classId', (req, res, next) => liveClassroomController.getChatMessages(req, res, next));
router.post('/:classId/chat', (req, res, next) => liveClassroomController.sendChatMessage(req, res, next));
router.delete('/:classId/chat/:messageId', (req, res, next) => liveClassroomController.deleteChatMessage(req, res, next));

// --- 5. Q&A QUESTIONS ---
router.get('/:classId/questions', (req, res, next) => liveClassroomController.getQuestions(req, res, next));
router.post('/:classId/questions', (req, res, next) => liveClassroomController.submitQuestion(req, res, next));
router.patch('/:classId/questions/:questionId', (req, res, next) => liveClassroomController.updateQuestion(req, res, next));

// --- 6. POLLS ---
router.get('/:classId/polls', (req, res, next) => liveClassroomController.getPolls(req, res, next));
router.post('/:classId/polls', (req, res, next) => liveClassroomController.createPoll(req, res, next));
router.post('/:classId/polls/:pollId/vote', (req, res, next) => liveClassroomController.submitPollVote(req, res, next));

// --- 7. LIVE NOTES ---
router.get('/:classId/notes', (req, res, next) => liveClassroomController.getNotes(req, res, next));
router.post('/:classId/notes', (req, res, next) => liveClassroomController.createNote(req, res, next));

// --- 8. RESOURCES ---
router.get('/:classId/resources', (req, res, next) => liveClassroomController.getResources(req, res, next));
router.post('/:classId/resources', (req, res, next) => liveClassroomController.createResource(req, res, next));

// --- 9. AI INSIGHTS ---
router.get('/:classId/ai-report', (req, res, next) => liveClassroomController.getAIReport(req, res, next));
router.get('/ai-report/:classId', (req, res, next) => liveClassroomController.getAIReport(req, res, next));
router.post('/:classId/ai-report/generate', (req, res, next) => liveClassroomController.generateAIInsights(req, res, next));

export default router;
