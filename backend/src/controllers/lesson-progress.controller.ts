import { Request, Response } from 'express';
import { LessonProgressModel } from '../models/lesson-progress.model';

export const LessonProgressController = {
    async toggleCompletion(req: Request, res: Response) {
        try {
            const userId = req.user!.id;
            const { lessonId } = req.body;

            if (!lessonId) {
                return res.status(400).json({
                    success: false,
                    message: 'lessonId is required'
                });
            }

            const progress = await LessonProgressModel.toggleCompletion(userId, lessonId);

            res.json({
                success: true,
                data: progress
            });
        } catch (error: any) {
            console.error('Toggle lesson completion error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to toggle lesson completion',
                error: error.message
            });
        }
    },

    async getUserProgress(req: Request, res: Response) {
        try {
            const userId = req.user!.id;
            const { courseId } = req.params;

            const progress = await LessonProgressModel.getUserProgressForCourse(userId, courseId);

            res.json({
                success: true,
                data: progress
            });
        } catch (error: any) {
            console.error('Get user progress error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch user progress',
                error: error.message
            });
        }
    }
};
