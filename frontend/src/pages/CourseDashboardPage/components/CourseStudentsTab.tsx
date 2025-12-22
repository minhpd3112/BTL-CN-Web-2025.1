import { useState } from 'react';
import { Users, Clock, CheckCircle, XCircle, Trash2, UserPlus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Course } from '@/types';

interface CourseStudentsTabProps {
    course: Course;
    enrollmentRequests?: any[];
    onApproveRequest?: (id: number) => void;
    onRejectRequest?: (id: number) => void;
}

export function CourseStudentsTab({
    course,
    enrollmentRequests = [],
    onApproveRequest,
    onRejectRequest
}: CourseStudentsTabProps) {
    const [addStudentOpen, setAddStudentOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeStudentTab, setActiveStudentTab] = useState<'enrolled' | 'pending'>('enrolled');

    const courseEnrollments = enrollmentRequests.filter(r => r.courseId === course.id);
    const pendingRequests = courseEnrollments.filter(r => r.status === 'pending');
    const approvedStudents = courseEnrollments.filter(r => r.status === 'approved');

    // Note: In real app, we would fetch available users from an API endpoint
    // For now, this feature is disabled until backend implements user listing
    const availableUsers: any[] = [];

    // Filter users based on search
    const filteredUsers = availableUsers.filter(user =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleApproveRequest = (requestId: number) => {
        if (onApproveRequest) onApproveRequest(requestId);
        toast.success('Đã chấp nhận học viên');
    };

    const handleRejectRequest = (requestId: number) => {
        if (onRejectRequest) onRejectRequest(requestId);
        toast.success('Đã từ chối học viên');
    };

    const handleRemoveStudent = (userId: number) => {
        toast.success('Đã xóa học viên khỏi khóa học');
    };

    const handleInviteStudent = (user: any) => {
        toast.success(`Đã gửi lời mời đến ${user.name}`);
        setAddStudentOpen(false);
        setSearchQuery('');
    };

    return (
        <div className="py-6">
            {/* Stats */}
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

                {/* Pending Requests Card */}
                <Card className={`group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 overflow-hidden relative ${pendingRequests.length > 0 ? 'border-l-orange-500' : 'border-l-gray-300'}`}>
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Clock className={`w-24 h-24 ${pendingRequests.length > 0 ? 'text-orange-500' : 'text-gray-400'}`} />
                    </div>
                    <CardContent className="p-6 relative z-10">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Yêu cầu chờ duyệt</p>
                                <div className="flex items-baseline gap-2">
                                    <p className={`text-4xl font-bold ${pendingRequests.length > 0 ? 'text-orange-600' : 'text-gray-900'}`}>
                                        {pendingRequests.length}
                                    </p>
                                    {pendingRequests.length > 0 && (
                                        <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full animate-pulse">
                                            Cần xử lý
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className={`w-12 h-12 rounded-xl shadow-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 ${pendingRequests.length > 0 ? 'bg-gradient-to-br from-orange-500 to-red-500 shadow-orange-200' : 'bg-gray-100'}`}>
                                <Clock className={`w-6 h-6 ${pendingRequests.length > 0 ? 'text-white' : 'text-gray-400'}`} />
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
                                    <p className="text-4xl font-bold text-gray-900">45%</p>
                                </div>
                            </div>
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-700 rounded-xl shadow-lg shadow-green-200 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                                <CheckCircle className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="enrolled" onValueChange={(v) => setActiveStudentTab(v as 'enrolled' | 'pending')}>
                <TabsList className="mb-6 bg-[#1E88E5]/10 p-0 rounded-full h-auto inline-flex relative overflow-hidden">
                    {/* Sliding indicator */}
                    <div
                        className="absolute top-0 bottom-0 bg-gradient-to-r from-[#1E88E5] to-[#1565C0] rounded-full shadow-lg shadow-blue-300/50 transition-all duration-300 ease-out"
                        style={{
                            left: activeStudentTab === 'enrolled' ? '0px' : '50%',
                            width: '50%',
                        }}
                    />
                    <TabsTrigger
                        value="enrolled"
                        className="relative z-10 flex-1 min-w-[140px] px-4 py-2.5 rounded-full font-medium transition-all duration-300 hover:bg-[#1E88E5]/10 data-[state=active]:bg-transparent data-[state=active]:shadow-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0"
                        style={{ color: activeStudentTab === 'enrolled' ? '#FFFFFF' : '#1E88E5' }}
                    >
                        Đã tham gia ({approvedStudents.length})
                    </TabsTrigger>
                    <TabsTrigger
                        value="pending"
                        className="relative z-10 flex-1 min-w-[140px] px-4 py-2.5 rounded-full font-medium transition-all duration-300 hover:bg-[#1E88E5]/10 data-[state=active]:bg-transparent data-[state=active]:shadow-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0"
                        style={{ color: activeStudentTab === 'pending' ? '#FFFFFF' : '#1E88E5' }}
                    >
                        Chờ duyệt ({pendingRequests.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="enrolled">
                    <Card className="hover:shadow-lg transition-shadow duration-300">
                        <CardHeader className="border-b bg-gradient-to-r from-[#1E88E5]/5 to-transparent">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-bold text-[#1E88E5]">Học viên đã tham gia</CardTitle>
                                <Dialog open={addStudentOpen} onOpenChange={setAddStudentOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="bg-[#1E88E5] hover:bg-[#1565C0] text-white">
                                            <UserPlus className="w-4 h-4 mr-2" />
                                            Thêm học viên
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl">
                                        <DialogHeader>
                                            <DialogTitle>Mời học viên vào khóa học</DialogTitle>
                                            <DialogDescription>
                                                Tìm kiếm và mời người dùng tham gia khóa học của bạn
                                            </DialogDescription>
                                        </DialogHeader>

                                        <div className="space-y-4">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                <Input
                                                    placeholder="Tìm theo tên hoặc email..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="pl-9"
                                                />
                                            </div>

                                            <ScrollArea className="h-[400px] border rounded-lg">
                                                {filteredUsers.length > 0 ? (
                                                    <div className="divide-y">
                                                        {filteredUsers.map((user) => (
                                                            <div
                                                                key={user.id}
                                                                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <Avatar>
                                                                        <AvatarFallback className="bg-[#1E88E5] text-white">
                                                                            {user.avatar}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <div>
                                                                        <div className="font-medium">{user.name}</div>
                                                                        <div className="text-sm text-gray-600">{user.email}</div>
                                                                    </div>
                                                                </div>
                                                                <Button
                                                                    size="sm"
                                                                    className="bg-[#1E88E5] hover:bg-[#1565C0]"
                                                                    onClick={() => handleInviteStudent(user)}
                                                                >
                                                                    <UserPlus className="w-4 h-4 mr-1" />
                                                                    Mời
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-12 text-gray-500">
                                                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                                        <p>
                                                            {searchQuery
                                                                ? 'Không tìm thấy người dùng phù hợp'
                                                                : 'Không có người dùng khả dụng'}
                                                        </p>
                                                    </div>
                                                )}
                                            </ScrollArea>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {approvedStudents.length > 0 ? (
                                <div className="space-y-4">
                                    {approvedStudents.map((student: any) => (
                                        <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-center gap-4">
                                                <Avatar>
                                                    <AvatarFallback className="bg-[#1E88E5] text-white">
                                                        {student.userAvatar}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium">{student.userName}</div>
                                                    <div className="text-sm text-gray-600">{student.userEmail}</div>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        Tham gia: {student.respondedAt || student.requestedAt}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="text-right">
                                                    <div className="text-sm text-gray-600">Tiến độ</div>
                                                    <div className="font-medium">45%</div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemoveStudent(student.userId)}
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p>Chưa có học viên nào tham gia</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="pending">
                    <Card className="hover:shadow-lg transition-shadow duration-300">
                        <CardHeader className="border-b bg-gradient-to-r from-[#1E88E5]/5 to-transparent">
                            <CardTitle className="text-lg font-bold text-[#1E88E5]">Yêu cầu đăng ký chờ duyệt</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {pendingRequests.length > 0 ? (
                                <div className="space-y-4">
                                    {pendingRequests.map((request: any) => (
                                        <div key={request.id} className="p-4 border rounded-lg">
                                            <div className="flex items-start gap-3">
                                                <Avatar>
                                                    <AvatarFallback className="bg-[#1E88E5] text-white">
                                                        {request.userAvatar}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <div className="font-medium mb-1">{request.userName}</div>
                                                    <div className="text-sm text-gray-600 mb-2">{request.userEmail}</div>
                                                    {request.message && (
                                                        <div className="bg-gray-50 p-3 rounded-lg mb-3">
                                                            <p className="text-sm text-gray-700 italic">"{request.message}"</p>
                                                        </div>
                                                    )}
                                                    <div className="text-xs text-gray-500">
                                                        Đăng ký lúc: {request.requestedAt}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        className="bg-green-500 hover:bg-green-600"
                                                        onClick={() => handleApproveRequest(request.id)}
                                                    >
                                                        <CheckCircle className="w-4 h-4 mr-1" />
                                                        Chấp nhận
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => handleRejectRequest(request.id)}
                                                    >
                                                        <XCircle className="w-4 h-4 mr-1" />
                                                        Từ chối
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p>Không có yêu cầu đăng ký mới</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
