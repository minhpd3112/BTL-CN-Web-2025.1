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
      // Find the "others" tag dynamically
      const { data: othersTag, error: othersError } = await supabaseAdmin
        .from('tags')
        .select('id')
        .ilike('name', 'others')
        .single();

      if (othersError || !othersTag) {
        throw new Error('Cannot delete tag: "others" tag not found in database');
      }

      const OTHERS_TAG_ID = othersTag.id;

      // Prevent deleting the "others" tag itself
      if (id === OTHERS_TAG_ID) {
        throw new Error('Cannot delete the "others" tag');
      }

      // Get all courses that use this tag
      const { data: courseTagsToDelete, error: fetchError } = await supabaseAdmin
        .from('course_tags')
        .select('course_id')
        .eq('tag_id', id);

      if (fetchError) {
        throw new Error(`Failed to fetch course tags: ${fetchError.message}`);
      }

      // Delete the course_tags entries for this tag
      const { error: deleteError } = await supabaseAdmin
        .from('course_tags')
        .delete()
        .eq('tag_id', id);

      if (deleteError) {
        throw new Error(`Failed to delete course tags: ${deleteError.message}`);
      }

      // For each course that had this tag, check if it still has other tags
      if (courseTagsToDelete && courseTagsToDelete.length > 0) {
        for (const ct of courseTagsToDelete) {
          const { data: remainingTags, error: checkError } = await supabaseAdmin
            .from('course_tags')
            .select('tag_id')
            .eq('course_id', ct.course_id);

          if (checkError) {
            console.error(`Failed to check remaining tags for course ${ct.course_id}:`, checkError);
            continue;
          }

          // If course has no tags left, assign it to "others" tag
          if (!remainingTags || remainingTags.length === 0) {
            const { error: insertError } = await supabaseAdmin
              .from('course_tags')
              .insert({
                course_id: ct.course_id,
                tag_id: OTHERS_TAG_ID,
              });

            if (insertError) {
              console.error(`Failed to assign "others" tag to course ${ct.course_id}:`, insertError);
            }
          }
        }
      }

      // Now delete the tag itself
      const { error: deleteTagError } = await supabaseAdmin
        .from('tags')
        .delete()
        .eq('id', id);

      if (deleteTagError) {
        throw new Error(`Failed to delete tag: ${deleteTagError.message}`);
      }

      return true;
    } catch (error: any) {
      console.error('Delete tag service error:', error);
      throw new Error(error.message || 'Failed to delete tag');
    }
  },
};