import { useEffect, useState } from 'react';
import { coursesAPI } from '@/services/api';

interface CoursesQueryParams {
  searchQuery?: string;
  selectedTag?: string;
  sortBy?: string;
  page?: number;
  pageSize?: number;
}

export function useCoursesQuery({ searchQuery, selectedTag, sortBy, page, pageSize }: CoursesQueryParams) {
  const [courses, setCourses] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    // Build params object for API
    const params: any = {
      search: searchQuery,
      sort: sortBy,
      page,
      pageSize,
    };
    if (selectedTag && selectedTag !== 'all') {
      params.tag = selectedTag;
    }
    coursesAPI
      .getAllCourses(params)
      .then((res) => {
        setCourses(res.data || []);
        setTotal(res.total || 0);
        setError(null);
      })
      .catch((err) => {
        setError(err.message || 'Lỗi tải dữ liệu');
        setCourses([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [searchQuery, selectedTag, sortBy, page, pageSize]);

  return { courses, total, loading, error };
}
