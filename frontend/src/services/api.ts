const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Helper function to set auth token
const setAuthToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

// Helper function to clear auth token
const clearAuthToken = (): void => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_data');
};

// Helper function for API requests with auth
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  return response.json();
};

export const authAPI = {
  async signup(data: SignupRequest): Promise<AuthResponse> {
    const response = await fetchWithAuth(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await fetchWithAuth(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (response.success) {
      setAuthToken(response.data.session.access_token);
      localStorage.setItem('user_data', JSON.stringify(response.data.user));
    }

    return response;
  },

  async logout(): Promise<void> {
    try {
      await fetchWithAuth(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
      });
    } finally {
      clearAuthToken();
    }
  },

  async getProfile(): Promise<ProfileResponse> {
    return fetchWithAuth(`${API_BASE_URL}/auth/profile`);
  },

  async updateProfile(data: Partial<ProfileResponse['data']>): Promise<ProfileResponse> {
    return fetchWithAuth(`${API_BASE_URL}/auth/profile`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
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

export const coursesAPI = {
  async getAllCourses() {
    return fetchWithAuth(`${API_BASE_URL}/courses`);
  },

  async getCourseById(id: string) {
    return fetchWithAuth(`${API_BASE_URL}/courses/${id}`);
  },

  async createCourse(data: any) {
    return fetchWithAuth(`${API_BASE_URL}/courses`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateCourse(id: string, data: any) {
    return fetchWithAuth(`${API_BASE_URL}/courses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async deleteCourse(id: string) {
    return fetchWithAuth(`${API_BASE_URL}/courses/${id}`, {
      method: 'DELETE',
    });
  },
};

export const tagsAPI = {
  async getAllTags() {
    return fetchWithAuth(`${API_BASE_URL}/tags`);
  },

  async getTagById(id: string) {
    return fetchWithAuth(`${API_BASE_URL}/tags/${id}`);
  },

  async createTag(data: any) {
    return fetchWithAuth(`${API_BASE_URL}/tags`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateTag(id: string, data: any) {
    return fetchWithAuth(`${API_BASE_URL}/tags/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async deleteTag(id: string) {
    return fetchWithAuth(`${API_BASE_URL}/tags/${id}`, {
      method: 'DELETE',
    });
  },
};
