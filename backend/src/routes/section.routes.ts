import { Router } from 'express';
import { SectionController } from '@controllers/section.controller';
import { authenticate } from '@middlewares/auth.middleware';

const router = Router();

// Public routes
router.get('/course/:courseId', SectionController.getByCourseId);
router.get('/:id', SectionController.getById);

// Protected routes - Requires authentication
router.post('/', authenticate, SectionController.create);
router.patch('/:id', authenticate, SectionController.update);
router.delete('/:id', authenticate, SectionController.delete);
router.post('/reorder', authenticate, SectionController.reorder);

export default router;