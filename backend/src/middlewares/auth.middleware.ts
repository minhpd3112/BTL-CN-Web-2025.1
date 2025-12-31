import { Request, Response, NextFunction } from 'express';
import { supabase } from '@config/supabase';
import { verifyAdminToken } from '../utils/jwt';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        raw_user_meta_data?: Record<string, any>;
      };
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }
    const token = authHeader.substring(7);

    // Thử xác thực bằng JWT admin trước
    const adminPayload = verifyAdminToken(token) as { id: string; email: string; role: string } | null;
    if (adminPayload && typeof adminPayload === 'object' && adminPayload.role === 'admin') {
      req.user = {
        id: adminPayload.id,
        email: adminPayload.email,
        role: 'admin',
        raw_user_meta_data: {},
      };
      return next();
    }

    // Nếu không phải JWT admin thì xác thực Supabase như cũ
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }
    req.user = {
      id: user.id,
      email: user.email!,
      role: user.user_metadata?.role || 'user',
      raw_user_meta_data: user.user_metadata,
    };
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
    });
  }
};

export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user } } = await supabase.auth.getUser(token);

      if (user) {
        req.user = {
          id: user.id,
          email: user.email!,
          role: user.user_metadata?.role || 'user',
          raw_user_meta_data: user.user_metadata,
        };
      }
    }

    next();
  } catch (error) {
    next();
  }
};

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required',
    });
  }

  next();
};

export const requireOwnerOrAdmin = (resourceType: 'course' | 'section' | 'lesson') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      if (req.user.role === 'admin') {
        return next();
      }

      const resourceId = req.params.id;
      let query;

      if (resourceType === 'course') {
        query = supabase
          .from('courses')
          .select('owner_id')
          .eq('id', resourceId)
          .single();
      } else if (resourceType === 'section') {
        query = supabase
          .from('sections')
          .select('course_id')
          .eq('id', resourceId)
          .single();
      } else if (resourceType === 'lesson') {
        query = supabase
          .from('lessons')
          .select('section_id')
          .eq('id', resourceId)
          .single();
      }

      const { data, error } = await query!;

      if (error || !data) {
        return res.status(404).json({
          success: false,
          message: `${resourceType} not found`,
        });
      }

      let ownerId;
      if (resourceType === 'course') {
        ownerId = (data as any).owner_id;
      } else if (resourceType === 'section') {
        const { data: course } = await supabase
          .from('courses')
          .select('owner_id')
          .eq('id', (data as any).course_id)
          .single();
        ownerId = course?.owner_id;
      } else if (resourceType === 'lesson') {
        const { data: section } = await supabase
          .from('sections')
          .select('course_id')
          .eq('id', (data as any).section_id)
          .single();

        if (section) {
          const { data: course } = await supabase
            .from('courses')
            .select('owner_id')
            .eq('id', section.course_id)
            .single();
          ownerId = course?.owner_id;
        }
      }

      if (ownerId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to access this resource',
        });
      }

      next();
    } catch (error) {
      console.error('Authorization error:', error);
      return res.status(500).json({
        success: false,
        message: 'Authorization failed',
      });
    }
  };
};