import { supabaseAdmin } from '../config/supabase';
import type { User } from '../types';

export const UserModel = {
  async findAll() {
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .select('*');
    if (error) throw error;
    return data || [];
  },

  async findById(id: string) {
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(userData: Partial<User>) {
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .insert([userData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, userData: Partial<User>) {
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .update(userData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabaseAdmin
      .from('user_profiles')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  },
};
