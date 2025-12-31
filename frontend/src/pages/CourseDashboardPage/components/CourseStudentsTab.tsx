import { useState, useEffect, useCallback } from 'react';
import { Users, Clock, CheckCircle, XCircle, Trash2, UserPlus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Course } from '@/types';
import { enrollmentsAPI, supabase } from '@/services/api';
interface CourseStudentsTabProps {
    course: Course;
    enrollmentRequests?: any[];
    onApproveRequest?: (id: number) => void;
    onRejectRequest?: (id: number) => void;
}
export function CourseStudentsTab({
    course,
}: CourseStudentsTabProps) {
    console.log('=== CourseStudentsTab RENDER ===', { courseId: course.id });
    const [addStudentOpen, setAddStudentOpen] = useState(false);
    const [inviteeEmail, setInviteeEmail] = useState('');
    const [isInviting, setIsInviting] = useState(false);
    // Only show enrolled students, remove pending tab
    // Fetch real enrollments from API
    const [enrollments, setEnrollments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [averageProgress, setAverageProgress] = useState<number>(0);
    const fetchEnrollments = useCallback(async () => {
        try {
            setIsLoading(true);
            console.log('Fetching enrollments for course:', course.id);
            const response = await enrollmentsAPI.getByCourseId(course.id.toString());
            console.log('Enrollments API response:', response);
            if (response.success) {
                console.log('Enrollments data:', response.data);
                const enrollmentsWithUsers = response.data || [];
                // Fetch user profiles for each enrollment  
                for (const enrollment of enrollmentsWithUsers) {
                    try {
                        console.log('Fetching profile for user:', enrollment.user_id);
                        // Fetch user profile
                        const { data: profiles, error: profileError } = await supabase
                            .from('user_profiles')
                            .select('full_name, avatar_url')
                            .eq('id', enrollment.user_id)
                            .limit(1);

                        console.log('Profile fetch result:', { user_id: enrollment.user_id, profiles, error: profileError });

                        if (profiles && profiles.length > 0) {
                            enrollment.user = profiles[0];
                            console.log('Set user profile:', profiles[0]);
                        } else {
                            console.log('No profile found for user:', enrollment.user_id);
                            enrollment.user = {};
                        }

                        // Use email from backend response
                        if (enrollment.user_email) {
                            enrollment.user.email = enrollment.user_email;
                            console.log('Set user email from backend:', enrollment.user_email);
                        }
                    } catch (err) {
                        console.error('Could not fetch user data for:', enrollment.user_id, err);
                    }
                }

                setEnrollments(enrollmentsWithUsers);
            }
        } catch (error) {
            console.error('Failed to fetch enrollments:', error);
            toast.error('Không thể tải danh sách học viên');
        } finally {
            setIsLoading(false);
        }
    }, [course.id]);

    // Fetch average progress
    const fetchAverageProgress = useCallback(async () => {
        try {
            const response = await enrollmentsAPI.getCourseAverageProgress(course.id.toString());
            if (response.success) {
                setAverageProgress(response.data.averageProgress);
            }
        } catch (error) {
            console.error('Failed to fetch average progress:', error);
        }
    }, [course.id]);

    // Fetch enrollments when component mounts or course.id changes
    useEffect(() => {
        console.log('CourseStudentsTab mounted, fetching enrollments...');
        fetchEnrollments();
        fetchAverageProgress();
    }, [course.id, fetchEnrollments, fetchAverageProgress]);

    const courseEnrollments = enrollments;
    const approvedStudents = courseEnrollments.filter(e => e.status === 'approved');

    console.log('Total enrollments:', enrollments.length);
    console.log('Approved students:', approvedStudents.length);

    // Remove approve/reject request handlers

    const handleRemoveStudent = async (enrollmentId: string) => {
        try {
            await enrollmentsAPI.delete(enrollmentId);
            toast.success('Đã xóa học viên khỏi khóa học');
            fetchEnrollments(); // Refresh list
        } catch (error) {
            toast.error('Không thể xóa học viên');
        }
    };

    const handleInviteStudent = async () => {
        if (!inviteeEmail.trim()) {
            toast.error('Vui lòng nhập email học viên');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(inviteeEmail)) {
            toast.error('Email không hợp lệ');
            return;
        }

        setIsInviting(true);
        try {
            const response = await enrollmentsAPI.inviteByEmail(course.id.toString(), inviteeEmail);
            if (response.success) {
                toast.success(response.message || `Đã thêm ${inviteeEmail} vào khóa học`);
                setAddStudentOpen(false);
                setInviteeEmail('');
                // Refresh enrollments list
                fetchEnrollments();
            } else {
                toast.error(response.message || 'Không thể thêm học viên');
            }
        } catch (error: any) {
            console.error('Invite student error:', error);
            toast.error(error.message || 'Có lỗi xảy ra khi thêm học viên');
        } finally {
            setIsInviting(false);
        }
    };

    return (
        <div className="py-6">
            {/* Stats */}
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Total Students Card */}
                <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-[#1E88E5] overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Users className="w-24 h-24 text-[#1E88E5]" />
                    </div>
                    <CardContent className="p-6 relative z-10">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Tổng học viên</p>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-4xl font-bold text-gray-900">{approvedStudents.length}</p>
                                </div>
                            </div>
                            <div className="w-12 h-12 bg-gradient-to-br from-[#1E88E5] to-[#1565C0] rounded-xl shadow-lg shadow-blue-200 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                {/* Average Progress Card */}
                <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-green-500 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <CheckCircle className="w-24 h-24 text-green-500" />
                    </div>
                    <CardContent className="p-6 relative z-10">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Tiến độ trung bình</p>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-4xl font-bold text-gray-900">{averageProgress}%</p>
                                </div>
                            </div>
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-700 rounded-xl shadow-lg shadow-green-200 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                                <CheckCircle className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Only show enrolled students, no tabs */}
            <div>
                <Card className="hover:shadow-lg transition-shadow duration-300">
                    <CardHeader className="border-b bg-gradient-to-r from-[#1E88E5]/5 to-transparent">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-bold text-[#1E88E5]">Học viên đã tham gia</CardTitle>
                            <Dialog open={addStudentOpen} onOpenChange={setAddStudentOpen}>
                                <DialogTrigger asChild>
                                    <Button
                                        className="bg-[#1E88E5] hover:bg-[#1565C0] text-white"
                                        disabled={course.status === 'pending' || course.status === 'rejected'}
                                        title={course.status === 'pending' || course.status === 'rejected' ? 'Không thể mời học viên khi khóa học đang chờ duyệt hoặc bị từ chối' : ''}
                                    >
                                        <UserPlus className="w-4 h-4 mr-2" />
                                        Thêm học viên
                                    </Button>
                                </DialogTrigger>
                                {(course.status === 'approved' || course.status === 'draft') && (
                                    <DialogContent className="max-w-md">
                                        <DialogHeader>
                                            <DialogTitle>Mời học viên vào khóa học</DialogTitle>
                                            <DialogDescription>
                                                Nhập email của học viên để thêm vào khóa học riêng tư
                                            </DialogDescription>
                                        </DialogHeader>

                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="invitee-email">Email học viên *</Label>
                                                <Input
                                                    id="invitee-email"
                                                    type="email"
                                                    placeholder="student@example.com"
                                                    value={inviteeEmail}
                                                    onChange={(e) => setInviteeEmail(e.target.value)}
                                                    className="mt-2"
                                                    disabled={isInviting}
                                                />
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">
                                            💡 Học viên cần đã có tài khoản trong hệ thống
                                        </p>
                                        <div className="flex justify-end gap-2 mt-6">
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setAddStudentOpen(false);
                                                    setInviteeEmail('');
                                                }}
                                                disabled={isInviting}
                                            >
                                                Hủy
                                            </Button>
                                            <Button
                                                className="bg-[#1E88E5] hover:bg-[#1565C0]"
                                                onClick={handleInviteStudent}
                                                disabled={isInviting}
                                            >
                                                {isInviting ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                                        Đang thêm...
                                                    </>
                                                ) : (
                                                    <>
                                                        <UserPlus className="w-4 h-4 mr-2" />
                                                        Mời
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </DialogContent>
                                )}
                            </Dialog>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="text-center py-12">
                                <div className="w-12 h-12 border-4 border-[#1E88E5] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-gray-600">Đang tải...</p>
                            </div>
                        ) : approvedStudents.length > 0 ? (
                            <div className="space-y-4">
                                {approvedStudents.map((enrollment: any) => {
                                    // Prefer full_name from user profile, fallback to partial ID
                                    const userName = enrollment.user?.full_name || `User ${enrollment.user_id.substring(0, 8)}`;
                                    const userInitial = userName.charAt(0).toUpperCase();
                                    const enrolledDate = new Date(enrollment.enrolled_at).toLocaleDateString('vi-VN');

                                    return (<div key={enrollment.id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center gap-4">
                                            <Avatar>
                                                <AvatarFallback className="bg-[#1E88E5] text-white">
                                                    {userInitial}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">{userName}</div>
                                                <div className="text-sm text-gray-600">
                                                    {enrollment.user?.email || 'Email không có sẵn'}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Tham gia: {enrolledDate}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <div className="text-sm text-gray-600">Tiến độ</div>
                                                <div className="font-medium">{enrollment.progress?.percentage || 0}%</div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemoveStudent(enrollment.id)}
                                            >
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p>Chưa có học viên nào tham gia</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div >
    );
}
