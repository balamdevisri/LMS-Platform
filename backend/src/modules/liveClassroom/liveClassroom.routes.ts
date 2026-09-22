import { Router } from 'express';
import { liveClassroomController } from './liveClassroom.controller';
import { extractOptionalUser, verifyFirebaseToken, requireRole } from '../../middleware/auth.middleware';

const router = Router();

// --- 1. LIVE CLASS CORE CRUD & MANAGEMENT ---
router.get('/', extractOptionalUser as any, (req, res, next) => liveClassroomController.getAllClasses(req, res, next));
router.get('/:classId/media-token', verifyFirebaseToken as any, (req, res, next) => liveClassroomController.getMediaToken(req, res, next));
router.get('/:classId', extractOptionalUser as any, (req, res, next) => liveClassroomController.getClassById(req, res, next));
router.post('/', verifyFirebaseToken as any, requireRole(['admin', 'instructor']) as any, (req, res, next) => liveClassroomController.createClass(req, res, next));
router.patch('/:classId', verifyFirebaseToken as any, requireRole(['admin', 'instructor']) as any, (req, res, next) => liveClassroomController.updateClass(req, res, next));
router.put('/:classId', verifyFirebaseToken as any, requireRole(['admin', 'instructor']) as any, (req, res, next) => liveClassroomController.updateClass(req, res, next));
router.delete('/:classId', verifyFirebaseToken as any, requireRole(['admin', 'instructor']) as any, (req, res, next) => liveClassroomController.deleteClass(req, res, next));

// --- 2. STATE TRANSITIONS & YOUTUBE STREAM ---
router.post('/:classId/start', verifyFirebaseToken as any, requireRole(['admin', 'instructor']) as any, (req, res, next) => liveClassroomController.startClass(req, res, next));
router.post('/:classId/end', verifyFirebaseToken as any, requireRole(['admin', 'instructor']) as any, (req, res, next) => liveClassroomController.endClass(req, res, next));
router.post('/:classId/cancel', verifyFirebaseToken as any, requireRole(['admin', 'instructor']) as any, (req, res, next) => liveClassroomController.cancelClass(req, res, next));
router.put('/:classId/youtube', verifyFirebaseToken as any, requireRole(['admin', 'instructor']) as any, (req, res, next) => liveClassroomController.updateYoutube(req, res, next));
router.post('/:classId/youtube', verifyFirebaseToken as any, requireRole(['admin', 'instructor']) as any, (req, res, next) => liveClassroomController.updateYoutube(req, res, next));
router.post('/:classId/join', verifyFirebaseToken as any, (req, res, next) => liveClassroomController.joinClass(req, res, next));
router.post('/:classId/leave', verifyFirebaseToken as any, (req, res, next) => liveClassroomController.leaveClass(req, res, next));
router.post('/:classId/token', verifyFirebaseToken as any, (req, res, next) => liveClassroomController.generateRoomToken(req, res, next));
router.post('/token', verifyFirebaseToken as any, (req, res, next) => liveClassroomController.generateRoomToken(req, res, next));

// --- 3. ANNOUNCEMENTS ---
router.get('/:classId/announcements', extractOptionalUser as any, (req, res, next) => liveClassroomController.getAnnouncements(req, res, next));
router.post('/:classId/announcements', verifyFirebaseToken as any, requireRole(['admin', 'instructor']) as any, (req, res, next) => liveClassroomController.createAnnouncement(req, res, next));
router.delete('/:classId/announcements/:annId', verifyFirebaseToken as any, requireRole(['admin', 'instructor']) as any, (req, res, next) => liveClassroomController.deleteAnnouncement(req, res, next));

// --- 4. ATTENDANCE & ANALYTICS ---
router.get('/:classId/attendance', verifyFirebaseToken as any, requireRole(['admin', 'instructor']) as any, (req, res, next) => liveClassroomController.getAttendanceReport(req, res, next));
router.get('/:classId/attendance/student/:studentId', verifyFirebaseToken as any, (req, res, next) => liveClassroomController.getStudentAttendance(req, res, next));
router.get('/:classId/attendance/me', verifyFirebaseToken as any, (req, res, next) => liveClassroomController.getStudentAttendance(req, res, next));
router.get('/:classId/analytics', verifyFirebaseToken as any, requireRole(['admin', 'instructor']) as any, (req, res, next) => liveClassroomController.getClassAnalytics(req, res, next));

