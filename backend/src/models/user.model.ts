import { supabaseAdmin } from '../config/supabase';
import type { User } from '../types';

export const UserModel = {
  async ensureAdminExists() {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@gmail.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin';

    try {
      // 1. Check Auth User
      const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
      let adminUser = users?.find(u => u.email === adminEmail);

      if (!adminUser) {
        // Create Auth User
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
          email: adminEmail,
          password: adminPassword,
          email_confirm: true,
          user_metadata: { role: 'admin', full_name: 'Quản trị viên' }
        });
        if (error) {
          console.error('Failed to create admin auth:', error);
          return;
        }
        adminUser = data.user;
      }

      // 2. Check Profile
      if (adminUser) {
        const { data: profile } = await supabaseAdmin
          .from('user_profiles')
          .select('*')
          .eq('id', adminUser.id)
          .single();

        if (!profile) {
          await UserModel.create({
            id: adminUser.id,
            full_name: 'Quản trị viên', // Mapping name -> full_name
            avatar_url: '',
          } as any);
        }
      }
    } catch (error) {
      console.error('Error ensuring admin exists:', error);
    }
  },
  async findByEmail(email: string) {
    // Find in Auth first
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
    const user = users?.find(u => u.email === email);

    if (!user) return null;

    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    // Merge auth data
    return {
      ...data,
      email: user.email,
      role: user.user_metadata?.role || 'user',
      username: user.user_metadata?.username
    };
  },
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
    // Filter out fields that don't exist in user_profiles
    const { email, password, role, username, joinedDate, status, name, ...profileData } = userData as any;

    // Map legacy fields if necessary
    if (name && !profileData.full_name) profileData.full_name = name;

    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .insert([profileData])
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
    try {
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
      if (authError) throw authError;
    } catch (error: any) {
      if (error?.status === 404 || error?.code === 'user_not_found' || error?.message?.includes('User not found')) {
        // Silent success
      } else {
        throw error;
      }
    }
    return true;
  },
};
