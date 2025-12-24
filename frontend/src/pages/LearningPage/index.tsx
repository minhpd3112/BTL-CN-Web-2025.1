import { useState, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, FileText, Award } from 'lucide-react';
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

              const mappedLessons = lessons.map((lesson: any) => ({
                ...lesson,
                type: lesson.content_type || lesson.type || 'video',
                youtubeUrl: lesson.content_url || '',
                pdfUrl: lesson.content_type === 'document' ? lesson.content_url || '' : '',
                completed: progressMap[lesson.id] || false, // Use loaded progress
                isCompleted: progressMap[lesson.id] || false,
                isLocked: false,
              }));

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

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.split('v=')[1] || url.split('/').pop();
    return `https://www.youtube.com/embed/${videoId}`;
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
        onBack={() => navigateTo('my-courses')}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* 2. Main Content Area */}
        <div className="flex-1 flex flex-col relative overflow-y-auto custom-scrollbar">
          {/* Video Stage with Custom Controls */}
          {selectedLesson.type === 'video' && selectedLesson.youtubeUrl && (
            <CustomYouTubePlayer
              videoUrl={selectedLesson.youtubeUrl}
              title={selectedLesson.title}
            />
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
                          src={selectedLesson.pdfUrl}
                          className="w-full h-full"
                          title={selectedLesson.title}
                          allow="autoplay"
                        />
                        {/* Overlay trong suốt để chặn click nút "Open in new window" */}
                        <div className="absolute top-0 right-0 w-20 h-14 z-10 cursor-default" />
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
          <div className="bg-white text-gray-700 p-2 md:p-4 min-h-[300px] border-t border-gray-200">
            <div className="w-full max-w-[95%] xl:max-w-[90%] mx-auto">
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
              <div className="prose max-w-none">
                <h3 className="text-gray-800">Giới thiệu bài học</h3>
                <p className="text-gray-600">
                  Chào mừng bạn đến với bài học <strong>"{selectedLesson.title}"</strong>.
                  Trong phần này, chúng ta sẽ đi sâu vào các kiến thức quan trọng, đảm bảo bạn nắm vững nền tảng trước khi bước sang các module nâng cao.
                </p>
                <p className="text-gray-600">Hãy chú ý theo dõi video và ghi chú lại những điểm chính nhé!</p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Right Sidebar */}
        <div
          className={`hidden md:block flex-shrink-0 h-full transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-[350px] opacity-100' : 'w-0 opacity-0 overflow-hidden'
            }`}
        >
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
