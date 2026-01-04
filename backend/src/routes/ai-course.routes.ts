import { Router } from 'express';
import aiCourseController from '../controllers/ai-course.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { aiLimiter } from '../middlewares/rateLimiter';

const router = Router();

// AI endpoints - Strict rate limiting (resource-intensive operations)
router.post('/preview', aiLimiter, authenticate, aiCourseController.previewCourse);

// Generate and save course (requires auth)
router.post('/generate', aiLimiter, authenticate, aiCourseController.generateCourse);

export default router;
