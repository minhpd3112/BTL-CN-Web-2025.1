import { Request, Response } from 'express';
import { tagService } from '../services/tag.service';
import { httpStatus } from '@utils/httpStatus';
import { supabaseAdmin } from '@config/supabase';

export const tagController = {
  async getTags(req: Request, res: Response) {
    try {
      const tags = await require('../services/tag.service').tagService.getAllTags();
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
      const tag = await tagService.getTagById(id);

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
      const tag = await tagService.createTag(req.body);
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
      const tag = await tagService.updateTag(id, req.body);

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
      await tagService.deleteTag(id);

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

  async uploadImage(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(httpStatus.BAD_REQUEST).json({
          success: false,
          message: 'No file uploaded',
        });
      }

      const file = req.file;
      const fileExt = file.originalname.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data, error } = await supabaseAdmin.storage
        .from('tag-images')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabaseAdmin.storage
        .from('tag-images')
        .getPublicUrl(fileName);

      res.json({
        success: true,
        data: {
          url: publicUrl
        }
      });
    } catch (error: any) {
      console.error('Upload image error:', error);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to upload image',
        error: error.message,
      });
    }
  }
};