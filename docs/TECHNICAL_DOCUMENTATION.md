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
Frontend Framework:
├── React 18.3+ (TypeScript)
├── Vite 6.3 (Build tool)
└── TypeScript 5.4+

Styling & UI:
├── Tailwind CSS v4.0 (latest)
├── Shadcn/UI (47 components)
├── Custom CSS modules (per-page styles.css)
└── Global CSS (typography, variables, animations)

State Management:
├── Custom hooks (useDemoAppState)
├── Local state (useState)
└── Props drilling for page communication

Animations:
├── Custom AnimatedSection wrapper
├── CSS transitions & keyframes
└── React animations

Icons & Assets:
├── Lucide React (comprehensive icon set)
└── Unsplash (image placeholders)

Notifications:
└── Sonner v2.0.3 (toast notifications)

Utilities:
├── React Hook Form v7.55.0
└── Date formatting utilities
```

### Architecture Pattern
```
┌─────────────────────────────────────┐
│         App.tsx (Entry Point)       │
│  ┌───────────────────────────────┐  │
│  │      Authentication Check     │  │
│  └───────────────────────────────┘  │
│              ↓                       │
│  ┌───────────────────────────────┐  │
│  │  LoginPage  │   AppShell      │  │
│  └───────────────────────────────┘  │
│              ↓                       │
│  ┌───────────────────────────────┐  │
│  │        useDemoAppState        │  │
│  │  (Centralized State & Logic)  │  │
│  └───────────────────────────────┘  │
│              ↓                       │
│  ┌───────────────────────────────┐  │
│  │     Header + Sidebar          │  │
│  │     Notifications             │  │
│  └───────────────────────────────┘  │
│              ↓                       │
│  ┌───────────────────────────────┐  │
│  │      Page Components          │  │
│  │   (19 pages conditional)      │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

---

## 📁 Cấu Trúc Thư Mục

```
/
├── App.tsx                      # Entry point
├── /src
│   ├── /features
│   │   └── /layout
│   │       └── /components
│   │           └── AppShell.tsx # Main shell (header, sidebar, routing)
│   │
│   ├── /hooks
│   │   └── useDemoAppState.tsx  # State management hook
│   │
│   ├── /pages                   # 19 page components
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
│   │   ├── AccountSettingsPage/
│   │   └── TagDetailPage/
│   │
│   ├── /components
│   │   ├── /figma
│   │   │   └── ImageWithFallback.tsx
│   │   └── /shared
│   │       ├── CourseCard.tsx   # Reusable course card
│   │       ├── QuizEditor.tsx   # Quiz creation editor
│   │       └── StatsCounter.tsx # Animated counter component
│   │
│   ├── /services
│   │   └── /mocks               # Mock data (to be replaced with API)
│   │       ├── index.ts
│   │       ├── mockUsers.ts
│   │       ├── mockCourses.ts
│   │       ├── mockEnrollments.ts
│   │       └── mockTags.ts
│   │
│   ├── /types
│   │   └── index.ts             # TypeScript definitions
│   │
│   ├── /utils
│   │   └── animations.tsx       # Animation utilities
│   │
│   └── /styles
│       └── globals.css          # Tailwind v4 + custom styles
│
├── /components
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

**Location**: `/src/hooks/useDemoAppState.tsx`

#### State Structure
```typescript
interface AppState {
  // Navigation
  currentPage: Page;
  selectedCourse: Course | null;
  selectedUser: User | null;
  selectedTag: Tag | null;
  
  // Authentication
  currentUser: User | null;
  currentRole: 'admin' | 'user' | null;
  userGooglePicture: string | null;
  
  // UI State
  sidebarOpen: boolean;
  showNotifications: boolean;
  
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
  navigateTo: (page: Page, course?: Course) => void;
  setSelectedCourse: (course: Course | null) => void;
  setSelectedUser: (user: User | null) => void;
  setSelectedTag: (tag: Tag | null) => void;
  
  // Authentication
  handleLogin: (user: User, googlePicture?: string) => void;
  handleLogout: () => void;
  
  // UI State
  setSidebarOpen: (open: boolean) => void;
  setShowNotifications: (show: boolean) => void;
  
  // Notifications
  markAsRead: (notificationId: number) => void;
  markAllAsRead: () => void;
  handleNotificationClick: (notification: Notification) => void;
  
  // Enrollments
  handleEnrollRequest: (request: Omit<EnrollmentRequest, 'id' | 'status' | 'respondedAt'>) => void;
  handleApproveRequest: (requestId: number) => void;
  handleRejectRequest: (requestId: number) => void;
  
