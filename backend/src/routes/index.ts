import { Router } from 'express';

import authRoutes from './auth.routes';
import tagRoutes from './tag.routes';
import courseRoutes from './course.routes';
import sectionRoutes from './section.routes';
import lessonRoutes from './lesson.routes';
import enrollmentRoutes from './enrollment.routes';
import userRoutes from './user.routes';

const router = Router();


router.use('/auth', authRoutes);
router.use('/tags', tagRoutes);
router.use('/courses', courseRoutes);
router.use('/sections', sectionRoutes);
router.use('/lessons', lessonRoutes);
router.use('/enrollments', enrollmentRoutes);
router.use('/users', userRoutes);

export default router;