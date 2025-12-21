import { supabase } from '@config/supabase';
import { Course } from '@types/index';

export const CourseModel = {
  async findAll(filters?: any) {
    let query = supabase
      .from('courses')
      .select(`
        *,
        owner:user_profiles!courses_owner_id_fkey(id, full_name, avatar_url),
        tags:course_tags(tag:tags(*))
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
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        owner:user_profiles!courses_owner_id_fkey(id, full_name, avatar_url),
        tags:course_tags(tag:tags(*)),
        sections:sections(
          *,
          lessons:lessons(*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(courseData: Partial<Course>) {
    const { data, error } = await supabase
      .from('courses')
      .insert([courseData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, courseData: Partial<Course>) {
    const { data, error } = await supabase
      .from('courses')
      .update(courseData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  },

  async addTags(courseId: string, tagIds: string[]) {
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