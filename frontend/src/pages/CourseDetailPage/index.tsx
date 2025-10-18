import { useState } from 'react';
import { 
  Star, Users, Clock, Lock, BarChart3, UserPlus, CheckCircle, 
  Play, FileText, Award, Video, PlayCircle, Eye, ChevronDown, ChevronUp
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../components/ui/collapsible';
import { toast } from 'sonner@2.0.3';
import { Course, User, Page } from '../../types';

// Mock lessons for curriculum display
const mockLessons = [
  { id: 1, title: 'Giá»›i thiá»‡u khÃ³a há»c', type: 'video', duration: '10:00', completed: true },
  { id: 2, title: 'CÃ i Ä‘áº·t mÃ´i trÆ°á»ng', type: 'video', duration: '15:00', completed: true },
  { id: 3, title: 'Concepts cÆ¡ báº£n', type: 'video', duration: '20:00', completed: false },
  { id: 4, title: 'TÃ i liá»‡u tham kháº£o', type: 'pdf', duration: '5 phÃºt', completed: false },
  { id: 5, title: 'Quiz kiá»ƒm tra', type: 'quiz', duration: '10 phÃºt', completed: false }
];

// Mock course sections with full content for admin preview
const mockCourseSections = [
  {
    id: 1,
    title: 'Giá»›i thiá»‡u',
    lessons: [
      { id: 1, title: 'ChÃ o má»«ng Ä‘áº¿n vá»›i khÃ³a há»c', type: 'video' as const, duration: '10:00', youtubeUrl: 'dQw4w9WgXcQ' },
      { id: 2, title: 'Tá»•ng quan ná»™i dung', type: 'text' as const, duration: '5:00', content: '# Tá»•ng quan khÃ³a há»c\n\nTrong khÃ³a há»c nÃ y, báº¡n sáº½ há»c Ä‘Æ°á»£c:\n\n- CÃ¡c khÃ¡i niá»‡m cÆ¡ báº£n\n- CÃ¡ch Ã¡p dá»¥ng vÃ o thá»±c táº¿\n- Best practices trong ngÃ nh\n\nHÃ£y cÃ¹ng báº¯t Ä‘áº§u nhÃ©!' },
    ]
  },
  {
    id: 2,
    title: 'Kiáº¿n thá»©c cÆ¡ báº£n',
    lessons: [
      { id: 3, title: 'Video hÆ°á»›ng dáº«n chi tiáº¿t', type: 'video' as const, duration: '15:00', youtubeUrl: 'dQw4w9WgXcQ' },
      { id: 4, title: 'TÃ i liá»‡u PDF tham kháº£o', type: 'pdf' as const, duration: '10:00', pdfUrl: 'sample-document.pdf' },
      { 
        id: 5, 
        title: 'BÃ i kiá»ƒm tra kiáº¿n thá»©c', 
        type: 'quiz' as const, 
        duration: '10 phÃºt',
        quizQuestions: [
          {
            question: 'React lÃ  gÃ¬?',
            type: 'single' as const,
            options: ['Library JavaScript', 'Framework', 'NgÃ´n ngá»¯ láº­p trÃ¬nh', 'Database'],
            correctAnswers: [0],
            explanation: 'React lÃ  má»™t JavaScript library Ä‘á»ƒ xÃ¢y dá»±ng giao diá»‡n ngÆ°á»i dÃ¹ng (UI).'
          },
          {
            question: 'Chá»n cÃ¡c hooks cÆ¡ báº£n cá»§a React:',
            type: 'multiple' as const,
            options: ['useState', 'useEffect', 'useContext', 'useDatabase'],
            correctAnswers: [0, 1, 2],
            explanation: 'useState, useEffect vÃ  useContext lÃ  cÃ¡c hooks cÆ¡ báº£n Ä‘Æ°á»£c tÃ­ch há»£p sáºµn trong React. useDatabase khÃ´ng pháº£i lÃ  hook cá»§a React.'
          },
          {
            question: 'JSX lÃ  viáº¿t táº¯t cá»§a gÃ¬?',
            type: 'single' as const,
            options: ['JavaScript XML', 'Java Syntax Extension', 'JSON XML', 'JavaScript Extension'],
            correctAnswers: [0],
            explanation: 'JSX lÃ  viáº¿t táº¯t cá»§a JavaScript XML, lÃ  má»™t cÃº phÃ¡p má»Ÿ rá»™ng cho JavaScript.'
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
      toast.error('Vui lÃ²ng nháº­p lá»i nháº¯n');
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
    
    toast.success('ÄÃ£ gá»­i yÃªu cáº§u Ä‘Äƒng kÃ½! Giáº£ng viÃªn sáº½ xem xÃ©t vÃ  pháº£n há»“i sá»›m.');
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
            <h2 className="mb-2">KhÃ³a há»c riÃªng tÆ°</h2>
            <p className="text-gray-600 mb-6">
              Báº¡n khÃ´ng cÃ³ quyá»n truy cáº­p khÃ³a há»c nÃ y. Vui lÃ²ng liÃªn há»‡ ngÆ°á»i táº¡o Ä‘á»ƒ Ä‘Æ°á»£c má»i.
            </p>
            <Button variant="outline" onClick={() => navigateTo('home')}>
              Quay láº¡i trang chá»§
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
                    RiÃªng tÆ°
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
                  <span>{course.students} há»c viÃªn</span>
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
                  <img src={course.image} alt={course.title} className="w-full h-48 object-cover rounded-t-lg" />
                  <div className="p-6">
                    {canManage ? (
                      <Button 
                        className="w-full mb-3 bg-[#1E88E5] hover:bg-[#1565C0]"
                        onClick={() => navigateTo('course-dashboard')}
                      >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Tá»•ng quan khÃ³a há»c
                      </Button>
                    ) : isEnrolled ? (
                      <Button 
                        className="w-full mb-3 bg-[#1E88E5] hover:bg-[#1565C0]"
                        onClick={() => navigateTo('learning')}
                      >
                        Báº¯t Ä‘áº§u há»c
                      </Button>
                    ) : hasPendingRequest ? (
                      <Button 
                        className="w-full mb-3"
                        variant="outline"
                        disabled
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        Äang chá» duyá»‡t
                      </Button>
                    ) : (
                      <Dialog open={showEnrollDialog} onOpenChange={setShowEnrollDialog}>
                        <DialogTrigger asChild>
                          <Button className="w-full mb-3 bg-[#1E88E5] hover:bg-[#1565C0]">
                            <UserPlus className="w-4 h-4 mr-2" />
                            ÄÄƒng kÃ½ há»c
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>ÄÄƒng kÃ½ há»c khÃ³a há»c</DialogTitle>
                            <DialogDescription>
                              Gá»­i yÃªu cáº§u tham gia khÃ³a há»c Ä‘áº¿n ngÆ°á»i táº¡o
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="enroll-name">Há» tÃªn</Label>
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
                                Lá»i nháº¯n Ä‘áº¿n giáº£ng viÃªn <span className="text-red-500">*</span>
                              </Label>
                              <Textarea
                                id="enroll-message"
                                placeholder="VÃ­ dá»¥: TÃ´i ráº¥t quan tÃ¢m Ä‘áº¿n khÃ³a há»c nÃ y vÃ¬..."
                                value={enrollMessage}
                                onChange={(e) => setEnrollMessage(e.target.value)}
                                className="mt-2"
                                rows={4}
                              />
                            </div>
                            <Alert className="bg-blue-50 border-blue-200">
                              <AlertDescription className="text-blue-800 text-sm">
                                ðŸ’¡ Giáº£ng viÃªn sáº½ xem xÃ©t yÃªu cáº§u cá»§a báº¡n vÃ  thÃ´ng bÃ¡o qua email
                              </AlertDescription>
                            </Alert>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setShowEnrollDialog(false)}>
                              Há»§y
                            </Button>
                            <Button
                              className="bg-[#1E88E5] text-white hover:bg-[#1565C0]"
                              onClick={handleEnrollRequest}
                            >
                              Gá»­i yÃªu cáº§u
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                    <div className="text-center text-sm text-gray-600">
                      {course.lessons} má»¥c nhá»
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Tabs defaultValue="overview">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Tá»•ng quan</TabsTrigger>
            <TabsTrigger value="curriculum">ChÆ°Æ¡ng trÃ¬nh há»c</TabsTrigger>
            {currentUser?.role === 'admin' && (
              <TabsTrigger value="content-preview">
                <Eye className="w-4 h-4 mr-2" />
                Xem ná»™i dung chi tiáº¿t
              </TabsTrigger>
            )}
            <TabsTrigger value="reviews">ÄÃ¡nh giÃ¡</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Báº¡n sáº½ há»c Ä‘Æ°á»£c gÃ¬?</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Náº¯m vá»¯ng cÃ¡c khÃ¡i niá»‡m cÆ¡ báº£n vÃ  nÃ¢ng cao</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>XÃ¢y dá»±ng cÃ¡c dá»± Ã¡n thá»±c táº¿ tá»« Ä‘áº§u Ä‘áº¿n cuá»‘i</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Hiá»ƒu rÃµ cÃ¡c best practices trong ngÃ nh</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Chuáº©n bá»‹ cho cÃ´ng viá»‡c thá»±c táº¿</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>YÃªu cáº§u</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li>â€¢ Kiáº¿n thá»©c cÆ¡ báº£n vá» láº­p trÃ¬nh</li>
                  <li>â€¢ MÃ¡y tÃ­nh cÃ¡ nhÃ¢n</li>
                  <li>â€¢ Tinh tháº§n há»c há»i</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="curriculum">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {mockLessons.map((lesson, index) => (
                    <div key={lesson.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1E88E5]/10 flex items-center justify-center text-sm text-[#1E88E5]">
                          {index + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            {lesson.type === 'video' && <Play className="w-4 h-4 text-gray-500" />}
                            {lesson.type === 'pdf' && <FileText className="w-4 h-4 text-gray-500" />}
                            {lesson.type === 'quiz' && <Award className="w-4 h-4 text-gray-500" />}
                            <span>{lesson.title}</span>
                          </div>
                          <div className="text-sm text-gray-500">{lesson.duration}</div>
                        </div>
                      </div>
                      {lesson.completed && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin Content Preview Tab */}
          {currentUser?.role === 'admin' && (
            <TabsContent value="content-preview">
              <Alert className="mb-6 bg-blue-50 border-blue-200">
                <AlertDescription className="text-blue-800">
                  ðŸ” <strong>Cháº¿ Ä‘á»™ kiá»ƒm duyá»‡t:</strong> Báº¡n Ä‘ang xem trÆ°á»›c ná»™i dung chi tiáº¿t Ä‘á»ƒ Ä‘Ã¡nh giÃ¡ cháº¥t lÆ°á»£ng khÃ³a há»c. ÄÃ¡p Ã¡n quiz sáº½ Ä‘Æ°á»£c hiá»ƒn thá»‹.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Left: Lesson List (2 columns) */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Danh sÃ¡ch bÃ i há»c</CardTitle>
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
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Xem trÆ°á»›c ná»™i dung</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      {!selectedLesson ? (
                        <div className="flex items-center justify-center h-[600px] text-gray-500">
                          <div className="text-center">
                            <Eye className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                            <p>Chá»n má»™t bÃ i há»c Ä‘á»ƒ xem trÆ°á»›c ná»™i dung</p>
                          </div>
                        </div>
                      ) : (
                        <ScrollArea className="h-[600px]">
                          <div className="pr-4">
                            {/* Lesson Header */}
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                              {selectedLesson.type === 'video' && <Video className="w-6 h-6 text-[#1E88E5]" />}
                              {selectedLesson.type === 'text' && <FileText className="w-6 h-6 text-green-600" />}
                              {selectedLesson.type === 'pdf' && <FileText className="w-6 h-6 text-red-600" />}
                              {selectedLesson.type === 'quiz' && <Award className="w-6 h-6 text-orange-600" />}
                              <div>
                                <h3 className="text-lg">{selectedLesson.title}</h3>
                                <p className="text-sm text-gray-500">Thá»i lÆ°á»£ng: {selectedLesson.duration}</p>
                              </div>
                            </div>

                            {/* Video Preview */}
                            {selectedLesson.type === 'video' && selectedLesson.youtubeUrl && (
                              <div className="aspect-video rounded-lg overflow-hidden bg-black">
                                <iframe
                                  src={getYouTubeEmbedUrl(selectedLesson.youtubeUrl)}
                                  className="w-full h-full"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                />
                              </div>
                            )}

                            {/* Text Preview */}
                            {selectedLesson.type === 'text' && selectedLesson.content && (
                              <div className="prose max-w-none">
                                <div className="p-6 bg-gray-50 rounded-lg border">
                                  <pre className="whitespace-pre-wrap text-sm">{selectedLesson.content}</pre>
                                </div>
                              </div>
                            )}

                            {/* PDF Preview */}
                            {selectedLesson.type === 'pdf' && (
                              <div className="space-y-4">
                                <Alert className="bg-blue-50 border-blue-200">
                                  <AlertDescription className="text-blue-800 text-sm">
                                    ðŸ“„ <strong>TÃ i liá»‡u PDF:</strong> {selectedLesson.pdfUrl}
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
                            )}

                            {/* Quiz Preview */}
                            {selectedLesson.type === 'quiz' && selectedLesson.quizQuestions && (
                              <div className="space-y-6">
                                <Alert className="bg-green-50 border-green-200">
                                  <AlertDescription className="text-green-800 text-sm">
                                    âœ… <strong>Cháº¿ Ä‘á»™ kiá»ƒm duyá»‡t:</strong> ÄÃ¡p Ã¡n Ä‘Ãºng Ä‘Æ°á»£c highlight mÃ u xanh Ä‘á»ƒ báº¡n Ä‘Ã¡nh giÃ¡ cháº¥t lÆ°á»£ng cÃ¢u há»i.
                                  </AlertDescription>
                                </Alert>

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
                                            {q.type === 'single' ? 'ðŸ“ Chá»n 1 Ä‘Ã¡p Ã¡n' : 'â˜‘ï¸ Chá»n nhiá»u Ä‘Ã¡p Ã¡n'}
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
                                                  <Badge className="ml-auto bg-green-500 text-white">âœ“ ÄÃ¡p Ã¡n Ä‘Ãºng</Badge>
                                                )}
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                      {q.explanation && (
                                        <div className="ml-14 mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                                          <p className="text-sm"><strong>ðŸ’¡ Giáº£i thÃ­ch:</strong> {q.explanation}</p>
                                        </div>
                                      )}
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            )}
                          </div>
                        </ScrollArea>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          )}

          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>ÄÃ¡nh giÃ¡ tá»« há»c viÃªn</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  ChÆ°a cÃ³ Ä‘Ã¡nh giÃ¡ nÃ o
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

