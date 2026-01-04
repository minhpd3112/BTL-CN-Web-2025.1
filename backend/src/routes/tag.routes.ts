import { Router } from 'express';
import { tagController } from '@controllers/tag.controller';
import { authenticate, requireAdmin } from '@middlewares/auth.middleware';
import { readLimiter, createLimiter, apiLimiter } from '@middlewares/rateLimiter';

const router = Router();

// Public routes - Higher limit for read operations
router.get('/', readLimiter, tagController.getTags);
router.get('/:id', readLimiter, tagController.getTagById);

// Protected routes - Admin only
router.post('/', createLimiter, authenticate, requireAdmin, tagController.createTag);
router.patch('/:id', apiLimiter, authenticate, requireAdmin, tagController.updateTag);
router.delete('/:id', apiLimiter, authenticate, requireAdmin, tagController.deleteTag);

export default router;