  // Permissions
  isOwner: (course: Course) => boolean;
  canAccessCourse: (course: Course) => boolean;
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
const newNotification: Notification = {
  id: Date.now(),
  type: 'course_approved',
  title: 'Khóa học được duyệt!',
  message: 'Khóa học React Advanced đã được admin duyệt',
  courseId: course.id,
  userId: currentUser?.id,
  timestamp: '2 giờ trước',
  read: false,
  icon: 'CheckCircle',
  color: 'text-green-500',
  action: { page: 'course-detail', courseId: course.id }
};

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
  | 'account-settings'
  | 'tag-detail';
```

### Navigation Flow
```typescript
// AppShell.tsx - Routing logic
<main className="page-transition">
  {currentPage === 'home' && <HomePage {...props} />}
  {currentPage === 'my-courses' && <MyCoursesPage {...props} />}
  {currentPage === 'explore' && <ExplorePage {...props} />}
  {currentPage === 'tag-detail' && <TagDetailPage {...props} />}
  {/* ... all 19 pages */}
</main>
```

### Protected Routes
```typescript
// In useDemoAppState.tsx
const navigateTo = (page: Page, course?: Course) => {
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
  if (course) setSelectedCourse(course);
  setSidebarOpen(false);
  window.scrollTo(0, 0);
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
navigateTo('course-detail', course);
```

#### 3. From Notification
```typescript
const handleNotificationClick = (notification: Notification) => {
  actions.markAsRead(notification.id);
  // Auto-navigates to notification.action.page
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
import { /* ui components */ } from '@/components/ui/*';
import { /* types */ } from '@/types';

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

### 3. StatsCounter Component

**Location**: `/src/components/shared/StatsCounter.tsx`

**Props**:
```typescript
interface StatsCounterProps {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
}
```

**Features**:
- Animated counting from 0 to target number
- Customizable duration and suffix/prefix
- Used in HomePage statistics section

---

## 📊 Data Layer

### Mock Data Structure

**Location**: `/src/services/mocks/`

#### mockUsers.ts
```typescript
export const mockUsers: User[] = [
  {
    id: 1,
    username: "admin",
    password: "admin123",
    role: "admin",
    name: "Quản trị viên",
    avatar: "QT",
    email: "admin@edulearn.vn",
    fullName: "Quản Trị Viên Hệ Thống",
    phone: "0945678901",
    bio: "Quản trị viên hệ thống EduLearn. Phụ trách duyệt khóa học và quản lý người dùng.",
    joinedDate: "2022-01-01",
    coursesCreated: 1,
    coursesEnrolled: 5,
    totalStudents: 500,
    status: "active",
    lastLogin: "2025-01-13 17:00",
    location: "Hà Nội, Việt Nam",
    createdAt: "2022-01-01T00:00:00Z",
    updatedAt: "2025-01-13T17:00:00Z",
  },
  // ... more users
];
```

#### mockCourses.ts
```typescript
export const mockCourses: Course[] = [
  {
    id: 1,
    title: 'Lập trình React từ Cơ bản đến Nâng cao',
    description: 'Khóa học toàn diện về React, từ components cơ bản đến hooks và state management',
    overview: `## Bạn sẽ học được gì?
    // ... markdown content
    `,
    ownerName: 'Nguyễn Văn A',
    ownerId: 2,
    ownerAvatar: 'NA',
    rating: 4.8,
    students: 1234,
    duration: '12 tuần',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
    tags: ['Web Development', 'JavaScript', 'Lập trình'],
    status: 'approved',
    visibility: 'public',
    lessons: 45,
    enrolledUsers: [3],
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20'
  },
  // ... more courses
];
```

#### mockEnrollments.ts
```typescript
export const mockEnrollments: Enrollment[] = [
  {
    id: 1,
    userId: 3,
    courseId: 1,
    enrolledAt: '2024-09-15',
    progress: 65,
    completedLessons: [1, 2, 3],
    lastAccessAt: '2024-09-20'
  },
  // ... more enrollments
];

export const mockEnrollmentRequests: EnrollmentRequest[] = [
  {
    id: 1,
    courseId: 1,
    userId: 3,
    userName: 'Lê Văn C',
    userAvatar: 'LC',
    userEmail: 'levanc@gmail.com',
    status: 'pending',
    message: 'Tôi muốn học React để phát triển sự nghiệp',
    requestedAt: '2024-09-15 10:30',
    respondedAt: null
  },
  // ... more requests
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
  .filter(e => e.userId === currentUser.id)
  .map(e => e.courseId);

const enrolledCourses = mockCourses.filter(
  course => enrolledCourseIds.includes(course.id)
);
```

#### Get Pending Approvals (Owner)
```typescript
const pendingEnrollments = mockEnrollmentRequests.filter(
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
  id: number;
  username: string;
  password: string;
  role: 'user' | 'admin';
  name: string;
  avatar: string;
  email: string;
  fullName?: string;
  phone?: string;
  bio?: string;
  joinedDate: string;
  coursesCreated: number;
  coursesEnrolled: number;
  totalStudents: number;
  status: 'active' | 'inactive';
  lastLogin: string;
  location?: string;
  googleId?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Course
export interface Course {
  id: number;
  title: string;
  description: string;
  overview?: string;
  ownerName: string;
  ownerId: number;
  ownerAvatar: string;
  rating: number;
  students: number;
  duration: string;
  image: string;
  tags: string[];
  status: 'pending' | 'approved' | 'rejected';
  visibility: 'public' | 'private';
  lessons: number;
  enrolledUsers: number[];
  createdAt: string;
  updatedAt?: string;
}

// Tag
export interface Tag {
  id: number;
  name: string;
  color: string;
  icon: string;
  courseCount: number;
  description: string;
  image?: string;
}

// Enrollment
export interface Enrollment {
  id: number;
  userId: number;
  courseId: number;
  enrolledAt: string;
  progress: number;
  completedLessons: number[];
  lastAccessAt: string;
}

// Enrollment Request
export interface EnrollmentRequest {
  id: number;
  courseId: number;
  userId: number;
  userName: string;
  userAvatar: string;
  userEmail: string;
  status: 'pending' | 'approved' | 'rejected';
  message: string;
  requestedAt: string;
  respondedAt: string | null;
}

// Notification
export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  courseId?: number;
  userId?: number;
  timestamp: string;
  read: boolean;
  icon: string;
  color: string;
  action?: {
    page: Page;
    courseId?: number;
    userId?: number;
  };
}
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
**Status**: Frontend Complete ✅ | 19 Pages | 3 Shared Components
