import { useState, useMemo } from 'react';
import { Search, TrendingUp, Star, Clock, BookOpen, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { CourseCard } from '@/components/shared/CourseCard';
import { mockCourses, mockTags } from '@/services/mocks';
import { Course, Page } from '@/types';
import { AnimatedSection } from '@/utils/animations';

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
  
  const ITEMS_PER_PAGE = 9;

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

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedCourses.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentCourses = filteredAndSortedCourses.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleTagChange = (value: string) => {
    setSelectedTag(value);
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AnimatedSection animation="fade-up">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Search className="w-8 h-8 text-[#1E88E5]" />
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
              Khám phá khóa học
            </h1>
          </div>
          <p className="text-gray-600 ml-11">Tìm kiếm và khám phá khóa học phù hợp với bạn</p>
          <div className="ml-11 w-24 h-1 bg-gradient-to-r from-[#1E88E5] to-transparent rounded-full mt-2"></div>
        </div>
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
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 transition-all duration-300 focus:ring-2 focus:ring-[#1E88E5]/20"
              />
            </div>

            {/* Tag Filter */}
            <div className="md:col-span-3">
              <Select value={selectedTag} onValueChange={handleTagChange}>
                <SelectTrigger className="w-full transition-all duration-300 hover:border-[#1E88E5]/50">
                  <SelectValue placeholder="Chủ đề" />
                </SelectTrigger>
                <SelectContent>
                  {allTags.map(tag => (
                    <SelectItem key={tag} value={tag} className="cursor-pointer">
                      {tag === 'all' ? 'Tất cả chủ đề' : tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort Dropdown */}
            <div className="md:col-span-3 flex items-center gap-3">
              <span className="text-sm text-gray-600 whitespace-nowrap">Sắp xếp:</span>
              <Select value={sortBy} onValueChange={handleSortChange}>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 home-course-grid">
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
          {totalPages > 1 && (
            <AnimatedSection animation="fade-up">
              <div className="flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-[#1E88E5]/10'}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      // Show first page, last page, current page, and pages around current
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
                            isActive={currentPage === page}
                            className={currentPage === page 
                              ? 'bg-[#1E88E5] text-white hover:bg-[#1565C0]' 
                              : 'cursor-pointer hover:bg-[#1E88E5]/10'
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
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-[#1E88E5]/10'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </AnimatedSection>
          )}
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
