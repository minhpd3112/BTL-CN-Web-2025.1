import { Request, Response } from 'express';
import { TagModel } from '@models/tag.model';
import { httpStatus } from '@utils/httpStatus';

export const tagController = {
  async getTags(req: Request, res: Response) {
    try {
      const tags = await TagModel.findAll();
      res.json({
        success: true,
        data: tags,
      });
    } catch (error: any) {
      console.error('Get tags error:', error);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch tags',
        error: error.message,
      });
    }
  },

  async getTagById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tag = await TagModel.findById(id);

      if (!tag) {
        return res.status(httpStatus.NOT_FOUND).json({
          success: false,
          message: 'Tag not found',
        });
      }

      res.json({
        success: true,
        data: tag,
      });
    } catch (error: any) {
      console.error('Get tag error:', error);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch tag',
        error: error.message,
      });
    }
  },

  async createTag(req: Request, res: Response) {
    try {
      const tag = await TagModel.create(req.body);
      res.status(httpStatus.CREATED).json({
        success: true,
        data: tag,
      });
    } catch (error: any) {
      console.error('Create tag error:', error);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to create tag',
        error: error.message,
      });
    }
  },

  async updateTag(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tag = await TagModel.update(id, req.body);

      if (!tag) {
        return res.status(httpStatus.NOT_FOUND).json({
          success: false,
          message: 'Tag not found',
        });
      }

      res.json({
        success: true,
        data: tag,
      });
    } catch (error: any) {
      console.error('Update tag error:', error);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to update tag',
        error: error.message,
      });
    }
  },

  async deleteTag(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await TagModel.delete(id);

      res.json({
        success: true,
        message: 'Tag deleted successfully',
      });
    } catch (error: any) {
      console.error('Delete tag error:', error);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to delete tag',
        error: error.message,
      });
    }
  },
};