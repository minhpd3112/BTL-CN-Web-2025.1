import { Router } from 'express';
import courseRoutes from './course.routes';
import tagRoutes from './tag.routes';

const router = Router();

// API routes
router.use('/courses', courseRoutes);
router.use('/tags', tagRoutes);

export default router;