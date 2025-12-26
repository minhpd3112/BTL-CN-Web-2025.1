import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Edit, Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { sectionsAPI } from '@/services/api';
import { toast } from 'sonner';

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

interface Section {
    id: string;
    title: string;
    description: string;
    order_index: number;
    course_id: string;
    lessons: Lesson[];
}

interface SortableSectionProps {
    section: Section;
    editingSectionId: string | null;
    editSectionTitle: string;
    sections: Section[];
    setEditingSectionId: (id: string | null) => void;
    setEditSectionTitle: (title: string) => void;
    setSections: (sections: Section[]) => void;
    handleSaveSectionEdit: () => Promise<void>;
    onRenderLessons: (section: Section) => React.ReactNode;
}

export function SortableSection({
    section,
    editingSectionId,
    editSectionTitle,
    sections,
    setEditingSectionId,
    setEditSectionTitle,
    setSections,
    handleSaveSectionEdit,
    onRenderLessons,
}: SortableSectionProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: section.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="border-2 border-gray-200 rounded-lg overflow-hidden">
            {/* Section Header */}
            <div className="bg-gray-50 px-4 py-3 flex items-center justify-between group">
                <div className="flex items-center gap-2 flex-1">
                    {/* Drag Handle */}
                    <div
                        {...attributes}
                        {...listeners}
                        className="cursor-grab active:cursor-grabbing hover:bg-gray-200 p-1 rounded"
                    >
                        <GripVertical className="w-4 h-4 text-gray-400" />
                    </div>

                    {editingSectionId === section.id ? (
                        <div className="flex-1 flex items-center gap-2">
                            <Input
                                value={editSectionTitle}
                                onChange={(e) => setEditSectionTitle(e.target.value)}
                                onKeyDown={async (e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        await handleSaveSectionEdit();
                                    }
                                    if (e.key === 'Escape') {
                                        setEditingSectionId(null);
                                    }
                                }}
                                onBlur={handleSaveSectionEdit}
                                className="flex-1"
                                autoFocus
                            />
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleSaveSectionEdit}
                            >
                                <Check className="w-4 h-4 text-green-600" />
                            </Button>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center gap-2">
                            <h4 className="text-sm font-medium">{section.title}</h4>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingSectionId(section.id);
                                    setEditSectionTitle(section.title);
                                }}
                            >
                                <Edit className="w-3 h-3" />
                            </Button>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <Badge variant="secondary">{section.lessons.length} mục nhỏ</Badge>
                    <Button variant="ghost" size="icon" onClick={async (e) => {
                        e.stopPropagation();
                        try {
                            await sectionsAPI.delete(section.id);
                            setSections(sections.filter(s => s.id !== section.id));
                            toast.success('Đã xóa mục');
                        } catch (error) {
                            toast.error('Không thể xóa mục');
                        }
                    }}>
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Lessons in Section */}
            {onRenderLessons(section)}
        </div>
    );
}
