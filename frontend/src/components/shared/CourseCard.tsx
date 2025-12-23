import { Star, Users, ArrowRight, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Course } from '@/types';
import { useState } from 'react';
import { supabase } from '@/services/api';

interface CourseCardProps {
  course: Course;
  onClick: () => void;
}

export function CourseCard({ course, onClick }: CourseCardProps) {
  // Ưu tiên lấy image_url, sau đó image
  let imageUrl = course.image_url || course.image;
  // Nếu là tên file hoặc path ngắn, build public URL từ bucket
  if (imageUrl && !/^https?:\/\//.test(imageUrl)) {
    imageUrl = supabase.storage.from('course-images').getPublicUrl(imageUrl).data.publicUrl || '/placeholder-course.jpg';
  }
  if (!imageUrl) imageUrl = '/placeholder-course.jpg';
  return (
    <>
      <style>{`
        @keyframes border-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div className="group relative h-full">
        {/* Animated Moving Light Border (Visible on Hover) */}
        <div className="absolute -inset-[2px] rounded-xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0_340deg,#1E88E5_360deg)] animate-[border-rotate_4s_linear_infinite]" />
        </div>

        {/* Static Blue Glow (Optional, adds depth) */}
        <div className="absolute -inset-[1px] rounded-xl bg-[#1E88E5]/20 opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300" />

        <Card
          className="relative z-10 h-full flex flex-col overflow-hidden cursor-pointer border-[#1E88E5]/30 bg-white shadow-sm hover:shadow-xl transition-all duration-300"
          onClick={onClick}
        >
          <div className="relative aspect-video overflow-hidden">
            <img
              src={imageUrl}
              alt={course.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

            {/* Christmas Ribbon */}
            <div className="absolute top-0 right-0 w-32 h-32 overflow-hidden z-20 pointer-events-none">
              <div className="absolute top-[28px] -right-[30px] w-[150px] bg-gradient-to-r from-[#D32F2F] to-[#C62828] text-white text-[10px] font-bold py-1.5 pl-4 text-center transform rotate-45 shadow-lg border-b border-[#B71C1C]">
                <span className="drop-shadow-md tracking-wider">XMAS 2025</span>
              </div>
            </div>


            {/* Play Icon Overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
              <div className="bg-white/30 backdrop-blur-md p-3 rounded-full shadow-lg">
                <Eye className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>

          <CardContent className="flex flex-col flex-grow p-5 gap-3">
            {/* Title */}
            <h3
              className="font-bold text-lg leading-snug line-clamp-2 group-hover:text-[#1E88E5] transition-colors duration-200"
              title={course.title}
            >
              {course.title}
            </h3>

            {/* Description */}
            <p className="text-gray-500 text-sm line-clamp-2 flex-grow">
              {course.description}
            </p>

            {/* Author */}
            <div className="flex items-center gap-2 mt-1">
              <Avatar className="w-6 h-6 border border-gray-100">
                <AvatarFallback className="text-[10px] bg-gradient-to-br from-[#1E88E5] to-[#1565C0] text-white">
                  {course.ownerAvatar}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-gray-500 font-medium truncate max-w-[150px]">{course.ownerName}</span>
            </div>

            {/* Footer */}
            <div className="mt-3 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 font-semibold text-gray-700">
                  {course.rating}
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                </span>
                <span className="flex items-center gap-1 text-gray-400 text-xs">
                  <Users className="w-3.5 h-3.5" />
                  {course.students}
                </span>
              </div>

              <div className="flex items-center gap-1 text-[#1E88E5] text-xs font-bold uppercase tracking-wide opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                Xem ngay
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
