# 📋 EduLearn Platform - Development Guidelines

## 🎯 Mục Đích

Document này cung cấp các nguyên tắc và best practices khi phát triển EduLearn Platform.

---

## 🏗️ Architecture Principles

### 1. **Component Organization**
```
/src/pages/[PageName]/
├── index.tsx          # Main component
└── styles.css         # Page-specific styles (optional)
```

- Mỗi page là một folder riêng
- File `index.tsx` chứa component chính
- Styles có thể tách ra file `.css` riêng nếu cần
- Không tạo sub-components trong page folder (dùng `/components/shared` thay vì)

### 2. **Import Structure**
```typescript
// External libraries first
import { useState } from 'react';
import { Button } from '../../../components/ui/button';

// Internal imports
import { mockCourses } from '../../data';
import { Course, User } from '../../types';

// Local imports
import './styles.css'; // if exists
```

### 3. **Props Interface**
```typescript
// Always define interface for props
interface MyPageProps {
  navigateTo: (page: Page) => void;
  currentUser: User | null;
  // ... other props
}

export function MyPage({ navigateTo, currentUser }: MyPageProps) {
  // ...
}
```

---

## 🎨 UI/UX Standards

### 1. **Page Headers**
Tất cả pages chính phải có header thống nhất:
```tsx
<div className="mb-8">
  <div className="flex items-center gap-3 mb-3">
    <Icon className="w-8 h-8 text-[#1E88E5]" />
    <h1 
      style={{
        fontSize: '2rem',
        fontWeight: 700,
        background: 'linear-gradient(135deg, #1E88E5 0%, #1565C0 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}
    >
      Page Title
    </h1>
  </div>
  <p className="text-gray-600 ml-11">Page description</p>
  <div className="ml-11 w-24 h-1 bg-gradient-to-r from-[#1E88E5] to-transparent rounded-full mt-2"></div>
</div>
```

### 2. **Color Palette**
```css
Primary: #1E88E5 (Blue 500)
Primary Hover: #1565C0 (Blue 700)
Primary Dark: #0D47A1 (Blue 900)

Background: #FFFFFF
Background Alt: #F5F6F8

Text: #1F2937 (Gray 800)
Text Muted: #6B7280 (Gray 500)

Success: #10B981 (Green 500)
Warning: #F59E0B (Amber 500)
Error: #EF4444 (Red 500)
```

### 3. **Spacing Scale**
Sử dụng Tailwind spacing:
- `gap-2` (0.5rem) - Tight spacing
- `gap-4` (1rem) - Standard spacing
- `gap-6` (1.5rem) - Section spacing
- `gap-8` (2rem) - Large spacing
- `mb-8` - Standard bottom margin cho sections

### 4. **Typography**
**KHÔNG** sử dụng Tailwind classes cho font size/weight trong headers:
- Dùng inline styles hoặc global CSS variables
- Mục đích: Tận dụng typography system trong `globals.css`

**Ngoại lệ:** Body text và buttons có thể dùng Tailwind classes

### 5. **Animations**
```tsx
// Sử dụng AnimatedSection wrapper
import { AnimatedSection } from '../../utils/animations';

<AnimatedSection animation="fade-up" delay={100}>
  <Card>...</Card>
</AnimatedSection>
```

Animations có sẵn:
- `fade-up` - Fade in from bottom
- `fade-down` - Fade in from top
- `fade-left` - Fade in from right
- `fade-right` - Fade in from left
- `zoom-in` - Scale up
- `zoom-out` - Scale down

---

## 📝 Code Standards

### 1. **Character Limits**
Tất cả input fields PHẢI có validation:
```typescript
const MAX_LENGTHS = {
  courseTitle: 100,
  courseDescription: 500,
  courseOverview: 2000,
  sectionName: 100,
  lessonTitle: 150,
  youtubeUrl: 200,
  textContent: 10000,
  quizQuestion: 300,
  quizOption: 150,
  quizExplanation: 500,
};
```

### 2. **Error Handling**
```typescript
// Always show user-friendly messages
try {
  // ... action
  toast.success('Thành công!');
} catch (error) {
  toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
  console.error(error);
}
```

### 3. **Loading States**
```tsx
{isLoading ? (
  <Skeleton className="h-40 w-full" />
) : (
  <ActualContent />
)}
```

### 4. **Empty States**
```tsx
{items.length === 0 ? (
  <div className="text-center py-12">
    <Icon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
    <p className="text-gray-600">Không có dữ liệu</p>
  </div>
) : (
  <ItemsList />
)}
```

---

## 🔒 Security & Best Practices

### 1. **Authentication Check**
```typescript
// Always check user role before rendering admin content
{currentUser?.role === 'admin' && (
  <AdminOnlyContent />
)}
```

