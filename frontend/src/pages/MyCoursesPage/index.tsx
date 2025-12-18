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
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

const ITEMS_PER_PAGE = 6;

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

  // Active tab state for animations
  const [activeTab, setActiveTab] = useState<'created' | 'enrolled'>('created');

  // Pagination states
  const [createdPage, setCreatedPage] = useState(1);
  const [enrolledPage, setEnrolledPage] = useState(1);

  // Pagination logic for created courses
  const createdTotalPages = Math.ceil(myCreatedCourses.length / ITEMS_PER_PAGE);
  const createdStartIndex = (createdPage - 1) * ITEMS_PER_PAGE;
  const paginatedCreatedCourses = myCreatedCourses.slice(createdStartIndex, createdStartIndex + ITEMS_PER_PAGE);

  // Pagination logic for enrolled courses
  const enrolledTotalPages = Math.ceil(enrolledCourses.length / ITEMS_PER_PAGE);
  const enrolledStartIndex = (enrolledPage - 1) * ITEMS_PER_PAGE;
  const paginatedEnrolledCourses = enrolledCourses.slice(enrolledStartIndex, enrolledStartIndex + ITEMS_PER_PAGE);

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

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'created' | 'enrolled')}>
        <AnimatedSection animation="fade-up" delay={100}>
          <TabsList className="mb-6 bg-[#1E88E5]/10 p-0 rounded-full h-auto inline-flex relative overflow-hidden">
            {/* Sliding indicator */}
            <div
              className="absolute top-0 bottom-0 bg-gradient-to-r from-[#1E88E5] to-[#1565C0] rounded-full shadow-lg shadow-blue-300/50 transition-all duration-300 ease-out"
              style={{
                left: activeTab === 'created' ? '0px' : '50%',
                width: '50%',
              }}
            />
            <TabsTrigger
              value="created"
              className="relative z-10 flex-1 min-w-[160px] px-6 py-2.5 rounded-full font-medium transition-all duration-300 hover:bg-[#1E88E5]/10 data-[state=active]:bg-transparent data-[state=active]:shadow-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0"
              style={{ color: activeTab === 'created' ? '#FFFFFF' : '#1E88E5' }}
            >
              Khóa học tôi tạo ({myCreatedCourses.length})
            </TabsTrigger>
            <TabsTrigger
              value="enrolled"
              className="relative z-10 flex-1 min-w-[160px] px-6 py-2.5 rounded-full font-medium transition-all duration-300 hover:bg-[#1E88E5]/10 data-[state=active]:bg-transparent data-[state=active]:shadow-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0"
              style={{ color: activeTab === 'enrolled' ? '#FFFFFF' : '#1E88E5' }}
            >
              Đang học ({enrolledCourses.length})
            </TabsTrigger>
          </TabsList>
        </AnimatedSection>

        <div className="relative overflow-hidden">
          <TabsContent
            value="created"
            className={`space-y-6 transition-all duration-400 ${activeTab === 'created'
              ? 'translate-x-0 opacity-100'
              : '-translate-x-full opacity-0 absolute inset-0'
              }`}
          >
            {myCreatedCourses.length > 0 ? (
              <>
                {paginatedCreatedCourses.map((course, index) => (
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

                {/* Created Courses Pagination */}
                {createdTotalPages > 1 && (
                  <div className="flex justify-center mt-6">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => setCreatedPage(p => Math.max(1, p - 1))}
                            className={createdPage === 1 ? 'pointer-events-none opacity-50 rounded-md' : 'cursor-pointer hover:bg-[#1E88E5]/10 rounded-md transition-colors text-[#1E88E5]'}
                          />
                        </PaginationItem>

                        {Array.from({ length: createdTotalPages }, (_, i) => i + 1).map((page) => {
                          const showPage = page === 1 || page === createdTotalPages || (page >= createdPage - 1 && page <= createdPage + 1);
                          if (!showPage) return null;

                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => setCreatedPage(page)}
                                className={createdPage === page
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
                            onClick={() => setCreatedPage(p => Math.min(createdTotalPages, p + 1))}
                            className={createdPage === createdTotalPages ? 'pointer-events-none opacity-50 rounded-md' : 'cursor-pointer hover:bg-[#1E88E5]/10 rounded-md transition-colors text-[#1E88E5]'}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
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

          <TabsContent
            value="enrolled"
            className={`space-y-6 transition-all duration-400 ${activeTab === 'enrolled'
              ? 'translate-x-0 opacity-100'
              : 'translate-x-full opacity-0 absolute inset-0'
              }`}
          >
            {enrolledCourses.length > 0 ? (
              <>
                {paginatedEnrolledCourses.map((course, index) => (
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
                              className="text-red-600 hover:!text-white hover:!bg-red-600 h-8 px-2 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <LogOut className="w-4 h-4 mr-2" />
                              Rời khỏi
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader className="space-y-3">
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
                                className="bg-red-600 hover:bg-red-700 text-white"
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

                {/* Enrolled Courses Pagination */}
                {enrolledTotalPages > 1 && (
                  <div className="flex justify-center mt-6">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => setEnrolledPage(p => Math.max(1, p - 1))}
                            className={enrolledPage === 1 ? 'pointer-events-none opacity-50 rounded-md' : 'cursor-pointer hover:bg-[#1E88E5]/10 rounded-md transition-colors text-[#1E88E5]'}
                          />
                        </PaginationItem>

                        {Array.from({ length: enrolledTotalPages }, (_, i) => i + 1).map((page) => {
                          const showPage = page === 1 || page === enrolledTotalPages || (page >= enrolledPage - 1 && page <= enrolledPage + 1);
                          if (!showPage) return null;

                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => setEnrolledPage(page)}
                                className={enrolledPage === page
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
                            onClick={() => setEnrolledPage(p => Math.min(enrolledTotalPages, p + 1))}
                            className={enrolledPage === enrolledTotalPages ? 'pointer-events-none opacity-50 rounded-md' : 'cursor-pointer hover:bg-[#1E88E5]/10 rounded-md transition-colors text-[#1E88E5]'}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
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
                      className="bg-[#1E88E5] text-white hover:bg-[#1565C0] scale-hover"
                    >
                      <Search className="w-4 h-4 mr-2" />
                      Khám phá khóa học
                    </Button>
                  </CardContent>
                </Card>
              </AnimatedSection>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

export default MyCoursesPage;
