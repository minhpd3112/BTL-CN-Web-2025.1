import { Router } from 'express';
import { LessonController } from '@controllers/lesson.controller';

const router = Router();

// Public routes
router.get('/section/:sectionId', LessonController.getBySectionId);
router.get('/:id', LessonController.getById);

// Protected routes (TEMPORARY - no auth)
router.post('/', LessonController.create);
router.patch('/:id', LessonController.update);
router.delete('/:id', LessonController.delete);
router.post('/reorder', LessonController.reorder);

// Quiz routes
router.post('/:id/quiz', LessonController.addQuizQuestions);
router.patch('/quiz/:questionId', LessonController.updateQuizQuestion);
router.delete('/quiz/:questionId', LessonController.deleteQuizQuestion);

export default router;