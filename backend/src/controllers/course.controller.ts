import { Request, Response } from 'express';
import { courseService } from '../services/course.service';
import { CourseFilters } from '../models/course.model';
import { User } from '../types/index';

interface AuthRequest extends Request {
  user?: User;
}

export const courseController = {
  getCourses: async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        page = '1',
        limit = '10',
        search,
        tags,
        status,
        visibility,
      } = req.query;

      const filters: CourseFilters = {
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
        search: search as string,
        tags: tags as string,
        status: status as 'draft' | 'pending' | 'approved' | 'rejected',
        visibility: visibility as 'public' | 'private',
      };

      const result = await courseService.getCourses(filters);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Get courses error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch courses',
      });
    }
  },

  getCourse: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const course = await courseService.getCourseById(id, userId);

      if (!course) {
        res.status(404).json({
          success: false,
          error: 'Course not found or access denied',
        });
        return;
      }

      res.json({
        success: true,
        data: course,
      });
    } catch (error) {
      console.error('Get course error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch course',
      });
    }
  },

  createCourse: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      const userId = req.user.id;
      const courseData = req.body;

      if (!courseData.title || courseData.title.trim() === '') {
        res.status(400).json({
          success: false,
          error: 'Title is required',
        });
        return;
      }

      const course = await courseService.createCourse(userId, courseData);

      res.status(201).json({
        success: true,
        data: course,
      });
    } catch (error) {
      console.error('Create course error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create course',
      });
    }
  },

  updateCourse: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      const { id } = req.params;
      const userId = req.user.id;
      const updateData = req.body;

      const course = await courseService.updateCourse(id, userId, updateData);

      if (!course) {
        res.status(404).json({
          success: false,
          error: 'Course not found or access denied',
        });
        return;
      }

      res.json({
        success: true,
        data: course,
      });
    } catch (error) {
      console.error('Update course error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update course',
      });
    }
  },

  deleteCourse: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      const { id } = req.params;
      const userId = req.user.id;

      const success = await courseService.deleteCourse(id, userId);

      if (!success) {
        res.status(404).json({
          success: false,
          error: 'Course not found or access denied',
        });
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error('Delete course error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete course',
      });
    }
  },

  getMyCourses: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      const userId = req.user.id;
      const courses = await courseService.getUserCourses(userId);

      res.json({
        success: true,
        data: courses,
      });
    } catch (error) {
      console.error('Get my courses error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch your courses',
      });
    }
  },

  submitForApproval: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      const { id } = req.params;
      const userId = req.user.id;

      const course = await courseService.submitForApproval(id, userId);

      if (!course) {
        res.status(404).json({
          success: false,
          error: 'Course not found or access denied',
        });
        return;
      }

      res.json({
        success: true,
        data: course,
      });
    } catch (error) {
      console.error('Submit course error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to submit course',
      });
    }
  },

  approveCourse: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const course = await courseService.approveCourse(id);

      if (!course) {
        res.status(404).json({
          success: false,
          error: 'Course not found',
        });
        return;
      }

      res.json({
        success: true,
        data: course,
      });
    } catch (error) {
      console.error('Approve course error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to approve course',
      });
    }
  },

  rejectCourse: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const course = await courseService.rejectCourse(id);

      if (!course) {
        res.status(404).json({
          success: false,
          error: 'Course not found',
        });
        return;
      }

      res.json({
        success: true,
        data: course,
      });
    } catch (error) {
      console.error('Reject course error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to reject course',
      });
    }
  },
};