import { BookOpen, Users, Clock, CheckCircle, Plus, UserPlus, FileCheck, Tag, Settings } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { mockCourses, mockUsers } from '../../data';
import { Page } from '../../types';

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
    { id: 1, type: 'course_created', user: 'Nguyá»…n VÄƒn A', action: 'táº¡o khÃ³a há»c má»›i', course: 'Láº­p trÃ¬nh React', time: '5 phÃºt trÆ°á»›c', icon: 'plus', color: 'text-blue-500' },
    { id: 2, type: 'course_pending', user: 'Tráº§n Thá»‹ B', action: 'gá»­i yÃªu cáº§u duyá»‡t khÃ³a há»c', course: 'UI/UX Design', time: '1 giá» trÆ°á»›c', icon: 'clock', color: 'text-orange-500' },
    { id: 3, type: 'user_enrolled', user: 'LÃª VÄƒn C', action: 'Ä‘Äƒng kÃ½ khÃ³a há»c', course: 'Python CÆ¡ báº£n', time: '2 giá» trÆ°á»›c', icon: 'user', color: 'text-gray-500' },
    { id: 4, type: 'course_approved', user: 'Admin', action: 'duyá»‡t khÃ³a há»c', course: 'Java Spring Boot', time: '3 giá» trÆ°á»›c', icon: 'check', color: 'text-green-500' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Quáº£n lÃ½ vÃ  giÃ¡m sÃ¡t há»‡ thá»‘ng EduLearn</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tá»•ng khÃ³a há»c</p>
                <p className="text-3xl">{stats.totalCourses}</p>
                <p className="text-sm text-green-600 mt-1">â†‘ +12% so vá»›i thÃ¡ng trÆ°á»›c</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-[#1E88E5]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tá»•ng ngÆ°á»i dÃ¹ng</p>
                <p className="text-3xl">{stats.totalUsers}</p>
                <p className="text-sm text-green-600 mt-1">â†‘ +8% so vá»›i thÃ¡ng trÆ°á»›c</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={stats.pendingCourses > 0 ? 'border-orange-500 border-2' : ''}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Chá» duyá»‡t</p>
                <p className="text-3xl text-orange-500">{stats.pendingCourses}</p>
                <Button 
                  variant="link" 
                  className="text-sm p-0 h-auto text-[#1E88E5] mt-1"
                  onClick={() => navigateTo('approve-courses')}
                >
                  Xem ngay â†’
                </Button>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center relative">
                <Clock className="w-6 h-6 text-orange-500" />
                {stats.pendingCourses > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {stats.pendingCourses}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">ÄÃ£ duyá»‡t</p>
                <p className="text-3xl text-green-600">{stats.approvedCourses}</p>
                <p className="text-sm text-gray-500 mt-1">{Math.round(stats.approvedCourses / stats.totalCourses * 100)}% tá»•ng sá»‘</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Activities */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Hoáº¡t Ä‘á»™ng gáº§n Ä‘Ã¢y</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map(activity => (
                <div key={activity.id} className="flex items-start gap-3 pb-4 border-b last:border-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    activity.icon === 'check' ? 'bg-green-100' :
                    activity.icon === 'clock' ? 'bg-orange-100' :
                    activity.icon === 'plus' ? 'bg-blue-100' :
                    'bg-gray-100'
                  }`}>
                    {activity.icon === 'check' && <CheckCircle className={`w-5 h-5 ${activity.color}`} />}
                    {activity.icon === 'clock' && <Clock className={`w-5 h-5 ${activity.color}`} />}
                    {activity.icon === 'plus' && <Plus className={`w-5 h-5 ${activity.color}`} />}
                    {activity.icon === 'user' && <UserPlus className={`w-5 h-5 ${activity.color}`} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user}</span>
                      {' '}{activity.action}
                      {' '}<span className="font-medium text-[#1E88E5]">{activity.course}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Thao tÃ¡c nhanh</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              className="w-full justify-start bg-[#1E88E5] hover:bg-[#1565C0] text-white"
              onClick={() => navigateTo('approve-courses')}
            >
              <FileCheck className="w-4 h-4 mr-2" />
              Duyá»‡t khÃ³a há»c ({stats.pendingCourses})
            </Button>
            <Button 
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigateTo('manage-courses')}
            >
              <Settings className="w-4 h-4 mr-2" />
              Quáº£n lÃ½ khÃ³a há»c
            </Button>
            <Button 
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigateTo('manage-users')}
            >
              <Users className="w-4 h-4 mr-2" />
              Quáº£n lÃ½ ngÆ°á»i dÃ¹ng
            </Button>
            <Button 
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigateTo('manage-tags')}
            >
              <Tag className="w-4 h-4 mr-2" />
              Quáº£n lÃ½ chá»§ Ä‘á»
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Course Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Tá»•ng quan khÃ³a há»c</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-green-50 p-6 rounded-lg">
              <div className="text-center">
                <div className="text-3xl text-green-600 mb-2">
                  {mockCourses.filter(c => c.visibility === 'public' && c.status === 'approved').length}
                </div>
                <div className="text-gray-700">KhÃ³a há»c cÃ´ng khai</div>
              </div>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="text-center">
                <div className="text-3xl text-blue-600 mb-2">
                  {mockCourses.filter(c => c.visibility === 'private').length}
                </div>
                <div className="text-gray-700">KhÃ³a há»c riÃªng tÆ°</div>
              </div>
            </div>
            <div className="bg-orange-50 p-6 rounded-lg">
              <div className="text-center">
                <div className="text-3xl text-orange-600 mb-2">
                  {stats.pendingCourses}
                </div>
                <div className="text-gray-700">Chá» duyá»‡t</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

