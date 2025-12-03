# 📚 Danh Sách Công Nghệ Backend & Database - EduLearn Platform

## 🗄️ Database & Backend Platform

### 1. **Supabase** (Platform chính)
- **Mô tả**: Backend-as-a-Service (BaaS) cung cấp đầy đủ các dịch vụ cần thiết
- **Chức năng**:
  - PostgreSQL Database (managed)
  - Authentication & Authorization
  - Storage (file uploads)
  - Realtime subscriptions
  - Row Level Security (RLS)
- **Website**: https://supabase.com
- **Tài khoản**: Cần đăng ký tài khoản miễn phí hoặc paid plan

### 2. **PostgreSQL** (Thông qua Supabase)
- **Phiên bản**: Latest stable (quản lý bởi Supabase)
- **Chức năng**: 
  - Relational database
  - JSONB support (cho quiz options)
  - Full-text search
  - Foreign keys & constraints
- **Không cần cài đặt**: Được quản lý bởi Supabase

## 🛠️ Backend Framework & Runtime

### 3. **Node.js**
- **Phiên bản**: 20.x hoặc LTS
- **Chức năng**: JavaScript runtime environment
- **Cài đặt**: https://nodejs.org
- **Lưu ý**: Đã có sẵn trong dự án (backend đã setup)

### 4. **Express.js**
- **Phiên bản**: ^4.19.2 (đã có trong package.json)
- **Chức năng**: Web framework cho Node.js
- **Documentation**: https://expressjs.com
- **Sử dụng cho**: RESTful API endpoints

### 5. **TypeScript**
- **Phiên bản**: ^5.4.5 (đã có trong package.json)
- **Chức năng**: Type-safe JavaScript
- **File config**: `tsconfig.json`, `tsconfig.build.json`
- **Compiler**: `tsc` (TypeScript Compiler)

## 🔐 Authentication & Security

### 6. **Supabase Auth**
- **Client Library**: `@supabase/supabase-js` (^2.45.4)
- **Chức năng**:
  - User management
  - JWT token management
  - Session handling
  - Password reset
- **Documentation**: https://supabase.com/docs/guides/auth

### 7. **Google OAuth 2.0**
- **Provider**: Google Cloud Platform
- **Cần tạo**:
  - Google Cloud Project
  - OAuth 2.0 Client ID & Secret
  - Configure redirect URIs
- **Website**: https://console.cloud.google.com
- **Tích hợp**: Thông qua Supabase Auth

### 8. **Helmet.js**
- **Phiên bản**: ^7.1.0 (đã có trong package.json)
- **Chức năng**: Security headers middleware
- **Documentation**: https://helmetjs.github.io

### 9. **CORS (Cross-Origin Resource Sharing)**
- **Package**: `cors` (^2.8.5)
- **Chức năng**: Cho phép frontend gọi API từ domain khác
- **Config**: Cần setup cho frontend domain

## 📦 File Storage

### 10. **Supabase Storage**
- **Chức năng**:
  - Upload ảnh bìa khóa học
  - Upload file PDF cho lessons
  - Public/Private buckets
  - CDN delivery
- **API**: `@supabase/supabase-js` Storage API
- **Documentation**: https://supabase.com/docs/guides/storage

## 🔄 Data Validation & Processing

### 11. **Zod**
- **Phiên bản**: ^3.23.8 (đã có trong package.json)
- **Chức năng**: Schema validation cho TypeScript
- **Sử dụng cho**: 
  - Validate request body
  - Validate query parameters
  - Type inference
- **Documentation**: https://zod.dev

### 12. **dotenv**
- **Phiên bản**: ^16.4.5 (đã có trong package.json)
- **Chức năng**: Quản lý environment variables
- **File**: `.env` (không commit vào git)
- **Variables cần**:
  ```
  SUPABASE_URL=
  SUPABASE_ANON_KEY=
  SUPABASE_SERVICE_ROLE_KEY=
  GOOGLE_CLIENT_ID=
  GOOGLE_CLIENT_SECRET=
  JWT_SECRET=
  PORT=
  NODE_ENV=
  ```

## 📝 Logging & Monitoring

### 13. **Morgan**
- **Phiên bản**: ^1.10.0 (đã có trong package.json)
- **Chức năng**: HTTP request logger middleware
- **Sử dụng cho**: Log tất cả API requests
- **Documentation**: https://github.com/expressjs/morgan

### 14. **Winston** (Tùy chọn - chưa có)
- **Chức năng**: Advanced logging library
- **Lưu ý**: Có thể thêm nếu cần logging nâng cao

## 🧪 Testing

### 15. **Vitest**
- **Phiên bản**: ^1.5.4 (đã có trong package.json)
- **Chức năng**: Unit testing framework
- **Alternative**: Jest, Mocha
- **Documentation**: https://vitest.dev

## 🛡️ Code Quality

### 16. **ESLint**
- **Phiên bản**: ^8.57.0 (đã có trong package.json)
- **Plugins**:
  - `@typescript-eslint/eslint-plugin` (^7.15.0)
  - `@typescript-eslint/parser` (^7.15.0)
  - `eslint-plugin-import` (^2.29.1)
  - `eslint-plugin-simple-import-sort` (^10.0.0)
- **Chức năng**: Code linting và formatting rules
- **Config**: `.eslintrc.js` hoặc `.eslintrc.json`

### 17. **Prettier**
- **Phiên bản**: ^3.3.3 (đã có trong package.json)
- **Chức năng**: Code formatter
- **Config**: `.prettierrc` hoặc `prettier.config.js`
- **Documentation**: https://prettier.io

## 🔄 Development Tools

