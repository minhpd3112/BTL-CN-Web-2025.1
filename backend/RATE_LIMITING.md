# Rate Limiting Implementation

## Overview
Rate limiting has been implemented across all API routes to prevent DoS (Denial of Service) attacks and abuse. The system uses `express-rate-limit` middleware with different rate limits based on endpoint sensitivity and resource intensity.

## Rate Limiter Types

### 1. Auth Limiter (Strictest)
- **Window**: 15 minutes
- **Max Requests**: 5 per window
- **Applied to**: Authentication endpoints (login, signup, admin login)
- **Purpose**: Prevents brute force attacks on authentication
- **Routes**:
  - `POST /api/auth/login`
  - `POST /api/auth/signup`
  - `POST /api/auth/admin/login`

### 2. AI Limiter (Resource-Intensive)
- **Window**: 1 hour
- **Max Requests**: 10 per window
- **Applied to**: AI-powered course generation endpoints
- **Purpose**: Limits expensive AI operations
- **Routes**:
  - `POST /api/ai-course/preview`
  - `POST /api/ai-course/generate`

### 3. Create Limiter (Moderate)
- **Window**: 15 minutes
- **Max Requests**: 20 per window
- **Applied to**: Resource creation endpoints
- **Purpose**: Prevents spam and abuse of create operations
- **Routes**:
  - Course creation
  - Section/Lesson creation
  - Quiz creation
  - Review creation
  - Enrollment creation
  - Tag creation (admin only)

### 4. API Limiter (Standard)
- **Window**: 15 minutes
- **Max Requests**: 100 per window
- **Applied to**: Most general API operations
- **Purpose**: General protection for update/delete operations
- **Routes**: Updates, deletes, status changes, etc.

### 5. Read Limiter (Most Relaxed)
- **Window**: 15 minutes
- **Max Requests**: 200 per window
- **Applied to**: Read-only operations
- **Purpose**: Allows higher throughput for read operations
- **Routes**: GET endpoints for courses, lessons, sections, reviews, etc.

## Route-Specific Implementation

### Authentication Routes (`/api/auth`)
```typescript
POST /signup          → authLimiter (5/15min)
POST /login           → authLimiter (5/15min)
POST /admin/login     → authLimiter (5/15min)
POST /logout          → apiLimiter (100/15min)
GET /profile          → apiLimiter (100/15min)
PATCH /profile        → apiLimiter (100/15min)
```

### AI Course Routes (`/api/ai-course`)
```typescript
POST /preview         → aiLimiter (10/hour)
POST /generate        → aiLimiter (10/hour)
```

### Course Routes (`/api/courses`)
```typescript
GET /                 → readLimiter (200/15min)
GET /:id              → readLimiter (200/15min)
POST /                → createLimiter (20/15min)
POST /:id/tags        → apiLimiter (100/15min)
PATCH /:id            → apiLimiter (100/15min)
PATCH /:id/review     → apiLimiter (100/15min)
DELETE /:id           → apiLimiter (100/15min)
```

### Enrollment Routes (`/api/enrollments`)
```typescript
GET /my-enrollments               → readLimiter (200/15min)
GET /course/:courseId             → readLimiter (200/15min)
GET /:id/progress                 → readLimiter (200/15min)
GET /course/:courseId/avg-progress → readLimiter (200/15min)
POST /                            → createLimiter (20/15min)
POST /invite-by-email             → createLimiter (20/15min)
PATCH /:id/status                 → apiLimiter (100/15min)
PATCH /:id/leave                  → apiLimiter (100/15min)
DELETE /:id                       → apiLimiter (100/15min)
```

### Lesson Routes (`/api/lessons`)
```typescript
GET /section/:sectionId           → readLimiter (200/15min)
GET /:id                          → readLimiter (200/15min)
POST /                            → createLimiter (20/15min)
POST /:id/quiz                    → createLimiter (20/15min)
PATCH /:id                        → apiLimiter (100/15min)
PATCH /quiz/:questionId           → apiLimiter (100/15min)
DELETE /:id                       → apiLimiter (100/15min)
DELETE /quiz/:questionId          → apiLimiter (100/15min)
POST /reorder                     → apiLimiter (100/15min)
```

