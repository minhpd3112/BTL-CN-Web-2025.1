import { Request, Response } from 'express';
import { httpStatus } from '../utils/httpStatus';
import { signAdminToken } from '../utils/jwt';

// Sử dụng tài khoản admin thực tế đã tạo trong Supabase Auth
const ADMIN_EMAIL = 'admin@gmail.com';


export const adminController = {
  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Email and password are required',
      });
    }
    // Đăng nhập admin: kiểm tra email, lấy thông tin từ user_profiles
    if (email === ADMIN_EMAIL) {
      const { UserModel } = require('../models/user.model');
      const adminUser = await UserModel.findByEmail(email);
      if (adminUser && adminUser.role === 'admin') {
        const user = {
          id: adminUser.id,
          username: adminUser.username || 'admin',
          email: adminUser.email,
          name: adminUser.full_name || 'Quản trị viên',
          avatar: adminUser.avatar_url || '',
          role: 'admin',
          joinedDate: adminUser.created_at || '',
          status: 'active',
          lastLogin: new Date().toISOString(),
        };
        const token = signAdminToken({ id: user.id, role: user.role, email: user.email });
        return res.status(httpStatus.OK).json({
          success: true,
          data: {
            user,
            token,
          },
          message: 'Admin login successful',
        });
      }
    }
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      message: 'Invalid admin credentials',
    });
  },
};
