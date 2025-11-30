import { Router } from 'express';
import { SectionController } from '@controllers/section.controller';
// import { authenticate, requireOwnerOrAdmin } from '@middlewares/auth.middleware';
// import { validateSectionCreate } from '@middlewares/validation.middleware';

const router = Router();

// Public routes
router.get('/course/:courseId', SectionController.getByCourseId);
router.get('/:id', SectionController.getById);

// Protected routes (TEMPORARY - no auth)
router.post('/', SectionController.create);
router.patch('/:id', SectionController.update);
router.delete('/:id', SectionController.delete);
router.post('/reorder', SectionController.reorder);

// TODO: Add auth later
// router.post('/', authenticate, validateSectionCreate, SectionController.create);
// router.patch('/:id', authenticate, requireOwnerOrAdmin('section'), SectionController.update);
// router.delete('/:id', authenticate, requireOwnerOrAdmin('section'), SectionController.delete);

export default router;