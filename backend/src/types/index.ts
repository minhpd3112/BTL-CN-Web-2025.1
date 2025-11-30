export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
  raw_user_meta_data?: Record<string, any>;
}

export interface Tag {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  owner_id: string;
  title: string;
  description?: string;
  short_description?: string;
  overview?: string;
  image_url?: string;
  requirements?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  language?: string;
  duration_hours?: number;
  certificate_enabled?: boolean;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  visibility: 'public' | 'private';
  rejection_reason?: string;
  rejected_by?: string;
  rejected_at?: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Section {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
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
  status: 'pending' | 'approved' | 'rejected';
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