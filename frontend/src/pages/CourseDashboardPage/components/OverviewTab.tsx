import { Star, Users, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Course } from '@/types';

const mockReviews = [
    {
        id: 1,
        user: { name: 'Nguyễn Văn A', avatar: 'A' },
        rating: 5,
        date: '2 ngày trước',
        content: 'Khóa học rất hay, giảng viên nhiệt tình. Nội dung đi từ cơ bản đến nâng cao rất dễ hiểu.'
    },
    {
        id: 2,
        user: { name: 'Trần Thị B', avatar: 'B' },
        rating: 4,
        date: '1 tuần trước',
        content: 'Kiến thức bổ ích, tuy nhiên phần âm thanh của video số 3 hơi nhỏ. Mong giảng viên sớm khắc phục.'
    },
    {
        id: 3,
        user: { name: 'Lê Văn C', avatar: 'C' },
        rating: 5,
        date: '2 tuần trước',
        content: 'Tuyệt vời! Đã áp dụng được ngay vào dự án thực tế của công ty. Rất đáng tiền.'
    }
];

interface OverviewTabProps {
    course: Course;
    enrollmentRequests?: any[];
}

export function OverviewTab({ course, enrollmentRequests = [] }: OverviewTabProps) {
    const coursePendingRequests = enrollmentRequests.filter(r => r.courseId === course.id && r.status === 'pending');

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
                <Card className={`group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 overflow-hidden relative ${coursePendingRequests.length > 0 ? 'border-l-orange-500' : 'border-l-gray-300'}`}>
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Clock className={`w-24 h-24 ${coursePendingRequests.length > 0 ? 'text-orange-500' : 'text-gray-400'}`} />
                    </div>
                    <CardContent className="p-6 relative z-10">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Yêu cầu chờ duyệt</p>
                                <div className="flex items-baseline gap-2">
                                    <p className={`text-4xl font-bold ${coursePendingRequests.length > 0 ? 'text-orange-600' : 'text-gray-900'}`}>
                                        {coursePendingRequests.length}
                                    </p>
                                    {coursePendingRequests.length > 0 && (
                                        <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full animate-pulse">
                                            Cần xử lý
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className={`w-12 h-12 rounded-xl shadow-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 ${coursePendingRequests.length > 0 ? 'bg-gradient-to-br from-orange-500 to-red-500 shadow-orange-200' : 'bg-gray-100'}`}>
                                <Clock className={`w-6 h-6 ${coursePendingRequests.length > 0 ? 'text-white' : 'text-gray-400'}`} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Đánh giá */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="border-b bg-gradient-to-r from-[#1E88E5]/5 to-transparent">
                    <CardTitle className="text-lg font-bold text-[#1E88E5]">Đánh giá từ học viên</CardTitle>
                </CardHeader>
                <CardContent>
                    {mockReviews.length > 0 ? (
                        <div className="space-y-6 pt-6">
                            {mockReviews.map((review) => (
                                <div key={review.id} className="border-b last:border-0 pb-6 last:pb-0">
                                    <div className="flex items-start gap-4">
                                        <Avatar>
                                            <AvatarFallback className="bg-[#1E88E5] text-white">
                                                {review.user.avatar}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className="font-semibold text-gray-900">{review.user.name}</h4>
                                                <span className="text-sm text-gray-500">{review.date}</span>
                                            </div>
                                            <div className="flex items-center gap-1 mb-2">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-4 h-4 ${i < review.rating
                                                            ? 'fill-yellow-400 text-yellow-400'
                                                            : 'fill-gray-200 text-gray-200'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                            <p className="text-gray-600 leading-relaxed">
                                                {review.content}
                                            </p>
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
