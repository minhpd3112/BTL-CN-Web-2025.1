# 🎓 EduLearn Platform - Hướng Dẫn Sử Dụng

## 📖 Giới Thiệu

**EduLearn Platform** là nền tảng học tập trực tuyến hiện đại với mô hình ownership linh hoạt giống Google Drive/Sheets. Bất kỳ người dùng nào cũng có thể tạo khóa học và trở thành owner với toàn quyền quản lý, trong khi người khác có thể tham gia học khi được mời hoặc khi khóa học được công khai và admin duyệt.

### ✨ Đặc Điểm Nổi Bật

- **🎨 UI/UX Hiện Đại**: Flat design với màu xanh nước biển (#1E88E5), responsive trên mọi thiết bị
- **👥 Phân Quyền Linh Hoạt**: 2 vai trò rõ ràng - User và Admin
- **🔒 Quyền Riêng Tư**: Khóa học private (chỉ người được mời) và public (sau khi admin duyệt)
- **📚 Nội Dung Đa Dạng**: Video YouTube, PDF viewer (không cho download), bài viết text, quiz có đếm thời gian
- **📊 Dashboard Gọn Gàng**: Quick stats cho owner, không bị rối mắt
- **🔔 Thông Báo Thông Minh**: Hệ thống notifications với auto-navigation
- **📝 Validation Đầy Đủ**: Giới hạn ký tự cho mọi input field
- **🎯 Quiz Editor**: Tạo quiz với prompt LLM hoặc nhập manual

## 👤 Tài Khoản Demo

### 1. Admin Account
```
Email: admin@edulearn.vn
Name: Quản trị viên
Role: admin
Avatar: QT
```
**Quyền hạn đặc biệt:**
- ✅ Duyệt/từ chối khóa học public
- ✅ Xem và xóa tất cả khóa học (public + private)
- ✅ Quản lý tất cả người dùng
- ✅ Quản lý chủ đề (tags)
- ✅ Xem dashboard tổng quan hệ thống
- ✅ **VẪN có thể** tạo khóa học như user thường

### 2-4. User Accounts
```
User 1:
Email: nguyenvana@gmail.com
Name: Nguyễn Văn A
Role: user
Avatar: NA

User 2:
Email: tranthib@gmail.com
Name: Trần Thị B
Role: user
Avatar: TB

User 3:
Email: levanc@gmail.com
Name: Lê Văn C
Role: user
Avatar: LC
```
**Quyền hạn:**
- ✅ Tạo khóa học unlimited
- ✅ Trở thành owner của khóa học mình tạo
- ✅ Quản lý học viên trong khóa học của mình
- ✅ Xem dashboard khóa học của mình
- ✅ Đăng ký học khóa học của người khác
- ✅ Rời khỏi khóa học bất kỳ lúc nào
- ✅ Chỉnh sửa/xóa khóa học của mình
- ❌ **KHÔNG** xem/xóa khóa học của người khác
- ❌ **KHÔNG** duyệt khóa học
- ❌ **KHÔNG** quản lý người dùng/tags

## 🎯 Chức Năng Chính

### 1. 🏠 Trang Chủ (HomePage)
- Hiển thị các khóa học **public đã được duyệt**
- Lọc theo chủ đề (12 tags)
- Card hiển thị: ảnh bìa, tên, rating, số học viên, giảng viên
- Click vào card → Chi tiết khóa học

### 2. 🔍 Khám Phá (ExplorePage)
- Tìm kiếm khóa học
- Lọc theo: Tags, Rating, Số học viên
- Sắp xếp: Mới nhất, Phổ biến nhất, Rating cao nhất
- Grid layout responsive

### 3. 📖 Khóa Học Của Tôi (MyCoursesPage)
- **Tab "Đã tạo"**: Khóa học mình là owner
  - Badge trạng thái: Nháp/Chờ duyệt/Đã duyệt/Từ chối
  - Actions: Chỉnh sửa, Dashboard, Học viên, Xóa
- **Tab "Đang học"**: Khóa học đã đăng ký
  - Progress bar
  - **Nút "Rời khỏi"** ở góc phải trên mỗi card
  - Confirm dialog với warning về mất tiến độ
  - Tiếp tục học từ bài cuối cùng

### 4. 📝 Tạo Khóa Học (CreateCoursePage)
**Bước 1: Thông tin cơ bản**
- **Tên khóa học** (tối đa 100 ký tự) *
- **Mô tả** (tối đa 500 ký tự) *
- **Tổng quan** (tối đa 2000 ký tự)
- **Ảnh bìa**
- **Chủ đề** (có thể chọn nhiều) *
- **Chế độ hiển thị**:
  - 🔒 **Riêng tư**: Chỉ người được mời thấy
  - 🌐 **Công khai**: Sau khi admin duyệt, mọi người thấy

**Bước 2: Nội dung khóa học**
- Tạo **Mục** (Sections - tối đa 100 ký tự): Nhóm các bài học
- Thêm **Mục nhỏ** (Lessons) vào mỗi mục:
  - 📹 **Video**: YouTube URL (tối đa 200 ký tự)
  - 📄 **PDF**: Upload file (view only, không cho download)
  - 📝 **Text**: Nội dung bài viết (tối đa 10000 ký tự)
  - ✅ **Quiz**: Tạo câu hỏi với QuizEditor

**Character Counter:**
- Mọi input đều có counter hiển thị: "X/Y ký tự"
- Auto-block khi đạt giới hạn
- Visual feedback khi gần hết

**Validation:**
- Checklist bên phải: Tên ✅, Mô tả ✅, Chủ đề ✅, Nội dung ✅
- Không cho phép tạo nếu thiếu trường bắt buộc

### 5. ✏️ Chỉnh Sửa Khóa Học (EditCoursePage)
- **Giống y hệt** trang Tạo khóa học
- Load dữ liệu hiện có
- Có thể thêm/xóa mục và bài học
- **Click vào tiêu đề** để chỉnh sửa inline (sections và lessons)
- Nút "Lưu thay đổi" thay vì "Tạo khóa học"
- Character limits giống CreateCoursePage

### 6. 📚 Chi Tiết Khóa Học (CourseDetailPage)
**Thông tin hiển thị:**
- Ảnh bìa lớn
- Tên khóa học, rating, số học viên
- Giảng viên (avatar + tên)
- Mô tả đầy đủ
- Danh sách mục và bài học (collapse/expand)
- Tags

**Tabs:**
- **Tổng quan**: Mô tả khóa học, yêu cầu
- **Chương trình học**: Danh sách sections và lessons
- **👁️ Xem nội dung chi tiết** (⚠️ **CHỈ ADMIN THẤY**):
  - Layout 2 cột (Trái: Danh sách | Phải: Preview)
  - Preview đầy đủ: Video player, Text content, PDF viewer, Quiz với **đáp án đúng**
  - Mục đích: **Kiểm duyệt chất lượng nội dung** trước khi duyệt khóa học
- **Đánh giá**: Reviews từ học viên

**Actions khác nhau theo vai trò:**
- **Nếu là Owner**:
  - ✏️ Chỉnh sửa
  - 📊 Dashboard
  - 👥 Quản lý học viên
  - 🗑️ Xóa
  - ▶️ Bắt đầu học
  
- **Nếu đã đăng ký**:
  - ▶️ Tiếp tục học (hiển thị progress)
  
- **Nếu chưa đăng ký**:
  - 📝 Đăng ký học (viết message cho owner)

- **Nếu là Admin**:
  - 👁️ Xem tab "Xem nội dung chi tiết" (để kiểm duyệt)
  - 🗑️ Xóa (nếu vi phạm)

### 7. 🎬 Học Bài (LearningPage)
**Layout:**
- **Trái**: Sidebar danh sách bài học
  - Hiển thị progress: ✅ Đã hoàn thành / ⭕ Chưa học
  - Click chuyển bài
  
- **Phải**: Content area
  - **Video**: YouTube embed player fullscreen
  - **PDF**: iframe viewer fullscreen (KHÔNG cho download)
  - **Text**: Markdown renderer fullscreen
  - **Quiz**: Giao diện làm bài + đếm thời gian

**Features:**
- Auto-save progress
- Nút "Đánh dấu hoàn thành"
- Nút "Bài tiếp theo"
- Progress bar tổng thể

### 8. ✅ Quiz Editor Component
**Tính năng:**
- **Manual Input**: Nhập theo format đặc biệt
  - Single choice: `()` và `(x)` cho đáp án đúng
  - Multiple choice: `[]` và `[x]` cho các đáp án đúng
  
- **LLM Prompt Helper**: 
  - Copy prompt sẵn để paste vào ChatGPT/Claude/Gemini
  - AI trả về → Copy kết quả → Paste vào editor
  - Có thể chỉnh sửa thêm
  
- **Hướng dẫn Format**:
  - Dialog chi tiết với examples
  - Quy tắc bắt buộc
  - Prompt template để dùng với LLM

**Example Format:**
```
React là gì?
() Framework backend
(x) Thư viện JavaScript để xây dựng UI
() Hệ quản trị cơ sở dữ liệu

Các hook cơ bản trong React:
[x] useState
[x] useEffect
[] useBackend
```

### 9. 📊 Dashboard Khóa Học (CourseDashboardPage)
**Dành cho Owner:**
- **Quick Info Cards** (3 cards gọn gàng):
  - Tổng học viên
  - Đánh giá
  - Yêu cầu chờ duyệt (highlight nếu có)
  
- **Tabs**:
  - **Yêu cầu đăng ký**: Danh sách pending enrollments
  - **Đánh giá**: Reviews từ học viên

- **Bỏ phần thống kê phức tạp** - giữ giao diện đơn giản

### 10. 👥 Quản Lý Học Viên (CourseStudentsPage)
**Dành cho Owner:**
- **Tab "Tất cả"**: Học viên đã được duyệt
  - Search by name/email
  - Hiển thị: Avatar, tên, email, tiến độ, ngày tham gia
  - Action: Xóa (kick out)
  
- **Tab "Chờ duyệt"**: Yêu cầu đăng ký
  - Xem message của học viên
  - Action: Duyệt ✅ / Từ chối ❌
  
- **Nút "Thêm học viên"**:
  - Dialog mời trực tiếp
  - Tìm kiếm người dùng trong hệ thống
  - Gửi lời mời

### 11. 🎛️ Admin Dashboard (AdminDashboardPage)
**Tổng quan hệ thống:**
- **Stats Cards**:
  - Tổng người dùng
  - Tổng khóa học
  - Khóa học chờ duyệt
  - Tổng học viên
  
- **Charts**:
  - Khóa học theo chủ đề (Pie chart)
  - Người dùng mới theo tháng (Bar chart)
  - Top giảng viên (Table)
  
- **Quick Actions**:
  - Duyệt khóa học
  - Quản lý người dùng
  - Quản lý chủ đề

### 12. ✔️ Duyệt Khóa Học (ApproveCoursesPage)
**Dành cho Admin:**
- Danh sách khóa học **status = pending**
- Card hiển thị: Ảnh, tên, owner, ngày tạo, số mục
- **Nút "Xem chi tiết"** → Navigate đến CourseDetailPage với tab đặc biệt:
  - Tab **"Xem nội dung chi tiết"** (chỉ Admin thấy)
  - Layout 2 cột responsive:
    - **Trái (2/5)**: Danh sách mục và bài học (collapsible)
    - **Phải (3/5)**: Preview nội dung bài học được chọn
  - **Preview đầy đủ nội dung**:
    - 📹 **Video**: YouTube embed player (có thể play ngay)
    - 📝 **Text**: Hiển thị full content
    - 📄 **PDF**: PDF viewer (không cho download)
    - ✅ **Quiz**: Hiển thị câu hỏi + **TẤT CẢ ĐÁP ÁN (highlight đáp án đúng màu xanh)** + giải thích
  - Alert thông báo chế độ kiểm duyệt
- **Actions từ trang chủ ApproveCoursesPage**:
  - ✅ **Duyệt** → status = approved (lên trang chủ)
  - ❌ **Từ chối** → Nhập lý do → status = rejected (owner nhận thông báo)

### 13. 🗂️ Quản Lý Khóa Học (ManageCoursesPage)
**Dành cho Admin:**
- Xem **tất cả** khóa học (public + private + mọi status)
- **Bộ lọc:**
  - 🔍 Tìm kiếm (tên khóa học / giảng viên)
  - Hiển thị: Tất cả / Công khai / Riêng tư
  - Trạng thái: Tất cả / Chờ duyệt / Đã duyệt / Từ chối
  - **Chủ đề**: Tất cả / 12 tags
  
- **Stats Cards**: Tổng / Công khai / Riêng tư / Chờ duyệt
- **Course Cards**: Hiển thị đầy đủ thông tin + badge status
- **Actions**:
  - 👁️ **Xem** → Navigate đến CourseDetailPage
    - Tab "Xem nội dung chi tiết" để preview đầy đủ như ApproveCoursesPage
    - Kiểm tra chất lượng nội dung
  - 🗑️ **Xóa** (confirm dialog với warning)

### 14. 👤 Quản Lý Người Dùng (ManageUsersPage)
**Dành cho Admin:**
- Danh sách tất cả người dùng
- **Bộ lọc:**
  - 🔍 Tìm kiếm (tên / email)
  - Vai trò: Tất cả / User / Admin
  - Trạng thái: Tất cả / Hoạt động / Tạm khóa
  
- **User Table**: Avatar, tên, email, role, số khóa học, ngày tham gia
- **Actions**:
  - 👁️ Xem chi tiết → UserDetailPage
  - 🗑️ Xóa (confirm dialog)

### 15. 👁️ Chi Tiết Người Dùng (UserDetailPage)
**Dành cho Admin:**
- **Thông tin cá nhân**: Avatar, tên, email, phone, địa chỉ, bio
- **Thống kê**:
  - Số khóa học đã tạo
  - Số khóa học đang học
  - Tổng học viên (nếu là giảng viên)
  - Ngày tham gia
  
- **Tabs**:
  - **Khóa học đã tạo**: Danh sách + status
  - **Khóa học đang học**: Danh sách + progress
  
- **Actions**: Xóa người dùng (với warning)

### 16. 🏷️ Quản Lý Chủ Đề (ManageTagsPage)
**Dành cho Admin:**
- **Grid cards** hiển thị tags:
  - Icon, tên, màu sắc
  - Số khóa học sử dụng
  - Mô tả
  
- **Actions**:
  - ➕ Tạo tag mới (Dialog: tên, màu, icon, mô tả)
  - ✏️ Sửa tag (Dialog)
  - 🗑️ Xóa tag (confirm nếu có khóa học đang dùng)

### 17. ⚙️ Cài Đặt Tài Khoản (AccountSettingsPage)
**Dành cho tất cả User:**
- **Thông tin cá nhân**:
  - Avatar (upload ảnh)
  - Tên, email (read-only)
  - Phone, địa chỉ
  - Bio
  
- **Thống kê cá nhân**:
  - Số khóa học đã tạo
  - Số khóa học đang học
  - Ngày tham gia

- **Nút "Lưu thay đổi"**

### 18. 🔐 Đăng Nhập (LoginPage)
- **Google OAuth** (primary):
  - Nút "Sign in with Google"
  - Redirect → Google → Callback → JWT token
  
- **Demo Accounts** (development):
  - 4 tài khoản demo (1 admin + 3 users)
  - Click → Auto login

### 19. 🏷️ Chi Tiết Chủ Đề (TagDetailPage)
**Dành cho tất cả User:**
- Hiển thị thông tin chi tiết về một chủ đề (tag)
- Danh sách khóa học thuộc chủ đề đó
- Lọc và sắp xếp khóa học theo chủ đề
- Click vào khóa học → Chi tiết khóa học

## 🔔 Hệ Thống Thông Báo

### Loại Notifications
- ✅ **course_approved**: Khóa học được duyệt
- ❌ **course_rejected**: Khóa học bị từ chối (kèm lý do)
- 📝 **enrollment_request**: Có người muốn đăng ký khóa học (owner nhận)
- ✅ **enrollment_approved**: Yêu cầu đăng ký được duyệt
- ❌ **enrollment_rejected**: Yêu cầu đăng ký bị từ chối
- 👥 **student_joined**: Có học viên mới (owner nhận)
- 🎓 **course_completed**: Hoàn thành khóa học

### Features
- Badge số lượng chưa đọc
- Click notification → Auto navigate đến trang liên quan
- Mark as read
- Mark all as read
- Real-time updates (khi có backend)

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 640px
  - Hamburger menu
  - Stacked layout
  - Cards 1 cột
  
- **Tablet**: 640-1024px
  - Sidebar collapsed
  - Cards 2 cột
  - Some features condensed
  
- **Desktop**: > 1024px
  - Full navigation bar
  - Cards 3 cột
  - Sidebar expanded
  - Optimal spacing

## 🎨 Design System

### Brand Colors
- **Primary**: `#1E88E5` (Blue 500) - Buttons, links, highlights
- **Primary Hover**: `#1565C0` (Blue 700)
- **Primary Dark**: `#0D47A1` (Blue 900) - Dark accents
- **Background**: `#F5F6F8` (Gray 50)
- **Success**: `#4CAF50` (Green)
- **Warning**: `#FF9800` (Orange)
- **Error**: `#F44336` (Red)

### Typography
- **Font Family**: Inter, Nunito Sans (system fallback)
- **Headings**: Medium weight (500)
- **Body**: Normal weight (400)
- **Line Height**: 1.5

### UI Principles
- **Flat design** với minimal shadows
- **Card-based layouts** với subtle hover effects
- **Gradient text** cho tiêu đề quan trọng
- **Glassmorphism** cho login page
- **Consistent spacing** theo Tailwind scale
- **Clear hierarchy** với typography scale
- **Accessible colors** (WCAG AA compliant)

### UI/UX Enhancements (Latest)

#### 🎨 **Enhanced Headers (Gradient + Icons)**
Tất cả pages quan trọng đều có header thống nhất:
- **Icon** màu #1E88E5 (8x8)
- **Title** với gradient xanh (linear-gradient 135deg)
- **Subtitle** màu gray-600
- **Underline** gradient từ #1E88E5 fade to transparent
- Pages áp dụng: MyCoursesPage, CreateCoursePage, AccountSettingsPage, AdminDashboardPage, ApproveCoursesPage, ManageCoursesPage, ManageUsersPage, ManageTagsPage, ExplorePage

#### 🌟 **Logo & Branding**
- **LoginPage**: Logo GraduationCap với glow effect
- **Navigation**: Logo với gradient background và shadow
- **Avatar**: Gradient background (từ #1E88E5 → #1565C0) cho consistency

#### ✨ **Hover Effects**
- Course cards: `scale-105` + shadow-lg
- Demo account buttons: Border color change + scale-102
- Navigation items: Smooth background fade
- Create button: Lift effect với blue shadow

#### 🎭 **Glassmorphism**
- LoginPage card: `bg-white/95` với `backdrop-blur-xl`
- Floating shapes: White/5 với blur-3xl
- Modern, elegant aesthetic

#### 📊 **Statistics Section (HomePage)**
- Icon gradient backgrounds
- Animated counters với StatsCounter component
- Modern badges cho labels
- Responsive grid layout

#### 🔔 **Notification Badge**
- Continuous bell-shake animation
- Red notification dot
- Smooth dropdown với delay để tránh nhấp nhảy
- Avatar gradient glow effect

#### 🎯 **Back Buttons**
- Admin pages có nút "Quay về Dashboard"
- Consistent placement (top-left)
- Ghost variant cho subtle look
- Icon ArrowLeft + text

## 🔐 Phân Quyền Chi Tiết

### Matrix Quyền Hạn

| Tính năng | User | Admin |
|-----------|------|-------|
| Tạo khóa học | ✅ | ✅ |
| Xem khóa học public | ✅ | ✅ |
| Xem khóa học private của mình | ✅ | ✅ |
| Xem mọi khóa học private | ❌ | ✅ |
| Chỉnh sửa khóa học của mình | ✅ | ✅ |
| Xóa khóa học của mình | ✅ | ✅ |
| Xóa khóa học của người khác | ❌ | ✅ |
| Duyệt khóa học public | ❌ | ✅ |
| Quản lý học viên khóa học mình tạo | ✅ | ✅ |
| Quản lý người dùng | ❌ | ✅ |
| Quản lý tags | ❌ | ✅ |
| Xem admin dashboard | ❌ | ✅ |
| Rời khỏi khóa học | ✅ | ✅ |

## ✅ Trạng Thái Hiện Tại

### Frontend
- ✅ **100% hoàn thành**
- ✅ 19 pages đầy đủ chức năng
- ✅ 3 shared components (CourseCard, QuizEditor, StatsCounter)
- ✅ 47 shadcn/ui components
- ✅ Responsive design
- ✅ Mock data layer
- ✅ Type-safe TypeScript
- ✅ Clean architecture
- ✅ Character limits & validation
- ✅ PDF viewer (no download)
- ✅ Leave course feature
- ✅ Inline editing for sections/lessons

### Backend
- ⏳ **Chưa implement** - Cần xây dựng với Supabase
- 📚 Database schema đã được documented
- 📚 API endpoints đã được defined
- 📚 Authentication flow đã được thiết kế

## 📚 Tài Liệu Liên Quan

- **[README.md](README.md)**: Quick start và tổng quan
- **[TECHNICAL_DOCUMENTATION.md](TECHNICAL_DOCUMENTATION.md)**: Chi tiết kỹ thuật frontend
- **[SYSTEM_OVERVIEW.md](SYSTEM_OVERVIEW.md)**: Database schema, API endpoints, backend blueprint

---

**Version**: 1.0.0  
**Last Updated**: January 2025  
**Status**: Frontend Complete ✅ (19 Pages, 3 Shared Components) | Backend Pending ⏳  
**UI/UX**: Enhanced with gradients, glassmorphism, and animations ✨
