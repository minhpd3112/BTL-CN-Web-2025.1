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

            // Check if user has completed all lessons in the course
            // 1. Get lesson info (to get section_id and course_id)
            const { data: lesson } = await require('../models/lesson.model').LessonModel.findById(lessonId);
            if (lesson && lesson.section_id) {
                const { data: section } = await require('../models/section.model').SectionModel.findById(lesson.section_id);
                if (section && section.course_id) {
                    // Get all lessons in course
                    const { data: sections } = await require('../config/supabase').supabaseAdmin
                        .from('sections')
                        .select('id')
                        .eq('course_id', section.course_id);
                    const sectionIds = sections?.map((s: any) => s.id) || [];
                    const { data: lessons } = await require('../config/supabase').supabaseAdmin
                        .from('lessons')
                        .select('id')
                        .in('section_id', sectionIds);
                    const lessonIds = lessons?.map((l: any) => l.id) || [];
                    // Get completed lessons for user
                    const { data: completed } = await require('../config/supabase').supabaseAdmin
                        .from('lesson_progress')
                        .select('lesson_id')
                        .eq('user_id', userId)
                        .eq('completed', true)
                        .in('lesson_id', lessonIds);
                    if (lessonIds.length > 0 && completed?.length === lessonIds.length) {
                        // User completed all lessons in course
                        // Send notification to user and course owner
                        const { data: course } = await require('../config/supabase').supabaseAdmin
                            .from('courses')
                            .select('title, owner_id')
                            .eq('id', section.course_id)
                            .single();
                        const { data: userProfile } = await require('../config/supabase').supabaseAdmin
                            .from('user_profiles')
                            .select('full_name')
                            .eq('id', userId)
                            .single();
                        // Notify student
                        await require('./notification.model').NotificationModel.createNotification({
                            user_id: userId,
                            type: 'course_completed',
                            title: 'Chúc mừng bạn đã hoàn thành khoá học!',
                            message: `Bạn đã hoàn thành khoá học "${course?.title || ''}"!`,
                            related_course_id: section.course_id,
                        });
                        // Notify course owner
                        await require('./notification.model').NotificationModel.createNotification({
                            user_id: course?.owner_id,
                            type: 'course_completed',
                            title: 'Học viên đã hoàn thành khoá học',
                            message: `${userProfile?.full_name || 'Một học viên'} đã hoàn thành khoá học "${course?.title || ''}"!`,
                            related_course_id: section.course_id,
                        });
                    }
                }
            }

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
