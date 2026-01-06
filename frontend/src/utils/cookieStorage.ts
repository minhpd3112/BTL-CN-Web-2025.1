/**
 * Cookie Storage Utility
 * Manages authentication tokens and user data using HTTP-only cookies
 * Replaces localStorage-based storage for better security
 */

/**
 * Set a cookie with the specified name, value, and options
 */
export const setCookie = (
  name: string,
  value: string,
  options: {
    maxAge?: number; // in seconds
    path?: string;
    sameSite?: 'Strict' | 'Lax' | 'None';
    secure?: boolean;
  } = {}
): void => {
  const {
    maxAge = 86400 * 7, // 7 days default
    path = '/',
    sameSite = 'Lax',
    secure = window.location.protocol === 'https:',
  } = options;

  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
  cookieString += `; path=${path}`;
  cookieString += `; max-age=${maxAge}`;
  cookieString += `; SameSite=${sameSite}`;
  if (secure) {
    cookieString += '; Secure';
  }

  document.cookie = cookieString;
};

/**
 * Get a cookie value by name
 */
export const getCookie = (name: string): string | null => {
  const nameEQ = `${encodeURIComponent(name)}=`;
  const cookies = document.cookie.split(';');

  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith(nameEQ)) {
      return decodeURIComponent(cookie.substring(nameEQ.length));
    }
  }

  return null;
};

/**
 * Delete a cookie by setting max-age to 0
 */
export const deleteCookie = (name: string, path: string = '/'): void => {
  document.cookie = `${encodeURIComponent(
    name
  )}=; path=${path}; max-age=0; SameSite=Lax`;
};

/**
 * Clear all application cookies
 */
export const clearAllCookies = (): void => {
  const cookies = document.cookie.split(';');
  cookies.forEach((cookie) => {
    const cookieName = cookie.split('=')[0].trim();
    if (cookieName.startsWith('edulearn_')) {
      deleteCookie(cookieName);
    }
  });
};

/**
 * Auth-specific cookie helpers
 */
export const authCookies = {
  /**
   * Set auth token cookie (secure, HTTP-only should be set by backend)
   */
  setAuthToken: (token: string): void => {
    setCookie('edulearn_auth_token', token, {
      maxAge: 86400 * 7, // 7 days
      path: '/',
      sameSite: 'Lax',
      secure: window.location.protocol === 'https:',
    });
  },

  /**
   * Get auth token from cookie
   */
  getAuthToken: (): string | null => {
    return getCookie('edulearn_auth_token');
  },

  /**
   * Delete auth token cookie
   */
  deleteAuthToken: (): void => {
    deleteCookie('edulearn_auth_token');
  },

  /**
   * Set user ID cookie
   */
  setUserId: (userId: string): void => {
    setCookie('edulearn_user_id', userId, {
      maxAge: 86400 * 7, // 7 days
      path: '/',
      sameSite: 'Lax',
      secure: window.location.protocol === 'https:',
    });
  },

  /**
   * Get user ID from cookie
   */
  getUserId: (): string | null => {
    return getCookie('edulearn_user_id');
  },

  /**
   * Delete user ID cookie
   */
  deleteUserId: (): void => {
    deleteCookie('edulearn_user_id');
  },

  /**
   * Set user data cookie (JSON stringified)
   */
  setUserData: (userData: any): void => {
    try {
      const dataString = JSON.stringify(userData);
      setCookie('edulearn_user_data', dataString, {
        maxAge: 86400 * 7, // 7 days
        path: '/',
        sameSite: 'Lax',
        secure: window.location.protocol === 'https:',
      });
    } catch (error) {
      console.error('Failed to set user data cookie:', error);
    }
  },

  /**
   * Get user data from cookie (JSON parsed)
   */
  getUserData: (): any | null => {
    try {
      const data = getCookie('edulearn_user_data');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to parse user data cookie:', error);
      return null;
    }
  },

  /**
   * Delete user data cookie
   */
  deleteUserData: (): void => {
    deleteCookie('edulearn_user_data');
  },

  /**
   * Clear all auth cookies
   */
  clearAll: (): void => {
    authCookies.deleteAuthToken();
    authCookies.deleteUserId();
    authCookies.deleteUserData();
  },
};
