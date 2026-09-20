import { Router } from 'express';
import { NotificationController } from './notification.controller';
import { extractOptionalUser } from '../../middleware/auth.middleware';

const router = Router();
const controller = new NotificationController();

// Use extractOptionalUser to support both Bearer tokens and client queries
router.use(extractOptionalUser as any);

// Routes
router.get('/', controller.getUserNotifications);
router.get('/unread-count', controller.getUnreadCount);
router.patch('/read-all', controller.markAllAsRead);
router.patch('/:id/read', controller.markAsRead);

export default router;
