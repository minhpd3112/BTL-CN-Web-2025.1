import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';
import { readLimiter, apiLimiter } from '../middlewares/rateLimiter';

const router = Router();

// Get all users - requires authentication (admin or regular user can view)
router.get('/', readLimiter, authenticate, userController.getUsers);

// Delete user - admin only
router.delete('/:id', apiLimiter, authenticate, requireAdmin, userController.deleteUser);

export default router;
