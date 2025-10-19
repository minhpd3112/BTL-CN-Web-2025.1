import { Star, Users, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Course } from '@/types';
import { useState } from 'react';

interface CourseCardProps {
  course: Course;
  onClick: () => void;
}

export function CourseCard({ course, onClick }: CourseCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card 
      className="overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group" 
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        boxShadow: isHovered 
          ? '0 20px 40px rgba(30, 136, 229, 0.2), 0 10px 20px rgba(0, 0, 0, 0.1)' 
          : '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}
    >
      <CardContent className="p-0">
        <div className="relative overflow-hidden">
          <img 
            src={course.image} 
            alt={course.title} 
            className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110" 
          />
          {/* Overlay on hover */}
          <div 
            className={`absolute inset-0 bg-gradient-to-t from-[#1E88E5]/90 via-[#1E88E5]/50 to-transparent transition-opacity duration-300 flex items-end justify-center pb-4 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="text-white flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              <span>Xem chi tiết</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-3">
            {course.tags.slice(0, 2).map((tag: string) => (
              <Badge 
                key={tag} 
                variant="secondary" 
                className="text-xs transition-colors duration-300 group-hover:bg-[#1E88E5]/10 group-hover:text-[#1E88E5]"
              >
                {tag}
              </Badge>
            ))}
          </div>
          <h3 className="mb-2 line-clamp-2 transition-colors duration-300 group-hover:text-[#1E88E5]" style={{ fontWeight: 700 }}>
            {course.title}
          </h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
          <div className="flex items-center gap-2 mb-4">
            <Avatar className="w-6 h-6 transition-transform duration-300 group-hover:scale-110">
              <AvatarFallback className="text-xs bg-[#1E88E5] text-white">{course.ownerAvatar}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-gray-600" style={{ fontWeight: 600 }}>{course.ownerName}</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1 transition-transform duration-300 group-hover:scale-110">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              {course.rating}
            </span>
            <span className="flex items-center gap-1 transition-transform duration-300 group-hover:scale-110">
              <Users className="w-4 h-4" />
              {course.students}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
