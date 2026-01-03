import { supabaseAdmin } from '../config/supabase';
import type { User } from '../types';

// Normalize user data to ensure all fields are present
const normalizeUser = (profile: any, authUser?: any): any => {
  return {
    id: profile.id,
    full_name: profile.full_name || null,
    avatar_url: profile.avatar_url || null,
    phone: profile.phone || null,
    address: profile.address || null,
    bio: profile.bio || null,
    email: authUser?.email || profile.email || null,
    role: authUser?.user_metadata?.role || profile.role || 'user',
    status: 'active', // Default status
    created_at: profile.created_at || authUser?.created_at || null,
    updated_at: profile.updated_at || authUser?.updated_at || null,
  };
};

export const UserModel = {
    async findByEmail(email: string) {
      const { data, error } = await supabaseAdmin
        .from('user_profiles')
        .select('*')
        .eq('email', email)
        .single();
      if (error) throw error;
      return data;
    },
  async findAll() {
    // 1. Lấy tất cả user_profiles
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('*');
    if (profileError) throw profileError;
    if (!profiles || profiles.length === 0) return [];

    // 2. Lấy tất cả users từ bảng auth.users
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (authError) throw authError;
    // authUsers.users là mảng user

    // 3. Merge role và email từ auth.users vào profile
    const merged = profiles.map((profile: any) => {
      const authUser = authUsers.users.find((u: any) => u.id === profile.id);
      return normalizeUser(profile, authUser);
    });
    
    return merged;
  },

  async findById(id: string) {
    const { data: profile, error } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    
    // Get auth user data for email and metadata
    const { data: authData } = await supabaseAdmin.auth.admin.getUserById(id);
    return normalizeUser(profile, authData?.user);
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
    // 1. Xoá toàn bộ khoá học mà user là owner
    const { data: ownedCourses, error: courseErr } = await supabaseAdmin
      .from('courses')
      .select('id')
      .eq('owner_id', id);
    if (courseErr) throw courseErr;
    if (ownedCourses && ownedCourses.length > 0) {
      const courseIds = ownedCourses.map((c: any) => c.id);
      // Xoá enrollments liên quan đến các khoá học này
      const { error: delEnrollErr } = await supabaseAdmin
        .from('enrollments')
        .delete()
        .in('course_id', courseIds);
      if (delEnrollErr) throw delEnrollErr;
      // Xoá khoá học
      const { error: delCourseErr } = await supabaseAdmin
        .from('courses')
        .delete()
        .in('id', courseIds);
      if (delCourseErr) throw delCourseErr;
    }

    // 2. Xoá enrollments liên quan
    // Xoá enrollments mà user là học viên
    const { error: enrollUserErr } = await supabaseAdmin
      .from('enrollments')
      .delete()
      .eq('user_id', id);
    if (enrollUserErr) throw enrollUserErr;
    // Cập nhật enrollments mà user là người duyệt (approved_by)
    const { error: enrollApproveErr } = await supabaseAdmin
      .from('enrollments')
      .update({ approved_by: null })
      .eq('approved_by', id);
    if (enrollApproveErr) throw enrollApproveErr;

    // 3. Xoá profile
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .delete()
      .eq('id', id);
    if (profileError) throw profileError;

    // 4. Xoá user thực trong auth.users (Supabase)
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (authError) throw authError;
    return true;
  },
};
