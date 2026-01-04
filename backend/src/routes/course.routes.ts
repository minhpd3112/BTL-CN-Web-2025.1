import { Router } from 'express';
import { courseController } from '@controllers/course.controller';
import { authenticate, requireAdmin } from '@middlewares/auth.middleware';
import { readLimiter, createLimiter, apiLimiter } from '@middlewares/rateLimiter';

const router = Router();

// Public routes - Higher limit for read operations
router.get('/', readLimiter, courseController.getCourses);
router.get('/:id', readLimiter, courseController.getCourseById);

// Protected routes - require authentication
router.post('/', createLimiter, authenticate, courseController.createCourse);
router.post('/:id/tags', apiLimiter, authenticate, courseController.addCourseTags);
router.patch('/:id', apiLimiter, authenticate, courseController.updateCourse);
// Admin review course (approve/reject)
router.patch('/:id/review', apiLimiter, authenticate, requireAdmin, courseController.reviewCourse);
import { requireOwnerOrAdmin } from '@middlewares/auth.middleware';
router.delete('/:id', apiLimiter, authenticate, requireOwnerOrAdmin('course'), courseController.deleteCourse);

export default router;
