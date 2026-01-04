# Security Implementation - Data Storage & Headers

## Overview
This document outlines the security improvements made to prevent storing sensitive data in plaintext and added security headers to the application.

## Problem Addressed
**CodeQL Security Warning**: Clear-text storage of sensitive data
- Previously: Entire user profiles (including emails, roles, IDs) stored in localStorage
- Risk: XSS attacks could expose sensitive user information
- Solution: Store only authentication tokens and user IDs; fetch profile data on-demand

## Implementation

### 1. Frontend Data Storage - Secure Approach

#### What Changed
**Before:**
```typescript
// ❌ INSECURE: Storing full user object in plaintext
localStorage.setItem('user_data', JSON.stringify({
  id, email, name, role, avatar, coursesCreated, ...
}));
```

**After:**
```typescript
// ✅ SECURE: Store ONLY non-sensitive auth data
localStorage.setItem('auth_token', token);      // JWT - standard practice
localStorage.setItem('user_id', userId);        // ID only
```

#### What's Stored
| Data | Stored? | Reason |
|------|---------|--------|
| `auth_token` (JWT) | ✅ Yes | Standard for auth; contains encrypted user claims |
| `user_id` | ✅ Yes | Needed to fetch profile; doesn't reveal sensitive info |
| `email` | ❌ No | Sensitive - fetch from Supabase session if needed |
| `role` | ❌ No | Sensitive - already in JWT claims |
| `avatar_url` | ❌ No | Non-essential - fetch with profile |
| `full_name` | ❌ No | Personal data - fetch with profile |

#### Where Updated
Files modified:
- `frontend/src/pages/LoginPage/index.tsx` - Admin & regular login
- `frontend/src/hooks/useDemoAppState.tsx` - State management
- `frontend/src/services/api.ts` - API client methods

### 2. Backend Security Headers

#### Security Headers Added
```typescript
helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  strictTransportSecurity: {
    maxAge: 31536000,        // 1 year
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
  noSniff: true,
  frameguard: { action: 'deny' },
})
```

**What each header does:**
- **CSP (Content Security Policy)**: Prevents XSS attacks by controlling resource loading
- **HSTS (Strict-Transport-Security)**: Forces HTTPS connections
- **Referrer-Policy**: Limits referrer information leakage
- **X-XSS-Protection**: Browser-level XSS protection
- **X-Content-Type-Options**: Prevents MIME type sniffing
- **X-Frame-Options**: Prevents clickjacking attacks
- **X-Powered-By**: Disabled to hide framework information

#### Files Modified
- `backend/src/app.ts` - Express app security configuration
- `backend/src/config/supabase.ts` - Supabase client headers

### 3. Rate Limiting (Previously Implemented)
Already configured in `backend/src/middlewares/rateLimiter.ts`:
- Auth endpoints: 5 attempts per 15 minutes
- AI endpoints: 10 requests per hour
- General API: 100 requests per 15 minutes
- Read operations: 200 requests per 15 minutes

## Best Practices for Data Security

### ✅ DO
- Store ONLY authentication tokens in localStorage
- Keep tokens short-lived (15-30 minutes)
- Use HTTPS in production always
- Validate all user inputs
- Use environment variables for secrets
- Implement CSRF protection
- Enable HSTS preloading
- Use secure cookies (HttpOnly, Secure, SameSite flags)

### ❌ DON'T
- Store passwords anywhere (rely on Supabase Auth)
- Store full user objects or personal data in localStorage
- Use localStorage for sensitive PII (email, phone, SSN)
- Disable security headers
- Commit `.env` files to version control
- Use `var` for global variables
- Log sensitive data

## Testing Security

### Check Headers
```bash
curl -I https://your-api-domain.com
# Look for security headers in response
```

### Check localStorage
```javascript
// In browser DevTools console
localStorage  // Should show only: auth_token, user_id
```

### Verify Rate Limiting
```bash
# Should fail after 5 attempts
for i in {1..10}; do 
  curl -X POST http://localhost:5001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"test"}'
done
```

## Migration Notes

If upgrading from old version:
1. Users' old `user_data` entries will be ignored
2. On next login, only token & ID are stored
3. User profile is fetched fresh from Supabase
4. No data loss; just better security

## CSP Header Adjustments

If external resources needed:
```typescript
// Example: Allow Google Fonts
styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com']

// Example: Allow external scripts
scriptSrc: ["'self'", 'https://trusted-domain.com']
```

Update in `backend/src/app.ts` as needed.

## References
- [OWASP: Local Storage](https://owasp.org/www-community/dom_based_xss)
- [MDN: Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [MDN: Strict-Transport-Security](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security)
- [Helmet.js Documentation](https://helmetjs.github.io/)
