import { Router } from 'express';
import { tagController } from '@controllers/tag.controller';

const router = Router();

// Public routes
router.get('/', tagController.getTags);
router.get('/:id', tagController.getTagById);

// Protected routes (Admin only - sẽ cần role middleware)
// router.use(authMiddleware, roleMiddleware('admin')); // Uncomment sau

router.post('/', tagController.createTag);
router.patch('/:id', tagController.updateTag);
router.delete('/:id', tagController.deleteTag);

export default router;