import { Router } from 'express';
import { LessonController } from '@controllers/lesson.controller';
import { authenticate } from '@middlewares/auth.middleware';
import { readLimiter, createLimiter, apiLimiter } from '@middlewares/rateLimiter';

const router = Router();

// Public routes - Higher limit for read operations
router.get('/section/:sectionId', readLimiter, LessonController.getBySectionId);
router.get('/:id', readLimiter, LessonController.getById);

// Protected routes - Requires authentication
router.post('/', createLimiter, authenticate, LessonController.create);
router.patch('/:id', apiLimiter, authenticate, LessonController.update);
router.delete('/:id', apiLimiter, authenticate, LessonController.delete);
router.post('/reorder', apiLimiter, authenticate, LessonController.reorder);

// Quiz routes - Requires authentication
router.post('/:id/quiz', createLimiter, authenticate, LessonController.addQuizQuestions);
router.patch('/quiz/:questionId', apiLimiter, authenticate, LessonController.updateQuizQuestion);
router.delete('/quiz/:questionId', apiLimiter, authenticate, LessonController.deleteQuizQuestion);

export default router;