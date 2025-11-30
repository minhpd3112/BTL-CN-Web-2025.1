import { Router } from 'express';
import { courseController } from '@controllers/course.controller';
// import { authenticate } from '@middlewares/auth.middleware'; // Uncomment khi có auth

const router = Router();

// Public routes
router.get('/', courseController.getCourses);
router.get('/:id', courseController.getCourseById);

// Protected routes (uncomment khi có auth middleware)
// router.post('/', authenticate, courseController.createCourse);
// router.patch('/:id', authenticate, courseController.updateCourse);
// router.delete('/:id', authenticate, courseController.deleteCourse);

// Temporary routes (REMOVE khi có auth)
router.post('/', courseController.createCourse);
router.patch('/:id', courseController.updateCourse);
router.delete('/:id', courseController.deleteCourse);

export default router;