import { useState, useEffect } from 'react';
import { GraduationCap, BookOpen, BarChart3, FileCheck, Search, Plus, Bell, Menu, X as XIcon, LogOut, User, CheckCircle, UserPlus, Clock, Share2, Award, AlertCircle, TrendingUp, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import Lottie from 'lottie-react';
import avatarFrameAnimation from '@/components/christmas/Entri Christmas.json';
import { ManageUsersPage } from '@/pages/ManageUsersPage';
import { ManageCoursesPage } from '@/pages/ManageCoursesPage';
import { UserDetailPage } from '@/pages/UserDetailPage';
import { AccountSettingsPage } from '@/pages/AccountSettingsPage';
import { TagDetailPage } from '@/pages/TagDetailPage';
import AILearningPathPage from '@/pages/AILearningPathPage';

interface AppShellProps {
  state: {
    currentUser: any;
    currentPage: any;
    selectedCourse: any;
    selectedUser: any;
    selectedTag: any;
    sidebarOpen: boolean;
    notifications: any[];
    showNotifications: boolean;
    enrollmentRequests: any[];
    currentRole: string;
    unreadCount: number;
  };
  actions: {
    navigateTo: (page: any, course?: any) => void;
    handleLogout: () => void;
    handleUpdateUser: (user: any) => void;
    setSelectedCourse: (course: any) => void;
    setSelectedUser: (user: any) => void;
    setSelectedTag: (tag: any) => void;
    setSidebarOpen: (open: boolean) => void;
    setShowNotifications: (show: boolean) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    handleNotificationClick: (notification: any) => void;
    isOwner: (course: any) => boolean;
    canAccessCourse: (course: any) => boolean;
    handleApproveRequest: (id: string) => void;
    handleRejectRequest: (id: string) => void;
    handleEnrollRequest: (request: any) => void;
  };
}

export function AppShell({ state, actions }: AppShellProps) {
  // Local state for instant UI feedback of notification read status
  const [isNotificationsPinned, setIsNotificationsPinned] = useState(false);
  const {
    currentUser,
    currentPage,
    selectedCourse,
    selectedUser,
    selectedTag,
    sidebarOpen,
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

  // Particles for footer
  const particles = useState(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: 3 + Math.random() * 4,
      delay: Math.random() * 2,
    }))
  )[0];

  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [isAvatarHovered, setIsAvatarHovered] = useState(false);
  const [isAvatarPinned, setIsAvatarPinned] = useState(false);
  // Only use showNotifications for popover open/close
  const [readSet, setReadSet] = useState<Set<string>>(new Set());
  useEffect(() => {
    setShowAvatarMenu(false);
    setIsAvatarPinned(false);
  }, [currentPage]);

  useEffect(() => {
    // Reset local readSet when notifications change (e.g. after reload)
    setReadSet(new Set(notifications.filter((n) => n.read).map((n) => String(n.id))));
  }, [notifications]);

  useEffect(() => {
    if (isAvatarHovered || isAvatarPinned) {
      setShowAvatarMenu(true);
    } else {
      const timeoutId = setTimeout(() => setShowAvatarMenu(false), 150);
      return () => clearTimeout(timeoutId);
    }
  }, [isAvatarHovered, isAvatarPinned]);

  // Remove hover logic for notifications popover

  return (
    <div className="min-h-screen bg-[#F5F6F8] flex flex-col">
      <Toaster />

      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
                {sidebarOpen ? <XIcon className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigateTo('home')}>
                <div className="relative">
                  <GraduationCap className="w-10 h-10 text-[#1E88E5] transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
                  <div className="absolute -inset-1 bg-[#1E88E5]/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold bg-gradient-to-r from-[#1E88E5] to-[#0D47A1] bg-clip-text text-transparent">EduLearn</span>
                  <span className="text-xs text-gray-500 hidden sm:block">Học tập không giới hạn</span>
                </div>
              </div>

              <nav className="hidden lg:flex items-center gap-3 ml-8">
                {currentRole !== 'admin' && (
                  <Button
                    onClick={() => navigateTo('explore')}
                    className="bg-[#1E88E5] text-white hover:bg-[#1565C0] hover:scale-105 hover:shadow-xl shadow-lg shadow-blue-300/50 transition-all duration-200"
                  >
                    <Search className="w-4 h-4 mr-2" /> Khám phá
                  </Button>
                )}
                {currentRole === 'admin' && (
                  <Button
                    onClick={() => navigateTo('admin-dashboard')}
                    className="bg-[#1E88E5] text-white hover:bg-[#1565C0] hover:scale-105 hover:shadow-xl shadow-lg shadow-blue-300/50 transition-all duration-200"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" /> Dashboard
                  </Button>
                )}
                {currentRole !== 'admin' && (
                  <Button
                    onClick={() => navigateTo('create-course')}
                    className="bg-[#1E88E5] text-white hover:bg-[#1565C0] hover:scale-105 hover:shadow-xl shadow-lg shadow-blue-300/50 transition-all duration-200"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Tạo khóa học
                  </Button>
                )}
                {currentRole !== 'admin' && (
                  <Button
                    onClick={() => navigateTo('ai-learning-path')}
                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 hover:scale-105 hover:shadow-xl shadow-lg shadow-orange-300/50 transition-all duration-200"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Tạo lộ trình AI
                  </Button>
                )}
              </nav>
            </div>

            <div className="flex items-center gap-3">
              {/* Notifications */}
              <div>
                <Popover
                  open={showNotifications}
                  onOpenChange={setShowNotifications}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative"
                      onClick={() => setShowNotifications(!showNotifications)}
                    >
                      <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'animate-bell-shake' : ''}`} />
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-xs rounded-full px-1">
                          {unreadCount}
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-96 p-0"
                    align="end"
                  >
                    <div className="flex items-center justify-between p-4 border-b">
                      <h3 className="font-medium">Thông báo</h3>
                      {unreadCount > 0 && <button onClick={markAllAsRead} className="text-sm text-[#1E88E5] hover:underline">Đánh dấu đã đọc</button>}
                    </div>
                    {currentRole === 'admin'
                      ? (notifications.filter(n => n.type === 'course_pending_review').length > 0 ? (
                          <ScrollArea className="h-[400px]">
                            <div className="divide-y">
                              {notifications.filter(n => n.type === 'course_pending_review').map(notification => {
                                const isRead = notification.read || readSet.has(String(notification.id));
                                return (
                                  <button
                                    key={notification.id}
                                    className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${!isRead ? 'bg-blue-50/70' : 'bg-white'}`}
                                    onClick={() => {
                                      if (!isRead) setReadSet(prev => new Set(prev).add(String(notification.id)));
                                      handleNotificationClick(notification);
                                      setShowNotifications(false);
                                      setIsNotificationsPinned(false);
                                    }}
                                  >
                                    <div className="flex gap-3">
                                      <div className="flex-shrink-0 mt-1 text-yellow-500"><Bell className="w-5 h-5" /></div>
                                      <div className="flex-1 min-w-0">
                                        <p className={`text-sm ${!isRead ? 'font-medium' : ''}`}>{notification.title}</p>
                                        <p className="text-sm text-gray-600 line-clamp-2">{notification.message}</p>
                                      </div>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </ScrollArea>
                        ) : <div className="p-12 text-center text-gray-500"><p>Chưa có thông báo khoá học cần duyệt</p></div>)
                      : (notifications.length > 0 ? (
                          <ScrollArea className="h-[400px]">
                            <div className="divide-y">
                              {notifications.map(notification => {
                                let Icon = Bell;
                                let color = 'text-gray-400';
                                switch (notification.type) {
                                  case 'course_approved':
                                    Icon = CheckCircle;
                                    color = 'text-green-500';
                                    break;
                                  case 'course_rejected':
                                    Icon = AlertCircle;
                                    color = 'text-red-500';
                                    break;
                                  case 'student_joined':
                                    Icon = UserPlus;
                                    color = 'text-blue-500';
                                    break;
                                  case 'course_completed':
                                    Icon = Award;
                                    color = 'text-yellow-500';
                                    break;
                                  default:
                                    Icon = Bell;
                                    color = 'text-gray-400';
                                }
                                const isRead = notification.read || readSet.has(String(notification.id));
                                return (
                                  <button
                                    key={notification.id}
                                    className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${!isRead ? 'bg-blue-50/70' : 'bg-white'}`}
                                    onClick={() => {
                                      if (!isRead) setReadSet(prev => new Set(prev).add(String(notification.id)));
                                      handleNotificationClick(notification);
                                      setShowNotifications(false);
                                      setIsNotificationsPinned(false);
                                    }}
                                  >
                                    <div className="flex gap-3">
                                      <div className={`flex-shrink-0 mt-1 ${color}`}><Icon className="w-5 h-5" /></div>
                                      <div className="flex-1 min-w-0">
                                        <p className={`text-sm ${!isRead ? 'font-medium' : ''}`}>{notification.title}</p>
                                        <p className="text-sm text-gray-600 line-clamp-2">{notification.message}</p>
                                      </div>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </ScrollArea>
                        ) : <div className="p-12 text-center text-gray-500"><p>Chưa có thông báo nào</p></div>)}
                  </PopoverContent>
                </Popover>
              </div>

              {/* User Avatar & Menu */}
              <div className="relative" onMouseEnter={() => setIsAvatarHovered(true)} onMouseLeave={() => setIsAvatarHovered(false)}>
                <Popover open={showAvatarMenu} onOpenChange={(open) => !open && setIsAvatarPinned(false)}>
                  <PopoverTrigger asChild>
                    <button className="flex items-center gap-3 px-2 py-2 hover:bg-[#1E88E5]/5 rounded-lg transition-all group outline-none focus:outline-none" onClick={() => setIsAvatarPinned(!isAvatarPinned)}>
                      <div className="relative">
                        {/* Lottie Avatar Frame */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-[51%] -translate-y-[47%] w-[175%] h-[175%] pointer-events-none z-10">
                          <Lottie animationData={avatarFrameAnimation} loop={true} />
                        </div>

                        <Avatar className="w-10 h-10 transition-all group-hover:scale-110 relative z-20 bg-white">
                          <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} className="object-cover" />
                          <AvatarFallback className="bg-gradient-to-br from-[#1E88E5] to-[#0D47A1] text-white font-bold">
                            {currentUser?.name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <span className="hidden md:inline-block font-semibold bg-gradient-to-r from-[#1E88E5] to-[#0D47A1] bg-clip-text text-transparent">
                        {currentUser?.name}
                      </span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-2" align="end">
                    <div className="space-y-1">
                      {currentRole !== 'admin' && (
                        <button onClick={() => navigateTo('my-courses')} className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100 rounded-md outline-none focus:outline-none"><BookOpen className="w-4 h-4" /> Khóa học của tôi</button>
                      )}
                      <button onClick={() => navigateTo('account-settings')} className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100 rounded-md outline-none focus:outline-none"><User className="w-4 h-4" /> Tài khoản</button>
                      <Separator className="my-1" />
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md outline-none focus:outline-none"><LogOut className="w-4 h-4" /> Đăng xuất</button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </div >
      </header >
      {/* Mobile Sidebar */}
      {
        sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50"
              onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar Panel */}
            <div className="fixed left-0 top-0 h-full w-72 bg-white shadow-xl animate-in slide-in-from-left duration-300">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-8 h-8 text-[#1E88E5]" />
                  <span className="text-xl font-bold text-[#1E88E5]">Menu</span>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <XIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Menu Items */}
              <nav className="p-4 space-y-2">
                <button
                  onClick={() => { navigateTo('home'); setSidebarOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#1E88E5]/10 rounded-lg transition-colors"
                >
                  <GraduationCap className="w-5 h-5 text-[#1E88E5]" />
                  <span>Trang chủ</span>
                </button>

                {currentRole !== 'admin' && (
                  <button
                    onClick={() => { navigateTo('explore'); setSidebarOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#1E88E5]/10 rounded-lg transition-colors"
                  >
                    <Search className="w-5 h-5 text-[#1E88E5]" />
                    <span>Khám phá</span>
                  </button>
                )}

                {currentRole === 'admin' && (
                  <button
                    onClick={() => { navigateTo('admin-dashboard'); setSidebarOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#1E88E5]/10 rounded-lg transition-colors"
                  >
                    <BarChart3 className="w-5 h-5 text-[#1E88E5]" />
                    <span>Dashboard</span>
                  </button>
                )}

                <button
                  onClick={() => { navigateTo('my-courses'); setSidebarOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#1E88E5]/10 rounded-lg transition-colors"
                >
                  <BookOpen className="w-5 h-5 text-[#1E88E5]" />
                  <span>Khóa học của tôi</span>
                </button>

                {currentRole !== 'admin' && (
                  <button
                    onClick={() => { navigateTo('create-course'); setSidebarOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#1E88E5]/10 rounded-lg transition-colors"
                  >
                    <Plus className="w-5 h-5 text-[#1E88E5]" />
                    <span>Tạo khóa học</span>
                  </button>
                )}

                <Separator className="my-4" />

                <button
                  onClick={() => { navigateTo('account-settings'); setSidebarOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <User className="w-5 h-5 text-gray-600" />
                  <span>Cài đặt tài khoản</span>
                </button>

                <button
                  onClick={() => { handleLogout(); setSidebarOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Đăng xuất</span>
                </button>
              </nav>
            </div>
          </div>
        )
      }

      <main className="page-transition flex-1">
        {currentPage === 'home' && <HomePage navigateTo={navigateTo} setSelectedCourse={setSelectedCourse} setSelectedTag={setSelectedTag} currentUser={currentUser} />}
        {currentPage === 'my-courses' && <MyCoursesPage navigateTo={navigateTo} setSelectedCourse={setSelectedCourse} currentUser={currentUser!} />}
        {currentPage === 'explore' && <ExplorePage navigateTo={navigateTo} setSelectedCourse={setSelectedCourse} currentUser={currentUser} />}
        {currentPage === 'course-detail' && selectedCourse && (
          <CourseDetailPage
            course={selectedCourse}
            navigateTo={navigateTo}
            setSelectedUser={setSelectedUser}
            setSelectedTag={setSelectedTag}
            currentUser={currentUser}
            isOwner={isOwner(selectedCourse)}
            canAccess={selectedCourse.overrideAccess === true ? true : canAccessCourse(selectedCourse)}
            enrollmentRequests={enrollmentRequests}
            onEnrollRequest={handleEnrollRequest}
          />
        )}
        {currentPage === 'tag-detail' && <TagDetailPage navigateTo={navigateTo} setSelectedCourse={setSelectedCourse} currentUser={currentUser} selectedTag={selectedTag} />}
        {currentPage === 'learning' && <LearningPage course={selectedCourse} navigateTo={navigateTo} />}
        {currentPage === 'create-course' && <CreateCoursePage navigateTo={navigateTo} currentUser={currentUser!} />}
        {currentPage === 'ai-learning-path' && <AILearningPathPage navigateTo={navigateTo} currentUser={currentUser} />}
        {currentPage === 'course-dashboard' && <CourseDashboardPage course={selectedCourse} navigateTo={navigateTo} currentUser={currentUser!} enrollmentRequests={enrollmentRequests} onApproveRequest={handleApproveRequest} onRejectRequest={handleRejectRequest} />}
        {/* Admin Pages - Protected */}
        {currentUser?.role === 'admin' && (
          <>
            {currentPage === 'admin-dashboard' && <AdminDashboardPage navigateTo={navigateTo} />}
            {currentPage === 'approve-courses' && <ApproveCoursesPage navigateTo={navigateTo} setSelectedCourse={setSelectedCourse} />}
            {currentPage === 'manage-courses' && <ManageCoursesPage navigateTo={navigateTo} setSelectedCourse={setSelectedCourse} />}
            {currentPage === 'manage-users' && <ManageUsersPage navigateTo={navigateTo} setSelectedUser={setSelectedUser} />}
            {currentPage === 'manage-tags' && <ManageTagsPage navigateTo={navigateTo} setSelectedTag={setSelectedTag} />}
          </>
        )}

        {/* Public/Shared Pages */}
        {currentPage === 'user-detail' && <UserDetailPage user={selectedUser} navigateTo={navigateTo} setSelectedCourse={setSelectedCourse} />}
        {currentPage === 'account-settings' && currentUser && (
          <AccountSettingsPage
            user={currentUser}
            navigateTo={navigateTo}
            onUpdateUser={actions.handleUpdateUser} // THÊM DÒNG NÀY VÀO
          />
        )}
      </main>

      {
        currentPage !== 'learning' && (
          <footer className="relative overflow-hidden mt-auto bg-gradient-to-br from-[#1E88E5] via-[#1565C0] to-[#0D47A1] py-16">
            <div className="relative z-10 max-w-7xl mx-auto px-4 text-center space-y-8">
              <div className="flex items-center justify-center gap-4 group">
                <GraduationCap className="w-16 h-16 text-white group-hover:rotate-12 transition-transform" />
                <div className="text-left">
                  <h2 className="text-4xl font-extrabold text-white">EduLearn</h2>
                  <p className="text-white/80 tracking-widest text-sm">Học tập không giới hạn</p>
                </div>
              </div>
              <p className="text-white/70 text-sm">© 2025 EduLearn Platform. All rights reserved.</p>
            </div>
            {/* Particles */}
            {particles.map((p) => (
              <div key={p.id} className="absolute w-2 h-2 bg-white/10 rounded-full animate-pulse"
                style={{ left: `${p.left}%`, top: `${p.top}%`, animationDelay: `${p.delay}s` }} />
            ))}
          </footer>
        )
      }
    </div >
  );
}

export default AppShell;