// --- 5. RECORDING ---
router.get('/:classId/recording', extractOptionalUser as any, (req, res, next) => liveClassroomController.getRecording(req, res, next));
router.post('/:classId/recording', verifyFirebaseToken as any, requireRole(['admin', 'instructor']) as any, (req, res, next) => liveClassroomController.updateRecording(req, res, next));
router.put('/:classId/recording', verifyFirebaseToken as any, requireRole(['admin', 'instructor']) as any, (req, res, next) => liveClassroomController.updateRecording(req, res, next));

// --- 6. QUIZZES ---
router.get('/:classId/quizzes', extractOptionalUser as any, (req, res, next) => liveClassroomController.getQuizzes(req, res, next));
router.post('/:classId/quizzes', verifyFirebaseToken as any, requireRole(['admin', 'instructor']) as any, (req, res, next) => liveClassroomController.createQuiz(req, res, next));
router.post('/:classId/quizzes/:quizId/vote', verifyFirebaseToken as any, (req, res, next) => liveClassroomController.submitQuizAnswer(req, res, next));
router.post('/:classId/quizzes/:quizId/submit', verifyFirebaseToken as any, (req, res, next) => liveClassroomController.submitQuizAnswer(req, res, next));
router.patch('/:classId/quizzes/:quizId/active', verifyFirebaseToken as any, requireRole(['admin', 'instructor']) as any, (req, res, next) => liveClassroomController.toggleQuizActive(req, res, next));

// --- 7. LIVE CHAT ---
router.get('/:classId/chat', extractOptionalUser as any, (req, res, next) => liveClassroomController.getChatMessages(req, res, next));
router.get('/chat/:classId', extractOptionalUser as any, (req, res, next) => liveClassroomController.getChatMessages(req, res, next));
router.post('/:classId/chat', verifyFirebaseToken as any, (req, res, next) => liveClassroomController.sendChatMessage(req, res, next));
router.delete('/:classId/chat/:messageId', verifyFirebaseToken as any, requireRole(['admin', 'instructor']) as any, (req, res, next) => liveClassroomController.deleteChatMessage(req, res, next));

// --- 8. Q&A QUESTIONS ---
router.get('/:classId/questions', extractOptionalUser as any, (req, res, next) => liveClassroomController.getQuestions(req, res, next));
router.post('/:classId/questions', verifyFirebaseToken as any, (req, res, next) => liveClassroomController.submitQuestion(req, res, next));
router.patch('/:classId/questions/:questionId', verifyFirebaseToken as any, (req, res, next) => liveClassroomController.updateQuestion(req, res, next));

// --- 9. POLLS ---
router.get('/:classId/polls', extractOptionalUser as any, (req, res, next) => liveClassroomController.getPolls(req, res, next));
router.post('/:classId/polls', verifyFirebaseToken as any, requireRole(['admin', 'instructor']) as any, (req, res, next) => liveClassroomController.createPoll(req, res, next));
router.post('/:classId/polls/:pollId/vote', verifyFirebaseToken as any, (req, res, next) => liveClassroomController.submitPollVote(req, res, next));

// --- 10. LIVE NOTES ---
router.get('/:classId/notes', extractOptionalUser as any, (req, res, next) => liveClassroomController.getNotes(req, res, next));
router.post('/:classId/notes', verifyFirebaseToken as any, (req, res, next) => liveClassroomController.createNote(req, res, next));

// --- 11. RESOURCES ---
router.get('/:classId/resources', extractOptionalUser as any, (req, res, next) => liveClassroomController.getResources(req, res, next));
router.post('/:classId/resources', verifyFirebaseToken as any, requireRole(['admin', 'instructor']) as any, (req, res, next) => liveClassroomController.createResource(req, res, next));

// --- 12. AI INSIGHTS ---
router.get('/:classId/ai-report', extractOptionalUser as any, (req, res, next) => liveClassroomController.getAIReport(req, res, next));
router.get('/ai-report/:classId', extractOptionalUser as any, (req, res, next) => liveClassroomController.getAIReport(req, res, next));
router.post('/:classId/ai-report/generate', verifyFirebaseToken as any, requireRole(['admin', 'instructor']) as any, (req, res, next) => liveClassroomController.generateAIInsights(req, res, next));

export default router;
