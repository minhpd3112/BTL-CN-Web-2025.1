import { Router } from 'express';
import { NotificationController } from '@controllers/notification.controller';
import { authenticate } from '@middlewares/auth.middleware';
import { readLimiter, apiLimiter } from '@middlewares/rateLimiter';

const router = Router();

router.use(authenticate);

router.get('/', readLimiter, NotificationController.getMyNotifications);
router.patch('/:id/read', apiLimiter, NotificationController.markAsRead);
router.patch('/read-all', apiLimiter, NotificationController.markAllAsRead);

export default router;
