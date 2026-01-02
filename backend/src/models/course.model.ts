import { supabaseAdmin, supabase } from '@config/supabase';
import { Course } from '../types';

export const CourseModel = {
  async findAll(filters?: any) {
    let query = supabaseAdmin
      .from('courses')
      .select(`
        *,
        tags:course_tags(tag:tags(*)),
        owner:user_profiles!owner_id(id, full_name, avatar_url)
      `);

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.visibility) {
      query = query.eq('visibility', filters.visibility);
    }
    if (filters?.owner_id) {
      query = query.eq('owner_id', filters.owner_id);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async findById(id: string) {
    const { data, error } = await supabaseAdmin
      .from('courses')
      .select(`
        *,
        tags:course_tags(tag:tags(*)),
        sections:sections(
          *,
          lessons:lessons(*)
        ),
        owner:user_profiles!owner_id(id, full_name, avatar_url)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(courseData: Partial<Course>) {
    const { data, error } = await supabaseAdmin
      .from('courses')
      .insert([courseData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, courseData: Partial<Course>) {
    const { data, error } = await supabaseAdmin
      .from('courses')
      .update(courseData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabaseAdmin
      .from('courses')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  },

  async addTags(courseId: string, tagIds: string[]) {
    // First, remove all existing tags for this course to avoid duplicates
    await supabase
      .from('course_tags')
      .delete()
      .eq('course_id', courseId);

    // Then insert new tags
    const courseTags = tagIds.map(tagId => ({
      course_id: courseId,
      tag_id: tagId
    }));

    const { error } = await supabase
      .from('course_tags')
      .insert(courseTags);

    if (error) throw error;
    return { success: true };
  },

  async removeTags(courseId: string, tagIds?: string[]) {
    let query = supabase
      .from('course_tags')
      .delete()
      .eq('course_id', courseId);

    if (tagIds && tagIds.length > 0) {
      query = query.in('tag_id', tagIds);
    }

    const { error } = await query;
    if (error) throw error;
    return { success: true };
  }
};