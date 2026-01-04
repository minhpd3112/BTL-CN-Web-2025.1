import React, { useState, useEffect } from 'react';
import {
  Star, Users, Clock, Lock, BarChart3, UserPlus, CheckCircle,
  Play, FileText, Award, Video, PlayCircle, Eye, ChevronDown, ChevronUp,
  Share2, MoreVertical, ArrowLeft, BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';
import { Dialog as ConfirmDialog, DialogContent as ConfirmDialogContent, DialogHeader as ConfirmDialogHeader, DialogTitle as ConfirmDialogTitle, DialogFooter as ConfirmDialogFooter } from '@/components/ui/dialog';
import { Course, User, Page } from '@/types';
import { AnimatedSection } from '@/utils/animations';
import { mockUsers } from '@/services/mocks';
import { sectionsAPI, coursesAPI, enrollmentsAPI, reviewsAPI, usersAPI } from '@/services/api';
import { ReviewForm } from '@/components/shared/ReviewForm';
import { StarRating } from '@/components/shared/StarRating';

// Interfaces for curriculum data
interface Lesson {
  id: string;
  title: string;
  description?: string;
  content_type: 'video' | 'text' | 'pdf' | 'quiz' | 'article';
  duration?: number;
  content_url?: string;
  content_text?: string;
  section_id: string;
  order_index: number;
}

interface Section {
  id: string;
  title: string;
  description: string;
  order_index: number;
  course_id: string;
  lessons: Lesson[];
}




interface CourseDetailPageProps {
  course: Course;
  navigateTo: (page: Page) => void;
  currentUser: User;
  canAccess: boolean;
  enrollmentRequests?: any[];
  onEnrollRequest?: (request: any) => void;
  setSelectedUser?: (user: User) => void;
  setSelectedTag?: (tag: any) => void;
}


export function CourseDetailPage({
  course,
  navigateTo,
  currentUser,
  canAccess,
  enrollmentRequests,
  onEnrollRequest,
  setSelectedUser,
  setSelectedTag
}: CourseDetailPageProps) {
  // Robust owner detection
  const isOwner = currentUser && (
    (course.ownerId && course.ownerId === currentUser.id) ||
    (course.owner?.id && course.owner?.id === currentUser.id)
  );
  // Loading state for access check
  // ...
  const [isLoadingAccess, setIsLoadingAccess] = useState(true);
  // Dialog state for leaving course
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showEnrollDialog, setShowEnrollDialog] = useState(false);
  const [enrollMessage, setEnrollMessage] = useState('');
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<'overview' | 'reviews'>('overview');
  // Curriculum state
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoadingCurriculum, setIsLoadingCurriculum] = useState(false);
  const [curriculumExpandedSections, setCurriculumExpandedSections] = useState<string[]>([]);

  // Full course data with overview
  const [fullCourse, setFullCourse] = useState<any>(course);

  // Student count
  const [studentCount, setStudentCount] = useState<number>(0);

  // Reviews state
  const [reviews, setReviews] = useState<any[]>([]);
  const [myReview, setMyReview] = useState<any>(null);
  const [courseProgress, setCourseProgress] = useState<number>(0);
  const [canReview, setCanReview] = useState(false);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [reviewCount, setReviewCount] = useState<number>(0);

  // Actual access control based on enrollment
  const [actualCanAccess, setActualCanAccess] = useState<boolean>(() => {
    // Ưu tiên quyền overrideAccess nếu có
    if ((course as any).overrideAccess) return true;
    return canAccess;
  });
  // ...

  // Check if user has pending request
  const [hasPendingRequest, setHasPendingRequest] = useState(() =>
    enrollmentRequests?.some(
      (req: any) => req.courseId === course.id && req.userId === currentUser?.id && req.status === 'pending'
    ) || false
  );

  // Check if user is already enrolled (will be updated via API)
  const [isEnrolled, setIsEnrolled] = useState(false);


  // Check if user is owner or admin
  const canManage = isOwner || currentUser?.role === 'admin';

  // Handler for leaving the course
  // Find enrollment id for this user & course
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);

  // Fetch enrollments from backend on mount and after join
  useEffect(() => {
    if (!currentUser?.id) return;
    enrollmentsAPI.getMyEnrollments().then((data: any) => {
      const enrollments = Array.isArray(data) ? data : data.data;
      const found = enrollments && Array.isArray(enrollments)
        ? enrollments.find(
          (e) => (e.course_id === course.id || e.courseId === course.id) && (e.status === 'approved') && (e.user_id === currentUser.id || e.userId === currentUser.id)
        )
        : undefined;
      setEnrollmentId(found?.id || null);
      setIsEnrolled(!!found);
    });
    // Only update hasPendingRequest from prop
    setHasPendingRequest(
      enrollmentRequests?.some(
        (req: any) => req.courseId === course.id && req.userId === Number(currentUser?.id) && req.status === 'pending'
      ) || false
    );
  }, [course.id, currentUser?.id, isEnrolled]);

  const handleEnrollRequest = async () => {
    // For public courses, no message required
    if (course.visibility === 'private' && !enrollMessage.trim()) {
      toast.error('Vui lòng nhập lời nhắn');
      return;
    }

    // Gọi API enroll thực tế
    try {
      await enrollmentsAPI.create({
        course_id: course.id,
        request_message: enrollMessage
      });
      // Sau khi join, fetch lại enrollments để cập nhật trạng thái
      const data = await enrollmentsAPI.getMyEnrollments();
      const enrollments = Array.isArray(data) ? data : data.data;
      const found = enrollments && Array.isArray(enrollments)
        ? enrollments.find(
          (e) => (e.course_id === course.id || e.courseId === course.id) && (e.status === 'approved') && (e.user_id === currentUser.id || e.userId === currentUser.id)
        )
        : undefined;
      setIsEnrolled(!!found);
      if (!!found) setActualCanAccess(true);
      setHasPendingRequest(false);
      toast.success('Bạn đã tham gia khóa học thành công!');
    } catch (err: any) {
      if (err?.response?.status === 400 && err?.response?.data?.message?.includes('Already enrolled')) {
        toast.error('Bạn đã tham gia khoá học này!');
        setIsEnrolled(true);
      } else {
        toast.error('Đăng ký thất bại!');
      }
    }
    setShowEnrollDialog(false);
    setEnrollMessage('');
  };

  const handleOwnerClick = async () => {
    if (setSelectedUser && fullCourse?.owner) {
      try {
        // Fetch full user data from API
        const usersRes = await usersAPI.getAllUsers();
        const fullUser = usersRes.data?.find((u: User) => u.id === fullCourse.owner.id);
        
        if (fullUser) {
          setSelectedUser(fullUser);
          navigateTo('user-detail');
        } else {
          // Fallback: create user object from owner data if API fails
          const ownerUser: User = {
            id: fullCourse.owner.id,
            username: fullCourse.owner.full_name,
            name: fullCourse.owner.full_name,
            fullName: fullCourse.owner.full_name,
            full_name: fullCourse.owner.full_name,
            email: '', // Not available from course owner
            avatar: fullCourse.owner.avatar_url || '',
            avatar_url: fullCourse.owner.avatar_url,
            role: 'user',
            joinedDate: '',
            coursesCreated: 0,
            coursesEnrolled: 0,
            totalStudents: 0,
            status: 'active',
            lastLogin: ''
          };
          setSelectedUser(ownerUser);
          navigateTo('user-detail');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Use fallback data on error
        const ownerUser: User = {
          id: fullCourse.owner.id,
          username: fullCourse.owner.full_name,
          name: fullCourse.owner.full_name,
          fullName: fullCourse.owner.full_name,
          full_name: fullCourse.owner.full_name,
          email: '',
          avatar: fullCourse.owner.avatar_url || '',
          avatar_url: fullCourse.owner.avatar_url,
          role: 'user',
          joinedDate: '',
          coursesCreated: 0,
          coursesEnrolled: 0,
          totalStudents: 0,
          status: 'active',
          lastLogin: ''
        };
        setSelectedUser(ownerUser);
        navigateTo('user-detail');
      }
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const toggleCurriculumSection = (sectionId: string) => {
    setCurriculumExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  // Fetch curriculum data
  useEffect(() => {
    const fetchCurriculum = async () => {
      if (!course.id) return;

      setIsLoadingCurriculum(true);
      try {
        const response = await sectionsAPI.getByCourseId(course.id.toString());
        if (response.success && response.data) {
          setSections(response.data);
          // ...existing code...
        }
      } catch (error: any) {
        console.error('Error fetching curriculum:', error);
      } finally {
        setIsLoadingCurriculum(false);
      }
    };

    fetchCurriculum();
  }, [course.id]);

  // Fetch complete course data including overview
  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!course.id) return;

      try {
        const response = await coursesAPI.getCourseById(course.id.toString());
        if (response.success && response.data) {
          setFullCourse(response.data);
          // ...existing code...
        }
      } catch (error: any) {
        console.error('Error fetching course details:', error);
      }
    };

    fetchCourseDetails();
  }, [course.id]);

  // Fetch student count
  useEffect(() => {
    const fetchStudentCount = async () => {
      if (!course.id || !currentUser) return;

      try {
        // Backend now allows enrolled students to view count
        const response = await enrollmentsAPI.getByCourseId(course.id.toString());
        // ...existing code...

        if (response.success && response.data) {
          // Filter for approved enrollments
          const approvedEnrollments = Array.isArray(response.data)
            ? response.data.filter((e: any) => e.status === 'approved')
            : [];

          setStudentCount(approvedEnrollments.length);
          // ...existing code...
        } else {
          // ...existing code...
        }
      } catch (error: any) {
        console.error('Error fetching student count:', error);
        // If error (e.g., not enrolled), set to 0
        setStudentCount(0);
      }
    };

    fetchStudentCount();
  }, [course.id, currentUser]);

  // Check actual enrollment status for non-owners
  useEffect(() => {
    // Nếu overrideAccess thì luôn cho truy cập
    if ((course as any).overrideAccess) {
      setActualCanAccess(true);
      setIsLoadingAccess(false);
      return;
    }
    const checkEnrollment = async () => {
      if (!currentUser || isOwner || currentUser.role === 'admin') {
        setActualCanAccess(true);
        setIsLoadingAccess(false);
        return;
      }

      try {
        const response = await enrollmentsAPI.getMyEnrollments();
        if (response.success && response.data) {
          const isEnrolledInCourse = response.data.some(
            (enrollment: any) =>
              enrollment.course_id === course.id &&
              enrollment.status === 'approved'
          );
          setIsEnrolled(isEnrolledInCourse);
          setActualCanAccess(isEnrolledInCourse || course.visibility === 'public');
        } else {
          setActualCanAccess(course.visibility === 'public');
        }
      } catch (error: any) {
        console.error('Error checking enrollment:', error);
        setActualCanAccess(course.visibility === 'public');
      } finally {
        setIsLoadingAccess(false);
      }
    };

    checkEnrollment();
  }, [course.id, currentUser, isOwner, course.visibility, course]);

  // Fetch course reviews
  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoadingReviews(true);
      try {
        const response = await reviewsAPI.getByCourseId(course.id.toString());
        if (response.success) {
          setReviews(response.data.reviews || []);
          // Save rating stats
          if (response.data.stats) {
            setAverageRating(response.data.stats.average || 0);
            setReviewCount(response.data.stats.count || 0);
          }
        }
      } catch (error: any) {
        console.error('Error fetching reviews:', error);
      } finally {
        setIsLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [course.id]);

  // Fetch user's review and check if they can review
  useEffect(() => {
    const checkReviewEligibility = async () => {
      // ...existing code...

      if (!currentUser || !isEnrolled) {
        // ...existing code...
        setCanReview(false);
        return;
      }

      // Get user's existing review (don't let errors block progress check)
      try {
        const reviewResponse = await reviewsAPI.getUserReview(
          currentUser.id.toString(),
          course.id.toString()
        );
        if (reviewResponse.success && reviewResponse.data) {
          setMyReview(reviewResponse.data);
          // ...existing code...
        }
      } catch (error: any) {
        // ...existing code...
        setMyReview(null);
      }

      // Get course progress (separate try-catch to ensure it always runs)
      try {
        const progressResponse = await enrollmentsAPI.getMyEnrollments();
        if (progressResponse.success && progressResponse.data) {
          // ...existing code...

          const enrollment = progressResponse.data.find(
            (e: any) => {
              // ...existing code...
              return e.course_id === course.id || e.course_id.toString() === course.id.toString();
            }
          );

          // ...existing code...

          if (enrollment?.progress) {
            const percentage = enrollment.progress.percentage || 0;
            const completed = enrollment.progress.completed || 0;
            const total = enrollment.progress.total || 0;
            // ...existing code...
            setCourseProgress(percentage);
            // Can review if completed all lessons OR percentage is 100
            const isCompleted = total > 0 && completed >= total;
            setCanReview(isCompleted || percentage >= 100);
          } else {
            // ...existing code...
            setCourseProgress(0);
            setCanReview(false);
          }
        }
      } catch (error: any) {
        console.error('Error fetching progress:', error);
        setCourseProgress(0);
        setCanReview(false);
      }
    };

    checkReviewEligibility();
  }, [currentUser, isEnrolled, course.id]);

  // Fetch enrollment ID for leaving course
  useEffect(() => {
    if (!currentUser?.id) return;
    enrollmentsAPI.getMyEnrollments().then((data: any) => {
      const enrollments = Array.isArray(data) ? data : data.data;
      const found = enrollments && Array.isArray(enrollments)
        ? enrollments.find(
          (e) => (e.course_id === course.id || e.courseId === course.id) && (e.status === 'approved') && (e.user_id === currentUser.id || e.userId === currentUser.id)
        )
        : undefined;
      setEnrollmentId(found?.id || null);
    });
  }, [course.id, currentUser?.id, isEnrolled]);

  // Calculate total course duration based on lesson types
  const calculateCourseDuration = () => {
    let totalMinutes = 0;
    sections.forEach(section => {
      section.lessons?.forEach(lesson => {
        switch (lesson.content_type) {
          case 'text':
          case 'article':
            totalMinutes += 3;
            break;
          case 'quiz':
            totalMinutes += 5;
            break;
          case 'video':
            totalMinutes += 20;
            break;
          case 'pdf':
            totalMinutes += 5;
            break;
          default:
            totalMinutes += 5;
        }
      });
    });

    // Convert to hours and minutes
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) {
      return `${hours} giờ${minutes > 0 ? ` ${minutes} phút` : ''}`;
    }
    return `${minutes} phút`;
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.includes('youtube.com') ? url.split('v=')[1]?.split('&')[0] : url;
    return `https://www.youtube.com/embed/${videoId}`;
  };

  if (isLoadingAccess) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E88E5] mr-4" />
        <span className="text-[#1E88E5] text-lg font-medium">Đang kiểm tra quyền truy cập...</span>
      </div>
    );
  }
  if (!actualCanAccess) {
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

  const handleLeaveCourse = async () => {
    if (!enrollmentId) {
      toast.error('Không tìm thấy thông tin tham gia khoá học!');
      return;
    }
    try {
      await enrollmentsAPI.leaveCourse(enrollmentId);
      setIsEnrolled(false);
      toast.success('Bạn đã rời khỏi khoá học.');
    } catch (err) {
      toast.error('Rời khoá học thất bại!');
    }
    setShowLeaveDialog(false);
  };

  return (
    <div>
      {/* Hero Header */}
      <div className="bg-[#1E88E5] -mt-6 pt-8 pb-12 mb-8 text-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6">
            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Left Column: Course Info */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    const tags = fullCourse.tags || course.tags || [];

                    return tags.slice(0, 3).map((item: any, index: number) => {
                      // Handle nested structure: {tag: {name: 'React'}} or direct {name: 'React'} or string
                      const tagData = typeof item === 'string' ? null : (item.tag || item);
                      const tagName = typeof item === 'string'
                        ? item
                        : (item.tag?.name || item.name || item.tag_name || '');

                      if (!tagName) return null;

                      return (
                        <Badge 
                          key={index} 
                          className="bg-white/20 hover:bg-white/30 text-white border-none rounded-md px-3 py-1 font-normal cursor-pointer transition-all hover:scale-105"
                          onClick={() => {
                            if (setSelectedTag && tagData) {
                              setSelectedTag(tagData);
                              navigateTo('tag-detail');
                            }
                          }}
                        >
                          {tagName}
                        </Badge>
                      );
                    });
                  })()}

                  {course.visibility === 'private' && (
                    <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-none rounded-md px-3 py-1 font-normal gap-1">
                      <Lock className="w-3 h-3" />
                      Riêng tư
                    </Badge>
                  )}
                </div>

                <div className="space-y-4">
                  <h1 className="text-3xl md:text-4xl font-bold leading-tight">{course.title}</h1>
                  <p className="text-lg text-blue-100 font-medium opacity-90">
                    {course.description || "Học cách thiết kế giao diện người dùng đẹp mắt và trải nghiệm tốt"}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <div
                    className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={handleOwnerClick}
                  >
                    <Avatar className="w-8 h-8 border-2 border-white/20">
                      {fullCourse?.owner?.avatar_url ? (
                        <img
                          src={fullCourse.owner.avatar_url}
                          alt={fullCourse.owner.full_name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <AvatarFallback className="bg-white text-[#1E88E5] font-bold">{fullCourse?.owner?.full_name?.[0] || 'G'}</AvatarFallback>
                      )}
                    </Avatar>
                    <span className="font-medium hover:underline decoration-1 underline-offset-2">{fullCourse?.owner?.full_name || 'Giảng viên'}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold">{averageRating.toFixed(1)}</span>
                    <span className="text-sm opacity-75">({reviewCount} đánh giá)</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    <span>{studentCount} học viên</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>{sections.length > 0 ? calculateCourseDuration() : (course.duration || "8 tuần")}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Course Card */}
              <div className="hidden lg:block lg:col-span-1">
                <Card className="bg-white overflow-hidden shadow-xl border-none translate-y-8">
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={course.image || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60"}
                      alt={course.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <CardContent className="p-4">
                    {(() => {
                      // ...existing code...
                      return (isOwner || currentUser?.role === 'admin');
                    })() ? (
                      <Button
                        className="w-full bg-[#1E88E5] hover:bg-[#1565C0] text-white h-11 shadow-md hover:shadow-lg transition-all duration-300"
                        onClick={() => navigateTo('learning')}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Xem nội dung
                      </Button>
                    ) : isEnrolled ? (
                      <>
                        <Button
                          className="w-full bg-[#1E88E5] hover:bg-[#1565C0] text-white h-11 shadow-md hover:shadow-lg transition-all duration-300"
                          onClick={() => navigateTo('learning')}
                        >
                          <PlayCircle className="w-4 h-4 mr-2" />
                          Đã tham gia
                        </Button>
                        <Button
                          className="w-full mt-2 bg-gray-200 text-gray-700 hover:bg-gray-300 h-10"
                          variant="outline"
                          onClick={() => setShowLeaveDialog(true)}
                        >
                          Rời khóa học
                        </Button>
                        <ConfirmDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
                          <ConfirmDialogContent>
                            <ConfirmDialogHeader>
                              <ConfirmDialogTitle>Bạn có chắc chắn muốn rời khoá học này?</ConfirmDialogTitle>
                            </ConfirmDialogHeader>
                            <div className="py-4 text-gray-700">Sau khi rời, bạn sẽ không thể truy cập nội dung khoá học này nữa.</div>
                            <ConfirmDialogFooter>
                              <Button variant="outline" onClick={() => setShowLeaveDialog(false)}>Huỷ</Button>
                              <Button className="bg-red-600 text-white hover:bg-red-700" onClick={handleLeaveCourse}>Xác nhận rời khoá</Button>
                            </ConfirmDialogFooter>
                          </ConfirmDialogContent>
                        </ConfirmDialog>
                      </>
                    ) : hasPendingRequest ? (
                      <Button
                        className="w-full h-11"
                        variant="outline"
                        disabled
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        Đang chờ duyệt
                      </Button>
                    ) : (
                      <Dialog open={showEnrollDialog} onOpenChange={setShowEnrollDialog}>
                        <DialogTrigger asChild>
                          <Button className="w-full bg-[#1E88E5] hover:bg-[#1565C0] text-white h-11 shadow-md hover:shadow-lg transition-all duration-300">
                            <UserPlus className="w-4 h-4 mr-2" />
                            {course.visibility === 'public' ? 'Tham gia học' : 'Đăng ký học'}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              {course.visibility === 'public' ? 'Tham gia khóa học' : 'Đăng ký học khóa học'}
                            </DialogTitle>
                            <DialogDescription>
                              {course.visibility === 'public'
                                ? 'Nhấn xác nhận để tham gia khóa học ngay'
                                : 'Gửi yêu cầu tham gia khóa học đến người tạo'}
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
                            {course.visibility === 'private' && (
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
                            )}
                          </div>

                          <DialogFooter>
                            <Button variant="outline" onClick={() => setShowEnrollDialog(false)}>
                              Hủy
                            </Button>
                            <Button
                              className="bg-[#1E88E5] text-white hover:bg-[#1565C0]"
                              onClick={handleEnrollRequest}
                            >
                              {course.visibility === 'public' ? 'Xác nhận' : 'Gửi yêu cầu'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        <Tabs defaultValue="overview" onValueChange={(v) => setActiveDetailTab(v as 'overview' | 'reviews')}>
          <TabsList className="mb-6 bg-[#1E88E5]/10 p-0 rounded-full h-auto inline-flex relative overflow-hidden">
            {/* Sliding indicator */}
            <div
              className="absolute top-0 bottom-0 bg-gradient-to-r from-[#1E88E5] to-[#1565C0] rounded-full shadow-lg shadow-blue-300/50 transition-all duration-300 ease-out"
              style={{
                left: activeDetailTab === 'overview' ? '0%' : '50%',
                width: '50%',
              }}
            />
            <TabsTrigger
              value="overview"
              className="relative z-10 flex-1 min-w-[120px] px-4 py-2.5 rounded-full font-medium transition-all duration-300 hover:bg-[#1E88E5]/10 data-[state=active]:bg-transparent data-[state=active]:shadow-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0"
              style={{ color: activeDetailTab === 'overview' ? '#FFFFFF' : '#1E88E5' }}
            >
              Tổng quan
            </TabsTrigger>

            {/* Luôn hiển thị tab Đánh giá cho owner, admin, học viên */}
            <TabsTrigger
              value="reviews"
              className="relative z-10 flex-1 min-w-[120px] px-4 py-2.5 rounded-full font-medium transition-all duration-300 hover:bg-[#1E88E5]/10 data-[state=active]:bg-transparent data-[state=active]:shadow-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0"
              style={{ color: activeDetailTab === 'reviews' ? '#FFFFFF' : '#1E88E5' }}
            >
              Đánh giá
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {/* Course Overview */}
            <Card className="hover:shadow-lg transition-shadow duration-300 mb-6">
              <CardHeader className="border-b bg-gradient-to-r from-[#1E88E5]/5 to-transparent">
                <CardTitle className="text-lg font-bold text-[#1E88E5]">Tổng quan khóa học</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {fullCourse.overview ? (
                  <div className="prose max-w-none">
                    {fullCourse.overview.split('\n').map((line: string, index: number) => {
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

            {/* Curriculum */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="border-b bg-gradient-to-r from-[#1E88E5]/5 to-transparent">
                <CardTitle className="text-lg font-bold text-[#1E88E5] flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Nội dung khóa học
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {isLoadingCurriculum ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E88E5] mx-auto"></div>
                    <p className="text-gray-500 mt-4">Đang tải nội dung...</p>
                  </div>
                ) : sections.length > 0 ? (
                  <div className="space-y-3">
                    {sections.map((section, sectionIdx) => {
                      const isExpanded = curriculumExpandedSections.includes(section.id);
                      const lessonCount = section.lessons?.length || 0;

                      return (
                        <Card key={section.id} className="border-2 hover:border-[#1E88E5]/30 transition-colors">
                          <Collapsible
                            open={isExpanded}
                            onOpenChange={() => toggleCurriculumSection(section.id)}
                          >
                            <CollapsibleTrigger asChild>
                              <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3 flex-1">
                                  <div className="w-8 h-8 rounded-full bg-[#1E88E5] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                                    {sectionIdx + 1}
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900">{section.title}</h4>
                                    <p className="text-sm text-gray-500 mt-1">
                                      {lessonCount} bài học
                                    </p>
                                  </div>
                                </div>
                                {isExpanded ? (
                                  <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                ) : (
                                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                )}
                              </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="px-4 pb-4 space-y-2 border-t">
                                {section.lessons && section.lessons.length > 0 ? (
                                  section.lessons.map((lesson, lessonIdx) => {
                                    const getIcon = () => {
                                      switch (lesson.content_type) {
                                        case 'video':
                                          return <Video className="w-4 h-4 text-[#1E88E5]" />;
                                        case 'text':
                                        case 'article':
                                          return <FileText className="w-4 h-4 text-green-600" />;
                                        case 'pdf':
                                          return <FileText className="w-4 h-4 text-red-600" />;
                                        case 'quiz':
                                          return <Award className="w-4 h-4 text-orange-600" />;
                                        default:
                                          return <Play className="w-4 h-4 text-gray-600" />;
                                      }
                                    };

                                    return (
                                      <div
                                        key={lesson.id}
                                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors mt-2"
                                      >
                                        <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-xs flex-shrink-0 font-medium">
                                          {lessonIdx + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2">
                                            {getIcon()}
                                            <span className="text-sm text-gray-700 truncate">{lesson.title}</span>
                                          </div>
                                          {lesson.duration && (
                                            <div className="text-xs text-gray-500 mt-1">
                                              <Clock className="w-3 h-3 inline mr-1" />
                                              {lesson.duration} phút
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })
                                ) : (
                                  <div className="text-center py-6 text-gray-500 text-sm">
                                    Chưa có bài học nào trong mục này
                                  </div>
                                )}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                    <p>Chưa có nội dung khóa học</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">

            {/* Review Form - Chỉ cho phép học viên đã học, không phải owner/admin */}
            {canReview && !myReview && !isOwner && currentUser?.role !== 'admin' && (
              <ReviewForm
                courseId={course.id.toString()}
                onSuccess={() => {
                  // Refresh reviews after submission
                  reviewsAPI.getByCourseId(course.id.toString()).then(response => {
                    if (response.success) {
                      setReviews(response.data.reviews || []);
                    }
                  });
                  // Reload user review
                  reviewsAPI.getUserReview(currentUser!.id.toString(), course.id.toString()).then(response => {
                    if (response.success && response.data) {
                      setMyReview(response.data);
                    }
                  });
                }}
              />
            )}

            {/* Edit existing review */}
            {myReview && (
              <ReviewForm
                courseId={course.id.toString()}
                existingReview={myReview}
                onSuccess={() => {
                  // Refresh reviews after edit
                  reviewsAPI.getByCourseId(course.id.toString()).then(response => {
                    if (response.success) {
                      setReviews(response.data.reviews || []);
                    }
                  });
                  // Reload user review
                  reviewsAPI.getUserReview(currentUser!.id.toString(), course.id.toString()).then(response => {
                    if (response.success && response.data) {
                      setMyReview(response.data);
                    }
                  });
                }}
              />
            )}


            {/* Message for non-eligible users (chỉ cho học viên, không phải owner/admin) */}
            {isEnrolled && !canReview && !isOwner && currentUser?.role !== 'admin' && (
              <Alert className="mb-6">
                <AlertDescription>
                  Bạn cần hoàn thành 100% khóa học để có thể đánh giá.
                  Tiến độ hiện tại: <strong>{courseProgress.toFixed(0)}%</strong>
                </AlertDescription>
              </Alert>
            )}

            {/* Reviews List */}
            <Card>
              <CardHeader className="border-b bg-gradient-to-r from-[#1E88E5]/5 to-transparent">
                <CardTitle className="text-lg font-bold text-[#1E88E5]">
                  Đánh giá từ học viên
                  {reviews.length > 0 && ` (${reviews.length})`}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {isLoadingReviews ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E88E5] mx-auto"></div>
                    <p className="text-gray-500 mt-4">Đang tải đánh giá...</p>
                  </div>
                ) : reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review: any) => (
                      <div key={review.id} className="border-b last:border-0 pb-6 last:pb-0">
                        <div className="flex items-start gap-4">
                          {/* Avatar */}
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={review.user?.avatar_url} />
                            <AvatarFallback className="bg-[#1E88E5] text-white">
                              {review.user?.full_name?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>

                          {/* Review Content */}
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h4 className="font-semibold text-gray-900">
                                  {review.user?.full_name || 'Anonymous'}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  {new Date(review.created_at).toLocaleDateString('vi-VN')}
                                </p>
                              </div>
                              <StarRating rating={review.rating} readonly size="sm" />
                            </div>
                            <p className="text-gray-700 whitespace-pre-wrap">{review.comment}</p>

                            {/* Delete button for own review or admin */}
                            {(review.user_id === currentUser?.id || currentUser?.role === 'admin') && (
                              <button
                                onClick={async () => {
                                  if (window.confirm('Bạn có chắc muốn xóa đánh giá này?')) {
                                    try {
                                      await reviewsAPI.delete(review.id);
                                      toast.success('Xóa đánh giá thành công');
                                      // Refresh reviews
                                      const response = await reviewsAPI.getByCourseId(course.id.toString());
                                      if (response.success) {
                                        setReviews(response.data.reviews || []);
                                      }
                                      if (review.user_id === currentUser?.id) {
                                        setMyReview(null);
                                      }
                                    } catch (error: any) {
                                      toast.error('Không thể xóa đánh giá');
                                    }
                                  }
                                }}
                                className="text-sm text-red-600 hover:text-red-700 mt-2"
                              >
                                Xóa đánh giá
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Star className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                    <p>Chưa có đánh giá nào cho khóa học này</p>
                    {canReview && <p className="text-sm mt-2">Hãy là người đầu tiên đánh giá!</p>}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin Content Preview Tab - Disabled: Requires proper mock data or real implementation */}
          {false && currentUser?.role === 'admin' && (
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
                          {sections.map((section) => (
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
                                        className={`w-full text-left p-3 rounded-lg border transition-colors ${selectedLesson?.id === lesson.id
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
                                              {lesson.content_type === 'video' && <Video className="w-4 h-4 text-[#1E88E5]" />}
                                              {lesson.content_type === 'text' && <FileText className="w-4 h-4 text-green-600" />}
                                              {lesson.content_type === 'pdf' && <FileText className="w-4 h-4 text-red-600" />}
                                              {lesson.content_type === 'quiz' && <Award className="w-4 h-4 text-orange-600" />}
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
                      {selectedLesson.content_type === 'video' && selectedLesson.content_url && (
                        <Card>
                          <CardContent className="p-0">
                            <div className="aspect-video rounded-lg overflow-hidden bg-black">
                              <iframe
                                src={getYouTubeEmbedUrl(selectedLesson.content_url)}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Text Preview */}
                      {selectedLesson.content_type === 'text' && selectedLesson.content_text && (
                        <Card>
                          <CardContent className="p-6">
                            <div className="prose max-w-none">
                              <div className="p-6 bg-gray-50 rounded-lg border">
                                <pre className="whitespace-pre-wrap text-sm">{selectedLesson.content_text}</pre>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* PDF Preview */}
                      {selectedLesson.content_type === 'pdf' && (
                        <Card>
                          <CardContent className="p-6">
                            <div className="space-y-4">
                              <Alert className="bg-blue-50 border-blue-200">
                                <AlertDescription className="text-blue-800 text-sm">
                                  📄 <strong>Tài liệu PDF:</strong> {selectedLesson.content_url}
                                </AlertDescription>
                              </Alert>
                              <div className="aspect-[3/4] rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                                <div className="text-center text-gray-500">
                                  <FileText className="w-20 h-20 text-gray-300 mx-auto mb-3" />
                                  <p className="text-sm">PDF Preview</p>
                                  <p className="text-xs mt-1">{selectedLesson.content_url}</p>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Quiz Preview */}
                      {selectedLesson.content_type === 'quiz' && selectedLesson.quizQuestions && (
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
                                        className={`p-4 rounded-lg border-2 transition-all ${isCorrect
                                          ? 'border-green-500 bg-green-50'
                                          : 'border-gray-200 bg-white'
                                          }`}
                                      >
                                        <div className="flex items-center gap-3">
                                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isCorrect ? 'border-green-500 bg-green-500' : 'border-gray-300'
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
        </Tabs>
      </div>
    </div>
  );
}
