# Cookie Implementation Verification Checklist

## To Verify Cookies Are Working:

### 1. Check Console Logs (F12 > Console)
After login, you should see:
```
[Cookie] 🍪 Auth token cookie set 
[Cookie] 🍪 Auth token retrieved from cookie
[Auth] ✅ Login successful - Cookies set: {
  hasAuthToken: true,
  hasUserId: true,
  hasUserData: true
}
[API] 🔑 Request to /api/courses - Auth token from cookie sent
```

### 2. Check Application > Storage > Cookies
✅ Should see:
- `edulearn_auth_token` (holds JWT token)
- `edulearn_user_id` (holds user UUID)
- `edulearn_user_data` (holds user profile as JSON)

❌ Should NOT see:
- `sd-tfdqmenqfwbuuzxlrekm-auth-token` (old Supabase localStorage)
- Any other localStorage items (except for non-auth data)

### 3. Check Application > Storage > Local Storage
✅ Should be empty or only contain non-auth data
❌ Should NOT contain auth tokens or credentials

### 4. Check Network Tab (F12 > Network)
When making API requests:
- ✅ See `Authorization: Bearer <token>` header
- ✅ See `Cookie: edulearn_auth_token=...` sent automatically
- ✅ Login response should have `Set-Cookie` header

### 5. Check Login/Logout Flow
✅ Login:
- Cookies are set automatically
- Can access protected pages
- Token persists across page refreshes

✅ Logout:
- All cookies are cleared
- Cannot access protected pages
- 401 errors on protected endpoints

## Expected Console Output Timeline

```
1. User clicks "Login"
   ↓
2. [Auth] ✅ Login successful - Cookies set...
   ↓
3. [Cookie] 🍪 Auth token cookie set
   ↓
4. [API] 🔑 Request to /api/courses - Auth token from cookie sent
   ↓
5. Success! Page loads with protected content
```

## If Something's Wrong

### localStorage still has auth tokens?
→ Check that Supabase is configured with `persistSession: false`
→ Clear browser cache/storage and reload

### Cookies not appearing?
→ Check Network tab > Response Headers for `Set-Cookie`
→ Verify backend is running on port 5001
→ Check browser console for errors

### 401 Unauthorized errors?
→ Check cookies in DevTools Application tab
→ Verify auth token cookie exists and isn't empty
→ Check that axios interceptor is setting Authorization header

### Backend not seeing the token?
→ Check backend has `cookie-parser` middleware
→ Verify CORS is set to `credentials: true`
→ Check auth middleware is reading from cookies

## Debug Commands (Browser Console)

```javascript
// Check if cookie exists
console.log(document.cookie);

// Get specific cookie
document.cookie.split(';').find(c => c.includes('edulearn_auth_token'));

// Check authCookies helper
import { authCookies } from '@/utils/cookieStorage';
authCookies.getAuthToken();   // Should return token string
authCookies.getUserData();    // Should return user object
```

## Key Changes Made

✅ Supabase `persistSession: false` - Disables localStorage persistence
✅ Console logging added - Verify flow in real-time
✅ Cookies set on login - Auth, UserID, UserData
✅ Cookies cleared on logout - Clean state
✅ Axios sends cookies automatically - withCredentials: true
✅ Backend sets HTTP-only cookie - Additional security
✅ Auth middleware supports cookies - Fallback from header
