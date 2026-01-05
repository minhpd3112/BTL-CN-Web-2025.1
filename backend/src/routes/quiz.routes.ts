import { Router } from 'express';
import { QuizController } from '@controllers/quiz.controller';
import { authenticate, optionalAuth } from '@middlewares/auth.middleware';
import { createLimiter, readLimiter, apiLimiter } from '@middlewares/rateLimiter';

const router = Router();

// Create or update quiz for a lesson (requires authentication - course owner check in controller)
router.post('/:lessonId', createLimiter, authenticate, QuizController.createOrUpdateQuiz);
// Get quiz by lesson ID (optional auth - can view without login, but shows previous attempts if logged in)
router.get('/:lessonId', readLimiter, optionalAuth, QuizController.getQuizByLessonId);
// Submit quiz answers (requires authentication)
router.post('/:lessonId/submit', apiLimiter, authenticate, QuizController.submitQuiz);

// Get quiz attempts history (requires authentication)
router.get('/:lessonId/attempts', readLimiter, authenticate, QuizController.getQuizAttempts);

export default router;
