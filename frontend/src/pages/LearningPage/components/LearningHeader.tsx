import { ChevronLeft, LayoutList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface LearningHeaderProps {
    courseTitle: string;
    progress: number;
    completedLessons: number;
    totalLessons: number;
    onBack?: () => void;
    isSidebarOpen?: boolean;
    onToggleSidebar?: () => void;
}

export function LearningHeader({
    courseTitle,
    progress,
    completedLessons,
    totalLessons,
    onBack,
    isSidebarOpen = true,
    onToggleSidebar
}: LearningHeaderProps) {

    const handleBack = () => {
        if (onBack) {
            onBack();
        }
    };

    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-50 shadow-sm">
            {/* Left: Back & Title */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleBack}
                    className="text-gray-600 hover:text-[#1E88E5] hover:bg-[#1E88E5]/10"
                >
                    <ChevronLeft className="w-5 h-5" />
                </Button>

                <div className="flex flex-col overflow-hidden">
                    <h1 className="text-gray-800 font-medium truncate text-sm md:text-base pr-4" title={courseTitle}>
                        {courseTitle}
                    </h1>
                </div>
            </div>

            {/* Right: Progress & Actions */}
            <div className="flex items-center gap-4 md:gap-6 flex-shrink-0">
                <div className="hidden md:flex flex-col items-end min-w-[120px]">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                        <span>{completedLessons}/{totalLessons} bài học</span>
                    </div>
                    <Progress value={progress} className="h-1.5 w-32 bg-gray-200 [&>div]:bg-[#1E88E5]" />
                </div>

                <div className="flex items-center gap-2">
                    {/* Mobile Progress Ring could go here if needed */}
                    <div className="md:hidden flex items-center gap-2 text-xs text-gray-500">
                        <span className="text-[#1E88E5] font-bold">{Math.round(progress)}%</span>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onToggleSidebar}
                        className={`text-gray-600 hover:text-[#1E88E5] hover:bg-[#1E88E5]/10 ${!isSidebarOpen ? 'bg-[#1E88E5]/10 text-[#1E88E5]' : ''
                            }`}
                        title={isSidebarOpen ? 'Ẩn nội dung khóa học' : 'Hiện nội dung khóa học'}
                    >
                        <LayoutList className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </header>
    );
}
