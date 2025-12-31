import { Router } from 'express';
import { QuizController } from '@controllers/quiz.controller';
import { authenticate, optionalAuth } from '@middlewares/auth.middleware';

const router = Router();

// Create or update quiz for a lesson (instructor only - but we rely on RLS/business logic)
router.post('/:lessonId', QuizController.createOrUpdateQuiz);
// Get quiz by lesson ID (optional auth - can view without login, but shows previous attempts if logged in)
router.get('/:lessonId', optionalAuth, QuizController.getQuizByLessonId);
// Submit quiz answers (requires authentication)
router.post('/:lessonId/submit', authenticate, QuizController.submitQuiz);

// Get quiz attempts history (requires authentication)
router.get('/:lessonId/attempts', authenticate, QuizController.getQuizAttempts);

export default router;
