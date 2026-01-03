import { supabaseAdmin } from '../config/supabase';
import type { Tag, CreateTagRequest, UpdateTagRequest } from '../models/tag.model';

export const tagService = {
  async getAllTags(): Promise<Tag[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('tags')
        .select('*, course_tags(count)')
        .order('name');

      if (error) {
        console.error('Get tags error:', error);
        throw new Error(`Failed to fetch tags: ${error.message}`);
      }

      return (data as unknown as Tag[]) || [];
    } catch (error: any) {
      console.error('Get tags service error:', error);
      throw new Error(error.message || 'Failed to fetch tags');
    }
  },

  async getTagById(id: string): Promise<Tag | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('tags')
        .select('*, course_tags(count)')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Get tag error:', error);
        return null;
      }

      return data as unknown as Tag;
    } catch (error: any) {
      console.error('Get tag service error:', error);
      throw new Error(error.message || 'Failed to fetch tag');
    }
  },

  async createTag(tagData: CreateTagRequest): Promise<Tag> {
    try {
      // Only include valid fields that exist in database schema
      const validData = {
        name: tagData.name,
        description: tagData.description,
      };

      const { data, error } = await supabaseAdmin
        .from('tags')
        .insert(validData)
        .select()
        .single();

      if (error) {
        console.error('Create tag error:', error);
        throw new Error(`Failed to create tag: ${error.message}`);
      }

      if (!data) {
        throw new Error('Failed to create tag: No data returned');
      }

      return data as unknown as Tag;
    } catch (error: any) {
      console.error('Create tag service error:', error);
      throw new Error(error.message || 'Failed to create tag');
    }
  },

  async updateTag(id: string, updateData: UpdateTagRequest): Promise<Tag | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('tags')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Update tag error:', error);
        throw new Error(`Failed to update tag: ${error.message}`);
      }

      return data ? (data as unknown as Tag) : null;
    } catch (error: any) {
      console.error('Update tag service error:', error);
      throw new Error(error.message || 'Failed to update tag');
    }
  },

  async deleteTag(id: string): Promise<boolean> {
    try {
      const { count } = await supabaseAdmin
        .from('course_tags')
        .select('*', { count: 'exact', head: true })
        .eq('tag_id', id);

      if (count && count > 0) {
        throw new Error('Cannot delete tag that is being used by courses');
      }

      const { error } = await supabaseAdmin.from('tags').delete().eq('id', id);

      if (error) {
        console.error('Delete tag error:', error);
        throw new Error(`Failed to delete tag: ${error.message}`);
      }

      return true;
    } catch (error: any) {
      console.error('Delete tag service error:', error);
      throw new Error(error.message || 'Failed to delete tag');
    }
  },
};