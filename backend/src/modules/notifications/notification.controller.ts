import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { formatResponse } from '../../utils/responseFormatter';
import { NotificationService } from './notification.service';

export class NotificationController {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  /**
   * GET /api/notifications
   * Fetch durable notifications for current user
   */
  public getUserNotifications = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const userId = user?.uid || user?.id || (req.query.userId as string);

    if (!userId) {
      return res.status(401).json(formatResponse(false, null, 'User authentication required'));
    }

    const limitCount = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const notifications = await this.notificationService.getUserNotifications(userId, limitCount);
    res.json(formatResponse(true, notifications, 'Notifications retrieved successfully'));
  });

  /**
   * PATCH /api/notifications/:id/read
   * Mark a single notification as read
   */
  public markAsRead = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const userId = user?.uid || user?.id || (req.body.userId as string);
    const notificationId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!notificationId) {
      return res.status(400).json(formatResponse(false, null, 'Notification ID is required'));
    }

    const success = await this.notificationService.markAsRead(notificationId as string, userId || 'anonymous');
    res.json(formatResponse(success, { id: notificationId, read: true }, 'Notification marked as read'));
  });

  /**
   * PATCH /api/notifications/read-all
   * Mark all notifications for user as read
   */
  public markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const userId = user?.uid || user?.id || (req.body.userId as string);

    if (!userId) {
      return res.status(401).json(formatResponse(false, null, 'User authentication required'));
    }

    const updatedCount = await this.notificationService.markAllAsRead(userId);
    res.json(formatResponse(true, { updatedCount }, 'All notifications marked as read'));
  });

  /**
   * GET /api/notifications/unread-count
   * Get unread notifications count
   */
  public getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const userId = user?.uid || user?.id || (req.query.userId as string);

    if (!userId) {
      return res.status(401).json(formatResponse(false, null, 'User authentication required'));
    }

    const count = await this.notificationService.getUnreadCount(userId);
    res.json(formatResponse(true, { unreadCount: count }, 'Unread count retrieved successfully'));
  });
}
