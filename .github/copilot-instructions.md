# EduLearn Platform - AI Coding Agent Instructions

## Project Overview
Full-stack learning management system (LMS) with **ownership model** similar to Google Drive. Any user can create courses and become an owner with full management rights. Backend uses **Supabase** (PostgreSQL + Auth + Storage); frontend uses **React 18 + TypeScript + Vite + Tailwind v4 + Shadcn/UI**.

## Architecture & Key Concepts

### Monorepo Structure
- **`/backend`**: Express + TypeScript API server (port 5001)
- **`/frontend`**: Vite + React SPA (port 5173)
- **`/docs`**: Comprehensive documentation (see `SYSTEM_OVERVIEW.md`, `AGENTS.md`)
- Root `package.json` has convenience scripts: `npm run dev:backend`, `npm run dev:frontend`

### Core Business Logic: The Ownership Model
1. **Any user can create courses** → becomes the **owner** with full control (edit, delete, manage enrollments)
2. **Two roles**: `user` (default) and `admin`
3. **Admin powers**: review/approve public courses, view ALL courses (even private), manage all users
4. **Course visibility**: `private` (owner + enrolled only) or `public` (requires admin approval)
5. **Enrollment approval**: owners can approve/reject enrollment requests for their courses

### Database (Supabase PostgreSQL)
- **Schema**: See `backend/database/schema.sql` (9 core tables)
- **RLS Policies**: `backend/database/rls_policies.sql` - critical for security
- **Key tables**: `auth.users` (Supabase managed), `user_profiles`, `courses`, `sections`, `lessons`, `quiz_questions`, `enrollments`, `lesson_progress`, `notifications`
- **Supabase clients**: 
  - `supabase` (anon key, RLS enforced) for user operations
  - `supabaseAdmin` (service role, bypasses RLS) for admin operations
- **Location**: `backend/src/config/supabase.ts`

### Authentication Flow
1. **Supabase Auth** with Google OAuth (see `backend/src/routes/auth.routes.ts`)
2. JWT tokens stored in `localStorage` (frontend: `auth_token`)
3. Backend middleware: `authenticate` → checks token, sets `req.user` with `{id, email, role}`
4. **Admin tokens**: Custom JWT generated for testing (`backend/src/utils/jwt.ts`)
5. Frontend: `frontend/src/services/api.ts` - axios interceptor adds `Authorization: Bearer <token>`

## Development Workflows

### Running the Project
```bash
# Backend (from /backend or root)
npm run dev:backend  # Runs tsx watch on src/server.ts

# Frontend (from /frontend or root)
npm run dev:frontend  # Vite dev server

# Database setup
# 1. Create Supabase project at https://supabase.com
# 2. Run backend/database/schema.sql
# 3. Run backend/database/rls_policies.sql
# 4. (Optional) Run backend/database/seed.sql for test data
# 5. Create backend/.env with SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
```

### Testing Backend APIs
- Use `backend/tests/api.http` (REST Client extension) for manual API testing
- Jest tests: `npm run test:backend` (from backend/)
- Common test pattern: authenticate → make request → verify response + DB state

### Environment Variables
**Backend** (`backend/.env`):
```
PORT=5001
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

**Frontend** (`frontend/.env`):
```
VITE_API_URL=http://localhost:5001/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Code Patterns & Conventions

### Backend Architecture (MVC-ish)
```
routes/ → controllers/ → models/ → Supabase
         ↓
    middlewares/ (auth, validation, error handling)
```

**Example flow** (creating a course):
1. `POST /api/courses` → `course.routes.ts`
2. → `authenticate` middleware (verifies token, sets `req.user`)
3. → `courseController.createCourse` 
4. → `CourseModel.create(data)` → Supabase insert
5. → Returns JSON: `{success: true, data: {...}}`

**Key patterns**:
- **Path aliases**: `@config`, `@models`, `@utils` (see `backend/tsconfig.json`)
- **Error handling**: Controllers use try/catch → pass to `errorHandler` middleware
- **Response format**: Always `{success: boolean, data?: any, message?: string, error?: string}`
- **Authorization checks**: In controllers, check `req.user?.role === 'admin'` or `req.user?.id === course.owner_id`

### Frontend Architecture
```
pages/ → services/api.ts → Backend API
  ↓
components/ (Shadcn UI + custom)
  ↓
types/ (TypeScript contracts matching backend schemas)
```

