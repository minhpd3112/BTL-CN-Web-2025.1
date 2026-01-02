import { PlayCircle, CheckCircle, Lock, FileText, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/components/ui/utils';
import { useState } from 'react';

// Interfaces aligned with the data structure
interface Lesson {
    id: number;
    title: string;
    type: 'video' | 'pdf' | 'quiz';
    duration: string;
    isCompleted: boolean;
    isLocked: boolean;
}

interface Section {
    id: number;
    title: string;
    lessons: Lesson[];
}

interface CourseSidebarProps {
    sections: Section[];
    currentLessonId: number;
    onSelectLesson: (lessonId: number) => void;
    onToggleCompletion?: (lessonId: string) => void;
    className?: string;
    isOpen?: boolean;
}

export function CourseSidebar({
    sections,
    currentLessonId,
    onSelectLesson,
    onToggleCompletion,
    className
}: CourseSidebarProps) {
    // Determine which sections should be open by default (e.g., the one with the current lesson)
    // For simplicity, we can keep all open or manage state. Let's manage state.
    const [openSections, setOpenSections] = useState<number[]>(sections.map(s => s.id));

    const toggleSection = (id: number) => {
        setOpenSections(prev =>
            prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
        );
    };

    return (
        <div className={cn("flex flex-col h-full bg-white border-l border-gray-200 overflow-hidden", className)}>
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-[#1E88E5]/5 to-transparent sticky top-0 z-10">
                <h3
                    style={{
                        fontSize: '1rem',
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #1E88E5 0%, #1565C0 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}
                >
                    Nội dung khóa học
                </h3>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="flex flex-col pb-20"> {/* Extra padding for bottom */}
                    {sections.map((section) => (
                        <div key={section.id} className="border-b border-gray-100 last:border-0">
                            <button
                                onClick={() => toggleSection(section.id)}
                                className="w-full flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-100 transition-colors text-left"
                            >
                                <div className="flex-1">
                                    <h4 className="font-semibold text-sm text-gray-800">{section.title}</h4>
                                    <p className="text-xs text-gray-500 mt-1">{section.lessons.length} bài học</p>
                                </div>
                                {openSections.includes(section.id) ? (
                                    <ChevronUp className="w-4 h-4 text-gray-500" />
                                ) : (
                                    <ChevronDown className="w-4 h-4 text-gray-500" />
                                )}
                            </button>

                            {openSections.includes(section.id) && (
                                <div className="flex flex-col">
                                    {section.lessons.map((lesson) => {
                                        const isActive = lesson.id === currentLessonId;
                                        const Icon = lesson.type === 'video' ? PlayCircle : lesson.type === 'pdf' ? FileText : HelpCircle;

                                        return (
                                            <button
                                                key={lesson.id}
                                                onClick={() => !lesson.isLocked && onSelectLesson(lesson.id)}
                                                disabled={lesson.isLocked}
                                                className={cn(
                                                    "flex items-start gap-3 p-3 pl-4 transition-all relative text-left group",
                                                    isActive
                                                        ? "bg-[#1E88E5]/10"
                                                        : "hover:bg-gray-50 bg-white",
                                                    lesson.isLocked && "opacity-60 cursor-not-allowed bg-gray-50/30"
                                                )}
                                            >
                                                {/* Active Indicator Strip */}
                                                {isActive && (
                                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#1E88E5]" />
                                                )}

                                                <div
                                                    className="mt-0.5 flex-shrink-0 cursor-pointer"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onToggleCompletion?.(String(lesson.id));
                                                    }}
                                                >
                                                    {lesson.isCompleted ? (
                                                        <CheckCircle className="w-4 h-4 text-green-500 fill-green-100 hover:scale-110 transition-transform" />
                                                    ) : (
                                                        <Icon className={cn(
                                                            "w-4 h-4",
                                                            isActive ? "text-[#1E88E5]" : "text-gray-400 group-hover:text-gray-600"
                                                        )} />
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <p className={cn(
                                                        "text-sm font-medium line-clamp-2 mb-1",
                                                        isActive ? "text-[#1E88E5]" : "text-gray-700",
                                                        lesson.isCompleted && !isActive && "text-gray-500"
                                                    )}>
                                                        {lesson.title}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                                        {lesson.type === 'video' && <span>{lesson.duration}</span>}
                                                        {lesson.type === 'quiz' && <span>Trắc nghiệm</span>}
                                                        {lesson.type === 'pdf' && <span>Tài liệu</span>}
                                                        {lesson.isLocked && <Lock className="w-3 h-3 ml-1" />}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
