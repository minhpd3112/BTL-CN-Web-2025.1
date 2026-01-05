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

  async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'User ID is required' });
      }

      const user = await UserModel.findById(id);
      if (!user) {
        return res.status(httpStatus.NOT_FOUND).json({ success: false, message: 'User not found' });
      }

      res.json({ success: true, data: user });
    } catch (error: any) {
      console.error('Get user by id error:', error);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch user',
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
