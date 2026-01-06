import { useState, useEffect } from 'react';
import { Plus, Lock, Globe, Video, FileText, Award, Trash2, BookOpen, Upload, Link as LinkIcon, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { coursesAPI, sectionsAPI, lessonsAPI, tagsAPI, supabase } from '@/services/api';
import { Page, User } from '@/types';
import { QuizEditor } from '@/components/shared/QuizEditor';
import { PageHeader } from '@/components/shared/PageHeader';
import { AnimatedSection } from '@/utils/animations';
import { QuizQuestion, QuizSettings } from '@/types';

interface Section {
  id: number;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
}

interface Lesson {
  id: number;
  title: string;
  description: string;
  type: 'video' | 'text' | 'pdf' | 'quiz';
  duration: string;
  youtubeUrl?: string;
  videoUrl?: string; // For uploaded video
  content?: string;
  pdfUrl?: string;
  quizQuestions?: QuizQuestion[];
  quizSettings?: QuizSettings;
}

interface CreateCoursePageProps {
  navigateTo: (page: Page) => void;
  currentUser: User;
}

export function CreateCoursePage({ navigateTo, currentUser }: CreateCoursePageProps) {
  const [courseName, setCourseName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'private' | 'public'>('private');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [courseOverview, setCourseOverview] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  // Sections and lessons
  const [sections, setSections] = useState<Section[]>([]);
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
  const [quizSettings, setQuizSettings] = useState<QuizSettings>({ quizType: 'practice', passingScore: 70 });
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  // Video upload states
  const [videoSource, setVideoSource] = useState<'youtube' | 'upload'>('youtube');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>('');
  const [pendingVideoFiles, setPendingVideoFiles] = useState<Map<number, File>>(new Map());

  // Fetch available tags on mount
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await tagsAPI.getAllTags();
        if (response.success && response.data) {
          let tagNames = response.data.map((tag: any) => tag.name);
          // Sort tags: "Others" always at the end
          tagNames = tagNames.sort((a: string, b: string) => {
            if (a.toLowerCase() === 'others') return 1;
            if (b.toLowerCase() === 'others') return -1;
            return a.localeCompare(b);
          });
          setAvailableTags(tagNames);
        }
      } catch (error: any) {
        console.error('Error fetching tags:', error);
        setAvailableTags([]);
      }
    };

    fetchTags();
  }, []);

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
    // Reset video upload states when editing
    setVideoSource(lesson.youtubeUrl ? 'youtube' : (lesson.videoUrl ? 'upload' : 'youtube'));
    setVideoFile(null);
    setVideoPreview(lesson.videoUrl || '');
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
          ...(lessonType === 'video' && videoSource === 'youtube' && { youtubeUrl, videoUrl: undefined }),
          ...(lessonType === 'video' && videoSource === 'upload' && videoFile && {
            youtubeUrl: undefined,
            videoUrl: `pending:${videoFile.name}` // Mark as pending upload
          }),
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
          ...(lessonType === 'video' && videoSource === 'youtube' && { youtubeUrl }),
          ...(lessonType === 'video' && videoSource === 'upload' && videoFile && {
            videoUrl: `pending:${videoFile.name}` // Mark as pending upload
          }),
          ...(lessonType === 'text' && { content: lessonContent }),
          ...(lessonType === 'pdf' && { pdfUrl })
        };

        setSections(sections.map(section =>
          section.id === currentSectionId
            ? { ...section, lessons: [...section.lessons, newLesson] }
            : section
        ));

        // Save video file to pending uploads if using upload source
        if (lessonType === 'video' && videoSource === 'upload' && videoFile) {
          setPendingVideoFiles(prev => new Map(prev).set(newLesson.id, videoFile));
        }

        toast.success('Đã thêm mục nhỏ!');
      }

      setLessonTitle('');
      setYoutubeUrl('');
      setLessonContent('');
      setPdfUrl('');
      setVideoFile(null);
      setVideoPreview('');
      setVideoSource('youtube');
      setEditingLesson(null);
      setShowAddLesson(false);
    }
  };

  const handleSaveQuiz = (questions: QuizQuestion[], settings: QuizSettings) => {
    if (!currentSectionId) return;

    // Calculate estimated duration based on quiz type
    const estimatedDuration = settings.quizType === 'exam'
      ? `${settings.timeLimit} phút`
      : `${questions.length * 2} phút`;

    if (editingLesson) {
      // Update existing quiz
      const updatedLesson: Lesson = {
        ...editingLesson,
        title: lessonTitle,
        description: '',
        type: 'quiz',
        duration: estimatedDuration,
        quizQuestions: questions,
        quizSettings: settings
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
        duration: estimatedDuration,
        quizQuestions: questions,
        quizSettings: settings
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
    setQuizSettings({ quizType: 'practice', passingScore: 70 });
    setEditingLesson(null);
    setShowAddLesson(false);
    setShowQuizEditor(false);
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      // Get the current auth token from cookies
      const { authCookies } = require('@/utils/cookieStorage');
      const authToken = authCookies.getAuthToken();

      if (!authToken) {
        console.error('No auth token found. User must be logged in to upload images.');
        toast.error('Vui lòng đăng nhập để upload ảnh');
        return null;
      }

      // Set the session for Supabase client
      // This ensures the upload uses a fresh token
      await supabase.auth.setSession({
        access_token: authToken,
        refresh_token: '', // Not needed for upload
      });

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `course-images/${fileName}`;

      const { data, error } = await supabase.storage
        .from('course-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('course-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Image upload failed:', error);
      return null;
    }
  };

  const uploadVideo = async (file: File): Promise<string | null> => {
    try {
      // Validate file size (max 50MB)
      const MAX_SIZE = 50 * 1024 * 1024; // 50MB
      if (file.size > MAX_SIZE) {
        toast.error('Kích thước video không được vượt quá 50MB');
        return null;
      }


      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      toast.info('Đang upload video... Vui lòng đợi.');

      // Try upload directly - for public buckets this should work
      const { data, error } = await supabase.storage
        .from('course-videos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Video upload error:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        toast.error(`Upload thất bại: ${error.message}`);
        return null;
      }


      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('course-videos')
        .getPublicUrl(filePath);

      toast.success('Upload video thành công!');
      return publicUrl;
    } catch (error: any) {
      console.error('Video upload failed:', error);
      console.error('Full error:', JSON.stringify(error, null, 2));
      toast.error(`Upload video thất bại: ${error?.message || 'Unknown error'}`);
      return null;
    }
  };

  const handleSaveCourse = async () => {
    // Validation
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

    setIsCreating(true);

    try {
      let uploadedImageUrl: string | null = imageUrl;

      // Upload image if file is selected
      if (imageFile) {
        toast.info('Đang upload ảnh bìa...');
        uploadedImageUrl = await uploadImage(imageFile);
        if (!uploadedImageUrl) {
          toast.error('Không thể upload ảnh. Vui lòng thử lại.');
          setIsCreating(false);
          return;
        }
      }

      // Prepare course data matching backend schema
      const courseData = {
        title: courseName,
        description: description,
        overview: courseOverview || null,
        visibility: visibility,
        // Nếu public thì status là 'pending' (chờ admin duyệt), nếu private thì 'approved'
        status: visibility === 'public' ? 'pending' : 'approved',
        image_url: uploadedImageUrl || null,
        // Note: owner_id will be set by backend from auth token
      };

      // Create the course
      const response = await coursesAPI.createCourse(courseData);

      if (response.success && response.data) {
        const courseId = response.data.id;

        toast.success('Đã tạo khóa học thành công!');

        // Save tags to course
        if (selectedTags.length > 0) {
          try {
            const tagResponse = await coursesAPI.addCourseTags(courseId, selectedTags);
          } catch (error: any) {
            console.error('Error saving tags:', error);
            console.error('Error details:', {
              message: error?.message,
              response: error?.response?.data,
              status: error?.response?.status
            });
            toast.warning('Khóa học đã tạo nhưng không thể lưu chủ đề');
          }
        }

        // Save sections and lessons
        if (sections.length > 0) {
          try {
            for (const section of sections) {
              const sectionData = {
                course_id: courseId.toString(),
                title: section.title,
                description: section.description || '',
                order_index: section.order - 1, // Convert to 0-indexed
              };

              const sectionResponse = await sectionsAPI.create(sectionData);

              if (sectionResponse.success && sectionResponse.data && section.lessons.length > 0) {
                const sectionId = sectionResponse.data.id;

                // Save lessons for this section
                for (let i = 0; i < section.lessons.length; i++) {
                  const lesson = section.lessons[i];
                  const lessonData: any = {
                    section_id: sectionId.toString(),
                    title: lesson.title,
                    description: lesson.description || '',
                    content_type: lesson.type === 'text' ? 'article' : lesson.type,
                    order_index: i,
                    is_free: false,
                  };

                  // Map to correct database columns
                  if (lesson.type === 'video') {
                    if (lesson.youtubeUrl) {
                      // YouTube video
                      lessonData.content_url = lesson.youtubeUrl;
                    } else if (lesson.videoUrl?.startsWith('pending:')) {
                      // Need to upload video file
                      const pendingFile = pendingVideoFiles.get(lesson.id);
                      if (pendingFile) {
                        toast.info(`Đang upload video: ${lesson.title}...`);
                        const uploadedUrl = await uploadVideo(pendingFile);
                        if (uploadedUrl) {
                          lessonData.content_url = uploadedUrl;
                        } else {
                          console.error('Failed to upload video for lesson:', lesson.title);
                          toast.warning(`Không thể upload video cho bài: ${lesson.title}`);
                        }
                      }
                    } else if (lesson.videoUrl) {
                      // Already uploaded video URL
                      lessonData.content_url = lesson.videoUrl;
                    }
                  } else if (lesson.type === 'text' && lesson.content) {
                    lessonData.content_text = lesson.content;
                  } else if (lesson.type === 'pdf' && lesson.pdfUrl) {
                    lessonData.content_url = lesson.pdfUrl;
                  }

                  await lessonsAPI.create(lessonData);
                }
              }
            }
          } catch (error) {
            console.error('Error saving sections/lessons:', error);
            toast.warning('Khóa học đã tạo nhưng không thể lưu nội dung');
          }
        }

        setTimeout(() => navigateTo('my-courses'), 1500);
      } else {
        toast.error(response.message || 'Không thể tạo khóa học');
      }
    } catch (error: any) {
      console.error('Create course error:', error);

      if (error?.response?.status === 401) {
        toast.error('Vui lòng đăng nhập để tạo khóa học');
      } else if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Đã xảy ra lỗi khi tạo khóa học. Vui lòng thử lại.');
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <AnimatedSection animation="fade-up">
        <PageHeader
          icon={<Plus className="w-8 h-8" />}
          title="Tạo khóa học mới"
          description="Điền thông tin để tạo khóa học của bạn"
        />
      </AnimatedSection>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <AnimatedSection animation="fade-up" delay={100}>
            <Card className="mb-6 hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="border-b bg-gradient-to-r from-[#1E88E5]/5 to-transparent">
                <CardTitle className="text-lg font-bold text-[#1E88E5]">
                  Thông tin cơ bản
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="course-name">Tên khóa học *</Label>
                  <Input
                    id="course-name"
                    placeholder="VD: Lập trình React từ cơ bản đến nâng cao"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Mô tả *</Label>
                  <Textarea
                    id="description"
                    placeholder="Mô tả ngắn gọn về khóa học..."
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="overview">Tổng quan khóa học</Label>
                  <Textarea
                    id="overview"
                    placeholder={`Nhập nội dung theo định dạng Markdown. Ví dụ:\n\n## Bạn sẽ học được gì?\n- Nắm vững kiến thức cơ bản\n- Xây dựng dự án thực tế\n- Áp dụng vào công việc\n\n## Yêu cầu\n- Kiến thức lập trình cơ bản\n- Máy tính cá nhân\n- Tinh thần học hỏi`}
                    rows={10}
                    value={courseOverview}
                    onChange={(e) => setCourseOverview(e.target.value)}
                    className="mt-2 font-mono text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="image-file">Ảnh bìa khóa học</Label>
                  <div className="mt-2 space-y-3">
                    {/* File Input */}
                    <div className="flex items-center gap-3">
                      <Input
                        id="image-file"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            // Validate file size (max 5MB)
                            if (file.size > 5 * 1024 * 1024) {
                              toast.error('Kích thước ảnh không được vượt quá 5MB');
                              return;
                            }
                            setImageFile(file);
                            // Create preview
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setImagePreview(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('image-file')?.click()}
                        className="flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        {imageFile ? 'Thay đổi ảnh' : 'Chọn ảnh'}
                      </Button>
                      {imageFile && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview('');
                            const input = document.getElementById('image-file') as HTMLInputElement;
                            if (input) input.value = '';
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    {/* Image Preview */}
                    {imagePreview && (
                      <div className="relative w-full h-48 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Empty State */}
                    {!imagePreview && (
                      <div className="flex items-center justify-center w-full h-48 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                        <div className="text-center">
                          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">Chưa chọn ảnh bìa</p>
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-gray-500">
                      💡 Chọn ảnh có kích thước tối đa 5MB (định dạng: JPG, PNG, WebP)
                    </p>
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
                    <Select
                      value=""
                      onValueChange={(value) => {
                        if (value && !selectedTags.includes(value)) {
                          setSelectedTags([...selectedTags, value]);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Thêm chủ đề..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTags.map(tagName => (
                          <SelectItem key={tagName} value={tagName}>
                            {tagName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
          </AnimatedSection>

          <AnimatedSection animation="fade-up" delay={200}>
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
                                  <Label htmlFor="youtube-url">Link YouTube *</Label>
                                  <div className="flex gap-2 mt-2">
                                    <LinkIcon className="w-5 h-5 text-gray-400 mt-2" />
                                    <Input
                                      id="youtube-url"
                                      placeholder="https://www.youtube.com/watch?v=..."
                                      value={youtubeUrl}
                                      onChange={(e) => setYoutubeUrl(e.target.value)}
                                    />
                                  </div>
                                  <p className="text-sm text-gray-600 mt-2">
                                    💡 Có thể nhập link đầy đủ hoặc chỉ ID video
                                  </p>
                                </div>
                              )}

                              {/* Video Upload Input */}
                              {videoSource === 'upload' && (
                                <div>
                                  <Label>Chọn file video *</Label>
                                  <div className="mt-2 space-y-3">
                                    <div className="flex items-center gap-3">
                                      <Input
                                        id="video-file"
                                        type="file"
                                        accept="video/mp4,video/webm,video/ogg"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            // Validate file size (max 50MB)
                                            if (file.size > 50 * 1024 * 1024) {
                                              toast.error('Kích thước video không được vượt quá 50MB');
                                              return;
                                            }
                                            setVideoFile(file);
                                            // Create preview URL
                                            const previewUrl = URL.createObjectURL(file);
                                            setVideoPreview(previewUrl);
                                          }
                                        }}
                                        className="hidden"
                                      />
                                      <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => document.getElementById('video-file')?.click()}
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
                                              const input = document.getElementById('video-file') as HTMLInputElement;
                                              if (input) input.value = '';
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
          </AnimatedSection>
        </div>

        <div className="lg:col-span-1">
          <AnimatedSection animation="slide-left" delay={150}>
            <Card className="sticky top-20 hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="border-b bg-gradient-to-r from-[#1E88E5]/5 to-transparent">
                <CardTitle className="text-lg font-bold text-[#1E88E5]">Hành động</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-6">
                <Button className="w-full bg-[#1E88E5] text-white hover:bg-[#1565C0]" onClick={handleSaveCourse}>
                  Lưu và tạo khóa học
                </Button>
                <Button variant="outline" className="w-full border-[#1E88E5] text-[#1E88E5] hover:bg-[#1E88E5]/5 hover:text-[#1565C0] transition-colors" onClick={() => navigateTo('my-courses')}>
                  Hủy
                </Button>
              </CardContent>
            </Card>
          </AnimatedSection>
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
            initialSettings={quizSettings}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
