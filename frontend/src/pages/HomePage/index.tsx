import { Search, Plus, TrendingUp, BookOpen, Users, Tag, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CourseCard } from '@/components/shared/CourseCard';
// import { mockCourses, mockTags } from '@/services/mocks';
import { coursesAPI, tagsAPI } from '@/services/api';
import { Course, User, Page, Tag as TagType } from '@/types';
import { AnimatedSection } from '@/utils/animations';
import { StatsCounter } from '@/components/shared/StatsCounter';
import { Snowfall } from '@/components/christmas/Snowfall';
import { ChristmasCardWrapper } from '@/components/christmas/ChristmasCardWrapper';
import { ChristmasHeroSection } from '@/components/christmas/ChristmasHeroSection';
import './styles.css';
import Lottie from 'lottie-react';
import hatAnimation from '@/components/christmas/Christmas hat.json';
import { useState, useEffect } from 'react';
import { enrollmentsAPI } from '@/services/api';

interface HomePageProps {
  navigateTo: (page: Page) => void;
  setSelectedCourse: (course: Course) => void;
  currentUser: User | null;
  setSelectedTag: (tag: TagType) => void;
}

export function HomePage({ navigateTo, setSelectedCourse, currentUser, setSelectedTag }: HomePageProps) {
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);


  // State for real courses and tags
  const [publicCourses, setPublicCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [allTags, setAllTags] = useState<TagType[]>([]);
  const [loadingTags, setLoadingTags] = useState(true);

  // Debug: log publicCourses when it changes
  useEffect(() => {
    if (!loadingCourses) {
      // ...existing code...
    }
  }, [publicCourses, loadingCourses]);
  // Fetch all tags from backend
  useEffect(() => {
    setLoadingTags(true);
    tagsAPI.getAllTags()
      .then((res: any) => {
        if (Array.isArray(res.data)) {
          setAllTags(res.data);
        } else if (Array.isArray(res)) {
          setAllTags(res);
        } else {
          setAllTags([]);
        }
      })
      .catch(() => setAllTags([]))
      .finally(() => setLoadingTags(false));
  }, []);

  // Fetch public, approved courses from backend
  useEffect(() => {
    setLoadingCourses(true);
    coursesAPI.getAllCourses()
      .then((res: any) => {
        if (Array.isArray(res.data)) {
          const filtered = res.data.filter((c: Course) => c.visibility === 'public' && c.status === 'approved');
          setPublicCourses(filtered);
        } else if (Array.isArray(res)) {
          // fallback if API returns array directly
          const filtered = res.filter((c: Course) => c.visibility === 'public' && c.status === 'approved');
          setPublicCourses(filtered);
        } else {
          setPublicCourses([]);
        }
      })
      .catch(() => setPublicCourses([]))
      .finally(() => setLoadingCourses(false));
  }, []);

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

  // Calculate course count for each tag and sort
  const tagsWithCourseCount = allTags.map(tag => {
    const courseCount = publicCourses.filter(course => {
      // Check if course has this tag (assuming course_tags or similar structure)
      return course.tags?.some((t: any) => t.id === tag.id);
    }).length;
    return { ...tag, courseCount };
  }).sort((a, b) => b.courseCount - a.courseCount).slice(0, 8);

  return (
    <div>
      {/* Hero Banner */}
      <div className="relative overflow-hidden">
        {/* Background Image with Overlay */}

        <Snowfall />
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://sohocmattroi.com/wp-content/uploads/2022/12/hinh-anh-truyen-cam-hung-hoc-tap-dep.jpg)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#1E88E5]/95 via-[#1565C0]/90 to-[#0D47A1]/85"></div>
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-4xl">
            {/* Main Heading with Gradient Effect */}
            <h1 className="home-hero-title mb-6 leading-tight">
              Học tập không giới hạ
              <span className="relative inline-block">
                n
                <div className="absolute w-24 h-24 pointer-events-none z-10" style={{ top: '5px', left: '-22px', transform: 'rotate(-15deg)' }}>
                  <Lottie animationData={hatAnimation} loop={true} />
                </div>
              </span>
              <br />
              <span className="home-hero-title-accent">
                cùng EduLearn
              </span>
            </h1>

            {/* Subtitle with better styling */}
            <p className="home-hero-subtitle mb-10 text-white/95 max-w-2xl">
              Tạo khóa học của riêng bạn hoặc khám phá hàng ngàn khóa học chất lượng cao từ cộng đồng.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="bg-white text-[#1E88E5] hover:bg-gray-50 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                style={{ fontSize: '1.125rem', padding: '1.5rem 2rem' }}
                onClick={() => navigateTo('explore')}
              >
                <Search className="w-5 h-5 mr-2" />
                Khám phá khóa học
              </Button>
              {currentUser?.role !== 'admin' && (
                <>
                  <Button
                    size="lg"
                    className="bg-white text-[#1E88E5] hover:bg-gray-50 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                    style={{ fontSize: '1.125rem', padding: '1.5rem 2rem' }}
                    onClick={() => navigateTo('create-course')}
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Tạo khóa học
                  </Button>
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                    style={{ fontSize: '1.125rem', padding: '1.5rem 2rem' }}
                    onClick={() => navigateTo('ai-learning-path')}
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Tạo lộ trình AI
                  </Button>
                </>
              )}
            </div>
          </div >
        </div >

        {/* Decorative gradient overlay at bottom */}
        < div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" ></div >
      </div >


      {/* Christmas Countdown Section */}
      < ChristmasHeroSection />

      {/* Featured Courses */}
      < div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" >
        <AnimatedSection animation="fade-up">
          <div className="flex items-center justify-between mb-12">
            <div className="relative">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-[#1E88E5]" />
                <h2 className="home-section-title relative">
                  Khóa học nổi bật
                </h2>
              </div>
              <div className="absolute -bottom-2 left-0 w-24 h-1 bg-gradient-to-r from-[#1E88E5] to-transparent rounded-full"></div>
            </div>
            <Button variant="ghost" className="text-[#1E88E5] scale-hover" onClick={() => navigateTo('explore')}>
              Xem tất cả
              <TrendingUp className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </AnimatedSection>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 home-course-grid">
          {loadingCourses ? (
            <div className="col-span-3 text-center py-8 text-gray-500">Đang tải khoá học...</div>
          ) : publicCourses.length === 0 ? (
            <div className="col-span-3 text-center py-8 text-gray-500">Không có khoá học nổi bật nào.</div>
          ) : (
            [...publicCourses]
              .sort((a, b) => (b.students || 0) - (a.students || 0))
              .slice(0, 6)
              .map((course, index) => (
              <AnimatedSection key={course.id} animation="fade-up" delay={index * 100} className="h-full">
                <ChristmasCardWrapper>
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
                </ChristmasCardWrapper>
              </AnimatedSection>
            ))
          )}
        </div>
      </div >

      {/* Categories */}
      < div className="bg-white" >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <AnimatedSection animation="fade-up">
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-2">
                <Tag className="w-8 h-8 text-[#1E88E5]" />
                <h2 className="home-section-title relative">
                  Chủ đề nổi bật nhất
                </h2>
              </div>
              <div className="w-24 h-1 bg-gradient-to-r from-[#1E88E5] to-transparent rounded-full"></div>
            </div>
          </AnimatedSection>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {loadingTags ? (
              <div className="col-span-4 text-center py-8 text-gray-500">Đang tải chủ đề...</div>
            ) : tagsWithCourseCount.length === 0 ? (
              <div className="col-span-4 text-center py-8 text-gray-500">Không có chủ đề nào.</div>
            ) : (
              tagsWithCourseCount.map((tag, index) => (
                <AnimatedSection key={tag.id} animation="fade-up" delay={index * 50}>
                  <Card
                    className="home-category-card cursor-pointer"
                    onClick={() => {
                      setSelectedTag(tag);
                      navigateTo('tag-detail');
                    }}
                  >
                    <CardContent className="p-6 text-center">
                      <Tag className="home-category-icon w-8 h-8 text-[#1E88E5] mx-auto mb-3" />
                      <div className="home-category-text">{tag.name}</div>
                      <div className="text-sm text-gray-500 mt-2">{tag.courseCount} khóa học</div>
                    </CardContent>
                  </Card>
                </AnimatedSection>
              ))
            )}
          </div>
        </div>
      </div >
    </div >
  );
}
