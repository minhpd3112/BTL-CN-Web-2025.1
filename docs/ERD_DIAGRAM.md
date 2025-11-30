# EduLearn Platform - Entity Relationship Diagram (ERD)

## Database Schema Overview

Hệ thống sử dụng **PostgreSQL** thông qua **Supabase** với 9 bảng chính để quản lý người dùng, khóa học, nội dung, đăng ký học và thông báo.

---

## ERD Diagram

```mermaid
erDiagram
    users ||--o{ courses : "owns (owner_id)"
    users ||--o{ enrollments : "enrolls in"
    users ||--o{ lesson_progress : "tracks progress"
    users ||--o{ notifications : "receives"
    
    courses ||--o{ course_tags : "has tags"
    courses ||--o{ sections : "contains"
    courses ||--o{ enrollments : "has students"
    courses ||--o{ notifications : "triggers"
    
    tags ||--o{ course_tags : "categorizes"
    
    sections ||--o{ lessons : "contains"
    
    lessons ||--o{ quiz_questions : "has questions"
    lessons ||--o{ lesson_progress : "tracked by"
    
    users {
        uuid id PK
        varchar email UK "UNIQUE, NOT NULL"
        varchar name "NOT NULL"
        varchar avatar "Initials for fallback"
        varchar google_id UK "Google OAuth ID"
        text google_picture "Google profile picture URL"
        varchar role "DEFAULT 'user' (user | admin)"
        varchar status "DEFAULT 'active' (active | suspended)"
        text bio
        varchar phone
        varchar location
        timestamp joined_date "DEFAULT NOW()"
        timestamp last_login
        integer courses_created "DEFAULT 0"
        integer courses_enrolled "DEFAULT 0"
        integer total_students "DEFAULT 0"
        timestamp created_at "DEFAULT NOW()"
        timestamp updated_at "DEFAULT NOW()"
    }
    
    courses {
        uuid id PK
        uuid owner_id FK "REFERENCES users(id) ON DELETE CASCADE"
        varchar title "NOT NULL, max 255"
        text description "NOT NULL"
        text image "Course thumbnail URL"
        varchar visibility "DEFAULT 'private' (private | public)"
        varchar status "DEFAULT 'draft' (draft | pending | approved | rejected)"
        text rejection_reason
        decimal rating "DEFAULT 0 (scale 2,1)"
        integer students "DEFAULT 0"
        varchar duration
        integer lessons "DEFAULT 0"
        timestamp created_at "DEFAULT NOW()"
        timestamp updated_at "DEFAULT NOW()"
    }
    
    tags {
        uuid id PK
        varchar name UK "UNIQUE, NOT NULL, max 100"
        text description
        varchar color "Hex color code"
        timestamp created_at "DEFAULT NOW()"
    }
    
    course_tags {
        uuid course_id FK "REFERENCES courses(id) ON DELETE CASCADE"
        uuid tag_id FK "REFERENCES tags(id) ON DELETE CASCADE"
        composite_pk course_id_tag_id "PRIMARY KEY (course_id, tag_id)"
    }
    
    sections {
        uuid id PK
        uuid course_id FK "REFERENCES courses(id) ON DELETE CASCADE"
        varchar title "NOT NULL, max 255"
        text description
        integer order_index "NOT NULL"
        timestamp created_at "DEFAULT NOW()"
    }
    
    lessons {
        uuid id PK
        uuid section_id FK "REFERENCES sections(id) ON DELETE CASCADE"
        varchar title "NOT NULL, max 255"
        text description
        varchar type "NOT NULL (video | pdf | text | quiz)"
        varchar duration
        integer order_index "NOT NULL"
        text youtube_url "For video lessons"
        text pdf_url "For PDF lessons"
        text content "For text lessons"
        timestamp created_at "DEFAULT NOW()"
    }
    
    quiz_questions {
        uuid id PK
        uuid lesson_id FK "REFERENCES lessons(id) ON DELETE CASCADE"
        text question "NOT NULL"
        jsonb options "Array of options, NOT NULL"
        integer correct_answer "Index of correct option, NOT NULL"
        text explanation
        integer order_index "NOT NULL"
        timestamp created_at "DEFAULT NOW()"
    }
    
    enrollments {
        uuid id PK
        uuid user_id FK "REFERENCES users(id) ON DELETE CASCADE"
        uuid course_id FK "REFERENCES courses(id) ON DELETE CASCADE"
        varchar status "DEFAULT 'pending' (pending | approved | rejected)"
        text message "User's enrollment request message"
        text rejection_reason
        integer progress "DEFAULT 0 (0-100)"
        timestamp requested_at "DEFAULT NOW()"
        timestamp responded_at
        composite_uk user_course "UNIQUE(user_id, course_id)"
    }
    
    lesson_progress {
        uuid id PK
        uuid user_id FK "REFERENCES users(id) ON DELETE CASCADE"
        uuid lesson_id FK "REFERENCES lessons(id) ON DELETE CASCADE"
        boolean completed "DEFAULT FALSE"
        timestamp completed_at
        composite_uk user_lesson "UNIQUE(user_id, lesson_id)"
    }
    
    notifications {
        uuid id PK
        uuid user_id FK "REFERENCES users(id) ON DELETE CASCADE"
        varchar type "NOT NULL (course_approved | enrollment_request | etc.)"
        varchar title "NOT NULL, max 255"
        text message "NOT NULL"
        uuid course_id FK "REFERENCES courses(id) ON DELETE CASCADE (nullable)"
        uuid related_user_id FK "REFERENCES users(id) ON DELETE SET NULL (nullable)"
        boolean read "DEFAULT FALSE"
        timestamp created_at "DEFAULT NOW()"
    }
```

