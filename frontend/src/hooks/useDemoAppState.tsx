import { useState, useMemo, useCallback, useEffect } from 'react';
import { supabase } from '@/services/api';
import {
  mockUsers,
  mockCourses,
  mockEnrollmentRequests,
} from '@/services/mocks';
import { User, Course, Page, Notification, EnrollmentRequest, Tag } from '@/types';

// --- MOCK DATA (Giữ bên ngoài Hook) ---
const mockNotifications: Notification[] = [
  // ... Giữ nguyên mảng notifications của bạn ở đây
];

export function useDemoAppState() {
  // 1. TẤT CẢ KHAI BÁO STATE NẰM Ở ĐẦU
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

  // 2. EFFECT LẮNG NGHE AUTH
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session && event === 'SIGNED_IN' && !currentUser) {
        // Lấy profile từ user_profiles
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        const metadata = session.user.user_metadata;
        // Lấy ngày tạo tài khoản từ profile (ưu tiên created_at), fallback về ngày hiện tại nếu không có
        let joinedDate = '';
        if (profile?.created_at) {
          joinedDate = typeof profile.created_at === 'string' ? profile.created_at : new Date(profile.created_at).toISOString();
        } else {
          joinedDate = new Date().toISOString();
        }
        const user = {
          id: session.user.id,
          email: session.user.email || '',
          name: profile?.full_name || metadata?.full_name || metadata?.name || '',
          avatar: profile?.avatar_url || metadata?.avatar_url || metadata?.picture || '',
          phone: profile?.phone || '',
          location: profile?.address || '',
          bio: profile?.bio || '',
          role: 'user',
          joinedDate,
          status: 'active',
          coursesCreated: 0,
          totalStudents: 0
        };
        localStorage.setItem('auth_token', session.access_token);
        localStorage.setItem('user_data', JSON.stringify(user));
        setCurrentUser(user as any);
        setCurrentPage('home');
      }
    });
    return () => subscription.unsubscribe();
  }, [currentUser]);

  // 3. TẤT CẢ CÁC HÀM LOGIC (useCallback)
  const navigateTo = useCallback((page: Page, course?: Course) => {
    setCurrentPage(page);
    if (course) setSelectedCourse(course);
    setSidebarOpen(false);
    window.scrollTo(0, 0);
  }, []);

  const handleLogin = useCallback((user: User, googlePicture?: string) => {
    setCurrentUser(user);
    if (googlePicture) setUserGooglePicture(googlePicture);
    localStorage.setItem('user_data', JSON.stringify(user));
    navigateTo('home');
  }, [navigateTo]);

  const handleLogout = useCallback(async () => {
    try { await supabase.auth.signOut(); } catch (e) { console.error(e); }
    localStorage.removeItem('user_data');
    localStorage.removeItem('auth_token');
    setCurrentUser(null);
    setUserGooglePicture(null);
    setCurrentPage('login');
  }, []);

  const handleUpdateUser = useCallback((updatedUser: User) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('user_data', JSON.stringify(updatedUser));
  }, []);

  const isOwner = useCallback((course: Course) => 
    currentUser ? course.ownerId === currentUser.id : false, [currentUser]);

  const canAccessCourse = useCallback((course: Course) => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    if (course.visibility === 'public') return true;
    return course.ownerId === currentUser.id || course.enrolledUsers?.includes(currentUser.id);
  }, [currentUser]);

  const markAsRead = useCallback((id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const handleNotificationClick = useCallback((notification: Notification) => {
    markAsRead(notification.id);
    if (notification.action) {
      const { page, courseId } = notification.action;
      if (courseId) {
        const course = mockCourses.find(c => c.id === courseId);
        if (course) navigateTo(page as Page, course);
      } else {
        navigateTo(page as Page);
      }
    }
  }, [markAsRead, navigateTo]);

  const handleApproveRequest = useCallback((requestId: number) => {
    setEnrollmentRequests(prev => prev.map(req =>
      req.id === requestId ? { ...req, status: 'approved', respondedAt: new Date().toLocaleString() } : req
    ));
  }, []);

  const handleRejectRequest = useCallback((requestId: number) => {
    setEnrollmentRequests(prev => prev.map(req =>
      req.id === requestId ? { ...req, status: 'rejected', respondedAt: new Date().toLocaleString() } : req
    ));
  }, []);

  const handleEnrollRequest = useCallback((request: any) => {
    const newRequest = { ...request, id: Date.now(), status: 'pending', requestedAt: new Date().toLocaleString() };
    setEnrollmentRequests(prev => [...prev, newRequest]);
  }, []);

  // 4. COMPUTED VALUES
  const currentRole = currentUser?.role || 'user';
  const userNotifications = useMemo(() => 
    currentRole === 'admin' ? notifications : notifications.filter(n => n.userId === currentUser?.id),
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
  }), [currentUser, currentPage, selectedCourse, selectedUser, selectedTag, sidebarOpen, userGooglePicture, userNotifications, showNotifications, enrollmentRequests, currentRole, unreadCount]);

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