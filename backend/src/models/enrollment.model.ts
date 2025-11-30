export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  status: 'pending' | 'approved' | 'rejected';
  message?: string;
  enrolled_at: string;
  updated_at: string;
  user?: {
    id: string;
    email: string;
    name?: string;
    avatar?: string;
  };
  course?: {
    id: string;
    title: string;
    image_url?: string;
  };
}

export interface CreateEnrollmentRequest {
  course_id: string;
  message?: string;
}

export interface UpdateEnrollmentRequest {
  status: 'approved' | 'rejected';
  message?: string;
}

export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  completed_at?: string;
  created_at: string;
}

export interface CourseProgress {
  course_id: string;
  total_lessons: number;
  completed_lessons: number;
  progress_percentage: number;
  last_accessed?: string;
}