import { Router } from 'express';
import { ReviewController } from '@controllers/review.controller';
import { authenticate } from '@middlewares/auth.middleware';
import { readLimiter, createLimiter, apiLimiter } from '@middlewares/rateLimiter';

const router = Router();

// Public routes - Higher limit for read operations
router.get('/course/:courseId', readLimiter, ReviewController.getByCourseId);
router.get('/user/:userId/course/:courseId', readLimiter, ReviewController.getUserReview);

// Protected routes
router.post('/', createLimiter, authenticate, ReviewController.create);
router.delete('/:id', apiLimiter, authenticate, ReviewController.delete);

export default router;
