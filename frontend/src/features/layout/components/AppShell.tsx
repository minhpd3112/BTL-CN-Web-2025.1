import { useState, useEffect } from 'react';
import { GraduationCap, BookOpen, BarChart3, FileCheck, Search, Plus, Bell, Menu, X as XIcon, LogOut, User, CheckCircle, UserPlus, Clock, Share2, Award, AlertCircle, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Toaster } from '@/components/ui/sonner';

// Import Pages
import { HomePage } from '@/pages/HomePage';
import { MyCoursesPage } from '@/pages/MyCoursesPage';
import { ExplorePage } from '@/pages/ExplorePage';
import { CourseDetailPage } from '@/pages/CourseDetailPage';
import { AdminDashboardPage } from '@/pages/AdminDashboardPage';
import { ApproveCoursesPage } from '@/pages/ApproveCoursesPage';
import { CreateCoursePage } from '@/pages/CreateCoursePage';
import { CourseDashboardPage } from '@/pages/CourseDashboardPage';
import { LearningPage } from '@/pages/LearningPage';
import { QuizPage } from '@/pages/QuizPage';
import { ManageTagsPage } from '@/pages/ManageTagsPage';
import { ManageUsersPage } from '@/pages/ManageUsersPage';
import { CourseStudentsPage } from '@/pages/CourseStudentsPage';
import { EditCoursePage } from '@/pages/EditCoursePage';
import { ManageCoursesPage } from '@/pages/ManageCoursesPage';
import { UserDetailPage } from '@/pages/UserDetailPage';
import { AccountSettingsPage } from '@/pages/AccountSettingsPage';
import { TopicDetailPage } from '@/pages/TopicDetailPage';

interface AppShellProps {
  state: {
    currentUser: any;
    currentPage: any;
    selectedCourse: any;
    selectedUser: any;
    selectedTag: any;
    sidebarOpen: boolean;
    userGooglePicture: string | null;
    notifications: any[];
    showNotifications: boolean;
    enrollmentRequests: any[];
    currentRole: string;
    unreadCount: number;
  };
  actions: {
    navigateTo: (page: any, course?: any) => void;
    handleLogout: () => void;
    setSelectedCourse: (course: any) => void;
    setSelectedUser: (user: any) => void;
    setSelectedTag: (tag: any) => void;
    setSidebarOpen: (open: boolean) => void;
    setShowNotifications: (show: boolean) => void;
    markAsRead: (id: number) => void;
    markAllAsRead: () => void;
    handleNotificationClick: (notification: any) => void;
    isOwner: (course: any) => boolean;
    canAccessCourse: (course: any) => boolean;
    handleApproveRequest: (id: number) => void;
    handleRejectRequest: (id: number) => void;
    handleEnrollRequest: (request: any) => void;
  };
}

