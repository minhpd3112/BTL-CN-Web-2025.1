import { useState } from 'react';
import { Search, Eye, Trash2, Globe, Lock, Users, Star, BookOpen } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { toast } from 'sonner@2.0.3';
import { mockCourses, mockTags } from '../../data';
import { Course, Page } from '../../types';

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
      toast.success(`ÄÃ£ xÃ³a khÃ³a há»c "${courseToDelete.title}"`);
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
                      <><Globe className="w-3 h-3 mr-1" />CÃ´ng khai</>
                    ) : (
                      <><Lock className="w-3 h-3 mr-1" />RiÃªng tÆ°</>
                    )}
                  </Badge>
                  <Badge className={
                    course.status === 'pending' ? 'bg-orange-500' :
                    course.status === 'approved' ? 'bg-green-500' : 'bg-red-500'
                  }>
                    {course.status === 'pending' ? 'Chá» duyá»‡t' :
                     course.status === 'approved' ? 'ÄÃ£ duyá»‡t' : 'Tá»« chá»‘i'}
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
                    {course.lessons} má»¥c
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
                  XÃ³a
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
      <div className="mb-8">
        <h1 className="mb-2">Quáº£n lÃ½ khÃ³a há»c</h1>
        <p className="text-gray-600">Xem vÃ  quáº£n lÃ½ táº¥t cáº£ khÃ³a há»c trong há»‡ thá»‘ng</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl text-[#1E88E5] mb-2">{stats.total}</div>
            <div className="text-gray-600 text-sm">Tá»•ng khÃ³a há»c</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl text-green-600 mb-2">{stats.public}</div>
            <div className="text-gray-600 text-sm">CÃ´ng khai</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl text-gray-600 mb-2">{stats.private}</div>
            <div className="text-gray-600 text-sm">RiÃªng tÆ°</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl text-orange-500 mb-2">{stats.pending}</div>
            <div className="text-gray-600 text-sm">Chá» duyá»‡t</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="TÃ¬m kiáº¿m khÃ³a há»c hoáº·c giáº£ng viÃªn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="md:col-span-1"
            />
            <Select value={filterVisibility} onValueChange={(val: 'all' | 'public' | 'private') => setFilterVisibility(val)}>
              <SelectTrigger>
                <SelectValue placeholder="Hiá»ƒn thá»‹" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Táº¥t cáº£</SelectItem>
                <SelectItem value="public">CÃ´ng khai</SelectItem>
                <SelectItem value="private">RiÃªng tÆ°</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={(val: 'all' | 'pending' | 'approved' | 'rejected') => setFilterStatus(val)}>
              <SelectTrigger>
                <SelectValue placeholder="Tráº¡ng thÃ¡i" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Táº¥t cáº£ tráº¡ng thÃ¡i</SelectItem>
                <SelectItem value="pending">Chá» duyá»‡t</SelectItem>
                <SelectItem value="approved">ÄÃ£ duyá»‡t</SelectItem>
                <SelectItem value="rejected">Tá»« chá»‘i</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterTag} onValueChange={(val: string) => setFilterTag(val)}>
              <SelectTrigger>
                <SelectValue placeholder="Chá»§ Ä‘á»" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Táº¥t cáº£ chá»§ Ä‘á»</SelectItem>
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
          Hiá»ƒn thá»‹ {filteredCourses.length} / {mockCourses.length} khÃ³a há»c
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
              <h3 className="mb-2">KhÃ´ng tÃ¬m tháº¥y khÃ³a há»c</h3>
              <p className="text-gray-600">Thá»­ thay Ä‘á»•i bá»™ lá»c hoáº·c tá»« khÃ³a tÃ¬m kiáº¿m</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>XÃ¡c nháº­n xÃ³a khÃ³a há»c</DialogTitle>
            <DialogDescription>
              Báº¡n cÃ³ cháº¯c cháº¯n muá»‘n xÃ³a khÃ³a há»c nÃ y khÃ´ng?
            </DialogDescription>
          </DialogHeader>
          {courseToDelete && (
            <div className="space-y-3">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium mb-1">{courseToDelete.title}</p>
                <p className="text-sm text-gray-600">Giáº£ng viÃªn: {courseToDelete.ownerName}</p>
                <p className="text-sm text-gray-600">Há»c viÃªn: {courseToDelete.students}</p>
              </div>
              <Alert className="bg-red-50 border-red-200">
                <AlertDescription className="text-red-800 text-sm">
                  âš ï¸ <strong>Cáº£nh bÃ¡o:</strong> HÃ nh Ä‘á»™ng nÃ y khÃ´ng thá»ƒ hoÃ n tÃ¡c. Táº¥t cáº£ dá»¯ liá»‡u liÃªn quan sáº½ bá»‹ xÃ³a vÄ©nh viá»…n.
                </AlertDescription>
              </Alert>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Há»§y
            </Button>
            <Button variant="destructive" onClick={handleDeleteCourse}>
              <Trash2 className="w-4 h-4 mr-2" />
              XÃ¡c nháº­n xÃ³a
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

