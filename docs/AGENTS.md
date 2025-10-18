# AGENTS.MD for EduLearn Platform Backend

## 🎯 Mục Tiêu Dự Án

Nhiệm vụ chính là xây dựng backend cho nền tảng học tập trực tuyến **EduLearn Platform**. Frontend đã hoàn thành 100% và đang sử dụng mock data. Backend cần được xây dựng để thay thế lớp mock data này, cung cấp API đầy đủ và kết nối với cơ sở dữ liệu.

Tài liệu quan trọng nhất cần tham khảo là **[SYSTEM_OVERVIEW.md](SYSTEM_OVERVIEW.md)** và **[TECHNICAL_DOCUMENTATION.md](TECHNICAL_DOCUMENTATION.md)**.

## 🏗️ Tech Stack Backend

Sử dụng các công nghệ đã được định nghĩa trong tài liệu `SYSTEM_OVERVIEW.md`:
- **Nền tảng**: Supabase
- **Cơ sở dữ liệu**: PostgreSQL (thông qua Supabase)
- **Xác thực**: Supabase Auth với Google OAuth
- **Lưu trữ file**: Supabase Storage (cho ảnh bìa khóa học và file PDF)
- **API**: RESTful API
- **Bảo mật**: Row Level Security (RLS) của Supabase

## 📝 Kế Hoạch Triển Khai Backend

Thực hiện theo các giai đoạn đã được vạch ra trong `SYSTEM_OVERVIEW.md`. Ưu tiên theo thứ tự sau:

1.  **Thiết lập Database**: Dựa trên schema chi tiết trong `SYSTEM_OVERVIEW.md`, tạo 9 bảng: `users`, `courses`, `course_tags`, `tags`, `sections`, `lessons`, `quiz_questions`, `enrollments`, `lesson_progress`, và `notifications`.
2.  **Triển khai Xác thực**: Tích hợp Google OAuth và quản lý JWT token theo luồng đã mô tả trong `SYSTEM_OVERVIEW.md`.
3.  **Xây dựng API Endpoints**: Implement hơn 40 API endpoints đã được liệt kê trong `SYSTEM_OVERVIEW.md`. Đảm bảo các endpoint được bảo vệ và tuân thủ logic phân quyền (user vs. admin).
4.  **Triển khai Tính năng Real-time**: Sử dụng Supabase Realtime để xây dựng hệ thống thông báo và cập nhật trạng thái trực tiếp.

## 📊 Hướng Dẫn Về Database

- **Schema**: Tuân thủ nghiêm ngặt cấu trúc của 9 bảng đã được định nghĩa trong `SYSTEM_OVERVIEW.md`, bao gồm tên cột, kiểu dữ liệu, và các mối quan hệ (foreign keys).
- **Bảo mật**: Thiết lập các chính sách Row Level Security (RLS) trên Supabase. Ví dụ:
    - User chỉ có thể xem/chỉnh sửa khóa học mà họ sở hữu.
    - Admin có thể xem/chỉnh sửa tất cả các khóa học.
    - User chỉ có thể xem thông tin cá nhân của chính mình.

## 🌐 Hướng Dẫn Về API Endpoints

- **Tham khảo**: Toàn bộ danh sách endpoints cần xây dựng nằm trong file `SYSTEM_OVERVIEW.md`.
- **Phân quyền**: Chú ý bảo vệ các route. Ví dụ:
    - Các endpoints dưới `/api/admin/*` chỉ dành cho role `admin`.
    - `PATCH /api/courses/:id` cần kiểm tra xem người dùng có phải là `owner` của khóa học hoặc là `admin` không.
- **Dữ liệu trả về**: Cấu trúc dữ liệu trả về từ API nên khớp với các định nghĩa TypeScript trong `/src/types/index.ts` của frontend để đảm bảo tính nhất quán.

## 🔑 Hướng Dẫn Về Logic Phân Quyền

- **Hai vai trò chính**: `user` và `admin`.
- **Ownership Model**: Một `user` tạo ra khóa học sẽ trở thành `owner` của khóa học đó.
- **Quyền của Admin**:
    - Có thể xem toàn bộ nội dung của mọi khóa học (kể cả private) để kiểm duyệt.
    - Có quyền duyệt/từ chối các khóa học được đặt ở chế độ `public`.
    - Có quyền quản lý (xem/xóa) tất cả người dùng và khóa học.
- **Quyền của Owner**:
    - Toàn quyền trên khóa học của mình (chỉnh sửa, xóa, quản lý học viên).
    - Duyệt/từ chối các yêu cầu đăng ký học từ người dùng khác.

## 💡 Mẹo và Lưu Ý Quan Trọng

- **Thay thế Mock Data**: Mục tiêu cuối cùng là thay thế hoàn toàn lớp mock data trong `/src/data` bằng các API call tới backend.
- **File Uploads**: Sử dụng Supabase Storage để xử lý việc tải lên ảnh bìa và file PDF. Endpoint API cần trả về URL của file sau khi tải lên thành công.
- **YouTube Video**: Backend chỉ cần lưu trữ URL của video YouTube. Việc nhúng (embed) sẽ do frontend xử lý.
- **Quiz Answers**: Khi admin xem nội dung khóa học để kiểm duyệt, API phải trả về cả câu trả lời đúng (`correctAnswers`). Đối với user thường, API không được trả về trường này.
- **Thông báo**: Khi có các hành động quan trọng (ví dụ: admin duyệt khóa học, user yêu cầu đăng ký), hãy tạo một record mới trong bảng `notifications`.

## ✅ Quy trình làm việc

1.  **Chọn một tính năng**: Dựa trên `USER_GUIDE.md` và `SYSTEM_OVERVIEW.md`, chọn một luồng chức năng để làm (ví dụ: tạo khóa học, đăng ký học).
2.  **Xác định các API cần thiết**: Liệt kê các API endpoints liên quan đến tính năng đó.
3.  **Viết code backend**: Implement logic cho các API đã xác định, bao gồm cả việc tương tác với database và kiểm tra quyền hạn.
4.  **Kiểm thử**: Sử dụng một công cụ như Postman hoặc Thunder Client để kiểm tra các API vừa tạo. Đảm bảo chúng hoạt động đúng với các vai trò khác nhau (user, admin, owner).
5.  **Tích hợp với Frontend**: Thay thế các hàm mock data ở frontend bằng các lệnh gọi API thực tế.