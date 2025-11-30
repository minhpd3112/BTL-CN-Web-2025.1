import { Request, Response, NextFunction } from 'express';
import { logger } from '@config/logger';
import { httpStatus } from '@utils/httpStatus';
export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}
export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { statusCode = httpStatus.INTERNAL_SERVER_ERROR, message } = error;

  // Log error
  logger.error('Error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });
  // Send error response
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};