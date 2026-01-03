import { supabase, supabaseAdmin } from '@config/supabase';

// Import types using relative path since @types alias points to .d.ts files
import { Course, CourseFilters, PaginatedResponse } from '../types';

// CourseWithDetails type for extended course data (standalone to avoid type conflicts)
export interface CourseWithDetails {
  id?: string | number;
  title?: string;
  description?: string;
  overview?: string;
  ownerName?: string;
  ownerId?: string | number;
  owner_id?: string;
  ownerAvatar?: string;
  rating?: number;
  students?: number;
  duration?: string;
  image?: string;
  image_url?: string;
  tags?: any[];
  status?: 'pending' | 'approved' | 'rejected' | 'draft';
  visibility?: 'public' | 'private';
  lessons?: number;
  enrolledUsers?: number[];
  createdAt?: string;
  updatedAt?: string;
  created_at?: string;
  updated_at?: string;
  enrollmentCount?: number;
  sections?: any[];
  course_tags?: any[];
}

// Extend CourseFilters to include isAdmin property
interface ExtendedCourseFilters extends CourseFilters {
  isAdmin?: boolean;
  owner_id?: string;
  tag?: string;
}

export const courseService = {
  async getCourses(
    filters: ExtendedCourseFilters
  ): Promise<PaginatedResponse<CourseWithDetails>> {
    try {
      const {
        page = 1,
        limit = 0,
        search,
        status,
        visibility,
        tags,
      } = filters;

      // Nếu limit = 0 thì lấy toàn bộ khoá học, không phân trang
      const offset = limit > 0 ? (page - 1) * limit : 0;

      // Nếu truyền owner_id thì trả về tất cả khoá học của owner đó (bỏ filter status/visibility)
      let query;
      if (filters.owner_id) {
        query = supabase
          .from('courses')
          .select(`
            *,
            course_tags(
              tags(*)
            ),
            owner:user_profiles!owner_id(id, full_name, avatar_url)
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
            ),
            owner:user_profiles!owner_id(id, full_name, avatar_url)
          `, { count: 'exact' });
        if (status) {
          query = query.eq('status', status);
        }
        if (visibility) {
          query = query.eq('visibility', visibility);
        }
        // Lọc theo tag (theo tên hoặc id)
        if (filters.tag && filters.tag !== 'all') {
          // Lấy danh sách course_id có tag phù hợp
          const { data: courseTagData, error: courseTagError } = await supabase
            .from('course_tags')
            .select('course_id, tags!inner(name)')
            .eq('tags.name', filters.tag);
          if (courseTagError) {
            throw new Error('Failed to fetch course_tags for tag filter: ' + courseTagError.message);
          }
          const courseIds = (courseTagData || []).map((ct: any) => ct.course_id);
          // Nếu không có course nào thuộc tag này, trả về rỗng luôn
          if (!courseIds.length) {
            return {
              data: [],
              total: 0,
              page,
              limit,
              totalPages: 0,
            };
          }
          query = query.in('id', courseIds);
        }
      }

      // Apply filters
      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      }

      // Fetch all data first (without pagination) to calculate students and rating before sorting
      query = query.order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) {
        console.error('Get courses error:', error);
        throw new Error(`Failed to fetch courses: ${error.message}`);
      }

      // Transform data
      // Lấy tất cả course_id
      const courseIds = (data || []).map((course: any) => course.id);
      // Query enrollments 1 lần cho tất cả course_id
      let studentsMap: Record<string, number> = {};
      if (courseIds.length > 0) {
        const { data: enrollmentsData, error: enrollmentsError } = await supabaseAdmin
          .from('enrollments')
          .select('course_id, status')
          .in('course_id', courseIds)
          .eq('status', 'approved');
        console.log('EnrollmentsData:', enrollmentsData);
        if (!enrollmentsError && Array.isArray(enrollmentsData)) {
          // Đếm số học viên cho từng khoá học
          studentsMap = enrollmentsData.reduce((acc: Record<string, number>, e: any) => {
            acc[e.course_id] = (acc[e.course_id] || 0) + 1;
            return acc;
          }, {});
          console.log('StudentsMap:', studentsMap);
        }
      }

      // Fetch average rating for all courses
      const ReviewModel = require('../models/review.model').ReviewModel;
      const ratingMap: Record<string, number> = {};
      if (courseIds.length > 0) {
        for (const courseId of courseIds) {
          try {
            const stats = await ReviewModel.getCourseAverageRating(courseId);
            ratingMap[courseId] = stats.average;
          } catch (err) {
            ratingMap[courseId] = 0;
          }
        }
      }

      const courses = (data || []).map((course: any) => ({
        ...course,
        visibility: typeof course.visibility === 'string'
          ? course.visibility.trim().toLowerCase() === 'private' ? 'private' : 'public'
          : 'public',
        tags: course.course_tags?.map((ct: any) => ct.tags).filter(Boolean) || [],
        students: studentsMap[course.id] || 0,
        owner: course.owner || undefined,
        rating: ratingMap[course.id] || 0,
      }));

      // Apply sorting based on filters.sort parameter
      const sortBy = filters.sort || 'newest';
      let sortedCourses = [...courses];
      
      switch (sortBy) {
        case 'popular':
          // Sort by number of students (descending)
          sortedCourses.sort((a, b) => (b.students || 0) - (a.students || 0));
          break;
        case 'rating':
          // Sort by rating (descending)
          sortedCourses.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        case 'newest':
        default:
          // Sort by created_at (descending) - already sorted by query
          break;
      }

      // Apply pagination AFTER sorting
      const paginatedCourses = limit > 0 
        ? sortedCourses.slice(offset, offset + limit)
        : sortedCourses;

      return {
        data: paginatedCourses,
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