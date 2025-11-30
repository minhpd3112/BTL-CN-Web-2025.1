import { Router } from 'express';
import { courseController } from '@controllers/course.controller';

const router = Router();

// Public routes
router.get('/', courseController.getCourses);
router.get('/:id', courseController.getCourse);

// Protected routes (will add auth middleware later)
router.post('/', courseController.createCourse);
router.patch('/:id', courseController.updateCourse);
router.delete('/:id', courseController.deleteCourse);
router.get('/my/courses', courseController.getMyCourses);
router.post('/:id/submit', courseController.submitForApproval);

// Admin routes (will add admin middleware later)
router.post('/:id/approve', courseController.approveCourse);
router.post('/:id/reject', courseController.rejectCourse);

export default router;