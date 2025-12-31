import { Request, Response } from 'express';
import { NotificationModel } from '@models/notification.model';
import { httpStatus } from '@utils/httpStatus';

export const NotificationController = {
  async getMyNotifications(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const notifications = await NotificationModel.findByUserId(userId);
      res.json({ success: true, data: notifications });
    } catch (error: any) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch notifications',
        error: error.message,
      });
    }
  },

  async markAsRead(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      await NotificationModel.markAsRead(id, userId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to mark notification as read',
        error: error.message,
      });
    }
  },

  async markAllAsRead(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      await NotificationModel.markAllAsRead(userId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to mark all notifications as read',
        error: error.message,
      });
    }
  },
};
