
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
import { useCoursesQuery } from '@/hooks/useCoursesQuery';
import { tagsAPI, enrollmentsAPI } from '@/services/api';


interface ExplorePageProps {
  navigateTo: (page: Page) => void;
  setSelectedCourse: (course: Course) => void;
  currentUser: any;
}

export function ExplorePage({ navigateTo, setSelectedCourse, currentUser }: ExplorePageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [currentPage, setCurrentPage] = useState(1);
  const [allTags, setAllTags] = useState<string[]>(['all']);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);

  const ITEMS_PER_PAGE = 9;

  // Fetch user's enrolled courses on mount
  useEffect(() => {
    if (currentUser?.id) {
      enrollmentsAPI.getMyEnrollments().then((res) => {
        const enrollments = Array.isArray(res) ? res : res.data;
        if (enrollments && Array.isArray(enrollments)) {
          const courseIds = enrollments.map((e: any) => e.course_id);
          setEnrolledCourseIds(courseIds);
        }
      }).catch(err => console.log('Could not fetch enrollments'));
    }
  }, [currentUser?.id]);

  // Fetch tags from backend
  useEffect(() => {
    tagsAPI.getAllTags().then((res) => {
      if (Array.isArray(res.data)) {
        let tagNames = res.data.map((t: any) => t.name);
        // Sort tags: "Others" always at the end
        tagNames = tagNames.sort((a: string, b: string) => {
          if (a.toLowerCase() === 'others') return 1;
          if (b.toLowerCase() === 'others') return -1;
          return a.localeCompare(b);
        });
        setAllTags(['all', ...tagNames]);
      }
    });
  }, []);

  // Fetch courses from backend
  const { courses, total, loading, error } = useCoursesQuery({
    searchQuery,
    selectedTag,
    sortBy,
    page: currentPage,
    pageSize: ITEMS_PER_PAGE,
  });

  const totalPages = Math.ceil((total || 0) / ITEMS_PER_PAGE);
  const currentCourses = courses;

  // Reset to page 1 when filters change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleTagChange = (value: string) => {
    setSelectedTag(value);
    setCurrentPage(1);
  };

  const handleJoinSuccess = () => {
    // Refresh enrolled courses
    if (currentUser?.id) {
      enrollmentsAPI.getMyEnrollments().then((res) => {
        if (res.data && Array.isArray(res.data)) {
          const courseIds = res.data.map((e: any) => e.course_id);
          setEnrolledCourseIds(courseIds);
        }
      }).catch(err => console.log('Could not fetch enrollments'));
    }
  };

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
            Tìm thấy {courses.length} khóa học
          </div>
        </div>
      </AnimatedSection>

      {/* Course Grid */}
      {loading ? (
        <div className="text-center py-16">Đang tải dữ liệu...</div>
      ) : error ? (
        <div className="text-center py-16 text-red-500">{error}</div>
      ) : courses && courses.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 explore-course-grid">
            {currentCourses.map((course: any, index: number) => (
              <AnimatedSection key={course.id} animation="fade-up" delay={index * 50}>
                <CourseCard
                  course={course}
                  onClick={() => {
                    setSelectedCourse(course);
                    navigateTo('course-detail');
                  }}
                  currentUserId={currentUser?.id}
                  currentRole={currentUser?.role}
                  isEnrolled={enrolledCourseIds.includes(course.id) || enrolledCourseIds.includes(String(course.id))}
                  onJoinSuccess={handleJoinSuccess}
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
