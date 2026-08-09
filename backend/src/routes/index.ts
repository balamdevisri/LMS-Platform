import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import studentRoutes from '../modules/students/student.routes';
import userRoutes from '../modules/users/user.routes';
import courseRoutes from '../modules/courses/course.routes';
import lessonRoutes from '../modules/lessons/lesson.routes';
import quizRoutes from '../modules/quiz/quiz.routes';
import assignmentRoutes from '../modules/assignments/assignment.routes';
import analyticsRoutes from '../modules/analytics/analytic.routes';
import aiRoutes from '../modules/ai/ai.routes';
import emailRoutes from './emailRoutes';
import aiLmsRoutes from './aiLmsRoutes';
import sandboxRoutes from './sandboxRoutes';
import adminRoutes from './admin.routes';
import courseRoutesDirect from './course.routes';
import liveClassroomRoutes from '../modules/liveClassroom/liveClassroom.routes';
import certificateRoutes from './certificateRoutes';
import { verifyFirebaseToken, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'Backend Connected Successfully' });
});

router.use('/auth', authRoutes);
router.use('/auth', studentRoutes);
router.use('/students', studentRoutes);
router.use('/users/students', studentRoutes);
router.use('/users', verifyFirebaseToken as any, requireRole('admin') as any, userRoutes);
router.use('/courses', courseRoutes);
router.use('/course', courseRoutesDirect);
router.use('/lessons', lessonRoutes);
router.use('/quizzes', quizRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/ai', aiRoutes);
router.use('/email', emailRoutes);
router.use('/ai-lms', aiLmsRoutes);
router.use('/sandbox', sandboxRoutes);
router.use('/admin', adminRoutes);
router.use('/certificates', certificateRoutes);
router.use('/live-classroom', liveClassroomRoutes);
router.use('/live-classes', liveClassroomRoutes);

export default router;