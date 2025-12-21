import { useState } from 'react';
import { BookOpen, Users, Star, Calendar, Mail, Phone, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { CourseListCard } from '@/components/shared/CourseListCard';
import { mockCourses } from '@/services/mocks';
import { User, Page, Course } from '@/types';

const COURSES_PER_PAGE = 5;

interface UserDetailPageProps {
  user: User;
  navigateTo: (page: Page) => void;
  setSelectedCourse?: (course: Course) => void;
}

export function UserDetailPage({ user, navigateTo, setSelectedCourse }: UserDetailPageProps) {
  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-600">Không tìm thấy thông tin người dùng</p>
            <Button className="mt-4" onClick={() => navigateTo('manage-users')}>
              Quay lại danh sách
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get user's courses
  const userCourses = mockCourses.filter(c => c.ownerId === user.id);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(userCourses.length / COURSES_PER_PAGE);
  const startIndex = (currentPage - 1) * COURSES_PER_PAGE;
  const paginatedCourses = userCourses.slice(startIndex, startIndex + COURSES_PER_PAGE);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">


      {/* User Profile Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Avatar */}
            <div className="relative mx-auto md:mx-0">
              <Avatar className="w-24 h-24 ring-4 ring-[#1E88E5]/20">
                <AvatarFallback className="text-3xl bg-gradient-to-br from-[#1E88E5] to-[#0D47A1] text-white font-bold">
                  {user.avatar}
                </AvatarFallback>
              </Avatar>
              {user.status === 'active' && (
                <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-3 border-white" />
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <Badge
                    className={user.role === 'admin'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-gray-100 text-gray-600'
                    }
                  >
                    {user.role === 'admin' ? 'Admin' : 'User'}
                  </Badge>
                  {user.status === 'active' && (
                    <Badge className="bg-green-100 text-green-700">
                      Đang hoạt động
                    </Badge>
                  )}
                </div>
              </div>

              {/* Bio */}
              {user.bio && (
                <p className="text-gray-600 mb-4">{user.bio}</p>
              )}

              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4 text-[#1E88E5]" />
                  <span className="truncate">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4 text-[#1E88E5]" />
                    <span>{user.phone}</span>
                  </div>
                )}
                {user.location && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4 text-[#1E88E5]" />
                    <span>{user.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4 text-[#1E88E5]" />
                  <span>Tham gia: {user.joinedDate}</span>
                </div>
              </div>

              {/* Last Login */}
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-3">
                <Clock className="w-4 h-4" />
                <span>Đăng nhập gần đây: {user.lastLogin}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards - Dashboard Style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-[#1E88E5] overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none">
            <BookOpen className="w-24 h-24 text-[#1E88E5]" />
          </div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Khóa học đã tạo</p>
                <p className="text-3xl font-bold text-gray-900">{user.coursesCreated}</p>
              </div>
              <div className="w-12 h-12 bg-[#1E88E5] rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-green-500 overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none">
            <Users className="w-24 h-24 text-green-500" />
          </div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tổng học viên</p>
                <p className="text-3xl font-bold text-gray-900">{user.totalStudents}</p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-green-500/30">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-yellow-500 overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none">
            <Star className="w-24 h-24 text-yellow-500" />
          </div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Đánh giá TB</p>
                <p className="text-3xl font-bold text-gray-900">4.7</p>
              </div>
              <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-yellow-500/30">
                <Star className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses Created */}
      <Card>
        <CardHeader className="border-b border-gray-100 pb-4 bg-blue-50/50">
          <CardTitle className="text-lg font-bold text-[#1E88E5]">Khóa học đã tạo </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {userCourses.length > 0 ? (
            <div className="space-y-4">
              {paginatedCourses.map(course => (
                <CourseListCard
                  key={course.id}
                  course={course}
                  onClick={() => {
                    if (setSelectedCourse) {
                      setSelectedCourse(course);
                      navigateTo('course-detail');
                    }
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>Chưa tạo khóa học nào</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50 rounded-md' : 'cursor-pointer hover:bg-[#1E88E5]/10 rounded-md transition-colors text-[#1E88E5]'}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
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

                    if (showPage) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                            className={`cursor-pointer rounded-md transition-colors ${currentPage === page
                              ? '!bg-[#1E88E5] !text-white hover:!bg-[#1565C0] border-none'
                              : 'hover:bg-[#1E88E5]/10 text-[#1E88E5]'
                              }`}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                    return null;
                  })}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50 rounded-md' : 'cursor-pointer hover:bg-[#1E88E5]/10 rounded-md transition-colors text-[#1E88E5]'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
