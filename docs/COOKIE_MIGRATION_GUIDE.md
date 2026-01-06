# Migration Guide: localStorage to Cookies

## Overview
This document outlines the migration from localStorage-based authentication to HTTP-only cookies for improved security.

## Key Changes

### Frontend Changes

#### 1. New Cookie Utility (`frontend/src/utils/cookieStorage.ts`)
Created a comprehensive cookie management utility with the following features:
- `setCookie()`: Set cookies with configurable options
- `getCookie()`: Retrieve cookie values
- `deleteCookie()`: Delete specific cookies
- `authCookies`: Namespace with auth-specific helpers
  - `setAuthToken()`: Store JWT token in cookie
  - `getAuthToken()`: Retrieve auth token from cookie
  - `setUserId()`: Store user ID
  - `setUserData()`: Store user profile data (JSON stringified)
  - `getUserData()`: Retrieve and parse user data
  - `clearAll()`: Clear all auth-related cookies

#### 2. API Service Updates (`frontend/src/services/api.ts`)
- Removed `secureStorage` imports and dependencies
- Updated `api` axios instance with `withCredentials: true`
- Modified request interceptor to use `authCookies.getAuthToken()`
- Updated response interceptor to use `authCookies.clearAll()` on 401
- Updated `authAPI.login()` to use `authCookies` instead of `setSecureItem()`
- Updated `authAPI.logout()` to use `authCookies.clearAll()`
- Updated `authAPI.getStoredUser()` and `authAPI.getStoredToken()` to use cookie methods
- Updated `adminAPI.login()` to use `authCookies`

#### 3. Component Updates
- **useDemoAppState.tsx**: Updated `handleUpdateUser()` to use `authCookies.setUserId()`
- **AccountSettingsPage/index.tsx**: Updated logout to use `authCookies.clearAll()` instead of `localStorage.clear()`
- **CreateCoursePage/index.tsx**: Updated `uploadImage()` to use `authCookies.getAuthToken()`

### Backend Changes

#### 1. Updated Dependencies (`backend/package.json`)
Added:
- `cookie-parser`: ^1.4.6 (for parsing cookies)
- `@types/cookie-parser`: ^1.4.6 (TypeScript types)

#### 2. App Configuration (`backend/src/app.ts`)
- Added `import cookieParser from 'cookie-parser'`
- Added `app.use(cookieParser())` middleware after CORS
- CORS already configured with `credentials: true`

#### 3. Auth Controller Updates (`backend/src/controllers/auth.controller.ts`)
- **Login endpoint**: Sets HTTP-only secure cookie after successful login:
  ```typescript
  res.cookie('edulearn_auth_token', session.access_token, {
    httpOnly: true,
    secure: isSecure,           // true in production
    sameSite: 'lax',
    maxAge: session.expires_in * 1000,
    path: '/',
  });
  ```
- **Logout endpoint**: Clears the auth cookie:
  ```typescript
  res.clearCookie('edulearn_auth_token', { path: '/' });
  ```

#### 4. Auth Middleware Updates (`backend/src/middlewares/auth.middleware.ts`)
Updated `authenticate` middleware to:
1. First try to get token from `Authorization` header (Bearer token)
2. Fall back to reading from `edulearn_auth_token` cookie if no header
3. Maintains backward compatibility with both approaches
4. Verifies token with Supabase Auth

## Cookie Specifications

### Auth Token Cookie
- **Name**: `edulearn_auth_token`
- **HTTP-Only**: Yes (frontend cannot access via JavaScript)
- **Secure**: Yes (only sent over HTTPS in production)
- **SameSite**: Lax (prevents CSRF attacks)
- **Path**: `/` (sent with all requests)
- **Max-Age**: 7 days (configurable per session expiration)

### User ID Cookie
- **Name**: `edulearn_user_id`
- **HTTP-Only**: No (frontend needs read access)
- **Secure**: Yes (only sent over HTTPS in production)
- **SameSite**: Lax
- **Path**: `/`

### User Data Cookie
- **Name**: `edulearn_user_data`
- **HTTP-Only**: No
- **Secure**: Yes
- **SameSite**: Lax
- **Path**: `/`
- **Format**: JSON stringified user profile

## Security Benefits

1. **XSS Protection**: HTTP-only cookies cannot be accessed by JavaScript, preventing token theft via XSS attacks
2. **CSRF Protection**: SameSite attribute prevents cross-site request forgery
3. **Automatic Transmission**: Cookies are automatically sent with requests (no manual header injection needed)
4. **Secure Transport**: Secure flag ensures cookies only sent over HTTPS
5. **Clear Semantics**: Cookies have well-defined lifecycle management

## Migration Steps for Developers

### To Run the Updated Application

1. **Backend**:
   ```bash
   cd backend
   npm install  # Installs new cookie-parser dependency
   npm run dev  # Start development server
   ```

2. **Frontend**:
   ```bash
   cd frontend
   npm run dev:frontend  # Vite development server
   ```

### Testing the Changes

1. **Login Flow**:
   - Navigate to login page
   - Enter credentials
   - Inspect DevTools Network tab - check Set-Cookie response header
   - Inspect DevTools Application > Cookies - see `edulearn_auth_token` cookie

2. **Protected Routes**:
   - After login, cookies are automatically sent with API requests
   - No manual Authorization header injection needed

3. **Logout Flow**:
   - Click logout
   - Auth cookie is cleared
   - Subsequent requests fail with 401 (as expected)

### Deprecation Notes

The following utilities are deprecated and can be removed after full migration:
- `frontend/src/utils/secureStorage.ts` - All encryption/storage logic
- Related imports from secureStorage across the codebase

## Backward Compatibility

- Backend middleware supports BOTH Authorization headers AND cookies
- Existing Bearer token flow still works
- New cookie-based flow coexists with header-based approach
- This allows gradual migration if needed

## Environment Considerations

- **Development**: `secure: false` (allows non-HTTPS testing)
- **Production**: `secure: true` (requires HTTPS)
- Control via: `NODE_ENV` environment variable

## Future Enhancements

1. **Refresh Tokens**: Implement refresh token rotation via separate HTTP-only cookie
2. **CSRF Tokens**: Add CSRF token validation for state-changing operations
3. **Session Management**: Implement server-side session tracking
4. **Cookie Encryption**: Optional additional encryption layer for extra security

## References

- [MDN: HTTP Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
- [OWASP: Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [Express.js Cookie Documentation](https://expressjs.com/en/api/res.html#res.cookie)