---

## Relationships Explained

### 1. Users ↔ Courses (One-to-Many)
- **Quan hệ**: Một user có thể tạo nhiều khóa học
- **Foreign Key**: `courses.owner_id` → `users.id`
- **Cascade**: `ON DELETE CASCADE` - Xóa user sẽ xóa tất cả khóa học của họ

### 2. Courses ↔ Tags (Many-to-Many)
- **Quan hệ**: Một khóa học có nhiều tags, một tag thuộc nhiều khóa học
- **Junction Table**: `course_tags` với composite primary key `(course_id, tag_id)`
- **Cascade**: Xóa course hoặc tag sẽ xóa liên kết trong `course_tags`

### 3. Courses ↔ Sections (One-to-Many)
- **Quan hệ**: Một khóa học có nhiều sections (mục)
- **Foreign Key**: `sections.course_id` → `courses.id`
- **Ordering**: Sử dụng `order_index` để sắp xếp

### 4. Sections ↔ Lessons (One-to-Many)
- **Quan hệ**: Một section có nhiều lessons (bài học)
- **Foreign Key**: `lessons.section_id` → `sections.id`
- **Ordering**: Sử dụng `order_index` để sắp xếp

### 5. Lessons ↔ Quiz Questions (One-to-Many)
- **Quan hệ**: Một lesson kiểu quiz có nhiều câu hỏi
- **Foreign Key**: `quiz_questions.lesson_id` → `lessons.id`
- **Conditional**: Chỉ áp dụng khi `lessons.type = 'quiz'`

### 6. Users ↔ Courses via Enrollments (Many-to-Many)
- **Quan hệ**: Một user đăng ký nhiều courses, một course có nhiều students
- **Junction Table**: `enrollments` với status tracking
- **Unique Constraint**: `UNIQUE(user_id, course_id)` - Không cho phép đăng ký trùng

### 7. Users ↔ Lessons via Lesson Progress (Many-to-Many)
- **Quan hệ**: Track progress của từng user trên từng lesson
- **Junction Table**: `lesson_progress`
- **Unique Constraint**: `UNIQUE(user_id, lesson_id)` - Mỗi user chỉ có 1 progress record per lesson

### 8. Notifications
- **user_id**: Người nhận notification
- **course_id**: Khóa học liên quan (nullable)
- **related_user_id**: User liên quan (ví dụ: student yêu cầu đăng ký) (nullable)

---

## Key Database Features

### 1. **UUID Primary Keys**
- Tất cả bảng sử dụng `UUID` thay vì integer để tránh collision và tăng bảo mật

### 2. **Timestamps**
- Mọi bảng có `created_at` (DEFAULT NOW())
- Một số bảng có `updated_at` để track changes

### 3. **Cascading Deletes**
- **ON DELETE CASCADE**: Xóa parent sẽ xóa children
  - users → courses
  - courses → sections, enrollments, course_tags
  - sections → lessons
  - lessons → quiz_questions, lesson_progress
  
- **ON DELETE SET NULL**: Xóa parent sẽ set NULL
  - notifications.related_user_id

### 4. **Unique Constraints**
- `users.email` - UNIQUE
- `users.google_id` - UNIQUE
- `tags.name` - UNIQUE
- `(user_id, course_id)` trong `enrollments` - UNIQUE
- `(user_id, lesson_id)` trong `lesson_progress` - UNIQUE

### 5. **Default Values**
- Role: 'user'
- Status: 'active' (users), 'draft' (courses), 'pending' (enrollments)
- Visibility: 'private'
- Rating: 0
- Counters: 0
- Booleans: FALSE

---

## Data Integrity Rules

### 1. **Course Status Workflow**
```
draft → (if public) → pending → approved/rejected
      → (if private) → stays draft (ready to use)
```

### 2. **Enrollment Workflow**
```
pending → approved/rejected (by course owner)
```

### 3. **Lesson Types**
- `video`: Requires `youtube_url`
- `pdf`: Requires `pdf_url`
- `text`: Requires `content`
- `quiz`: Links to `quiz_questions` table

---

## Indexes (Recommended)

```sql
-- User lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);

-- Course queries
CREATE INDEX idx_courses_owner_id ON courses(owner_id);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_visibility ON courses(visibility);

-- Enrollment lookups
CREATE INDEX idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX idx_enrollments_status ON enrollments(status);

-- Lesson progress
CREATE INDEX idx_lesson_progress_user_id ON lesson_progress(user_id);
CREATE INDEX idx_lesson_progress_lesson_id ON lesson_progress(lesson_id);

-- Notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
```

---

**Created**: 2025-01-15  
**Database**: PostgreSQL via Supabase  
**Total Tables**: 9  
**Total Relationships**: 11
