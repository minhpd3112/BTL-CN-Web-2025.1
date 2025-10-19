import { Search, Plus, TrendingUp, BookOpen, Users, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CourseCard } from '@/components/shared/CourseCard';
import { mockCourses, mockTags } from '@/services/mocks';
import { Course, User, Page, Tag as TagType } from '@/types';
import { AnimatedSection } from '@/utils/animations';
import { StatsCounter } from '@/components/shared/StatsCounter';
import './styles.css';

interface HomePageProps {
  navigateTo: (page: Page) => void;
  setSelectedCourse: (course: Course) => void;
  currentUser: User | null;
  setSelectedTag: (tag: TagType) => void;
}

export function HomePage({ navigateTo, setSelectedCourse, currentUser, setSelectedTag }: HomePageProps) {
  // Chỉ hiển thị khóa public đã approved
  const publicCourses = mockCourses.filter(c => c.visibility === 'public' && c.status === 'approved');

  return (
    <div>
      {/* Hero Banner */}
      <div className="relative overflow-hidden">
        {/* Background Image with Overlay */}
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
              Học tập không giới hạn
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
              <Button 
                size="lg" 
                className="bg-white text-[#1E88E5] hover:bg-gray-50 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                style={{ fontSize: '1.125rem', padding: '1.5rem 2rem' }}
                onClick={() => navigateTo('create-course')}
              >
                <Plus className="w-5 h-5 mr-2" />
                Tạo khóa học
              </Button>
            </div>
          </div>
        </div>
        
        {/* Decorative gradient overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent"></div>
      </div>

      {/* Statistics Section */}
      <div className="relative -mt-12 z-10 overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1E88E5] via-[#1565C0] to-[#0D47A1]">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <AnimatedSection animation="fade-up">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-white text-center">
              {/* Người dùng */}
              <div className="flex flex-col items-center gap-3 group">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-white/30 to-white/10 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 border border-white/20">
                    <Users className="w-8 h-8 transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <div className="absolute -inset-2 bg-white/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div>
                  <div className="home-stats-counter mb-1">
                    <StatsCounter end={10000} suffix="+" />
                  </div>
                  <p className="text-white/90 font-medium">Người dùng</p>
                </div>
              </div>

              {/* Khóa học */}
              <div className="flex flex-col items-center gap-3 group">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-white/30 to-white/10 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 border border-white/20">
                    <BookOpen className="w-8 h-8 transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <div className="absolute -inset-2 bg-white/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div>
                  <div className="home-stats-counter mb-1">
                    <StatsCounter end={500} suffix="+" />
                  </div>
                  <p className="text-white/90 font-medium">Khóa học</p>
                </div>
              </div>

              {/* Chủ đề */}
              <div className="flex flex-col items-center gap-3 group col-span-2 md:col-span-1">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-white/30 to-white/10 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 border border-white/20">
                    <Tag className="w-8 h-8 transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <div className="absolute -inset-2 bg-white/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div>
                  <div className="home-stats-counter mb-1">
                    <StatsCounter end={100} suffix="+" />
                  </div>
                  <p className="text-white/90 font-medium">Chủ đề</p>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>

      {/* Featured Courses */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
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
          {publicCourses.slice(0, 6).map((course, index) => (
            <AnimatedSection key={course.id} animation="fade-up" delay={index * 100}>
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
      </div>

      {/* Categories */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <AnimatedSection animation="fade-up">
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-3">
                <Tag className="w-8 h-8 text-[#1E88E5]" />
                <h2 className="home-section-title relative">
                  Khám phá theo chủ đề
                </h2>
              </div>
              <p className="text-gray-600 ml-11">Tìm kiếm kiến thức trong lĩnh vực bạn quan tâm</p>
              <div className="ml-11 w-24 h-1 bg-gradient-to-r from-[#1E88E5] to-transparent rounded-full mt-2"></div>
            </div>
          </AnimatedSection>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Lập trình', 'Thiết kế', 'Data Science', 'Marketing', 'Kinh doanh', 'Python', 'UI/UX', 'Mobile'].map((category, index) => {
              const tag = mockTags.find(t => t.name === category);
              return (
                <AnimatedSection key={category} animation="fade-up" delay={index * 50}>
                  <Card 
                    className="home-category-card cursor-pointer"
                    onClick={() => {
                      if (tag) {
                        setSelectedTag(tag);
                        navigateTo('tag-detail');
                      }
                    }}
                  >
                    <CardContent className="p-6 text-center">
                      <Tag className="home-category-icon w-8 h-8 text-[#1E88E5] mx-auto mb-3" />
                      <div className="home-category-text">{category}</div>
                    </CardContent>
                  </Card>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
