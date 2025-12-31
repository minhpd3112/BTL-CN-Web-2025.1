import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Course } from '@/types';
import { Eye, Globe, Lock, ArrowUpRight, Clock } from 'lucide-react';
import { ReactNode } from 'react';

interface CourseListCardProps {
    course: Course & { progress?: number; completedLessons?: number; ownerName?: string; studentsCount?: number };
    onClick: () => void;
    action?: ReactNode;
    showProgress?: boolean;
    disableInvite?: boolean;
}

export function CourseListCard({ course, onClick, action, showProgress = false, disableInvite }: CourseListCardProps) {
    const isPending = course.status === 'pending';
    // Support both studentsCount and students for compatibility, always cast to number
    const totalStudents = Number(course.studentsCount ?? course.students ?? 0);
    // Support both rating and fallback
    const courseRating = (typeof course.rating === 'number' ? course.rating : 0);
    return (
        <Card
            className={`group overflow-hidden border-none shadow-sm transition-all duration-300 bg-white hover:shadow-xl`}
            onClick={onClick}
        >
            <CardContent className="p-0">
                <div className="flex flex-col md:flex-row gap-0 md:gap-4">
                    {/* Image Section - Reduced Width */}
                    <div className="relative w-full md:w-56 h-40 md:h-44 overflow-hidden shrink-0">
                        <img
                            src={course.image_url || course.image}
                            alt={course.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />

                        {/* Overlay Badge */}
                        <div className="absolute top-2 left-2 flex gap-2">
                            {course.visibility === 'private' ? (
                                <Badge variant="secondary" className="bg-black/50 hover:bg-black/60 text-white backdrop-blur-md border-none text-xs">
                                    <Lock className="w-3 h-3 mr-1" />
                                    Riêng tư
                                </Badge>
                            ) : (
                                <Badge className="bg-[#1E88E5]/90 hover:bg-[#1E88E5] text-white backdrop-blur-md border-none shadow-lg text-xs">
                                    <Globe className="w-3 h-3 mr-1" />
                                    Công khai
                                </Badge>
                            )}
                            {isPending && (
                                <Badge className="bg-yellow-500/90 text-white border-none shadow-lg text-xs">
                                    <Clock className="w-3 h-3 mr-1" />
                                    Chờ duyệt
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 py-3 pr-4 pl-4 md:pl-0 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-1">
                                <div className="space-y-1">
                                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-[#1E88E5] transition-colors duration-300 line-clamp-1">
                                        {course.title}
                                    </h3>
                                    <p className="text-xs text-gray-500 font-medium">
                                        Bởi <span className="text-gray-700">{course.ownerName || course.owner?.full_name || 'Không rõ'}</span>
                                    </p>
                                </div>

                                {/* Top Right Actions - Moved View Details Here */}
                                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                    {!disableInvite && action}
                                </div>
                            </div>

                            <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">
                                {course.description}
                            </p>

                            <div className="flex flex-wrap gap-2 mb-2">
                                {(Array.isArray(course.tags) ? course.tags : []).slice(0, 3).map((tag: any, idx) => {
                                    const tagName = typeof tag === 'string' ? tag : tag?.name;
                                    return (
                                        <Badge
                                            key={tagName || idx}
                                            variant="secondary"
                                            className="bg-gray-100 text-gray-600 hover:bg-[#1E88E5]/10 hover:text-[#1E88E5] transition-colors text-xs"
                                        >
                                            {tagName}
                                        </Badge>
                                    );
                                })}
                                {Array.isArray(course.tags) && course.tags.length > 3 && (
                                    <Badge variant="secondary" className="bg-gray-50 text-gray-500 text-xs">
                                        +{course.tags.length - 3}
                                    </Badge>
                                )}
                            </div>

                            {/* Thêm tổng học viên và rating trung bình */}
                            <div className="flex gap-4 items-center text-xs text-gray-500 mb-2">
                                <span><Eye className="inline w-4 h-4 mr-1" /> {totalStudents} học viên</span>
                                <span><span className="inline-block align-middle text-yellow-500">★</span> {courseRating.toFixed(1)}</span>
                            </div>
                        </div>

                        {/* Footer / Progress Section - Removed Views/Lessons */}
                        {showProgress && (course.progress !== null && course.progress !== undefined) && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-medium">
                                        <span className="text-gray-600">Tiến độ học tập</span>
                                        <span className="text-[#1E88E5]">{course.progress}%</span>
                                    </div>
                                    {/* Custom Progress Bar */}
                                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#1E88E5] transition-all duration-300 rounded-full"
                                            style={{ width: `${course.progress}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
