import { Router } from 'express';
import { LessonController } from '@controllers/lesson.controller';
import { authenticate } from '@middlewares/auth.middleware';

const router = Router();

// Public routes
router.get('/section/:sectionId', LessonController.getBySectionId);
router.get('/:id', LessonController.getById);

// Protected routes - Requires authentication
router.post('/', authenticate, LessonController.create);
router.patch('/:id', authenticate, LessonController.update);
router.delete('/:id', authenticate, LessonController.delete);
router.post('/reorder', authenticate, LessonController.reorder);

// Quiz routes - Requires authentication
router.post('/:id/quiz', authenticate, LessonController.addQuizQuestions);
router.patch('/quiz/:questionId', authenticate, LessonController.updateQuizQuestion);
router.delete('/quiz/:questionId', authenticate, LessonController.deleteQuizQuestion);

export default router;