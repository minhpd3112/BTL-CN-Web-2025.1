# 🛠️ EduLearn Platform - Tài Liệu Kỹ Thuật Frontend

## 📋 Mục Lục
1. [Kiến Trúc Tổng Quan](#-kiến-trúc-tổng-quan)
2. [Cấu Trúc Thư Mục](#-cấu-trúc-thư-mục)
3. [State Management](#-state-management)
4. [Routing System](#-routing-system)
5. [Component Architecture](#-component-architecture)
6. [Shared Components](#-shared-components)
7. [Data Layer](#-data-layer)
8. [Type Definitions](#-type-definitions)
9. [Styling Guide](#-styling-guide)
10. [Best Practices](#-best-practices)

---

## 🏗️ Kiến Trúc Tổng Quan

### Tech Stack
```
Frontend:
├── React 18.2+ (TypeScript)
├── Vite (Build tool)
└── TypeScript 5.0+

Styling:
├── Tailwind CSS v4.0
└── Shadcn/UI components

State:
└── Custom hooks (useDemoAppState)

Icons:
└── Lucide React

Notifications:
└── Sonner (toast library)
```

### Architecture Pattern
```
┌─────────────────────────────────────┐
│         App.tsx (Entry Point)       │
│  ┌───────────────────────────────┐  │
│  │      Authentication Check     │  │
│  └───────────────────────────────┘  │
│              ↓                      │
│  ┌───────────────────────────────┐  │
│  │  LoginPage  │   AppShell      │  │
│  └───────────────────────────────┘  │
│              ↓                      │
│  ┌───────────────────────────────┐  │
│  │        useDemoAppState        │  │
│  │  (Centralized State & Logic)  │  │
│  └───────────────────────────────┘  │
│              ↓                      │
│  ┌───────────────────────────────┐  │
│  │     Header + Sidebar          │  │
│  │     Notifications             │  │
│  └───────────────────────────────┘  │
│              ↓                      │
│  ┌───────────────────────────────┐  │
│  │      Page Components          │  │
│  │   (18 pages conditional)      │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

---

## 📁 Cấu Trúc Thư Mục

```
/
├── App.tsx                      # Entry point
├── /src
│   ├── /app
│   │   ├── AppShell.tsx         # Main shell (header, sidebar, routing)
│   │   └── useDemoAppState.tsx  # State management hook
│   │
│   ├── /pages                   # 18 page components
│   │   ├── LoginPage/
│   │   ├── HomePage/
│   │   ├── MyCoursesPage/
│   │   ├── ExplorePage/
│   │   ├── CourseDetailPage/
│   │   ├── CreateCoursePage/
│   │   ├── EditCoursePage/
│   │   ├── LearningPage/
│   │   ├── QuizPage/
│   │   ├── CourseDashboardPage/
│   │   ├── CourseStudentsPage/
│   │   ├── AdminDashboardPage/
│   │   ├── ApproveCoursesPage/
│   │   ├── ManageCoursesPage/
│   │   ├── ManageUsersPage/
│   │   ├── UserDetailPage/
│   │   ├── ManageTagsPage/
│   │   └── AccountSettingsPage/
│   │
│   ├── /components
│   │   └── /shared
│   │       ├── CourseCard.tsx   # Reusable course card
│   │       └── QuizEditor.tsx   # Quiz creation editor
│   │
│   ├── /data                    # Mock data (to be replaced with API)
│   │   ├── index.ts
│   │   ├── mockUsers.ts
│   │   ├── mockCourses.ts
│   │   ├── mockEnrollments.ts
│   │   └── mockTags.ts
│   │
│   └── /types
│       └── index.ts             # TypeScript definitions
│
├── /components
│   ├── /figma
│   │   └── ImageWithFallback.tsx
│   └── /ui                      # 47 Shadcn/UI components
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       └── ... (all shadcn components)
│
└── /styles
    └── globals.css              # Tailwind v4 + custom styles
```

### File Naming Conventions
- **Pages**: `PascalCase` folder với `index.tsx`
- **Components**: `PascalCase.tsx`
- **Hooks**: `useCamelCase.tsx`
- **Types**: `camelCase` hoặc `PascalCase`
- **Data**: `camelCase.ts`

---

## 🎛️ State Management

### useDemoAppState Hook

**Location**: `/src/app/useDemoAppState.tsx`

#### State Structure
```typescript
interface AppState {
  // Navigation
  currentPage: Page;
  selectedCourse: Course | null;
  selectedUser: User | null;
  
  // Authentication
  currentUser: User | null;
  currentRole: 'admin' | 'user' | null;
  userGooglePicture: string | null;
  
  // Notifications
  notifications: Notification[];
  unreadCount: number;
  
  // Enrollment requests (for course owners)
  enrollmentRequests: EnrollmentRequest[];
}
```

#### Actions
```typescript
interface AppActions {
  // Navigation
  navigateTo: (page: Page) => void;
  setSelectedCourse: (course: Course | null) => void;
  setSelectedUser: (user: User | null) => void;
  
  // Authentication
  handleLogin: (user: User) => void;
  handleLogout: () => void;
  
  // Notifications
  addNotification: (notification: Notification) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  
  // Enrollments
  handleEnrollmentRequest: (request: EnrollmentRequest) => void;
  approveEnrollment: (requestId: string) => void;
  rejectEnrollment: (requestId: string, reason: string) => void;
}
```

#### Usage Example
```typescript
// In any page component
export function MyPage() {
  const { state, actions } = useDemoAppState();
  
  // Access state
  const currentUser = state.currentUser;
  const notifications = state.notifications;
  
  // Call actions
  const handleClick = () => {
    actions.navigateTo('home');
  };
  
  return (
    <div>
      <h1>Welcome {currentUser?.name}</h1>
      <button onClick={handleClick}>Go Home</button>
    </div>
  );
}
```

#### Notification System
```typescript
// Add notification
actions.addNotification({
  id: crypto.randomUUID(),
  type: 'course_approved',
  title: 'Khóa học được duyệt!',
  message: 'Khóa học React Advanced đã được admin duyệt',
  courseId: course.id,
  read: false,
  createdAt: new Date(),
  navigateTo: 'course-detail' // Auto-navigation page
});

// Mark as read (also navigates)
actions.markAsRead(notificationId);
```

---

## 🧭 Routing System

### Page Type Definition
```typescript
type Page = 
  | 'login'
  | 'home'
  | 'my-courses'
  | 'explore'
  | 'course-detail'
  | 'learning'
  | 'quiz'
  | 'create-course'
  | 'edit-course'
  | 'course-dashboard'
  | 'course-students'
  | 'admin-dashboard'
  | 'approve-courses'
  | 'manage-courses'
  | 'manage-users'
  | 'user-detail'
  | 'manage-tags'
  | 'account-settings';
```

### Navigation Flow
```typescript
// AppShell.tsx - Routing logic
<main>
  {currentPage === 'home' && <HomePage {...props} />}
  {currentPage === 'my-courses' && <MyCoursesPage {...props} />}
  {currentPage === 'explore' && <ExplorePage {...props} />}
  {/* ... all 18 pages */}
</main>
```

### Protected Routes
```typescript
// In useDemoAppState.tsx
const navigateTo = (page: Page) => {
  // Check authentication
  if (!currentUser && page !== 'login') {
    setCurrentPage('login');
    return;
  }
  
  // Check admin-only pages
  const adminPages: Page[] = [
    'admin-dashboard',
    'approve-courses',
    'manage-courses',
    'manage-users',
    'manage-tags',
    'user-detail'
  ];
  
  if (adminPages.includes(page) && currentRole !== 'admin') {
    toast.error('Bạn không có quyền truy cập trang này');
    return;
  }
  
  setCurrentPage(page);
};
```

### Navigation Methods

#### 1. Direct Navigation
```typescript
navigateTo('home');
navigateTo('create-course');
```

#### 2. With Course Context
```typescript
setSelectedCourse(course);
navigateTo('course-detail');
```

#### 3. From Notification
```typescript
const handleNotificationClick = (notification: Notification) => {
  actions.markAsRead(notification.id);
  // Auto-navigates to notification.navigateTo
};
```

---

## 🧩 Component Architecture

### Page Component Pattern

All pages follow this structure:

```typescript
// /src/pages/ExamplePage/index.tsx

import { useState } from 'react';
import { /* icons */ } from 'lucide-react';
import { /* ui components */ } from '../../../components/ui/*';
import { /* types */ } from '../../types';

interface ExamplePageProps {
  navigateTo: (page: Page) => void;
  setSelectedCourse?: (course: Course) => void;
  currentUser: User;
  // ... other props
}

export function ExamplePage({ 
  navigateTo, 
  setSelectedCourse,
  currentUser 
}: ExamplePageProps) {
  // Local state
  const [localState, setLocalState] = useState<Type>(initialValue);
  
  // Handlers
  const handleAction = () => {
    // Logic here
  };
  
  // Render
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page content */}
    </div>
  );
}
```

### Props Pattern

#### Common Props (Most Pages)
```typescript
{
  navigateTo: (page: Page) => void;
  currentUser: User;
}
```

#### Course-Related Props
```typescript
{
  navigateTo: (page: Page) => void;
  setSelectedCourse: (course: Course | null) => void;
  course?: Course; // For detail/edit pages
  currentUser: User;
}
```

#### Admin-Only Props
```typescript
{
  navigateTo: (page: Page) => void;
  currentUser: User; // Must be role: 'admin'
}
```

### Admin Content Preview Feature

**Purpose**: Cho phép Admin kiểm duyệt chất lượng nội dung khóa học trước khi approve.

**Implementation** trong CourseDetailPage:

#### 1. Tab Visibility Logic
```typescript
{currentUser?.role === 'admin' && (
  <TabsTrigger value="content-preview">
    <Eye className="w-4 h-4 mr-2" />
    Xem nội dung chi tiết
  </TabsTrigger>
)}
```

#### 2. State Management
```typescript
const [expandedSections, setExpandedSections] = useState<number[]>([1]);
const [selectedLesson, setSelectedLesson] = useState<any>(null);

const toggleSection = (sectionId: number) => {
  setExpandedSections(prev =>
    prev.includes(sectionId)
      ? prev.filter(id => id !== sectionId)
      : [...prev, sectionId]
  );
};
```

#### 3. YouTube Embed Helper
```typescript
const getYouTubeEmbedUrl = (url: string) => {
  const videoId = url.includes('youtube.com') 
    ? url.split('v=')[1]?.split('&')[0] 
    : url;
  return `https://www.youtube.com/embed/${videoId}`;
};
```

#### 4. Quiz Answer Display (Admin-Only)
```tsx
{q.options.map((option, oIdx) => {
  const isCorrect = q.correctAnswers.includes(oIdx);
  return (
    <div className={`p-4 rounded-lg border-2 ${
      isCorrect ? 'border-green-500 bg-green-50' : 'border-gray-200'
    }`}>
      {isCorrect && <Badge className="bg-green-500">✓ Đáp án đúng</Badge>}
      <span className={isCorrect ? 'font-medium text-green-700' : ''}>
        {option}
      </span>
    </div>
  );
})}
```

#### 5. Responsive Layout
```tsx
<div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
  {/* Left: 2/5 on desktop, full width on mobile */}
  <div className="lg:col-span-2">
    <ScrollArea className="h-[600px]">
      {/* Lesson list */}
    </ScrollArea>
  </div>

  {/* Right: 3/5 on desktop, full width on mobile */}
  <div className="lg:col-span-3">
    <ScrollArea className="h-[600px]">
      {/* Content preview */}
    </ScrollArea>
  </div>
</div>
```

⚠️ **Security Note**: Trong production, backend PHẢI check `user.role` trước khi trả về `correctAnswers`.

---

## 🎨 Shared Components

### 1. CourseCard Component

**Location**: `/src/components/shared/CourseCard.tsx`

**Props**:
```typescript
interface CourseCardProps {
  course: Course;
  onClick?: () => void;
  showActions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onDashboard?: () => void;
  onStudents?: () => void;
}
```

**Usage**:
```tsx
<CourseCard
  course={course}
  onClick={() => {
    setSelectedCourse(course);
    navigateTo('course-detail');
  }}
/>

// With owner actions
<CourseCard
  course={course}
  showActions={true}
  onEdit={() => navigateTo('edit-course')}
  onDelete={() => handleDelete(course.id)}
  onDashboard={() => navigateTo('course-dashboard')}
  onStudents={() => navigateTo('course-students')}
/>
```

**Features**:
- Responsive image with fallback
- Badge for visibility (Public/Private)
- Status badge (Draft/Pending/Approved/Rejected)
- Rating stars
- Student count
- Owner info with avatar
- Action buttons (conditional)

### 2. QuizEditor Component

**Location**: `/src/components/shared/QuizEditor.tsx`

**Props**:
```typescript
interface QuizEditorProps {
  onSave: (questions: QuizQuestion[]) => void;
  initialQuestions?: QuizQuestion[];
}

interface QuizQuestion {
  question: string;
  type: 'single' | 'multiple';
  options: string[];
  correctAnswers: number[]; // Indices of correct options
  explanation?: string;
}
```

**Features**:
- **Format Input**: Paste text → AI normalizes to structured format
  ```
  Input:
  Câu 1: React là gì?
  A. Library
  B. Framework
  C. Language
  Đáp án: A
  
  Output:
  {
    question: "React là gì?",
    type: "single",
    options: ["Library", "Framework", "Language"],
    correctAnswers: [0]
  }
  ```

- **Manual Input**: Add questions one by one
- **Preview Mode**: See formatted quiz
- **Validation**: Check for missing data

---

## 📊 Data Layer

### Mock Data Structure

**Location**: `/src/data/`

#### mockUsers.ts
```typescript
export const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@edulearn.com',
    name: 'Admin Nguyễn',
    avatar: 'AN',
    role: 'admin',
    status: 'active',
    joinedDate: new Date('2024-01-01'),
    coursesCreated: 5,
    coursesEnrolled: 3,
    totalStudents: 150
  },
  // ... more users
];
```

#### mockCourses.ts
```typescript
export const mockCourses: Course[] = [
  {
    id: '1',
    title: 'React Cơ Bản Đến Nâng Cao',
    description: 'Khóa học toàn diện về React...',
    image: 'https://images.unsplash.com/...',
    ownerId: '2',
    ownerName: 'Minh Tuấn',
    ownerAvatar: 'MT',
    visibility: 'public',
    status: 'approved',
    tags: ['React', 'JavaScript', 'Frontend'],
    rating: 4.8,
    students: 1234,
    duration: '12 giờ',
    lessons: 45,
    createdAt: new Date('2024-06-01')
  },
  // ... more courses
];
```

#### mockEnrollments.ts
```typescript
export const mockEnrollments: Enrollment[] = [
  {
    id: '1',
    userId: '3',
    courseId: '1',
    status: 'approved',
    message: 'Tôi muốn học React để phát triển sự nghiệp',
    progress: 65,
    requestedAt: new Date('2024-09-15'),
    respondedAt: new Date('2024-09-15')
  },
  // ... more enrollments
];
```

### Data Access Patterns

#### Get User Courses (Owner)
```typescript
const myCourses = mockCourses.filter(
  course => course.ownerId === currentUser.id
);
```

#### Get Enrolled Courses
```typescript
const enrolledCourseIds = mockEnrollments
  .filter(e => e.userId === currentUser.id && e.status === 'approved')
  .map(e => e.courseId);

const enrolledCourses = mockCourses.filter(
  course => enrolledCourseIds.includes(course.id)
);
```

#### Get Pending Approvals (Owner)
```typescript
const pendingEnrollments = mockEnrollments.filter(
  e => e.courseId === courseId && e.status === 'pending'
);
```

#### Filter Courses (Public + Approved)
```typescript
const publicCourses = mockCourses.filter(
  course => course.visibility === 'public' && course.status === 'approved'
);
```

---

## 📝 Type Definitions

**Location**: `/src/types/index.ts`

### Core Types

```typescript
// Navigation
export type Page = 'login' | 'home' | 'my-courses' | ... ;

// User
export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  googleId?: string;
  googlePicture?: string;
  role: 'user' | 'admin';
  status: 'active' | 'suspended';
  bio?: string;
  phone?: string;
  location?: string;
  joinedDate: Date;
  lastLogin?: Date;
  coursesCreated: number;
  coursesEnrolled: number;
  totalStudents: number;
}

// Course
export interface Course {
  id: string;
  title: string;
  description: string;
  image: string;
  ownerId: string;
  ownerName: string;
  ownerAvatar: string;
  visibility: 'private' | 'public';
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  tags: string[];
  rating: number;
  students: number;
  duration: string;
  lessons: number;
  createdAt: Date;
  updatedAt?: Date;
}

// Tag
export interface Tag {
  id: number;
  name: string;
  color: string;
  icon: string;
  courseCount: number;
  description: string;
}

// Enrollment
export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  status: 'pending' | 'approved' | 'rejected';
  message: string;
  rejectionReason?: string;
  progress: number;
  requestedAt: Date;
  respondedAt?: Date;
}

// Notification
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  courseId?: string;
  relatedUserId?: string;
  read: boolean;
  createdAt: Date;
  navigateTo?: Page;
}

export type NotificationType =
  | 'course_approved'
  | 'course_rejected'
  | 'enrollment_request'
  | 'enrollment_approved'
  | 'enrollment_rejected'
  | 'course_pending'
  | 'student_joined'
  | 'course_completed';
```

### Type Guards

```typescript
// Check if user is admin
export const isAdmin = (user: User | null): boolean => {
  return user?.role === 'admin';
};

// Check if user owns course
export const isOwner = (course: Course, user: User | null): boolean => {
  return user?.id === course.ownerId;
};

// Check if user can access course
export const canAccess = (
  course: Course,
  user: User | null,
  enrollments: Enrollment[]
): boolean => {
  if (!user) return false;
  if (isOwner(course, user)) return true;
  if (isAdmin(user)) return true;
  
  const enrollment = enrollments.find(
    e => e.userId === user.id && e.courseId === course.id
  );
  return enrollment?.status === 'approved';
};
```

---

## 🎨 Styling Guide

### Tailwind v4 Setup

**Location**: `/styles/globals.css`

#### Custom Variables
```css
:root {
  --color-primary: #1E88E5;
  --color-primary-hover: #1565C0;
  --color-background: #F5F6F8;
  --font-weight-medium: 500;
  --font-weight-normal: 400;
}
```

#### Typography Classes
```css
h1 { font-size: var(--text-2xl); font-weight: var(--font-weight-medium); }
h2 { font-size: var(--text-xl); font-weight: var(--font-weight-medium); }
h3 { font-size: var(--text-lg); font-weight: var(--font-weight-medium); }
h4 { font-size: var(--text-base); font-weight: var(--font-weight-medium); }
p { font-size: var(--text-base); font-weight: var(--font-weight-normal); }
```

⚠️ **Important**: Không dùng Tailwind classes cho font-size, font-weight, line-height trừ khi user yêu cầu.

### Component Styling Pattern

```tsx
// Good: Use semantic classes
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <Card>
    <CardHeader>
      <CardTitle>Title</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-gray-600">Content</p>
    </CardContent>
  </Card>
</div>

// Avoid: Inline styles unless absolutely necessary
<div style={{ fontSize: '16px' }}> {/* ❌ */}
```

### Responsive Utilities

```tsx
// Mobile-first approach
<div className="
  grid 
  grid-cols-1          // Mobile: 1 column
  md:grid-cols-2       // Tablet: 2 columns
  lg:grid-cols-3       // Desktop: 3 columns
  gap-6
">
  {/* Cards */}
</div>
```

---

## ✅ Best Practices

### 1. Component Structure
- Keep components focused and single-purpose
- Extract reusable logic into hooks
- Use TypeScript interfaces for props
- Add prop validation with TypeScript

### 2. State Management
- Use local state for UI-only data
- Use `useDemoAppState` for global data
- Avoid prop drilling - pass only what's needed
- Keep state as close to usage as possible

### 3. Performance
- Use `React.memo` for expensive components
- Avoid inline functions in render
- Use `useMemo` / `useCallback` when needed
- Lazy load heavy components

### 4. Code Organization
- One component per file
- Group related files in folders
- Use index.tsx for folder exports
- Keep files under 300 lines

### 5. Naming Conventions
- Components: PascalCase
- Functions: camelCase
- Constants: UPPER_CASE
- Interfaces: PascalCase with "I" prefix optional

### 6. Error Handling
- Use try-catch for async operations
- Show user-friendly error messages with toast
- Validate user input before submission
- Handle edge cases gracefully

### 7. Accessibility
- Use semantic HTML
- Add ARIA labels where needed
- Ensure keyboard navigation works
- Test with screen readers

### 8. Testing Strategy (For Backend Integration)
- Unit tests for utility functions
- Integration tests for API calls
- E2E tests for critical flows
- Visual regression tests for UI

---

## 🔧 Development Workflow

### Running the App
```bash
npm install
npm run dev
```

### Code Quality
```bash
# Type checking
npm run type-check

# Linting (if configured)
npm run lint

# Format (if configured)
npm run format
```

### Building for Production
```bash
npm run build
npm run preview
```

---

## 📚 Related Documentation

- **[README.md](README.md)**: Quick start và tổng quan project
- **[USER_GUIDE.md](USER_GUIDE.md)**: Hướng dẫn sử dụng, features chi tiết
- **[SYSTEM_OVERVIEW.md](SYSTEM_OVERVIEW.md)**: Backend blueprint, database schema, API endpoints

---

**Version**: 1.0.0  
**Last Updated**: January 2025  
**Status**: Frontend Complete ✅
