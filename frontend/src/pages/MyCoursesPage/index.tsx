import { Plus, Edit, BarChart3, Eye, BookOpen, Search, Lock, Globe } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Progress } from '../../components/ui/progress';
import { mockCourses, mockEnrollments } from '../../data';
import { Course, User, Page } from '../../types';

interface MyCoursesPageProps {
  navigateTo: (page: Page) => void;
  setSelectedCourse: (course: Course) => void;
  currentUser: User;
}

export function MyCoursesPage({ navigateTo, setSelectedCourse, currentUser }: MyCoursesPageProps) {
  // KhÃ³a há»c tÃ´i táº¡o
  const myCreatedCourses = mockCourses.filter(c => c.ownerId === currentUser.id);
  
  // KhÃ³a há»c Ä‘ang há»c - tá»« enrollments
  const myEnrollments = mockEnrollments.filter(e => e.userId === currentUser.id);
  const myEnrolledCourses = myEnrollments.map(enrollment => {
    const course = mockCourses.find(c => c.id === enrollment.courseId);
    if (!course) return null;
    return {
      ...course,
      progress: enrollment.progress,
      completedLessons: enrollment.completedLessons.length
    };
  }).filter(Boolean) as (Course & { progress: number; completedLessons: number })[];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="mb-2">KhÃ³a há»c cá»§a tÃ´i</h1>
        <p className="text-gray-600">Quáº£n lÃ½ vÃ  theo dÃµi khÃ³a há»c</p>
      </div>

      <Tabs defaultValue="created">
        <TabsList className="mb-6">
          <TabsTrigger value="created">
            KhÃ³a há»c tÃ´i táº¡o ({myCreatedCourses.length})
          </TabsTrigger>
          <TabsTrigger value="enrolled">
            Äang há»c ({myEnrolledCourses.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="created" className="space-y-6">
          {myCreatedCourses.length > 0 ? (
            <>
              {myCreatedCourses.map(course => (
                <Card key={course.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <img src={course.image} alt={course.title} className="w-full md:w-64 h-48 object-cover" />
                      <div className="flex-1 p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h3>{course.title}</h3>
                              {course.visibility === 'private' ? (
                                <Badge variant="secondary" className="gap-1">
                                  <Lock className="w-3 h-3" />
                                  RiÃªng tÆ°
                                </Badge>
                              ) : (
                                <Badge className="gap-1">
                                  <Globe className="w-3 h-3" />
                                  CÃ´ng khai
                                </Badge>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm mb-3">{course.description}</p>
                            <div className="flex gap-2">
                              {course.tags.slice(0, 3).map(tag => (
                                <Badge key={tag} variant="outline">{tag}</Badge>
                              ))}
                            </div>
                          </div>
                          {course.visibility === 'public' && (
                            <Badge variant={course.status === 'approved' ? 'default' : course.status === 'pending' ? 'secondary' : 'destructive'}>
                              {course.status === 'approved' ? 'ÄÃ£ duyá»‡t' : course.status === 'pending' ? 'Chá» duyá»‡t' : 'Tá»« chá»‘i'}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <Button size="sm" onClick={() => {
                            setSelectedCourse(course);
                            navigateTo('edit-course');
                          }}>
                            <Edit className="w-4 h-4 mr-2" />
                            Chá»‰nh sá»­a
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => {
                            setSelectedCourse(course);
                            navigateTo('course-dashboard');
                          }}>
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Dashboard
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => {
                            setSelectedCourse(course);
                            navigateTo('course-detail');
                          }}>
                            <Eye className="w-4 h-4 mr-2" />
                            Xem
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="mb-2">ChÆ°a cÃ³ khÃ³a há»c nÃ o</h3>
                <p className="text-gray-600 mb-6">Báº¯t Ä‘áº§u táº¡o khÃ³a há»c Ä‘áº§u tiÃªn cá»§a báº¡n</p>
                <Button onClick={() => navigateTo('create-course')} className="bg-[#1E88E5] text-white hover:bg-[#1565C0]">
                  <Plus className="w-4 h-4 mr-2" />
                  Táº¡o khÃ³a há»c má»›i
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="enrolled" className="space-y-6">
          {myEnrolledCourses.length > 0 ? (
            <>
              {myEnrolledCourses.map(course => (
                <Card key={course.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => {
                  setSelectedCourse(course);
                  navigateTo('learning');
                }}>
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <img src={course.image} alt={course.title} className="w-full md:w-64 h-48 object-cover" />
                      <div className="flex-1 p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="mb-2">{course.title}</h3>
                            <p className="text-gray-600 text-sm mb-3">Bá»Ÿi {course.ownerName}</p>
                            <div className="flex gap-2">
                              {course.tags.slice(0, 3).map(tag => (
                                <Badge key={tag} variant="secondary">{tag}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Tiáº¿n Ä‘á»™</span>
                            <span className="text-[#1E88E5]">{course.progress}%</span>
                          </div>
                          <Progress value={course.progress} className="h-2" />
                          <div className="text-sm text-gray-600">
                            {course.completedLessons}/{course.lessons} má»¥c nhá»
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="mb-2">ChÆ°a tham gia khÃ³a há»c nÃ o</h3>
                <p className="text-gray-600 mb-6">KhÃ¡m phÃ¡ vÃ  Ä‘Äƒng kÃ½ cÃ¡c khÃ³a há»c thÃº vá»‹</p>
                <Button onClick={() => navigateTo('explore')} variant="outline">
                  <Search className="w-4 h-4 mr-2" />
                  KhÃ¡m phÃ¡ khÃ³a há»c
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

