import { Enrollment, EnrollmentRequest } from '@/types';

// Mock enrollment requests (pending, approved, rejected)
export const mockEnrollmentRequests: EnrollmentRequest[] = [
  {
    id: "101",
    courseId: "1",
    userId: "5",
    userName: 'Hoàng Văn E',
    userAvatar: 'HE',
    userEmail: 'hoangvane@gmail.com',
    status: 'pending',
    message: 'Xin chào, tôi rất muốn học khóa React của thầy. Tôi đã có kiến thức JavaScript cơ bản.',
    requestedAt: '2025-01-14 10:30',
    respondedAt: null
  },
  {
    id: "102",
    courseId: "1",
    userId: "6",
    userName: 'Phạm Thị F',
    userAvatar: 'PF',
    userEmail: 'phamthif@gmail.com',
    status: 'pending',
    message: 'Em là sinh viên năm 3 ngành CNTT, rất mong được học khóa học này để nâng cao kỹ năng.',
    requestedAt: '2025-01-14 14:20',
    respondedAt: null
  },
  {
    id: "103",
    courseId: "2",
    userId: "5",
    userName: 'Hoàng Văn E',
    userAvatar: 'HE',
    userEmail: 'hoangvane@gmail.com',
    status: 'approved',
    message: 'Tôi muốn học thiết kế UI/UX để chuyển sang lĩnh vực này.',
    requestedAt: '2025-01-13 09:15',
    respondedAt: '2025-01-13 16:30'
  },
  {
    id: "104",
    courseId: "3",
    userId: "4",
    userName: 'Lê Văn D',
    userAvatar: 'LD',
    userEmail: 'levand@gmail.com',
    status: 'pending',
    message: 'Mong được tham gia khóa học Data Science. Tôi đã biết Python cơ bản.',
    requestedAt: '2025-01-14 11:45',
    respondedAt: null
  }
];

export const mockEnrollments: Enrollment[] = [
  {
    id: "1",
    userId: "3",
    courseId: "1",
    enrolledAt: '2024-01-20',
    progress: 65,
    completedLessons: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    lastAccessAt: '2025-01-13'
  },
  {
    id: "2",
    userId: "2",
    courseId: "2",
    enrolledAt: '2024-01-22',
    progress: 45,
    completedLessons: [1, 2, 3, 4, 5],
    lastAccessAt: '2025-01-12'
  },
  {
    id: "3",
    userId: "4",
    courseId: "2",
    enrolledAt: '2024-01-25',
    progress: 30,
    completedLessons: [1, 2, 3],
    lastAccessAt: '2025-01-11'
  },
  {
    id: "4",
    userId: "2",
    courseId: "4",
    enrolledAt: '2024-01-28',
    progress: 80,
    completedLessons: [1, 2, 3, 4, 5, 6, 7, 8],
    lastAccessAt: '2025-01-13'
  },
  {
    id: "5",
    userId: "4",
    courseId: "4",
    enrolledAt: '2024-02-01',
    progress: 20,
    completedLessons: [1, 2],
    lastAccessAt: '2025-01-10'
  },
  {
    id: "6",
    userId: "3",
    courseId: "5",
    enrolledAt: '2024-01-22',
    progress: 55,
    completedLessons: [1, 2, 3, 4, 5, 6],
    lastAccessAt: '2025-01-12'
  },
  {
    id: "7",
    userId: "4",
    courseId: "5",
    enrolledAt: '2024-01-30',
    progress: 15,
    completedLessons: [1],
    lastAccessAt: '2025-01-09'
  },
  {
    id: "8",
    userId: "2",
    courseId: "7",
    enrolledAt: '2024-01-12',
    progress: 90,
    completedLessons: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    lastAccessAt: '2025-01-13'
  },
  {
    id: "9",
    userId: "3",
    courseId: "7",
    enrolledAt: '2024-01-15',
    progress: 70,
    completedLessons: [1, 2, 3, 4, 5, 6, 7],
    lastAccessAt: '2025-01-12'
  },
  {
    id: "10",
    userId: "4",
    courseId: "7",
    enrolledAt: '2024-01-18',
    progress: 40,
    completedLessons: [1, 2, 3, 4],
    lastAccessAt: '2025-01-11'
  },
  {
    id: "11",
    userId: "3",
    courseId: "8",
    enrolledAt: '2024-02-01',
    progress: 25,
    completedLessons: [1, 2],
    lastAccessAt: '2025-01-10'
  },
  {
    id: "12",
    userId: "3",
    courseId: "9",
    enrolledAt: '2024-02-04',
    progress: 60,
    completedLessons: [1, 2, 3, 4, 5],
    lastAccessAt: '2025-01-12'
  },
  {
    id: "13",
    userId: "4",
    courseId: "9",
    enrolledAt: '2024-02-05',
    progress: 30,
    completedLessons: [1, 2, 3],
    lastAccessAt: '2025-01-11'
  }
];
