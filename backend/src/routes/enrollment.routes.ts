import { Router } from 'express';
import { EnrollmentController } from '@controllers/enrollment.controller';
import { authenticate } from '@middlewares/auth.middleware';
import { readLimiter, createLimiter, apiLimiter } from '@middlewares/rateLimiter';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

router.get('/my-enrollments', readLimiter, EnrollmentController.getMyEnrollments);
router.get('/course/:courseId', readLimiter, EnrollmentController.getByCourseId);
router.post('/', createLimiter, EnrollmentController.create);
router.post('/invite-by-email', createLimiter, EnrollmentController.inviteByEmail);
router.patch('/:id/status', apiLimiter, EnrollmentController.updateStatus);
router.delete('/:id', apiLimiter, EnrollmentController.delete);
router.patch('/:id/leave', apiLimiter, EnrollmentController.leaveCourse);
router.delete('/:id/leave-test', apiLimiter, EnrollmentController.leaveCourse);
router.get('/:id/progress', readLimiter, EnrollmentController.getProgress);
router.get('/course/:courseId/average-progress', readLimiter, EnrollmentController.getCourseAverageProgress);

export default router;
