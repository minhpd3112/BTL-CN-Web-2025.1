import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { CourseCard } from '../../components/shared/CourseCard';
import { mockCourses, mockTags } from '../../data';
import { Course, Page } from '../../types';

interface ExplorePageProps {
  navigateTo: (page: Page) => void;
  setSelectedCourse: (course: Course) => void;
  currentUser: any;
}

export function ExplorePage({ navigateTo, setSelectedCourse, currentUser }: ExplorePageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');

  // Get unique tags from courses
  const allTags = ['all', ...Array.from(new Set(mockCourses.flatMap(c => c.tags)))];
  
  // Chá»‰ hiá»ƒn thá»‹ khÃ³a public Ä‘Ã£ approved
  const availableCourses = mockCourses.filter(c => c.visibility === 'public' && c.status === 'approved');
  
  const filteredCourses = availableCourses.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         c.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === 'all' || c.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="mb-8">KhÃ¡m phÃ¡ khÃ³a há»c</h1>
      
      {/* Search and Filter */}
      <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="TÃ¬m kiáº¿m khÃ³a há»c..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedTag} onValueChange={setSelectedTag}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Chá»§ Ä‘á»" />
            </SelectTrigger>
            <SelectContent>
              {allTags.map(tag => (
                <SelectItem key={tag} value={tag}>
                  {tag === 'all' ? 'Táº¥t cáº£' : tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          TÃ¬m tháº¥y {filteredCourses.length} khÃ³a há»c
        </div>
      </div>

      {/* Course Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(course => (
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
      ) : (
        <div className="text-center py-16">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="mb-2">KhÃ´ng tÃ¬m tháº¥y khÃ³a há»c</h3>
          <p className="text-gray-600">Thá»­ tÃ¬m kiáº¿m vá»›i tá»« khÃ³a khÃ¡c hoáº·c thay Ä‘á»•i bá»™ lá»c</p>
        </div>
      )}
    </div>
  );
}

