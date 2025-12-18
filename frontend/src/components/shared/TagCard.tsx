import { Edit, Trash2, Tag, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface TagData {
    id: number;
    name: string;
    description: string;
    courseCount: number;
    image?: string;
}

interface TagCardProps {
    tag: TagData;
    onClick: (tag: TagData) => void;
    onEdit: (tag: TagData) => void;
    onDelete: (tag: TagData) => void;
}

export function TagCard({ tag, onClick, onEdit, onDelete }: TagCardProps) {
    return (
        <Card
            className="group hover:shadow-lg transition-all duration-300 border-gray-200 overflow-hidden flex flex-col cursor-pointer bg-white"
            onClick={() => onClick(tag)}
        >
            {/* Cover Image Area */}
            <div className="h-40 bg-gray-100 relative overflow-hidden">
                {tag.image ? (
                    <img
                        src={tag.image}
                        alt={tag.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                        <ImageIcon className="w-12 h-12 mb-2 opacity-20" />
                        <span className="text-xs uppercase tracking-wide opacity-50">No Cover Image</span>
                    </div>
                )}
            </div>

            <CardContent className="p-5 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-2 gap-4">
                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-[#1E88E5] transition-colors flex-1">{tag.name}</h3>

                    {/* Actions Inline */}
                    <div className="flex gap-2 shrink-0">
                        <Button
                            size="sm"
                            className="h-8 w-max px-3 bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 shadow-sm transition-all"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(tag);
                            }}
                            title="Chỉnh sửa"
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            Chỉnh sửa
                        </Button>
                        <Button
                            size="sm"
                            className="h-8 w-max px-3 bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 shadow-sm transition-all"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(tag);
                            }}
                            title="Xóa"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Xóa
                        </Button>
                    </div>
                </div>

                <p className="text-sm text-gray-600 line-clamp-3 mt-2 flex-1">
                    {tag.description || <span className="italic text-gray-400">Chưa có mô tả</span>}
                </p>
            </CardContent>
        </Card>
    );
}
