import { useState, useEffect } from 'react';
import { Plus, Lock, Globe, Video, FileText, Award, Trash2, BookOpen, Upload, Link as LinkIcon, X, AlertTriangle, Loader2, Edit, Check, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
import { coursesAPI, sectionsAPI, lessonsAPI, tagsAPI, quizAPI, supabase } from '@/services/api';
import { Course, Page, User, QuizSettings } from '@/types';
import { QuizEditor } from '@/components/shared/QuizEditor';
import { SortableSection } from './SortableSection';
import { SortableLesson } from './SortableLesson';

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
    content_type: 'video' | 'text' | 'pdf' | 'quiz' | 'article';
    duration?: number;
    content_url?: string;  // For video and PDF
    content_text?: string; // For text/article
    section_id: string;
    order_index: number;
    quizQuestions?: QuizQuestion[];
    quizSettings?: QuizSettings;
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

    // Video upload states
    const [videoSource, setVideoSource] = useState<'youtube' | 'upload'>('youtube');
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoPreview, setVideoPreview] = useState<string>('');
    const [isUploadingVideo, setIsUploadingVideo] = useState(false);

    // Inline editing states
    const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
    const [editSectionTitle, setEditSectionTitle] = useState('');

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

    // Upload video function
    const uploadVideo = async (file: File): Promise<string | null> => {
        try {
            const MAX_SIZE = 50 * 1024 * 1024; // 50MB
            if (file.size > MAX_SIZE) {
                toast.error('Kích thước video không được vượt quá 50MB');
                return null;
            }

            console.log('Starting video upload...', { fileName: file.name, size: file.size });
            setIsUploadingVideo(true);
            toast.info('Đang upload video... Vui lòng đợi.');

            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

            const { data, error } = await supabase.storage
                .from('course-videos')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) {
                console.error('Video upload error:', error);
                toast.error(`Upload thất bại: ${error.message}`);
                return null;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('course-videos')
                .getPublicUrl(fileName);

            console.log('Video uploaded successfully:', publicUrl);
            toast.success('Upload video thành công!');
            return publicUrl;
        } catch (error: any) {
            console.error('Video upload failed:', error);
            toast.error(`Upload video thất bại: ${error?.message || 'Unknown error'}`);
            return null;
        } finally {
            setIsUploadingVideo(false);
        }
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

    const handleEditLesson = async (lesson: Lesson, sectionId: string) => {
        setEditingLesson(lesson);
        setCurrentSectionId(sectionId);
        setLessonType(lesson.content_type === 'article' ? 'text' : lesson.content_type);
        setLessonTitle(lesson.title);

        // Load content based on type
        if (lesson.content_type === 'video') {
            const contentUrl = lesson.content_url || '';
            // Detect if it's YouTube or uploaded video
            const isYouTubeUrl = contentUrl.includes('youtube.com') || contentUrl.includes('youtu.be');
            if (isYouTubeUrl || !contentUrl) {
                setVideoSource('youtube');
                setYoutubeUrl(contentUrl);
                setVideoFile(null);
                setVideoPreview('');
            } else {
                setVideoSource('upload');
                setYoutubeUrl('');
                setVideoFile(null);
                setVideoPreview(contentUrl); // Show existing uploaded video
            }
        } else if (lesson.content_type === 'article' || lesson.content_type === 'text') {
            setLessonContent(lesson.content_text || '');
        } else if (lesson.content_type === 'pdf') {
            setPdfUrl(lesson.content_url || '');
        } else if (lesson.content_type === 'quiz') {
            // Load quiz data from backend
            try {
                const response = await quizAPI.getQuiz(lesson.id);
                console.log('🔍 Loading quiz data for edit:', response);

                if (response.success && response.data) {
                    const { questions, lesson: quizLesson } = response.data;

                    console.log('📝 Quiz questions from backend:', questions);

                    // Convert backend format to QuizEditor format
                    const formattedQuestions: QuizQuestion[] = questions.map((q: any, qIdx: number) => {
                        console.log(`\n🔍 Processing question ${qIdx}:`, q);
                        console.log('  Answers:', q.answers);

                        const correctAnswerIndices = q.answers
                            .map((a: any, idx: number) => {
                                console.log(`    Answer ${idx}:`, {
                                    text: a.answer_text,
                                    is_correct: a.is_correct,
                                    willBeMarked: a.is_correct ? idx : -1
                                });
                                return a.is_correct ? idx : -1;
                            })
                            .filter((idx: number) => idx !== -1);

                        console.log(`  ✅ Correct answer indices:`, correctAnswerIndices);

                        const formatted = {
                            question: q.question,
                            type: q.type === 'single_choice' ? 'single' : 'multiple',
                            options: q.answers.map((a: any) => a.answer_text),
                            correctAnswers: correctAnswerIndices,
                            explanation: q.explanation || ''
                        };

                        console.log('✅ Formatted question:', formatted);
                        return formatted;
                    });

                    console.log('📦 All formatted questions:', formattedQuestions);
                    setQuizQuestions(formattedQuestions);

                    // Store quiz settings for later use
                    if (quizLesson.quiz_settings) {
                        // Will be used when opening QuizEditor
                        (lesson as any).quizSettings = quizLesson.quiz_settings;
                    }
                }
            } catch (error) {
                console.error('Error loading quiz:', error);
                toast.error('Không thể tải nội dung quiz');
            }
        }

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
                // Handle video upload if needed
                let videoContentUrl = youtubeUrl;
                if (lessonType === 'video' && videoSource === 'upload') {
                    if (videoFile) {
                        const uploadedUrl = await uploadVideo(videoFile);
                        if (!uploadedUrl) {
                            return; // Upload failed, error already shown
                        }
                        videoContentUrl = uploadedUrl;
                    } else if (videoPreview && !videoPreview.startsWith('blob:')) {
                        // Use existing uploaded video URL
                        videoContentUrl = videoPreview;
                    } else {
                        toast.error('Vui lòng chọn file video');
                        return;
                    }
                }

                if (editingLesson) {
                    // Update existing lesson
                    const updateData: any = {
                        title: lessonTitle,
                        content_type: lessonType === 'text' ? 'article' : lessonType,
                    };
                    if (lessonType === 'video') updateData.content_url = videoContentUrl;
                    if (lessonType === 'text') updateData.content_text = lessonContent;
                    if (lessonType === 'pdf') updateData.content_url = pdfUrl;

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
                    if (lessonType === 'video') newLessonData.content_url = videoContentUrl;
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
        if (!currentSectionId || !lessonTitle.trim()) {
            toast.error('Vui lòng nhập tiêu đề và chọn mục');
            return;
        }

        try {
            setIsSaving(true);

            if (editingLesson && editingLesson.content_type === 'quiz') {
                // UPDATE existing quiz
                const lessonId = editingLesson.id;

                // Update quiz content using quiz API
                const quizResponse = await quizAPI.createQuiz(lessonId, questions, settings);

                if (quizResponse.success) {
                    // Also update lesson title if changed
                    if (editingLesson.title !== lessonTitle) {
                        await lessonsAPI.update(lessonId, { title: lessonTitle });
                    }

                    // Update local state
                    setSections(sections.map(section =>
                        section.id === currentSectionId
                            ? {
                                ...section,
                                lessons: section.lessons.map(l =>
                                    l.id === lessonId ? { ...l, title: lessonTitle } : l
                                )
                            }
                            : section
                    ));

                    // IMPORTANT: Reload quiz data to get fresh data for next edit
                    try {
                        const reloadResponse = await quizAPI.getQuiz(lessonId);
                        if (reloadResponse.success && reloadResponse.data) {
                            const { questions } = reloadResponse.data;
                            const formattedQuestions: QuizQuestion[] = questions.map((q: any) => {
                                const correctAnswerIndices = q.answers
                                    .map((a: any, idx: number) => a.is_correct ? idx : -1)
                                    .filter((idx: number) => idx !== -1);

                                return {
                                    question: q.question,
                                    type: q.type === 'single_choice' ? 'single' : 'multiple',
                                    options: q.answers.map((a: any) => a.answer_text),
                                    correctAnswers: correctAnswerIndices,
                                    explanation: q.explanation || ''
                                };
                            });
                            setQuizQuestions(formattedQuestions);
                        }
                    } catch (reloadError) {
                        console.error('Failed to reload quiz data:', reloadError);
                    }

                    toast.success(`Đã cập nhật quiz với ${questions.length} câu hỏi!`);
                } else {
                    toast.error('Không thể cập nhật quiz');
                }
            } else {
                // CREATE new quiz
                const currentSection = sections.find(s => s.id === currentSectionId);
                const newLessonData: any = {
                    section_id: currentSectionId,
                    title: lessonTitle,
                    description: '',
                    content_type: 'quiz',
                    order_index: currentSection?.lessons.length || 0,
                    is_free: false,
                    quiz_settings: settings
                };

                const response = await lessonsAPI.create(newLessonData);

                if (response.success && response.data) {
                    const lessonId = response.data.id;
                    const quizResponse = await quizAPI.createQuiz(lessonId, questions, settings);

                    if (quizResponse.success) {
                        setSections(sections.map(section =>
                            section.id === currentSectionId
                                ? { ...section, lessons: [...section.lessons, response.data] }
                                : section
                        ));
                        toast.success(`Đã tạo quiz với ${questions.length} câu hỏi!`);
                    } else {
                        toast.error('Đã tạo lesson nhưng không thể lưu câu hỏi quiz');
                    }
                }
            }

            setLessonTitle('');
            setQuizQuestions([]);
            setEditingLesson(null);
            setShowAddLesson(false);
            setShowQuizEditor(false);
        } catch (error: any) {
            console.error('Error saving quiz:', error);
            toast.error('Không thể lưu quiz. Vui lòng thử lại.');
        } finally {
            setIsSaving(false);
        }
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
            // Determine if visibility is being changed from private to public
            let statusUpdate = undefined;
            if (course.visibility === 'private' && visibility === 'public') {
                statusUpdate = 'pending'; // Require admin approval
            }

            const updateData = {
                title: courseName,
                description: description,
                overview: courseOverview || null,
                visibility: visibility,
                image_url: imageUrl || null,
                ...(statusUpdate ? { status: statusUpdate } : {})
            };

            const response = await coursesAPI.updateCourse(course.id.toString(), updateData);
            if (response.success) {
                // Save tags after course update
                try {
                    if (selectedTags.length > 0) {
                        await coursesAPI.addCourseTags(course.id.toString(), selectedTags);
                    }
                } catch (tagError) {
                    toast.warning('Đã lưu khóa học nhưng không thể cập nhật chủ đề');
                }

                if (statusUpdate === 'pending') {
                    toast.info('Khóa học đã chuyển sang công khai và đang chờ phê duyệt của quản trị viên.');
                } else {
                    toast.success('Đã lưu thay đổi!');
                }
            } else {
                toast.error(response.message || 'Không thể lưu thay đổi');
            }
        } catch (error: any) {
            toast.error('Không thể lưu thay đổi. Vui lòng thử lại.');
        } finally {
            setIsSaving(false);
        }
    };

    // Drag and drop sensors
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

    // Handle section reorder
    const handleSectionDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = sections.findIndex((s) => s.id === active.id);
            const newIndex = sections.findIndex((s) => s.id === over.id);
            const newSections = arrayMove(sections, oldIndex, newIndex);
            setSections(newSections);

            try {
                const sectionsWithNewOrder = newSections.map((section, index) => ({
                    id: section.id,
                    order_index: index
                }));
                await sectionsAPI.reorderSections(course.id.toString(), sectionsWithNewOrder);
                toast.success('Đã cập nhật thứ tự mục');
            } catch (error) {
                toast.error('Không thể cập nhật thứ tự mục');
            }
        }
    };

    // Handle lesson reorder within a section
    const handleLessonDragEnd = async (event: DragEndEvent, sectionId: string) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const sectionIndex = sections.findIndex(s => s.id === sectionId);
            const section = sections[sectionIndex];
            const oldIndex = section.lessons.findIndex((l) => l.id === active.id);
            const newIndex = section.lessons.findIndex((l) => l.id === over.id);
            const newLessons = arrayMove(section.lessons, oldIndex, newIndex);

            const newSections = [...sections];
            newSections[sectionIndex] = { ...section, lessons: newLessons };
            setSections(newSections);

            try {
                const lessonsWithNewOrder = newLessons.map((lesson, index) => ({
                    id: lesson.id,
                    order_index: index
                }));
                await lessonsAPI.reorderLessons(sectionId, lessonsWithNewOrder);
                toast.success('Đã cập nhật thứ tự bài học');
            } catch (error) {
                toast.error('Không thể cập nhật thứ tự bài học');
            }
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
                                            // Reset video states
                                            setVideoSource('youtube');
                                            setVideoFile(null);
                                            setVideoPreview('');
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
                                                    <div className="space-y-4">
                                                        {/* Video Source Toggle */}
                                                        <div>
                                                            <Label>Nguồn video *</Label>
                                                            <div className="mt-2 flex gap-4">
                                                                <label
                                                                    className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${videoSource === 'youtube'
                                                                        ? 'border-[#1E88E5] bg-[#1E88E5]/5'
                                                                        : 'border-gray-200 hover:border-gray-300'
                                                                        }`}
                                                                    onClick={() => setVideoSource('youtube')}
                                                                >
                                                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${videoSource === 'youtube' ? 'border-[#1E88E5]' : 'border-gray-400'
                                                                        }`}>
                                                                        {videoSource === 'youtube' && (
                                                                            <div className="w-2 h-2 rounded-full bg-[#1E88E5]"></div>
                                                                        )}
                                                                    </div>
                                                                    <LinkIcon className="w-4 h-4" />
                                                                    <span className="font-medium text-sm">YouTube URL</span>
                                                                </label>
                                                                <label
                                                                    className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${videoSource === 'upload'
                                                                        ? 'border-[#1E88E5] bg-[#1E88E5]/5'
                                                                        : 'border-gray-200 hover:border-gray-300'
                                                                        }`}
                                                                    onClick={() => setVideoSource('upload')}
                                                                >
                                                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${videoSource === 'upload' ? 'border-[#1E88E5]' : 'border-gray-400'
                                                                        }`}>
                                                                        {videoSource === 'upload' && (
                                                                            <div className="w-2 h-2 rounded-full bg-[#1E88E5]"></div>
                                                                        )}
                                                                    </div>
                                                                    <Upload className="w-4 h-4" />
                                                                    <span className="font-medium text-sm">Upload từ máy</span>
                                                                </label>
                                                            </div>
                                                        </div>

                                                        {/* YouTube URL Input */}
                                                        {videoSource === 'youtube' && (
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

                                                                {/* YouTube Preview */}
                                                                {youtubeUrl && (() => {
                                                                    // Extract video ID from various YouTube URL formats
                                                                    let videoId = '';
                                                                    if (youtubeUrl.includes('youtube.com/watch?v=')) {
                                                                        videoId = youtubeUrl.split('v=')[1]?.split('&')[0] || '';
                                                                    } else if (youtubeUrl.includes('youtu.be/')) {
                                                                        videoId = youtubeUrl.split('youtu.be/')[1]?.split('?')[0] || '';
                                                                    } else if (youtubeUrl.includes('youtube.com/embed/')) {
                                                                        videoId = youtubeUrl.split('embed/')[1]?.split('?')[0] || '';
                                                                    } else if (/^[a-zA-Z0-9_-]{11}$/.test(youtubeUrl.trim())) {
                                                                        // Just the video ID
                                                                        videoId = youtubeUrl.trim();
                                                                    }

                                                                    if (videoId) {
                                                                        return (
                                                                            <div className="mt-4">
                                                                                <Label className="text-sm text-gray-700 mb-2 block">Xem trước video:</Label>
                                                                                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
                                                                                    <iframe
                                                                                        src={`https://www.youtube.com/embed/${videoId}`}
                                                                                        title="YouTube video preview"
                                                                                        className="absolute inset-0 w-full h-full"
                                                                                        frameBorder="0"
                                                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                                        allowFullScreen
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    }
                                                                    return null;
                                                                })()}
                                                            </div>
                                                        )}

                                                        {/* Video Upload Input */}
                                                        {videoSource === 'upload' && (
                                                            <div>
                                                                <Label>Chọn file video *</Label>
                                                                <div className="mt-2 space-y-3">
                                                                    <div className="flex items-center gap-3">
                                                                        <Input
                                                                            id="edit-video-file"
                                                                            type="file"
                                                                            accept="video/mp4,video/webm,video/ogg"
                                                                            onChange={(e) => {
                                                                                const file = e.target.files?.[0];
                                                                                if (file) {
                                                                                    if (file.size > 50 * 1024 * 1024) {
                                                                                        toast.error('Kích thước video không được vượt quá 50MB');
                                                                                        return;
                                                                                    }
                                                                                    setVideoFile(file);
                                                                                    setVideoPreview(URL.createObjectURL(file));
                                                                                }
                                                                            }}
                                                                            className="hidden"
                                                                            disabled={isUploadingVideo}
                                                                        />
                                                                        <Button
                                                                            type="button"
                                                                            variant="outline"
                                                                            onClick={() => document.getElementById('edit-video-file')?.click()}
                                                                            disabled={isUploadingVideo}
                                                                            className="flex items-center gap-2"
                                                                        >
                                                                            <Upload className="w-4 h-4" />
                                                                            {videoFile ? 'Thay đổi video' : 'Chọn video'}
                                                                        </Button>
                                                                        {videoFile && (
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="text-sm text-gray-600 truncate max-w-[200px]">
                                                                                    {videoFile.name}
                                                                                </span>
                                                                                <span className="text-xs text-gray-500">
                                                                                    ({(videoFile.size / 1024 / 1024).toFixed(2)} MB)
                                                                                </span>
                                                                                <Button
                                                                                    type="button"
                                                                                    variant="ghost"
                                                                                    size="sm"
                                                                                    onClick={() => {
                                                                                        setVideoFile(null);
                                                                                        setVideoPreview('');
                                                                                    }}
                                                                                    className="text-red-600 hover:text-red-700 p-1 h-auto"
                                                                                >
                                                                                    <X className="w-4 h-4" />
                                                                                </Button>
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    {/* Video Preview */}
                                                                    {videoPreview && (
                                                                        <div className="relative w-full rounded-lg border-2 border-dashed border-gray-300 overflow-hidden">
                                                                            <video
                                                                                src={videoPreview}
                                                                                controls
                                                                                className="w-full max-h-[200px]"
                                                                            />
                                                                        </div>
                                                                    )}

                                                                    <p className="text-sm text-gray-600">
                                                                        💡 Hỗ trợ: MP4, WebM, OGG. Tối đa 50MB
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )}
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

                                                {/* Edit Quiz Content Button for existing quiz lessons */}
                                                {lessonType === 'quiz' && editingLesson && (
                                                    <div className="border-t pt-4">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            className="w-full"
                                                            onClick={() => {
                                                                setShowQuizEditor(true);
                                                                setShowAddLesson(false);
                                                            }}
                                                        >
                                                            <Award className="w-4 h-4 mr-2" />
                                                            Chỉnh sửa nội dung Quiz ({quizQuestions.length} câu hỏi)
                                                        </Button>
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
                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSectionDragEnd}>
                                    <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                                        <div className="space-y-6">
                                            {sections.map((section) => (
                                                <SortableSection
                                                    key={section.id}
                                                    section={section}
                                                    editingSectionId={editingSectionId}
                                                    editSectionTitle={editSectionTitle}
                                                    sections={sections}
                                                    setEditingSectionId={setEditingSectionId}
                                                    setEditSectionTitle={setEditSectionTitle}
                                                    setSections={setSections}
                                                    handleSaveSectionEdit={handleSaveSectionEdit}
                                                    onRenderLessons={(section) => (
                                                        <div className="p-4 space-y-2">
                                                            {section.lessons.length > 0 ? (
                                                                <DndContext
                                                                    sensors={sensors}
                                                                    collisionDetection={closestCenter}
                                                                    onDragEnd={(e) => handleLessonDragEnd(e, section.id)}
                                                                >
                                                                    <SortableContext items={section.lessons.map(l => l.id)} strategy={verticalListSortingStrategy}>
                                                                        {section.lessons.map((lesson, lessonIndex) => (
                                                                            <SortableLesson
                                                                                key={lesson.id}
                                                                                lesson={lesson}
                                                                                lessonIndex={lessonIndex}
                                                                                onEdit={handleEditLesson}
                                                                                onDelete={async (lessonId) => {
                                                                                    try {
                                                                                        await lessonsAPI.delete(lessonId);
                                                                                        setSections(sections.map(s =>
                                                                                            s.id === section.id
                                                                                                ? { ...s, lessons: s.lessons.filter(l => l.id !== lessonId) }
                                                                                                : s
                                                                                        ));
                                                                                        toast.success('Đã xóa bài học');
                                                                                    } catch (error) {
                                                                                        toast.error('Không thể xóa bài học');
                                                                                    }
                                                                                }}
                                                                            />
                                                                        ))}
                                                                    </SortableContext>
                                                                </DndContext>
                                                            ) : (
                                                                <div className="text-center py-6 text-gray-500 text-sm">
                                                                    Chưa có mục nhỏ nào trong mục này
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                />
                                            ))}
                                        </div>
                                    </SortableContext>
                                </DndContext>
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
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-[#1E88E5]">
                            {editingLesson ? 'Chỉnh sửa Quiz' : 'Tạo Quiz Mới'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingLesson ? `Chỉnh sửa nội dung quiz cho bài học "${lessonTitle}"` : `Tạo quiz cho bài học "${lessonTitle}"`}
                        </DialogDescription>
                    </DialogHeader>
                    <QuizEditor
                        onSave={handleSaveQuiz}
                        initialQuestions={quizQuestions}
                        initialSettings={editingLesson?.quizSettings}
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
                        <p className="text-sm text-gray-500">Giảng viên: {course.owner?.full_name || 'Không xác định'}</p>
                    </div>
                </div>
            </DeleteConfirmDialog>
        </div>
    );
}
