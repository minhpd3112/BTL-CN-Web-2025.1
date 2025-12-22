import { useState, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, FileText, Award } from 'lucide-react';
import { LearningHeader } from './components/LearningHeader';
import { CourseSidebar } from './components/CourseSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Course, Page } from '@/types';
import { sectionsAPI, lessonsAPI, lessonProgressAPI } from '@/services/api';

// Mock quiz questions
const mockQuizQuestions = [
  {
    id: 1,
    question: 'React là gì?',
    options: [
      'Một thư viện JavaScript để xây dựng giao diện người dùng',
      'Một framework backend',
      'Một ngôn ngữ lập trình mới',
      'Một database'
    ],
    correctAnswer: 0,
    explanation: 'React là một thư viện JavaScript mã nguồn mở được phát triển bởi Facebook, chuyên dùng để xây dựng giao diện người dùng.'
  },
  {
    id: 2,
    question: 'JSX là viết tắt của gì?',
    options: [
      'JavaScript XML',
      'Java Syntax Extension',
      'JavaScript Extension',
      'JSON XML'
    ],
    correctAnswer: 0,
    explanation: 'JSX là viết tắt của JavaScript XML, cho phép viết cú pháp giống HTML trong JavaScript.'
  },
  {
    id: 3,
    question: 'Hook nào được dùng để quản lý state trong function component?',
    options: [
      'useEffect',
      'useState',
      'useContext',
      'useReducer'
    ],
    correctAnswer: 1,
    explanation: 'useState là hook cơ bản nhất để quản lý state trong React function component.'
  },
  {
    id: 4,
    question: 'Virtual DOM trong React có tác dụng gì?',
    options: [
      'Lưu trữ dữ liệu người dùng',
      'Tối ưu hiệu suất render',
      'Kết nối với database',
      'Quản lý routing'
    ],
    correctAnswer: 1,
    explanation: 'Virtual DOM giúp React tối ưu hiệu suất bằng cách so sánh và chỉ cập nhật những phần thay đổi trên DOM thật.'
  },
  {
    id: 5,
    question: 'Props trong React được dùng để làm gì?',
    options: [
      'Lưu trữ state',
      'Truyền dữ liệu từ component cha sang component con',
      'Kết nối API',
      'Tạo event handler'
    ],
    correctAnswer: 1,
    explanation: 'Props (properties) là cách để truyền dữ liệu từ component cha xuống component con trong React.'
  }
];

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

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

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
      setShowResults(false);
      setQuizAnswers({});
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      setSelectedLesson(allLessons[currentIndex + 1]);
      setShowResults(false);
      setQuizAnswers({});
    }
  };

  const handleQuizAnswerChange = (questionId: number, answerIndex: number) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleSubmitQuiz = () => {
    if (Object.keys(quizAnswers).length < mockQuizQuestions.length) {
      toast.error('Vui lòng trả lời tất cả các câu hỏi!');
      return;
    }
    setShowResults(true);

    const correctCount = mockQuizQuestions.filter(q => quizAnswers[q.id] === q.correctAnswer).length;
    const percentage = (correctCount / mockQuizQuestions.length) * 100;

    if (percentage >= 80) {
      toast.success(`Xuất sắc! Bạn đạt ${correctCount}/${mockQuizQuestions.length} câu đúng (${percentage.toFixed(0)}%)`);
    } else if (percentage >= 50) {
      toast.success(`Khá tốt! Bạn đạt ${correctCount}/${mockQuizQuestions.length} câu đúng (${percentage.toFixed(0)}%)`);
    } else {
      toast.error(`Bạn cần cố gắng thêm. Điểm: ${correctCount}/${mockQuizQuestions.length} (${percentage.toFixed(0)}%)`);
    }
  };

  const handleResetQuiz = () => {
    setQuizAnswers({});
    setShowResults(false);
    toast.success('Đã làm mới quiz!');
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
          {/* Video Stage - Height-first approach */}
          {selectedLesson.type === 'video' && selectedLesson.youtubeUrl && (
            <div className="flex flex-col transition-all duration-300 overflow-hidden">
              <div className="w-full flex items-center justify-center bg-gray-100 p-2 md:p-4">
                <div className="h-[calc(100vh-380px)] w-auto aspect-video max-w-[95%] xl:max-w-[90%] mx-auto shadow-xl rounded-lg overflow-hidden relative group">
                  <iframe
                    src={getYouTubeEmbedUrl(selectedLesson.youtubeUrl)}
                    className="w-full h-full"
                    title={selectedLesson.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
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
                  <div className="w-full max-w-3xl">
                    <Card className="border-0 shadow-xl bg-white/95 backdrop-blur">
                      <CardContent className="p-8">
                        {/* Quiz Header */}
                        <div className="text-center mb-8">
                          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Award className="w-8 h-8 text-[#1E88E5]" />
                          </div>
                          <h1 className="text-2xl font-bold text-gray-900 mb-2">{selectedLesson.title}</h1>
                          <p className="text-gray-500">
                            {showResults ? 'Kết quả bài kiểm tra' : 'Trả lời các câu hỏi sau để hoàn thành bài học'}
                          </p>
                        </div>

                        {/* Quiz Questions */}
                        <div className="space-y-6">
                          {mockQuizQuestions.map((question, qIndex) => {
                            const userAnswer = quizAnswers[question.id];
                            const isCorrect = userAnswer === question.correctAnswer;

                            return (
                              <div key={question.id} className={`p-6 rounded-xl border-2 transition-all ${showResults
                                ? (isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50')
                                : 'border-gray-100 bg-white hover:border-blue-100'
                                }`}>
                                <div className="flex gap-3 mb-4">
                                  <Badge variant={showResults && isCorrect ? "default" : "secondary"} className={showResults && isCorrect ? "bg-green-500 hover:bg-green-600 h-6" : "h-6"}>
                                    Câu {qIndex + 1}
                                  </Badge>
                                  <h3 className="font-semibold text-gray-800 text-lg">{question.question}</h3>
                                </div>

                                <div className="space-y-3 pl-2">
                                  {question.options.map((option, optIndex) => {
                                    const isThisCorrect = optIndex === question.correctAnswer;
                                    const isUserSelection = userAnswer === optIndex;

                                    let btnColor = "border-gray-200 hover:bg-gray-50 hover:border-gray-300";
                                    if (showResults) {
                                      if (isThisCorrect) btnColor = "bg-green-600 border-green-600 text-white";
                                      else if (isUserSelection) btnColor = "bg-red-500 border-red-500 text-white";
                                    } else {
                                      if (isUserSelection) btnColor = "bg-[#1E88E5] border-[#1E88E5] text-white shadow-md";
                                    }

                                    return (
                                      <button
                                        key={optIndex}
                                        disabled={showResults}
                                        onClick={() => !showResults && handleQuizAnswerChange(question.id, optIndex)}
                                        className={`w-full text-left p-3.5 rounded-lg border transition-all flex items-center justify-between group ${btnColor}`}
                                      >
                                        <span className={isUserSelection || (showResults && isThisCorrect) ? "font-medium" : "text-gray-600"}>
                                          {option}
                                        </span>
                                        {showResults && isThisCorrect && <CheckCircle className="w-5 h-5 text-white" />}
                                      </button>
                                    )
                                  })}
                                </div>

                                {showResults && !isCorrect && userAnswer !== undefined && (
                                  <div className="mt-4 text-sm text-red-600 bg-red-100/50 p-3 rounded">
                                    <p>Đáp án đúng là: <strong>{question.options[question.correctAnswer]}</strong></p>
                                  </div>
                                )}
                                {showResults && (
                                  <div className="mt-3 text-sm text-gray-600 italic border-l-2 border-gray-300 pl-3">
                                    Giải thích: {question.explanation}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>

                        {/* Quiz Actions */}
                        <div className="mt-10 flex justify-center pb-4">
                          {!showResults ? (
                            <Button size="lg" onClick={handleSubmitQuiz} className="bg-[#1E88E5] hover:bg-[#1565C0] text-white px-8 h-12 text-lg shadow-blue-200 shadow-lg">
                              Nộp bài
                            </Button>
                          ) : (
                            <Button size="lg" variant="outline" onClick={handleResetQuiz} className="px-8 h-12">
                              Làm lại
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
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
                setShowResults(false);
                setQuizAnswers({});
              }
            }}
            onToggleCompletion={handleToggleLessonCompletion}
          />
        </div>
      </div>
    </div>
  );
}
