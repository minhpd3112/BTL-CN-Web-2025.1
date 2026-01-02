import { supabaseAdmin } from '@config/supabase';

export interface Tag {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  course_count?: number;
}

export interface CreateTagRequest {
  name: string;
  description?: string;
}

export interface UpdateTagRequest {
  name?: string;
  description?: string;
}

export const TagModel = {
  async findAll() {
    const { data, error } = await supabaseAdmin
      .from('tags')
      .select('*');

    if (error) throw error;
    return data || [];
  },

  async findById(id: string) {
    const { data, error } = await supabaseAdmin
      .from('tags')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(tagData: CreateTagRequest) {
    const { data, error } = await supabaseAdmin
      .from('tags')
      .insert([tagData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, tagData: UpdateTagRequest) {
    const { data, error } = await supabaseAdmin
      .from('tags')
      .update(tagData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabaseAdmin
      .from('tags')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  }
};