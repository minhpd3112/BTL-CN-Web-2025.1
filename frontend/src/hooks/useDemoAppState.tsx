import { useState, useMemo, useCallback, useEffect } from 'react'; // Thêm useEffect vào đây
import { supabase } from '@/services/api'; // Thêm dòng này ở đây
import {
  mockUsers,
  mockCourses,
  mockEnrollments,
  mockEnrollmentRequests,
  mockTags
} from '@/services/mocks';
import { User, Course, Page, Enrollment, Notification, EnrollmentRequest, Tag } from '@/types';

// Mock Google Accounts
export const mockGoogleAccounts = [
  { email: 'nguyenvana@gmail.com', name: 'Nguyễn Văn A', picture: 'https://ui-avatars.com/api/?name=Nguyen+Van+A&background=1E88E5&color=fff', role: 'user' as const },
  { email: 'tranthib@gmail.com', name: 'Trần Thị B', picture: 'https://ui-avatars.com/api/?name=Tran+Thi+B&background=1E88E5&color=fff', role: 'user' as const },
  { email: 'admin@edulearn.vn', name: 'Quản trị viên', picture: 'https://ui-avatars.com/api/?name=Admin&background=1E88E5&color=fff', role: 'admin' as const },
  { email: 'newuser@gmail.com', name: 'Người dùng mới', picture: 'https://ui-avatars.com/api/?name=New+User&background=1E88E5&color=fff', role: 'user' as const }
];

// Mock Notifications
const mockNotifications: Notification[] = [
  // User notifications
  {
    id: 1,
    type: 'course_approved',
    title: 'Khóa học được duyệt',
    message: 'Khóa học "Lập trình React từ Cơ bản đến Nâng cao" đã được admin phê duyệt và xuất hiện trên trang chủ',
    courseId: 1,
    userId: 2,
    timestamp: '2 giờ trước',
    read: false,
    icon: 'CheckCircle',
    color: 'text-green-500',
    action: { page: 'course-detail', courseId: 1 }
  },
  {
    id: 2,
    type: 'new_enrollment',
    title: 'Yêu cầu đăng ký mới',
    message: 'Lê Văn C muốn đăng ký khóa học "Lập trình React từ Cơ bản đến Nâng cao". Click để duyệt.',
    courseId: 1,
    userId: 2,
    timestamp: '5 giờ trước',
    read: false,
    icon: 'UserPlus',
    color: 'text-blue-500',
    action: { page: 'course-students', courseId: 1 }
  },
  {
    id: 3,
    type: 'course_rejected',
    title: 'Khóa học bị từ chối',
    message: 'Khóa học "Machine Learning cơ bản" không đạt yêu cầu. Lý do: Nội dung chưa đầy đủ.',
    courseId: 2,
    userId: 2,
    timestamp: '1 ngày trước',
    read: true,
    icon: 'X',
    color: 'text-red-500',
    action: { page: 'edit-course', courseId: 2 }
  },
  {
    id: 4,
    type: 'student_completed',
    title: 'Học viên hoàn thành khóa học',
    message: 'Phạm Thị D đã hoàn thành 100% khóa học "Lập trình React từ Cơ bản đến Nâng cao"',
    courseId: 1,
    userId: 2,
    timestamp: '3 ngày trước',
    read: true,
    icon: 'Award',
    color: 'text-yellow-500',
    action: { page: 'course-students', courseId: 1 }
  },

  // Admin notifications
  {
    id: 10,
    type: 'admin_new_course_pending',
    title: 'Khóa học mới cần duyệt',
    message: 'Nguyễn Văn A vừa tạo khóa học "Data Science với Python" cần được phê duyệt',
    courseId: 3,
    timestamp: '30 phút trước',
    read: false,
    icon: 'FileCheck',
    color: 'text-orange-500',
    action: { page: 'manage-courses' }
  },
  {
    id: 11,
    type: 'admin_new_user',
    title: 'Người dùng mới đăng ký',
    message: 'Hoàng Văn E vừa tạo tài khoản và đăng nhập lần đầu vào hệ thống',
    userId: 5,
    timestamp: '1 giờ trước',
    read: false,
    icon: 'UserPlus',
    color: 'text-blue-500',
    action: { page: 'manage-users' }
  },
  {
    id: 12,
    type: 'admin_multiple_pending',
    title: '3 khóa học chờ duyệt',
    message: 'Hiện có 3 khóa học mới đang chờ được phê duyệt. Vui lòng xem xét.',
    timestamp: '2 giờ trước',
    read: false,
    icon: 'Bell',
    color: 'text-orange-500',
    action: { page: 'manage-courses' }
  },
  {
    id: 13,
    type: 'admin_report',
    title: 'Báo cáo vi phạm nội dung',
    message: 'Có 1 báo cáo về nội dung không phù hợp trong khóa học "Lập trình Web"',
    courseId: 4,
    timestamp: '3 giờ trước',
    read: true,
    icon: 'AlertCircle',
    color: 'text-red-500',
    action: { page: 'manage-courses' }
  },
  {
    id: 14,
    type: 'admin_course_popular',
    title: 'Khóa học nổi bật',
    message: 'Khóa học "React Native - Xây dựng App di động" đạt 500+ học viên đăng ký trong tuần',
    courseId: 5,
    timestamp: '1 ngày trước',
    read: true,
    icon: 'TrendingUp',
    color: 'text-green-500',
    action: { page: 'admin-dashboard' }
  },
  {
    id: 15,
    type: 'admin_inactive_user',
    title: 'Người dùng không hoạt động',
    message: '25 người dùng không đăng nhập trong 30 ngày qua',
    timestamp: '2 ngày trước',
    read: true,
    icon: 'Clock',
    color: 'text-gray-500',
    action: { page: 'manage-users' }
  },
];

