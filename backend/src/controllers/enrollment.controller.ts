import { Request, Response } from 'express';
import { EnrollmentModel } from '@models/enrollment.model';
import { NotificationModel } from '@models/notification.model';
import { supabase, supabaseAdmin } from '@config/supabase';
import { httpStatus } from '@utils/httpStatus';

export const EnrollmentController = {
  async leaveCourse(req: Request, res: Response) {
      console.log('==> [leaveCourse] Controller called', req.method, req.originalUrl);
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const enrollment = await EnrollmentModel.findById(id);
      console.log('[leaveCourse] userId:', userId, '| enrollmentId:', id, '| enrollment.user_id:', enrollment?.user_id);
      if (!enrollment) {
        return res.status(httpStatus.NOT_FOUND).json({
          success: false,
          message: 'Enrollment not found',
        });
      }

      // Only enrollment owner can leave
      if (enrollment.user_id !== userId) {
        console.warn('[leaveCourse] Permission denied. userId:', userId, '| enrollment.user_id:', enrollment.user_id);
        return res.status(httpStatus.FORBIDDEN).json({
          success: false,
          message: 'You do not have permission to leave this enrollment',
        });
      }

      // Delete enrollment
      const deleteResult = await EnrollmentModel.deleteByUser(id, userId);
      console.log('[leaveCourse] Delete result:', deleteResult);

      res.status(204).send();
    } catch (error: any) {
      console.error('Leave course error:', error);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to leave course',
        error: error.message,
      });
    }
  },
  async getMyEnrollments(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { status } = req.query;

      let enrollments = await EnrollmentModel.findByUserId(userId);

      if (status) {
        enrollments = enrollments.filter((e: any) => e.status === status);
      }


      // Fetch owner profiles and students count for each course
      for (const enrollment of enrollments) {
        // Owner profile
        if (enrollment.course && enrollment.course.owner_id) {
          try {
            const { data: ownerProfile } = await supabaseAdmin
              .from('user_profiles')
              .select('id, full_name, avatar_url')
              .eq('id', enrollment.course.owner_id)
              .limit(1)
              .single();
            if (ownerProfile) {
              enrollment.course.owner = ownerProfile;
            }
          } catch (err) {
            console.log('Could not fetch owner profile for:', enrollment.course.owner_id);
          }
        }
        // Students count
        if (enrollment.course && enrollment.course.id) {
          try {
            const { data: studentsList, error: studentsError } = await supabaseAdmin
              .from('enrollments')
              .select('id')
              .eq('course_id', enrollment.course.id)
              .eq('status', 'approved');
            enrollment.course.students = Array.isArray(studentsList) ? studentsList.length : 0;
          } catch (err) {
            enrollment.course.students = 0;
          }
          // Average rating
          try {
            const { average } = await require('@models/review.model').ReviewModel.getCourseAverageRating(enrollment.course.id);
            enrollment.course.rating = average;
          } catch (err) {
            enrollment.course.rating = 0;
          }
        }
      }

      // Fetch progress for each enrollment
      for (const enrollment of enrollments) {
        try {
          const progress = await EnrollmentModel.getProgress(userId, enrollment.course_id);
          (enrollment as any).progress = progress; // Add progress: { total, completed, percentage }
        } catch (err) {
          console.error('Failed to get progress for enrollment:', enrollment.id, err);
          (enrollment as any).progress = { total: 0, completed: 0, percentage: 0 };
        }
      }

      res.json({
        success: true,
        data: enrollments || [], // Ensure always return array even if empty
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

      // Check if user is course owner (use admin to bypass RLS)
      const { data: course } = await supabaseAdmin
        .from('courses')
        .select('owner_id')
        .eq('id', courseId)
        .single();

      if (!course) {
        return res.status(httpStatus.NOT_FOUND).json({
          success: false,
          message: 'Course not found',
        });
      }

      const isOwner = course.owner_id === userId;
      // If not owner, check if user is enrolled
      if (!isOwner) {
        const { data: enrollment } = await supabaseAdmin
          .from('enrollments')
          .select('id, status')
          .eq('user_id', userId)
          .eq('course_id', courseId)
          .single();

        // Students who are enrolled can only see count, not details
        if (!enrollment || enrollment.status !== 'approved') {
          return res.status(httpStatus.FORBIDDEN).json({
            success: false,
            message: 'You do not have permission to view enrollments',
          });
        }

        // Return only count for enrolled students
        const enrollments = await EnrollmentModel.findByCourseId(
          courseId,
          status as string
        );

        return res.json({
          success: true,
          data: enrollments.map((e: any) => ({
            id: e.id,
            status: e.status,
            enrolled_at: e.enrolled_at
          })), // Return minimal info for students
        });
      }

      // Owner can see full details
      const enrollments = await EnrollmentModel.findByCourseId(
        courseId,
        status as string
      );

      // Fetch progress and user email for each enrollment (only for owner)
      for (const enrollment of enrollments) {
        try {
          const progress = await EnrollmentModel.getProgress(enrollment.user_id, courseId);
          (enrollment as any).progress = progress;
        } catch (err) {
          console.error('Failed to get progress for enrollment:', enrollment.id, err);
          (enrollment as any).progress = { total: 0, completed: 0, percentage: 0 };
        }

        // Fetch user email from auth.users
        try {
          const { data: authData, error: authError } = await supabaseAdmin.auth.admin.getUserById(enrollment.user_id);
          if (authData?.user?.email) {
            (enrollment as any).user_email = authData.user.email;
          }
        } catch (err) {
          console.error('Failed to get email for user:', enrollment.user_id, err);
        }
      }

      console.log('Get course enrollments:', {
        courseId,
        totalEnrollments: enrollments.length,
        statuses: enrollments.map(e => e.status)
      });

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

      // Check if course is public to auto-approve enrollment
      const { data: course } = await supabaseAdmin
        .from('courses')
        .select('visibility')
        .eq('id', course_id)
        .single();

      const isPublicCourse = course?.visibility === 'public';

      const enrollment = await EnrollmentModel.create({
        user_id: userId,
        course_id,
        request_message,
        status: isPublicCourse ? 'approved' : 'pending',
        approved_by: isPublicCourse ? userId : undefined,
      });

      // Send notification if auto-approved (public course)
      if (enrollment && isPublicCourse) {
        // Get user info
        const { data: userProfile } = await supabaseAdmin
          .from('user_profiles')
          .select('full_name')
          .eq('id', userId)
          .single();
        const { data: courseProfile } = await supabaseAdmin
          .from('courses')
          .select('title, owner_id')
          .eq('id', course_id)
          .single();
        // Notify student
        await NotificationModel.createNotification({
          user_id: userId,
          type: 'student_joined',
          title: 'Bạn đã tham gia khoá học',
          message: `Bạn đã tham gia khoá học "${courseProfile?.title || ''}" thành công!`,
          related_course_id: course_id,
        });
        // Notify course owner
        await NotificationModel.createNotification({
          user_id: courseProfile?.owner_id,
          type: 'student_joined',
          title: 'Học viên mới tham gia khoá học',
          message: `${userProfile?.full_name || 'Một học viên'} đã tham gia khoá học "${courseProfile?.title || ''}"`,
          related_course_id: course_id,
        });
      }

      res.status(httpStatus.CREATED).json({
        success: true,
        data: enrollment,
        message: isPublicCourse ? 'Bạn đã tham gia khoá học thành công!' : 'Đã gửi yêu cầu đăng ký khoá học',
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

      // Send notification if approved
      if (enrollment && status === 'approved') {
        // Get user info
        const { data: userProfile } = await supabaseAdmin
          .from('user_profiles')
          .select('full_name')
          .eq('id', enrollment.user_id)
          .single();
        const { data: courseProfile } = await supabaseAdmin
          .from('courses')
          .select('title, owner_id')
          .eq('id', enrollment.course_id)
          .single();
        // Notify student
        await NotificationModel.createNotification({
          user_id: enrollment.user_id,
          type: 'student_joined',
          title: 'Bạn đã được duyệt vào khoá học',
          message: `Bạn đã được duyệt vào khoá học "${courseProfile?.title || ''}"`,
          related_course_id: enrollment.course_id,
        });
        // Notify course owner
        await NotificationModel.createNotification({
          user_id: courseProfile?.owner_id,
          type: 'student_joined',
          title: 'Học viên mới tham gia khoá học',
          message: `${userProfile?.full_name || 'Một học viên'} đã tham gia khoá học "${courseProfile?.title || ''}"`,
          related_course_id: enrollment.course_id,
        });
      }

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

      // Check if user is course owner (not enrollment owner!)
      const { data: course } = await supabaseAdmin
        .from('courses')
        .select('owner_id')
        .eq('id', (enrollment as any).course_id)
        .single();

      if (!course || course.owner_id !== userId) {
        return res.status(httpStatus.FORBIDDEN).json({
          success: false,
          message: 'You do not have permission to delete this enrollment',
        });
      }

      // Delete using admin client to bypass RLS
      const { error: deleteError } = await supabaseAdmin
        .from('enrollments')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      res.json({
        success: true,
        message: 'Enrollment deleted successfully',
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

  async getCourseAverageProgress(req: Request, res: Response) {
    try {
      const { courseId } = req.params;
      const userId = req.user!.id;

      // Check if user is the course owner
      const { data: course } = await supabaseAdmin
        .from('courses')
        .select('owner_id')
        .eq('id', courseId)
        .single();

      if (!course || course.owner_id !== userId) {
        return res.status(httpStatus.FORBIDDEN).json({
          success: false,
          message: 'Only course owners can view average progress',
        });
      }

      const progressData = await EnrollmentModel.getCourseAverageProgress(courseId);

      res.json({
        success: true,
        data: progressData,
      });
    } catch (error: any) {
      console.error('Get course average progress error:', error);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch course average progress',
        error: error.message,
      });
    }
  },

  async inviteByEmail(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { course_id, invitee_email } = req.body;

      if (!course_id || !invitee_email) {
        return res.status(httpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Course ID and invitee email are required',
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(invitee_email)) {
        return res.status(httpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Invalid email format',
        });
      }

      // Check if user is course owner (use admin to bypass RLS)
      const { data: course, error: courseError } = await supabaseAdmin
        .from('courses')
        .select('owner_id, title, visibility')
        .eq('id', course_id)
        .single();

      if (courseError || !course) {
        console.log('Course lookup error:', courseError);
        return res.status(httpStatus.NOT_FOUND).json({
          success: false,
          message: 'Course not found',
        });
      }

      console.log('Course owner check:', {
        courseOwnerId: course.owner_id,
        requestUserId: userId,
        match: course.owner_id === userId
      });

      if (course.owner_id !== userId) {
        return res.status(httpStatus.FORBIDDEN).json({
          success: false,
          message: 'You do not have permission to invite students to this course',
        });
      }

      // Look up user by email using Supabase Auth admin API
      const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();

      if (listError) {
        throw listError;
      }

      const inviteeUser = users?.find(u => u.email?.toLowerCase() === invitee_email.toLowerCase());

      if (!inviteeUser) {
        return res.status(httpStatus.NOT_FOUND).json({
          success: false,
          message: 'User with this email not found. Please make sure they have registered an account.',
        });
      }

      // Check if already enrolled
      const { data: existingEnrollment } = await supabase
        .from('enrollments')
        .select('id, status')
        .eq('user_id', inviteeUser.id)
        .eq('course_id', course_id)
        .single();

      if (existingEnrollment) {
        return res.status(httpStatus.BAD_REQUEST).json({
          success: false,
          message: 'This student is already enrolled in the course',
        });
      }

      // Create approved enrollment directly using admin client (bypass RLS)
      const { data: enrollment, error: createError } = await supabaseAdmin
        .from('enrollments')
        .insert({
          user_id: inviteeUser.id,
          course_id: course_id,
          status: 'approved',
          approved_by: userId,
          request_message: 'Invited by course owner',
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      // Send notifications to both student and owner
      // Get user info
      const { data: userProfile } = await supabaseAdmin
        .from('user_profiles')
        .select('full_name')
        .eq('id', inviteeUser.id)
        .single();
      // Notify student
      await NotificationModel.createNotification({
        user_id: inviteeUser.id,
        type: 'student_joined',
        title: 'Bạn đã được thêm vào khoá học',
        message: `Bạn đã được thêm vào khoá học "${course.title || ''}"!`,
        related_course_id: course_id,
      });
      // Notify course owner
      await NotificationModel.createNotification({
        user_id: course.owner_id,
        type: 'student_joined',
        title: 'Học viên mới tham gia khoá học',
        message: `${userProfile?.full_name || 'Một học viên'} đã được thêm vào khoá học "${course.title || ''}"`,
        related_course_id: course_id,
      });

      res.status(httpStatus.CREATED).json({
        success: true,
        data: enrollment,
        message: `Successfully added ${invitee_email} to the course`,
      });
    } catch (error: any) {
      console.error('Invite by email error:', error);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to invite student',
        error: error.message,
      });
    }
  },
};