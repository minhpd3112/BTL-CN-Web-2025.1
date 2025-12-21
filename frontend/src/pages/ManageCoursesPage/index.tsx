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

  // Fetch courses on mount
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await coursesAPI.getAllCourses();

      if (response.success) {
        // Map backend course data to frontend Course type
        const mappedCourses = response.data.courses.map((course: any) => ({
          id: course.id,
          title: course.title,
          description: course.description || '',
          image: course.image_url || '/placeholder-course.jpg',
          ownerId: course.owner_id,
          ownerName: course.owner?.full_name || 'Unknown',
          ownerAvatar: course.owner?.avatar_url || '',
          tags: course.tags?.map((t: any) => t.tag?.name).filter(Boolean) || [],
          visibility: course.visibility as 'public' | 'private',
          status: course.status,
          studentsCount: 0, // TODO: Get from backend
          lessonsCount: 0,  // TODO: Get from backend
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


  // State for courses and tags
  const [courses, setCourses] = useState<Course[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Pagination state for FE
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Fetch all courses once
  useEffect(() => {
    async function fetchCourses() {
      setLoading(true);
      setError(null);
      try {
        const coursesRes = await coursesAPI.getAllCourses({ isAdmin: true });
        setCourses(coursesRes.data || []);
      } catch (e: any) {
        setError('Không thể tải dữ liệu');
        setCourses([]);
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  // Filter courses ở FE
  const filteredCourses = courses.filter(course => {
    const matchSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.ownerName?.toLowerCase?.().includes(searchQuery.toLowerCase()) ?? false);
    const matchVisibility = filterVisibility === 'all' || course.visibility === filterVisibility;
    const matchTag = filterTag === 'all' || (course.tags && course.tags.some((t: any) => t.name === filterTag || t === filterTag));
    return matchSearch && matchVisibility && matchTag;
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
      toast.success(`Đã xóa khóa học "${courseToDelete.title}"`);
      setShowDeleteDialog(false);
      setCourseToDelete(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {loading && <div className="text-center py-8">Đang tải dữ liệu...</div>}
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
    </div>
  );
}
