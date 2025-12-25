import { Router } from 'express';
import authRoutes from './auth.routes';
import tagRoutes from './tag.routes';
import courseRoutes from './course.routes';
import sectionRoutes from './section.routes';
import lessonRoutes from './lesson.routes';
import enrollmentRoutes from './enrollment.routes';
import lessonProgressRoutes from './lesson-progress.routes';
import quizRoutes from './quiz.routes';
import reviewRoutes from './review.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/tags', tagRoutes);
router.use('/courses', courseRoutes);
router.use('/sections', sectionRoutes);
router.use('/lessons', lessonRoutes);
router.use('/enrollments', enrollmentRoutes);
router.use('/lesson-progress', lessonProgressRoutes);
router.use('/quiz', quizRoutes);
router.use('/reviews', reviewRoutes);

export default router;