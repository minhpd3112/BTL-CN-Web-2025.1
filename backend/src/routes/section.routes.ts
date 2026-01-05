import { Router } from 'express';
import { SectionController } from '@controllers/section.controller';
import { authenticate } from '@middlewares/auth.middleware';
import { readLimiter, createLimiter, apiLimiter } from '@middlewares/rateLimiter';

const router = Router();

// Public routes - Higher limit for read operations
router.get('/course/:courseId', readLimiter, SectionController.getByCourseId);
router.get('/:id', readLimiter, SectionController.getById);

// Protected routes - Requires authentication
router.post('/', createLimiter, authenticate, SectionController.create);
router.patch('/:id', apiLimiter, authenticate, SectionController.update);
router.delete('/:id', apiLimiter, authenticate, SectionController.delete);
router.post('/reorder', apiLimiter, authenticate, SectionController.reorder);

export default router;