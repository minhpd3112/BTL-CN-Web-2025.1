import { Enrollment } from '../types';

export const mockEnrollments: Enrollment[] = [
  {
    id: 1,
    userId: 3,
    courseId: 1,
    enrolledAt: '2024-01-20',
    progress: 65,
    completedLessons: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    lastAccessAt: '2025-01-13'
  },
  {
    id: 2,
    userId: 2,
    courseId: 2,
    enrolledAt: '2024-01-22',
    progress: 45,
    completedLessons: [1, 2, 3, 4, 5],
    lastAccessAt: '2025-01-12'
  },
  {
    id: 3,
    userId: 4,
    courseId: 2,
    enrolledAt: '2024-01-25',
    progress: 30,
    completedLessons: [1, 2, 3],
    lastAccessAt: '2025-01-11'
  },
  {
    id: 4,
    userId: 2,
    courseId: 4,
    enrolledAt: '2024-01-28',
    progress: 80,
    completedLessons: [1, 2, 3, 4, 5, 6, 7, 8],
    lastAccessAt: '2025-01-13'
  },
  {
    id: 5,
    userId: 4,
    courseId: 4,
    enrolledAt: '2024-02-01',
    progress: 20,
    completedLessons: [1, 2],
    lastAccessAt: '2025-01-10'
  },
  {
    id: 6,
    userId: 3,
    courseId: 5,
    enrolledAt: '2024-01-22',
    progress: 55,
    completedLessons: [1, 2, 3, 4, 5, 6],
    lastAccessAt: '2025-01-12'
  },
  {
    id: 7,
    userId: 4,
    courseId: 5,
    enrolledAt: '2024-01-30',
    progress: 15,
    completedLessons: [1],
    lastAccessAt: '2025-01-09'
  },
  {
    id: 8,
    userId: 2,
    courseId: 7,
    enrolledAt: '2024-01-12',
    progress: 90,
    completedLessons: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    lastAccessAt: '2025-01-13'
  },
  {
    id: 9,
    userId: 3,
    courseId: 7,
    enrolledAt: '2024-01-15',
    progress: 70,
    completedLessons: [1, 2, 3, 4, 5, 6, 7],
    lastAccessAt: '2025-01-12'
  },
  {
    id: 10,
    userId: 4,
    courseId: 7,
    enrolledAt: '2024-01-18',
    progress: 40,
    completedLessons: [1, 2, 3, 4],
    lastAccessAt: '2025-01-11'
  },
  {
    id: 11,
    userId: 3,
    courseId: 8,
    enrolledAt: '2024-02-01',
    progress: 25,
    completedLessons: [1, 2],
    lastAccessAt: '2025-01-10'
  },
  {
    id: 12,
    userId: 3,
    courseId: 9,
    enrolledAt: '2024-02-04',
    progress: 60,
    completedLessons: [1, 2, 3, 4, 5],
    lastAccessAt: '2025-01-12'
  },
  {
    id: 13,
    userId: 4,
    courseId: 9,
    enrolledAt: '2024-02-05',
    progress: 30,
    completedLessons: [1, 2, 3],
    lastAccessAt: '2025-01-11'
  }
];
