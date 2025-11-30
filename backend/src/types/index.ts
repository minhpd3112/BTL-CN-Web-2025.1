export interface User {
  id: string;
  email: string;
  role?: string;
  raw_user_meta_data?: any;
}

export interface Tag {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  owner_id: string;
  title: string;
  description?: string;
  image_url?: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  visibility: 'public' | 'private';
  created_at: string;
  updated_at: string;
}

export interface CourseWithDetails extends Course {
  tags: Tag[];
  sections?: Section[];
  enrollmentCount?: number;
}

export interface Section {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  section_id: string;
  title: string;
  description?: string;
  content_type: 'video' | 'article' | 'quiz';
  content_url?: string;
  duration?: number;
  order_index: number;
  is_free: boolean;
  created_at: string;
  updated_at: string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  status: 'pending' | 'approved' | 'rejected';
  enrolled_at: string;
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