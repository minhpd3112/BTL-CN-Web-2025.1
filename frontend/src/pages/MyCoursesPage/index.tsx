import { useState } from 'react';
import { Plus, Eye, BookOpen, Search, Lock, Globe, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { mockCourses, mockEnrollments } from '@/services/mocks';
import { Course, User, Page } from '@/types';
import { AnimatedSection } from '@/utils/animations';
import { CourseListCard } from '@/components/shared/CourseListCard';

interface MyCoursesPageProps {
  navigateTo: (page: Page) => void;
  setSelectedCourse: (course: Course) => void;
  currentUser: User;
}

export function MyCoursesPage({ navigateTo, setSelectedCourse, currentUser }: MyCoursesPageProps) {
  const [enrolledCourses, setEnrolledCourses] = useState(() => {
    // Khóa học đang học - từ enrollments
    const myEnrollments = mockEnrollments.filter(e => e.userId === currentUser.id);
    return myEnrollments.map(enrollment => {
      const course = mockCourses.find(c => c.id === enrollment.courseId);
      if (!course) return null;
      return {
        ...course,
        progress: enrollment.progress,
        completedLessons: enrollment.completedLessons.length
      };
    }).filter(Boolean) as (Course & { progress: number; completedLessons: number })[];
  });

  // Khóa học tôi tạo
  const myCreatedCourses = mockCourses.filter(c => c.ownerId === currentUser.id);

  const handleLeaveCourse = (courseId: number, courseTitle: string) => {
    setEnrolledCourses(prev => prev.filter(c => c.id !== courseId));
    toast.success(`Đã rời khỏi khóa học "${courseTitle}"`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AnimatedSection animation="fade-up">
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
              Khóa học của tôi
            </h1>
          </div>
          <p className="text-gray-600 ml-11">Quản lý và theo dõi khóa học</p>
          <div className="ml-11 w-24 h-1 bg-gradient-to-r from-[#1E88E5] to-transparent rounded-full mt-2"></div>
        </div>
      </AnimatedSection>

      <Tabs defaultValue="created">
        <AnimatedSection animation="fade-up" delay={100}>
          <TabsList className="mb-6">
            <TabsTrigger value="created" className="transition-all duration-300">
              Khóa học tôi tạo ({myCreatedCourses.length})
            </TabsTrigger>
            <TabsTrigger value="enrolled" className="transition-all duration-300">
              Đang học ({enrolledCourses.length})
            </TabsTrigger>
          </TabsList>
        </AnimatedSection>

        <TabsContent value="created" className="space-y-6">
          {myCreatedCourses.length > 0 ? (
            <>
              {myCreatedCourses.map((course, index) => (
                <AnimatedSection key={course.id} animation="fade-up" delay={index * 100}>
                  <CourseListCard
                    course={course}
                    onClick={() => {
                      setSelectedCourse(course);
                      navigateTo('course-dashboard');
                    }}
                  />
                </AnimatedSection>
              ))}
            </>
          ) : (
            <AnimatedSection animation="fade-up">
              <Card>
                <CardContent className="p-12 text-center">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="mb-2">Chưa có khóa học nào</h3>
                  <p className="text-gray-600 mb-6">Bắt đầu tạo khóa học đầu tiên của bạn</p>
                  <Button
                    onClick={() => navigateTo('create-course')}
                    className="bg-[#1E88E5] text-white hover:bg-[#1565C0] scale-hover"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Tạo khóa học mới
                  </Button>
                </CardContent>
              </Card>
            </AnimatedSection>
          )}
        </TabsContent>

        <TabsContent value="enrolled" className="space-y-6">
          {enrolledCourses.length > 0 ? (
            <>
              {enrolledCourses.map((course, index) => (
                <AnimatedSection key={course.id} animation="fade-up" delay={index * 100}>
                  <CourseListCard
                    course={course}
                    showProgress={true}
                    onClick={() => {
                      setSelectedCourse(course);
                      navigateTo('learning');
                    }}
                    action={
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <LogOut className="w-4 h-4 mr-2" />
                            Rời khỏi
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Rời khỏi khóa học?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Bạn có chắc chắn muốn rời khỏi khóa học <strong>"{course.title}"</strong>?
                              <br /><br />
                              Tiến độ học tập của bạn ({course.progress}%) sẽ bị xóa và bạn sẽ cần đăng ký lại để tiếp tục.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Hủy</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLeaveCourse(course.id, course.title);
                              }}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Xác nhận rời
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    }
                  />
                </AnimatedSection>
              ))}
            </>
          ) : (
            <AnimatedSection animation="fade-up">
              <Card>
                <CardContent className="p-12 text-center">
                  <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="mb-2">Chưa tham gia khóa học nào</h3>
                  <p className="text-gray-600 mb-6">Khám phá và đăng ký các khóa học thú vị</p>
                  <Button
                    onClick={() => navigateTo('explore')}
                    variant="outline"
                    className="scale-hover"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Khám phá khóa học
                  </Button>
                </CardContent>
              </Card>
            </AnimatedSection>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default MyCoursesPage;
