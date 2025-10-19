import { useState } from 'react';
import { Eye, CheckCircle, XCircle, Users, BookOpen, FileCheck, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { mockCourses } from '@/services/mocks';
import { Course, Page } from '@/types';

interface ApproveCoursesPageProps {
  navigateTo: (page: Page) => void;
  setSelectedCourse: (course: Course) => void;
}

export function ApproveCoursesPage({ navigateTo, setSelectedCourse }: ApproveCoursesPageProps) {
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [courseToReject, setCourseToReject] = useState<Course | null>(null);
  
  // Only show pending public courses
  const pendingCourses = mockCourses.filter(c => c.status === 'pending' && c.visibility === 'public');

  const handleApproveCourse = (course: Course) => {
    toast.success(`Đã duyệt khóa học "${course.title}"`);
    // In real app: API call to update course status
  };

  const handleRejectCourse = (course: Course) => {
    setCourseToReject(course);
    setShowRejectDialog(true);
  };

  const confirmReject = () => {
    if (!rejectReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }
    toast.success(`Đã từ chối khóa học "${courseToReject?.title}"`);
    setShowRejectDialog(false);
    setRejectReason('');
    setCourseToReject(null);
  };

  const CoursePreviewCard = ({ course }: { course: Course }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        <div className="relative">
          <img src={course.image} alt={course.title} className="w-full h-48 object-cover rounded-t-lg" />
          <Badge 
            className={`absolute top-3 right-3 ${
              course.status === 'pending' ? 'bg-orange-500' :
              course.status === 'approved' ? 'bg-green-500' : 'bg-red-500'
            }`}
          >
            {course.status === 'pending' ? 'Chờ duyệt' :
             course.status === 'approved' ? 'Đã duyệt' : 'Từ chối'}
          </Badge>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-3">
            {course.tags.slice(0, 2).map((tag: string) => (
              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
            ))}
          </div>
          <h3 className="mb-2 line-clamp-2">{course.title}</h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
          
          <div className="flex items-center gap-3 mb-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Avatar className="w-6 h-6">
                <AvatarFallback className="text-xs bg-[#1E88E5] text-white">{course.ownerAvatar}</AvatarFallback>
              </Avatar>
              <span>{course.ownerName}</span>
            </div>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {course.students}
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              {course.lessons} mục
            </span>
          </div>

          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              className="flex-1"
              onClick={() => {
                setSelectedCourse(course);
                navigateTo('course-detail');
              }}
            >
              <Eye className="w-4 h-4 mr-1" />
              Xem chi tiết
            </Button>
            {course.status === 'pending' && (
              <>
                <Button 
                  size="sm"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => handleApproveCourse(course)}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Duyệt
                </Button>
                <Button 
                  size="sm"
                  variant="destructive"
                  onClick={() => handleRejectCourse(course)}
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        onClick={() => navigateTo('admin-dashboard')}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Quay về Dashboard
      </Button>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <FileCheck className="w-8 h-8 text-[#1E88E5]" />
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
            Duyệt khóa học
          </h1>
        </div>
        <p className="text-gray-600 ml-11">Xem xét và phê duyệt các khóa học chờ duyệt</p>
        <div className="ml-11 w-24 h-1 bg-gradient-to-r from-[#1E88E5] to-transparent rounded-full mt-2"></div>
      </div>

      {/* Pending Courses Grid */}
      {pendingCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingCourses.map(course => (
            <CoursePreviewCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="mb-2">Không có khóa học chờ duyệt</h3>
            <p className="text-gray-600">Tất cả khóa học đã được xem xét</p>
          </CardContent>
        </Card>
      )}

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Từ chối khóa học</DialogTitle>
            <DialogDescription>
              Vui lòng cho biết lý do từ chối khóa học "{courseToReject?.title}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reject-reason">
                Lý do từ chối <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="reject-reason"
                placeholder="Ví dụ: Nội dung không phù hợp, vi phạm quy định..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="mt-2"
                rows={4}
              />
            </div>
            <Alert className="bg-orange-50 border-orange-200">
              <AlertDescription className="text-orange-800 text-sm">
                ⚠️ Người tạo khóa học sẽ nhận được thông báo từ chối kèm lý do này
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={confirmReject}
            >
              Xác nhận từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
