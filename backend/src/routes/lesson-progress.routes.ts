import { Router } from 'express';
import { LessonProgressController } from '../controllers/lesson-progress.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { apiLimiter, readLimiter } from '../middlewares/rateLimiter';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

router.post('/toggle', apiLimiter, LessonProgressController.toggleCompletion);
router.get('/course/:courseId', readLimiter, LessonProgressController.getUserProgress);

export default router;
