import { Router } from 'express';
import { tagController } from '@controllers/tag.controller';

import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Public routes
router.get('/', tagController.getTags);
router.get('/:id', tagController.getTagById);

// Protected routes (Admin only - sẽ cần role middleware)
// router.use(authMiddleware, roleMiddleware('admin')); // Uncomment sau

router.post('/upload-image', upload.single('image'), tagController.uploadImage);
router.post('/', tagController.createTag);
router.patch('/:id', tagController.updateTag);
router.delete('/:id', tagController.deleteTag);

export default router;