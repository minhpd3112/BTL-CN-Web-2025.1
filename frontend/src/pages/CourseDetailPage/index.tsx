import { useState } from 'react';
import { 
  Star, Users, Clock, Lock, BarChart3, UserPlus, CheckCircle, 
  Play, FileText, Award, Video, PlayCircle, Eye, ChevronDown, ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';
import { Course, User, Page } from '@/types';
import { AnimatedSection } from '@/utils/animations';

// Mock lessons for curriculum display
const mockLessons = [
  { id: 1, title: 'Giới thiệu khóa học', type: 'video', duration: '10:00', completed: true },
  { id: 2, title: 'Cài đặt môi trường', type: 'video', duration: '15:00', completed: true },
  { id: 3, title: 'Concepts cơ bản', type: 'video', duration: '20:00', completed: false },
  { id: 4, title: 'Tài liệu tham khảo', type: 'pdf', duration: '5 phút', completed: false },
  { id: 5, title: 'Quiz kiểm tra', type: 'quiz', duration: '10 phút', completed: false }
];

// Mock course sections with full content for admin preview
const mockCourseSections = [
  {
    id: 1,
    title: 'Giới thiệu',
    lessons: [
      { id: 1, title: 'Chào mừng đến với khóa học', type: 'video' as const, duration: '10:00', youtubeUrl: 'dQw4w9WgXcQ' },
      { id: 2, title: 'Tổng quan nội dung', type: 'text' as const, duration: '5:00', content: '# Tổng quan khóa học\n\nTrong khóa học này, bạn sẽ học được:\n\n- Các khái niệm cơ bản\n- Cách áp dụng vào thực tế\n- Best practices trong ngành\n\nHãy cùng bắt đầu nhé!' },
    ]
  },
  {
    id: 2,
    title: 'Kiến thức cơ bản',
    lessons: [
      { id: 3, title: 'Video hướng dẫn chi tiết', type: 'video' as const, duration: '15:00', youtubeUrl: 'dQw4w9WgXcQ' },
      { id: 4, title: 'Tài liệu PDF tham khảo', type: 'pdf' as const, duration: '10:00', pdfUrl: 'sample-document.pdf' },
      { 
        id: 5, 
        title: 'Bài kiểm tra kiến thức', 
        type: 'quiz' as const, 
        duration: '10 phút',
        quizQuestions: [
          {
            question: 'React là gì?',
            type: 'single' as const,
            options: ['Library JavaScript', 'Framework', 'Ngôn ngữ lập trình', 'Database'],
            correctAnswers: [0],
            explanation: 'React là một JavaScript library để xây dựng giao diện người dùng (UI).'
          },
          {
            question: 'Chọn các hooks cơ bản của React:',
            type: 'multiple' as const,
            options: ['useState', 'useEffect', 'useContext', 'useDatabase'],
            correctAnswers: [0, 1, 2],
            explanation: 'useState, useEffect và useContext là các hooks cơ bản được tích hợp sẵn trong React. useDatabase không phải là hook của React.'
          },
          {
            question: 'JSX là viết tắt của gì?',
            type: 'single' as const,
            options: ['JavaScript XML', 'Java Syntax Extension', 'JSON XML', 'JavaScript Extension'],
            correctAnswers: [0],
            explanation: 'JSX là viết tắt của JavaScript XML, là một cú pháp mở rộng cho JavaScript.'
          }
        ]
      },
    ]
  }
];

interface CourseDetailPageProps {
  course: Course;
  navigateTo: (page: Page) => void;
  currentUser: User;
  isOwner: boolean;
  canAccess: boolean;
  enrollmentRequests?: any[];
  onEnrollRequest?: (request: any) => void;
}

export function CourseDetailPage({ 
  course, 
  navigateTo, 
  currentUser, 
  isOwner, 
  canAccess,
  enrollmentRequests,
  onEnrollRequest
}: CourseDetailPageProps) {
  const [showEnrollDialog, setShowEnrollDialog] = useState(false);
  const [enrollMessage, setEnrollMessage] = useState('');
  const [expandedSections, setExpandedSections] = useState<number[]>([1]);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  
  // Check if user has pending request
  const hasPendingRequest = enrollmentRequests?.some(
    (req: any) => req.courseId === course.id && req.userId === currentUser?.id && req.status === 'pending'
  );
  
  // Check if user is already enrolled
  const isEnrolled = course.enrolledUsers?.includes(currentUser?.id);
  
  // Check if user is owner or admin
  const canManage = isOwner || currentUser?.role === 'admin';

  const handleEnrollRequest = () => {
    if (!enrollMessage.trim()) {
      toast.error('Vui lòng nhập lời nhắn');
      return;
    }
    
    if (onEnrollRequest) {
      onEnrollRequest({
        courseId: course.id,
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        userEmail: currentUser.email,
        message: enrollMessage
      });
    }
    
    toast.success('Đã gửi yêu cầu đăng ký! Giảng viên sẽ xem xét và phản hồi sớm.');
    setShowEnrollDialog(false);
    setEnrollMessage('');
  };

  const toggleSection = (sectionId: number) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.includes('youtube.com') ? url.split('v=')[1]?.split('&')[0] : url;
    return `https://www.youtube.com/embed/${videoId}`;
  };

  if (!canAccess) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card>
          <CardContent className="p-12 text-center">
            <Lock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="mb-2">Khóa học riêng tư</h2>
            <p className="text-gray-600 mb-6">
              Bạn không có quyền truy cập khóa học này. Vui lòng liên hệ người tạo để được mời.
            </p>
            <Button variant="outline" onClick={() => navigateTo('home')}>
              Quay lại trang chủ
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      {/* Course Header */}
      <div className="bg-gradient-to-r from-[#1E88E5] to-[#1565C0] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex gap-2 mb-4">
                {course.tags.slice(0, 3).map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="bg-white/20 text-white">
                    {tag}
                  </Badge>
                ))}
                {course.visibility === 'private' && (
                  <Badge variant="secondary" className="bg-white/20 text-white gap-1">
                    <Lock className="w-3 h-3" />
                    Riêng tư
                  </Badge>
                )}
              </div>
              <h1 className="mb-4">{course.title}</h1>
              <p className="text-xl mb-6 opacity-90">{course.description}</p>
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-white text-[#1E88E5]">{course.ownerAvatar}</AvatarFallback>
                  </Avatar>
                  <span>{course.ownerName}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span>{course.rating}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>{course.students} học viên</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>{course.duration}</span>
                </div>
              </div>
            </div>
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-0">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="px-4 pt-4 pb-4">
                    {canManage ? (
                      <Button
                        className="w-full bg-[#1E88E5] hover:bg-[#1565C0]"
                        onClick={() => navigateTo('course-dashboard')}
                      >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Tổng quan khóa học
                      </Button>
                    ) : isEnrolled ? (
                      <Button
                        className="w-full bg-[#1E88E5] hover:bg-[#1565C0]"
                        onClick={() => navigateTo('learning')}
                      >
                        Bắt đầu học
                      </Button>
                    ) : hasPendingRequest ? (
                      <Button
                        className="w-full"
                        variant="outline"
                        disabled
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        Đang chờ duyệt
                      </Button>
                    ) : (
                      <Dialog open={showEnrollDialog} onOpenChange={setShowEnrollDialog}>
                        <DialogTrigger asChild>
                          <Button className="w-full bg-[#1E88E5] hover:bg-[#1565C0]">
                            <UserPlus className="w-4 h-4 mr-2" />
                            Đăng ký học
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Đăng ký học khóa học</DialogTitle>
                            <DialogDescription>
                              Gửi yêu cầu tham gia khóa học đến người tạo
                            </DialogDescription>
                          </DialogHeader>

                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="enroll-name">Họ tên</Label>
                              <Input
                                id="enroll-name"
                                value={currentUser?.name}
                                disabled
                                className="mt-2"
                              />
                            </div>
                            <div>
                              <Label htmlFor="enroll-email">Email</Label>
                              <Input
                                id="enroll-email"
                                value={currentUser?.email}
                                disabled
                                className="mt-2"
                              />
                            </div>
                            <div>
                              <Label htmlFor="enroll-message">
                                Lời nhắn đến giảng viên <span className="text-red-500">*</span>
                              </Label>
                              <Textarea
                                id="enroll-message"
                                placeholder="Ví dụ: Tôi rất quan tâm đến khóa học này vì..."
                                value={enrollMessage}
                                onChange={(e) => setEnrollMessage(e.target.value)}
                                className="mt-2"
                                rows={4}
                              />
                            </div>
                          </div>

                          <DialogFooter>
                            <Button variant="outline" onClick={() => setShowEnrollDialog(false)}>
                              Hủy
                            </Button>
                            <Button
                              className="bg-[#1E88E5] text-white hover:bg-[#1565C0]"
                              onClick={handleEnrollRequest}
                            >
                              Gửi yêu cầu
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        <Tabs defaultValue="overview">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            {currentUser?.role === 'admin' && (
              <TabsTrigger value="content-preview">
                Xem khóa học
              </TabsTrigger>
            )}
            <TabsTrigger value="reviews">Đánh giá</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <Card>
              <CardContent className="p-6">
                {course.overview ? (
                  <div className="prose max-w-none">
                    {course.overview.split('\n').map((line, index) => {
                      if (line.startsWith('## ')) {
                        return <h2 key={index} className="text-xl font-semibold mt-6 mb-4 first:mt-0">{line.replace('## ', '')}</h2>;
                      } else if (line.startsWith('- ')) {
                        return (
                          <div key={index} className="flex items-start gap-3 mb-3">
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>{line.replace('- ', '')}</span>
                          </div>
                        );
                      } else if (line.trim() === '') {
                        return <div key={index} className="h-2"></div>;
                      } else {
                        return <p key={index} className="text-gray-600 mb-2">{line}</p>;
                      }
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>Chưa có thông tin tổng quan cho khóa học này</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin Content Preview Tab */}
          {currentUser?.role === 'admin' && (
            <TabsContent value="content-preview">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Left: Lesson List (2 columns) */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Danh sách bài học</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <ScrollArea className="h-[600px] pr-4">
                        <div className="space-y-3">
                          {mockCourseSections.map((section) => (
                            <Card key={section.id} className="border">
                              <Collapsible
                                open={expandedSections.includes(section.id)}
                                onOpenChange={() => toggleSection(section.id)}
                              >
                                <CollapsibleTrigger asChild>
                                  <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50">
                                    <h4 className="text-sm">{section.title}</h4>
                                    {expandedSections.includes(section.id) ? (
                                      <ChevronUp className="w-4 h-4" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4" />
                                    )}
                                  </div>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  <div className="px-4 pb-4 space-y-2">
                                    {section.lessons.map((lesson, idx) => (
                                      <button
                                        key={lesson.id}
                                        onClick={() => setSelectedLesson(lesson)}
                                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                                          selectedLesson?.id === lesson.id
                                            ? 'border-[#1E88E5] bg-[#1E88E5]/5'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                      >
                                        <div className="flex items-center gap-3">
                                          <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-xs flex-shrink-0">
                                            {idx + 1}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 text-sm">
                                              {lesson.type === 'video' && <Video className="w-4 h-4 text-[#1E88E5]" />}
                                              {lesson.type === 'text' && <FileText className="w-4 h-4 text-green-600" />}
                                              {lesson.type === 'pdf' && <FileText className="w-4 h-4 text-red-600" />}
                                              {lesson.type === 'quiz' && <Award className="w-4 h-4 text-orange-600" />}
                                              <span className="truncate">{lesson.title}</span>
                                            </div>
                                            <div className="text-xs text-gray-500">{lesson.duration}</div>
                                          </div>
                                          <PlayCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                </CollapsibleContent>
                              </Collapsible>
                            </Card>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>

                {/* Right: Preview Area (3 columns) */}
                <div className="lg:col-span-3">
                  {!selectedLesson ? (
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-center h-[600px] text-gray-500">
                          <div className="text-center">
                            <Eye className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                            <p>Chọn một bài học để xem nội dung</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {/* Video Preview */}
                      {selectedLesson.type === 'video' && selectedLesson.youtubeUrl && (
                        <Card>
                          <CardContent className="p-0">
                            <div className="aspect-video rounded-lg overflow-hidden bg-black">
                              <iframe
                                src={getYouTubeEmbedUrl(selectedLesson.youtubeUrl)}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Text Preview */}
                      {selectedLesson.type === 'text' && selectedLesson.content && (
                        <Card>
                          <CardContent className="p-6">
                            <div className="prose max-w-none">
                              <div className="p-6 bg-gray-50 rounded-lg border">
                                <pre className="whitespace-pre-wrap text-sm">{selectedLesson.content}</pre>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* PDF Preview */}
                      {selectedLesson.type === 'pdf' && (
                        <Card>
                          <CardContent className="p-6">
                            <div className="space-y-4">
                              <Alert className="bg-blue-50 border-blue-200">
                                <AlertDescription className="text-blue-800 text-sm">
                                  📄 <strong>Tài liệu PDF:</strong> {selectedLesson.pdfUrl}
                                </AlertDescription>
                              </Alert>
                              <div className="aspect-[3/4] rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                                <div className="text-center text-gray-500">
                                  <FileText className="w-20 h-20 text-gray-300 mx-auto mb-3" />
                                  <p className="text-sm">PDF Preview</p>
                                  <p className="text-xs mt-1">{selectedLesson.pdfUrl}</p>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Quiz Preview */}
                      {selectedLesson.type === 'quiz' && selectedLesson.quizQuestions && (
                        <div className="space-y-6">
                          {selectedLesson.quizQuestions.map((q: any, qIdx: number) => (
                            <Card key={qIdx} className="border-2">
                              <CardContent className="p-6">
                                <div className="flex gap-4 mb-4">
                                  <div className="w-10 h-10 rounded-full bg-[#1E88E5] text-white flex items-center justify-center flex-shrink-0">
                                    {qIdx + 1}
                                  </div>
                                  <div className="flex-1">
                                    <p className="mb-2 text-lg">{q.question}</p>
                                    <Badge variant="secondary" className="text-xs">
                                      {q.type === 'single' ? '📝 Chọn 1 đáp án' : '☑️ Chọn nhiều đáp án'}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="space-y-3 ml-14">
                                  {q.options.map((option: string, oIdx: number) => {
                                    const isCorrect = q.correctAnswers.includes(oIdx);
                                    return (
                                      <div
                                        key={oIdx}
                                        className={`p-4 rounded-lg border-2 transition-all ${
                                          isCorrect
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-gray-200 bg-white'
                                        }`}
                                      >
                                        <div className="flex items-center gap-3">
                                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                            isCorrect ? 'border-green-500 bg-green-500' : 'border-gray-300'
                                          }`}>
                                            {isCorrect && (
                                              <CheckCircle className="w-4 h-4 text-white" />
                                            )}
                                          </div>
                                          <span className={isCorrect ? 'font-medium text-green-700' : 'text-gray-700'}>
                                            {option}
                                          </span>
                                          {isCorrect && (
                                            <Badge className="ml-auto bg-green-500 text-white">✓ Đáp án đúng</Badge>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                                {q.explanation && (
                                  <div className="ml-14 mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                                    <p className="text-sm"><strong>💡 Giải thích:</strong> {q.explanation}</p>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          )}

          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Đánh giá từ học viên</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  Chưa có đánh giá nào
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
