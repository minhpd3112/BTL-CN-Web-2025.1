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

export interface CourseFilters {
  page?: number;
  limit?: number;
  search?: string;
  tags?: string;
  status?: 'draft' | 'pending' | 'approved' | 'rejected';
  visibility?: 'public' | 'private';
}

export interface CreateCourseRequest {
  title: string;
  description?: string;
  image_url?: string;
  visibility?: 'public' | 'private';
  tag_ids?: string[];
}

export interface UpdateCourseRequest {
  title?: string;
  description?: string;
  image_url?: string;
  visibility?: 'public' | 'private';
  tag_ids?: string[];
}