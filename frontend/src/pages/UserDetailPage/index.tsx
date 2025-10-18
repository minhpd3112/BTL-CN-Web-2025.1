import { Eye, BookOpen, Users, Star } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { mockCourses } from '../../data';
import { User, Page } from '../../types';

interface UserDetailPageProps {
  user: User;
  navigateTo: (page: Page) => void;
}

export function UserDetailPage({ user, navigateTo }: UserDetailPageProps) {
  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-600">KhÃ´ng tÃ¬m tháº¥y thÃ´ng tin ngÆ°á»i dÃ¹ng</p>
            <Button className="mt-4" onClick={() => navigateTo('manage-users')}>
              Quay láº¡i danh sÃ¡ch
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get user's courses
  const userCourses = mockCourses.filter(c => c.ownerId === user.id);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => navigateTo('manage-users')} className="mb-4">
        â† Quay láº¡i danh sÃ¡ch
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Info Card */}
        <Card>
          <CardHeader className="text-center">
            <Avatar className="w-24 h-24 mx-auto mb-4">
              <AvatarFallback className="text-2xl bg-[#1E88E5] text-white">
                {user.avatar}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-xl">{user.name}</CardTitle>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                {user.role === 'admin' ? 'Admin' : 'User'}
              </Badge>
              {user.status === 'active' && (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <div className="w-2 h-2 bg-green-600 rounded-full mr-1" />
                  Online
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Separator />
            <div>
              <p className="text-sm text-gray-600 mb-1">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-gray-600 mb-1">Sá»‘ Ä‘iá»‡n thoáº¡i</p>
              <p className="font-medium">{user.phone}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-gray-600 mb-1">Äá»‹a chá»‰</p>
              <p className="font-medium">{user.location}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-gray-600 mb-1">NgÃ y tham gia</p>
              <p className="font-medium">{user.joinedDate}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-gray-600 mb-1">ÄÄƒng nháº­p gáº§n Ä‘Ã¢y</p>
              <p className="font-medium">{user.lastLogin}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-gray-600 mb-1">Tráº¡ng thÃ¡i</p>
              <Badge variant="outline" className="text-green-600 border-green-600">
                <div className="w-2 h-2 bg-green-600 rounded-full mr-1" />
                {user.status === 'active' ? 'Hoáº¡t Ä‘á»™ng' : 'KhÃ´ng hoáº¡t Ä‘á»™ng'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* User Stats & Courses */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <BookOpen className="w-8 h-8 text-[#1E88E5] mx-auto mb-2" />
                <p className="text-2xl mb-1">{user.coursesCreated}</p>
                <p className="text-sm text-gray-600">KhÃ³a há»c Ä‘Ã£ táº¡o</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl mb-1">{user.totalStudents}</p>
                <p className="text-sm text-gray-600">Tá»•ng há»c viÃªn</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <p className="text-2xl mb-1">4.7</p>
                <p className="text-sm text-gray-600">ÄÃ¡nh giÃ¡ TB</p>
              </CardContent>
            </Card>
          </div>

          {/* Courses Created */}
          <Card>
            <CardHeader>
              <CardTitle>KhÃ³a há»c Ä‘Ã£ táº¡o ({userCourses.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {userCourses.length > 0 ? (
                <div className="space-y-4">
                  {userCourses.map(course => (
                    <div key={course.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <img src={course.image} alt={course.title} className="w-24 h-16 object-cover rounded" />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium mb-1">{course.title}</h4>
                            <div className="flex items-center gap-2">
                              <Badge variant={course.visibility === 'public' ? 'default' : 'secondary'} className="text-xs">
                                {course.visibility === 'public' ? 'CÃ´ng khai' : 'RiÃªng tÆ°'}
                              </Badge>
                              <Badge className={`text-xs ${
                                course.status === 'pending' ? 'bg-orange-500' :
                                course.status === 'approved' ? 'bg-green-500' : 'bg-red-500'
                              }`}>
                                {course.status === 'pending' ? 'Chá» duyá»‡t' :
                                 course.status === 'approved' ? 'ÄÃ£ duyá»‡t' : 'Tá»« chá»‘i'}
                              </Badge>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            <Eye className="w-3 h-3 mr-1" />
                            Xem
                          </Button>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <span>ðŸ‘¥ {course.students} há»c viÃªn</span>
                          <span>â­ {course.rating}</span>
                          <span>ðŸ“š {course.lessons} má»¥c</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>ChÆ°a táº¡o khÃ³a há»c nÃ o</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Hoáº¡t Ä‘á»™ng gáº§n Ä‘Ã¢y</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 pb-4 border-b">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">Táº¡o khÃ³a há»c má»›i</p>
                    <p className="text-xs text-gray-500 mt-1">2 ngÃ y trÆ°á»›c</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 pb-4 border-b last:border-0">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-[#1E88E5]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">Cháº¥p nháº­n 5 há»c viÃªn má»›i</p>
                    <p className="text-xs text-gray-500 mt-1">3 ngÃ y trÆ°á»›c</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                    <Star className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">Nháº­n Ä‘Æ°á»£c 3 Ä‘Ã¡nh giÃ¡ 5 sao</p>
                    <p className="text-xs text-gray-500 mt-1">1 tuáº§n trÆ°á»›c</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

