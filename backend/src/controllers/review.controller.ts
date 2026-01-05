import { Request, Response } from 'express';
import { ReviewModel } from '@models/review.model';
import { EnrollmentModel } from '@models/enrollment.model';
import { httpStatus } from '@utils/httpStatus';

export const ReviewController = {
    /**
     * Create or update a review
     * Requires user to have 100% course completion
     */
    async create(req: Request, res: Response) {
        try {
            const userId = req.user!.id;
            const { course_id, rating, comment } = req.body;

            // Validate input
            if (!course_id || !rating) {
                return res.status(httpStatus.BAD_REQUEST).json({
                    success: false,
                    message: 'Course ID and rating are required',
                });
            }

            if (rating < 1 || rating > 5) {
                return res.status(httpStatus.BAD_REQUEST).json({
                    success: false,
                    message: 'Rating must be between 1 and 5',
                });
            }

            // Check if user is enrolled
            const enrollments = await EnrollmentModel.findByUserId(userId);
            const enrollment = enrollments.find(
                (e: any) => e.course_id === course_id && e.status === 'approved'
            );

            if (!enrollment) {
                return res.status(httpStatus.FORBIDDEN).json({
                    success: false,
                    message: 'You must be enrolled in this course to leave a review',
                });
            }

            // Check course completion percentage
            const progress = await EnrollmentModel.getProgress(userId, course_id);

            // Allow review if completed all lessons OR percentage is 100
            const isCompleted = progress.total > 0 && progress.completed >= progress.total;
            if (!isCompleted && progress.percentage < 100) {
                return res.status(httpStatus.FORBIDDEN).json({
                    success: false,
                    message: 'You must complete 100% of the course before leaving a review',
                    currentProgress: progress.percentage,
                });
            }

            // Create or update review
            const review = await ReviewModel.create({
                user_id: userId,
                course_id,
                rating,
                comment: comment || '',
            });

            res.status(httpStatus.CREATED).json({
                success: true,
                data: review,
                message: 'Review submitted successfully',
            });
        } catch (error: any) {
            console.error('Create review error:', error);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Failed to create review',
                error: error.message,
            });
        }
    },

    /**
     * Get all reviews for a course
     */
    async getByCourseId(req: Request, res: Response) {
        try {
            const { courseId } = req.params;

            const reviews = await ReviewModel.findByCourseId(courseId);
            const stats = await ReviewModel.getCourseAverageRating(courseId);

            res.json({
                success: true,
                data: {
                    reviews,
                    stats,
                },
            });
        } catch (error: any) {
            console.error('Get course reviews error:', error);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Failed to fetch reviews',
                error: error.message,
            });
        }
    },

    /**
     * Get a specific user's review for a course
     */
    async getUserReview(req: Request, res: Response) {
        try {
            const { userId, courseId } = req.params;

            const review = await ReviewModel.findByUserAndCourse(userId, courseId);

            if (!review) {
                return res.status(httpStatus.NOT_FOUND).json({
                    success: false,
                    message: 'Review not found',
                });
            }

            res.json({
                success: true,
                data: review,
            });
        } catch (error: any) {
            console.error('Get user review error:', error);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Failed to fetch review',
                error: error.message,
            });
        }
    },

    /**
     * Delete a review
     * Only the review owner or admin can delete
     */
    async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const userId = req.user!.id;
            const userRole = req.user!.role;

            const review = await ReviewModel.findById(id);

            if (!review) {
                return res.status(httpStatus.NOT_FOUND).json({
                    success: false,
                    message: 'Review not found',
                });
            }

            // Check permission
            if (review.user_id !== userId && userRole !== 'admin') {
                return res.status(httpStatus.FORBIDDEN).json({
                    success: false,
                    message: 'You do not have permission to delete this review',
                });
            }

            await ReviewModel.delete(id);

            res.json({
                success: true,
                message: 'Review deleted successfully',
            });
        } catch (error: any) {
            console.error('Delete review error:', error);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Failed to delete review',
                error: error.message,
            });
        }
    },
};
