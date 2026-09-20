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
import paymentRoutes from './payment.routes';
import liveClassroomRoutes from '../modules/liveClassroom/liveClassroom.routes';
import certificateRoutes from './certificateRoutes';
import enrollmentRoutes from '../modules/enrollments/enrollment.routes';
import portfolioRoutes from './portfolioRoutes';
import resumeRoutes from './resumeRoutes';
import developerAccessRoutes from './developerAccess.routes';
import uploadRoutes from '../modules/upload/upload.routes';
import couponRoutes from '../modules/coupons/coupon.routes';
import notificationRoutes from '../modules/notifications/notification.routes';
import { verifyFirebaseToken, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.use('/developer-access', developerAccessRoutes);
router.use('/upload', uploadRoutes);

router.get('/', (req, res) => {
  res.json({ message: 'Backend Connected Successfully' });
});

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    firebaseProject: process.env.FIREBASE_PROJECT_ID || 'shaivika-lms-ai',
  });
});

router.get('/diagnostics', (req, res) => {
  res.json({
    status: 'healthy',
    canonicalDatabase: 'Cloud Firestore',
    firebaseProject: process.env.FIREBASE_PROJECT_ID || 'shaivika-lms-ai',
    environment: process.env.NODE_ENV || 'development',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  });
});

router.use('/auth', authRoutes);
router.use('/auth', studentRoutes);
router.use('/students', studentRoutes);
router.use('/users/students', studentRoutes);
router.use('/users', verifyFirebaseToken as any, requireRole('admin') as any, userRoutes);
router.use('/courses', courseRoutes);
router.use('/lessons', lessonRoutes);
router.use('/quizzes', quizRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/ai', aiRoutes);
router.use('/email', emailRoutes);
router.use('/ai-lms', aiLmsRoutes);
router.use('/sandbox', sandboxRoutes);
router.use('/admin', adminRoutes);
router.use('/coupons', couponRoutes);
router.use('/payments', paymentRoutes);
router.use('/certificates', certificateRoutes);
router.use('/enrollments', enrollmentRoutes);
router.use('/live-classroom', liveClassroomRoutes);
router.use('/live-classes', liveClassroomRoutes);
router.use('/portfolio', portfolioRoutes);
router.use('/resume', resumeRoutes);
router.use('/notifications', notificationRoutes);

export default router;