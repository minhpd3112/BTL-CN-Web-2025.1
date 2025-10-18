import { Tag } from '../types';

export const mockTags: Tag[] = [
  {
    id: 1,
    name: 'Lập trình',
    color: '#1E88E5',
    icon: 'code',
    courseCount: 15,
    description: 'Các khóa học về lập trình và phát triển phần mềm'
  },
  {
    id: 2,
    name: 'Thiết kế',
    color: '#E91E63',
    icon: 'palette',
    courseCount: 8,
    description: 'UI/UX, Graphic Design, và các khóa học thiết kế'
  },
  {
    id: 3,
    name: 'Marketing',
    color: '#FF9800',
    icon: 'megaphone',
    courseCount: 12,
    description: 'Digital Marketing, SEO, Social Media Marketing'
  },
  {
    id: 4,
    name: 'Python',
    color: '#4CAF50',
    icon: 'code',
    courseCount: 6,
    description: 'Lập trình Python từ cơ bản đến nâng cao'
  },
  {
    id: 5,
    name: 'JavaScript',
    color: '#FFC107',
    icon: 'code',
    courseCount: 9,
    description: 'JavaScript, React, Node.js, và các framework'
  },
  {
    id: 6,
    name: 'Data Science',
    color: '#9C27B0',
    icon: 'chart',
    courseCount: 5,
    description: 'Khoa học dữ liệu, Machine Learning, AI'
  },
  {
    id: 7,
    name: 'Kinh doanh',
    color: '#00BCD4',
    icon: 'briefcase',
    courseCount: 7,
    description: 'Quản trị kinh doanh, khởi nghiệp, chiến lược'
  },
  {
    id: 8,
    name: 'Ngoại ngữ',
    color: '#795548',
    icon: 'globe',
    courseCount: 10,
    description: 'Tiếng Anh, tiếng Nhật, và các ngôn ngữ khác'
  },
  {
    id: 9,
    name: 'Web Development',
    color: '#3F51B5',
    icon: 'code',
    courseCount: 11,
    description: 'HTML, CSS, JavaScript và các công nghệ web'
  },
  {
    id: 10,
    name: 'UI/UX',
    color: '#F06292',
    icon: 'palette',
    courseCount: 7,
    description: 'Thiết kế trải nghiệm và giao diện người dùng'
  },
  {
    id: 11,
    name: 'Mobile',
    color: '#26A69A',
    icon: 'smartphone',
    courseCount: 4,
    description: 'Phát triển ứng dụng di động iOS và Android'
  },
  {
    id: 12,
    name: 'DevOps',
    color: '#FF5722',
    icon: 'server',
    courseCount: 3,
    description: 'CI/CD, Docker, Kubernetes, Cloud Computing'
  }
];

export function getTagByName(name: string): Tag | undefined {
  return mockTags.find(tag => tag.name === name);
}

export function getTagColor(tagName: string): string {
  const tag = getTagByName(tagName);
  return tag?.color || '#6B7280';
}
