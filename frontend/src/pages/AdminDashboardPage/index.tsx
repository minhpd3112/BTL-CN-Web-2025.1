import { BarChart3, BookOpen, Users, FileCheck, Clock, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Page } from '@/types';
import { AnimatedSection } from '@/utils/animations';
import { StatsCounter } from '@/components/shared/StatsCounter';
import { PageHeader } from '@/components/shared/PageHeader';
import { mockCourses, mockUsers } from '@/services/mocks';
import './styles.css';

interface AdminDashboardPageProps {
  navigateTo: (page: Page) => void;
}

export function AdminDashboardPage({ navigateTo }: AdminDashboardPageProps) {
  // Mock stats
  const stats = {
    totalCourses: mockCourses.length,
    totalUsers: mockUsers.length,
    pendingCourses: mockCourses.filter(c => c.status === 'pending').length,
    approvedCourses: mockCourses.filter(c => c.status === 'approved').length,
  };

  // Recent activities
  const recentActivities = [
    { id: 1, type: 'course_created', user: 'Nguyễn Văn A', action: 'tạo khóa học mới', course: 'Lập trình React', time: '5 phút trước' },
    { id: 2, type: 'course_pending', user: 'Trần Thị B', action: 'gửi yêu cầu duyệt khóa học', course: 'UI/UX Design', time: '1 giờ trước' },
    { id: 3, type: 'user_enrolled', user: 'Lê Văn C', action: 'đăng ký khóa học', course: 'Python Cơ bản', time: '2 giờ trước' },
    { id: 4, type: 'course_approved', user: 'Admin', action: 'duyệt khóa học', course: 'Java Spring Boot', time: '3 giờ trước' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 pt-8 pb-6">
      <AnimatedSection animation="fade-up">
        <PageHeader
          icon={<BarChart3 className="w-8 h-8" />}
          title="Admin Dashboard"
          description="Quản lý và giám sát hệ thống EduLearn"
        />
      </AnimatedSection>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <AnimatedSection animation="fade-up" delay={100}>
          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-[#1E88E5] overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none">
              <BookOpen className="w-24 h-24 text-[#1E88E5]" />
            </div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tổng khóa học</p>
                  <p className="text-3xl font-bold text-gray-900"><StatsCounter end={stats.totalCourses} /></p>
                </div>
                <div className="w-12 h-12 bg-[#1E88E5] rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                  <BookOpen className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>

        <AnimatedSection animation="fade-up" delay={150}>
          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-indigo-500 overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none">
              <Users className="w-24 h-24 text-indigo-500" />
            </div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tổng người dùng</p>
                  <p className="text-3xl font-bold text-gray-900"><StatsCounter end={stats.totalUsers} /></p>
                </div>
                <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                  <Users className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>

        <AnimatedSection animation="fade-up" delay={200}>
          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-orange-500 overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none">
              <Clock className="w-24 h-24 text-orange-500" />
            </div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Yêu cầu chờ duyệt</p>
                  <div className="flex items-center gap-2">
                    <p className="text-3xl font-bold text-gray-900"><StatsCounter end={stats.pendingCourses} /></p>
                  </div>
                </div>
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-500/30 relative">
                  <Clock className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>
      </div>

      {/* Recent Activities - Full Width */}
      <AnimatedSection animation="fade-up" delay={300}>
        <Card className="hover:shadow-lg transition-all duration-300 mb-6 border border-gray-200">
          <CardHeader className="border-b border-gray-100 pb-4 bg-blue-50/50">
            <CardTitle className="text-lg font-bold text-[#1E88E5]">Hoạt động gần đây</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-2">
              {recentActivities.map((activity, index) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-all duration-200">
                  <div className="w-2 h-2 rounded-full bg-[#1E88E5] mt-2 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-semibold text-gray-900">{activity.user}</span>{' '}
                      <span className="text-gray-600">{activity.action}</span>{' '}
                      <span className="font-semibold text-[#1E88E5]">{activity.course}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </AnimatedSection>

      {/* Quick Actions */}
      <AnimatedSection animation="fade-up" delay={350}>
        <Card className="hover:shadow-lg transition-all duration-300 border border-gray-200">
          <CardHeader className="border-b border-gray-100 pb-4 bg-blue-50/50">
            <CardTitle className="text-lg font-bold text-[#1E88E5]">Quản lý nhanh</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="justify-start h-auto py-3 px-4 border border-gray-200 hover:border-[#1E88E5] hover:bg-[#1E88E5]/5 transition-all duration-200"
                onClick={() => navigateTo('approve-courses')}
              >
                <FileCheck className="w-5 h-5 text-[#1E88E5] mr-3" />
                <div className="flex-1 text-left">
                  <p className="font-semibold text-sm text-gray-900">Duyệt khóa học</p>
                  <p className="text-xs text-gray-500">Xét duyệt nội dung</p>
                </div>

              </Button>
              <Button
                variant="outline"
                className="justify-start h-auto py-3 px-4 border border-gray-200 hover:border-[#1E88E5] hover:bg-[#1E88E5]/5 transition-all duration-200"
                onClick={() => navigateTo('manage-courses')}
              >
                <BookOpen className="w-5 h-5 text-[#1E88E5] mr-3" />
                <div className="flex-1 text-left">
                  <p className="font-semibold text-sm text-gray-900">Quản lý khóa học</p>
                  <p className="text-xs text-gray-500">Xem & chỉnh sửa</p>
                </div>
              </Button>
              <Button
                variant="outline"
                className="justify-start h-auto py-3 px-4 border border-gray-200 hover:border-[#1E88E5] hover:bg-[#1E88E5]/5 transition-all duration-200"
                onClick={() => navigateTo('manage-users')}
              >
                <Users className="w-5 h-5 text-[#1E88E5] mr-3" />
                <div className="flex-1 text-left">
                  <p className="font-semibold text-sm text-gray-900">Quản lý người dùng</p>
                  <p className="text-xs text-gray-500">Xem thông tin</p>
                </div>
              </Button>
              <Button
                variant="outline"
                className="justify-start h-auto py-3 px-4 border border-gray-200 hover:border-[#1E88E5] hover:bg-[#1E88E5]/5 transition-all duration-200"
                onClick={() => navigateTo('manage-tags')}
              >
                <Tag className="w-5 h-5 text-[#1E88E5] mr-3" />
                <div className="flex-1 text-left">
                  <p className="font-semibold text-sm text-gray-900">Quản lý chủ đề</p>
                  <p className="text-xs text-gray-500">Danh mục & tags</p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </AnimatedSection>
    </div>
  );
}

export default AdminDashboardPage;
