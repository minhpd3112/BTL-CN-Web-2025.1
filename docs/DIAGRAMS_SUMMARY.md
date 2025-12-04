# EduLearn Platform - Tổng Quan Diagrams

## 📋 Tài Liệu Đã Tạo

Dựa trên phân tích toàn bộ documentation của dự án, đã tạo hai diagram quan trọng cho việc triển khai database và backend:

### 1. **ERD_DIAGRAM.md** - Entity Relationship Diagram
📄 **Đường dẫn**: `/home/BTL-CN-Web-2025.1/docs/ERD_DIAGRAM.md`

**Nội dung**:
- Mermaid ERD diagram đầy đủ cho 9 bảng database
- Chi tiết về các mối quan hệ giữa các bảng
- Foreign keys và constraints
- Cascade delete rules
- Indexes được khuyến nghị
- Data integrity rules

**9 Bảng Database**:
1. `users` - Quản lý người dùng (user & admin)
2. `courses` - Quản lý khóa học
3. `tags` - Chủ đề khóa học (12 tags)
4. `course_tags` - Liên kết many-to-many giữa courses và tags
5. `sections` - Mục (chapters) trong khóa học
6. `lessons` - Bài học (video/pdf/text/quiz)
7. `quiz_questions` - Câu hỏi quiz
8. `enrollments` - Đăng ký học với approval workflow
9. `lesson_progress` - Theo dõi tiến độ học
10. `notifications` - Hệ thống thông báo

---

### 2. **USECASE_DIAGRAM.md** - Use Case Diagram
📄 **Đường dẫn**: `/home/BTL-CN-Web-2025.1/docs/USECASE_DIAGRAM.md`

**Nội dung**:
- Mermaid Use Case diagram với 58 use cases
- Chi tiết từng use case với flow và postconditions
- Permission matrix cho 4 loại actors
- Key user flows (tạo khóa học, đăng ký học, admin duyệt)
- System constraints

**3 Actors**:
1. **Registered User** - Người dùng thường (role: user)
2. **Course Owner** - User đã tạo khóa học (owner của course)
3. **Admin** - Quản trị viên (role: admin)

**Lưu ý**: Tất cả features yêu cầu đăng nhập. Không có guest access.

**11 Nhóm Chức Năng**:
1. Authentication & Profile (5 UCs)
2. Course Discovery (6 UCs)
3. Course Management - User (8 UCs)
4. Enrollment - Student (4 UCs)
5. Learning Experience (6 UCs)
6. Course Management - Owner (7 UCs)
7. Admin - Course Approval (6 UCs)
8. Admin - User Management (4 UCs)
9. Admin - Tag Management (4 UCs)
10. Notifications (4 UCs)
11. Admin Dashboard (4 UCs)

---

## 🎯 Mục Đích và Ứng Dụng

### ERD Diagram
**Sử dụng để**:
- ✅ Tạo database schema trên Supabase
- ✅ Hiểu rõ mối quan hệ giữa các entities
- ✅ Thiết lập Foreign Keys và Indexes
- ✅ Cấu hình Row Level Security (RLS) policies
- ✅ Validate data integrity

**SQL Scripts**: ERD cung cấp foundation để viết migration scripts cho Supabase

---

### Use Case Diagram
**Sử dụng để**:
- ✅ Hiểu đầy đủ business requirements
- ✅ Xác định các API endpoints cần thiết
- ✅ Thiết kế authentication & authorization logic
- ✅ Test coverage planning
- ✅ User acceptance testing (UAT)

**API Development**: Mỗi use case tương ứng với 1 hoặc nhiều API endpoints

---

## 🔑 Key Insights từ Analysis

### Database Architecture
1. **UUID Primary Keys**: Tất cả bảng sử dụng UUID để tăng security
2. **Soft Cascade**: Sử dụng ON DELETE CASCADE cho hầu hết relationships
3. **Junction Tables**: `course_tags`, `enrollments`, `lesson_progress`
4. **JSONB for Flexibility**: `quiz_questions.options` lưu dạng JSONB array
5. **Status Workflows**:
   - Courses: draft → pending → approved/rejected
   - Enrollments: pending → approved/rejected

