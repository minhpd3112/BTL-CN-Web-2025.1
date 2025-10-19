# EduLearn Platform - Tổng Quan Hệ Thống

## 📋 Mô tả

Nền tảng học tập trực tuyến với mô hình ownership giống Google Drive/Sheets. Mọi user đều có thể tạo khóa học và trở thành owner với toàn quyền quản lý.

## 🏗️ Kiến Trúc Hệ Thống

### Frontend (✅ Hoàn Thành)
- React 18 + TypeScript
- Tailwind CSS v4 + Shadcn/UI
- 19 pages, 3 shared components
- Mock data layer (to be replaced with API)
- **Chi tiết**: Xem `TECHNICAL_DOCUMENTATION.md`

### Backend (⏳ Cần Xây Dựng)
- Supabase (PostgreSQL + Auth + Storage)
- Google OAuth authentication
- Row Level Security (RLS)
- RESTful API endpoints

## 📊 Database Schema (Cần Xây Dựng)

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar VARCHAR(10), -- Initials for fallback
  google_id VARCHAR(255) UNIQUE, -- Google OAuth ID
  google_picture TEXT, -- Google profile picture URL
  role VARCHAR(10) DEFAULT 'user', -- 'user' | 'admin'
  status VARCHAR(20) DEFAULT 'active', -- 'active' | 'suspended'
  bio TEXT,
  phone VARCHAR(20),
  location VARCHAR(255),
  joined_date TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  courses_created INTEGER DEFAULT 0,
  courses_enrolled INTEGER DEFAULT 0,
  total_students INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Courses Table
```sql
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  image TEXT, -- Course thumbnail URL
  visibility VARCHAR(10) DEFAULT 'private', -- 'private' | 'public'
  status VARCHAR(20) DEFAULT 'draft', -- 'draft' | 'pending' | 'approved' | 'rejected'
  rejection_reason TEXT,
  rating DECIMAL(2,1) DEFAULT 0,
  students INTEGER DEFAULT 0,
  duration VARCHAR(50),
  lessons INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Course_Tags Table (Many-to-Many)
```sql
CREATE TABLE course_tags (
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (course_id, tag_id)
);
```

### Tags Table
```sql
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  color VARCHAR(7), -- Hex color code
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Sections Table
```sql
CREATE TABLE sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Lessons Table
```sql
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(10) NOT NULL, -- 'video' | 'pdf' | 'text' | 'quiz'
  duration VARCHAR(50),
  order_index INTEGER NOT NULL,
  
  -- Video lesson
  youtube_url TEXT,
  
  -- PDF lesson
  pdf_url TEXT,
  
  -- Text lesson
  content TEXT,
  
  -- Quiz lesson (separate quiz_questions table)
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Quiz_Questions Table
```sql
CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- Array of options
  correct_answer INTEGER NOT NULL, -- Index of correct option
  explanation TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Enrollments Table
```sql
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected'
  message TEXT, -- User's enrollment request message
  rejection_reason TEXT,
  progress INTEGER DEFAULT 0, -- 0-100
  requested_at TIMESTAMP DEFAULT NOW(),
  responded_at TIMESTAMP,
  UNIQUE(user_id, course_id)
);
```

### Lesson_Progress Table
```sql
CREATE TABLE lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  UNIQUE(user_id, lesson_id)
);
```

### Notifications Table
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'course_approved' | 'enrollment_request' | etc.
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  related_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔐 Authentication Flow

### 1. Google OAuth (Primary Method)
```
User clicks "Sign in with Google"
  ↓
Redirect to Google OAuth
  ↓
Google returns user info (email, name, picture, google_id)
  ↓
Backend checks if user exists by google_id or email
  ↓
If NOT exists → Create new user
If exists → Update last_login
  ↓
Return JWT token
  ↓
