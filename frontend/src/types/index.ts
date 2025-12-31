// ===================================
// EduLearn - TypeScript Types & Interfaces
// ===================================

export type UserRole = 'admin' | 'user';

export interface User {
  id: string; // uuid
  username: string;
  // NOTE: password đã bị xóa - frontend KHÔNG BAO GIỜ nên biết password của user
  role: UserRole;
  name: string;
  avatar: string;
  email: string;
  fullName?: string;
  full_name?: string; // API field
  avatar_url?: string; // API field
  phone?: string;
  bio?: string;
  joinedDate: string;
  coursesCreated: number;
  coursesEnrolled: number;
  totalStudents: number;
  status: 'active' | 'inactive';
  lastLogin: string;
  location?: string;
  address?: string; // API field
  googleId?: string;
  createdAt?: string;
  created_at?: string; // API field
  updatedAt?: string;
  updated_at?: string; // API field
}

export interface Tag {
  id: string; // uuid
  name: string;
  color: string;
  icon: string;
  courseCount: number;
  description: string;
  image?: string;
}

export interface CourseOwner {
  id: string;
  full_name: string;
  avatar_url: string;
}

export interface Course {
  id: string; // uuid
  title: string;
  description: string;
  overview?: string;
  ownerId: string; // uuid
  ownerName?: string; // For mock data compatibility
  ownerAvatar?: string; // For mock data compatibility
  owner?: CourseOwner; // Thông tin owner trả về từ API mới
  rating: number;
  students: number;
  duration: string;
  image: string;
  image_url?: string; // for Supabase storage URLs
  tags: string[];
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  visibility: 'public' | 'private';
  lessons: number;
  enrolledUsers: number[];
  createdAt: string;
  updatedAt?: string;
}

export interface Section {
  id: string; // uuid
  courseId: string; // uuid
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
}

export interface QuizQuestion {
  question: string;
  type: 'single' | 'multiple';
  options: string[];
  correctAnswers: number[];
  explanation?: string;
}

export interface QuizSettings {
  quizType: 'exam' | 'practice';
  timeLimit?: number; // Thời gian giới hạn tính bằng phút (chỉ áp dụng cho exam)
  passingScore?: number; // Điểm tối thiểu để pass (%)
}

export interface Lesson {
  id: string; // uuid
  sectionId: string; // uuid
  title: string;
  type: 'video' | 'text' | 'pdf' | 'quiz';
  duration: string;
  completed?: boolean;
  youtubeUrl?: string;
  content?: string;
  description?: string;
  order?: number;
  quizQuestions?: QuizQuestion[];
  quizSettings?: QuizSettings;
}

export interface Enrollment {
  id: string; // uuid
  userId: string; // uuid
  courseId: string; // uuid
  enrolledAt: string;
  progress: number;
  completedLessons: number[];
  lastAccessAt: string;
}

export interface EnrollmentRequest {
  id: string; // uuid
  courseId: string; // uuid
  userId: string; // uuid
  userName: string;
  userAvatar: string;
  userEmail: string;
  status: 'pending' | 'approved' | 'rejected';
  message: string;
  requestedAt: string;
  respondedAt: string | null;
}

export interface Review {
  id: string; // uuid
  courseId: string; // uuid
  userId: string; // uuid
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  createdAt: string;
  helpful: number;
}


// Notification types for users
export type NotificationType =
  | 'course_approved'
  | 'course_rejected'
  | 'student_joined'
  | 'course_completed';

export interface Notification {
  id: string; // uuid
  type: NotificationType;
  title: string;
  message: string;
  courseId?: string; // uuid
  userId?: string; // uuid
  user_id?: string; // API field
  related_course_id?: string; // API field
  timestamp: string;
  read: boolean;
  icon: string;
  color: string;
  action?: {
    page: Page;
    courseId?: string; // uuid
    userId?: string; // uuid
  };
}

export interface Activity {
  id: string; // uuid
  type: 'course_created' | 'course_pending' | 'user_enrolled' | 'course_approved';
  userId: string; // uuid
  userName: string;
  courseId?: string; // uuid
  courseName?: string;
  timestamp: string;
  icon: string;
  color: string;
}

export type Page =
  | 'login'
  | 'home'
  | 'my-courses'
  | 'explore'
  | 'course-detail'
  | 'learning'
  | 'quiz'
  | 'create-course'
  | 'edit-course'
  | 'course-dashboard'
  | 'create-quiz'
  | 'admin-dashboard'
  | 'approve-courses'
  | 'manage-courses'
  | 'manage-users'
  | 'user-detail'
  | 'manage-tags'
  | 'course-students'
  | 'account-settings'
  | 'tag-detail'
  | 'ai-learning-path';