### 18. **tsx**
- **Phiên bản**: ^4.16.2 (đã có trong package.json)
- **Chức năng**: TypeScript execution engine
- **Sử dụng cho**: 
  - `npm run dev` - Hot reload development
  - `tsx watch src/server.ts`
- **Alternative**: `ts-node`, `ts-node-dev`

### 19. **tsconfig-paths**
- **Phiên bản**: ^4.2.0 (đã có trong package.json)
- **Chức năng**: Resolve TypeScript path aliases (`@config/*`, `@controllers/*`)
- **Sử dụng cho**: Import paths trong code

## 🌐 Real-time Features

### 20. **Supabase Realtime**
- **Chức năng**: 
  - Real-time subscriptions
  - WebSocket connections
  - Database change notifications
  - Live updates cho notifications
- **API**: `@supabase/supabase-js` Realtime API
- **Documentation**: https://supabase.com/docs/guides/realtime

## 📊 Database Tools & Utilities

### 21. **Supabase SQL Editor**
- **Chức năng**: 
  - Tạo tables
  - Chạy migrations
  - Viết functions & triggers
  - Setup RLS policies
- **Location**: Supabase Dashboard → SQL Editor

### 22. **Database Migrations** (Tùy chọn)
- **Tools có thể dùng**:
  - Supabase CLI migrations
  - `db-migrate`
  - Manual SQL scripts
- **Lưu ý**: Supabase hỗ trợ migrations qua Dashboard

## 🔧 API Documentation Tools

### 23. **Postman** (Development)
- **Chức năng**: 
  - Test API endpoints
  - Create API collections
  - Generate documentation
- **Website**: https://www.postman.com
- **Alternative**: Thunder Client (VS Code extension)

### 24. **Swagger/OpenAPI** (Tùy chọn)
- **Packages có thể dùng**:
  - `swagger-ui-express`
  - `swagger-jsdoc`
- **Chức năng**: Auto-generate API documentation

## 🚀 Deployment & DevOps

### 25. **Git**
- **Chức năng**: Version control
- **Platforms**: GitHub, GitLab, Bitbucket
- **Lưu ý**: Đã có sẵn trong project

### 26. **Environment Management**
- **Development**: `.env.local`
- **Production**: Environment variables trên hosting platform
- **Hosting Options**:
  - Vercel
  - Railway
  - Render
  - AWS
  - DigitalOcean
  - Heroku

## 📋 Tổng Hợp Packages đã có trong package.json

### Dependencies (Production)
```json
{
  "@supabase/supabase-js": "^2.45.4",
  "cors": "^2.8.5",
  "dotenv": "^16.4.5",
  "express": "^4.19.2",
  "helmet": "^7.1.0",
  "morgan": "^1.10.0",
  "zod": "^3.23.8"
}
```

### DevDependencies (Development)
```json
{
  "@types/cors": "^2.8.17",
  "@types/express": "^4.17.21",
  "@types/morgan": "^1.9.9",
  "@types/node": "^20.12.7",
  "@typescript-eslint/eslint-plugin": "^7.15.0",
  "@typescript-eslint/parser": "^7.15.0",
  "eslint": "^8.57.0",
  "eslint-config-prettier": "^9.1.0",
  "eslint-plugin-import": "^2.29.1",
  "eslint-plugin-simple-import-sort": "^10.0.0",
  "prettier": "^3.3.3",
  "ts-node": "^10.9.2",
  "tsconfig-paths": "^4.2.0",
  "tslib": "^2.6.2",
  "tsx": "^4.16.2",
  "typescript": "^5.4.5",
  "vitest": "^1.5.4"
}
```

## 🎯 Packages Có Thể Cần Thêm (Tùy chọn)

### 27. **JWT Libraries** (Nếu cần custom JWT)
- `jsonwebtoken`: Để sign/verify JWT tokens
- `@types/jsonwebtoken`: TypeScript types
- **Lưu ý**: Supabase đã handle JWT, chỉ cần nếu muốn custom

### 28. **Rate Limiting**
- `express-rate-limit`: Giới hạn số request
- **Chức năng**: Bảo vệ API khỏi abuse

### 29. **File Upload Middleware**
- `multer`: Nếu upload file trực tiếp qua Express
- **Lưu ý**: Nên dùng Supabase Storage thay vì multer

### 30. **Email Service** (Tùy chọn)
- `nodemailer`: Gửi email notifications
- **Alternatives**: SendGrid, Mailgun, AWS SES
- **Lưu ý**: Supabase có thể gửi email qua Auth

### 31. **Error Tracking** (Production)
- `@sentry/node`: Error monitoring
- **Alternatives**: Rollbar, Bugsnag

## 📝 Checklist Setup

### ✅ Cần làm ngay:
1. [ ] Tạo tài khoản Supabase
2. [ ] Tạo Google Cloud Project và OAuth credentials
3. [ ] Setup Supabase project với PostgreSQL
4. [ ] Tạo database tables (10 bảng)
5. [ ] Setup Row Level Security (RLS) policies
6. [ ] Configure Supabase Storage buckets
7. [ ] Setup environment variables
8. [ ] Cài đặt tất cả npm packages: `npm install`

### 📚 Tài liệu tham khảo chính:
- **Supabase**: https://supabase.com/docs
- **Express.js**: https://expressjs.com/en/guide/routing.html
- **TypeScript**: https://www.typescriptlang.org/docs
- **PostgreSQL**: https://www.postgresql.org/docs/
- **Google OAuth**: https://developers.google.com/identity/protocols/oauth2

---

**Lưu ý**: Tất cả các packages trong `package.json` đã được chọn phù hợp với dự án. Chỉ cần chạy `npm install` trong thư mục `backend/` để cài đặt.


