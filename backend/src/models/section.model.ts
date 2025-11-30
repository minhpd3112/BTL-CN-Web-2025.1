import type { Lesson } from './lesson.model';

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

export interface CreateSectionRequest {
  course_id: string;
  title: string;
  description?: string;
  order_index: number;
}

export interface UpdateSectionRequest {
  title?: string;
  description?: string;
  order_index?: number;
}