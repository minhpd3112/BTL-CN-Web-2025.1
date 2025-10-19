// ===================================
// EduLearn - TypeScript Types & Interfaces
// ===================================

export type UserRole = 'admin' | 'user';

export interface User {
  id: number;
  username: string;
  password: string;
  role: UserRole;
  name: string;
  avatar: string;
  email: string;
  fullName?: string;
  phone?: string;
  bio?: string;
  joinedDate: string;
  coursesCreated: number;
  coursesEnrolled: number;
  totalStudents: number;
  status: 'active' | 'inactive';
  lastLogin: string;
  location?: string;
  googleId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Tag {
  id: number;
  name: string;
  color: string;
  icon: string;
  courseCount: number;
  description: string;
  image?: string;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  overview?: string;
  ownerName: string;
  ownerId: number;
  ownerAvatar: string;
  rating: number;
  students: number;
  duration: string;
  image: string;
  tags: string[];
  status: 'pending' | 'approved' | 'rejected';
  visibility: 'public' | 'private';
  lessons: number;
  enrolledUsers: number[];
  createdAt: string;
  updatedAt?: string;
}

export interface Section {
  id: number;
  courseId: number;
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
  id: number;
  sectionId: number;
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
  id: number;
  userId: number;
  courseId: number;
  enrolledAt: string;
  progress: number;
  completedLessons: number[];
  lastAccessAt: string;
}

export interface EnrollmentRequest {
  id: number;
  courseId: number;
  userId: number;
  userName: string;
  userAvatar: string;
  userEmail: string;
  status: 'pending' | 'approved' | 'rejected';
  message: string;
  requestedAt: string;
  respondedAt: string | null;
}

export interface Review {
  id: number;
  courseId: number;
  userId: number;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  createdAt: string;
  helpful: number;
}

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  courseId?: number;
  userId?: number;
  timestamp: string;
  read: boolean;
  icon: string;
  color: string;
  action?: {
    page: Page;
    courseId?: number;
    userId?: number;
  };
}

export interface Activity {
  id: number;
  type: 'course_created' | 'course_pending' | 'user_enrolled' | 'course_approved';
  userId: number;
  userName: string;
  courseId?: number;
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
  | 'topic-detail';
