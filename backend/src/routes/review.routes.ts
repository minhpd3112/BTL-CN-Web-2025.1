import { Router } from 'express';
import { ReviewController } from '@controllers/review.controller';
import { authenticate } from '@middlewares/auth.middleware';

const router = Router();

// Public routes
router.get('/course/:courseId', ReviewController.getByCourseId);
router.get('/user/:userId/course/:courseId', ReviewController.getUserReview);

// Protected routes
router.post('/', authenticate, ReviewController.create);
router.delete('/:id', authenticate, ReviewController.delete);

export default router;