### Access Control Model
1. **Role-Based**: 2 roles (user, admin)
2. **Ownership-Based**: User owns courses they create
3. **Approval-Based**: Enrollment requires owner approval
4. **Visibility-Based**: Private vs Public courses

### Critical Features
1. **Admin Content Preview**: Admin có thể xem FULL nội dung (including quiz answers) để kiểm duyệt
2. **Enrollment Workflow**: Request → Pending → Owner Approval → Access
3. **Progress Tracking**: Lesson-level completion tracking
4. **Real-time Notifications**: 7 types of notifications
5. **Leave Course**: User có thể rời khóa học bất kỳ lúc nào (với warning về mất progress)

---

## 📊 Mapping: Database ↔ Features

### User Management
- **Tables**: `users`
- **Features**: UC-1 to UC-5 (Login, Profile)
- **Admin**: UC-43 to UC-46 (User Management)

### Course Catalog
- **Tables**: `courses`, `tags`, `course_tags`
- **Features**: UC-6 to UC-11 (Discovery, Browse)
- **Admin**: UC-47 to UC-50 (Tag Management)

### Course Content
- **Tables**: `courses`, `sections`, `lessons`, `quiz_questions`
- **Features**: UC-12 to UC-19 (Create, Edit)
- **Owner**: UC-30 (Dashboard)

### Learning
- **Tables**: `enrollments`, `lesson_progress`
- **Features**: UC-20 to UC-29 (Enroll, Learn, Quiz)
- **Owner**: UC-31 to UC-36 (Student Management)

### Admin Approval
- **Tables**: `courses` (status field)
- **Features**: UC-37 to UC-42 (Approve/Reject)
- **Special**: UC-38 (Content Preview with quiz answers)

### Notifications
- **Tables**: `notifications`
- **Features**: UC-51 to UC-54
- **Triggers**: Course approved, enrollment request, etc.

---

## 🚀 Next Steps - Backend Implementation

### Phase 1: Supabase Setup ✅
1. **Tạo Supabase Project**
   ```bash
   # Visit https://supabase.com
   # Create new project
   # Copy project URL and keys
   ```

2. **Create Database Tables**
   - Sử dụng ERD_DIAGRAM.md làm blueprint
   - Run SQL migrations trên Supabase SQL Editor
   - Tạo 9 bảng theo đúng schema

3. **Setup Row Level Security (RLS)**
   ```sql
   -- Example: Users can only read their own data
   CREATE POLICY "Users can view own profile"
   ON users FOR SELECT
   USING (auth.uid() = id);
   
   -- Course owners can edit their courses
   CREATE POLICY "Owners can edit own courses"
   ON courses FOR UPDATE
   USING (auth.uid() = owner_id);
   
   -- Admins can view all courses
   CREATE POLICY "Admins can view all courses"
   ON courses FOR SELECT
   USING (
     EXISTS (
       SELECT 1 FROM users
       WHERE id = auth.uid() AND role = 'admin'
     )
   );
   ```

4. **Setup Storage Buckets**
   - `course-images` - Ảnh bìa khóa học
   - `lesson-pdfs` - File PDF cho lessons
   - Configure public/private access policies

### Phase 2: Authentication 🔐
1. **Enable Google OAuth** trong Supabase Auth settings
2. **JWT Configuration**: Setup JWT secret và expiration
3. **Demo Accounts**: Seed 4 demo users vào database
4. **Implement Login Flow** theo UC-1, UC-2

### Phase 3: API Development 🔧

**Priority 1 - Core Features**:
- `POST /api/auth/google` - Login (UC-1)
- `GET /api/courses` - List courses (UC-6, UC-7)
- `GET /api/courses/:id` - Course detail (UC-10)
- `POST /api/courses` - Create course (UC-12)
- `POST /api/enrollments` - Request enrollment (UC-20)

