import { Search, Plus, TrendingUp, BookOpen } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { CourseCard } from '../../components/shared/CourseCard';
import { mockCourses } from '../../data';
import { Course, User, Page } from '../../types';

interface HomePageProps {
  navigateTo: (page: Page) => void;
  setSelectedCourse: (course: Course) => void;
  currentUser: User | null;
}

export function HomePage({ navigateTo, setSelectedCourse, currentUser }: HomePageProps) {
  // Chá»‰ hiá»ƒn thá»‹ khÃ³a public Ä‘Ã£ approved
  const publicCourses = mockCourses.filter(c => c.visibility === 'public' && c.status === 'approved');

  return (
    <div>
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#1E88E5] to-[#1565C0] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            <h1 className="mb-6">Há»c táº­p khÃ´ng giá»›i háº¡n cÃ¹ng EduLearn</h1>
            <p className="text-xl mb-8 opacity-90">
              Táº¡o khÃ³a há»c cá»§a riÃªng báº¡n hoáº·c khÃ¡m phÃ¡ hÃ ng ngÃ n khÃ³a há»c cháº¥t lÆ°á»£ng cao tá»« cá»™ng Ä‘á»“ng.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-white text-[#1E88E5] hover:bg-gray-100" onClick={() => navigateTo('explore')}>
                <Search className="w-5 h-5 mr-2" />
                KhÃ¡m phÃ¡ khÃ³a há»c
              </Button>
              <Button size="lg" className="bg-white text-[#1E88E5] hover:bg-gray-100" onClick={() => navigateTo('create-course')}>
                <Plus className="w-5 h-5 mr-2" />
                Táº¡o khÃ³a há»c
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Courses */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2>KhÃ³a há»c ná»•i báº­t</h2>
          <Button variant="ghost" className="text-[#1E88E5]" onClick={() => navigateTo('explore')}>
            Xem táº¥t cáº£
            <TrendingUp className="w-4 h-4 ml-2" />
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publicCourses.slice(0, 6).map(course => (
            <CourseCard 
              key={course.id} 
              course={course} 
              onClick={() => {
                setSelectedCourse(course);
                navigateTo('course-detail');
              }} 
            />
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="mb-8">KhÃ¡m phÃ¡ theo chá»§ Ä‘á»</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Láº­p trÃ¬nh', 'Thiáº¿t káº¿', 'Data Science', 'Marketing', 'Kinh doanh', 'Python', 'UI/UX', 'Mobile'].map(category => (
              <Card key={category} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <BookOpen className="w-8 h-8 text-[#1E88E5] mx-auto mb-3" />
                  <div>{category}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

