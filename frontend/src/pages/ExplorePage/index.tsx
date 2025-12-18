import { useState, useMemo, useEffect } from 'react';
import { Search, TrendingUp, Star, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import { CourseCard } from '@/components/shared/CourseCard';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataPagination } from '@/components/shared/DataPagination';
import { usePagination } from '@/hooks/usePagination';
import { mockCourses } from '@/services/mocks';
import { Course, Page } from '@/types';
import { AnimatedSection } from '@/utils/animations';

interface ExplorePageProps {
  navigateTo: (page: Page) => void;
  setSelectedCourse: (course: Course) => void;
  currentUser: any;
}

export function ExplorePage({ navigateTo, setSelectedCourse }: ExplorePageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  const [sortBy, setSortBy] = useState('popular');

  // Get unique tags from courses
  const allTags = ['all', ...Array.from(new Set(mockCourses.flatMap(c => c.tags)))];

  // Chỉ hiển thị khóa public đã approved
  const availableCourses = mockCourses.filter(c => c.visibility === 'public' && c.status === 'approved');

  const filteredAndSortedCourses = useMemo(() => {
    // Filter courses
    let filtered = availableCourses.filter(c => {
      const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = selectedTag === 'all' || c.tags.includes(selectedTag);
      return matchesSearch && matchesTag;
    });

    // Sort courses
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.students - a.students;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    return sorted;
  }, [searchQuery, selectedTag, sortBy, availableCourses]);

  // Use pagination hook
  const { currentPage, setCurrentPage, totalPages, paginatedItems: currentCourses, resetPage } =
    usePagination(filteredAndSortedCourses, { itemsPerPage: 9 });

  // Reset page when filters change
  useEffect(() => {
    resetPage();
  }, [searchQuery, selectedTag, sortBy, resetPage]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AnimatedSection animation="fade-up">
        <PageHeader
          icon={<Search className="w-8 h-8" />}
          title="Khám phá khóa học"
          description="Tìm kiếm và khám phá khóa học phù hợp với bạn"
        />
      </AnimatedSection>

      {/* Search and Filter */}
      <AnimatedSection animation="fade-up" delay={100}>
        <div className="bg-white rounded-lg p-6 mb-8 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Search Input */}
            <div className="md:col-span-6 relative group">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-[#1E88E5]" />
              <Input
                placeholder="Tìm kiếm khóa học..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 transition-all duration-300 focus:ring-2 focus:ring-[#1E88E5]/20"
              />
            </div>

            {/* Tag Filter */}
            <div className="md:col-span-4">
              <Combobox
                items={allTags.map(tag => ({ value: tag, label: tag === 'all' ? 'Tất cả chủ đề' : tag }))}
                value={selectedTag}
                onValueChange={(val) => setSelectedTag(val || 'all')}
                placeholder="Chọn chủ đề"
                searchPlaceholder="Tìm chủ đề..."
                emptyText="Không tìm thấy chủ đề."
                className="w-full"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="md:col-span-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full transition-all duration-300 hover:border-[#1E88E5]/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular" className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Phổ biến nhất
                    </div>
                  </SelectItem>
                  <SelectItem value="rating" className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      Đánh giá cao
                    </div>
                  </SelectItem>
                  <SelectItem value="newest" className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Mới nhất
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600 flex items-center gap-2">
            <div className="w-2 h-2 bg-[#1E88E5] rounded-full"></div>
            Tìm thấy {filteredAndSortedCourses.length} khóa học
          </div>
        </div>
      </AnimatedSection>

      {/* Course Grid */}
      {filteredAndSortedCourses.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 explore-course-grid">
            {currentCourses.map((course, index) => (
              <AnimatedSection key={course.id} animation="fade-up" delay={index * 50}>
                <CourseCard
                  course={course}
                  onClick={() => {
                    setSelectedCourse(course);
                    navigateTo('course-detail');
                  }}
                />
              </AnimatedSection>
            ))}
          </div>

          {/* Pagination */}
          <DataPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      ) : (
        <AnimatedSection animation="fade-up">
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="mb-2">Không tìm thấy khóa học</h3>
            <p className="text-gray-600">Thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc</p>
          </div>
        </AnimatedSection>
      )}
    </div>
  );
}
