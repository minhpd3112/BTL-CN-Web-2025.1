import { Course } from '@/types';

export const mockCourses: Course[] = [
  {
    id: "1",
    title: 'Lập trình React từ Cơ bản đến Nâng cao',
    description: 'Khóa học toàn diện về React, từ components cơ bản đến hooks và state management',
    overview: `## Bạn sẽ học được gì?

- Nắm vững các khái niệm cơ bản của React: Components, Props, State
- Hiểu rõ và sử dụng thành thạo React Hooks (useState, useEffect, useContext, v.v.)
- Xây dựng ứng dụng Single Page Application (SPA) hoàn chỉnh
- Quản lý state phức tạp với Context API và Redux
- Làm việc với API và xử lý bất đồng bộ
- Tối ưu hóa hiệu suất ứng dụng React
- Triển khai ứng dụng lên production

## Yêu cầu

- Kiến thức vững về JavaScript ES6+
- Hiểu biết cơ bản về HTML và CSS
- Đã từng làm việc với npm hoặc yarn
- Tinh thần học hỏi và thực hành thường xuyên`,
    ownerName: 'Nguyễn Văn A',
    ownerId: "2",
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
  {
    id: "2",
    title: 'Thiết kế UI/UX chuyên nghiệp với Figma',
    description: 'Học cách thiết kế giao diện người dùng đẹp mắt và trải nghiệm tốt',
    overview: `## Bạn sẽ học được gì?

- Nắm vững nguyên lý thiết kế UI/UX cơ bản và nâng cao
- Sử dụng thành thạo Figma để thiết kế giao diện
- Nghiên cứu người dùng và xây dựng User Persona
- Thiết kế wireframe và prototype tương tác
- Áp dụng Design System vào dự án thực tế
- Làm việc hiệu quả với developer trong team
- Tạo portfolio UI/UX ấn tượng

## Yêu cầu

- Không cần kinh nghiệm thiết kế trước đó
- Máy tính cá nhân (Windows hoặc Mac)
- Cài đặt Figma (miễn phí)
- Đam mê sáng tạo và thẩm mỹ`,
    ownerName: 'Trần Thị B',
    ownerId: "3",
    ownerAvatar: 'TB',
    rating: 4.9,
    students: 856,
    duration: '8 tuần',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80',
    tags: ['Thiết kế', 'UI/UX'],
    status: 'approved',
    visibility: 'public',
    lessons: 32,
    enrolledUsers: [2, 4],
    createdAt: '2024-01-20',
    updatedAt: '2024-01-25'
  },
  {
    id: "3",
    title: 'Data Science với Python',
    description: 'Phân tích dữ liệu và machine learning với Python, Pandas, NumPy',
    overview: `## Bạn sẽ học được gì?

- Làm chủ Python cho Data Science
- Phân tích và xử lý dữ liệu với Pandas, NumPy
- Trực quan hóa dữ liệu với Matplotlib, Seaborn
- Xây dựng mô hình Machine Learning cơ bản
- Làm việc với dữ liệu lớn (Big Data)
- Áp dụng thống kê vào phân tích dữ liệu
- Hoàn thành các dự án Data Science thực tế

## Yêu cầu

- Kiến thức lập trình Python cơ bản
- Hiểu biết về toán học cấp 3 (đại số, thống kê)
- Máy tính có cấu hình từ trung bình trở lên
- Sẵn sàng học tập và thực hành nhiều`,
    ownerName: 'Nguyễn Văn A',
    ownerId: "2",
    ownerAvatar: 'NA',
    rating: 4.7,
    students: 2341,
    duration: '16 tuần',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    tags: ['Data Science', 'Python', 'Lập trình'],
    status: 'pending',
    visibility: 'public',
    lessons: 58,
    enrolledUsers: [],
    createdAt: '2024-02-01',
    updatedAt: '2024-02-01'
  },
  {
    id: "4",
    title: 'Digital Marketing thực chiến',
    description: 'Chiến lược marketing online hiệu quả cho doanh nghiệp',
    overview: `## Bạn sẽ học được gì?

- Xây dựng chiến lược Digital Marketing tổng thể
- Chạy quảng cáo Facebook Ads, Google Ads hiệu quả
- SEO và Content Marketing bài bản
- Email Marketing và Marketing Automation
- Phân tích dữ liệu với Google Analytics
- Social Media Marketing trên các nền tảng
- Tạo funnel bán hàng và tối ưu conversion

## Yêu cầu

- Không cần kinh nghiệm marketing trước đó
- Có tài khoản Facebook, Google
- Hiểu biết cơ bản về internet và mạng xã hội
- Đam mê kinh doanh và marketing`,
    ownerName: 'Trần Thị B',
    ownerId: "3",
    ownerAvatar: 'TB',
    rating: 4.6,
    students: 567,
    duration: '6 tuần',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
    tags: ['Marketing', 'Kinh doanh'],
    status: 'approved',
    visibility: 'public',
    lessons: 28,
    enrolledUsers: [2, 4],
    createdAt: '2024-01-25',
    updatedAt: '2024-02-01'
  },
  {
    id: "5",
    title: 'Node.js Backend Development',
    description: 'Xây dựng RESTful API và ứng dụng backend với Node.js và Express',
    ownerName: 'Nguyễn Văn A',
    ownerId: "2",
    ownerAvatar: 'NA',
    rating: 4.7,
    students: 892,
    duration: '10 tuần',
    image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&q=80',
    tags: ['JavaScript', 'Web Development', 'Lập trình'],
    status: 'approved',
    visibility: 'public',
    lessons: 42,
    enrolledUsers: [3, 4],
    createdAt: '2024-01-18',
    updatedAt: '2024-01-22'
  },
  {
    id: "6",
    title: 'Mobile App với React Native',
    description: 'Phát triển ứng dụng di động đa nền tảng với React Native',
    ownerName: 'Nguyễn Văn A',
    ownerId: "2",
    ownerAvatar: 'NA',
    rating: 4.5,
    students: 645,
    duration: '14 tuần',
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80',
    tags: ['Mobile', 'JavaScript', 'Lập trình'],
    status: 'pending',
    visibility: 'public',
    lessons: 52,
    enrolledUsers: [],
    createdAt: '2024-02-05',
    updatedAt: '2024-02-05'
  },
  {
    id: "7",
    title: 'Python cho người mới bắt đầu',
    description: 'Học Python từ con số 0, phù hợp cho người chưa biết lập trình',
    overview: `## Bạn sẽ học được gì?

- Nắm vững cú pháp và cấu trúc cơ bản của Python
- Làm việc với biến, kiểu dữ liệu, toán tử
- Sử dụng vòng lặp, điều kiện, hàm
- Lập trình hướng đối tượng (OOP) với Python
- Xử lý file và exception
- Làm việc với thư viện chuẩn của Python
- Xây dựng các chương trình Python thực tế

## Yêu cầu

- KHÔNG cần kinh nghiệm lập trình
- Máy tính cá nhân (Windows, Mac hoặc Linux)
- Khả năng đọc tiếng Anh cơ bản
- Tinh thần học hỏi và kiên trì`,
    ownerName: 'Trần Thị B',
    ownerId: "3",
    ownerAvatar: 'TB',
    rating: 4.8,
    students: 1567,
    duration: '8 tuần',
    image: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&q=80',
    tags: ['Python', 'Lập trình'],
    status: 'approved',
    visibility: 'public',
    lessons: 36,
    enrolledUsers: [2, 3, 4],
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15'
  },
  {
    id: "8",
    title: 'AWS Cloud Computing cơ bản',
    description: 'Triển khai ứng dụng lên AWS với EC2, S3, RDS',
    ownerName: 'Nguyễn Văn A',
    ownerId: "2",
    ownerAvatar: 'NA',
    rating: 4.6,
    students: 423,
    duration: '6 tuần',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
    tags: ['DevOps', 'Web Development'],
    status: 'approved',
    visibility: 'public',
    lessons: 24,
    enrolledUsers: [3],
    createdAt: '2024-01-28',
    updatedAt: '2024-02-02'
  },
  {
    id: "9",
    title: 'Khóa học Private Demo',
    description: 'Đây là khóa học riêng tư để test chức năng private course',
    ownerName: 'Nguyễn Văn A',
    ownerId: "2",
    ownerAvatar: 'NA',
    rating: 0,
    students: 2,
    duration: '4 tuần',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80',
    tags: ['Web Development'],
    status: 'approved',
    visibility: 'private',
    lessons: 15,
    enrolledUsers: [3, 4],
    createdAt: '2024-02-03',
    updatedAt: '2024-02-03'
  },
  {
    id: "10",
    title: 'Machine Learning với TensorFlow',
    description: 'Xây dựng mô hình ML với TensorFlow và Keras',
    ownerName: 'Trần Thị B',
    ownerId: "3",
    ownerAvatar: 'TB',
    rating: 4.9,
    students: 834,
    duration: '12 tuần',
    image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&q=80',
    tags: ['Data Science', 'Python', 'Lập trình'],
    status: 'rejected',
    visibility: 'public',
    lessons: 48,
    enrolledUsers: [],
    createdAt: '2024-02-06',
    updatedAt: '2024-02-07'
  },
  {
    id: "11",
    title: 'Photoshop cho Designer',
    description: 'Làm chủ Adobe Photoshop từ cơ bản đến nâng cao',
    ownerName: 'Trần Thị B',
    ownerId: "3",
    ownerAvatar: 'TB',
    rating: 4.7,
    students: 932,
    duration: '10 tuần',
    image: 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=800&q=80',
    tags: ['Thiết kế', 'Đồ họa'],
    status: 'approved',
    visibility: 'public',
    lessons: 38,
    enrolledUsers: [2],
    createdAt: '2024-01-12',
    updatedAt: '2024-01-17'
  },
  {
    id: "12",
    title: 'Excel nâng cao cho doanh nghiệp',
    description: 'Làm việc hiệu quả với Excel, pivot table, macro và VBA',
    ownerName: 'Nguyễn Văn A',
    ownerId: "2",
    ownerAvatar: 'NA',
    rating: 4.6,
    students: 1245,
    duration: '6 tuần',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
    tags: ['Văn phòng', 'Kinh doanh'],
    status: 'approved',
    visibility: 'public',
    lessons: 30,
    enrolledUsers: [3, 4],
    createdAt: '2024-01-22',
    updatedAt: '2024-01-27'
  },
  {
    id: "13",
    title: 'SQL và Database Design',
    description: 'Thiết kế cơ sở dữ liệu và viết truy vấn SQL hiệu quả',
    ownerName: 'Nguyễn Văn A',
    ownerId: "2",
    ownerAvatar: 'NA',
    rating: 4.8,
    students: 756,
    duration: '8 tuần',
    image: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&q=80',
    tags: ['Database', 'Lập trình'],
    status: 'approved',
    visibility: 'public',
    lessons: 34,
    enrolledUsers: [2, 3],
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20'
  },
  {
    id: "14",
    title: 'Quay dựng video với Premiere Pro',
    description: 'Biên tập video chuyên nghiệp cho YouTube và TikTok',
    ownerName: 'Trần Thị B',
    ownerId: "3",
    ownerAvatar: 'TB',
    rating: 4.7,
    students: 623,
    duration: '7 tuần',
    image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&q=80',
    tags: ['Video', 'Thiết kế'],
    status: 'approved',
    visibility: 'public',
    lessons: 29,
    enrolledUsers: [4],
    createdAt: '2024-01-30',
    updatedAt: '2024-02-04'
  },
  {
    id: "15",
    title: 'Tiếng Anh giao tiếp cơ bản',
    description: 'Nâng cao kỹ năng giao tiếp tiếng Anh trong công việc',
    ownerName: 'Trần Thị B',
    ownerId: "3",
    ownerAvatar: 'TB',
    rating: 4.5,
    students: 1892,
    duration: '12 tuần',
    image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&q=80',
    tags: ['Ngôn ngữ', 'Kỹ năng mềm'],
    status: 'approved',
    visibility: 'public',
    lessons: 48,
    enrolledUsers: [2, 3, 4],
    createdAt: '2024-01-08',
    updatedAt: '2024-01-13'
  },
  {
    id: "16",
    title: 'Docker và Kubernetes thực chiến',
    description: 'Container hóa và quản lý ứng dụng với Docker và K8s',
    ownerName: 'Nguyễn Văn A',
    ownerId: "2",
    ownerAvatar: 'NA',
    rating: 4.9,
    students: 512,
    duration: '10 tuần',
    image: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=800&q=80',
    tags: ['DevOps', 'Web Development'],
    status: 'approved',
    visibility: 'public',
    lessons: 40,
    enrolledUsers: [3],
    createdAt: '2024-02-02',
    updatedAt: '2024-02-07'
  },
  {
    id: "17",
    title: 'Blockchain và Cryptocurrency',
    description: 'Hiểu về công nghệ blockchain và đầu tư crypto an toàn',
    ownerName: 'Nguyễn Văn A',
    ownerId: "2",
    ownerAvatar: 'NA',
    rating: 4.4,
    students: 378,
    duration: '5 tuần',
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80',
    tags: ['Công nghệ', 'Tài chính'],
    status: 'approved',
    visibility: 'public',
    lessons: 20,
    enrolledUsers: [2],
    createdAt: '2024-02-08',
    updatedAt: '2024-02-10'
  },
  {
    id: "18",
    title: 'Lập trình game với Unity',
    description: 'Tạo game 2D và 3D với Unity Engine',
    ownerName: 'Trần Thị B',
    ownerId: "3",
    ownerAvatar: 'TB',
    rating: 4.6,
    students: 689,
    duration: '14 tuần',
    image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&q=80',
    tags: ['Game', 'Lập trình'],
    status: 'approved',
    visibility: 'public',
    lessons: 56,
    enrolledUsers: [2, 4],
    createdAt: '2024-01-18',
    updatedAt: '2024-01-23'
  },
  {
    id: "19",
    title: 'Cyber Security cơ bản',
    description: 'Bảo mật mạng và ứng dụng, phòng chống tấn công',
    ownerName: 'Nguyễn Văn A',
    ownerId: "2",
    ownerAvatar: 'NA',
    rating: 4.8,
    students: 445,
    duration: '9 tuần',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80',
    tags: ['Security', 'Công nghệ'],
    status: 'approved',
    visibility: 'public',
    lessons: 36,
    enrolledUsers: [3, 4],
    createdAt: '2024-01-25',
    updatedAt: '2024-01-30'
  },
  {
    id: "20",
    title: 'Illustration và Drawing kỹ thuật số',
    description: 'Vẽ minh họa chuyên nghiệp với Procreate và iPad',
    ownerName: 'Trần Thị B',
    ownerId: "3",
    ownerAvatar: 'TB',
    rating: 4.7,
    students: 534,
    duration: '8 tuần',
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80',
    tags: ['Thiết kế', 'Nghệ thuật'],
    status: 'approved',
    visibility: 'public',
    lessons: 32,
    enrolledUsers: [2, 3],
    createdAt: '2024-02-01',
    updatedAt: '2024-02-05'
  },
  {
    id: "21",
    title: 'Content Writing và SEO',
    description: 'Viết content chuẩn SEO, thu hút traffic tự nhiên',
    ownerName: 'Trần Thị B',
    ownerId: "3",
    ownerAvatar: 'TB',
    rating: 4.5,
    students: 721,
    duration: '6 tuần',
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80',
    tags: ['Marketing', 'Kỹ năng mềm'],
    status: 'approved',
    visibility: 'public',
    lessons: 24,
    enrolledUsers: [4],
    createdAt: '2024-01-20',
    updatedAt: '2024-01-25'
  },
  {
    id: "22",
    title: 'Flutter - Mobile App Development',
    description: 'Xây dựng app đa nền tảng với Flutter và Dart',
    ownerName: 'Nguyễn Văn A',
    ownerId: "2",
    ownerAvatar: 'NA',
    rating: 4.6,
    students: 598,
    duration: '12 tuần',
    image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&q=80',
    tags: ['Mobile', 'Lập trình'],
    status: 'approved',
    visibility: 'public',
    lessons: 50,
    enrolledUsers: [2, 3],
    createdAt: '2024-02-03',
    updatedAt: '2024-02-08'
  }
];