**Priority 2 - Owner Features**:
- `GET /api/courses/:id/students` - List students (UC-31)
- `PATCH /api/enrollments/:id/approve` - Approve enrollment (UC-32)
- `PATCH /api/enrollments/:id/reject` - Reject enrollment (UC-33)

**Priority 3 - Learning**:
- `GET /api/courses/:id/lessons` - Get lessons (UC-24-27)
- `PATCH /api/lessons/:id/progress` - Mark completed (UC-28)
- `GET /api/courses/:id/progress` - Get user progress (UC-23)

**Priority 4 - Admin**:
- `GET /api/admin/courses/pending` - Pending courses (UC-37)
- `PATCH /api/admin/courses/:id/approve` - Approve course (UC-39)
- `GET /api/admin/courses/:id/content` - **Full content with quiz answers** (UC-38)
- `GET /api/admin/users` - User management (UC-43)
- `GET /api/admin/tags` - Tag management (UC-47)

**Priority 5 - Notifications**:
- `GET /api/notifications` - Get notifications (UC-52)
- `PATCH /api/notifications/:id/read` - Mark read (UC-53)
- Setup Supabase Realtime for real-time updates (UC-51)

### Phase 4: File Upload 📁
```typescript
// Example: Upload course image to Supabase Storage
const { data, error } = await supabase.storage
  .from('course-images')
  .upload(`${courseId}/${filename}`, file);

// Get public URL
const { publicURL } = supabase.storage
  .from('course-images')
  .getPublicUrl(`${courseId}/${filename}`);
```

### Phase 5: Testing ✅
1. **Unit Tests**: Test individual services
2. **Integration Tests**: Test API endpoints
3. **E2E Tests**: Test complete user flows from Use Case diagram
4. **Security Tests**: Test RLS policies và permissions

---

## 📚 Tài Liệu Tham Khảo

### Project Documentation
- `README.md` - Quick start guide
- `SYSTEM_OVERVIEW.md` - Database schema + API list + Backend blueprint
- `TECHNICAL_DOCUMENTATION.md` - Frontend architecture (1066 lines)
- `USER_GUIDE.md` - Complete feature guide (525 lines)
- `AGENTS.md` - Backend implementation guide
- `Guidelines.md` - Development best practices

### Generated Diagrams
- `ERD_DIAGRAM.md` - Database ERD (THIS FILE)
- `USECASE_DIAGRAM.md` - Use Case Diagram (THIS FILE)

### Frontend Types
- `/frontend/src/types/index.ts` - TypeScript interfaces (185 lines)
  - User, Course, Tag, Section, Lesson, QuizQuestion
  - Enrollment, EnrollmentRequest, Notification
  - All types MUST match backend API responses

---

## 🎨 Database Visualization

### Relationships Overview
```
users (1) ──────< (many) courses
users (1) ──────< (many) enrollments
users (1) ──────< (many) lesson_progress
users (1) ──────< (many) notifications

courses (1) ─────< (many) sections
courses (1) ─────< (many) enrollments
courses (many) ──< (many) tags [via course_tags]

sections (1) ────< (many) lessons

lessons (1) ─────< (many) quiz_questions
lessons (1) ─────< (many) lesson_progress
```

### Data Flow Examples

#### 1. Create Course Flow
```
Frontend → POST /api/courses → Backend
  ↓
Insert into courses table (status='draft' or 'pending')
  ↓
If public → Insert notification for admin
  ↓
Return course object to frontend
```

#### 2. Enrollment Flow
```
Student → POST /api/enrollments → Backend
  ↓
Insert into enrollments (status='pending')
  ↓
Insert notification for course owner
  ↓
Owner → PATCH /api/enrollments/:id/approve
  ↓
Update enrollments (status='approved')
  ↓
Insert notification for student
  ↓
Student can access course
```

