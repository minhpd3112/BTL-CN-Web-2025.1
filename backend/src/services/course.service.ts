import { supabase, supabaseAdmin } from '@config/supabase';
import type { 
  Course, 
  CourseFilters, 
  PaginatedResponse,
  CourseWithDetails
} from 'types/index';

// Extend CourseFilters to include isAdmin property
interface ExtendedCourseFilters extends CourseFilters {
  isAdmin?: boolean;
}

export const courseService = {
  async getCourses(
    filters: ExtendedCourseFilters
  ): Promise<PaginatedResponse<CourseWithDetails>> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        status,
        visibility,
        tags,
      } = filters;

      const offset = (page - 1) * limit;

      // Nếu truyền owner_id thì trả về tất cả khoá học của owner đó (bỏ filter status/visibility)
      let query;
      if (filters.owner_id) {
        query = supabase
          .from('courses')
          .select(`
            *,
            course_tags(
              tags(*)
            )
          `, { count: 'exact' })
          .eq('owner_id', filters.owner_id);
      } else {
        // Nếu là admin (không truyền visibility hoặc truyền 1 flag isAdmin), dùng supabaseAdmin để lấy tất cả khoá học
        const isAdmin = !filters.visibility || filters.isAdmin;
        query = (isAdmin ? supabaseAdmin : supabase)
          .from('courses')
          .select(`
            *,
            course_tags(
              tags(*)
            )
          `, { count: 'exact' });
        if (status) {
          query = query.eq('status', status);
        }
        if (visibility) {
          query = query.eq('visibility', visibility);
        }
      }

      // Apply filters
      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      }

      // Apply pagination and ordering
      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('Get courses error:', error);
        throw new Error(`Failed to fetch courses: ${error.message}`);
      }

      // Transform data
      const courses = (data || []).map((course: any) => ({
        ...course,
        tags: course.course_tags?.map((ct: any) => ct.tags).filter(Boolean) || [],
        enrollmentCount: 0,
      }));

      return {
        data: courses,
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      };
    } catch (error) {
      console.error('Get courses service error:', error);
      throw error;
    }
  },

  async getCourseById(id: string, userId?: string): Promise<CourseWithDetails | null> {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          course_tags(
            tags(*)
          ),
          sections(
            *,
            lessons(*)
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new Error(`Failed to fetch course: ${error.message}`);
      }

      if (!data) {
        return null;
      }

      // Check access permission
      if (data.visibility === 'private' && data.owner_id !== userId) {
        return null;
      }

      // Transform data
      return {
        ...data,
        tags: data.course_tags?.map((ct: any) => ct.tags).filter(Boolean) || [],
        enrollmentCount: 0,
      };
    } catch (error) {
      console.error('Get course by ID error:', error);
      throw error;
    }
  },

  async createCourse(userId: string, courseData: any): Promise<Course> {
    try {
      const { data, error } = await supabase
        .from('courses')
        .insert([{
          ...courseData,
          owner_id: userId,
          status: 'draft',
        }])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create course: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Create course error:', error);
      throw error;
    }
  },

  async updateCourse(id: string, userId: string, updates: any): Promise<Course | null> {
    try {
      // Check ownership
      const { data: existingCourse } = await supabase
        .from('courses')
        .select('owner_id')
        .eq('id', id)
        .single();

      if (!existingCourse || existingCourse.owner_id !== userId) {
        return null;
      }

      const { data, error } = await supabase
        .from('courses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update course: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Update course error:', error);
      throw error;
    }
  },

  async deleteCourse(id: string, userId: string): Promise<boolean> {
    try {
      // Check ownership
      const { data: existingCourse } = await supabase
        .from('courses')
        .select('owner_id')
        .eq('id', id)
        .single();

      if (!existingCourse || existingCourse.owner_id !== userId) {
        return false;
      }

      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete course: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('Delete course error:', error);
      throw error;
    }
  },

  async getUserCourses(userId: string): Promise<Course[]> {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch user courses: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Get user courses error:', error);
      throw error;
    }
  },

  async submitForApproval(id: string, userId: string): Promise<Course | null> {
    try {
      // Check ownership
      const { data: existingCourse } = await supabase
        .from('courses')
        .select('owner_id, status')
        .eq('id', id)
        .single();

      if (!existingCourse || existingCourse.owner_id !== userId) {
        return null;
      }

      if (existingCourse.status !== 'draft') {
        throw new Error('Only draft courses can be submitted');
      }

      const { data, error } = await supabase
        .from('courses')
        .update({ status: 'pending' })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to submit course: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Submit course error:', error);
      throw error;
    }
  },

  async approveCourse(id: string): Promise<Course | null> {
    try {
      const { data, error } = await supabase
        .from('courses')
        .update({ status: 'approved' })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new Error(`Failed to approve course: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Approve course error:', error);
      throw error;
    }
  },

  async rejectCourse(id: string): Promise<Course | null> {
    try {
      const { data, error } = await supabase
        .from('courses')
        .update({ status: 'rejected' })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new Error(`Failed to reject course: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Reject course error:', error);
      throw error;
    }
  },
};