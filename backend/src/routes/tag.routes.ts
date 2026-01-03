import { Router } from 'express';
import { tagController } from '@controllers/tag.controller';
import { authenticate, requireAdmin } from '@middlewares/auth.middleware';

const router = Router();

// Public routes
router.get('/', tagController.getTags);
router.get('/:id', tagController.getTagById);

// Protected routes - Admin only
router.post('/', authenticate, requireAdmin, tagController.createTag);
router.patch('/:id', authenticate, requireAdmin, tagController.updateTag);
router.delete('/:id', authenticate, requireAdmin, tagController.deleteTag);

export default router;