import { Request, Response } from 'express';
import { EnrollmentModel } from '@models/enrollment.model';
import { supabase } from '@config/supabase';
import { httpStatus } from '@utils/httpStatus';

export const EnrollmentController = {
  async getMyEnrollments(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { status } = req.query;

      let enrollments = await EnrollmentModel.findByUserId(userId);

      if (status) {
        enrollments = enrollments.filter((e: any) => e.status === status);
      }

      res.json({
        success: true,
        data: enrollments,
      });
    } catch (error: any) {
      console.error('Get enrollments error:', error);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch enrollments',
        error: error.message,
      });
    }
  },

  async getByCourseId(req: Request, res: Response) {
    try {
      const { courseId } = req.params;
      const { status } = req.query;
      const userId = req.user!.id;

      // Check if user is course owner
      const { data: course } = await supabase
        .from('courses')
        .select('owner_id')
        .eq('id', courseId)
        .single();

      if (!course || course.owner_id !== userId) {
        return res.status(httpStatus.FORBIDDEN).json({
          success: false,
          message: 'You do not have permission to view enrollments',
        });
      }

      const enrollments = await EnrollmentModel.findByCourseId(
        courseId,
        status as string
      );

      res.json({
        success: true,
        data: enrollments,
      });
    } catch (error: any) {
      console.error('Get course enrollments error:', error);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch enrollments',
        error: error.message,
      });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { course_id, request_message } = req.body;

      // Check if already enrolled
      const existing = await EnrollmentModel.findByUserId(userId);
      if (existing.some((e: any) => e.course_id === course_id)) {
        return res.status(httpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Already enrolled in this course',
        });
      }

      const enrollment = await EnrollmentModel.create({
        user_id: userId,
        course_id,
        request_message,
      });

      res.status(httpStatus.CREATED).json({
        success: true,
        data: enrollment,
      });
    } catch (error: any) {
      console.error('Create enrollment error:', error);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to create enrollment',
        error: error.message,
      });
    }
  },

  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, rejection_reason } = req.body;
      const userId = req.user!.id;

      if (!['approved', 'rejected'].includes(status)) {
        return res.status(httpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Invalid status',
        });
      }

      // Get enrollment and check ownership
      const enrollmentData = await EnrollmentModel.findById(id);
      if (!enrollmentData) {
        return res.status(httpStatus.NOT_FOUND).json({
          success: false,
          message: 'Enrollment not found',
        });
      }

      const { data: course } = await supabase
        .from('courses')
        .select('owner_id')
        .eq('id', (enrollmentData as any).course_id)
        .single();

      if (!course || course.owner_id !== userId) {
        return res.status(httpStatus.FORBIDDEN).json({
          success: false,
          message: 'You do not have permission to update this enrollment',
        });
      }

      const enrollment = await EnrollmentModel.updateStatus(
        id,
        status,
        userId,
        rejection_reason
      );

      res.json({
        success: true,
        data: enrollment,
      });
    } catch (error: any) {
      console.error('Update enrollment status error:', error);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to update enrollment status',
        error: error.message,
      });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const enrollment = await EnrollmentModel.findById(id);
      if (!enrollment) {
        return res.status(httpStatus.NOT_FOUND).json({
          success: false,
          message: 'Enrollment not found',
        });
      }

      if ((enrollment as any).user_id !== userId) {
        return res.status(httpStatus.FORBIDDEN).json({
          success: false,
          message: 'You do not have permission to delete this enrollment',
        });
      }

      await EnrollmentModel.delete(id);

      res.json({
        success: true,
        message: 'Enrollment cancelled successfully',
      });
    } catch (error: any) {
      console.error('Delete enrollment error:', error);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to delete enrollment',
        error: error.message,
      });
    }
  },

  async getProgress(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const enrollment = await EnrollmentModel.findById(id);
      if (!enrollment) {
        return res.status(httpStatus.NOT_FOUND).json({
          success: false,
          message: 'Enrollment not found',
        });
      }

      if ((enrollment as any).user_id !== userId) {
        return res.status(httpStatus.FORBIDDEN).json({
          success: false,
          message: 'You do not have permission to view this progress',
        });
      }

      const progress = await EnrollmentModel.getProgress(
        userId,
        (enrollment as any).course_id
      );

      res.json({
        success: true,
        data: progress,
      });
    } catch (error: any) {
      console.error('Get enrollment progress error:', error);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch enrollment progress',
        error: error.message,
      });
    }
  },
};