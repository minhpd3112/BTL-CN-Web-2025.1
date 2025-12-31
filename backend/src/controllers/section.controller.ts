import { Request, Response } from 'express';
import { SectionModel } from '@models/section.model';
import { httpStatus } from '@utils/httpStatus';

export const SectionController = {
  async getByCourseId(req: Request, res: Response) {
    try {
      const { courseId } = req.params;
      const sections = await SectionModel.findByCourseId(courseId);

      res.json({
        success: true,
        data: sections,
      });
    } catch (error: any) {
      console.error('Get sections error:', error);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch sections',
        error: error.message,
      });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const section = await SectionModel.findById(id);

      if (!section) {
        return res.status(httpStatus.NOT_FOUND).json({
          success: false,
          message: 'Section not found',
        });
      }

      res.json({
        success: true,
        data: section,
      });
    } catch (error: any) {
      console.error('Get section error:', error);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch section',
        error: error.message,
      });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const section = await SectionModel.create(req.body);

      res.status(httpStatus.CREATED).json({
        success: true,
        data: section,
      });
    } catch (error: any) {
      console.error('Create section error:', error);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to create section',
        error: error.message,
      });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const section = await SectionModel.update(id, req.body);

      if (!section) {
        return res.status(httpStatus.NOT_FOUND).json({
          success: false,
          message: 'Section not found',
        });
      }

      res.json({
        success: true,
        data: section,
      });
    } catch (error: any) {
      console.error('Update section error:', error);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to update section',
        error: error.message,
      });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await SectionModel.delete(id);

      res.json({
        success: true,
        message: 'Section deleted successfully',
      });
    } catch (error: any) {
      console.error('Delete section error:', error);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to delete section',
        error: error.message,
      });
    }
  },

  async reorder(req: Request, res: Response) {
    try {
      const { course_id, sections } = req.body;

      if (!course_id || !sections) {
        return res.status(httpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Course ID and sections are required',
        });
      }

      await SectionModel.reorder(course_id, sections);

      res.json({
        success: true,
        message: 'Sections reordered successfully',
      });
    } catch (error: any) {
      console.error('Reorder sections error:', error);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to reorder sections',
        error: error.message,
      });
    }
  },
};