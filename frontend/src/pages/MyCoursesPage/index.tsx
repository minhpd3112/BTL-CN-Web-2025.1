import { useState, useEffect } from 'react';
import { Plus, BookOpen, Search, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { coursesAPI, enrollmentsAPI } from '@/services/api';
import { Course, User, Page } from '@/types';
import { AnimatedSection } from '@/utils/animations';
import { CourseListCard } from '@/components/shared/CourseListCard';
import { PageHeader } from '@/components/shared/PageHeader';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

const ITEMS_PER_PAGE = 6;

interface MyCoursesPageProps {
  navigateTo: (page: Page) => void;
  setSelectedCourse: (course: Course) => void;
  currentUser: User;
}

export function MyCoursesPage({ navigateTo, setSelectedCourse, currentUser }: MyCoursesPageProps) {

  // All state declarations at the top
  const [activeTab, setActiveTab] = useState<'created' | 'enrolled'>('created');
  const [createdPage, setCreatedPage] = useState(1);
  const [enrolledPage, setEnrolledPage] = useState(1);
  const [enrolledCourses, setEnrolledCourses] = useState<(
    Course & { progress: number; completedLessons: number; enrollmentId: string }
  )[]>([]);
  const [isLoadingEnrolled, setIsLoadingEnrolled] = useState(true);
  const [myCreatedCourses, setMyCreatedCourses] = useState<Course[]>([]);
  const [isLoadingCreated, setIsLoadingCreated] = useState(true);
  const [rejectedCourses, setRejectedCourses] = useState<{ id: string, title: string, rejectionReason: string }[]>([]);
  const [reloadEnrolled, setReloadEnrolled] = useState(0);

  // Fetch courses created by current user
  useEffect(() => {
    const fetchMyCreatedCourses = async () => {
      try {
        setIsLoadingCreated(true);
        // Truyền owner_id để backend trả về tất cả khoá học của user này
        const response = await coursesAPI.getAllCourses({ owner_id: currentUser.id });

        if (response.success) {
          // Defensive: ensure response.data is an array (API trả về data: Array)
          const courseList = Array.isArray(response.data) ? response.data : [];
          // ...existing code...
          // Ẩn khoá học bị từ chối khỏi danh sách chính, nhưng lưu lại rejected để hiển thị lý do
          const rejectedCourses = courseList.filter((course: any) => course.status === 'rejected');
          const mappedCourses = courseList
            .filter((course: any) => course.status !== 'rejected')
            .map((course: any) => ({
              id: course.id,
              title: course.title,
              description: course.description || '',
              image: course.image_url || '/placeholder-course.jpg',
              ownerId: course.owner_id,
              ownerName: course.owner?.full_name || currentUser.name,
              ownerAvatar: course.owner?.avatar_url || currentUser.avatar,
              tags: course.tags?.map((t: any) => t.tag?.name).filter(Boolean) || [],
              visibility: course.visibility as 'public' | 'private',
              status: course.status,
              studentsCount: course.students || course.studentsCount || course.total_students || course.enrolled_count || 0,
              students: course.students || course.studentsCount || course.total_students || course.enrolled_count || 0,
              rating: course.rating || 0,
              lessonsCount: course.lessons || 0,
              rejectionReason: course.rejection_reason || '',
            }));
          setMyCreatedCourses(mappedCourses);
          setRejectedCourses(rejectedCourses.map((course: any) => ({
            id: course.id,
            title: course.title,
            rejectionReason: course.rejection_reason || '',
          })));
        }
      } catch (error) {
        console.error('Failed to fetch created courses:', error);
        toast.error('Không thể tải khóa học của bạn');
      } finally {
        setIsLoadingCreated(false);
      }
    };

    fetchMyCreatedCourses();
  }, [currentUser.id, currentUser.name, currentUser.avatar]);

  // Fetch enrolled courses
  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        setIsLoadingEnrolled(true);
        const response = await enrollmentsAPI.getMyEnrollments();

        if (response.success && response.data) {
          // Map enrollments to course format, include enrollmentId
          const courses = response.data
            .filter((e: any) => e.status === 'approved' && e.course)
            .map((enrollment: any) => ({
              id: enrollment.course.id,
              title: enrollment.course.title,
              description: enrollment.course.description || '',
              image: enrollment.course.image_url || '/placeholder-course.jpg',
              ownerId: enrollment.course.owner_id,
              ownerName: enrollment.course.owner?.full_name || 'Unknown',
              ownerAvatar: enrollment.course.owner?.avatar_url || '',
              tags: enrollment.course.tags?.map((t: any) => t.tag?.name).filter(Boolean) || [],
              visibility: enrollment.course.visibility as 'public' | 'private',
              status: enrollment.course.status,
              studentsCount: enrollment.course.students || enrollment.course.studentsCount || enrollment.course.total_students || enrollment.course.enrolled_count || 0,
              students: enrollment.course.students || enrollment.course.studentsCount || enrollment.course.total_students || enrollment.course.enrolled_count || 0,
              rating: enrollment.course.rating || 0,
              lessonsCount: enrollment.progress?.total || 0,
              progress: enrollment.progress?.percentage || 0,
              completedLessons: enrollment.progress?.completed || 0,
              enrollmentId: enrollment.id, // Store enrollmentId
            }));
          setEnrolledCourses(courses);
          // ...existing code...
        }
      } catch (error) {
        console.error('Failed to fetch enrolled courses:', error);
        toast.error('Không thể tải khóa học đang học');
      } finally {
        setIsLoadingEnrolled(false);
      }
    };

    fetchEnrolledCourses();
  }, [currentUser.id, reloadEnrolled]);

  // Khi chuyển sang tab "enrolled" thì reload danh sách
  useEffect(() => {
    if (activeTab === 'enrolled') {
      setReloadEnrolled(r => r + 1);
    }
  }, [activeTab]);

  // Active tab state for animations
  // (Removed duplicate declaration of activeTab)

  // Pagination states
  // (Removed duplicate declaration of createdPage)
  // (Removed duplicate declaration of enrolledPage)


  // Pagination logic for created courses
  const createdTotalPages = Math.ceil(myCreatedCourses.length / ITEMS_PER_PAGE);
  const createdStartIndex = (createdPage - 1) * ITEMS_PER_PAGE;
  const paginatedCreatedCourses = myCreatedCourses.slice(createdStartIndex, createdStartIndex + ITEMS_PER_PAGE);

  // Pagination logic for enrolled courses
  const enrolledTotalPages = Math.ceil(enrolledCourses.length / ITEMS_PER_PAGE);
  const enrolledStartIndex = (enrolledPage - 1) * ITEMS_PER_PAGE;
  const paginatedEnrolledCourses = enrolledCourses.slice(enrolledStartIndex, enrolledStartIndex + ITEMS_PER_PAGE);

  // Use enrollmentId for leaveCourse
  const handleLeaveCourse = async (enrollmentId: string, courseId: string, courseTitle: string) => {
    try {
      await enrollmentsAPI.leaveCourse(enrollmentId);
      setEnrolledCourses(prev => prev.filter(c => c.enrollmentId !== enrollmentId));
      toast.success(`Đã rời khỏi khóa học "${courseTitle}"`);
      setReloadEnrolled(r => r + 1); // reload lại danh sách
    } catch (error) {
      toast.error('Rời khoá học thất bại. Vui lòng thử lại!');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AnimatedSection animation="fade-up">
        <PageHeader
          icon={<BookOpen className="w-8 h-8" />}
          title="Khóa học của tôi"
          description="Quản lý và theo dõi khóa học"
        />
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
            {isLoadingCreated ? (
              <AnimatedSection animation="fade-up">
                <Card>
                  <CardContent className="p-12 text-center">
                    <div className="w-16 h-16 border-4 border-[#1E88E5] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải khóa học...</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ) : myCreatedCourses.length > 0 ? (
              <>
                {paginatedCreatedCourses.map((course, index) => (
                  <AnimatedSection key={course.id} animation="fade-up" delay={index * 100}>
                    <CourseListCard
                      course={course}
                      onClick={() => {
                        setSelectedCourse(course);
                        navigateTo('course-dashboard');
                      }}
                      disableInvite={course.status !== 'approved'}
                    />
                  </AnimatedSection>
                ))}
                {/* Hiển thị rejected courses với lý do từ chối */}
                {rejectedCourses.length > 0 && (
                  <div className="mt-8">
                    <h4 className="font-semibold text-red-600 mb-2">Khoá học bị từ chối</h4>
                    {rejectedCourses.map(rc => (
                      <Card key={rc.id} className="mb-4 border-red-200">
                        <CardContent className="p-4">
                          <div className="font-medium text-gray-900">{rc.title}</div>
                          <div className="text-sm text-red-600 mt-1">Lý do từ chối: {rc.rejectionReason || 'Không có lý do'}</div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
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
            {isLoadingEnrolled ? (
              <AnimatedSection animation="fade-up">
                <Card>
                  <CardContent className="p-12 text-center">
                    <div className="w-16 h-16 border-4 border-[#1E88E5] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải khóa học...</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ) : enrolledCourses.length > 0 ? (
              <>
                {paginatedEnrolledCourses.map((course, index) => (
                  <AnimatedSection key={course.enrollmentId} animation="fade-up" delay={index * 100}>
                    <CourseListCard
                      course={course}
                      showProgress={true}
                      onClick={() => {
                        setSelectedCourse(course);
                        navigateTo('course-detail');
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
                                  handleLeaveCourse(course.enrollmentId, course.id, course.title);
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
