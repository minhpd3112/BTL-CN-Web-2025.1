import { useState, useMemo, useEffect } from 'react';
import { Tag, BookOpen, ArrowLeft, Users, GraduationCap, Filter, TrendingUp, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CourseCard } from '@/components/shared/CourseCard';
import { coursesAPI } from '@/services/api';
import { Course, User, Page, Tag as TagType } from '@/types';
import { AnimatedSection } from '@/utils/animations';
import { enrollmentsAPI } from '@/services/api';
import './styles.css';

interface TagDetailPageProps {
  navigateTo: (page: Page) => void;
  setSelectedCourse: (course: Course) => void;
  currentUser: User | null;
  selectedTag: TagType | null;
}

export function TagDetailPage({ navigateTo, setSelectedCourse, currentUser, selectedTag }: TagDetailPageProps) {
  const [sortBy, setSortBy] = useState<string>('popular');
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);

  // Fetch user's enrolled courses on mount
  useEffect(() => {
    if (currentUser?.id) {
      enrollmentsAPI.getMyEnrollments().then((res) => {
        if (res.data && Array.isArray(res.data)) {
          const courseIds = res.data.map((e: any) => e.course_id);
          setEnrolledCourseIds(courseIds);
        }
      }).catch(err => console.log('Could not fetch enrollments'));
    }
  }, [currentUser?.id]);

  // State for real courses
  const [tagCourses, setTagCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    if (!selectedTag) {
      setTagCourses([]);
      setLoadingCourses(false);
      return;
    }
    setLoadingCourses(true);
    coursesAPI.getAllCourses({ tag: selectedTag.name })
      .then((res: any) => {
        let courses: Course[] = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
        // Lọc thêm nếu cần (public, approved)
        let filtered = courses.filter(course =>
          course.visibility === 'public' &&
          course.status === 'approved'
        );
        // Sort courses
        switch (sortBy) {
          case 'popular':
            filtered = filtered.sort((a, b) => b.students - a.students);
            break;
          case 'rating':
            filtered = filtered.sort((a, b) => b.rating - a.rating);
            break;
          case 'newest':
            filtered = filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            break;
        }
        setTagCourses(filtered);
      })
      .catch(() => setTagCourses([]))
      .finally(() => setLoadingCourses(false));
  }, [selectedTag, sortBy]);

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

  if (!selectedTag) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-12 text-center">
            <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Không tìm thấy chủ đề</p>
            <Button
              className="mt-4 bg-[#1E88E5] text-white hover:bg-[#1565C0]"
              onClick={() => navigateTo('home')}
            >
              Quay về trang chủ
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalStudents = tagCourses.reduce((sum, course) => sum + (typeof course.students === 'number' ? course.students : 0), 0);
  const avgRating = tagCourses.length > 0
    ? (tagCourses.reduce((sum, course) => sum + course.rating, 0) / tagCourses.length).toFixed(1)
    : '0.0';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner with Topic Image */}
      <div className="relative overflow-hidden">
        {/* Background Image with Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${selectedTag.image || 'https://images.unsplash.com/photo-1667984436026-99b165e3672b?w=1080'})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#1E88E5]/95 via-[#1565C0]/90 to-[#0D47A1]/85"></div>
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigateTo('home')}
            className="mb-6 text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay về trang chủ
          </Button>

          <div className="max-w-4xl">
            {/* Topic Badge */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-white/30">
              <Tag className="w-5 h-5 text-white" />
              <span className="text-white">Chủ đề</span>
            </div>

            {/* Topic Title */}
            <h1
              className="mb-6 leading-tight text-white"
              style={{
                fontSize: '3rem',
                fontWeight: 700,
              }}
            >
              {selectedTag.name}
            </h1>

            {/* Topic Description */}
            <p className="text-xl text-white/95 mb-8 max-w-2xl">
              {selectedTag.description}
            </p>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-6 text-white">
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl">{tagCourses.length}</p>
                  <p className="text-sm text-white/80">Khóa học</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl">{totalStudents.toLocaleString()}</p>
                  <p className="text-sm text-white/80">Học viên</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative gradient overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-50 to-transparent"></div>
      </div>

      {/* Courses Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filter and Sort Bar */}
        <AnimatedSection animation="fade-up">
          <Card className="mb-8 shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Filter className="w-5 h-5 text-[#1E88E5]" />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {tagCourses.length} khóa học
                    </h3>
                    <p className="text-sm text-gray-600">
                      Được tìm thấy trong chủ đề này
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">Sắp xếp:</span>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popular">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          Phổ biến nhất
                        </div>
                      </SelectItem>
                      <SelectItem value="rating">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4" />
                          Đánh giá cao
                        </div>
                      </SelectItem>
                      <SelectItem value="newest">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Mới nhất
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>

        {/* Courses Grid */}
        {loadingCourses ? (
          <div className="col-span-3 text-center py-8 text-gray-500">Đang tải khoá học...</div>
        ) : tagCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tagCourses.map((course, index) => (
              <AnimatedSection key={course.id} animation="fade-up" delay={index * 100} className="h-full">
                <div className="max-w-[420px] h-full">
                  <CourseCard
                    course={course}
                    onClick={() => {
                      setSelectedCourse(course);
                      navigateTo('course-detail');
                    }}
                    currentUserId={currentUser?.id}
                    currentRole={currentUser?.role}
                    isEnrolled={enrolledCourseIds.includes(course.id)}
                    onJoinSuccess={handleJoinSuccess}
                  />
                </div>
              </AnimatedSection>
            ))}
          </div>
        ) : (
          <AnimatedSection animation="fade-up">
            <Card>
              <CardContent className="p-12 text-center">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Chưa có khóa học nào
                </h3>
                <p className="text-gray-600 mb-6">
                  Hiện tại chưa có khóa học nào trong chủ đề này.
                </p>
                {currentUser && (
                  <Button
                    className="bg-[#1E88E5] text-white hover:bg-[#1565C0]"
                    onClick={() => navigateTo('create-course')}
                  >
                    Tạo khóa học đầu tiên
                  </Button>
                )}
              </CardContent>
            </Card>
          </AnimatedSection>
        )}
      </div>
    </div>
  );
}
