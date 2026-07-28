import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
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

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'Backend Connected Successfully' });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/courses', courseRoutes);
router.use('/lessons', lessonRoutes);
router.use('/quizzes', quizRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/ai', aiRoutes);
router.use('/email', emailRoutes);
router.use('/ai-lms', aiLmsRoutes);
router.use('/sandbox', sandboxRoutes);

export default router;