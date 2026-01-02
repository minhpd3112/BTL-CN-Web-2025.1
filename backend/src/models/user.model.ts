import { supabaseAdmin } from '../config/supabase';
import type { User } from '../types';

export const UserModel = {
      async ensureAdminExists() {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        // Kiểm tra đã có admin chưa
        let adminUser;
        try {
          adminUser = await UserModel.findByEmail(adminEmail);
        } catch (e) {
          adminUser = null;
        }
        if (!adminUser) {
          // Tạo bản ghi admin mới
          const newAdmin = {
            username: 'admin',
            email: adminEmail,
            password: adminPassword,
            role: 'admin',
            name: 'Quản trị viên',
            avatar: '',
            joinedDate: new Date().toISOString(),
            status: 'active',
          };
          await UserModel.create(newAdmin);
        }
      },
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
