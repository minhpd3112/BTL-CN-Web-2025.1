import { Router } from 'express';
import aiCourseController from '../controllers/ai-course.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Preview course (requires auth)
router.post('/preview', authenticate, aiCourseController.previewCourse);

// Generate and save course (requires auth)
router.post('/generate', authenticate, aiCourseController.generateCourse);

export default router;
