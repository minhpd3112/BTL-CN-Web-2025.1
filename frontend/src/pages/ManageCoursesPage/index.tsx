import { useState, useEffect } from 'react';
import { Trash2, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { coursesAPI, tagsAPI } from '@/services/api';
import { Course, Page } from '@/types';
import { CourseListCard } from '@/components/shared/CourseListCard';
import { Combobox } from '@/components/ui/combobox';
import { usePagination } from '@/hooks/usePagination';
import { DataPagination } from '@/components/shared/DataPagination';
import { PageHeader } from '@/components/shared/PageHeader';
import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog';
import { SearchFilterCard } from '@/components/shared/SearchFilterCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface ManageCoursesPageProps {
  navigateTo: (page: Page) => void;
  setSelectedCourse: (course: Course) => void;
}

export function ManageCoursesPage({ navigateTo, setSelectedCourse }: ManageCoursesPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisibility, setFilterVisibility] = useState<'all' | 'public' | 'private'>('all');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tags, setTags] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewCourse, setReviewCourse] = useState<Course | null>(null);
  const [reviewAction, setReviewAction] = useState<'approved' | 'rejected' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  // Chuẩn hoá fetchCourses duy nhất
  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params: any = { isAdmin: true };
      if (filterTag && filterTag !== 'all') params.tag = filterTag;
      const response = await coursesAPI.getAllCourses(params);
      if (response.success) {
        const courseList = Array.isArray(response.data) ? response.data : [];
        const mappedCourses = courseList.map((course: any) => ({
          id: course.id,
          title: course.title,
          description: course.description || '',
          image: course.image_url || '/placeholder-course.jpg',
          image_url: course.image_url,
          ownerId: course.owner_id,
          owner_id: course.owner_id,
          ownerName: course.owner?.full_name || 'Unknown',
          ownerAvatar: course.owner?.avatar_url || '',
          owner: course.owner,
          tags: course.tags?.map((t: any) => t.tag?.name || t.name).filter(Boolean) || [],
          visibility: course.visibility as 'public' | 'private',
          status: course.status,
          students: course.students || 0,
          rating: course.rating || 0,
          studentsCount: course.students || 0,
          lessonsCount: 0,
        }));
        setCourses(mappedCourses);
      } else {
        setError(response.message || 'Không thể tải khóa học');
      }
    } catch (err: any) {
      console.error('Fetch courses error:', err);
      setError('Đã xảy ra lỗi khi tải danh sách khóa học');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch tags on mount
  useEffect(() => {
    async function fetchTags() {
      try {
        const tagsRes = await tagsAPI.getAllTags();
        setTags(tagsRes.data || []);
      } catch (e) {
        setTags([]);
      }
    }
    fetchTags();
  }, []);

  // Fetch courses mỗi khi filterTag thay đổi
  useEffect(() => {
    fetchCourses();
  }, [filterTag]);

  // Filter courses ở FE (chỉ search và visibility)
  const filteredCourses = courses.filter(course => {
    const matchSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.ownerName?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchVisibility = filterVisibility === 'all' || course.visibility === filterVisibility;
    return matchSearch && matchVisibility;
  });

  // Pagination FE
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const paginatedCourses = filteredCourses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset page về 1 khi đổi filter
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterVisibility, filterTag]);

  const handleDeleteCourse = () => {
    if (courseToDelete) {
      coursesAPI.deleteCourse(courseToDelete.id)
        .then(() => {
          toast.success(`Đã xóa khóa học "${courseToDelete.title}"`);
          // Refresh course list
          fetchCourses();
        })
        .catch((err) => {
          toast.error(`Xoá khoá học thất bại: ${err?.response?.data?.message || err.message || 'Lỗi không xác định'}`);
        })
        .finally(() => {
          setShowDeleteDialog(false);
          setCourseToDelete(null);
        });
    }
  };

  const handleReviewCourse = async (course: Course, action: 'approved' | 'rejected') => {
    setReviewCourse(course);
    setReviewAction(action);
    if (action === 'rejected') {
      setShowReviewDialog(true);
    } else {
      // Approve directly
      setReviewLoading(true);
      try {
        await coursesAPI.reviewCourse(course.id, 'approved');
        toast.success(`Đã duyệt khóa học "${course.title}"`);
        fetchCourses();
      } catch (err: any) {
        toast.error(`Duyệt khóa học thất bại: ${err?.message || 'Lỗi không xác định'}`);
      } finally {
        setReviewLoading(false);
        setReviewCourse(null);
        setReviewAction(null);
      }
    }
  };

  const handleRejectSubmit = async () => {
    if (!reviewCourse) return;
    setReviewLoading(true);
    try {
      await coursesAPI.reviewCourse(reviewCourse.id, 'rejected', rejectionReason);
      toast.success(`Đã từ chối khóa học "${reviewCourse.title}"`);
      fetchCourses();
    } catch (err: any) {
      toast.error(`Từ chối khóa học thất bại: ${err?.message || 'Lỗi không xác định'}`);
    } finally {
      setReviewLoading(false);
      setShowReviewDialog(false);
      setReviewCourse(null);
      setReviewAction(null);
      setRejectionReason('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {isLoading && <div className="text-center py-8">Đang tải dữ liệu...</div>}
      {error && <div className="text-center text-red-500 py-8">{error}</div>}
      <PageHeader
        icon={<BookOpen className="w-8 h-8" />}
        title="Quản lý khóa học"
        description="Xem và quản lý tất cả khóa học trong hệ thống"
        backButton={{
          label: 'Quay về Dashboard',
          onClick: () => navigateTo('admin-dashboard'),
        }}
      />

      {/* Filters */}
      <SearchFilterCard
        placeholder="Tìm kiếm khóa học hoặc giảng viên..."
        value={searchQuery}
        onChange={setSearchQuery}
      >
        <div className="md:col-span-2">
          <Select value={filterVisibility} onValueChange={(val: 'all' | 'public' | 'private') => setFilterVisibility(val)}>
            <SelectTrigger>
              <SelectValue placeholder="Hiển thị" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="public">Công khai</SelectItem>
              <SelectItem value="private">Riêng tư</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-4">
          <Combobox
            items={[{ value: 'all', label: 'Tất cả chủ đề' }, ...tags.map(tag => ({ value: tag.name, label: tag.name }))]}
            value={filterTag}
            onValueChange={(val) => setFilterTag(val || 'all')}
            placeholder="Chọn chủ đề"
            searchPlaceholder="Tìm chủ đề..."
            emptyText="Không tìm thấy chủ đề."
            className="w-full"
          />
        </div>
      </SearchFilterCard>

      {/* Results */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-gray-600">
          Hiển thị {filteredCourses.length} / {courses.length} khóa học
        </p>
      </div>

      {/* Course List */}
      {error ? (
        <div className="p-12 text-center bg-white rounded-lg shadow-sm">
          <BookOpen className="w-16 h-16 text-red-300 mx-auto mb-4" />
          <h3 className="mb-2 text-red-600">Lỗi tải dữ liệu</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchCourses}>Thử lại</Button>
        </div>
      ) : isLoading ? (
        <div className="p-12 text-center bg-white rounded-lg shadow-sm">
          <div className="w-16 h-16 border-4 border-[#1E88E5] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải khóa học...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedCourses.length > 0 ? (
            paginatedCourses.map(course => (
              <CourseListCard
                key={course.id}
                course={course}
                onClick={() => {
                  setSelectedCourse(course);
                  navigateTo('course-detail');
                }}
                action={
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="h-8 w-max px-3 bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 shadow-sm transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCourseToDelete(course);
                        setShowDeleteDialog(true);
                      }}
                      title="Xóa khóa học"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Xóa
                    </Button>
                    {/* Admin review actions for pending courses */}
                    {course.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          className="h-8 w-max px-3 bg-green-600 text-white border border-green-200 hover:bg-green-700 hover:border-green-300 shadow-sm transition-all"
                          disabled={reviewLoading}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReviewCourse(course, 'approved');
                          }}
                        >
                          Duyệt
                        </Button>
                        <Button
                          size="sm"
                          className="h-8 w-max px-3 bg-yellow-600 text-white border border-yellow-200 hover:bg-yellow-700 hover:border-yellow-300 shadow-sm transition-all"
                          disabled={reviewLoading}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReviewCourse(course, 'rejected');
                          }}
                        >
                          Từ chối
                        </Button>
                      </>
                    )}
                  </div>
                }
              />
            ))
          ) : (
            <div className="p-12 text-center bg-white rounded-lg shadow-sm">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="mb-2">Không tìm thấy khóa học</h3>
              <p className="text-gray-600">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      <DataPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Xác nhận xóa khóa học"
        onConfirm={handleDeleteCourse}
      >
        {courseToDelete && (
          <div className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <img
              src={courseToDelete.image}
              alt={courseToDelete.title}
              className="w-16 h-16 object-cover rounded-md flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 mb-1 line-clamp-1">{courseToDelete.title}</p>
              <p className="text-sm text-gray-500">Giảng viên: {courseToDelete.ownerName}</p>
            </div>
          </div>
        )}
      </DeleteConfirmDialog>

      {/* Reject Reason Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lý do từ chối khóa học</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Nhập lý do từ chối..."
            value={rejectionReason}
            onChange={e => setRejectionReason(e.target.value)}
            disabled={reviewLoading}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReviewDialog(false)} disabled={reviewLoading}>
              Hủy
            </Button>
            <Button onClick={handleRejectSubmit} disabled={reviewLoading || !rejectionReason}>
              Xác nhận từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
