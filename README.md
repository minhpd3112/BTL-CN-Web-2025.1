# 🎓 EduLearn - Nền tảng học trực tuyến

<p align="center">
  <img src="https://img.shields.io/badge/React-18.x-61DAFB?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Express-4.x-000000?logo=express" alt="Express" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.x-06B6D4?logo=tailwindcss" alt="Tailwind" />
</p>

**EduLearn** là nền tảng học trực tuyến hiện đại, cho phép người dùng tạo và quản lý khóa học, đăng ký và theo dõi tiến độ học tập.

🌐 **Demo:** [https://edulearn.id.vn](https://edulearn.id.vn)

---

## ✨ Tính năng chính

### 👨‍🎓 Dành cho Người dùng
- Khám phá và tìm kiếm khóa học theo chủ đề
- Tham gia khóa học
- Tạo và quản lý khóa học với nội dung đa phương tiện
- Quản lý học viên tham gia khóa học

### 👨‍💼 Dành cho Admin
- Duyệt khóa học trước khi công khai
- Quản lý người dùng

---

## 🛠️ Công nghệ sử dụng

### Frontend
| Công nghệ | Mục đích |
|-----------|----------|
| React 18 + TypeScript | UI Framework |
| Vite | Build tool |
| TailwindCSS | Styling |
| Shadcn/UI | Component library |
| React Query | Data fetching |
| Lottie | Animations |

### Backend
| Công nghệ | Mục đích |
|-----------|----------|
| Node.js + Express | API Server |
| TypeScript | Type safety |
| Supabase | Database + Auth + Storage |

### Deployment
| Công nghệ | Mục đích |
|-----------|----------|
| Nginx | Reverse proxy + Static hosting |
| PM2 | Process manager |
| Let's Encrypt | SSL Certificate |

## 📁 Cấu trúc dự án

```
BTL-CN-Web-2025.1/
├── frontend/                 # React + Vite
│   ├── src/
│   │   ├── components/       # UI components (shadcn + custom)
│   │   ├── features/         # Feature modules (layout, etc.)
│   │   ├── hooks/            # Custom React hooks
│   │   ├── pages/            # Route-level components
│   │   ├── services/         # API clients
│   │   ├── types/            # TypeScript types
│   │   └── utils/            # Utility functions
│   └── package.json
│
├── backend/                  # Express API
│   ├── src/
│   │   ├── config/           # Environment, Supabase config
│   │   ├── controllers/      # Request handlers
│   │   ├── middlewares/      # Auth, error handlers
│   │   ├── models/           # Database models
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   └── utils/            # Helpers
│   └── package.json
│
└── package.json              # Root scripts
```

---

## 🚀 Hướng dẫn cài đặt

### Yêu cầu
- Node.js >= 18.x
- npm >= 9.x
- Tài khoản Supabase (cho database)

### 1. Clone repository
```bash
git clone https://github.com/minhpd3112/BTL-CN-Web-2025.1.git
cd BTL-CN-Web-2025.1
```

### 2. Cài đặt dependencies
```bash
# Cài đặt cả frontend và backend
npm run install:all

# Hoặc cài đặt riêng
cd frontend && npm install
cd ../backend && npm install
```

### 3. Cấu hình môi trường

#### Backend (`backend/.env`)
```env
PORT=5001
NODE_ENV=development

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# JWT
JWT_SECRET=your_jwt_secret

# AI (optional)
GOOGLE_GEMINI_API_KEY=your_gemini_api_key
```

#### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5001/api
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Chạy ứng dụng
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

Truy cập:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5001

## 📄 License

Dự án này được phát triển cho mục đích học tập tại môn **IT4409 - Công nghệ Web và dịch vụ trực tuyến** - Học kỳ 2025.1.