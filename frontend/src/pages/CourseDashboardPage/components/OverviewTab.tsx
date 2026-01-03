import { useState, useEffect } from 'react';
import { Star, Users, Clock } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Course } from '@/types';
import { enrollmentsAPI, reviewsAPI } from '@/services/api';

interface OverviewTabProps {
    course: Course;
    enrollmentRequests?: any[];
}

export function OverviewTab({ course, enrollmentRequests = [] }: OverviewTabProps) {
    const coursePendingRequests = enrollmentRequests.filter(r => r.courseId === course.id && r.status === 'pending');

    // State for real-time statistics
    const [studentCount, setStudentCount] = useState<number>(0);
    const [averageRating, setAverageRating] = useState<number>(0);
    const [reviewCount, setReviewCount] = useState<number>(0);
    const [reviews, setReviews] = useState<any[]>([]);
    const [isLoadingStats, setIsLoadingStats] = useState(true);

    // Fetch real statistics from API
    useEffect(() => {
        const fetchStatistics = async () => {
            if (!course.id) return;

            setIsLoadingStats(true);
            try {
                // Fetch student count from enrollments
                const enrollmentsResponse = await enrollmentsAPI.getByCourseId(course.id.toString());
                if (enrollmentsResponse.success && enrollmentsResponse.data) {
                    const approvedEnrollments = Array.isArray(enrollmentsResponse.data)
                        ? enrollmentsResponse.data.filter((e: any) => e.status === 'approved')
                        : [];
                    setStudentCount(approvedEnrollments.length);
                }

                // Fetch reviews and rating
                const reviewsResponse = await reviewsAPI.getByCourseId(course.id.toString());
                if (reviewsResponse.success && reviewsResponse.data) {
                    setReviews(reviewsResponse.data.reviews || []);
                    if (reviewsResponse.data.stats) {
                        setAverageRating(reviewsResponse.data.stats.average || 0);
                        setReviewCount(reviewsResponse.data.stats.count || 0);
                    }
                }
            } catch (error) {
                console.error('Error fetching course statistics:', error);
            } finally {
                setIsLoadingStats(false);
            }
        };

        fetchStatistics();
    }, [course.id]);

    return (
        <div className="py-6">
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
                                    <p className="text-4xl font-bold text-gray-900">
                                        {isLoadingStats ? '...' : studentCount}
                                    </p>
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
                                    <p className="text-4xl font-bold text-gray-900">
                                        {isLoadingStats ? '...' : averageRating.toFixed(1)}
                                    </p>
                                    <div className="flex items-center">
                                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                    </div>
                                    <span className="text-sm text-gray-500">({reviewCount})</span>
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
                    {isLoadingStats ? (
                        <div className="text-center py-8">
                            <div className="w-12 h-12 border-4 border-[#1E88E5] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-500">Đang tải đánh giá...</p>
                        </div>
                    ) : reviews.length > 0 ? (
                        <div className="space-y-4 py-4">
                            {reviews.slice(0, 5).map((review: any) => (
                                <div key={review.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                                    <Avatar className="w-10 h-10">
                                        <AvatarImage src={review.user?.avatar_url} />
                                        <AvatarFallback>{review.user?.full_name?.[0] || 'U'}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-medium text-gray-900">{review.user?.full_name || 'Học viên'}</span>
                                            <div className="flex items-center gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-gray-600 text-sm">{review.comment}</p>
                                        <span className="text-xs text-gray-400 mt-2 block">
                                            {new Date(review.created_at).toLocaleDateString('vi-VN')}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {reviews.length > 5 && (
                                <p className="text-center text-sm text-[#1E88E5] mt-4">
                                    Và {reviews.length - 5} đánh giá khác...
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p>Chưa có đánh giá nào</p>
                            <p className="text-sm mt-2">Học viên hoàn thành khóa học có thể để lại đánh giá</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

