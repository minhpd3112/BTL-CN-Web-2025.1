import { Router } from 'express';
import authRoutes from './auth.routes';
import tagRoutes from './tag.routes';
import courseRoutes from './course.routes';
import sectionRoutes from './section.routes';
import lessonRoutes from './lesson.routes';
import enrollmentRoutes from './enrollment.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/tags', tagRoutes);
router.use('/courses', courseRoutes);
router.use('/sections', sectionRoutes);
router.use('/lessons', lessonRoutes);
router.use('/enrollments', enrollmentRoutes);

export default router;