import { supabase } from '@config/supabase';
import { Section } from '../types';

export const SectionModel = {
  async findByCourseId(courseId: string) {
    const { data, error } = await supabase
      .from('sections')
      .select('*, lessons(*)')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async findById(id: string) {
    const { data, error } = await supabase
      .from('sections')
      .select('*, lessons(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(sectionData: Partial<Section>) {
    const { data, error } = await supabase
      .from('sections')
      .insert([sectionData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, sectionData: Partial<Section>) {
    const { data, error } = await supabase
      .from('sections')
      .update(sectionData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('sections')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  },

  async reorder(courseId: string, sectionOrders: { id: string; order_index: number }[]) {
    const updates = sectionOrders.map(({ id, order_index }) =>
      supabase
        .from('sections')
        .update({ order_index })
        .eq('id', id)
        .eq('course_id', courseId)
    );

    await Promise.all(updates);
    return { success: true };
  }
};