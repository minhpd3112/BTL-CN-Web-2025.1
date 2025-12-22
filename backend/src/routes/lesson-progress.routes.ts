import { Router } from 'express';
import { LessonProgressController } from '../controllers/lesson-progress.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

router.post('/toggle', LessonProgressController.toggleCompletion);
router.get('/course/:courseId', LessonProgressController.getUserProgress);

export default router;
