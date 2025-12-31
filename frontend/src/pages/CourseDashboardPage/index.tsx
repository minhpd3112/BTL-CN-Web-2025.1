import { useState } from 'react';
import {
  ArrowLeft,
  Share2,
  MoreVertical,
  Eye,
  BarChart3,
  Settings,
  Users
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
  onApproveRequest?: (id: string) => void;
  onRejectRequest?: (id: string) => void;
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
  const [activeTab, setActiveTab] = useState(currentUser.role === 'admin' ? 'content' : 'overview');

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

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleShare}
            className="bg-white border-[#1E88E5] text-[#1E88E5] hover:bg-[#1E88E5]/10 shadow-sm hover:shadow-md transition-all"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Chia sẻ
          </Button>
          <Button
            className="bg-gradient-to-r from-[#1E88E5] to-[#1565C0] text-white shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
            onClick={() => navigateTo('course-detail', course)}
          >
            Xem với tư cách học viên
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-[#1E88E5]/10 p-0 rounded-full h-auto inline-flex relative overflow-hidden">
          {/* Sliding indicator */}
          <div
            className="absolute top-0 bottom-0 bg-gradient-to-r from-[#1E88E5] to-[#1565C0] rounded-full shadow-lg shadow-blue-300/50 transition-all duration-300 ease-out"
            style={{
              left: currentUser.role === 'admin'
                ? (activeTab === 'content' ? '0%' : '50%')
                : (activeTab === 'overview' ? '0%' : activeTab === 'content' ? '33.33%' : '66.66%'),
              width: currentUser.role === 'admin' ? '50%' : '33.33%',
            }}
          />
          {currentUser.role !== 'admin' && (
            <TabsTrigger
              value="overview"
              className="relative z-10 flex-1 min-w-[120px] px-4 py-2.5 rounded-full font-medium transition-all duration-300 hover:bg-[#1E88E5]/10 data-[state=active]:bg-transparent data-[state=active]:shadow-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 gap-2"
              style={{ color: activeTab === 'overview' ? '#FFFFFF' : '#1E88E5' }}
            >
              <BarChart3 className="w-4 h-4" />
              Tổng quan
            </TabsTrigger>
          )}
          <TabsTrigger
            value="content"
            className="relative z-10 flex-1 min-w-[120px] px-4 py-2.5 rounded-full font-medium transition-all duration-300 hover:bg-[#1E88E5]/10 data-[state=active]:bg-transparent data-[state=active]:shadow-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 gap-2"
            style={{ color: activeTab === 'content' ? '#FFFFFF' : '#1E88E5' }}
          >
            <Settings className="w-4 h-4" />
            Nội dung
          </TabsTrigger>
          <TabsTrigger
            value="students"
            className="relative z-10 flex-1 min-w-[120px] px-4 py-2.5 rounded-full font-medium transition-all duration-300 hover:bg-[#1E88E5]/10 data-[state=active]:bg-transparent data-[state=active]:shadow-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 gap-2"
            style={{ color: activeTab === 'students' ? '#FFFFFF' : '#1E88E5' }}
          >
            <Users className="w-4 h-4" />
            Học viên
          </TabsTrigger>
        </TabsList>

        {currentUser.role !== 'admin' && (
          <TabsContent value="overview" className="mt-6">
            <OverviewTab
              course={course}
              enrollmentRequests={enrollmentRequests}
            />
          </TabsContent>
        )}

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
