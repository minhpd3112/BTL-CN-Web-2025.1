import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Get all users - requires authentication (admin or regular user can view)
router.get('/', authenticate, userController.getUsers);

// Delete user - admin only
router.delete('/:id', authenticate, requireAdmin, userController.deleteUser);

export default router;
