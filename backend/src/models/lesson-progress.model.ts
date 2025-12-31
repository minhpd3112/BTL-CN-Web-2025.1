import { supabaseAdmin } from '../config/supabase';

export const LessonProgressModel = {
    async toggleCompletion(userId: string, lessonId: string) {
        // Check if progress record exists
        const { data: existing } = await supabaseAdmin
            .from('lesson_progress')
            .select('*')
            .eq('user_id', userId)
            .eq('lesson_id', lessonId)
            .maybeSingle();

        if (existing) {
            // Toggle completion
            const newCompleted = !existing.completed;
            const { data, error } = await supabaseAdmin
                .from('lesson_progress')
                .update({
                    completed: newCompleted,
                    completed_at: newCompleted ? new Date().toISOString() : null,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', userId)
                .eq('lesson_id', lessonId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } else {
            // Create new record as completed
            const { data, error } = await supabaseAdmin
                .from('lesson_progress')
                .insert({
                    user_id: userId,
                    lesson_id: lessonId,
                    completed: true,
                    completed_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        }
    },

    async getUserProgressForCourse(userId: string, courseId: string) {
        // Get all lessons in course
        const { data: sections } = await supabaseAdmin
            .from('sections')
            .select('id')
            .eq('course_id', courseId);

        if (!sections || sections.length === 0) return [];

        const sectionIds = sections.map(s => s.id);
        const { data: lessons } = await supabaseAdmin
            .from('lessons')
            .select('id')
            .in('section_id', sectionIds);

        if (!lessons || lessons.length === 0) return [];

        const lessonIds = lessons.map(l => l.id);

        // Get progress for these lessons
        const { data: progress } = await supabaseAdmin
            .from('lesson_progress')
            .select('*')
            .eq('user_id', userId)
            .in('lesson_id', lessonIds);

        return progress || [];
    }
};
