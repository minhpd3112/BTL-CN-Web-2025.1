import axios, { AxiosInstance } from 'axios';
import { createClient } from '@supabase/supabase-js';

// Environment variables 
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase environment variables! Check your .env file.');
}

// Create Supabase client for direct database queries (e.g., user profiles)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// -----------------------------
// Axios instance
// -----------------------------
// Create axios instance with token
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// -----------------------------
// Auth token helpers
// -----------------------------
const getAuthToken = (): string | null => localStorage.getItem('auth_token');

const setAuthToken = (token: string) => localStorage.setItem('auth_token', token);

const clearAuthToken = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_data');
};

// Axios request interceptor to attach token
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Axios response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthToken();
      // Optional: redirect to login
      // window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// -----------------------------
// Types
// -----------------------------
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  full_name: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      role: 'admin' | 'user';
      full_name: string;
    };
    session: {
      access_token: string;
      refresh_token: string;
      expires_in: number;
      token_type: string;
    };
  };
}

export interface ProfileResponse {
  success: boolean;
  data: {
    id: string;
    full_name: string;
    avatar_url: string;
    phone: string;
    address: string;
    bio: string;
    created_at: string;
    updated_at: string;
  };
}

// -----------------------------
// Auth API
// -----------------------------
export const authAPI = {
  async signup(data: SignupRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/signup', data);
    return response.data;
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);

    if (response.data.success) {
      setAuthToken(response.data.data.session.access_token);
      localStorage.setItem('user_data', JSON.stringify(response.data.data.user));
    }

    return response.data;
  },

  async loginWithGoogle(token: string): Promise<AuthResponse> {
    // Replace '/auth/google' with your backend Google login endpoint
    const response = await api.post<AuthResponse>('/auth/google', { token });

    if (response.data.success) {
      setAuthToken(response.data.data.session.access_token);
      localStorage.setItem('user_data', JSON.stringify(response.data.data.user));
    }

    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      clearAuthToken();
    }
  },

  async getProfile(): Promise<ProfileResponse> {
    const response = await api.get<ProfileResponse>('/auth/profile');
    return response.data;
  },

  async updateProfile(data: Partial<ProfileResponse['data']>): Promise<ProfileResponse> {
    const response = await api.patch<ProfileResponse>('/auth/profile', data);
    return response.data;
  },

  getStoredUser() {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  },

  getStoredToken() {
    return getAuthToken();
  },

  isAuthenticated() {
    return !!getAuthToken();
  },

  logout_local() {
    clearAuthToken();
  },
};

// -----------------------------
// Courses API
// -----------------------------
export const coursesAPI = {
  getAllCourses: () => api.get('/courses?limit=1000').then(res => res.data), // Request all courses without pagination
  getCourseById: (id: string) => api.get(`/courses/${id}`).then(res => res.data),
  createCourse: (data: any) => api.post('/courses', data).then(res => res.data),
  updateCourse: (id: string, data: any) => api.patch(`/courses/${id}`, data).then(res => res.data),
  deleteCourse: (id: string) => api.delete(`/courses/${id}`).then(res => res.data),
  addCourseTags: (courseId: string, tags: string[]) => api.post(`/courses/${courseId}/tags`, { tags }).then(res => res.data),
};

// -----------------------------
// Tags API
// -----------------------------
export const tagsAPI = {
  getAllTags: () => api.get('/tags').then(res => res.data),
  getTagById: (id: string) => api.get(`/tags/${id}`).then(res => res.data),
  createTag: (data: any) => api.post('/tags', data).then(res => res.data),
  updateTag: (id: string, data: any) => api.patch(`/tags/${id}`, data).then(res => res.data),
  deleteTag: (id: string) => api.delete(`/tags/${id}`).then(res => res.data),
};

// -----------------------------
// Sections API
// -----------------------------
export const sectionsAPI = {
  getByCourseId: (courseId: string) => api.get(`/sections/course/${courseId}`).then(res => res.data),
  getById: (id: string) => api.get(`/sections/${id}`).then(res => res.data),
  create: (data: any) => api.post('/sections', data).then(res => res.data),
  update: (id: string, data: any) => api.patch(`/sections/${id}`, data).then(res => res.data),
  delete: (id: string) => api.delete(`/sections/${id}`).then(res => res.data),
  reorder: (data: any) => api.post('/sections/reorder', data).then(res => res.data),
};

// -----------------------------
// Lessons API
// -----------------------------
export const lessonsAPI = {
  getBySectionId: (sectionId: string) => api.get(`/lessons/section/${sectionId}`).then(res => res.data),
  getById: (id: string) => api.get(`/lessons/${id}`).then(res => res.data),
  create: (data: any) => api.post('/lessons', data).then(res => res.data),
  update: (id: string, data: any) => api.patch(`/lessons/${id}`, data).then(res => res.data),
  delete: (id: string) => api.delete(`/lessons/${id}`).then(res => res.data),
};

// -----------------------------
// Enrollments API
// -----------------------------
export const enrollmentsAPI = {
  getMyEnrollments: () => api.get('/enrollments/my-enrollments').then(res => res.data),
  getByCourseId: (courseId: string, status?: string) => {
    const params = status ? `?status=${status}` : '';
    const cacheBuster = `${params ? '&' : '?'}_t=${Date.now()}`; // Prevent cache
    return api.get(`/enrollments/course/${courseId}${params}${cacheBuster}`).then(res => res.data);
  },
  create: (data: { course_id: string; request_message?: string }) =>
    api.post('/enrollments', data).then(res => res.data),
  updateStatus: (id: string, status: 'approved' | 'rejected', rejection_reason?: string) =>
    api.patch(`/enrollments/${id}/status`, { status, rejection_reason }).then(res => res.data),
  delete: (id: string) => api.delete(`/enrollments/${id}`).then(res => res.data),
  inviteByEmail: (courseId: string, inviteeEmail: string) =>
    api.post('/enrollments/invite-by-email', {
      course_id: courseId,
      invitee_email: inviteeEmail
    }).then(res => res.data),
  getCourseAverageProgress: (courseId: string) =>
    api.get(`/enrollments/course/${courseId}/average-progress`).then(res => res.data),
};

// -----------------------------
// Lesson Progress API
// -----------------------------
export const lessonProgressAPI = {
  toggleCompletion: (lessonId: string) =>
    api.post('/lesson-progress/toggle', { lessonId }).then(res => res.data),

  getUserProgress: (courseId: string) =>
    api.get(`/lesson-progress/course/${courseId}`).then(res => res.data),
};