#### 3. Learning Progress Flow
```
Student views lesson → Frontend tracks time
  ↓
Student clicks "Complete" → PATCH /api/lessons/:id/progress
  ↓
Backend: Upsert lesson_progress (completed=true)
  ↓
Backend: Recalculate enrollment.progress
  ↓
Return updated progress to frontend
```

---

## 🔒 Security Considerations

### 1. Row Level Security (RLS) Policies
- ✅ Users can only view their own profile
- ✅ Users can only edit/delete their own courses
- ✅ Admin can view/edit ALL courses
- ✅ Students can only view courses they're enrolled in
- ✅ Quiz answers hidden from students (visible only to admin for approval)

### 2. API Authorization Middleware
```typescript
// Example middleware
const requireAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  const user = await verifyJWT(token);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  req.user = user;
  next();
};

const requireAdmin = async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

const requireOwnerOrAdmin = async (req, res, next) => {
  const courseId = req.params.id;
  const course = await getCourse(courseId);
  if (course.owner_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};
```

### 3. Input Validation
- Character limits (từ Guidelines.md)
- Email format validation
- YouTube URL validation (extract video ID)
- File type validation (images: jpg/png, documents: pdf)
- File size limits (10MB max)

### 4. SQL Injection Prevention
- Sử dụng Supabase client (parameterized queries)
- NEVER concatenate user input vào SQL strings

---

## 📝 Notes cho Developer

### Quan Trọng ⚠️
1. **Quiz Answers Security**: 
   - Students: API KHÔNG được trả về `correctAnswers` trong `quiz_questions`
   - Admin: API PHẢI trả về `correctAnswers` khi preview course (UC-38)
   - Implement logic check `if (user.role === 'admin') { include correctAnswers }`

2. **PDF Download Prevention**:
   - Frontend dùng iframe với `sandbox` attribute
   - Supabase Storage: Set headers `Content-Disposition: inline`
   - NOT `attachment` (sẽ trigger download)

3. **Leave Course Feature**:
   - DELETE enrollment record
   - DELETE ALL lesson_progress cho user+course
   - Update course.students count
   - KHÔNG send notification (optional)

4. **Enrollment Unique Constraint**:
   - Database: `UNIQUE(user_id, course_id)`
   - Prevent duplicate enrollments
   - Handle error gracefully: "Bạn đã đăng ký khóa học này rồi"

5. **Cascade Deletes**:
   - Xóa user → Xóa courses, enrollments, progress, notifications
   - Xóa course → Xóa sections, lessons, quizzes, enrollments
   - Xóa section → Xóa lessons, quizzes
   - Frontend PHẢI confirm before delete với warning rõ ràng

---

## ✅ Checklist Implementation

### Database Setup
- [ ] Create Supabase project
- [ ] Run SQL migrations (9 tables)
- [ ] Setup RLS policies
- [ ] Create indexes
- [ ] Setup Storage buckets
- [ ] Seed demo data (4 users, 12 tags)

### Authentication
- [ ] Enable Google OAuth
- [ ] JWT configuration
- [ ] Login endpoints
- [ ] Logout endpoint
- [ ] Auth middleware

### API Endpoints
- [ ] Authentication (3 endpoints)
- [ ] Users (4 endpoints)
- [ ] Courses (6 endpoints)
- [ ] Enrollments (5 endpoints)
- [ ] Lessons & Progress (3 endpoints)
- [ ] Admin - Courses (4 endpoints)
- [ ] Admin - Users (3 endpoints)
- [ ] Admin - Tags (4 endpoints)
- [ ] Notifications (3 endpoints)

### File Upload
- [ ] Course images upload
- [ ] PDF upload
- [ ] Get public URLs
- [ ] Access policies

### Testing
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests (using Use Cases)
- [ ] Security tests (RLS)

### Frontend Integration
- [ ] Replace mock data with API calls
- [ ] Update environment variables
- [ ] Test all 19 pages
- [ ] Test all 58 use cases

---

**Created**: 2025-01-15  
**Status**: ✅ Documentation Complete  
**Next**: Begin Supabase Implementation
