import { Star, Users, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Course } from '@/types';

interface OverviewTabProps {
    course: Course;
    enrollmentRequests?: any[];
}

export function OverviewTab({ course, enrollmentRequests = [] }: OverviewTabProps) {
    const coursePendingRequests = enrollmentRequests.filter(r => r.courseId === course.id && r.status === 'pending');

    return (
        <div className="py-6">
            {/* Quick Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Tổng học viên</p>
                                <p className="text-3xl">{course.students}</p>
                            </div>
                            <div className="w-12 h-12 bg-[#1E88E5]/10 rounded-lg flex items-center justify-center">
                                <Users className="w-6 h-6 text-[#1E88E5]" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Đánh giá trung bình</p>
                                <p className="text-3xl flex items-center gap-1">
                                    {course.rating}
                                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-400/10 rounded-lg flex items-center justify-center">
                                <Star className="w-6 h-6 text-yellow-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className={`hover:shadow-lg transition-all duration-200 hover:-translate-y-1 ${coursePendingRequests.length > 0 ? 'border-[#1E88E5] border-2' : ''}`}>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Yêu cầu chờ duyệt</p>
                                <p className="text-3xl text-[#1E88E5]">{coursePendingRequests.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-[#1E88E5]/10 rounded-lg flex items-center justify-center relative">
                                <Clock className="w-6 h-6 text-[#1E88E5]" />
                                {coursePendingRequests.length > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-[#1E88E5] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                        {coursePendingRequests.length}
                                    </span>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Content Tabs */}
            <Tabs defaultValue="reviews">
                <TabsList>
                    <TabsTrigger value="reviews">Đánh giá</TabsTrigger>
                </TabsList>

                <TabsContent value="reviews">
                    <Card>
                        <CardContent className="p-12 text-center text-gray-500">
                            <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p>Chưa có đánh giá nào</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
