import { useState } from 'react';
import { Search, Eye, Trash2, Globe, Lock, Users, Star, BookOpen, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { mockCourses, mockTags } from '@/services/mocks';
import { Course, Page } from '@/types';
import { CourseListCard } from '@/components/shared/CourseListCard';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Combobox } from '@/components/ui/combobox';

const ITEMS_PER_PAGE = 6;

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
  const [currentPage, setCurrentPage] = useState(1);

  // Filter courses
  const filteredCourses = mockCourses.filter(course => {
    const matchSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.ownerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchVisibility = filterVisibility === 'all' || course.visibility === filterVisibility;
    const matchTag = filterTag === 'all' || (course.tags && course.tags.includes(filterTag));
    return matchSearch && matchVisibility && matchTag;
  });



  // Pagination logic
  const totalPages = Math.ceil(filteredCourses.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedCourses = filteredCourses.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const handleDeleteCourse = () => {
    if (courseToDelete) {
      toast.success(`Đã xóa khóa học "${courseToDelete.title}"`);
      setShowDeleteDialog(false);
      setCourseToDelete(null);
    }
  };

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
          <BookOpen className="w-8 h-8 text-[#1E88E5]" />
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
            Quản lý khóa học
          </h1>
        </div>
        <p className="text-gray-600 ml-11">Xem và quản lý tất cả khóa học trong hệ thống</p>
        <div className="ml-11 w-24 h-1 bg-gradient-to-r from-[#1E88E5] to-transparent rounded-full mt-2"></div>
      </div>



      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="relative md:col-span-6">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Tìm kiếm khóa học hoặc giảng viên..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
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
                items={[{ value: 'all', label: 'Tất cả chủ đề' }, ...mockTags.map(tag => ({ value: tag.name, label: tag.name }))]}
                value={filterTag}
                onValueChange={(val) => setFilterTag(val || 'all')}
                placeholder="Chọn chủ đề"
                searchPlaceholder="Tìm chủ đề..."
                emptyText="Không tìm thấy chủ đề."
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-gray-600">
          Hiển thị {filteredCourses.length} / {mockCourses.length} khóa học
        </p>
      </div>

      {/* Course List */}
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
          <Card>
            <CardContent className="p-12 text-center">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="mb-2">Không tìm thấy khóa học</h3>
              <p className="text-gray-600">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50 rounded-md' : 'cursor-pointer hover:bg-[#1E88E5]/10 rounded-md transition-colors text-[#1E88E5]'}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                const showPage =
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1);

                const showEllipsisBefore = page === currentPage - 2 && currentPage > 3;
                const showEllipsisAfter = page === currentPage + 2 && currentPage < totalPages - 2;

                if (showEllipsisBefore) {
                  return (
                    <PaginationItem key={`ellipsis-before-${page}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }

                if (showEllipsisAfter) {
                  return (
                    <PaginationItem key={`ellipsis-after-${page}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }

                if (!showPage) return null;

                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      className={currentPage === page
                        ? 'bg-[#1E88E5] text-white hover:bg-[#1565C0] rounded-md shadow-md border-transparent hover:text-white transition-all'
                        : 'cursor-pointer hover:bg-[#1E88E5]/10 rounded-md border-transparent text-gray-600 transition-all'
                      }
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50 rounded-md' : 'cursor-pointer hover:bg-[#1E88E5]/10 rounded-md transition-colors text-[#1E88E5]'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa khóa học</AlertDialogTitle>
          </AlertDialogHeader>
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
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCourse}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Xác nhận xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
