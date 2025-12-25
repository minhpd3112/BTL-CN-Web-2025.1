import React, { useState } from 'react';
import { StarRating } from './StarRating';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { reviewsAPI } from '@/services/api';
import { toast } from 'sonner';

interface ReviewFormProps {
    courseId: string;
    existingReview?: {
        id: string;
        rating: number;
        comment: string;
    };
    onSuccess?: () => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
    courseId,
    existingReview,
    onSuccess,
}) => {
    const [rating, setRating] = useState(existingReview?.rating || 0);
    const [comment, setComment] = useState(existingReview?.comment || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            toast.error('Vui lòng chọn số sao đánh giá');
            return;
        }

        if (!comment.trim()) {
            toast.error('Vui lòng nhập nội dung đánh giá');
            return;
        }

        if (comment.length > 1000) {
            toast.error('Nội dung đánh giá không được quá 1000 ký tự');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await reviewsAPI.create({
                course_id: courseId,
                rating,
                comment,
            });

            if (response.success) {
                toast.success(
                    existingReview
                        ? 'Cập nhật đánh giá thành công'
                        : 'Gửi đánh giá thành công'
                );
                onSuccess?.();
            } else {
                toast.error(response.message || 'Có lỗi xảy ra');
            }
        } catch (error: any) {
            console.error('Submit review error:', error);
            toast.error(
                error.response?.data?.message || 'Không thể gửi đánh giá. Vui lòng thử lại'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle className="text-lg">
                    {existingReview ? 'Chỉnh sửa đánh giá của bạn' : 'Viết đánh giá'}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Star Rating */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Đánh giá của bạn <span className="text-red-500">*</span>
                        </label>
                        <StarRating
                            rating={rating}
                            onRatingChange={setRating}
                            size="lg"
                        />
                    </div>

                    {/* Comment */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Nhận xét <span className="text-red-500">*</span>
                        </label>
                        <Textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Chia sẻ trải nghiệm của bạn về khóa học này..."
                            rows={5}
                            maxLength={1000}
                            className="resize-none"
                        />
                        <div className="text-xs text-gray-500 mt-1 text-right">
                            {comment.length}/1000 ký tự
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-3">
                        <Button
                            type="submit"
                            disabled={isSubmitting || rating === 0 || !comment.trim()}
                            className="bg-[#1E88E5] hover:bg-[#1565C0]"
                        >
                            {isSubmitting
                                ? 'Đang gửi...'
                                : existingReview
                                    ? 'Cập nhật đánh giá'
                                    : 'Gửi đánh giá'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};
