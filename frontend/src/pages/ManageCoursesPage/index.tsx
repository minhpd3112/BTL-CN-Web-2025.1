import { useState } from 'react';
import { Search, Eye, Trash2, Globe, Lock, Users, Star, BookOpen, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { mockCourses, mockTags } from '@/services/mocks';
import { Course, Page } from '@/types';

interface ManageCoursesPageProps {
  navigateTo: (page: Page) => void;
  setSelectedCourse: (course: Course) => void;
}

export function ManageCoursesPage({ navigateTo, setSelectedCourse }: ManageCoursesPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisibility, setFilterVisibility] = useState<'all' | 'public' | 'private'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  // Filter courses
  const filteredCourses = mockCourses.filter(course => {
    const matchSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        course.ownerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchVisibility = filterVisibility === 'all' || course.visibility === filterVisibility;
    const matchStatus = filterStatus === 'all' || course.status === filterStatus;
    const matchTag = filterTag === 'all' || (course.tags && course.tags.includes(filterTag));
    return matchSearch && matchVisibility && matchStatus && matchTag;
  });

  // Stats
  const stats = {
    total: mockCourses.length,
    public: mockCourses.filter(c => c.visibility === 'public').length,
    private: mockCourses.filter(c => c.visibility === 'private').length,
    pending: mockCourses.filter(c => c.status === 'pending').length,
  };

  const handleDeleteCourse = () => {
    if (courseToDelete) {
      toast.success(`Đã xóa khóa học "${courseToDelete.title}"`);
      setShowDeleteDialog(false);
      setCourseToDelete(null);
    }
  };

  const CourseRowCard = ({ course }: { course: Course }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          <img src={course.image} alt={course.title} className="w-full md:w-48 h-32 object-cover" />
          <div className="flex-1 p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg">{course.title}</h3>
                  <Badge variant={course.visibility === 'public' ? 'default' : 'secondary'}>
                    {course.visibility === 'public' ? (
                      <><Globe className="w-3 h-3 mr-1" />Công khai</>
                    ) : (
                      <><Lock className="w-3 h-3 mr-1" />Riêng tư</>
                    )}
                  </Badge>
                  <Badge className={
                    course.status === 'pending' ? 'bg-orange-500' :
                    course.status === 'approved' ? 'bg-green-500' : 'bg-red-500'
                  }>
                    {course.status === 'pending' ? 'Chờ duyệt' :
                     course.status === 'approved' ? 'Đã duyệt' : 'Từ chối'}
                  </Badge>
                </div>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{course.description}</p>
                <div className="flex items-center gap-2 mb-3">
                  {course.tags.slice(0, 3).map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-xs bg-[#1E88E5] text-white">{course.ownerAvatar}</AvatarFallback>
                    </Avatar>
                    <span>{course.ownerName}</span>
                  </div>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {course.students}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    {course.rating}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {course.lessons} mục
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2 ml-4">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    setSelectedCourse(course);
                    navigateTo('course-detail');
                  }}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Xem
                </Button>
                <Button 
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    setCourseToDelete(course);
                    setShowDeleteDialog(true);
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Xóa
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        onClick={() => navigateTo('admin-dashboard')}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Quay về Dashboard
      </Button>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <BookOpen className="w-8 h-8 text-[#1E88E5]" />
          <h1 
            style={{
              fontSize: '2rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #1E88E5 0%, #1565C0 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Quản lý khóa học
          </h1>
        </div>
        <p className="text-gray-600 ml-11">Xem và quản lý tất cả khóa học trong hệ thống</p>
        <div className="ml-11 w-24 h-1 bg-gradient-to-r from-[#1E88E5] to-transparent rounded-full mt-2"></div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl text-[#1E88E5] mb-2">{stats.total}</div>
            <div className="text-gray-600 text-sm">Tổng khóa học</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl text-green-600 mb-2">{stats.public}</div>
            <div className="text-gray-600 text-sm">Công khai</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl text-gray-600 mb-2">{stats.private}</div>
            <div className="text-gray-600 text-sm">Riêng tư</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl text-orange-500 mb-2">{stats.pending}</div>
            <div className="text-gray-600 text-sm">Chờ duyệt</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Tìm kiếm khóa học hoặc giảng viên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="md:col-span-1"
            />
            <Select value={filterVisibility} onValueChange={(val: 'all' | 'public' | 'private') => setFilterVisibility(val)}>
              <SelectTrigger>
                <SelectValue placeholder="Hiển thị" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="public">Công khai</SelectItem>
                <SelectItem value="private">Riêng tư</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={(val: 'all' | 'pending' | 'approved' | 'rejected') => setFilterStatus(val)}>
              <SelectTrigger>
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="pending">Chờ duyệt</SelectItem>
                <SelectItem value="approved">Đã duyệt</SelectItem>
                <SelectItem value="rejected">Từ chối</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterTag} onValueChange={(val: string) => setFilterTag(val)}>
              <SelectTrigger>
                <SelectValue placeholder="Chủ đề" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả chủ đề</SelectItem>
                {mockTags.map(tag => (
                  <SelectItem key={tag.id} value={tag.name}>
                    {tag.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-gray-600">
          Hiển thị {filteredCourses.length} / {mockCourses.length} khóa học
        </p>
      </div>

      {/* Course List */}
      <div className="space-y-4">
        {filteredCourses.length > 0 ? (
          filteredCourses.map(course => (
            <CourseRowCard key={course.id} course={course} />
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="mb-2">Không tìm thấy khóa học</h3>
              <p className="text-gray-600">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa khóa học</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa khóa học này không?
            </DialogDescription>
          </DialogHeader>
          {courseToDelete && (
            <div className="space-y-3">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium mb-1">{courseToDelete.title}</p>
                <p className="text-sm text-gray-600">Giảng viên: {courseToDelete.ownerName}</p>
                <p className="text-sm text-gray-600">Học viên: {courseToDelete.students}</p>
              </div>
              <Alert className="bg-red-50 border-red-200">
                <AlertDescription className="text-red-800 text-sm">
                  ⚠️ <strong>Cảnh báo:</strong> Hành động này không thể hoàn tác. Tất cả dữ liệu liên quan sẽ bị xóa vĩnh viễn.
                </AlertDescription>
              </Alert>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDeleteCourse}>
              <Trash2 className="w-4 h-4 mr-2" />
              Xác nhận xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
