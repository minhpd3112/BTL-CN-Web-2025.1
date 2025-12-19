import { Request, Response } from 'express';
import { CourseModel } from '@models/course.model';
import { HttpStatus } from '@utils/httpStatus';
export const courseController = {
  async getCourses(req: Request, res: Response) {
    try {
      const { status, visibility, owner_id, search, tag, sort, page = '1', pageSize = '9' } = req.query;
      // Compose filters for service
      const filters: any = {
        status: status || 'approved',
        visibility: visibility || 'public',
        search,
        page: parseInt(page as string) || 1,
        limit: parseInt(pageSize as string) || 9,
        tag,
        sort,
        owner_id,
      };
      // Use service for DB query, filtering, sorting, pagination
      const result = await require('../services/course.service').courseService.getCourses(filters);
      res.json({
        success: true,
        data: result.data,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      });
    } catch (error: any) {
      console.error('Get courses error:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch courses',
        error: error.message,
      });
    }
  },

  async getCourseById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const course = await CourseModel.findById(id);

      if (!course) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: 'Course not found',
        });
      }

      res.json({
        success: true,
        data: course,
      });
    } catch (error: any) {
      console.error('Get course error:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch course',
        error: error.message,
      });
    }
  },

  async createCourse(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const courseData = {
        ...req.body,
        owner_id: userId,
        status: 'draft',
      };

      const course = await CourseModel.create(courseData);

      res.status(HttpStatus.CREATED).json({
        success: true,
        data: course,
      });
    } catch (error: any) {
      console.error('Create course error:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to create course',
        error: error.message,
      });
    }
  },

  async updateCourse(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const course = await CourseModel.update(id, req.body);

      if (!course) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: 'Course not found',
        });
      }

      res.json({
        success: true,
        data: course,
      });
    } catch (error: any) {
      console.error('Update course error:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to update course',
        error: error.message,
      });
    }
  },

  async deleteCourse(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await CourseModel.delete(id);

      res.json({
        success: true,
        message: 'Course deleted successfully',
      });
    } catch (error: any) {
      console.error('Delete course error:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to delete course',
        error: error.message,
      });
    }
  },
};