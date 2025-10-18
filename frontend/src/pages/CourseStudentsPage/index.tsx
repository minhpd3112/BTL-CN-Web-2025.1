import { useState } from 'react';
import { Users, Clock, CheckCircle, XCircle, Trash2, UserPlus, Search } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { ScrollArea } from '../../components/ui/scroll-area';
import { toast } from 'sonner@2.0.3';
import { Course, Page } from '../../types';
import { mockUsers } from '../../data';

interface CourseStudentsPageProps {
  course: Course;
  navigateTo: (page: Page) => void;
  enrollmentRequests?: any[];
  onApproveRequest?: (id: number) => void;
  onRejectRequest?: (id: number) => void;
}

export function CourseStudentsPage({ 
  course, 
  navigateTo,
  enrollmentRequests = [],
  onApproveRequest,
  onRejectRequest
}: CourseStudentsPageProps) {
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const courseEnrollments = enrollmentRequests.filter(r => r.courseId === course.id);
  const pendingRequests = courseEnrollments.filter(r => r.status === 'pending');
  const approvedStudents = courseEnrollments.filter(r => r.status === 'approved');

  // Get enrolled user IDs
  const enrolledUserIds = courseEnrollments.map(r => r.userId);

  // Filter available users (exclude owner and already enrolled)
  const availableUsers = mockUsers.filter(user => 
    user.id !== course.ownerId && 
    !enrolledUserIds.includes(user.id) &&
    user.role !== 'admin' // Exclude admin from student list
  );

  // Filter users based on search
  const filteredUsers = availableUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleApproveRequest = (requestId: number) => {
    if (onApproveRequest) onApproveRequest(requestId);
    toast.success('ÄÃ£ cháº¥p nháº­n há»c viÃªn');
  };

  const handleRejectRequest = (requestId: number) => {
    if (onRejectRequest) onRejectRequest(requestId);
    toast.success('ÄÃ£ tá»« chá»‘i há»c viÃªn');
  };

  const handleRemoveStudent = (userId: number) => {
    toast.success('ÄÃ£ xÃ³a há»c viÃªn khá»i khÃ³a há»c');
  };

  const handleInviteStudent = (user: any) => {
    toast.success(`ÄÃ£ gá»­i lá»i má»i Ä‘áº¿n ${user.name}`);
    setAddStudentOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Button variant="ghost" onClick={() => navigateTo('course-dashboard')} className="mb-4">
          â† Quay láº¡i Dashboard
        </Button>
        <h1 className="mb-2">Quáº£n lÃ½ há»c viÃªn</h1>
        <p className="text-gray-600">{course.title}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tá»•ng há»c viÃªn</p>
                <p className="text-3xl">{approvedStudents.length}</p>
              </div>
              <Users className="w-8 h-8 text-[#1E88E5]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Chá» duyá»‡t</p>
                <p className="text-3xl text-orange-500">{pendingRequests.length}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tiáº¿n Ä‘á»™ TB</p>
                <p className="text-3xl">45%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="enrolled">
        <TabsList className="mb-6">
          <TabsTrigger value="enrolled">
            ÄÃ£ tham gia ({approvedStudents.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Chá» duyá»‡t ({pendingRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="enrolled">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Há»c viÃªn Ä‘Ã£ tham gia</CardTitle>
                <Dialog open={addStudentOpen} onOpenChange={setAddStudentOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#1E88E5] hover:bg-[#1565C0]">
                      <UserPlus className="w-4 h-4 mr-2" />
                      ThÃªm há»c viÃªn
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Má»i há»c viÃªn vÃ o khÃ³a há»c</DialogTitle>
                      <DialogDescription>
                        TÃ¬m kiáº¿m vÃ  má»i ngÆ°á»i dÃ¹ng tham gia khÃ³a há»c cá»§a báº¡n
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="TÃ¬m theo tÃªn hoáº·c email..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9"
                        />
                      </div>

                      <ScrollArea className="h-[400px] border rounded-lg">
                        {filteredUsers.length > 0 ? (
                          <div className="divide-y">
                            {filteredUsers.map((user) => (
                              <div
                                key={user.id}
                                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <Avatar>
                                    <AvatarFallback className="bg-[#1E88E5] text-white">
                                      {user.avatar}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">{user.name}</div>
                                    <div className="text-sm text-gray-600">{user.email}</div>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  className="bg-[#1E88E5] hover:bg-[#1565C0]"
                                  onClick={() => handleInviteStudent(user)}
                                >
                                  <UserPlus className="w-4 h-4 mr-1" />
                                  Má»i
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12 text-gray-500">
                            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p>
                              {searchQuery
                                ? 'KhÃ´ng tÃ¬m tháº¥y ngÆ°á»i dÃ¹ng phÃ¹ há»£p'
                                : 'KhÃ´ng cÃ³ ngÆ°á»i dÃ¹ng kháº£ dá»¥ng'}
                            </p>
                          </div>
                        )}
                      </ScrollArea>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {approvedStudents.length > 0 ? (
                <div className="space-y-4">
                  {approvedStudents.map((student: any) => (
                    <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarFallback className="bg-[#1E88E5] text-white">
                            {student.userAvatar}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{student.userName}</div>
                          <div className="text-sm text-gray-600">{student.userEmail}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Tham gia: {student.respondedAt || student.requestedAt}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-sm text-gray-600">Tiáº¿n Ä‘á»™</div>
                          <div className="font-medium">45%</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveStudent(student.userId)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p>ChÆ°a cÃ³ há»c viÃªn nÃ o tham gia</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>YÃªu cáº§u Ä‘Äƒng kÃ½ chá» duyá»‡t</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingRequests.length > 0 ? (
                <div className="space-y-4">
                  {pendingRequests.map((request: any) => (
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
                            onClick={() => handleApproveRequest(request.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Cháº¥p nháº­n
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectRequest(request.id)}
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
      </Tabs>
    </div>
  );
}

