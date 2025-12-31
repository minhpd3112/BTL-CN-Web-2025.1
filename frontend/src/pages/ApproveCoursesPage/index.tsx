import { useState, useEffect } from 'react';
import { Eye, CheckCircle, Users, BookOpen, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { coursesAPI } from '@/services/api';
import { Course, Page } from '@/types';
import { PageHeader } from '@/components/shared/PageHeader';

interface ApproveCoursesPageProps {
  navigateTo: (page: Page) => void;
  setSelectedCourse: (course: Course) => void;
}

export function ApproveCoursesPage({ navigateTo, setSelectedCourse }: ApproveCoursesPageProps) {
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [courseToReject, setCourseToReject] = useState<Course | null>(null);
  const [pendingCourses, setPendingCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch pending public courses from API
  useEffect(() => {
    const fetchPendingCourses = async () => {
      setLoading(true);
      try {
        const res = await coursesAPI.getAllCourses({ status: 'pending', visibility: 'public' });
        if (res.success) {
          setPendingCourses(res.data || []);
        } else {
          toast.error(res.message || 'Không thể tải danh sách khoá học');
        }
      } catch (err: any) {
        toast.error('Lỗi tải khoá học: ' + (err?.message || 'Không xác định'));
      } finally {
        setLoading(false);
      }
    };
    fetchPendingCourses();
  }, []);

  const handleApproveCourse = async (course: Course) => {
    try {
      await coursesAPI.reviewCourse(course.id, 'approved');
      toast.success(`Đã duyệt khóa học "${course.title}"`);
      setPendingCourses(prev => prev.filter(c => c.id !== course.id));
    } catch (err: any) {
      toast.error('Duyệt khoá học thất bại: ' + (err?.message || 'Không xác định'));
    }
  };

  const handleRejectCourse = (course: Course) => {
    setCourseToReject(course);
    setShowRejectDialog(true);
  };

  const confirmReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }
    if (!courseToReject) return;
    try {
      await coursesAPI.reviewCourse(courseToReject.id, 'rejected', rejectReason);
      toast.success(`Đã từ chối khóa học "${courseToReject.title}"`);
      setPendingCourses(prev => prev.filter(c => c.id !== courseToReject.id));
    } catch (err: any) {
      toast.error('Từ chối khoá học thất bại: ' + (err?.message || 'Không xác định'));
    } finally {
      setShowRejectDialog(false);
      setRejectReason('');
      setCourseToReject(null);
    }
  };

  const CoursePreviewCard = ({ course }: { course: Course }) => (
    <>
      <style>{`
        @keyframes border-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div className="group relative h-full">
        {/* Animated Moving Light Border (Visible on Hover) */}
        <div className="absolute -inset-[2px] rounded-xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0_340deg,#1E88E5_360deg)] animate-[border-rotate_4s_linear_infinite]" />
        </div>

        {/* Static Blue Glow */}
        <div className="absolute -inset-[1px] rounded-xl bg-[#1E88E5]/20 opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300" />

        <Card
          className="relative z-10 h-full flex flex-col overflow-hidden border-[#1E88E5]/30 bg-white shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
          onClick={() => {
            setSelectedCourse(course);
            navigateTo('course-detail');
          }}
        >
          {/* Image Area */}
          <div className="relative aspect-video overflow-hidden">
            <img
              src={course.image}
              alt={course.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

            {/* Play Icon Overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
              <div className="bg-white/30 backdrop-blur-md p-3 rounded-full shadow-lg">
                <Eye className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>

          <CardContent className="flex flex-col flex-grow p-5 gap-3">

            <h3
              className="font-bold text-lg leading-snug line-clamp-2 group-hover:text-[#1E88E5] transition-colors duration-200"
              title={course.title}
            >
              {course.title}
            </h3>

            {/* Description */}
            <p className="text-gray-500 text-sm line-clamp-2 flex-grow">
              {course.description}
            </p>

            {/* Author & Stats */}
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Avatar className="w-6 h-6 border border-gray-100">
                  <AvatarFallback className="text-[10px] bg-gradient-to-br from-[#1E88E5] to-[#1565C0] text-white">
                    {course.ownerAvatar}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium truncate max-w-[100px]">{course.ownerName}</span>
              </div>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {course.students}
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                {course.lessons}
              </span>
            </div>

            <div className="mt-3 pt-4 border-t border-gray-100 flex gap-2">
              <Button
                size="sm"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
                onClick={(e) => {
                  e.stopPropagation();
                  handleApproveCourse(course);
                }}
              >
                Phê duyệt
              </Button>
              <Button
                size="sm"
                className="flex-1 bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRejectCourse(course);
                }}
              >
                Từ chối
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        icon={<FileCheck className="w-8 h-8" />}
        title="Duyệt khóa học"
        description="Xem xét và phê duyệt các khóa học chờ duyệt"
        backButton={{
          label: 'Quay về Dashboard',
          onClick: () => navigateTo('admin-dashboard'),
        }}
      />

      {/* Pending Courses Grid */}
      {loading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <span className="text-gray-500">Đang tải khoá học...</span>
          </CardContent>
        </Card>
      ) : pendingCourses.length > 0 ? (
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Hủy
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
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
