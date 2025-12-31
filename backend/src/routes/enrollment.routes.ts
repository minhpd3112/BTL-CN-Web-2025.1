import { Router } from 'express';
import { EnrollmentController } from '@controllers/enrollment.controller';
import { authenticate } from '@middlewares/auth.middleware';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

router.get('/my-enrollments', EnrollmentController.getMyEnrollments);
router.get('/course/:courseId', EnrollmentController.getByCourseId);
router.post('/', EnrollmentController.create);
router.post('/invite-by-email', EnrollmentController.inviteByEmail);
router.patch('/:id/status', EnrollmentController.updateStatus);
router.delete('/:id', EnrollmentController.delete);
router.patch('/:id/leave', EnrollmentController.leaveCourse);
router.delete('/:id/leave-test', EnrollmentController.leaveCourse);
router.get('/:id/progress', EnrollmentController.getProgress);
router.get('/course/:courseId/average-progress', EnrollmentController.getCourseAverageProgress);

export default router;
