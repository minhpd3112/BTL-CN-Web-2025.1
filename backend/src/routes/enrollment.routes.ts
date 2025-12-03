import { Router } from 'express';
import { EnrollmentController } from '@controllers/enrollment.controller';

const router = Router();

// TEMPORARY - no auth
router.get('/my-enrollments', EnrollmentController.getMyEnrollments);
router.get('/course/:courseId', EnrollmentController.getByCourseId);
router.post('/', EnrollmentController.create);
router.patch('/:id/status', EnrollmentController.updateStatus);
router.delete('/:id', EnrollmentController.delete);
router.get('/:id/progress', EnrollmentController.getProgress);

// TODO: Add auth later
// router.use(authenticate);
// router.post('/', validateEnrollmentCreate, EnrollmentController.create);

export default router;