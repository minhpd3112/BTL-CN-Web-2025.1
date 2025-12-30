import { Request, Response } from 'express';
import { httpStatus } from '../utils/httpStatus';
import { signAdminToken } from '../utils/jwt';

// Đặt thông tin admin cố định ở đây hoặc lấy từ biến môi trường
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@edulearn.vn';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin1234';

export const adminController = {
  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Email and password are required',
      });
    }
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // Trả về thông tin admin và JWT
      const user = {
        id: 'admin-fixed-id',
        username: 'admin',
        email: ADMIN_EMAIL,
        name: 'Quản trị viên',
        avatar: '',
        role: 'admin',
        joinedDate: '2024-01-01T00:00:00.000Z',
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
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      message: 'Invalid admin credentials',
    });
  },
};