### 2. **Data Validation**
```typescript
// Validate before submit
const handleSubmit = () => {
  if (!title.trim()) {
    toast.error('Vui lòng nhập tiêu đề');
    return;
  }
  if (title.length > MAX_LENGTHS.courseTitle) {
    toast.error('Tiêu đề quá dài');
    return;
  }
  // ... proceed
};
```

### 3. **Prevent XSS**
```tsx
// NEVER use dangerouslySetInnerHTML without sanitization
// Use proper React rendering instead
<p>{userInput}</p> // ✅ Safe
<p dangerouslySetInnerHTML={{ __html: userInput }} /> // ❌ Dangerous
```

---

## 🎯 Component Reusability

### 1. **Shared Components**
Đặt trong `/src/components/shared/`:
- `CourseCard.tsx` - Display course info
- `QuizEditor.tsx` - Create/edit quizzes
- `StatsCounter.tsx` - Animated number counter

### 2. **When to Create Shared Component**
Tạo shared component khi:
- Được sử dụng ở 3+ places
- Có logic phức tạp cần tái sử dụng
- Cần maintain consistency across pages

### 3. **Shadcn/UI Components**
KHÔNG tạo lại các components này:
- Sử dụng từ `/components/ui/`
- Có thể customize nhỏ inline
- Không modify file gốc

---

## 📱 Responsive Design

### 1. **Mobile-First Approach**
```tsx
<div className="
  grid grid-cols-1           /* Mobile */
  md:grid-cols-2             /* Tablet */
  lg:grid-cols-3             /* Desktop */
  gap-4
">
```

### 2. **Breakpoints**
```
sm: 640px   - Mobile landscape
md: 768px   - Tablet
lg: 1024px  - Desktop
xl: 1280px  - Large desktop
2xl: 1536px - Extra large
```

### 3. **Hide/Show Elements**
```tsx
<div className="hidden lg:block">Desktop only</div>
<div className="lg:hidden">Mobile/Tablet only</div>
```

---

## 🧪 Testing Guidelines

### 1. **Manual Testing Checklist**
- [ ] Test trên Chrome, Firefox, Safari
- [ ] Test responsive (mobile, tablet, desktop)
- [ ] Test với mỗi role (user, admin)
- [ ] Test error cases (empty inputs, invalid data)
- [ ] Test navigation flow

### 2. **Edge Cases**
- Empty states (no courses, no students)
- Long text (truncation, overflow)
- Special characters trong inputs
- Concurrent actions (multiple clicks)

---

## 📚 Documentation

### 1. **Code Comments**
```typescript
// ❌ Bad
// get courses
const courses = getCourses();

// ✅ Good
// Filter approved public courses for homepage display
const publicCourses = mockCourses.filter(
  c => c.visibility === 'public' && c.status === 'approved'
);
```

### 2. **Complex Logic**
```typescript
// When logic is not obvious, add explanation
// Calculate average rating (handle division by zero)
const avgRating = reviews.length > 0 
  ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
  : 0;
```

---

## 🚀 Performance

### 1. **Avoid Unnecessary Re-renders**
```typescript
// Use useMemo for expensive calculations
const filteredCourses = useMemo(() => {
  return courses.filter(c => c.title.includes(search));
}, [courses, search]);
```

### 2. **Lazy Loading**
```typescript
// Load heavy components on demand
const QuizEditor = lazy(() => import('./components/QuizEditor'));
```

### 3. **Image Optimization**
```tsx
// Always specify dimensions
<img 
  src={course.image} 
  alt={course.title}
  className="w-full h-48 object-cover"
  loading="lazy"
/>
```

---

## 🐛 Common Pitfalls

### ❌ **Avoid**
1. Hardcoding values thay vì dùng constants
2. Quên check null/undefined
3. Dùng `any` type trong TypeScript
4. Inline styles cho mọi thứ (nên dùng Tailwind)
5. Nested ternary quá phức tạp
6. Copy-paste code (nên tạo shared component)

### ✅ **Do**
1. Sử dụng TypeScript interfaces
2. Validate inputs trước khi submit
3. Show loading/error states
4. Use semantic HTML
5. Keep components focused (Single Responsibility)
6. Follow naming conventions

---

## 🔄 Git Workflow (Future)

```bash
# Feature branch
git checkout -b feature/quiz-timer

# Commit với message rõ ràng
git commit -m "feat: Add timer to quiz page"

# Push và tạo PR
git push origin feature/quiz-timer
```

**Commit Message Convention:**
- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code refactoring
- `style:` - UI/CSS changes
- `docs:` - Documentation updates
- `test:` - Testing updates

---

## 📞 Support & Resources

### Documentation Files
- `README.md` - Quick start & overview
- `USER_GUIDE.md` - Complete user manual (18 pages)
- `TECHNICAL_DOCUMENTATION.md` - Frontend architecture
- `SYSTEM_OVERVIEW.md` - Backend blueprint & database

### Stack Documentation
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Shadcn/UI](https://ui.shadcn.com)
- [Lucide Icons](https://lucide.dev)

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Maintainer**: EduLearn Development Team
