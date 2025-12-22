import { useState, useEffect } from 'react';
import { Plus, Lock, Globe, Video, FileText, Award, Trash2, BookOpen, Upload, Link as LinkIcon, X, AlertTriangle, Loader2, Edit, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { coursesAPI, sectionsAPI, lessonsAPI, tagsAPI, supabase } from '@/services/api';
import { Course, Page, User } from '@/types';
import { QuizEditor } from '@/components/shared/QuizEditor';

interface Section {
    id: string;
    title: string;
    description: string;
    order_index: number;
    course_id: string;
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
    id: string;
    title: string;
    description: string;
    content_type: 'video' | 'text' | 'pdf' | 'quiz';
    duration?: number;
    video_url?: string;
    text_content?: string;
    pdf_url?: string;
    section_id: string;
    order_index: number;
    quizQuestions?: QuizQuestion[];
}

interface EditCourseTabProps {
    course: Course;
    currentUser: User;
    navigateTo: (page: Page) => void;
}

export function EditCourseTab({ course, currentUser, navigateTo }: EditCourseTabProps) {
    // Form states - initialize with course data
    const [courseName, setCourseName] = useState(course.title);
    const [description, setDescription] = useState(course.description);
    const [visibility, setVisibility] = useState<'private' | 'public'>(course.visibility || 'private');
    const [selectedTags, setSelectedTags] = useState<string[]>(course.tags || []);
    const [courseOverview, setCourseOverview] = useState(course.overview || '');
    const [imageUrl, setImageUrl] = useState(course.image || '');
    const [availableTags, setAvailableTags] = useState<Array<{ value: string; label: string }>>([]);

    // Loading states
    const [isLoadingCourse, setIsLoadingCourse] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Sections and lessons
    const [sections, setSections] = useState<Section[]>([]);
    const [showAddSection, setShowAddSection] = useState(false);
    const [sectionTitle, setSectionTitle] = useState('');
    const [currentSectionId, setCurrentSectionId] = useState<string | null>(null);
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
    const [showDeleteCourseDialog, setShowDeleteCourseDialog] = useState(false);

    // Inline editing states
    const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
    const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
    const [editSectionTitle, setEditSectionTitle] = useState('');
    const [editLessonTitle, setEditLessonTitle] = useState('');

    // Fetch available tags on mount
    useEffect(() => {
        const fetchTags = async () => {
            try {
                const response = await tagsAPI.getAllTags();
                if (response.success && response.data) {
                    const tagOptions = response.data.map((tag: any) => ({
                        value: tag.name,
                        label: tag.name
                    }));
                    setAvailableTags(tagOptions);
                    console.log('Loaded tags from backend:', tagOptions);
                }
            } catch (error: any) {
                console.error('Error fetching tags:', error);
                // Fallback to empty array if fetch fails
                setAvailableTags([]);
            }
        };

        fetchTags();
    }, []);

    // Fetch full course details on mount
    useEffect(() => {
        const fetchCourseDetails = async () => {
            if (!course.id) return;

            setIsLoadingCourse(true);
            try {
                const response = await coursesAPI.getCourseById(course.id.toString());
                if (response.success && response.data) {
                    const fullCourse = response.data;

                    // Parse tags - handle different formats from backend
                    let courseTags: string[] = [];
                    if (fullCourse.tags) {
                        if (typeof fullCourse.tags === 'string') {
                            try {
                                courseTags = JSON.parse(fullCourse.tags);
                            } catch (e) {
                                // If parsing fails, treat as single tag
                                courseTags = [fullCourse.tags];
                            }
                        } else if (Array.isArray(fullCourse.tags)) {
                            // Tags might be array of objects like [{tag: {name: "JavaScript"}}]
                            // or array of strings like ["JavaScript", "React"]
                            courseTags = fullCourse.tags.map((item: any) => {
                                // If item has a nested 'tag' object with 'name' property
                                if (item?.tag?.name) {
                                    return item.tag.name;
                                }
                                // If item itself has a 'name' property
                                if (item?.name) {
                                    return item.name;
                                }
                                // If item is already a string
                                if (typeof item === 'string') {
                                    return item;
                                }
                                return '';
                            }).filter(Boolean); // Remove empty strings
                        }
                    }

                    console.log('Parsed course tags:', courseTags);

                    // Update all form fields with full course data
                    setCourseName(fullCourse.title || '');
                    setDescription(fullCourse.description || '');
                    setVisibility(fullCourse.visibility || 'private');
                    setSelectedTags(courseTags);
                    setCourseOverview(fullCourse.overview || '');
                    setImageUrl(fullCourse.image_url || fullCourse.image || '');

                    console.log('Loaded course data:', {
                        title: fullCourse.title,
                        tags: courseTags,
                        overview: fullCourse.overview,
                        image: fullCourse.image_url || fullCourse.image
                    });
                }
            } catch (error: any) {
                console.error('Error fetching course details:', error);
                toast.error('Không thể tải thông tin khóa học');
            } finally {
                setIsLoadingCourse(false);
            }
        };

        fetchCourseDetails();
    }, [course.id]);

    // Fetch sections and lessons on mount
    useEffect(() => {
        const fetchCourseContent = async () => {
            if (!course.id) return;

            setIsLoading(true);
            try {
                const response = await sectionsAPI.getByCourseId(course.id.toString());
                if (response.success && response.data) {
                    setSections(response.data);
                    console.log('Loaded sections:', response.data);
                } else {
                    console.log('No sections found or error:', response);
                }
            } catch (error: any) {
                console.error('Error fetching course content:', error);
                toast.error('Không thể tải nội dung khóa học');
            } finally {
                setIsLoading(false);
            }
        };

        fetchCourseContent();
    }, [course.id]);

    const handleEditSection = (section: Section) => {
        setEditingSection(section);
        setSectionTitle(section.title);
        setShowAddSection(true);
    };

    const handleAddSection = async () => {
        if (sectionTitle.trim()) {
            try {
                if (editingSection) {
                    // Update existing section
                    const response = await sectionsAPI.update(editingSection.id, { title: sectionTitle });
                    if (response.success) {
                        setSections(sections.map(s =>
                            s.id === editingSection.id
                                ? { ...s, title: sectionTitle }
                                : s
                        ));
                        toast.success('Đã cập nhật mục!');
                    }
                } else {
                    // Add new section
                    const newSectionData = {
                        course_id: course.id.toString(),
                        title: sectionTitle,
                        description: '',
                        order_index: sections.length,
                    };
                    const response = await sectionsAPI.create(newSectionData);
                    if (response.success && response.data) {
                        setSections([...sections, { ...response.data, lessons: [] }]);
                        toast.success('Đã thêm mục mới!');
                    }
                }
                setSectionTitle('');
                setEditingSection(null);
                setShowAddSection(false);
            } catch (error: any) {
                console.error('Error saving section:', error);
                toast.error('Không thể lưu mục. Vui lòng thử lại.');
            }
        }
    };

    const handleEditLesson = (lesson: Lesson, sectionId: string) => {
        setEditingLesson(lesson);
        setCurrentSectionId(sectionId);
        setLessonType(lesson.content_type);
        setLessonTitle(lesson.title);
        setYoutubeUrl(lesson.video_url || '');
        setLessonContent(lesson.text_content || '');
        setPdfUrl(lesson.pdf_url || '');
        setQuizQuestions(lesson.quizQuestions || []);
        setShowAddLesson(true);
    };

    const handleAddLesson = async () => {
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

            try {
                if (editingLesson) {
                    // Update existing lesson
                    const updateData: any = {
                        title: lessonTitle,
                        content_type: lessonType,
                    };
                    if (lessonType === 'video') updateData.video_url = youtubeUrl;
                    if (lessonType === 'text') updateData.text_content = lessonContent;
                    if (lessonType === 'pdf') updateData.pdf_url = pdfUrl;

                    const response = await lessonsAPI.update(editingLesson.id, updateData);
                    if (response.success && response.data) {
                        setSections(sections.map(section =>
                            section.id === currentSectionId
                                ? {
                                    ...section,
                                    lessons: section.lessons.map(l =>
                                        l.id === editingLesson.id ? response.data : l
                                    )
                                }
                                : section
                        ));
                        toast.success('Đã cập nhật mục nhỏ!');
                    }
                } else {
                    // Add new lesson
                    const currentSection = sections.find(s => s.id === currentSectionId);
                    const newLessonData: any = {
                        section_id: currentSectionId,
                        title: lessonTitle,
                        description: '',
                        content_type: lessonType === 'text' ? 'article' : lessonType,
                        order_index: currentSection?.lessons.length || 0,
                        is_free: false,
                    };
                    // Map to correct database columns
                    if (lessonType === 'video') newLessonData.content_url = youtubeUrl;
                    if (lessonType === 'text') newLessonData.content_text = lessonContent;
                    if (lessonType === 'pdf') newLessonData.content_url = pdfUrl;

                    const response = await lessonsAPI.create(newLessonData);
                    if (response.success && response.data) {
                        setSections(sections.map(section =>
                            section.id === currentSectionId
                                ? { ...section, lessons: [...section.lessons, response.data] }
                                : section
                        ));
                        toast.success('Đã thêm mục nhỏ!');
                    }
                }

                setLessonTitle('');
                setYoutubeUrl('');
                setLessonContent('');
                setPdfUrl('');
                setEditingLesson(null);
                setShowAddLesson(false);
            } catch (error: any) {
                console.error('Error saving lesson:', error);
                toast.error('Không thể lưu mục nhỏ. Vui lòng thử lại.');
            }
        }
    };

    const handleSaveQuiz = async (questions: QuizQuestion[], settings: any) => {
        if (!currentSectionId) return;

        // Note: Quiz functionality would need additional implementation on backend
        // For now, just save as a quiz lesson without the questions
        toast.warning('Lưu quiz nhưng câu hỏi chưa được lưu vào database. Tính năng đang phát triển.');

        setLessonTitle('');
        setQuizQuestions([]);
        setEditingLesson(null);
        setShowAddLesson(false);
        setShowQuizEditor(false);
    };

    // Inline edit handlers
    const handleSaveSectionEdit = async () => {
        if (!editingSectionId || !editSectionTitle.trim()) {
            setEditingSectionId(null);
            return;
        }

        try {
            const response = await sectionsAPI.update(editingSectionId.toString(), {
                title: editSectionTitle.trim()
            });

            if (response.success) {
                setSections(sections.map(s =>
                    s.id === editingSectionId ? { ...s, title: editSectionTitle.trim() } : s
                ));
                toast.success('Đã cập nhật tên mục');
                setEditingSectionId(null);
            } else {
                toast.error('Không thể cập nhật tên mục');
            }
        } catch (error) {
            console.error('Error updating section:', error);
            toast.error('Có lỗi xảy ra khi cập nhật');
        }
    };

    const handleSaveLessonEdit = async () => {
        if (!editingLessonId || !editLessonTitle.trim()) {
            setEditingLessonId(null);
            return;
        }

        try {
            const response = await lessonsAPI.update(editingLessonId.toString(), {
                title: editLessonTitle.trim()
            });

            if (response.success) {
                const updatedSections = sections.map(section => ({
                    ...section,
                    lessons: section.lessons.map(l =>
                        l.id === editingLessonId ? { ...l, title: editLessonTitle.trim() } : l
                    )
                }));
                setSections(updatedSections);
                toast.success('Đã cập nhật tên bài học');
                setEditingLessonId(null);
            } else {
                toast.error('Không thể cập nhật tên bài học');
            }
        } catch (error) {
            console.error('Error updating lesson:', error);
            toast.error('Có lỗi xảy ra khi cập nhật');
        }
    };

    const handleSaveChanges = async () => {
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

        setIsSaving(true);
        try {
            const updateData = {
                title: courseName,
                description: description,
                overview: courseOverview || null,
                visibility: visibility,
                image_url: imageUrl || null,
            };

            const response = await coursesAPI.updateCourse(course.id.toString(), updateData);
            if (response.success) {
                // Save tags after course update
                try {
                    // Remove all existing tags first by calling addCourseTags with selected tags
                    // The backend addTags will replace existing associations
                    if (selectedTags.length > 0) {
                        await coursesAPI.addCourseTags(course.id.toString(), selectedTags);
                        console.log('Tags saved successfully:', selectedTags);
                    }
                } catch (tagError) {
                    console.error('Error saving tags:', tagError);
                    toast.warning('Đã lưu khóa học nhưng không thể cập nhật chủ đề');
                }

                toast.success('Đã lưu thay đổi!');
            } else {
                toast.error(response.message || 'Không thể lưu thay đổi');
            }
        } catch (error: any) {
            console.error('Error saving course:', error);
            toast.error('Không thể lưu thay đổi. Vui lòng thử lại.');
        } finally {
            setIsSaving(false);
        }
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
                                <Label htmlFor="image-upload">Ảnh bìa khóa học</Label>
                                <div className="mt-2 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Input
                                            id="image-upload"
                                            type="file"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;

                                                // Validate file size (max 5MB)
                                                if (file.size > 5 * 1024 * 1024) {
                                                    toast.error('Kích thước ảnh không được vượt quá 5MB');
                                                    return;
                                                }

                                                setIsSaving(true);
                                                try {
                                                    // Upload to Supabase storage
                                                    const fileExt = file.name.split('.').pop();
                                                    const fileName = `course-${course.id}-${Date.now()}.${fileExt}`;
                                                    const filePath = `${fileName}`;

                                                    const { data, error } = await supabase.storage
                                                        .from('course-images')
                                                        .upload(filePath, file, {
                                                            cacheControl: '3600',
                                                            upsert: true
                                                        });

                                                    if (error) throw error;

                                                    // Get public URL
                                                    const { data: { publicUrl } } = supabase.storage
                                                        .from('course-images')
                                                        .getPublicUrl(filePath);

                                                    setImageUrl(publicUrl);
                                                    toast.success('Đã tải ảnh lên thành công!');
                                                } catch (error: any) {
                                                    console.error('Error uploading image:', error);
                                                    toast.error('Không thể tải ảnh lên. Vui lòng thử lại.');
                                                } finally {
                                                    setIsSaving(false);
                                                }
                                            }}
                                            className="flex-1"
                                            disabled={isSaving}
                                        />
                                        {imageUrl && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setImageUrl('')}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500">💡 Chọn ảnh từ máy tính (tối đa 5MB)</p>
                                    {imageUrl && (
                                        <div className="mt-3">
                                            <img
                                                src={imageUrl}
                                                alt="Course preview"
                                                className="w-full h-48 object-cover rounded-lg border"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400?text=Invalid+Image';
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
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
                                        items={availableTags}
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
                                                    <Select value={currentSectionId?.toString()} onValueChange={(val) => setCurrentSectionId(val)}>
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
                            {isLoading ? (
                                <div className="text-center py-16">
                                    <Loader2 className="w-10 h-10 text-[#1E88E5] mx-auto mb-4 animate-spin" />
                                    <p className="text-gray-500">\u0110ang t\u1ea3i n\u1ed9i dung kh\u00f3a h\u1ecdc...</p>
                                </div>
                            ) : sections.length > 0 ? (
                                <div className="space-y-6">
                                    {sections.map((section) => (
                                        <div key={section.id} className="border-2 border-gray-200 rounded-lg overflow-hidden">
                                            {/* Section Header */}
                                            <div className="bg-gray-50 px-4 py-3 flex items-center justify-between group">
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
                                            <div className="p-4 space-y-2">
                                                {section.lessons.length > 0 ? (
                                                    section.lessons.map((lesson, lessonIndex) => (
                                                        <div key={lesson.id} className="flex items-start gap-3 p-3 bg-white border rounded-lg hover:border-[#1E88E5]/50 transition-colors group">
                                                            <div className="w-8 h-8 rounded bg-[#1E88E5]/10 flex items-center justify-center flex-shrink-0 text-sm text-[#1E88E5]">
                                                                {lessonIndex + 1}
                                                            </div>
                                                            <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                                                                {lesson.content_type === 'video' && <Video className="w-5 h-5 text-[#1E88E5]" />}
                                                                {lesson.content_type === 'text' && <FileText className="w-5 h-5 text-green-600" />}
                                                                {lesson.content_type === 'pdf' && <FileText className="w-5 h-5 text-red-600" />}
                                                                {lesson.content_type === 'quiz' && <Award className="w-5 h-5 text-orange-600" />}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                {editingLessonId === lesson.id ? (
                                                                    <div className="flex items-center gap-2">
                                                                        <Input
                                                                            value={editLessonTitle}
                                                                            onChange={(e) => setEditLessonTitle(e.target.value)}
                                                                            onKeyDown={async (e) => {
                                                                                if (e.key === 'Enter') {
                                                                                    e.preventDefault();
                                                                                    await handleSaveLessonEdit();
                                                                                }
                                                                                if (e.key === 'Escape') {
                                                                                    setEditingLessonId(null);
                                                                                }
                                                                            }}
                                                                            onBlur={handleSaveLessonEdit}
                                                                            className="flex-1"
                                                                            autoFocus
                                                                        />
                                                                        <Button
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            onClick={handleSaveLessonEdit}
                                                                        >
                                                                            <Check className="w-4 h-4 text-green-600" />
                                                                        </Button>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center gap-2 group/lesson">
                                                                        <div className="text-sm mb-1 flex-1">{lesson.title}</div>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            className="opacity-0 group-hover/lesson:opacity-100 transition-opacity"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setEditingLessonId(lesson.id);
                                                                                setEditLessonTitle(lesson.title);
                                                                            }}
                                                                        >
                                                                            <Edit className="w-3 h-3" />
                                                                        </Button>
                                                                    </div>
                                                                )}
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
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="flex-shrink-0"
                                                                onClick={async (e) => {
                                                                    e.stopPropagation();
                                                                    try {
                                                                        await lessonsAPI.delete(lesson.id);
                                                                        setSections(sections.map(s =>
                                                                            s.id === section.id
                                                                                ? { ...s, lessons: s.lessons.filter(l => l.id !== lesson.id) }
                                                                                : s
                                                                        ));
                                                                        toast.success('Đã xóa bài học');
                                                                    } catch (error) {
                                                                        toast.error('Không thể xóa bài học');
                                                                    }
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
                        <CardContent className="!p-3">
                            <button
                                className="w-full inline-flex items-center justify-center gap-2 h-9 px-4 py-2 rounded-md text-sm font-medium text-red-600 border border-red-300 bg-white hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-200"
                                onClick={() => setShowDeleteCourseDialog(true)}
                            >
                                <Trash2 className="w-4 h-4" />
                                Xóa khóa học
                            </button>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-1">
                    <Card className="sticky top-20 hover:shadow-lg transition-shadow duration-300">
                        <CardHeader className="border-b bg-gradient-to-r from-[#1E88E5]/5 to-transparent">
                            <CardTitle className="text-lg font-bold text-[#1E88E5]">Hành động</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-6">
                            <Button
                                className="w-full bg-[#1E88E5] text-white hover:bg-[#1565C0] shadow-md hover:shadow-lg transition-all"
                                onClick={handleSaveChanges}
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Đang lưu...
                                    </>
                                ) : (
                                    'Lưu thay đổi'
                                )}
                            </Button>
                            <Button
                                onClick={() => setShowDeleteCourseDialog(true)}
                                className="w-full bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                <span>Xóa khóa học</span>
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

            {/* Delete Course Confirmation Dialog */}
            <DeleteConfirmDialog
                open={showDeleteCourseDialog}
                onOpenChange={setShowDeleteCourseDialog}
                title="Xác nhận xóa khóa học"
                onConfirm={async () => {
                    try {
                        const response = await coursesAPI.deleteCourse(course.id.toString());
                        if (response.success) {
                            toast.success('Đã xóa khóa học thành công');
                            setShowDeleteCourseDialog(false);
                            // Navigate back to my courses after a short delay
                            setTimeout(() => navigateTo('my-courses'), 500);
                        } else {
                            toast.error(response.message || 'Không thể xóa khóa học');
                        }
                    } catch (error: any) {
                        console.error('Error deleting course:', error);
                        toast.error('Có lỗi xảy ra khi xóa khóa học');
                    }
                }}
            >
                <div className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <img
                        src={course.image}
                        alt={course.title}
                        className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 mb-1 line-clamp-1">{course.title}</p>
                        <p className="text-sm text-gray-500">Giảng viên: {course.ownerName}</p>
                    </div>
                </div>
            </DeleteConfirmDialog>
        </div >
    );
}
