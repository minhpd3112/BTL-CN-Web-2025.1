import { Star, Users, BookOpen, Clock, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { toast } from 'sonner@2.0.3';
import { Course, Page } from '../../types';

interface CourseDashboardPageProps {
  course: Course;
  navigateTo: (page: Page) => void;
  enrollmentRequests?: any[];
  onApproveRequest?: (id: number) => void;
  onRejectRequest?: (id: number) => void;
}

export function CourseDashboardPage({ 
  course, 
  navigateTo,
  enrollmentRequests = [],
  onApproveRequest,
  onRejectRequest
}: CourseDashboardPageProps) {
  const coursePendingRequests = enrollmentRequests.filter(r => r.courseId === course.id && r.status === 'pending');

  const handleApprove = (requestId: number) => {
    if (onApproveRequest) onApproveRequest(requestId);
    toast.success('ÄÃ£ cháº¥p nháº­n há»c viÃªn');
  };

  const handleReject = (requestId: number) => {
    if (onRejectRequest) onRejectRequest(requestId);
    toast.success('ÄÃ£ tá»« chá»‘i há»c viÃªn');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="mb-2">Dashboard: {course.title}</h1>
            <p className="text-gray-600">Quáº£n lÃ½ vÃ  theo dÃµi khÃ³a há»c cá»§a báº¡n</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigateTo('edit-course')}>
              Chá»‰nh sá»­a
            </Button>
            <Button variant="outline" onClick={() => navigateTo('course-students')}>
              <Users className="w-4 h-4 mr-2" />
              Quáº£n lÃ½ há»c viÃªn
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tá»•ng há»c viÃªn</p>
                <p className="text-3xl">{course.students}</p>
                <p className="text-xs text-green-600 mt-1">â†‘ +15 thÃ¡ng nÃ y</p>
              </div>
              <Users className="w-8 h-8 text-[#1E88E5]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">ÄÃ¡nh giÃ¡ TB</p>
                <p className="text-3xl flex items-center gap-1">
                  {course.rating}
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                </p>
                <p className="text-xs text-gray-500 mt-1">Tá»« 24 Ä‘Ã¡nh giÃ¡</p>
              </div>
              <Star className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tá»· lá»‡ hoÃ n thÃ nh</p>
                <p className="text-3xl">68%</p>
                <p className="text-xs text-gray-500 mt-1">Trung bÃ¬nh</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className={coursePendingRequests.length > 0 ? 'border-orange-500 border-2' : ''}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Chá» duyá»‡t</p>
                <p className="text-3xl text-orange-500">{coursePendingRequests.length}</p>
                {coursePendingRequests.length > 0 && (
                  <p className="text-xs text-orange-600 mt-1">Cáº§n xem xÃ©t</p>
                )}
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="enrollments">
        <TabsList>
          <TabsTrigger value="enrollments">
            YÃªu cáº§u Ä‘Äƒng kÃ½ ({coursePendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="reviews">ÄÃ¡nh giÃ¡</TabsTrigger>
          <TabsTrigger value="analytics">Thá»‘ng kÃª</TabsTrigger>
        </TabsList>

        <TabsContent value="enrollments">
          <Card>
            <CardContent className="p-6">
              {coursePendingRequests.length > 0 ? (
                <div className="space-y-4">
                  {coursePendingRequests.map((request: any) => (
                    <div key={request.id} className="p-4 border rounded-lg">
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-[#1E88E5] text-white">
                            {request.userAvatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-medium mb-1">{request.userName}</div>
                          <div className="text-sm text-gray-600 mb-2">{request.userEmail}</div>
                          {request.message && (
                            <div className="bg-gray-50 p-3 rounded-lg mb-3">
                              <p className="text-sm text-gray-700 italic">"{request.message}"</p>
                            </div>
                          )}
                          <div className="text-xs text-gray-500">
                            ÄÄƒng kÃ½ lÃºc: {request.requestedAt}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-green-500 hover:bg-green-600"
                            onClick={() => handleApprove(request.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Cháº¥p nháº­n
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(request.id)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Tá»« chá»‘i
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p>KhÃ´ng cÃ³ yÃªu cáº§u Ä‘Äƒng kÃ½ má»›i</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <Card>
            <CardContent className="p-12 text-center text-gray-500">
              <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p>ChÆ°a cÃ³ Ä‘Ã¡nh giÃ¡ nÃ o</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Giá»›i thiá»‡u</span>
                    <span className="text-sm font-medium">{course.lessons || 12} má»¥c nhá»</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-[#1E88E5] h-2 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Tá»•ng thá»i lÆ°á»£ng</span>
                    <span className="text-sm font-medium">{course.duration}</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">LÆ°á»£t xem trung bÃ¬nh</span>
                    <span className="text-sm font-medium">156 lÆ°á»£t/bÃ i</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

