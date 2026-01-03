import { Request, Response } from 'express';
import { UserModel } from '../models/user.model';
import { httpStatus } from '../utils/httpStatus';

export const userController = {
  async getUsers(req: Request, res: Response) {
    try {
      const users = await UserModel.findAll();
      res.json({ success: true, data: users });
    } catch (error: any) {
      console.error('Get users error:', error);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch users',
        error: error.message,
      });
    }
  },

  async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(httpStatus.BAD_REQUEST).json({
          success: false,
          message: 'User id is required',
        });
      }
      await UserModel.delete(id);
      res.json({ success: true, message: 'User deleted successfully' });
    } catch (error: any) {
      console.error('Delete user error:', error);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to delete user',
        error: error && (error.message || JSON.stringify(error)),
      });
    }
  },
};
