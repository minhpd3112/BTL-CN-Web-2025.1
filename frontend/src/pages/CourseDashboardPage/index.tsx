import { Star, Users, Clock, CheckCircle, XCircle, Trash2, BarChart3, ArrowLeft, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Course, Page } from '@/types';

interface CourseDashboardPageProps {
  course: Course;
  navigateTo: (page: Page) => void;
  enrollmentRequests?: any[];
  onApproveRequest?: (id: number) => void;
  onRejectRequest?: (id: number) => void;
}

export function CourseDashboardPage({ 
  course, 
  navigateTo,
  enrollmentRequests = [],
  onApproveRequest,
  onRejectRequest
}: CourseDashboardPageProps) {
  const coursePendingRequests = enrollmentRequests.filter(r => r.courseId === course.id && r.status === 'pending');

  const handleApprove = (requestId: number) => {
    if (onApproveRequest) onApproveRequest(requestId);
    toast.success('Đã chấp nhận học viên');
  };

  const handleReject = (requestId: number) => {
    if (onRejectRequest) onRejectRequest(requestId);
    toast.success('Đã từ chối học viên');
  };

  const handleDeleteCourse = () => {
    toast.success('Đã xóa khóa học thành công!');
    setTimeout(() => navigateTo('my-courses'), 1000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigateTo('my-courses')}
          className="text-[#1E88E5] hover:bg-[#1E88E5]/10 -ml-2 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Khóa học của tôi
        </Button>

        <div className="flex items-center gap-3 mb-3">
          <BarChart3 className="w-8 h-8 text-[#1E88E5]" />
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
            Dashboard Khóa học
          </h1>
        </div>
        <p className="text-gray-600 ml-11">{course.title}</p>
        <div className="ml-11 w-24 h-1 bg-gradient-to-r from-[#1E88E5] to-transparent rounded-full mt-2"></div>
        
        {/* Action Buttons */}
        <div className="flex gap-2 ml-11 mt-6">
          <Button 
            onClick={() => navigateTo('edit-course')}
            className="bg-[#1E88E5] hover:bg-[#1565C0] text-white transition-colors"
          >
            <Edit className="w-4 h-4 mr-2" />
            Chỉnh sửa
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigateTo('course-students')}
            className="border-[#1E88E5] text-[#1E88E5] hover:bg-[#1E88E5] hover:text-white transition-colors"
          >
            <Users className="w-4 h-4 mr-2" />
            Quản lý học viên
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Xóa khóa học
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xóa khóa học này?</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn có chắc chắn muốn xóa khóa học <strong>"{course.title}"</strong>?
                  <br /><br />
                  Hành động này không thể hoàn tác. Tất cả nội dung, học viên ({course.students} người) 
                  và dữ liệu liên quan sẽ bị xóa vĩnh viễn.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDeleteCourse}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Xác nhận xóa
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

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
      <Tabs defaultValue="enrollments">
        <TabsList>
          <TabsTrigger value="enrollments">
            Yêu cầu đăng ký ({coursePendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="reviews">Đánh giá</TabsTrigger>
        </TabsList>

        <TabsContent value="enrollments">
          <Card>
            <CardContent className="p-6">
              {coursePendingRequests.length > 0 ? (
                <div className="space-y-4">
                  {coursePendingRequests.map((request: any) => (
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
                            onClick={() => handleApprove(request.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Chấp nhận
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(request.id)}
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