Frontend stores token + user info
```

### 2. Demo Accounts (Development Only)
- 4 predefined accounts for testing
- Should be disabled in production

### JWT Token Structure
```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "role": "user|admin",
  "exp": 1234567890
}
```

## 🌐 API Endpoints (Cần Xây Dựng)

### Authentication
```
POST   /api/auth/google           # Google OAuth callback
POST   /api/auth/logout           # Logout
GET    /api/auth/me               # Get current user
```

### Users
```
GET    /api/users                 # List users (admin only)
GET    /api/users/:id             # Get user details
PATCH  /api/users/:id             # Update user profile
DELETE /api/users/:id             # Delete user (admin only)
```

### Courses
```
GET    /api/courses               # List courses (filter by visibility/status)
GET    /api/courses/:id           # Get course details
POST   /api/courses               # Create course
PATCH  /api/courses/:id           # Update course (owner/admin only)
DELETE /api/courses/:id           # Delete course (owner/admin only)
GET    /api/courses/:id/students  # Get enrolled students (owner/admin)
```

### Course Approval (Admin)
```
GET    /api/admin/courses/pending # Get pending courses
PATCH  /api/admin/courses/:id/approve  # Approve course
PATCH  /api/admin/courses/:id/reject   # Reject course
```

### Enrollments
```
POST   /api/enrollments           # Request enrollment
GET    /api/enrollments/course/:id # Get enrollment requests (owner)
PATCH  /api/enrollments/:id/approve # Approve enrollment (owner)
PATCH  /api/enrollments/:id/reject  # Reject enrollment (owner)
GET    /api/enrollments/my        # Get user's enrollments
```

### Lessons & Progress
```
GET    /api/courses/:id/lessons   # Get course lessons
PATCH  /api/lessons/:id/progress  # Mark lesson as completed
GET    /api/courses/:id/progress  # Get user's progress
```

### Tags
```
GET    /api/tags                  # List all tags
POST   /api/tags                  # Create tag (admin only)
PATCH  /api/tags/:id              # Update tag (admin only)
DELETE /api/tags/:id              # Delete tag (admin only)
```

### Notifications
```
GET    /api/notifications         # Get user's notifications
PATCH  /api/notifications/:id/read # Mark as read
PATCH  /api/notifications/read-all # Mark all as read
```

## 🔄 Key User Flows

### 1. Tạo Khóa Học
```
User → Create Course Page
  ↓
Fill in: Title, Description, Image, Tags
  ↓
Choose visibility: Private | Public
  ↓
Add Sections
  ↓
Add Lessons to Sections (Video YouTube/PDF/Text/Quiz)
  ↓
Click "Tạo khóa học"
  ↓
If Private → Status = "draft" (ready to use)
If Public → Status = "pending" (wait for admin approval)
```

### 2. Đăng Ký Học Khóa Học
```
User → Course Detail Page
  ↓
Click "Đăng ký học"
  ↓
Write enrollment message
  ↓
Submit request → Status = "pending"
  ↓
Owner receives notification
  ↓
Owner approves/rejects
  ↓
If approved → User can access course
```

### 3. Admin Duyệt Khóa Học Public
```
Owner creates public course → Status = "pending"
  ↓
Admin receives notification
  ↓
Admin → Approve Courses Page
  ↓
View course details (sections, lessons)
  ↓
Approve → Status = "approved" (show on homepage)
  OR
Reject → Status = "rejected" + reason
  ↓
Owner receives notification
```

### 4. Học Khóa Học
```
User → Course Detail (enrolled)
  ↓
Click "Bắt đầu học"
  ↓
Learning Page with lesson list
  ↓
Click lesson → Play video/view PDF/read text/take quiz
  ↓
Complete lesson → Mark as completed
  ↓
Progress bar updates
  ↓
Complete all lessons → Course completed
```

## 📱 Responsive Design

- **Mobile**: < 640px - Hamburger menu, stacked layout
- **Tablet**: 640-1024px - Some sidebar, cards in 2 columns
- **Desktop**: > 1024px - Full header nav, cards in 3 columns

## 🚀 Next Steps - Backend Implementation

### Phase 1: Setup & Authentication
1. Setup Supabase project
2. Create database tables
3. Implement Google OAuth
4. JWT token management
5. Protected API routes

### Phase 2: Core Features
1. User CRUD operations
2. Course CRUD operations
3. Section & Lesson management
4. File upload (images, PDFs)
5. YouTube URL validation

### Phase 3: Enrollment & Progress
1. Enrollment request system
2. Approval/rejection workflow
3. Lesson progress tracking
4. Course completion tracking

### Phase 4: Admin Features
1. Course approval system
2. User management
3. Tag management
4. Analytics dashboard

### Phase 5: Real-time Features
1. Notifications system
2. Real-time updates (enrollment status, etc.)

## 🔧 Environment Variables Needed

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# JWT
JWT_SECRET=your_jwt_secret

# File Upload
VITE_UPLOAD_MAX_SIZE=10485760  # 10MB
VITE_ALLOWED_FILE_TYPES=image/*,application/pdf
```

## 📝 Notes

- **Mock Data**: Hiện tại dùng mock data trong `/src/services/mocks`. Sẽ được thay thế bằng API calls khi backend hoàn thành.
- **Images**: Tạm dùng Unsplash. Production nên upload lên Supabase Storage.
- **YouTube Embed**: Validate URL format và extract video ID.
- **PDF Viewer**: Dùng iframe hoặc library như react-pdf.
- **Quiz Timer**: Implement countdown timer phía client.

## 🎯 Success Criteria

✅ **Frontend hoàn thành:**
- 19 pages hoạt động đầy đủ
- Responsive trên mọi thiết bị
- UI/UX đẹp, nhất quán
- TypeScript type-safe

⏳ **Backend cần xây dựng:**
- Database schema
- Authentication system
- RESTful API endpoints
- File upload handling
- Real-time notifications

---

**Last Updated**: January 2025
**Status**: Frontend Complete (19 Pages, 3 Shared Components), Ready for Backend Integration
