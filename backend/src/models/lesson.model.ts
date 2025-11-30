export interface Lesson {
  id: string;
  section_id: string;
  title: string;
  type: 'video' | 'text' | 'pdf' | 'quiz';
  content: VideoContent | TextContent | PdfContent | QuizContent;
  order_index: number;
  duration?: number;
  created_at: string;
  updated_at: string;
}

export interface VideoContent {
  youtube_url: string;
  duration?: number;
  thumbnail?: string;
  video_id?: string;
}

export interface TextContent {
  body: string; // HTML or Markdown
}

export interface PdfContent {
  file_url: string;
  file_name: string;
  file_size?: number;
}

export interface QuizContent {
  questions: QuizQuestion[];
  passing_score?: number; // Percentage to pass (0-100)
  time_limit?: number; // Minutes
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number; // Index of correct option (0-based)
  explanation?: string;
  points?: number;
}

export interface CreateLessonRequest {
  section_id: string;
  title: string;
  type: 'video' | 'text' | 'pdf' | 'quiz';
  content: VideoContent | TextContent | PdfContent | QuizContent;
  order_index: number;
  duration?: number;
}

export interface UpdateLessonRequest {
  title?: string;
  content?: VideoContent | TextContent | PdfContent | QuizContent;
  order_index?: number;
  duration?: number;
}