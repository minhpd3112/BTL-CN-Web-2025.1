import { Router } from 'express';
import { authController } from '@controllers/auth.controller';
import { adminController } from '@controllers/admin.controller';
import { authenticate } from '@middlewares/auth.middleware';
import { authLimiter, apiLimiter } from '@middlewares/rateLimiter';

const router = Router();

// Public routes - Strict rate limiting for auth endpoints
router.post('/signup', authLimiter, authController.signup);
router.post('/login', authLimiter, authController.login);
router.post('/logout', apiLimiter, authController.logout);
router.post('/admin/login', authLimiter, adminController.login);

// Protected routes - General API rate limiting
router.get('/profile', apiLimiter, authenticate, authController.getProfile);
router.patch('/profile', apiLimiter, authenticate, authController.updateProfile);

export default router;
