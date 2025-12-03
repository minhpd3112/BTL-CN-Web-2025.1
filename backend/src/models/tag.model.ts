export interface Tag {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  course_count?: number;
}

export interface CreateTagRequest {
  name: string;
  description?: string;
}

export interface UpdateTagRequest {
  name?: string;
  description?: string;
}