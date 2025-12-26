import { Request, Response } from 'express';
import { UserModel } from '../models/user.model';
import { httpStatus } from '../utils/httpStatus';

export const userController = {
  async getUsers(req: Request, res: Response) {
    try {
      const users = await UserModel.findAll();
      res.json({ success: true, data: users });
    } catch (error: any) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch users',
        error: error.message,
      });
    }
  },
};
