import { useState, useEffect } from 'react';
import { CheckCircle, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CourseCard } from '@/components/shared/CourseCard';
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

  // Removed CoursePreviewCard, will use CourseCard instead

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
            <div key={course.id} className="mb-6">
              <CourseCard
                course={course}
                onClick={() => {
                  setSelectedCourse(course);
                  navigateTo('course-detail');
                }}
              />
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
                  onClick={e => {
                    e.stopPropagation();
                    handleApproveCourse(course);
                  }}
                >
                  Phê duyệt
                </Button>
                <Button
                  size="sm"
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
                  onClick={e => {
                    e.stopPropagation();
                    handleRejectCourse(course);
                  }}
                >
                  Từ chối
                </Button>
              </div>
            </div>
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
