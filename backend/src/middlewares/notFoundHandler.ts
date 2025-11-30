import { Request, Response } from 'express';
import { httpStatus } from '@utils/httpStatus';

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.path}`
  });
};