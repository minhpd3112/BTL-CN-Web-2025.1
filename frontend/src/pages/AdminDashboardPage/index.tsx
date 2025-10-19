import { BarChart3, BookOpen, Users, FileCheck, Clock, Tag } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Page } from '@/types';
import { AnimatedSection } from '@/utils/animations';
import { StatsCounter } from '@/components/shared/StatsCounter';
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
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <BarChart3 className="w-8 h-8 text-[#1E88E5]" />
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
              Admin Dashboard
            </h1>
          </div>
          <p className="text-gray-600 ml-11">Quản lý và giám sát hệ thống EduLearn</p>
          <div className="ml-11 w-24 h-1 bg-gradient-to-r from-[#1E88E5] to-transparent rounded-full mt-2"></div>
        </div>
      </AnimatedSection>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <AnimatedSection animation="fade-up" delay={100}>
          <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Tổng khóa học</p>
                  <p className="text-3xl"><StatsCounter end={stats.totalCourses} /></p>
                  <p className="text-sm text-gray-400 mt-1">+12% so với tháng trước</p>
                </div>
                <div className="w-12 h-12 bg-[#1E88E5]/10 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-[#1E88E5]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>

        <AnimatedSection animation="fade-up" delay={150}>
          <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Tổng người dùng</p>
                  <p className="text-3xl"><StatsCounter end={stats.totalUsers} /></p>
                  <p className="text-sm text-gray-400 mt-1">+8% so với tháng trước</p>
                </div>
                <div className="w-12 h-12 bg-[#1E88E5]/10 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-[#1E88E5]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>

        <AnimatedSection animation="fade-up" delay={200}>
          <Card className={`hover:shadow-lg transition-all duration-200 hover:-translate-y-1 ${stats.pendingCourses > 0 ? 'border-[#1E88E5] border-2' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Chờ duyệt</p>
                  <p className="text-3xl text-[#1E88E5]"><StatsCounter end={stats.pendingCourses} /></p>
                  <Button 
                    variant="link" 
                    className="text-sm p-0 h-auto text-[#1E88E5] mt-1"
                    onClick={() => navigateTo('approve-courses')}
                  >
                    Xem ngay →
                  </Button>
                </div>
                <div className="w-12 h-12 bg-[#1E88E5]/10 rounded-lg flex items-center justify-center relative">
                  <Clock className="w-6 h-6 text-[#1E88E5]" />
                  {stats.pendingCourses > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#1E88E5] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {stats.pendingCourses}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>

        <AnimatedSection animation="fade-up" delay={250}>
          <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Đã duyệt</p>
                  <p className="text-3xl text-[#1E88E5]"><StatsCounter end={stats.approvedCourses} /></p>
                  <p className="text-sm text-gray-400 mt-1">{Math.round(stats.approvedCourses / stats.totalCourses * 100)}% tổng số</p>
                </div>
                <div className="w-12 h-12 bg-[#1E88E5]/10 rounded-lg flex items-center justify-center">
                  <FileCheck className="w-6 h-6 text-[#1E88E5]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>
      </div>

      {/* Recent Activities - Full Width */}
      <AnimatedSection animation="fade-up" delay={300}>
        <Card className="hover:shadow-lg transition-all duration-300 mb-6 border border-gray-200">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-lg">Hoạt động gần đây</CardTitle>
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
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-lg">Quản lý nhanh</CardTitle>
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
                {stats.pendingCourses > 0 && (
                  <span className="ml-2 bg-[#1E88E5] text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                    {stats.pendingCourses}
                  </span>
                )}
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
