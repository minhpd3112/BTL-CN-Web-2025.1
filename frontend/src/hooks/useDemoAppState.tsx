import { useState, useMemo, useCallback, useEffect } from 'react';
import { supabase, notificationsAPI } from '@/services/api';
import { getSecureItem, setSecureItem, removeSecureItem, isWebCryptoAvailable, getSecureItemFallback, setSecureItemFallback, getSecureItemFast, setSecureItemFast } from '@/utils/secureStorage';
import { User, Course, Page, Notification, EnrollmentRequest, Tag } from '@/types';
import { authAPI } from '@/services/api';

export function useDemoAppState() {
  // 1. TẤT CẢ KHAI BÁO STATE NẰM Ở ĐẦU
  // Initialize from secure storage to persist Admin session
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const stored = authAPI.getStoredUser();
    console.log('[useDemoAppState] Initializing currentUser, stored:', stored);
    if (stored) {
      // Map backend user to frontend User type if necessary
      // Check if it looks like a backend user (has full_name but not name?)
      if (!stored.name && (stored.full_name || stored.email)) {
        return {
          ...stored,
          id: stored.id || 'admin',
          name: stored.full_name || stored.name || 'Admin',
          username: stored.username || stored.email?.split('@')[0] || 'admin',
          email: stored.email || '',
          avatar: stored.avatar || stored.avatar_url || '',
          role: stored.role || 'user',
          joinedDate: stored.joinedDate || new Date().toISOString(),
          coursesCreated: stored.coursesCreated || 0,
          coursesEnrolled: stored.coursesEnrolled || 0,
          totalStudents: stored.totalStudents || 0,
          status: stored.status || 'active',
        } as User;
      }
      return stored as User;
    }
    return null;
  });

  // Set initial page based on auth state or URL
  const [currentPage, setCurrentPage] = useState<Page>(() => {
    // 1. Priority: URL params
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const pageParam = params.get('page') as Page;
      if (pageParam) return pageParam;
    }
    // 2. Fallback: Auth state
    const stored = authAPI.getStoredUser();
    if (stored) {
      return stored.role === 'admin' ? 'admin-dashboard' : 'home';
    }
    return 'login';
  });

  const [isRestoringSession, setIsRestoringSession] = useState(false); // No restore needed

  // Init selectedCourse from URL if present
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  // Note: We no longer synchronous load from mockCourses.
  // The CourseDetailPage or App logic should fetch course data based on URL ID if needed.

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userGooglePicture, setUserGooglePicture] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [enrollmentRequests, setEnrollmentRequests] = useState<EnrollmentRequest[]>([]);

  // 2. SIMPLE SESSION RESTORE (using onAuthStateChange only - no manual getSession)
  useEffect(() => {
    setIsRestoringSession(false);
  }, []);

  // 3. AUTH STATE LISTENER (for OAuth callback only - simplified)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[useDemoAppState] Auth Event:', event, 'Session User:', session?.user?.id);

      // Only handle INITIAL_SESSION (page refresh) and TOKEN_REFRESHED
      // Email/password login is handled in LoginPage directly
      if (event === 'INITIAL_SESSION' && session) {
        // Fetch profile from database (non-blocking)
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        const metadata = session.user.user_metadata;
        const realRole = metadata?.role || 'user';

        // Stale storage fix: Allow update if currentUser is null OR role mismatch
        if (!currentUser || currentUser.role !== realRole) {
          console.log(`[useDemoAppState] Updating session. Current: ${currentUser?.role}, Session: ${realRole}`);

          const user = {
            id: session.user.id,
            email: session.user.email || '',
            name: profile?.full_name || metadata?.full_name || metadata?.name || 'User',
            avatar: profile?.avatar_url || metadata?.avatar_url || metadata?.picture || '',
            phone: profile?.phone || '',
            location: profile?.address || '',
            bio: profile?.bio || '',
            role: realRole,
            joinedDate: profile?.created_at || session.user.created_at || new Date().toISOString(),
            status: 'active',
            coursesCreated: 0,
            totalStudents: 0
          };

          // Store tokens
          setSecureItemFallback('auth_token', session.access_token);
          setSecureItemFallback('user_id', session.user.id);

          setCurrentUser(user as any);

          // Only redirect if NO page param was present (avoid overwriting deep link)
          const params = new URLSearchParams(window.location.search);
          if (!params.get('page')) {
            if (user.role === 'admin') {
              setCurrentPage('admin-dashboard');
            } else if (!currentUser) {
              setCurrentPage('home');
            }
          }
        }
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

  // --- BROWSER HISTORY SYNC ---
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const page = (params.get('page') as Page) || 'home';
      const courseId = params.get('courseId');

      console.log('[useDemoAppState] PopState:', page, courseId);
      setCurrentPage(page);

      if (courseId) {
        // Should fetch course by ID asynchronously if not already selected
        // For now, we rely on the component route to fetch data if selectedCourse is null
        console.log('[useDemoAppState] PopState courseId:', courseId);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []); // Run once on mount

  // 5. TẤT CẢ CÁC HÀM LOGIC (useCallback)
  const navigateTo = useCallback((page: Page, course?: Course) => {
    setCurrentPage(page);
    if (course) setSelectedCourse(course);
    setSidebarOpen(false);
    window.scrollTo(0, 0);

    // Sync to URL
    const params = new URLSearchParams();
    params.set('page', page);
    if (course) {
      params.set('courseId', course.id);
    }

    // Check if new state is different to avoid duplicate history entries
    const currentParams = new URLSearchParams(window.location.search);
    if (currentParams.get('page') !== page || currentParams.get('courseId') !== (course?.id || null)) {
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.pushState({}, '', newUrl);
    }

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
    // Clear URL params on logout
    window.history.pushState({}, '', '/?page=login');
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
    // Nếu là public, cập nhật enrolledUsers không cần thiết vì API đã xử lý
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