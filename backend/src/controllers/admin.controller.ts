import { Request, Response } from 'express';
import { httpStatus } from '../utils/httpStatus';
import { signAdminToken } from '../utils/jwt';

import { supabaseAdmin } from '../config/supabase';

export const adminController = {
  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Đăng nhập: xác thực với Supabase Auth
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password });
    if (error || !data || !data.user) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Kiểm tra role trong user_metadata
    const user = data.user;
    const role = user.user_metadata?.role;
    if (role !== 'admin') {
      return res.status(httpStatus.UNAUTHORIZED).json({
        success: false,
        message: 'Bạn không có quyền truy cập admin',
      });
    }

    // Lấy thêm thông tin profile nếu cần
    const { UserModel } = require('../models/user.model');
    let profile = null;
    try {
      profile = await UserModel.findById(user.id);
    } catch {}

    const userData = {
      id: user.id,
      username: user.email?.split('@')[0] || 'admin',
      email: user.email,
      name: profile?.full_name || user.user_metadata?.full_name || user.email,
      avatar: profile?.avatar_url || '',
      role: 'admin',
      joinedDate: profile?.created_at || user.created_at || '',
      status: 'active',
      lastLogin: new Date().toISOString(),
    };
    const token = signAdminToken({ id: userData.id, role: userData.role, email: userData.email });
    return res.status(httpStatus.OK).json({
      success: true,
      data: {
        user: userData,
        token,
      },
      message: 'Admin login successful',
    });
  },
};