### Section Routes (`/api/sections`)
```typescript
GET /course/:courseId             → readLimiter (200/15min)
GET /:id                          → readLimiter (200/15min)
POST /                            → createLimiter (20/15min)
PATCH /:id                        → apiLimiter (100/15min)
DELETE /:id                       → apiLimiter (100/15min)
POST /reorder                     → apiLimiter (100/15min)
```

### Quiz Routes (`/api/quiz`)
```typescript
GET /:lessonId                    → readLimiter (200/15min)
GET /:lessonId/attempts           → readLimiter (200/15min)
POST /:lessonId                   → createLimiter (20/15min)
POST /:lessonId/submit            → apiLimiter (100/15min)
```

### Review Routes (`/api/reviews`)
```typescript
GET /course/:courseId             → readLimiter (200/15min)
GET /user/:userId/course/:courseId → readLimiter (200/15min)
POST /                            → createLimiter (20/15min)
DELETE /:id                       → apiLimiter (100/15min)
```

### Notification Routes (`/api/notifications`)
```typescript
GET /                             → readLimiter (200/15min)
PATCH /:id/read                   → apiLimiter (100/15min)
PATCH /read-all                   → apiLimiter (100/15min)
```

### Lesson Progress Routes (`/api/lesson-progress`)
```typescript
GET /course/:courseId             → readLimiter (200/15min)
POST /toggle                      → apiLimiter (100/15min)
```

### Tag Routes (`/api/tags`)
```typescript
GET /                             → readLimiter (200/15min)
GET /:id                          → readLimiter (200/15min)
POST /                            → createLimiter (20/15min)
PATCH /:id                        → apiLimiter (100/15min)
DELETE /:id                       → apiLimiter (100/15min)
```

### User Routes (`/api/users`)
```typescript
GET /                             → readLimiter (200/15min)
DELETE /:id                       → apiLimiter (100/15min)
```

## Response Format
When rate limit is exceeded, the API returns:
```json
{
  "success": false,
  "error": "Too many requests from this IP, please try again later."
}
```

HTTP Status: `429 Too Many Requests`

## Rate Limit Headers
The middleware adds standard rate limit headers to responses:
- `RateLimit-Limit`: Maximum requests allowed
- `RateLimit-Remaining`: Requests remaining in current window
- `RateLimit-Reset`: Time when the rate limit resets (Unix timestamp)

## Configuration
Rate limiters are configured in `/backend/src/middlewares/rateLimiter.ts`. To modify limits:
1. Edit the `windowMs` (time window in milliseconds)
2. Edit the `max` (maximum requests per window)
3. Restart the server

## Best Practices
1. **Read operations**: Use `readLimiter` (most permissive)
2. **Write operations**: Use `createLimiter` for creates, `apiLimiter` for updates/deletes
3. **Auth operations**: Always use `authLimiter` (strictest)
4. **Expensive operations**: Use `aiLimiter` or create custom limiters with lower limits
5. **Public endpoints**: Apply rate limiting to prevent abuse even for unauthenticated routes

## Testing Rate Limits
To test rate limits in development:
```bash
# Test auth limiter (should fail after 5 attempts in 15 minutes)
for i in {1..10}; do curl -X POST http://localhost:5001/api/auth/login; done

# Test AI limiter (should fail after 10 attempts in 1 hour)
for i in {1..15}; do curl -X POST http://localhost:5001/api/ai-course/preview; done
```

## Security Benefits
1. **DoS Protection**: Prevents overwhelming the server with requests
2. **Brute Force Prevention**: Limits authentication attempts
3. **Resource Protection**: Limits expensive operations (AI calls, bulk operations)
4. **Fair Usage**: Ensures resources are shared fairly among users
5. **Cost Control**: Limits expensive third-party API calls (e.g., Google Gemini AI)

## Monitoring
Monitor rate limit violations in:
- Server logs (morgan middleware logs all requests)
- Application Performance Monitoring (APM) tools
- Backend metrics dashboard

## Future Enhancements
Consider implementing:
1. **User-based rate limiting**: Different limits for authenticated vs anonymous users
2. **Premium tier limits**: Higher limits for paid users
3. **Dynamic rate limiting**: Adjust limits based on server load
4. **IP whitelist**: Exempt trusted IPs from rate limiting
5. **Distributed rate limiting**: Use Redis for multi-server deployments
