import { Router } from 'express';
import { courseController } from '@controllers/course.controller';
import { authenticate } from '@middlewares/auth.middleware';

const router = Router();

// Public routes
router.get('/', courseController.getCourses);
router.get('/:id', courseController.getCourseById);

// Protected routes - require authentication
router.post('/', authenticate, courseController.createCourse);
router.post('/:id/tags', authenticate, courseController.addCourseTags);
router.patch('/:id', authenticate, courseController.updateCourse);
router.delete('/:id', authenticate, courseController.deleteCourse);

export default router;
