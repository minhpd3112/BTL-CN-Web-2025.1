import { Request, Response } from 'express';
import { CourseModel } from '@models/course.model';
import { httpStatus } from '@utils/httpStatus';

export const courseController = {
  // Admin: approve or reject a course
  async reviewCourse(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, rejection_reason } = req.body;
      const userId = req.user?.id;
      // Check admin role (giả định req.user.role)
      if (!userId || req.user?.role !== 'admin') {
        return res.status(httpStatus.FORBIDDEN).json({
          success: false,
          message: 'Only admin can review courses',
        });
      }
      if (!['approved', 'rejected'].includes(status)) {
        return res.status(httpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Status must be approved or rejected',
        });
      }
      let updateData: any = {};
      if (status === 'approved') {
        updateData = { status: 'approved', rejection_reason: null };
      } else {
        if (!rejection_reason) {
          return res.status(httpStatus.BAD_REQUEST).json({
            success: false,
            message: 'Rejection reason required',
          });
        }
        updateData = { status: 'rejected', rejection_reason };
      }
      const updated = await CourseModel.update(id, updateData);
      if (!updated) {
        return res.status(httpStatus.NOT_FOUND).json({
          success: false,
          message: 'Course not found',
        });
      }
      res.json({
        success: true,
        data: updated,
        message: status === 'approved' ? 'Course approved' : 'Course rejected',
      });
    } catch (error: any) {
      console.error('Review course error:', error);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to review course',
        error: error.message,
      });
    }
  },
  async getCourses(req: Request, res: Response) {
    try {
      const { status, visibility, owner_id, search, tag, sort, page = '1', pageSize, isAdmin } = req.query;
      // Nếu là admin thì không filter status/visibility
      const isAdminFlag = isAdmin === 'true';
      let limit = 0;
      if (pageSize) {
        limit = parseInt(pageSize as string);
      }
      const filters: any = {
        ...(isAdminFlag ? {} : {
          status: status || 'approved',
          visibility: visibility || 'public',
        }),
        search,
        page: parseInt(page as string) || 1,
        limit,
        tag,
        sort,
        owner_id,
        isAdmin: isAdminFlag,
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
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
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
        return res.status(httpStatus.NOT_FOUND).json({
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
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
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
        return res.status(httpStatus.UNAUTHORIZED).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const courseData = {
        ...req.body,
        owner_id: userId,
        // status sẽ lấy từ frontend (pending/approved), không ép về 'draft'
      };

      const course = await CourseModel.create(courseData);

      // Nếu khoá học ở trạng thái 'pending', tạo thông báo cho admin
      if (course?.status === 'pending') {
        // Sử dụng email admin thực tế
        const adminEmail = 'admin@gmail.com';
        const { UserModel } = require('../models/user.model');
        const adminUser = await UserModel.findByEmail(adminEmail);
        if (adminUser && adminUser.id) {
          const { NotificationModel } = require('../models/notification.model');
          await NotificationModel.createNotification({
            user_id: adminUser.id,
            type: 'course_pending',
            title: 'Khoá học cần duyệt',
            message: `Khoá học "${course.title}" vừa được tạo và cần duyệt.`,
            related_course_id: course.id,
          });
        }
      }

      res.status(httpStatus.CREATED).json({
        success: true,
        data: course,
      });
    } catch (error: any) {
      console.error('Create course error:', error);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
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
        return res.status(httpStatus.NOT_FOUND).json({
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
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
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
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to delete course',
        error: error.message,
      });
    }
  },

  async addCourseTags(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { tags } = req.body; // Array of tag names

      if (!tags || !Array.isArray(tags) || tags.length === 0) {
        return res.status(httpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Tags array is required',
        });
      }

      // Import TagModel to look up tag IDs
      const { TagModel } = await import('@models/tag.model');

      // Get all available tags
      const allTags = await TagModel.findAll();
      console.log('All available tags:', allTags.map((t: any) => ({ id: t.id, name: t.name })));
      console.log('Requested tags:', tags);

      // Map tag names to IDs
      const tagIds: string[] = [];
      for (const tagName of tags) {
        const foundTag = allTags.find((t: any) => t.name === tagName);
        if (foundTag) {
          tagIds.push(foundTag.id);
          console.log(`Found tag: ${tagName} -> ${foundTag.id}`);
        } else {
          console.log(`Tag not found: ${tagName}`);
        }
      }

      console.log('Tag IDs to save:', tagIds);

      if (tagIds.length === 0) {
        return res.status(httpStatus.BAD_REQUEST).json({
          success: false,
          message: 'No valid tags found',
        });
      }

      // Add tags to course
      await CourseModel.addTags(id, tagIds);

      res.json({
        success: true,
        message: 'Tags added successfully',
        data: { tagIds },
      });
    } catch (error: any) {
      console.error('Add course tags error:', error);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to add tags to course',
        error: error.message,
      });
    }
  },
};