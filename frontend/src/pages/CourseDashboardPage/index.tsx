import { useState } from 'react';
import {
  BarChart3,
  Users,
  Settings,
  ArrowLeft,
  Share2,
  MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { OverviewTab } from './components/OverviewTab';
import { EditCourseTab } from './components/EditCourseTab';
import { CourseStudentsTab } from './components/CourseStudentsTab';
import { toast } from 'sonner';
import { Course, Page, User } from '@/types';

interface CourseDashboardPageProps {
  course: Course;
  navigateTo: (page: Page, course?: any) => void;
  enrollmentRequests?: any[];
  onApproveRequest?: (id: number) => void;
  onRejectRequest?: (id: number) => void;
  currentUser: User;
}

export function CourseDashboardPage({
  course,
  navigateTo,
  enrollmentRequests = [],
  onApproveRequest,
  onRejectRequest,
  currentUser
}: CourseDashboardPageProps) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <h2 className="text-2xl font-bold mb-4">Không tìm thấy khóa học</h2>
        <Button onClick={() => navigateTo('my-courses')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
      </div>
    );
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Đã sao chép liên kết khóa học');
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateTo('my-courses')}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold truncate max-w-xl">{course.title}</h1>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${course.visibility === 'public'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700'
                }`}>
                {course.visibility === 'public' ? 'Công khai' : 'Riêng tư'}
              </span>
            </div>
            <p className="text-gray-500 text-sm">
              Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" />
            Chia sẻ
          </Button>
          <Button
            className="bg-[#1E88E5] hover:bg-[#1565C0] text-white"
            onClick={() => navigateTo('course-detail', course)}
          >
            Xem với tư cách học viên
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white">
              <DropdownMenuItem className="text-red-600 focus:text-red-600">
                Xóa khóa học
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Tổng quan
          </TabsTrigger>
          <TabsTrigger value="content" className="gap-2">
            <Settings className="w-4 h-4" />
            Nội dung
          </TabsTrigger>
          <TabsTrigger value="students" className="gap-2">
            <Users className="w-4 h-4" />
            Học viên
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <OverviewTab
            course={course}
            enrollmentRequests={enrollmentRequests}
          />
        </TabsContent>

        <TabsContent value="content" className="mt-6">
          <EditCourseTab
            course={course}
            currentUser={currentUser}
            navigateTo={navigateTo}
          />
        </TabsContent>

        <TabsContent value="students" className="mt-6">
          <CourseStudentsTab
            course={course}
            enrollmentRequests={enrollmentRequests}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
