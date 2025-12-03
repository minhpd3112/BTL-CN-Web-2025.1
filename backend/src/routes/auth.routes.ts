import { Router } from 'express';
import { authController } from '@controllers/auth.controller';
import { authenticate } from '@middlewares/auth.middleware';

const router = Router();

// Public routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Protected routes
router.get('/profile', authenticate, authController.getProfile);
router.patch('/profile', authenticate, authController.updateProfile);

export default router;
