import { useState } from 'react';
import { Plus, Edit, BarChart3, Eye, BookOpen, Search, Lock, Globe, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { mockCourses, mockEnrollments } from '@/services/mocks';
import { Course, User, Page } from '@/types';
import { AnimatedSection } from '@/utils/animations';

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
                  <Card 
                    className="overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer my-courses-card"
                    onClick={() => {
                      setSelectedCourse(course);
                      navigateTo('course-dashboard');
                    }}
                  >
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        <div className="relative overflow-hidden">
                          <img 
                            src={course.image} 
                            alt={course.title} 
                            className="w-full md:w-64 h-48 object-cover transition-transform duration-500 group-hover:scale-110" 
                          />
                        </div>
                      <div className="flex-1 p-6 my-courses-card-content">
                        <div className="mb-4">
                          {/* Title - Fixed height */}
                          <h3 className="mb-3 my-courses-card-title">{course.title}</h3>
                          
                          {/* Status badges - Fixed height */}
                          <div className="my-courses-card-badges mb-3">
                            {course.visibility === 'private' ? (
                              <Badge variant="secondary" className="gap-1 mr-3">
                                <Lock className="w-3 h-3" />
                                Riêng tư
                              </Badge>
                            ) : (
                              <Badge className="gap-1 mr-3">
                                <Globe className="w-3 h-3" />
                                Công khai
                              </Badge>
                            )}
                            {course.visibility === 'public' && (
                              <Badge variant={course.status === 'approved' ? 'default' : course.status === 'pending' ? 'secondary' : 'destructive'}>
                                {course.status === 'approved' ? 'Đã duyệt' : course.status === 'pending' ? 'Chờ duyệt' : 'Từ chối'}
                              </Badge>
                            )}
                          </div>
                          
                          {/* Description - Fixed height */}
                          <p className="text-gray-600 text-sm mb-3 my-courses-card-description">{course.description}</p>
                          
                          {/* Tags - Fixed height */}
                          <div className="my-courses-card-tags">
                            {course.tags.slice(0, 3).map(tag => (
                              <Badge key={tag} variant="outline">{tag}</Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="scale-hover"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCourse(course);
                              navigateTo('course-detail');
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Xem
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
                  <Card className="hover:shadow-xl transition-all duration-300 group my-courses-card">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="relative overflow-hidden cursor-pointer" onClick={() => {
                        setSelectedCourse(course);
                        navigateTo('learning');
                      }}>
                        <img 
                          src={course.image} 
                          alt={course.title} 
                          className="w-full md:w-64 h-48 object-cover transition-transform duration-500 group-hover:scale-110" 
                        />
                      </div>
                      <div className="flex-1 p-6 my-courses-card-content">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1 cursor-pointer" onClick={() => {
                            setSelectedCourse(course);
                            navigateTo('learning');
                          }}>
                            <h3 className="mb-3 my-courses-card-title">{course.title}</h3>
                            <p className="text-gray-600 text-sm mb-3">Bởi {course.ownerName}</p>
                            <div className="my-courses-card-tags">
                              {course.tags.slice(0, 3).map(tag => (
                                <Badge key={tag} variant="secondary">{tag}</Badge>
                              ))}
                            </div>
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
                                <AlertDialogCancel>Hủy</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleLeaveCourse(course.id, course.title)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Xác nhận rời
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Tiến độ</span>
                            <span className="text-[#1E88E5]">{course.progress}%</span>
                          </div>
                          <Progress value={course.progress} className="h-2" />
                          <div className="text-sm text-gray-600">
                            {course.completedLessons}/{course.lessons} mục nhỏ
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
