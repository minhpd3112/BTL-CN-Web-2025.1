import { useState, useCallback, useEffect } from 'react';
import Markdown from 'react-markdown';
import { ChevronLeft, ChevronRight, CheckCircle, FileText, Award, ChevronDown, GripVertical } from 'lucide-react';
import { LearningHeader } from './components/LearningHeader';
import { CourseSidebar } from './components/CourseSidebar';
import { QuizTaker } from '@/components/shared/QuizTaker';
import { QuizResults } from '@/components/shared/QuizResults';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import CustomYouTubePlayer from '@/components/shared/CustomYouTubePlayer';
import { Course, Page } from '@/types';
import { sectionsAPI, lessonsAPI, lessonProgressAPI, quizAPI } from '@/services/api';


interface LearningPageProps {
  course: Course;
  navigateTo: (page: Page) => void;
}

export function LearningPage({ course, navigateTo }: LearningPageProps) {
  // State for real sections and lessons
  const [sections, setSections] = useState<any[]>([]);
  const [allLessons, setAllLessons] = useState<any[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<number[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(350);
  const [isResizing, setIsResizing] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(true);
  const [descriptionHeight, setDescriptionHeight] = useState(300);
  const [isResizingDescription, setIsResizingDescription] = useState(false);
  const [resizeStartY, setResizeStartY] = useState(0);
  const [resizeStartHeight, setResizeStartHeight] = useState(0);

  // Lesson progress tracking
  const [lessonsProgress, setLessonsProgress] = useState<Record<string, boolean>>({});

  // Quiz state - UPDATED to use real quiz data
  const [quizData, setQuizData] = useState<any>(null);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [quizResults, setQuizResults] = useState<any>(null);
  const [showQuizResults, setShowQuizResults] = useState(false);

  // Fetch real course sections and lessons
  const fetchCourseSections = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Fetching sections for course:', course.id);

      // Fetch user progress FIRST
      let progressMap: Record<string, boolean> = {};
      try {
        console.log('🔄 Fetching progress for course:', course.id);
        const progressResponse = await lessonProgressAPI.getUserProgress(course.id.toString());
        if (progressResponse.success && progressResponse.data) {
          progressResponse.data.forEach((p: any) => {
            progressMap[p.lesson_id] = p.completed;
          });
          setLessonsProgress(progressMap);
          console.log('📊 Loaded progress:', progressMap);
        }
      } catch (error: any) {
        console.error('❌ Failed to fetch progress:', error);
      }

      // Then fetch sections
      const sectionsResponse = await sectionsAPI.getByCourseId(course.id.toString());

      if (sectionsResponse.success && sectionsResponse.data) {
        const sectionsData = sectionsResponse.data;

        // Fetch lessons for each section
        const sectionsWithLessons = await Promise.all(
          sectionsData.map(async (section: any) => {
            try {
              const lessonsResponse = await lessonsAPI.getBySectionId(section.id.toString());
              const lessons = lessonsResponse.success ? lessonsResponse.data || [] : [];

              const mappedLessons = lessons.map((lesson: any) => {
                // Ensure content_text is always a safe string
                let contentText = '';
                if (typeof lesson.content_text === 'string') {
                  contentText = lesson.content_text;
                } else if (!lesson.content_text) {
                  contentText = '';
                } else if (typeof lesson.content_text === 'number' || typeof lesson.content_text === 'boolean') {
                  contentText = String(lesson.content_text);
                } else if (lesson.content_text.$$typeof) {
                  // This is a React element - don't render it, just show empty
                  contentText = '';
                } else if (typeof lesson.content_text === 'object') {
                  // Try to extract text or stringify
                  if (lesson.content_text.toString && lesson.content_text.toString() !== '[object Object]') {
                    contentText = lesson.content_text.toString();
                  } else {
                    contentText = '';
                  }
                }
                
                return {
                  ...lesson,
                  type: lesson.content_type || lesson.type || 'video',
                  youtubeUrl: lesson.content_url || '',
                  pdfUrl: lesson.content_type === 'pdf' ? lesson.content_url || '' : '',
                  content_text: contentText,
                  completed: progressMap[lesson.id] || false, // Use loaded progress
                  isCompleted: progressMap[lesson.id] || false,
                  isLocked: false,
                };
              });

              return {
                ...section,
                lessons: mappedLessons
              };
            } catch (err) {
              console.error('Failed to fetch lessons for section:', section.id, err);
              return { ...section, lessons: [] };
            }
          })
        );

        setSections(sectionsWithLessons);

        // Expand all sections by default
        setExpandedSections(sectionsWithLessons.map((s: any) => s.id));

        // Flatten all lessons
        const flatLessons = sectionsWithLessons.flatMap((s: any) => s.lessons);
        setAllLessons(flatLessons);

        // Set first lesson as selected
        if (flatLessons.length > 0) {
          console.log('Setting first lesson as selected:', flatLessons[0]);
          console.log('First lesson details:', {
            id: flatLessons[0].id,
            title: flatLessons[0].title,
            type: flatLessons[0].type,
            youtubeUrl: flatLessons[0].youtubeUrl,
            pdfUrl: flatLessons[0].pdfUrl
          });
          setSelectedLesson(flatLessons[0]);
        } else {
          toast.error('Khóa học chưa có bài học nào');
        }
      } else {
        toast.error('Không thể tải nội dung khóa học');
      }
    } catch (error) {
      console.error('Failed to fetch course sections:', error);
      toast.error('Không thể tải nội dung khóa học');
    } finally {
      setIsLoading(false);
    }
  }, [course.id]);

  // Fetch sections on mount
  useEffect(() => {
    fetchCourseSections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Load quiz data when a quiz lesson is selected
  useEffect(() => {
    const loadQuizData = async () => {
      if (selectedLesson?.type === 'quiz' && selectedLesson?.id) {
        setIsLoadingQuiz(true);
        setQuizData(null);
        setQuizResults(null);
        setShowQuizResults(false);

        try {
          const response = await quizAPI.getQuiz(selectedLesson.id);
          if (response.success) {
            setQuizData(response.data);
          } else {
            toast.error('Không thể tải quiz');
          }
        } catch (error) {
          console.error('Error loading quiz:', error);
          toast.error('Không thể tải quiz');
        } finally {
          setIsLoadingQuiz(false);
        }
      }
    };

    loadQuizData();
  }, [selectedLesson?.id, selectedLesson?.type]);

  // Toggle lesson completion
  const handleToggleLessonCompletion = async (lessonId: string) => {
    try {
      const response = await lessonProgressAPI.toggleCompletion(lessonId);
      if (response.success) {
        // Update local progress state
        const newCompleted = !lessonsProgress[lessonId];
        setLessonsProgress(prev => ({
          ...prev,
          [lessonId]: newCompleted
        }));

        // Update sections state to reflect change immediately
        setSections(prevSections =>
          prevSections.map((section: any) => ({
            ...section,
            lessons: section.lessons.map((lesson: any) =>
              lesson.id === lessonId
                ? { ...lesson, completed: newCompleted, isCompleted: newCompleted }
                : lesson
            )
          }))
        );

        // Update allLessons
        setAllLessons(prevLessons =>
          prevLessons.map(lesson =>
            lesson.id === lessonId
              ? { ...lesson, completed: newCompleted, isCompleted: newCompleted }
              : lesson
          )
        );

        toast.success(newCompleted ? 'Đã đánh dấu hoàn thành!' : 'Đã bỏ đánh dấu!');
      }
    } catch (error) {
      console.error('Failed to toggle lesson completion:', error);
      toast.error('Không thể cập nhật tiến độ');
    }
  };

  const toggleSection = (sectionId: number) => {
    if (expandedSections.includes(sectionId)) {
      setExpandedSections(expandedSections.filter(id => id !== sectionId));
    } else {
      setExpandedSections([...expandedSections, sectionId]);
    }
  };

  // Sidebar resize handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 250 && newWidth <= 600) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // Description resize handlers
  const handleDescriptionMouseDown = (e: React.MouseEvent) => {
    setIsResizingDescription(true);
    setResizeStartY(e.clientY);
    setResizeStartHeight(descriptionHeight);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingDescription) return;

      // Calculate delta: negative when dragging up, positive when dragging down
      const delta = resizeStartY - e.clientY;
      const newHeight = resizeStartHeight + delta;

      if (newHeight >= 200 && newHeight <= 800) {
        setDescriptionHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      setIsResizingDescription(false);
    };

    if (isResizingDescription) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingDescription, resizeStartY, resizeStartHeight]);

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.split('v=')[1] || url.split('/').pop();
    return `https://www.youtube.com/embed/${videoId}`;
  };

  // Convert Google Drive URL to preview format for embedding
  const convertGoogleDriveUrl = (url: string) => {
    if (!url) return url;

    // Check if it's a Google Drive link
    if (url.includes('drive.google.com')) {
      // Extract file ID from various Google Drive URL formats
      const fileIdMatch = url.match(/\/file\/d\/([^\/]+)/);
      if (fileIdMatch && fileIdMatch[1]) {
        const fileId = fileIdMatch[1];
        // Return preview URL format
        return `https://drive.google.com/file/d/${fileId}/preview`;
      }
    }

    // Return original URL if not a Google Drive link or can't extract ID
    return url;
  };

  // Calculate progress from state
  const completedLessons = allLessons.filter(l => l.completed).length;
  const progress = allLessons.length > 0 ? (completedLessons / allLessons.length) * 100 : 0;

  const currentIndex = selectedLesson ? allLessons.findIndex(l => l.id === selectedLesson.id) : -1;
  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < allLessons.length - 1;

  const handlePrevious = () => {
    if (canGoPrevious) {
      setSelectedLesson(allLessons[currentIndex - 1]);
      setQuizResults(null);
      setShowQuizResults(false);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      setSelectedLesson(allLessons[currentIndex + 1]);
      setQuizResults(null);
      setShowQuizResults(false);
    }
  };

  // Function to fetch and update progress from backend
  const fetchProgress = async () => {
    try {
      const progressResponse = await lessonProgressAPI.getUserProgress(course.id.toString());
      const progressMap: { [key: string]: boolean } = {};

      if (progressResponse.success && progressResponse.data) {
        progressResponse.data.forEach((p: any) => {
          progressMap[p.lesson_id] = p.completed;
        });
        setLessonsProgress(progressMap);

        // Also update sections with new progress
        const updatedSections = sections.map((section: any) => ({
          ...section,
          lessons: section.lessons.map((lesson: any) => ({
            ...lesson,
            completed: progressMap[lesson.id] || false,
            isCompleted: progressMap[lesson.id] || false
          }))
        }));
        setSections(updatedSections);

        // IMPORTANT: Update allLessons to trigger progress bar recalculation
        const flatLessons = updatedSections.flatMap((s: any) => s.lessons);
        setAllLessons(flatLessons);

        console.log('✅ Progress reloaded from backend:', progressMap);
      }
    } catch (error) {
      console.error('❌ Failed to fetch progress:', error);
    }
  };

  // Quiz submission handler
  const handleQuizSubmit = async (answers: Record<string, string[]>, timeSpent: number) => {
    try {
      const response = await quizAPI.submitQuiz(selectedLesson.id, answers, timeSpent);
      if (response.success) {
        setQuizResults(response.data);
        setShowQuizResults(true);

        // If passed, reload progress from backend (backend already updated it)
        if (response.data.passed) {
          // Backend already updated lesson_progress, just reload it
          await fetchProgress();
        }

        return response;
      }
    } catch (error) {
      console.error('Quiz submission error:', error);
      throw error;
    }
  };

  const handleQuizRetry = () => {
    setQuizResults(null);
    setShowQuizResults(false);
    setQuizData(null);

    // Reload quiz
    quizAPI.getQuiz(selectedLesson.id).then((response) => {
      if (response.success) {
        setQuizData(response.data);
      }
    });
  };

  // Transform sections data for Sidebar
  const sidebarSections = sections.map((s: any) => ({
    ...s,
    lessons: s.lessons.map((l: any) => ({
      ...l,
      type: l.type as 'video' | 'pdf' | 'quiz',
      isCompleted: l.completed,
      isLocked: false
    }))
  }));

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E88E5] mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải nội dung khóa học...</p>
        </div>
      </div>
    );
  }
  // Show empty state if no lessons
  if (!selectedLesson) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Khóa học chưa có nội dung</p>
          <Button onClick={() => navigateTo('my-courses')} className="mt-4">
            Quay lại
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-800 font-sans overflow-hidden">
      {/* 1. Header */}
      <LearningHeader
        courseTitle={course.title}
        progress={progress}
        completedLessons={completedLessons}
        totalLessons={allLessons.length}
        onBack={() => navigateTo('course-detail', course)}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* 2. Main Content Area */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          {/* Video Stage - Supports both YouTube and uploaded videos */}
          {selectedLesson.type === 'video' && selectedLesson.youtubeUrl && (
            (() => {
              const videoUrl = selectedLesson.youtubeUrl;
              // Check if it's a YouTube URL or direct video URL
              const isYouTubeUrl = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');

              if (isYouTubeUrl) {
                return (
                  <CustomYouTubePlayer
                    videoUrl={videoUrl}
                    title={selectedLesson.title}
                  />
                );
              } else {
                // Direct video URL (from Supabase Storage or other sources)
                return (
                  <div className="flex-1 bg-black flex items-center justify-center">
                    <video
                      src={videoUrl}
                      controls
                      autoPlay
                      className="w-full h-full max-h-[70vh] object-contain"
                      controlsList="nodownload"
                    >
                      Trình duyệt của bạn không hỗ trợ video.
                    </video>
                  </div>
                );
              }
            })()
          )}

          {/* Text/Article Content */}
          {(selectedLesson.type === 'article' || selectedLesson.type === 'text') && (
            <div className="flex-1 bg-white overflow-y-auto p-4 md:p-8">
              <div className="max-w-4xl mx-auto">
                <Card>
                  <CardContent className="p-6 md:p-8">
                    {selectedLesson.content_text ? (
                      <div className="markdown-content">
                        {(() => {
                          try {
                            const content = typeof selectedLesson.content_text === 'string' 
                              ? selectedLesson.content_text 
                              : '';
                            if (!content) return <p className="text-gray-500">Nội dung trống</p>;
                            return <Markdown children={content} />;
                          } catch (error) {
                            console.error('❌ Markdown render error:', error);
                            return <p className="text-gray-500">Lỗi hiển thị nội dung</p>;
                          }
                        })()}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                        <FileText className="w-16 h-16 mb-4 opacity-50" />
                        <p>Nội dung đang được cập nhật</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* PDF/Quiz Stage - Original flex-1 approach */}
          {(selectedLesson.type === 'pdf' || selectedLesson.type === 'quiz') && (
            <div className="flex-1 flex flex-col min-h-[50vh] transition-all duration-300">
              {selectedLesson.type === 'pdf' && (
                <div className="flex-1 bg-gray-100 flex items-center justify-center p-2 md:p-4 h-full">
                  <div className="w-full h-full max-w-[95%] xl:max-w-[90%] bg-white rounded-lg shadow-lg overflow-hidden relative">
                    {selectedLesson.pdfUrl && selectedLesson.pdfUrl !== '#' ? (
                      <>
                        <iframe
                          src={convertGoogleDriveUrl(selectedLesson.pdfUrl)}
                          className="w-full h-full"
                          title={selectedLesson.title}
                          allow="autoplay"
                        />
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <FileText className="w-16 h-16 mb-4 opacity-50" />
                        <p>Tài liệu đang được cập nhật</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedLesson.type === 'quiz' && (
                <div className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-8 flex justify-center">
                  <div className="w-full max-w-4xl">
                    {isLoadingQuiz ? (
                      <Card>
                        <CardContent className="p-12 text-center">
                          <div className="w-16 h-16 border-4 border-[#1E88E5] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                          <p className="text-gray-600">Đang tải quiz...</p>
                        </CardContent>
                      </Card>
                    ) : showQuizResults && quizResults ? (
                      <QuizResults
                        results={quizResults}
                        quizType={quizData?.lesson?.quiz_settings?.quizType || 'practice'}
                        onRetry={handleQuizRetry}
                        onClose={() => {
                          setShowQuizResults(false);
                          setQuizResults(null);
                        }}
                      />
                    ) : quizData ? (
                      <QuizTaker
                        lessonId={selectedLesson.id}
                        quizData={quizData}
                        onSubmit={handleQuizSubmit}
                        onClose={() => {
                          handlePrevious();
                        }}
                      />
                    ) : (
                      <Card>
                        <CardContent className="p-12 text-center">
                          <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <h3 className="mb-2">Quiz chưa sẵn sàng</h3>
                          <p className="text-gray-600">Quiz này đang được cập nhật</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          {/* Lesson Info & Navigation (Below Player) */}
          <div
            style={{
              height: `${descriptionHeight}px`,
              maxHeight: '800px'
            }}
            className="bg-white text-gray-700 border-t border-gray-200 relative overflow-auto flex-shrink-0"
          >
            {/* Resize Handle removed */}

            <div className="w-full max-w-[95%] xl:max-w-[90%] mx-auto p-2 md:p-4 pt-4">
              <div className="flex items-start justify-between mb-8 pb-8 border-b border-gray-200">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">{selectedLesson.title}</h2>
                  <p className="text-gray-500">Đã cập nhật tháng 12/2024</p>
                </div>
                {/* Navigation Buttons */}
                <div className="flex items-center gap-3">
                  <Button
                    onClick={handlePrevious}
                    disabled={!canGoPrevious}
                    className="bg-[#1E88E5] hover:bg-[#1565C0] text-white border-0"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" /> Bài trước
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={!canGoNext}
                    className="bg-[#1E88E5] hover:bg-[#1565C0] text-white border-0"
                  >
                    Bài tiếp <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>

              {/* Description / Content placeholder */}
              <div className="border-t border-gray-200">
                <button
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-gray-800">Giới thiệu bài học</h3>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${isDescriptionExpanded ? 'rotate-180' : ''
                      }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${isDescriptionExpanded ? 'max-h-96' : 'max-h-0'
                    }`}
                >
                  <div className="prose max-w-none p-4 pt-0">
                    <p className="text-gray-600">
                      Chào mừng bạn đến với bài học <strong>"{selectedLesson.title}"</strong>.
                      Trong phần này, chúng ta sẽ đi sâu vào các kiến thức quan trọng, đảm bảo bạn nắm vững nền tảng trước khi bước sang các module nâng cao.
                    </p>
                    <p className="text-gray-600">Hãy chú ý theo dõi video và ghi chú lại những điểm chính nhé!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Right Sidebar */}
        <div
          style={{ width: isSidebarOpen ? `${sidebarWidth}px` : 0 }}
          className={`hidden md:block flex-shrink-0 h-full overflow-hidden transition-opacity duration-300 ease-in-out relative ${isSidebarOpen ? 'opacity-100' : 'opacity-0'
            }`}
        >
          {/* Resize Handle */}
          {isSidebarOpen && (
            <div
              onMouseDown={handleMouseDown}
              className={`absolute left-0 top-0 bottom-0 w-1 hover:w-1.5 bg-gray-300 hover:bg-[#1E88E5] cursor-col-resize z-50 group transition-all ${isResizing ? 'w-1.5 bg-[#1E88E5]' : ''
                }`}
            >
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="w-4 h-4 text-[#1E88E5]" />
              </div>
            </div>
          )}
          <CourseSidebar
            sections={sidebarSections}
            currentLessonId={selectedLesson.id}
            onSelectLesson={(id: number) => {
              const lesson = allLessons.find(l => l.id === id);
              if (lesson) {
                setSelectedLesson(lesson);
                setShowQuizResults(false);
                setQuizResults(null);
              }
            }}
            onToggleCompletion={handleToggleLessonCompletion}
          />
        </div>
      </div>
    </div>
  );
}
