import { Request, Response } from 'express';
import { tagService } from '@services/tag.service';

export const tagController = {
  /**
   * GET /api/tags
   * Lấy tất cả tags
   */
  getAllTags: async (req: Request, res: Response): Promise<void> => {
    try {
      const tags = await tagService.getAllTags();

      res.json({
        success: true,
        data: tags,
      });
    } catch (error) {
      console.error('Get tags error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch tags',
      });
    }
  },

  /**
   * GET /api/tags/:id
   * Lấy tag theo ID
   */
  getTag: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const tag = await tagService.getTagById(id);

      if (!tag) {
        res.status(404).json({
          success: false,
          error: 'Tag not found',
        });
        return;
      }

      res.json({
        success: true,
        data: tag,
      });
    } catch (error) {
      console.error('Get tag error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch tag',
      });
    }
  },

  /**
   * POST /api/tags
   * Tạo tag mới (Admin only)
   */
  createTag: async (req: Request, res: Response): Promise<void> => {
    try {
      const tagData = req.body;

      // Validation
      if (!tagData.name || tagData.name.trim() === '') {
        res.status(400).json({
          success: false,
          error: 'Tag name is required',
        });
        return;
      }

      const tag = await tagService.createTag(tagData);

      res.status(201).json({
        success: true,
        data: tag,
      });
    } catch (error) {
      console.error('Create tag error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create tag',
      });
    }
  },

  /**
   * PATCH /api/tags/:id
   * Update tag (Admin only)
   */
  updateTag: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const tag = await tagService.updateTag(id, updateData);

      if (!tag) {
        res.status(404).json({
          success: false,
          error: 'Tag not found',
        });
        return;
      }

      res.json({
        success: true,
        data: tag,
      });
    } catch (error) {
      console.error('Update tag error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update tag',
      });
    }
  },

  /**
   * DELETE /api/tags/:id
   * Xóa tag (Admin only)
   */
  deleteTag: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      await tagService.deleteTag(id);

      res.status(204).send();
    } catch (error: any) {
      console.error('Delete tag error:', error);

      if (error.message.includes('being used')) {
        res.status(400).json({
          success: false,
          error: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Failed to delete tag',
      });
    }
  },
};