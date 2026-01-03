// Notification types for users (keep in sync with frontend)
export type NotificationType =
  | 'course_approved'
  | 'course_rejected'
  | 'course_pending_review'
  | 'enrollment_request'
  | 'enrollment_approved'
  | 'enrollment_rejected'
  | 'student_joined'
  | 'course_completed';

export interface Notification {
  id: string; // uuid
  type: NotificationType;
  title: string;
  message: string;
  courseId?: string; // uuid
  userId?: string; // uuid
  timestamp: string;
  read: boolean;
  icon: string;
  color: string;
  action?: {
    page: string;
    courseId?: string; // uuid
    userId?: string; // uuid
  };
}
export interface User {
  id: number;
  username: string;
  password: string;
  role: 'admin' | 'user';
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

export interface Lesson {
  id: string;
  section_id: string;
  title: string;
  description?: string;
  content_type: 'video' | 'article' | 'quiz' | 'pdf';
  content_url?: string;
  content_text?: string;
  duration?: number;
  order_index: number;
  is_free: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuizQuestion {
  id: string;
  lesson_id: string;
  question: string;
  type: 'single_choice' | 'multiple_choice';
  order_index: number;
  explanation?: string;
  answers?: QuizAnswer[];
  created_at: string;
}

export interface QuizAnswer {
  id: string;
  question_id: string;
  answer_text: string;
  is_correct: boolean;
  order_index: number;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'left';
  request_message?: string;
  rejection_reason?: string;
  approved_by?: string;
  enrolled_at: string;
  updated_at: string;
}

export interface CourseFilters {
  page?: number;
  limit?: number;
  search?: string;
  tags?: string;
  status?: 'draft' | 'pending' | 'approved' | 'rejected';
  visibility?: 'public' | 'private';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}