export function AppShell({ state, actions }: AppShellProps) {
  const {
    currentUser,
    currentPage,
    selectedCourse,
    selectedUser,
    selectedTag,
    sidebarOpen,
    userGooglePicture,
    notifications,
    showNotifications,
    enrollmentRequests,
    currentRole,
    unreadCount,
  } = state;

  const {
    navigateTo,
    handleLogout,
    setSelectedCourse,
    setSelectedUser,
    setSelectedTag,
    setSidebarOpen,
    setShowNotifications,
    markAsRead,
    markAllAsRead,
    handleNotificationClick,
    isOwner,
    canAccessCourse,
    handleApproveRequest,
    handleRejectRequest,
    handleEnrollRequest,
  } = actions;

  // Avatar dropdown state
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [isAvatarHovered, setIsAvatarHovered] = useState(false);
  const [isAvatarPinned, setIsAvatarPinned] = useState(false);

  // Auto-close dropdown when page changes
  useEffect(() => {
    setShowAvatarMenu(false);
    setIsAvatarPinned(false);
  }, [currentPage]);

  // Handle hover state with delay to prevent flickering
  useEffect(() => {
    if (isAvatarHovered || isAvatarPinned) {
      setShowAvatarMenu(true);
    } else {
      // Add a small delay before closing to allow smooth transition
      const timeoutId = setTimeout(() => {
        setShowAvatarMenu(false);
      }, 150);
      return () => clearTimeout(timeoutId);
    }
  }, [isAvatarHovered, isAvatarPinned]);

  return (
    <div className="min-h-screen bg-[#F5F6F8]">
      <Toaster />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
                {sidebarOpen ? <XIcon className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              
              {/* Enhanced Logo */}
              <div 
                className="flex items-center gap-3 cursor-pointer group" 
                onClick={() => navigateTo('home')}
              >
                <div className="relative">
                  <GraduationCap 
                    className="w-10 h-10 text-[#1E88E5] transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" 
                  />
                  <div className="absolute -inset-1 bg-[#1E88E5]/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="flex flex-col">
                  <span 
                    className="transition-all duration-300"
                    style={{
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #1E88E5 0%, #1565C0 50%, #0D47A1 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      letterSpacing: '-0.02em'
                    }}
                  >
                    EduLearn
                  </span>
                  <span className="text-xs text-gray-500 hidden sm:block" style={{ marginTop: '-4px' }}>
                    Học tập không giới hạn
                  </span>
                </div>
              </div>

              <nav className="hidden lg:flex items-center gap-3 ml-8">
                {currentRole !== 'admin' && (
                  <Button 
                    onClick={() => navigateTo('explore')} 
                    className="bg-[#1E88E5] hover:bg-[#1565C0] text-white hover-lift-sm"
                    style={{
                      boxShadow: '0 4px 12px rgba(30, 136, 229, 0.3)'
                    }}
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Khám phá
                  </Button>
                )}
                {currentRole === 'admin' && (
                  <Button 
                    onClick={() => navigateTo('admin-dashboard')} 
                    className="bg-[#1E88E5] hover:bg-[#1565C0] text-white hover-lift-sm"
                    style={{
                      boxShadow: '0 4px 12px rgba(30, 136, 229, 0.3)'
                    }}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                )}
                <Button 
                  onClick={() => navigateTo('create-course')} 
                  className="bg-[#1E88E5] hover:bg-[#1565C0] text-white hover-lift-sm"
                  style={{
                    boxShadow: '0 4px 12px rgba(30, 136, 229, 0.3)'
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Tạo khóa học
                </Button>
              </nav>
            </div>

            <div className="flex items-center gap-3">

              <Popover open={showNotifications} onOpenChange={setShowNotifications}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'animate-bell-shake' : ''}`} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-xs rounded-full px-1 animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-96 p-0" align="end">
                  <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-medium">Thông báo</h3>
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} className="text-sm text-[#1E88E5] hover:underline">
                        Đánh dấu đã đọc
                      </button>
                    )}
                  </div>
                  {notifications.length > 0 ? (
                    <ScrollArea className="h-[400px]">
                      <div className="divide-y">
                        {notifications.map(notification => {
                          const iconMap: Record<string, any> = {
                            CheckCircle,
                            UserPlus,
                            Clock,
                            Share2,
                            Award,
                            Bell,
                            FileCheck,
                            AlertCircle,
                            TrendingUp,
                            X: XIcon
                          };
                          const IconComponent = iconMap[notification.icon] || Bell;
                          return (
                            <button
                              key={notification.id}
                              className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-blue-50/50' : ''}`}
                              onClick={() => {
                                handleNotificationClick(notification);
                                setShowNotifications(false);
                              }}
                            >
                              <div className="flex gap-3">
                                <div className={`flex-shrink-0 mt-1 ${notification.color}`}>
                                  <IconComponent className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm mb-1 ${!notification.read ? 'font-medium' : ''}`}>{notification.title}</p>
                                  <p className="text-sm text-gray-600 line-clamp-2">{notification.message}</p>
                                  <p className="text-xs text-gray-500 mt-1">{notification.timestamp}</p>
                                </div>
                                {!notification.read && <div className="flex-shrink-0"><div className="w-2 h-2 bg-[#1E88E5] rounded-full mt-2"></div></div>}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="p-12 text-center text-gray-500">
                      <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>Chưa có thông báo nào</p>
                    </div>
                  )}
                </PopoverContent>
              </Popover>

              <div 
                className="relative"
                onMouseEnter={() => setIsAvatarHovered(true)}
                onMouseLeave={() => setIsAvatarHovered(false)}
              >
                <Popover open={showAvatarMenu} onOpenChange={(open) => {
                  if (!open) {
                    setIsAvatarPinned(false);
                  }
                }}>
                  <PopoverTrigger asChild>
                    <button 
                      className="flex items-center gap-3 px-2 py-2 hover:bg-[#1E88E5]/5 rounded-lg transition-all duration-300 group relative"
                      onClick={() => setIsAvatarPinned(!isAvatarPinned)}
                    >
                      {/* Avatar with Gradient & Glow */}
                      <div className="relative">
                        {userGooglePicture ? (
                          <>
                            <img 
                              src={userGooglePicture} 
                              alt="User" 
                              className="w-10 h-10 rounded-full ring-2 ring-[#1E88E5]/30 transition-all duration-300 group-hover:ring-[#1E88E5] group-hover:ring-4 group-hover:scale-110" 
                            />
                            {/* Glow Effect */}
                            <div className="absolute -inset-2 bg-gradient-to-br from-[#1E88E5]/40 to-[#0D47A1]/40 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
                          </>
                        ) : (
                          <>
                            <Avatar className="w-10 h-10 ring-2 ring-[#1E88E5]/30 transition-all duration-300 group-hover:ring-[#1E88E5] group-hover:ring-4 group-hover:scale-110">
                              <AvatarFallback 
                                className="bg-gradient-to-br from-[#1E88E5] via-[#1976D2] to-[#0D47A1] text-white transition-all duration-300"
                                style={{ fontSize: '1.125rem', fontWeight: 700 }}
                              >
                                {currentUser?.avatar || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            {/* Glow Effect */}
                            <div className="absolute -inset-2 bg-gradient-to-br from-[#1E88E5]/40 to-[#0D47A1]/40 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
                          </>
                        )}
                      </div>
                      
                      {/* Name with Gradient Text */}
                      <span 
                        className="hidden md:inline-block transition-all duration-300 group-hover:scale-105"
                        style={{
                          fontWeight: 600,
                          background: 'linear-gradient(135deg, #1E88E5 0%, #1565C0 50%, #0D47A1 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                          letterSpacing: '-0.01em'
                        }}
                      >
                        {currentUser?.name}
                      </span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent 
                    className="w-56 p-2 transition-all duration-300 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95" 
                    align="end"
                    onMouseEnter={() => setIsAvatarHovered(true)}
                    onMouseLeave={() => setIsAvatarHovered(false)}
                  >
                    <div className="space-y-1">
                      <button 
                        onClick={() => {
                          navigateTo('my-courses');
                          setIsAvatarPinned(false);
                        }} 
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100 rounded-md transition-colors text-left"
                      >
                        <BookOpen className="w-4 h-4" />
                        Khóa học của tôi
                      </button>
                      <button 
                        onClick={() => {
                          navigateTo('account-settings');
                          setIsAvatarPinned(false);
                        }} 
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100 rounded-md transition-colors text-left"
                      >
                        <User className="w-4 h-4" />
                        Tài khoản
                      </button>
                      <Separator />
                      <button 
                        onClick={() => {
                          handleLogout();
                          setIsAvatarPinned(false);
                        }} 
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Đăng xuất
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </div>

        {sidebarOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <nav className="px-4 py-4 space-y-2">
              {currentRole === 'admin' ? (
                <>
                  <button onClick={() => { navigateTo('admin-dashboard'); setSidebarOpen(false); }} className="block w-full text-left px-3 py-2 rounded hover:bg-gray-100">
                    <BarChart3 className="w-4 h-4 inline mr-2" />
                    Dashboard
                  </button>
                  <button onClick={() => { navigateTo('create-course'); setSidebarOpen(false); }} className="block w-full text-left px-3 py-2 rounded hover:bg-gray-100">
                    <Plus className="w-4 h-4 inline mr-2" />
                    Tạo khóa học
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => { navigateTo('explore'); setSidebarOpen(false); }} className="block w-full text-left px-3 py-2 rounded hover:bg-gray-100">
                    <Search className="w-4 h-4 inline mr-2" />
                    Khám phá
                  </button>
                  <button onClick={() => { navigateTo('create-course'); setSidebarOpen(false); }} className="block w-full text-left px-3 py-2 rounded hover:bg-gray-100">
                    <Plus className="w-4 h-4 inline mr-2" />
                    Tạo khóa học
                  </button>
                </>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="page-transition">
        {currentPage === 'home' && <HomePage navigateTo={navigateTo} setSelectedCourse={setSelectedCourse} setSelectedTag={setSelectedTag} currentUser={currentUser} />}
        {currentPage === 'my-courses' && <MyCoursesPage navigateTo={navigateTo} setSelectedCourse={setSelectedCourse} currentUser={currentUser!} />}
        {currentPage === 'explore' && <ExplorePage navigateTo={navigateTo} setSelectedCourse={setSelectedCourse} currentUser={currentUser} />}
        {currentPage === 'course-detail' && <CourseDetailPage course={selectedCourse} navigateTo={navigateTo} currentUser={currentUser} isOwner={isOwner(selectedCourse)} canAccess={canAccessCourse(selectedCourse)} enrollmentRequests={enrollmentRequests} onEnrollRequest={handleEnrollRequest} />}
        {currentPage === 'topic-detail' && <TopicDetailPage navigateTo={navigateTo} setSelectedCourse={setSelectedCourse} currentUser={currentUser} selectedTag={selectedTag} />}
        {currentPage === 'learning' && <LearningPage course={selectedCourse} navigateTo={navigateTo} />}
        {currentPage === 'quiz' && <QuizPage navigateTo={navigateTo} />}
        {currentPage === 'create-course' && <CreateCoursePage navigateTo={navigateTo} currentUser={currentUser!} />}
        {currentPage === 'edit-course' && <EditCoursePage navigateTo={navigateTo} course={selectedCourse} currentUser={currentUser!} />}
        {currentPage === 'course-dashboard' && <CourseDashboardPage
          course={selectedCourse}
          navigateTo={navigateTo}
          enrollmentRequests={enrollmentRequests}
          onApproveRequest={handleApproveRequest}
          onRejectRequest={handleRejectRequest}
        />}
        {currentPage === 'course-students' && <CourseStudentsPage
          course={selectedCourse}
          navigateTo={navigateTo}
          enrollmentRequests={enrollmentRequests}
          onApproveRequest={handleApproveRequest}
          onRejectRequest={handleRejectRequest}
        />}
        {currentPage === 'admin-dashboard' && <AdminDashboardPage navigateTo={navigateTo} />}
        {currentPage === 'approve-courses' && <ApproveCoursesPage navigateTo={navigateTo} setSelectedCourse={setSelectedCourse} />}
        {currentPage === 'manage-courses' && <ManageCoursesPage navigateTo={navigateTo} setSelectedCourse={setSelectedCourse} />}
        {currentPage === 'manage-users' && <ManageUsersPage navigateTo={navigateTo} setSelectedUser={setSelectedUser} />}
        {currentPage === 'user-detail' && selectedUser && <UserDetailPage user={selectedUser} navigateTo={navigateTo} />}
        {currentPage === 'manage-tags' && <ManageTagsPage navigateTo={navigateTo} />}
        {currentPage === 'account-settings' && currentUser && <AccountSettingsPage user={currentUser} navigateTo={navigateTo} />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <GraduationCap className="w-8 h-8 text-[#1E88E5]" />
                <span 
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #1E88E5 0%, #1565C0 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  EduLearn
                </span>
              </div>
              <p className="text-gray-600 text-sm">Nền tảng học tập trực tuyến hàng đầu Việt Nam</p>
            </div>
            <div>
              <h3 className="mb-4">Về chúng tôi</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-[#1E88E5]">Giới thiệu</a></li>
                <li><a href="#" className="hover:text-[#1E88E5]">Liên hệ</a></li>
                <li><a href="#" className="hover:text-[#1E88E5]">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4">Hỗ trợ</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-[#1E88E5]">Trung tâm trợ giúp</a></li>
                <li><a href="#" className="hover:text-[#1E88E5]">Điều khoản</a></li>
                <li><a href="#" className="hover:text-[#1E88E5]">Chính sách</a></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4">Kết nối</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-[#1E88E5]">Facebook</a></li>
                <li><a href="#" className="hover:text-[#1E88E5]">LinkedIn</a></li>
                <li><a href="#" className="hover:text-[#1E88E5]">YouTube</a></li>
              </ul>
            </div>
          </div>
          <Separator className="my-6" />
          <p className="text-center text-sm text-gray-600">© 2025 EduLearn Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default AppShell;
