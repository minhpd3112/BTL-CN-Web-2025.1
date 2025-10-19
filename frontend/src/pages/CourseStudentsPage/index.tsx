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
import { Course, Page } from '@/types';
import { mockUsers } from '@/services/mocks';

interface CourseStudentsPageProps {
  course: Course;
  navigateTo: (page: Page) => void;
  enrollmentRequests?: any[];
  onApproveRequest?: (id: number) => void;
  onRejectRequest?: (id: number) => void;
}

export function CourseStudentsPage({ 
  course, 
  navigateTo,
  enrollmentRequests = [],
  onApproveRequest,
  onRejectRequest
}: CourseStudentsPageProps) {
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const courseEnrollments = enrollmentRequests.filter(r => r.courseId === course.id);
  const pendingRequests = courseEnrollments.filter(r => r.status === 'pending');
  const approvedStudents = courseEnrollments.filter(r => r.status === 'approved');

  // Get enrolled user IDs
  const enrolledUserIds = courseEnrollments.map(r => r.userId);

  // Filter available users (exclude owner and already enrolled)
  const availableUsers = mockUsers.filter(user => 
    user.id !== course.ownerId && 
    !enrolledUserIds.includes(user.id) &&
    user.role !== 'admin' // Exclude admin from student list
  );

  // Filter users based on search
  const filteredUsers = availableUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <Users className="w-8 h-8 text-[#1E88E5]" />
          <h1 
            style={{
              fontSize: '2rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #1E88E5 0%, #1565C0 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Quản lý học viên
          </h1>
        </div>
        <p className="text-gray-600 ml-11">{course.title}</p>
        <div className="ml-11 w-24 h-1 bg-gradient-to-r from-[#1E88E5] to-transparent rounded-full mt-2"></div>
        
        {/* Back Button */}
        <div className="ml-11 mt-4">
          <Button 
            variant="ghost" 
            onClick={() => navigateTo('course-dashboard')}
            className="text-[#1E88E5] hover:bg-[#1E88E5]/10 -ml-2"
          >
            ← Quay lại Dashboard
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Tổng học viên</p>
                <p className="text-3xl">{approvedStudents.length}</p>
              </div>
              <div className="w-12 h-12 bg-[#1E88E5]/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-[#1E88E5]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={`hover:shadow-lg transition-all duration-200 hover:-translate-y-1 ${pendingRequests.length > 0 ? 'border-[#1E88E5] border-2' : ''}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Yêu cầu chờ duyệt</p>
                <p className="text-3xl text-[#1E88E5]">{pendingRequests.length}</p>
              </div>
              <div className="w-12 h-12 bg-[#1E88E5]/10 rounded-lg flex items-center justify-center relative">
                <Clock className="w-6 h-6 text-[#1E88E5]" />
                {pendingRequests.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#1E88E5] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {pendingRequests.length}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Tiến độ trung bình</p>
                <p className="text-3xl">45%</p>
              </div>
              <div className="w-12 h-12 bg-green-600/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="enrolled">
        <TabsList className="mb-6">
          <TabsTrigger value="enrolled">
            Đã tham gia ({approvedStudents.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Chờ duyệt ({pendingRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="enrolled">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Học viên đã tham gia</CardTitle>
                <Dialog open={addStudentOpen} onOpenChange={setAddStudentOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#1E88E5] hover:bg-[#1565C0]">
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
          <Card>
            <CardHeader>
              <CardTitle>Yêu cầu đăng ký chờ duyệt</CardTitle>
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
