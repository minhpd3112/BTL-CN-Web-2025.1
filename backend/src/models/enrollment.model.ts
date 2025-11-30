import { supabase } from '@config/supabase';
import { Enrollment } from '@types/index';

export const EnrollmentModel = {
  async findByUserId(userId: string) {
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        *,
        course:courses(
          *,
          owner:user_profiles!courses_owner_id_fkey(full_name, avatar_url)
        )
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  },

  async findByCourseId(courseId: string, status?: string) {
    let query = supabase
      .from('enrollments')
      .select(`
        *,
        user:user_profiles!enrollments_user_id_fkey(id, full_name, avatar_url)
      `)
      .eq('course_id', courseId);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async findById(id: string) {
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        *,
        user:user_profiles!enrollments_user_id_fkey(*),
        course:courses(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(enrollmentData: Partial<Enrollment>) {
    const { data, error } = await supabase
      .from('enrollments')
      .insert([{
        ...enrollmentData,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateStatus(
    id: string,
    status: 'approved' | 'rejected',
    approvedBy: string,
    rejectionReason?: string
  ) {
    const { data, error } = await supabase
      .from('enrollments')
      .update({
        status,
        approved_by: status === 'approved' ? approvedBy : null,
        rejection_reason: rejectionReason,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('enrollments')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  },

  async getProgress(userId: string, courseId: string) {
    const { data: sections } = await supabase
      .from('sections')
      .select('id')
      .eq('course_id', courseId);

    if (!sections) return { total: 0, completed: 0, percentage: 0 };

    const sectionIds = sections.map(s => s.id);

    const { data: lessons } = await supabase
      .from('lessons')
      .select('id')
      .in('section_id', sectionIds);

    const totalLessons = lessons?.length || 0;

    const { data: progress } = await supabase
      .from('lesson_progress')
      .select('id')
      .eq('user_id', userId)
      .in('lesson_id', lessons?.map(l => l.id) || [])
      .eq('completed', true);

    const completedLessons = progress?.length || 0;

    return {
      total: totalLessons,
      completed: completedLessons,
      percentage: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
    };
  }
};