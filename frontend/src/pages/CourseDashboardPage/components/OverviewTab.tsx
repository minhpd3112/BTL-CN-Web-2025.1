import { Star, Users, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { reviewsAPI } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Course } from '@/types';

interface OverviewTabProps {
    course: Course;
    enrollmentRequests?: any[];
}

export function OverviewTab({ course, enrollmentRequests = [] }: OverviewTabProps) {
    const [reviews, setReviews] = useState<any[]>([]);
    const [isLoadingReviews, setIsLoadingReviews] = useState(false);

    useEffect(() => {
        const fetchReviews = async () => {
            setIsLoadingReviews(true);
            try {
                const response = await reviewsAPI.getByCourseId(course.id);
                if (response.success) {
                    setReviews(response.data.reviews || []);
                }
            } catch (error) {
                setReviews([]);
            } finally {
                setIsLoadingReviews(false);
            }
        };
        fetchReviews();
    }, [course.id]);

    return (
        <div className="py-6">
            {/* Quick Info */}
            {/* Quick Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Students Card */}
                <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-[#1E88E5] overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Users className="w-24 h-24 text-[#1E88E5]" />
                    </div>
                    <CardContent className="p-6 relative z-10">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Tổng học viên</p>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-4xl font-bold text-gray-900">{course.students}</p>
                                </div>
                            </div>
                            <div className="w-12 h-12 bg-gradient-to-br from-[#1E88E5] to-[#1565C0] rounded-xl shadow-lg shadow-blue-200 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Rating Card */}
                <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-yellow-400 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Star className="w-24 h-24 text-yellow-500" />
                    </div>
                    <CardContent className="p-6 relative z-10">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Đánh giá trung bình</p>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-4xl font-bold text-gray-900">{course.rating}</p>
                                    <div className="flex items-center">
                                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                    </div>
                                </div>
                            </div>
                            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl shadow-lg shadow-yellow-200 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                                <Star className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Requests Card */}

            </div>

            {/* Đánh giá */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="border-b bg-gradient-to-r from-[#1E88E5]/5 to-transparent">
                    <CardTitle className="text-lg font-bold text-[#1E88E5]">Đánh giá từ học viên</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoadingReviews ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E88E5] mx-auto"></div>
                            <p className="text-gray-500 mt-4">Đang tải đánh giá...</p>
                        </div>
                    ) : reviews.length > 0 ? (
                        <div className="space-y-6">
                            {reviews.map((review: any) => (
                                <div key={review.id} className="border-b last:border-0 pb-6 last:pb-0">
                                    <div className="flex items-start gap-4">
                                        <Avatar className="w-12 h-12">
                                            <AvatarImage src={review.user?.avatar_url} />
                                            <AvatarFallback className="bg-[#1E88E5] text-white">
                                                {review.user?.full_name?.[0] || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">
                                                        {review.user?.full_name || 'Anonymous'}
                                                    </h4>
                                                    <p className="text-sm text-gray-500">
                                                        {new Date(review.created_at).toLocaleDateString('vi-VN')}
                                                    </p>
                                                </div>
                                                <span className="flex items-center gap-1 font-semibold text-gray-700">
                                                    {review.rating}
                                                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                                                </span>
                                            </div>
                                            <p className="text-gray-700 whitespace-pre-wrap">{review.comment}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p>Chưa có đánh giá nào</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