export function useDemoAppState() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user_data');
    return saved ? JSON.parse(saved) : null;
  });
  const [currentPage, setCurrentPage] = useState<Page>(() => {
    const saved = localStorage.getItem('user_data');
    return saved ? 'home' : 'login';
  });
  const [selectedCourse, setSelectedCourse] = useState<Course>(mockCourses[0]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userGooglePicture, setUserGooglePicture] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [showNotifications, setShowNotifications] = useState(false);
  const [enrollmentRequests, setEnrollmentRequests] = useState<EnrollmentRequest[]>(mockEnrollmentRequests);
useEffect(() => {
    // Lắng nghe thay đổi trạng thái đăng nhập
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      
      // Nếu thấy có session (Google vừa trả về) và hiện tại chưa có user trong app
      if (session && event === 'SIGNED_IN' && !currentUser) {
        
        // Tạo object user theo định dạng của App bạn
        const user = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata.full_name || session.user.email?.split('@')[0],
          avatar: session.user.user_metadata.avatar_url || session.user.user_metadata.picture,
          role: 'user', // Mặc định là user
          joinedDate: new Date().toLocaleDateString('vi-VN'),
          status: 'active',
          coursesCreated: 0,
          totalStudents: 0
        };

        // Lưu vào LocalStorage để khi F5 không bị mất
        localStorage.setItem('auth_token', session.access_token);
        localStorage.setItem('user_data', JSON.stringify(user));

        // Cập nhật state để App chuyển sang trang chủ
        setCurrentUser(user as any);
        setCurrentPage('home');
      }
    });

    return () => subscription.unsubscribe();
  }, [currentUser]);
  // Helper functions
  const navigateTo = useCallback((page: Page, course?: Course) => {
    setCurrentPage(page);
    if (course) setSelectedCourse(course);
    setSidebarOpen(false);
    window.scrollTo(0, 0);
  }, []);

  const handleLogin = useCallback((user: User, googlePicture?: string) => {
    setCurrentUser(user);
    if (googlePicture) setUserGooglePicture(googlePicture);
    navigateTo('home');
  }, [navigateTo]);

  const handleLogout = useCallback(async () => {
  try {
    // 1. Gửi lệnh đăng xuất tới Supabase để huỷ Session trên máy chủ Google/Supabase
    await supabase.auth.signOut();
  } catch (error) {
    console.error("Lỗi khi đăng xuất Supabase:", error);
  }

  // 2. Xoá sạch dữ liệu đã lưu trong LocalStorage của trình duyệt
  localStorage.removeItem('user_data');
  localStorage.removeItem('auth_token');
  // Nếu bạn có lưu key nào khác của Supabase (thường bắt đầu bằng sb-...), có thể dùng:
  // localStorage.clear(); // Lưu ý: cái này sẽ xoá sạch TẤT CẢ dữ liệu trong LocalStorage

  // 3. Cập nhật State để giao diện biến mất thông tin người dùng ngay lập tức
  setCurrentUser(null);
  setUserGooglePicture(null);
  
  // 4. Đưa người dùng quay lại trang Login
  setCurrentPage('login');
  
  // Tuỳ chọn: Tải lại trang để xoá sạch các biến tạm trong bộ nhớ
  // window.location.reload(); 
}, []);

  const isOwner = useCallback((course: Course): boolean => {
    return currentUser ? course.ownerId === currentUser.id : false;
  }, [currentUser]);

  const canAccessCourse = useCallback((course: Course): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    if (course.ownerId === currentUser.id) return true;
    if (course.visibility === 'public' && course.status === 'approved') return true;
    if (course.enrolledUsers?.includes(currentUser.id)) return true;
    return false;
  }, [currentUser]);

  const markAsRead = useCallback((notificationId: number) => {
    setNotifications(notifications.map(n => n.id === notificationId ? { ...n, read: true } : n));
  }, [notifications]);

  const markAllAsRead = useCallback(() => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  }, [notifications]);

  const handleNotificationClick = useCallback((notification: Notification) => {
    // Mark as read
    markAsRead(notification.id);

    // Navigate to appropriate page
    if (notification.action) {
      const { page, courseId, userId } = notification.action;

      if (courseId && page === 'course-detail') {
        const course = mockCourses.find(c => c.id === courseId);
        if (course) {
          setSelectedCourse(course);
          navigateTo(page, course);
        }
      } else if (courseId && (page === 'course-students' || page === 'edit-course')) {
        const course = mockCourses.find(c => c.id === courseId);
        if (course) {
          setSelectedCourse(course);
          navigateTo(page, course);
        }
      } else if (userId && page === 'user-detail') {
        const user = mockUsers.find(u => u.id === userId);
        if (user) {
          setSelectedUser(user);
          navigateTo(page);
        }
      } else {
        navigateTo(page);
      }
    }
  }, [markAsRead, navigateTo]);

  const handleApproveRequest = useCallback((requestId: number) => {
    const now = new Date();
    const timeString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setEnrollmentRequests(enrollmentRequests.map(req =>
      req.id === requestId ? { ...req, status: 'approved' as const, respondedAt: timeString } : req
    ));
  }, [enrollmentRequests]);

  const handleRejectRequest = useCallback((requestId: number) => {
    const now = new Date();
    const timeString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setEnrollmentRequests(enrollmentRequests.map(req =>
      req.id === requestId ? { ...req, status: 'rejected' as const, respondedAt: timeString } : req
    ));
  }, [enrollmentRequests]);

  const handleEnrollRequest = useCallback((request: Omit<EnrollmentRequest, 'id' | 'status' | 'respondedAt'>) => {
    const now = new Date();
    const timeString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newRequest: EnrollmentRequest = {
      ...request,
      id: Date.now(),
      status: 'pending',
      requestedAt: timeString,
      respondedAt: null
    };
    setEnrollmentRequests([...enrollmentRequests, newRequest]);
  }, [enrollmentRequests]);

  // Computed values - memoized
  const currentRole = currentUser?.role || 'user';
  const userNotifications = useMemo(
    () => currentRole === 'admin' ? notifications : notifications.filter(n => n.userId === currentUser?.id),
    [currentRole, notifications, currentUser?.id]
  );
  const unreadCount = useMemo(
    () => userNotifications.filter(n => !n.read).length,
    [userNotifications]
  );

  // Memoize state object to prevent re-renders
  const state = useMemo(() => ({
    currentUser,
    currentPage,
    selectedCourse,
    selectedUser,
    selectedTag,
    sidebarOpen,
    userGooglePicture,
    notifications: userNotifications,
    showNotifications,
    enrollmentRequests,
    currentRole,
    unreadCount,
  }), [
    currentUser,
    currentPage,
    selectedCourse,
    selectedUser,
    selectedTag,
    sidebarOpen,
    userGooglePicture,
    userNotifications,
    showNotifications,
    enrollmentRequests,
    currentRole,
    unreadCount,
  ]);

  // Memoize actions object (stable reference)
  const actions = useMemo(() => ({
    navigateTo,
    handleLogin,
    handleLogout,
    isOwner,
    canAccessCourse,
    setSelectedCourse,
    setSelectedUser,
    setSelectedTag,
    setSidebarOpen,
    setShowNotifications,
    markAsRead,
    markAllAsRead,
    handleNotificationClick,
    handleApproveRequest,
    handleRejectRequest,
    handleEnrollRequest,
  }), [
    navigateTo,
    handleLogin,
    handleLogout,
    isOwner,
    canAccessCourse,
    markAsRead,
    markAllAsRead,
    handleNotificationClick,
    handleApproveRequest,
    handleRejectRequest,
    handleEnrollRequest,
  ]);

  return { state, actions };
}

export default useDemoAppState;
