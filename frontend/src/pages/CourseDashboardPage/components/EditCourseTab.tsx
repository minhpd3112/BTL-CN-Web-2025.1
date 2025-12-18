import { useState } from 'react';
import { Plus, Lock, Globe, Video, FileText, Award, Trash2, BookOpen, Upload, Link as LinkIcon, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { mockTags } from '@/services/mocks';
import { Course, Page, User } from '@/types';
import { QuizEditor } from '@/components/shared/QuizEditor';

interface Section {
    id: number;
    title: string;
    description: string;
    order: number;
    lessons: Lesson[];
}

interface QuizQuestion {
    question: string;
    type: 'single' | 'multiple';
    options: string[];
    correctAnswers: number[];
    explanation?: string;
}

interface Lesson {
    id: number;
    title: string;
    description: string;
    type: 'video' | 'text' | 'pdf' | 'quiz';
    duration: string;
    youtubeUrl?: string;
    content?: string;
    pdfUrl?: string;
    quizQuestions?: QuizQuestion[];
}

// Mock course sections data - in real app, this would come from the course
const mockCourseSections: Section[] = [
    {
        id: 1,
        title: 'Giới thiệu',
        description: 'Tổng quan về khóa học',
        order: 1,
        lessons: [
            { id: 1, title: 'Chào mừng đến với khóa học', description: 'Video giới thiệu', type: 'video', duration: '10:00', youtubeUrl: 'dQw4w9WgXcQ' },
            { id: 2, title: 'Cài đặt môi trường', description: 'Hướng dẫn setup', type: 'video', duration: '15:00', youtubeUrl: 'dQw4w9WgXcQ' },
        ]
    }
];

interface EditCourseTabProps {
    course: Course;
    currentUser: User;
    navigateTo: (page: Page) => void;
}

export function EditCourseTab({ course, currentUser, navigateTo }: EditCourseTabProps) {
    const [courseName, setCourseName] = useState(course.title);
    const [description, setDescription] = useState(course.description);
    const [visibility, setVisibility] = useState<'private' | 'public'>(course.visibility || 'private');
    const [selectedTags, setSelectedTags] = useState<string[]>(course.tags || []);
    const [courseOverview, setCourseOverview] = useState('');

    // Sections and lessons
    const [sections, setSections] = useState<Section[]>(mockCourseSections);
    const [showAddSection, setShowAddSection] = useState(false);
    const [sectionTitle, setSectionTitle] = useState('');
    const [currentSectionId, setCurrentSectionId] = useState<number | null>(null);
    const [editingSection, setEditingSection] = useState<Section | null>(null);

    // Lessons
    const [showAddLesson, setShowAddLesson] = useState(false);
    const [lessonType, setLessonType] = useState<'video' | 'text' | 'pdf' | 'quiz'>('video');
    const [lessonTitle, setLessonTitle] = useState('');
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [lessonContent, setLessonContent] = useState('');
    const [pdfUrl, setPdfUrl] = useState('');
    const [showQuizEditor, setShowQuizEditor] = useState(false);
    const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
    const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

    const handleEditSection = (section: Section) => {
        setEditingSection(section);
        setSectionTitle(section.title);
        setShowAddSection(true);
    };

    const handleAddSection = () => {
        if (sectionTitle.trim()) {
            if (editingSection) {
                // Update existing section
                setSections(sections.map(s =>
                    s.id === editingSection.id
                        ? { ...s, title: sectionTitle }
                        : s
                ));
                toast.success('Đã cập nhật mục!');
            } else {
                // Add new section
                const newSection: Section = {
                    id: Date.now(),
                    title: sectionTitle,
                    description: '',
                    order: sections.length + 1,
                    lessons: []
                };
                setSections([...sections, newSection]);
                toast.success('Đã thêm mục mới!');
            }
            setSectionTitle('');
            setEditingSection(null);
            setShowAddSection(false);
        }
    };

    const handleEditLesson = (lesson: Lesson, sectionId: number) => {
        setEditingLesson(lesson);
        setCurrentSectionId(sectionId);
        setLessonType(lesson.type);
        setLessonTitle(lesson.title);
        setYoutubeUrl(lesson.youtubeUrl || '');
        setLessonContent(lesson.content || '');
        setPdfUrl(lesson.pdfUrl || '');
        setQuizQuestions(lesson.quizQuestions || []);
        setShowAddLesson(true);
    };

    const handleAddLesson = () => {
        if (!currentSectionId) {
            toast.error('Vui lòng chọn mục để thêm mục nhỏ');
            return;
        }
        if (lessonTitle.trim()) {
            if (lessonType === 'quiz' && !editingLesson) {
                // Open quiz editor for new quiz
                setShowQuizEditor(true);
                return;
            }

            if (editingLesson) {
                // Update existing lesson
                const updatedLesson: Lesson = {
                    ...editingLesson,
                    title: lessonTitle,
                    description: '',
                    type: lessonType,
                    ...(lessonType === 'video' && { youtubeUrl }),
                    ...(lessonType === 'text' && { content: lessonContent }),
                    ...(lessonType === 'pdf' && { pdfUrl }),
                    ...(lessonType === 'quiz' && { quizQuestions })
                };

                setSections(sections.map(section =>
                    section.id === currentSectionId
                        ? { ...section, lessons: section.lessons.map(l => l.id === editingLesson.id ? updatedLesson : l) }
                        : section
                ));

                toast.success('Đã cập nhật mục nhỏ!');
            } else {
                // Add new lesson
                const newLesson: Lesson = {
                    id: Date.now(),
                    title: lessonTitle,
                    description: '',
                    type: lessonType,
                    duration: '15:00',
                    ...(lessonType === 'video' && { youtubeUrl }),
                    ...(lessonType === 'text' && { content: lessonContent }),
                    ...(lessonType === 'pdf' && { pdfUrl })
                };

                setSections(sections.map(section =>
                    section.id === currentSectionId
                        ? { ...section, lessons: [...section.lessons, newLesson] }
                        : section
                ));

                toast.success('Đã thêm mục nhỏ!');
            }

            setLessonTitle('');
            setYoutubeUrl('');
            setLessonContent('');
            setPdfUrl('');
            setEditingLesson(null);
            setShowAddLesson(false);
        }
    };

    const handleSaveQuiz = (questions: QuizQuestion[]) => {
        if (!currentSectionId) return;

        if (editingLesson) {
            // Update existing quiz
            const updatedLesson: Lesson = {
                ...editingLesson,
                title: lessonTitle,
                description: '',
                type: 'quiz',
                duration: `${questions.length * 2} phút`,
                quizQuestions: questions
            };

            setSections(sections.map(section =>
                section.id === currentSectionId
                    ? { ...section, lessons: section.lessons.map(l => l.id === editingLesson.id ? updatedLesson : l) }
                    : section
            ));

            toast.success('Đã cập nhật quiz!');
        } else {
            // Add new quiz
            const newLesson: Lesson = {
                id: Date.now(),
                title: lessonTitle,
                description: '',
                type: 'quiz',
                duration: `${questions.length * 2} phút`,
                quizQuestions: questions
            };

            setSections(sections.map(section =>
                section.id === currentSectionId
                    ? { ...section, lessons: [...section.lessons, newLesson] }
                    : section
            ));

            toast.success('Đã thêm quiz!');
        }

        setLessonTitle('');
        setQuizQuestions([]);
        setEditingLesson(null);
        setShowAddLesson(false);
        setShowQuizEditor(false);
    };

    const handleSaveChanges = () => {
        if (!courseName.trim()) {
            toast.error('Vui lòng nhập tên khóa học');
            return;
        }
        if (!description.trim()) {
            toast.error('Vui lòng nhập mô tả');
            return;
        }
        if (selectedTags.length === 0) {
            toast.error('Vui lòng chọn ít nhất 1 chủ đề');
            return;
        }
        if (sections.length === 0) {
            toast.error('Vui lòng thêm ít nhất 1 mục');
            return;
        }

        toast.success('Đã lưu thay đổi!');
        // No navigation needed, just a success message
    };

    return (
        <div className="max-w-5xl mx-auto py-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card className="mb-6 hover:shadow-lg transition-shadow duration-300">
                        <CardHeader className="border-b bg-gradient-to-r from-[#1E88E5]/5 to-transparent">
                            <CardTitle className="text-lg font-bold text-[#1E88E5]">Thông tin cơ bản</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="course-name">Tên khóa học * (tối đa 100 ký tự)</Label>
                                <Input
                                    id="course-name"
                                    placeholder="VD: Lập trình React từ cơ bản đến nâng cao"
                                    value={courseName}
                                    onChange={(e) => setCourseName(e.target.value)}
                                    className="mt-2"
                                    maxLength={100}
                                />
                                <p className="text-xs text-gray-500 mt-1">{courseName.length}/100 ký tự</p>
                            </div>
                            <div>
                                <Label htmlFor="description">Mô tả * (tối đa 500 ký tự)</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Mô tả ngắn gọn về khóa học..."
                                    rows={4}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="mt-2"
                                    maxLength={500}
                                />
                                <p className="text-xs text-gray-500 mt-1">{description.length}/500 ký tự</p>
                            </div>
                            <div>
                                <Label htmlFor="overview">Tổng quan khóa học (tối đa 2000 ký tự)</Label>
                                <Textarea
                                    id="overview"
                                    placeholder={`Nhập nội dung theo định dạng Markdown. Ví dụ:\n\n## Bạn sẽ học được gì?\n- Nắm vững kiến thức cơ bản\n- Xây dựng dự án thực tế\n- Áp dụng vào công việc\n\n## Yêu cầu\n- Kiến thức lập trình cơ bản\n- Máy tính cá nhân\n- Tinh thần học hỏi`}
                                    rows={10}
                                    value={courseOverview}
                                    onChange={(e) => setCourseOverview(e.target.value)}
                                    className="mt-2 font-mono text-sm"
                                    maxLength={2000}
                                />
                                <p className="text-xs text-gray-500 mt-1">{courseOverview.length}/2000 ký tự</p>
                            </div>
                            <div>
                                <Label htmlFor="image">Ảnh bìa</Label>
                                <Input
                                    id="image"
                                    type="file"
                                    accept="image/*"
                                    className="mt-2"
                                />
                            </div>
                            <div>
                                <Label>Chủ đề khóa học (có thể chọn nhiều) *</Label>
                                <div className="mt-2 space-y-2">
                                    {/* Selected Tags Display */}
                                    {selectedTags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                            {selectedTags.map(tag => (
                                                <Badge key={tag} className="bg-[#1E88E5] text-white gap-1 px-3 py-1">
                                                    {tag}
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedTags(selectedTags.filter(t => t !== tag))}
                                                        className="ml-1 hover:text-red-200"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    )}

                                    {/* Tag Selection Dropdown */}
                                    <Combobox
                                        items={mockTags.map(tag => ({ value: tag.name, label: tag.name }))}
                                        value=""
                                        onValueChange={(value) => {
                                            if (value && !selectedTags.includes(value)) {
                                                setSelectedTags([...selectedTags, value]);
                                            }
                                        }}
                                        placeholder="Thêm chủ đề..."
                                        searchPlaceholder="Tìm chủ đề..."
                                        emptyText="Không tìm thấy chủ đề."
                                        className="w-full"
                                    />
                                    <p className="text-xs text-gray-500">
                                        Chọn các chủ đề phù hợp để học viên dễ tìm kiếm khóa học của bạn
                                    </p>
                                </div>
                            </div>
                            <div>
                                <Label>Chế độ hiển thị</Label>
                                <div className="mt-3 space-y-3">
                                    <label
                                        className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${visibility === 'private' ? 'border-[#1E88E5] bg-[#1E88E5]/5' : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        onClick={() => setVisibility('private')}
                                    >
                                        <div className="mt-0.5 flex-shrink-0">
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${visibility === 'private'
                                                ? 'border-[#1E88E5] bg-white'
                                                : 'border-gray-400 bg-white'
                                                }`}>
                                                {visibility === 'private' && (
                                                    <div className="w-2.5 h-2.5 rounded-full bg-[#1E88E5]"></div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Lock className="w-4 h-4" />
                                                <span className="font-medium">Riêng tư</span>
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                Chỉ người bạn mời mới có thể xem và học
                                            </p>
                                        </div>
                                    </label>
                                    <label
                                        className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${visibility === 'public' ? 'border-[#1E88E5] bg-[#1E88E5]/5' : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        onClick={() => setVisibility('public')}
                                    >
                                        <div className="mt-0.5 flex-shrink-0">
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${visibility === 'public'
                                                ? 'border-[#1E88E5] bg-white'
                                                : 'border-gray-400 bg-white'
                                                }`}>
                                                {visibility === 'public' && (
                                                    <div className="w-2.5 h-2.5 rounded-full bg-[#1E88E5]"></div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Globe className="w-4 h-4" />
                                                <span className="font-medium">Công khai</span>
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                Sau khi admin duyệt, mọi người đều có thể xem
                                            </p>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow duration-300">
                        <CardHeader className="border-b bg-gradient-to-r from-[#1E88E5]/5 to-transparent">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-bold text-[#1E88E5]">
                                    Nội dung khóa học
                                </CardTitle>
                                <div className="flex gap-2">
                                    <Dialog open={showAddSection} onOpenChange={setShowAddSection}>
                                        <DialogTrigger asChild>
                                            <Button size="sm" className="bg-[#1E88E5] text-white hover:bg-[#1565C0]">
                                                <Plus className="w-4 h-4 mr-2" />
                                                Thêm mục
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Thêm mục mới</DialogTitle>
                                                <DialogDescription>Tạo một mục để nhóm các nội dung</DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                                <div>
                                                    <Label htmlFor="section-title">Tên mục * (tối đa 100 ký tự)</Label>
                                                    <Input
                                                        id="section-title"
                                                        placeholder="VD: Giới thiệu, Bài học nâng cao..."
                                                        value={sectionTitle}
                                                        onChange={(e) => setSectionTitle(e.target.value)}
                                                        className="mt-2"
                                                        maxLength={100}
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">{sectionTitle.length}/100 ký tự</p>
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button variant="outline" onClick={() => setShowAddSection(false)}>Hủy</Button>
                                                <Button className="bg-[#1E88E5] text-white hover:bg-[#1565C0]" onClick={handleAddSection}>
                                                    Thêm mục
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>

                                    <Dialog open={showAddLesson} onOpenChange={(open) => {
                                        setShowAddLesson(open);
                                        if (!open) {
                                            setEditingLesson(null);
                                            setLessonTitle('');
                                            setYoutubeUrl('');
                                            setLessonContent('');
                                            setPdfUrl('');
                                            setQuizQuestions([]);
                                        }
                                    }}>
                                        <DialogTrigger asChild>
                                            <Button size="sm" disabled={sections.length === 0} className="bg-[#1E88E5] text-white hover:bg-[#1565C0]">
                                                <Plus className="w-4 h-4 mr-2" />
                                                Thêm mục nhỏ
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                            <DialogHeader>
                                                <DialogTitle>{editingLesson ? 'Chỉnh sửa mục nhỏ' : 'Thêm mục nhỏ mới'}</DialogTitle>
                                                <DialogDescription>
                                                    {editingLesson ? 'Cập nhật thông tin mục nhỏ' : 'Chọn loại nội dung và điền thông tin'}
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                                <div>
                                                    <Label>Mục *</Label>
                                                    <Select value={currentSectionId?.toString()} onValueChange={(val) => setCurrentSectionId(Number(val))}>
                                                        <SelectTrigger className="mt-2">
                                                            <SelectValue placeholder="Chọn mục" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {sections.map(section => (
                                                                <SelectItem key={section.id} value={section.id.toString()}>
                                                                    {section.title}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div>
                                                    <Label>Loại nội dung</Label>
                                                    <Select value={lessonType} onValueChange={(val: any) => setLessonType(val)}>
                                                        <SelectTrigger className="mt-2">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="video">Video</SelectItem>
                                                            <SelectItem value="text">Text</SelectItem>
                                                            <SelectItem value="pdf">PDF</SelectItem>
                                                            <SelectItem value="quiz">Quiz</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div>
                                                    <Label htmlFor="lesson-title">Tiêu đề * (tối đa 150 ký tự)</Label>
                                                    <Input
                                                        id="lesson-title"
                                                        placeholder="VD: Giới thiệu về React Hooks"
                                                        value={lessonTitle}
                                                        onChange={(e) => setLessonTitle(e.target.value)}
                                                        className="mt-2"
                                                        maxLength={150}
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">{lessonTitle.length}/150 ký tự</p>
                                                </div>

                                                {lessonType === 'video' && (
                                                    <div>
                                                        <Label htmlFor="youtube-url">Link YouTube * (tối đa 200 ký tự)</Label>
                                                        <div className="flex gap-2 mt-2">
                                                            <LinkIcon className="w-5 h-5 text-gray-400 mt-2" />
                                                            <Input
                                                                id="youtube-url"
                                                                placeholder="https://www.youtube.com/watch?v=..."
                                                                value={youtubeUrl}
                                                                onChange={(e) => setYoutubeUrl(e.target.value)}
                                                                maxLength={200}
                                                            />
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-1">{youtubeUrl.length}/200 ký tự</p>
                                                        <p className="text-sm text-gray-600 mt-2">
                                                            💡 Có thể nhập link đầy đủ hoặc chỉ ID video
                                                        </p>
                                                    </div>
                                                )}

                                                {lessonType === 'text' && (
                                                    <div>
                                                        <Label htmlFor="lesson-content">Nội dung bài viết * (tối đa 10000 ký tự)</Label>
                                                        <Textarea
                                                            id="lesson-content"
                                                            placeholder="Nhập nội dung bài học..."
                                                            value={lessonContent}
                                                            onChange={(e) => setLessonContent(e.target.value)}
                                                            className="mt-2 font-mono text-sm"
                                                            rows={10}
                                                            maxLength={10000}
                                                        />
                                                        <p className="text-xs text-gray-500 mt-1">{lessonContent.length}/10000 ký tự</p>
                                                    </div>
                                                )}

                                                {lessonType === 'pdf' && (
                                                    <div>
                                                        <Label htmlFor="pdf-url">Link Google Drive PDF *</Label>
                                                        <div className="flex gap-2 mt-2">
                                                            <LinkIcon className="w-5 h-5 text-gray-400 mt-2" />
                                                            <Input
                                                                id="pdf-url"
                                                                placeholder="https://drive.google.com/file/d/.../view"
                                                                value={pdfUrl}
                                                                onChange={(e) => setPdfUrl(e.target.value)}
                                                            />
                                                        </div>
                                                        <p className="text-sm text-gray-600 mt-2">
                                                            💡 Paste link chia sẻ từ Google Drive (đảm bảo quyền xem công khai)
                                                        </p>
                                                    </div>
                                                )}


                                            </div>
                                            <DialogFooter>
                                                <Button variant="outline" onClick={() => {
                                                    setShowAddLesson(false);
                                                    setEditingLesson(null);
                                                    setLessonTitle('');
                                                    setYoutubeUrl('');
                                                    setLessonContent('');
                                                    setPdfUrl('');
                                                }}>
                                                    Hủy
                                                </Button>
                                                <Button className="bg-[#1E88E5] text-white hover:bg-[#1565C0]" onClick={handleAddLesson}>
                                                    {editingLesson ? 'Cập nhật' : 'Thêm mục nhỏ'}
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {sections.length > 0 ? (
                                <div className="space-y-6">
                                    {sections.map((section) => (
                                        <div key={section.id} className="border-2 border-gray-200 rounded-lg overflow-hidden">
                                            {/* Section Header */}
                                            <div className="bg-gray-50 px-4 py-3 flex items-center justify-between group">
                                                <div
                                                    className="flex-1 cursor-pointer"
                                                    onClick={() => handleEditSection(section)}
                                                >
                                                    <h4 className="text-sm font-medium">{section.title}</h4>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="secondary">{section.lessons.length} mục nhỏ</Badge>
                                                    <Button variant="ghost" size="icon" onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSections(sections.filter(s => s.id !== section.id));
                                                        toast.success('Đã xóa mục');
                                                    }}>
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Lessons in Section */}
                                            <div className="p-4 space-y-2">
                                                {section.lessons.length > 0 ? (
                                                    section.lessons.map((lesson, lessonIndex) => (
                                                        <div key={lesson.id} className="flex items-start gap-3 p-3 bg-white border rounded-lg hover:border-[#1E88E5]/50 transition-colors group">
                                                            <div className="w-8 h-8 rounded bg-[#1E88E5]/10 flex items-center justify-center flex-shrink-0 text-sm text-[#1E88E5]">
                                                                {lessonIndex + 1}
                                                            </div>
                                                            <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                                                                {lesson.type === 'video' && <Video className="w-5 h-5 text-[#1E88E5]" />}
                                                                {lesson.type === 'text' && <FileText className="w-5 h-5 text-green-600" />}
                                                                {lesson.type === 'pdf' && <FileText className="w-5 h-5 text-red-600" />}
                                                                {lesson.type === 'quiz' && <Award className="w-5 h-5 text-orange-600" />}
                                                            </div>
                                                            <div
                                                                className="flex-1 min-w-0 cursor-pointer"
                                                                onClick={() => handleEditLesson(lesson, section.id)}
                                                            >
                                                                <div className="text-sm mb-1">{lesson.title}</div>
                                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                                    <span>
                                                                        {lesson.type === 'video' && '📹 Video'}
                                                                        {lesson.type === 'text' && '📝 Bài viết'}
                                                                        {lesson.type === 'pdf' && '📄 PDF'}
                                                                        {lesson.type === 'quiz' && '✅ Quiz'}
                                                                    </span>
                                                                    <span>•</span>
                                                                    <span>{lesson.duration}</span>
                                                                </div>
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="flex-shrink-0"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSections(sections.map(s =>
                                                                        s.id === section.id
                                                                            ? { ...s, lessons: s.lessons.filter(l => l.id !== lesson.id) }
                                                                            : s
                                                                    ));
                                                                    toast.success('Đã xóa bài học');
                                                                }}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-center py-6 text-gray-500 text-sm">
                                                        Chưa có mục nhỏ nào trong mục này
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16">
                                    <div className="w-20 h-20 rounded-full bg-[#1E88E5]/10 flex items-center justify-center mx-auto mb-4">
                                        <BookOpen className="w-10 h-10 text-[#1E88E5]" />
                                    </div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Chưa có mục nào</h4>
                                    <p className="text-gray-500 mb-6 text-sm max-w-xs mx-auto">
                                        Hãy tạo mục đầu tiên để bắt đầu xây dựng khóa học
                                    </p>
                                    <button
                                        onClick={() => setShowAddSection(true)}
                                        className="inline-flex items-center justify-center gap-2 h-9 px-4 py-2 rounded-md text-sm font-medium border-2 border-[#1E88E5] text-[#1E88E5] bg-white hover:bg-[#1E88E5] hover:text-white transition-all duration-200"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Tạo mục đầu tiên
                                    </button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    <Card className="hover:shadow-lg transition-shadow duration-300 border-red-200 bg-red-50/30 mt-8">
                        <CardHeader className="border-b border-red-100 bg-red-50/50">
                            <CardTitle className="text-lg font-bold text-red-600">
                                Vùng nguy hiểm
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <button className="w-full inline-flex items-center justify-center gap-2 h-9 px-4 py-2 rounded-md text-sm font-medium text-red-600 border border-red-300 bg-white hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-200">
                                        <Trash2 className="w-4 h-4" />
                                        Xóa khóa học
                                    </button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-white z-[9999] border-2">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Bạn có chắc chắn không?</AlertDialogTitle>
                                        <AlertDialogDescription>Hành động này không thể hoàn tác. Khóa học sẽ bị xóa vĩnh viễn.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => {
                                                toast.success('Đã xóa khóa học thành công');
                                                navigateTo('my-courses');
                                            }}
                                            className="bg-red-600 text-white hover:bg-red-700"
                                        >
                                            Xác nhận xóa
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-1">
                    <Card className="sticky top-20 hover:shadow-lg transition-shadow duration-300">
                        <CardHeader className="border-b bg-gradient-to-r from-[#1E88E5]/5 to-transparent">
                            <CardTitle className="text-lg font-bold text-[#1E88E5]">Hành động</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-6">
                            <Button className="w-full bg-[#1E88E5] text-white hover:bg-[#1565C0] shadow-md hover:shadow-lg transition-all" onClick={handleSaveChanges}>
                                Lưu thay đổi
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Quiz Editor Dialog */}
            <Dialog open={showQuizEditor} onOpenChange={setShowQuizEditor}>
                <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Tạo Quiz: {lessonTitle}</DialogTitle>
                        <DialogDescription>
                            Nhập câu hỏi theo format đặc biệt
                        </DialogDescription>
                    </DialogHeader>
                    <QuizEditor
                        onSave={handleSaveQuiz}
                        initialQuestions={quizQuestions}
                    />
                </DialogContent>
            </Dialog>
        </div >
    );
}
