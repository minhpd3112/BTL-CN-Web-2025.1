import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Video, FileText, Award, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Lesson {
    id: string;
    title: string;
    description: string;
    content_type: 'video' | 'text' | 'pdf' | 'quiz' | 'article';
    duration?: number;
    content_url?: string;
    content_text?: string;
    section_id: string;
    order_index: number;
}

interface SortableLessonProps {
    lesson: Lesson;
    lessonIndex: number;
    onEdit: (lesson: Lesson, sectionId: string) => void;
    onDelete: (lessonId: string) => Promise<void>;
}

export function SortableLesson({ lesson, lessonIndex, onEdit, onDelete }: SortableLessonProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: lesson.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-start gap-3 p-3 bg-white border rounded-lg hover:border-[#1E88E5]/50 transition-colors group"
        >
            {/* Drag Handle */}
            <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing hover:bg-gray-100 p-1 rounded flex-shrink-0"
            >
                <GripVertical className="w-4 h-4 text-gray-400" />
            </div>

            {/* Lesson Number */}
            <div className="w-8 h-8 rounded bg-[#1E88E5]/10 flex items-center justify-center flex-shrink-0 text-sm text-[#1E88E5]">
                {lessonIndex + 1}
            </div>

            {/* Lesson Icon */}
            <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                {lesson.content_type === 'video' && <Video className="w-5 h-5 text-[#1E88E5]" />}
                {lesson.content_type === 'text' && <FileText className="w-5 h-5 text-green-600" />}
                {lesson.content_type === 'pdf' && <FileText className="w-5 h-5 text-red-600" />}
                {lesson.content_type === 'quiz' && <Award className="w-5 h-5 text-orange-600" />}
            </div>

            {/* Lesson Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 group/lesson">
                    <div className="text-sm mb-1 flex-1">{lesson.title}</div>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="opacity-0 group-hover/lesson:opacity-100 transition-opacity"
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(lesson, lesson.section_id);
                        }}
                    >
                        <Edit className="w-3 h-3" />
                    </Button>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>
                        {lesson.content_type === 'video' && '📹 Video'}
                        {lesson.content_type === 'text' && '📝 Bài viết'}
                        {lesson.content_type === 'pdf' && '📄 PDF'}
                        {lesson.content_type === 'quiz' && '✅ Quiz'}
                    </span>
                    <span>•</span>
                    <span>{lesson.duration ? `${lesson.duration} phút` : 'N/A'}</span>
                </div>
            </div>

            {/* Delete Button */}
            <Button
                variant="ghost"
                size="icon"
                className="flex-shrink-0"
                onClick={async (e) => {
                    e.stopPropagation();
                    await onDelete(lesson.id);
                }}
            >
                <Trash2 className="w-4 h-4" />
            </Button>
        </div>
    );
}
