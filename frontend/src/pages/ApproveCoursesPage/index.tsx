import { useState } from 'react';
import { Eye, CheckCircle, XCircle, Users, BookOpen } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { toast } from 'sonner@2.0.3';
import { mockCourses } from '../../data';
import { Course, Page } from '../../types';

interface ApproveCoursesPageProps {
  navigateTo: (page: Page) => void;
  setSelectedCourse: (course: Course) => void;
}

export function ApproveCoursesPage({ navigateTo, setSelectedCourse }: ApproveCoursesPageProps) {
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [courseToReject, setCourseToReject] = useState<Course | null>(null);
  
  // Only show pending public courses
  const pendingCourses = mockCourses.filter(c => c.status === 'pending' && c.visibility === 'public');

  const handleApproveCourse = (course: Course) => {
    toast.success(`ÄÃ£ duyá»‡t khÃ³a há»c "${course.title}"`);
    // In real app: API call to update course status
  };

  const handleRejectCourse = (course: Course) => {
    setCourseToReject(course);
    setShowRejectDialog(true);
  };

  const confirmReject = () => {
    if (!rejectReason.trim()) {
      toast.error('Vui lÃ²ng nháº­p lÃ½ do tá»« chá»‘i');
      return;
    }
    toast.success(`ÄÃ£ tá»« chá»‘i khÃ³a há»c "${courseToReject?.title}"`);
    setShowRejectDialog(false);
    setRejectReason('');
    setCourseToReject(null);
  };

  const CoursePreviewCard = ({ course }: { course: Course }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        <div className="relative">
          <img src={course.image} alt={course.title} className="w-full h-48 object-cover rounded-t-lg" />
          <Badge 
            className={`absolute top-3 right-3 ${
              course.status === 'pending' ? 'bg-orange-500' :
              course.status === 'approved' ? 'bg-green-500' : 'bg-red-500'
            }`}
          >
            {course.status === 'pending' ? 'Chá» duyá»‡t' :
             course.status === 'approved' ? 'ÄÃ£ duyá»‡t' : 'Tá»« chá»‘i'}
          </Badge>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-3">
            {course.tags.slice(0, 2).map((tag: string) => (
              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
            ))}
          </div>
          <h3 className="mb-2 line-clamp-2">{course.title}</h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
          
          <div className="flex items-center gap-3 mb-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Avatar className="w-6 h-6">
                <AvatarFallback className="text-xs bg-[#1E88E5] text-white">{course.ownerAvatar}</AvatarFallback>
              </Avatar>
              <span>{course.ownerName}</span>
            </div>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {course.students}
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              {course.lessons} má»¥c
            </span>
          </div>

          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              className="flex-1"
              onClick={() => {
                setSelectedCourse(course);
                navigateTo('course-detail');
              }}
            >
              <Eye className="w-4 h-4 mr-1" />
              Xem chi tiáº¿t
            </Button>
            {course.status === 'pending' && (
              <>
                <Button 
                  size="sm"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => handleApproveCourse(course)}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Duyá»‡t
                </Button>
                <Button 
                  size="sm"
                  variant="destructive"
                  onClick={() => handleRejectCourse(course)}
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="mb-2">Duyá»‡t khÃ³a há»c</h1>
        <p className="text-gray-600">Xem xÃ©t vÃ  phÃª duyá»‡t cÃ¡c khÃ³a há»c chá» duyá»‡t</p>
      </div>

      {/* Stats */}
      <div className="mb-8">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl text-orange-500 mb-2">{pendingCourses.length}</div>
            <div className="text-gray-600">KhÃ³a há»c chá» duyá»‡t</div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Courses Grid */}
      {pendingCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingCourses.map(course => (
            <CoursePreviewCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="mb-2">KhÃ´ng cÃ³ khÃ³a há»c chá» duyá»‡t</h3>
            <p className="text-gray-600">Táº¥t cáº£ khÃ³a há»c Ä‘Ã£ Ä‘Æ°á»£c xem xÃ©t</p>
          </CardContent>
        </Card>
      )}

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tá»« chá»‘i khÃ³a há»c</DialogTitle>
            <DialogDescription>
              Vui lÃ²ng cho biáº¿t lÃ½ do tá»« chá»‘i khÃ³a há»c "{courseToReject?.title}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reject-reason">
                LÃ½ do tá»« chá»‘i <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="reject-reason"
                placeholder="VÃ­ dá»¥: Ná»™i dung khÃ´ng phÃ¹ há»£p, vi pháº¡m quy Ä‘á»‹nh..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="mt-2"
                rows={4}
              />
            </div>
            <Alert className="bg-orange-50 border-orange-200">
              <AlertDescription className="text-orange-800 text-sm">
                âš ï¸ NgÆ°á»i táº¡o khÃ³a há»c sáº½ nháº­n Ä‘Æ°á»£c thÃ´ng bÃ¡o tá»« chá»‘i kÃ¨m lÃ½ do nÃ y
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Há»§y
            </Button>
            <Button
              variant="destructive"
              onClick={confirmReject}
            >
              XÃ¡c nháº­n tá»« chá»‘i
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

