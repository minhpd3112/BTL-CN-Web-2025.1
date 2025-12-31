import { supabase, supabaseAdmin } from '@config/supabase';
import { Enrollment } from '../types';

export const EnrollmentModel = {
  async deleteByUser(id: string, userId: string) {
    // Only allow delete if the enrollment belongs to the user
    const { error } = await supabaseAdmin
      .from('enrollments')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw error;
    return { success: true };
  },
  async findByUserId(userId: string) {
    const { data, error } = await supabaseAdmin
      .from('enrollments')
      .select(`
        *,
        course:courses(*)
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  },

  async findByCourseId(courseId: string, status?: string) {
    let query = supabaseAdmin
      .from('enrollments')
      .select('*')
      .eq('course_id', courseId);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    console.log('EnrollmentModel.findByCourseId:', { courseId, found: data?.length, error });
    if (error) throw error;
    return data || [];
  },

  async findById(id: string) {
    const { data, error } = await supabaseAdmin
      .from('enrollments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(enrollmentData: Partial<Enrollment>) {
    // Nếu là public và status=approved thì dùng supabaseAdmin để bypass RLS
    const isPublicApproved = enrollmentData.status === 'approved';
    const client = isPublicApproved ? supabaseAdmin : supabase;
    const { data, error } = await client
      .from('enrollments')
      .insert([{
        ...enrollmentData,
        status: enrollmentData.status || 'pending'
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


  async getProgress(userId: string, courseId: string) {
    const { data: sections } = await supabaseAdmin
      .from('sections')
      .select('id')
      .eq('course_id', courseId);

    if (!sections) return { total: 0, completed: 0, percentage: 0 };

    const sectionIds = sections.map(s => s.id);

    const { data: lessons } = await supabaseAdmin
      .from('lessons')
      .select('id')
      .in('section_id', sectionIds);

    const totalLessons = lessons?.length || 0;

    const { data: progress } = await supabaseAdmin
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
  },

  async getCourseAverageProgress(courseId: string) {
    // Get all approved enrollments for this course
    const { data: enrollments } = await supabaseAdmin
      .from('enrollments')
      .select('user_id')
      .eq('course_id', courseId)
      .eq('status', 'approved');

    if (!enrollments || enrollments.length === 0) {
      return { averageProgress: 0, totalStudents: 0 };
    }

    // Calculate progress for each student
    const progressPromises = enrollments.map(enrollment =>
      this.getProgress(enrollment.user_id, courseId)
    );

    const progressResults = await Promise.all(progressPromises);

    // Calculate average
    const totalPercentage = progressResults.reduce((sum, result) => sum + result.percentage, 0);
    const averageProgress = enrollments.length > 0
      ? Math.round(totalPercentage / enrollments.length)
      : 0;

    return {
      averageProgress,
      totalStudents: enrollments.length,
    };
  }
};