import { useState, useMemo, useCallback, useEffect } from 'react';
import { supabase, notificationsAPI } from '@/services/api';
import { getSecureItem, setSecureItem, removeSecureItem, isWebCryptoAvailable, getSecureItemFallback, setSecureItemFallback, getSecureItemFast, setSecureItemFast } from '@/utils/secureStorage';
import {
  mockUsers,
  mockCourses,
  mockEnrollmentRequests,
} from '@/services/mocks';

// Helper to update enrolledUsers in mockCourses
function addUserToCourseEnrolledUsers(courseId: string, userId: number) {
  const course = mockCourses.find(c => c.id === courseId);
  if (course && !course.enrolledUsers.includes(userId)) {
    course.enrolledUsers.push(userId);
  }
}
import { User, Course, Page, Notification, EnrollmentRequest, Tag } from '@/types';

// --- MOCK DATA (Giữ bên ngoài Hook) ---
const mockNotifications: Notification[] = [
  // ... Giữ nguyên mảng notifications của bạn ở đây
];

export function useDemoAppState() {
  // 1. TẤT CẢ KHAI BÁO STATE NẰM Ở ĐẦU
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('login'); // Always start at login
  const [isRestoringSession, setIsRestoringSession] = useState(false); // No restore needed
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userGooglePicture, setUserGooglePicture] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [enrollmentRequests, setEnrollmentRequests] = useState<EnrollmentRequest[]>(mockEnrollmentRequests);

  // 2. SIMPLE SESSION RESTORE (using onAuthStateChange only - no manual getSession)
  useEffect(() => {
    setIsRestoringSession(false);
  }, []);

  // 3. AUTH STATE LISTENER (for OAuth callback only - simplified)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Only handle INITIAL_SESSION (page refresh) and TOKEN_REFRESHED
      // Email/password login is handled in LoginPage directly
      if (event === 'INITIAL_SESSION' && session && !currentUser) {
        // Fetch profile from database (non-blocking)
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        const metadata = session.user.user_metadata;
        const user = {
          id: session.user.id,
          email: session.user.email || '',
          name: profile?.full_name || metadata?.full_name || metadata?.name || 'User',
          avatar: profile?.avatar_url || metadata?.avatar_url || metadata?.picture || '',
          phone: profile?.phone || '',
          location: profile?.address || '',
          bio: profile?.bio || '',
          role: profile?.role || 'user',
          joinedDate: profile?.created_at || session.user.created_at || new Date().toISOString(),
          status: 'active',
          coursesCreated: 0,
          totalStudents: 0
        };
        
        // Store tokens
        setSecureItemFallback('auth_token', session.access_token);
        setSecureItemFallback('user_id', session.user.id);
        
        setCurrentUser(user as any);
        setCurrentPage('home');
      }
    });
    
    return () => subscription.unsubscribe();
  }, [currentUser]); // Keep dependency to prevent duplicate logins

  // 4. FETCH NOTIFICATIONS
  useEffect(() => {
    if (currentUser) {
      notificationsAPI.getMyNotifications()
        .then(res => {
          // Map is_read from backend to read for FE logic
          const notifications = (res.data || []).map((n: any) => ({
            ...n,
            read: n.read !== undefined ? n.read : n.is_read
          }));
          setNotifications(notifications);
        })
        .catch(() => setNotifications([]));
    } else {
      setNotifications([]);
    }
  }, [currentUser]);

  // 5. TẤT CẢ CÁC HÀM LOGIC (useCallback)
  const navigateTo = useCallback((page: Page, course?: Course) => {
    setCurrentPage(page);
    if (course) setSelectedCourse(course);
    setSidebarOpen(false);
    window.scrollTo(0, 0);
  }, []);

  const handleLogin = useCallback((user: User, googlePicture?: string) => {
    setCurrentUser(user);
    if (googlePicture) setUserGooglePicture(googlePicture);
    // Note: auth_token should already be stored by LoginPage before calling this
    navigateTo('home');
  }, [navigateTo]);

  const handleLogout = useCallback(async () => {
    try { await supabase.auth.signOut(); } catch (e) { console.error(e); }
    removeSecureItem('auth_token');
    removeSecureItem('user_id');
    removeSecureItem('user_data');
    setCurrentUser(null);
    setUserGooglePicture(null);
    setCurrentPage('login');
  }, []);

  const handleUpdateUser = useCallback((updatedUser: User) => {
    setCurrentUser(updatedUser);
    // Store ONLY auth token and user ID - not full user data
    localStorage.setItem('user_id', updatedUser.id);
  }, []);

  const isOwner = useCallback((course: Course) =>
    currentUser ? course.ownerId === currentUser.id : false, [currentUser]);

  // Note: This returns true by default for enrolled students
  // The actual enrollment check is done in CourseDetailPage via API
  const canAccessCourse = useCallback((course: Course) => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    if (course.visibility === 'public') return true;
    return course.ownerId === currentUser.id || course.enrolledUsers?.includes(Number(currentUser.id));
  }, [currentUser]);


  const markAsRead = useCallback(async (id: string) => {
    try {
      await notificationsAPI.markAsRead(id);
      // Always fetch notifications from backend after marking as read
      const res = await notificationsAPI.getMyNotifications();
      const notifications = (res.data || []).map((n: any) => ({
        ...n,
        read: n.read !== undefined ? n.read : n.is_read
      }));
      setNotifications(notifications);
    } catch { }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsAPI.markAllAsRead();
      // Always fetch notifications from backend after marking all as read
      const res = await notificationsAPI.getMyNotifications();
      const notifications = (res.data || []).map((n: any) => ({
        ...n,
        read: n.read !== undefined ? n.read : n.is_read
      }));
      setNotifications(notifications);
    } catch { }
  }, []);

  const handleNotificationClick = useCallback((notification: Notification) => {
    markAsRead(notification.id);
    let page = notification.action?.page;
    // Override page for course-related notifications
    if (
      notification.type === 'student_joined' ||
      notification.type === 'course_completed' ||
      notification.type === 'course_approved'
    ) {
      page = 'course-detail';
    } else if (notification.type === 'course_rejected') {
      page = 'my-courses';
    } else if (notification.type === 'course_pending_review') {
      // Admin click vào notification khóa học cần duyệt -> chuyển đến trang approve courses
      page = 'approve-courses';
    }
    if (page === 'course-detail') {
      const courseId = notification.related_course_id;
      if (courseId) {
        import('@/services/api').then(async ({ coursesAPI, enrollmentsAPI }) => {
          const [courseRes, enrollmentsRes] = await Promise.all([
            coursesAPI.getCourseById(courseId),
            enrollmentsAPI.getMyEnrollments()
          ]);
          // ...
          let canAccess = false;
          if (enrollmentsRes && enrollmentsRes.success && enrollmentsRes.data) {
            canAccess = enrollmentsRes.data.some(
              (e: any) => (e.course_id === courseId || e.courseId === courseId) && e.status === 'approved'
            );
          }
          // ...
          if (courseRes && courseRes.success && courseRes.data) {
            // Nếu là chủ khoá học, luôn set overrideAccess
            const isOwner = courseRes.data.ownerId === currentUser?.id || courseRes.data.owner_id === currentUser?.id;
            const courseWithAccess = (courseRes.data.visibility === 'private' && (canAccess || isOwner))
              ? { ...courseRes.data, overrideAccess: true }
              : courseRes.data;
            // ...
            setSelectedCourse(courseWithAccess);
            if (courseRes.data.visibility === 'private' && !canAccess && !isOwner) {
              import('sonner').then(({ toast }) => toast.error('Bạn không có quyền truy cập khoá học này.'));
              return;
            }
            navigateTo('course-detail', courseWithAccess);
          }
        });
      }
    } else if (page) {
      navigateTo(page as Page);
    }
  }, [markAsRead, navigateTo, setSelectedCourse, currentUser]);

  const handleApproveRequest = useCallback((requestId: string) => {
    setEnrollmentRequests(prev => prev.map(req =>
      req.id === requestId ? { ...req, status: 'approved', respondedAt: new Date().toLocaleString() } : req
    ));
  }, []);

  const handleRejectRequest = useCallback((requestId: string) => {
    setEnrollmentRequests(prev => prev.map(req =>
      req.id === requestId ? { ...req, status: 'rejected', respondedAt: new Date().toLocaleString() } : req
    ));
  }, []);

  const handleEnrollRequest = useCallback((request: any) => {
    // Nếu là public thì duyệt luôn
    const isPublic = request.isPublic;
    const status = isPublic ? 'approved' : 'pending';
    const newRequest = { ...request, id: Date.now(), status, requestedAt: new Date().toLocaleString() };
    setEnrollmentRequests(prev => [...prev, newRequest]);
    // Nếu là public, cập nhật enrolledUsers trong mockCourses
    if (isPublic && request.courseId && request.userId) {
      addUserToCourseEnrolledUsers(String(request.courseId), Number(request.userId));
    }
    // Gọi callback nếu có (để cập nhật UI ngay)
    if (request.onSuccess && typeof request.onSuccess === 'function') {
      request.onSuccess();
    }
  }, []);

  // 4. COMPUTED VALUES
  const currentRole = currentUser?.role || 'user';
  const userNotifications = useMemo(() =>
    currentRole === 'admin' ? notifications : notifications.filter(n => n.user_id === currentUser?.id),
    [currentRole, notifications, currentUser?.id]
  );
  const unreadCount = useMemo(() => userNotifications.filter(n => !n.read).length, [userNotifications]);

  // 5. GOM NHÓM STATE VÀ ACTIONS (CHỈ GOM Ở CUỐI CÙNG)
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
    isRestoringSession, // Add this to prevent premature redirects
  }), [currentUser, currentPage, selectedCourse, selectedUser, selectedTag, sidebarOpen, userGooglePicture, userNotifications, showNotifications, enrollmentRequests, currentRole, unreadCount, isRestoringSession]);

  const actions = useMemo(() => ({
    navigateTo,
    handleLogin,
    handleLogout,
    handleUpdateUser,
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
  }), [navigateTo, handleLogin, handleLogout, handleUpdateUser, isOwner, canAccessCourse, markAsRead, markAllAsRead, handleNotificationClick, handleApproveRequest, handleRejectRequest, handleEnrollRequest]);

  // 6. LỆNH RETURN DUY NHẤT Ở CUỐI FILE
  return { state, actions };
}

export default useDemoAppState;