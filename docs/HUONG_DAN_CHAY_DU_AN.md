# 🚀 HƯỚNG DẪN CHẠY DỰ ÁN COURSE MANAGEMENT SYSTEM

## 📋 Yêu cầu hệ thống

- **Node.js**: Version 18.x hoặc cao hơn
- **npm**: Version 8.x hoặc cao hơn  
- **Tài khoản Supabase**: Để quản lý database (đăng ký miễn phí tại https://supabase.com)

## 🛠️ BƯỚC 1: Cài đặt Dependencies

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

## 🗄️ BƯỚC 2: Thiết lập Database (Supabase)

### 2.1. Tạo Project trên Supabase
1. Truy cập https://supabase.com và đăng nhập
2. Click **New Project**
3. Điền thông tin project và chọn region gần nhất
4. Đợi Supabase khởi tạo database (khoảng 2 phút)

### 2.2. Tạo Tables
1. Vào **SQL Editor** (thanh bên trái)
2. Click **New Query**
3. Mở file `backend/database/schema.sql` và copy toàn bộ nội dung
4. Paste vào SQL Editor và click **Run**

### 2.3. Cấu hình Row Level Security (RLS)
1. Vào **SQL Editor** → **New Query**
2. Mở file `backend/database/rls_policies.sql` và copy toàn bộ nội dung
3. Paste vào SQL Editor và click **Run**

### 2.4. Thêm dữ liệu mẫu (Tùy chọn)
1. Vào **SQL Editor** → **New Query**
2. Mở file `backend/database/seed.sql` và copy toàn bộ nội dung
3. Paste vào SQL Editor và click **Run**

## 🔑 BƯỚC 3: Cấu hình Backend Environment Variables

### 3.1. Lấy API Keys từ Supabase
1. Vào **Settings** → **API** (trong Supabase Dashboard)
2. Copy các thông tin sau:
   - **Project URL** → Dùng cho `SUPABASE_URL`
   - **anon public** → Dùng cho `SUPABASE_ANON_KEY`
   - **service_role** (Click "Reveal" để xem) → Dùng cho `SUPABASE_SERVICE_ROLE_KEY`

### 3.2. Tạo file .env trong thư mục backend
```bash
cd backend
```

Tạo file `.env` với nội dung sau (thay thế các giá trị `your_*` bằng thông tin từ Supabase):

```env
PORT=5001
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

> ⚠️ **LƯU Ý:** 
> - `PORT=5001` là cổng backend sẽ chạy
> - `CORS_ORIGIN=http://localhost:5173` là địa chỉ frontend (Vite mặc định)

## ▶️ BƯỚC 4: Chạy Backend Server

```bash
cd backend
npm run dev
```

✅ Backend sẽ chạy tại: **http://localhost:5001**

Bạn sẽ thấy thông báo tương tự:
```
Server is running on port 5001
```

### Test Backend API (Tùy chọn)
Mở terminal mới và test endpoint health check:
```bash
curl http://localhost:5001/health
```

Hoặc mở trình duyệt và truy cập: http://localhost:5001/health

## ▶️ BƯỚC 5: Chạy Frontend

Mở terminal mới (giữ terminal backend đang chạy):

```bash
cd frontend
npm run dev
```

✅ Frontend sẽ chạy tại: **http://localhost:5173**

Bạn sẽ thấy thông báo:
```
  VITE v6.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## 🌐 BƯỚC 6: Truy cập ứng dụng

1. Mở trình duyệt
2. Truy cập: **http://localhost:5173**
3. Bạn sẽ thấy trang chủ của Course Management System

## 📝 Các lệnh hữu ích

### Backend
```bash
# Chạy ở chế độ development (tự động reload khi code thay đổi)
npm run dev

# Build production
npm run build

# Chạy production build
npm start

# Chạy tests
npm test

# Lint code
npm run lint

# Format code
npm run lint:fix
```

### Frontend
```bash
# Chạy development server
npm run dev

# Build production
npm run build

# Preview production build
npm run preview
```

## 🔥 Xử lý lỗi thường gặp

### ❌ Lỗi: "Cannot find module" hoặc dependencies
**Giải pháp:**
```bash
# Xóa node_modules và cài lại
rm -rf node_modules package-lock.json
npm install
```

### ❌ Lỗi: "Port 5001 đã được sử dụng"
**Giải pháp:**
- Tắt ứng dụng đang dùng port 5001
- Hoặc đổi PORT trong file `.env` (ví dụ: `PORT=5002`)

### ❌ Lỗi: "Database error" hoặc "Invalid API key"
**Giải pháp:**
1. Kiểm tra file `.env` có đúng thông tin Supabase không
2. Đảm bảo đã chạy `schema.sql` và `rls_policies.sql`
3. Kiểm tra `SUPABASE_SERVICE_ROLE_KEY` có chính xác không

### ❌ Lỗi: Frontend không kết nối được Backend
**Giải pháp:**
1. Đảm bảo Backend đang chạy tại http://localhost:5001
2. Kiểm tra `CORS_ORIGIN` trong backend `.env` phải là `http://localhost:5173`

## 🎯 Quy trình phát triển chuẩn

1. **Mở 2 terminal:**
   - Terminal 1: Chạy backend (`cd backend && npm run dev`)
   - Terminal 2: Chạy frontend (`cd frontend && npm run dev`)

2. **Làm việc bình thường:**
   - Code sẽ tự động reload khi bạn lưu file
   - Backend dùng `tsx watch` để hot reload
   - Frontend dùng Vite HMR (Hot Module Replacement)

3. **Trước khi commit:**
   ```bash
   # Backend
   cd backend
   npm run lint
   npm test
   
   # Frontend
   cd frontend
   npm run build  # Đảm bảo build không lỗi
   ```

## 📚 Cấu trúc dự án

```
BTL-CN-Web-2025.1/
├── backend/
│   ├── src/              # Source code TypeScript
│   ├── database/         # SQL scripts (schema, RLS, seed)
│   ├── .env             # Environment variables (TỰ TẠO)
│   └── package.json     # Dependencies và scripts
│
├── frontend/
│   ├── src/             # React components
│   ├── public/          # Static assets
│   └── package.json     # Dependencies và scripts
│
└── HUONG_DAN_CHAY_DU_AN.md  # File này
```

## 🎉 Hoàn thành!

Bây giờ bạn có thể:
- ✅ Tạo tài khoản mới (Sign up)
- ✅ Đăng nhập (Login)
- ✅ Tạo và quản lý khóa học
- ✅ Xem danh sách khóa học
- ✅ Và nhiều tính năng khác!

---

**Chúc bạn code vui vẻ! 🚀**

Nếu gặp vấn đề, hãy kiểm tra lại từng bước hoặc xem file `backend/DATABASE_SETUP.md` để biết thêm chi tiết.
frontend: npm run build
backend: pm2 restart edulearn-backend
