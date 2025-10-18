# 🎓 EduLearn Platform

> Nền tảng học tập trực tuyến với mô hình ownership linh hoạt - Bất kỳ ai cũng có thể tạo và quản lý khóa học

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 📚 Documentation

| File | Mô tả | Dành cho |
|------|-------|----------|
| **[USER_GUIDE.md](USER_GUIDE.md)** | 📖 Hướng dẫn sử dụng, 18 pages, demo accounts | Users, PMs |
| **[TECHNICAL_DOCUMENTATION.md](TECHNICAL_DOCUMENTATION.md)** | 🛠️ Frontend architecture, components, patterns | Frontend Devs |
| **[SYSTEM_OVERVIEW.md](SYSTEM_OVERVIEW.md)** | 🗄️ Database schema, API endpoints, backend plan | Backend Devs |

## ✨ Features

- **👥 Phân Quyền**: User & Admin với ownership model giống Google Drive
- **📚 Nội Dung Đa Dạng**: Video YouTube, PDF, Text, Quiz có timer
- **🔒 Quyền Riêng Tư**: Khóa học private (mời riêng) & public (admin duyệt)
- **📊 Dashboard**: Thống kê chi tiết cho owner và admin
- **🔔 Notifications**: Thông báo real-time với auto-navigation
- **🎨 UI/UX**: Flat design, responsive, Tailwind CSS v4

## 🏗️ Tech Stack

### Frontend (✅ Complete)
- React 18 + TypeScript
- Tailwind CSS v4 + Shadcn/UI
- Vite + Lucide Icons
- Custom State Management

### Backend (⏳ Todo)
- Supabase (PostgreSQL + Auth + Storage)
- Google OAuth
- RESTful API
- Row Level Security

## 📁 Project Structure

```
/
├── App.tsx                    # Entry point
├── /src
│   ├── /app                   # Core app logic
│   ├── /pages                 # 18 pages
│   ├── /components/shared     # Reusable components
│   ├── /data                  # Mock data (to replace with API)
│   └── /types                 # TypeScript definitions
├── /components/ui             # 47 Shadcn components
└── /styles                    # Tailwind v4 config
```

## 🎯 Status

| Component | Status |
|-----------|--------|
| Frontend | ✅ 100% Complete (18 pages) |
| UI/UX | ✅ Complete (responsive) |
| Mock Data | ✅ Complete |
| Documentation | ✅ ~15,000+ words |
| Backend | ⏳ Pending (Supabase) |

## 👤 Demo Accounts

| Role | Email | Name |
|------|-------|------|
| Admin | admin@edulearn.com | Admin Nguyễn |
| User 1 | user1@example.com | Minh Tuấn |
| User 2 | user2@example.com | Hương Giang |
| User 3 | user3@example.com | Đức Anh |

## 🎨 Design System

- **Primary Color**: #1E88E5 (Blue 500)
- **Typography**: Inter, Nunito Sans
- **UI Style**: Flat design, minimal shadows
- **Layout**: Card-based, mobile-first responsive

## 📖 Pages Overview

### Public Pages (Everyone)
- 🏠 Home - Public approved courses
- 🔍 Explore - Browse & filter courses
- 🔐 Login - Google OAuth + demo accounts

### User Pages
- 📖 My Courses - Created & enrolled courses
- 📝 Create/Edit Course - Course builder with sections & lessons
- 📚 Course Detail - Info, enrollment, learning
- 🎬 Learning - Video/PDF/Text/Quiz player
- ⚙️ Account Settings - Profile management

### Owner Pages
- 📊 Course Dashboard - Stats & analytics
- 👥 Manage Students - Approve enrollments, kick students

### Admin Pages
- 🎛️ Admin Dashboard - System overview
- ✔️ Approve Courses - Review & approve/reject
- 🗂️ Manage Courses - View/delete all courses
- 👤 Manage Users - View/delete users
- 🏷️ Manage Tags - Create/edit/delete tags

## 🔑 Key Features

### Admin Content Preview
Admin có thể xem chi tiết đầy đủ nội dung khóa học trước khi duyệt:
- ✅ **Video**: YouTube player
- ✅ **Text**: Full content
- ✅ **PDF**: File info
- ✅ **Quiz**: Questions + **Answers highlighted** (admin only)

### Course Visibility
- **Private**: Chỉ người được mời thấy
- **Public**: Admin duyệt → Lên trang chủ

### Enrollment Flow
```
User → Request enrollment (with message)
  ↓
Owner → Approve/Reject
  ↓
User → Start learning (if approved)
```

## 🚀 Next Steps

### Backend Implementation with Supabase

1. **Setup Database**
   - Create 9 tables (users, courses, sections, lessons, etc.)
   - Setup Row Level Security policies
   - Seed initial data

2. **Authentication**
   - Google OAuth integration
   - JWT token management
   - Protected API routes

3. **API Endpoints**
   - 40+ endpoints documented in SYSTEM_OVERVIEW.md
   - CRUD for courses, users, enrollments
   - File upload for images & PDFs

4. **Real-time Features**
   - Notifications system
   - Live enrollment updates
   - Progress tracking

## 📝 License

Private project - All rights reserved

---

**Version**: 1.0.0  
**Created**: January 2025  
**Frontend Status**: ✅ Complete | **Backend Status**: ⏳ Pending