**Example flow** (course creation):
1. User fills form in `pages/CreateCoursePage/`
2. Calls `coursesAPI.createCourse(data)` from `services/api.ts`
3. Axios sends `POST /api/courses` with auth token
4. Updates local state, shows toast notification (Sonner)

**Key patterns**:
- **API client**: Centralized in `frontend/src/services/api.ts` (axios instance with auth interceptor)
- **Component structure**: `pages/*/index.tsx` + `pages/*/components/` (page-specific components)
- **Styling**: Tailwind utility classes + per-page `styles.css` for complex animations
- **Shadcn components**: Import from `@/components/ui/` (47 pre-configured components)
- **Type safety**: Types in `frontend/src/types/` mirror backend schemas

### Critical Files to Understand
- **`docs/SYSTEM_OVERVIEW.md`**: Complete feature list, API endpoints, business rules
- **`docs/AGENTS.md`**: Existing AI agent guidance (backend-focused)
- **`backend/src/middlewares/auth.middleware.ts`**: Auth logic (Supabase + admin JWT)
- **`backend/src/models/course.model.ts`**: Example of Model pattern (CRUD operations)
- **`backend/database/rls_policies.sql`**: Security rules - understand before modifying DB access
- **`frontend/src/services/api.ts`**: All API endpoints defined here

## Common Tasks & Gotchas

### Adding a New API Endpoint
1. Define route in `backend/src/routes/*.routes.ts`
2. Create controller function in `backend/src/controllers/*.controller.ts`
3. Add model method in `backend/src/models/*.model.ts` if needed
4. Add middleware (e.g., `authenticate`, `requireAdmin`) to route
5. Update frontend: add API call to `frontend/src/services/api.ts`
6. Update TypeScript types in `frontend/src/types/` if schema changes

### Working with RLS (Row Level Security)
- **RLS is enabled** on all tables - queries fail if policies don't match
- Use `supabaseAdmin` (service role) to bypass RLS for admin operations
- Common policy pattern: `auth.uid() = owner_id` (users can only access their own data)
- When debugging access issues, check `backend/database/rls_policies.sql` first

### File Uploads (Supabase Storage)
- Buckets: `course-images`, `lesson-files` (see `backend/database/storage_setup.sql`)
- Backend handles upload → returns public URL
- Frontend sends file via multipart/form-data
- Storage configured for auto-delete on course/lesson deletion

### Quiz Answer Security
- **Critical**: `correctAnswers` field in `quiz_questions` table
- **Admin view**: Returns `correctAnswers` (for course review)
- **User view**: NEVER return `correctAnswers` in GET responses
- Check role in controller before including sensitive fields

### Frontend Mock Data Replacement
- Mock data exists in `frontend/src/services/mocks/` (legacy)
- **Do not modify mocks** - integrate with real API via `api.ts`
- Pattern: Replace mock functions with actual axios calls

## Language & Documentation Notes
- **Vietnamese documentation**: Most docs (HUONG_DAN_CHAY_DU_AN.md, SYSTEM_OVERVIEW.md) are in Vietnamese
- **Code**: English (variables, functions, comments)
- **Database**: English column names, snake_case convention
- **API**: English endpoints, JSON responses

## Debugging Tips
- Backend logs: Check terminal running `npm run dev:backend` (uses `morgan` middleware)
- Frontend logs: Browser DevTools console + Network tab
- Database queries: Use Supabase Dashboard → SQL Editor to run queries manually
- Auth issues: Verify token in `localStorage`, check `req.user` in backend logs
- CORS errors: Ensure `CORS_ORIGIN` in backend `.env` matches frontend URL

## References for Complex Features
- **Course approval workflow**: See `docs/SYSTEM_OVERVIEW.md` → "Admin Dashboard" section
- **Enrollment process**: `backend/src/controllers/enrollment.controller.ts` + RLS policies
- **Lesson progress tracking**: `lesson_progress` table tracks completed lessons per user
- **Notifications**: Created via `NotificationModel.create()` after key actions (course approved, enrollment accepted)
- **AI course generation**: `backend/src/controllers/ai-course.controller.ts` uses Google Gemini API

---

**When in doubt**: Read `docs/SYSTEM_OVERVIEW.md` (most comprehensive) and check existing controller/model implementations for similar features.
