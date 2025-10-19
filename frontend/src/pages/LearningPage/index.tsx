import { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, Play, FileText, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Course, Page } from '@/types';

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

// Mock sections with lessons
const mockSections = [
  {
    id: 1,
    title: 'Giới thiệu',
    lessons: [
      { id: 1, title: 'Giới thiệu khóa học', type: 'video', duration: '10:00', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', completed: true },
      { id: 2, title: 'Cài đặt môi trường', type: 'video', duration: '15:00', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', completed: true },
    ]
  },
  {
    id: 2,
    title: 'Nội dung chính',
    lessons: [
      { id: 3, title: 'Concepts cơ bản', type: 'video', duration: '20:00', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', completed: false },
      { id: 4, title: 'Tài liệu tham khảo', type: 'pdf', duration: '5 phút', pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', completed: false },
      { id: 5, title: 'Quiz kiểm tra', type: 'quiz', duration: '10 phút', completed: false },
    ]
  }
];

interface LearningPageProps {
  course: Course;
  navigateTo: (page: Page) => void;
}

export function LearningPage({ course, navigateTo }: LearningPageProps) {
  const [selectedLesson, setSelectedLesson] = useState(mockSections[0].lessons[0]);
  const [expandedSections, setExpandedSections] = useState<number[]>([1, 2]);
  
  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

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

  const allLessons = mockSections.flatMap(s => s.lessons);
  const completedLessons = allLessons.filter(l => l.completed).length;
  const progress = (completedLessons / allLessons.length) * 100;

  const currentIndex = allLessons.findIndex(l => l.id === selectedLesson.id);
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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex-1">
              <h2 className="mb-1">{course.title}</h2>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>{completedLessons}/{allLessons.length} mục đã hoàn thành</span>
                <Progress value={progress} className="w-48 h-2" />
                <span>{progress.toFixed(0)}%</span>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigateTo('my-courses')}>
              Thoát khóa học
            </Button>
          </div>
        </div>

        {/* Video/Content Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="h-full flex flex-col">
            {selectedLesson.type === 'video' && selectedLesson.youtubeUrl && (
              <div className="flex-1 bg-black flex items-center justify-center p-6">
                <div className="w-full max-w-6xl">
                  <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
                    <iframe
                      src={getYouTubeEmbedUrl(selectedLesson.youtubeUrl)}
                      className="w-full h-full"
                      title={selectedLesson.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                  <div className="mt-6 text-center">
                    <h3 className="text-white mb-2">{selectedLesson.title}</h3>
                    <p className="text-gray-400 text-sm">{selectedLesson.duration}</p>
                  </div>
                </div>
              </div>
            )}
            
            {selectedLesson.type === 'pdf' && (
              <div className="flex-1 bg-gray-900 flex items-center justify-center p-6">
                <div className="w-full h-full max-w-6xl flex flex-col">
                  <div className="flex-1 bg-white rounded-lg overflow-hidden shadow-2xl">
                    {selectedLesson.pdfUrl && selectedLesson.pdfUrl !== '#' ? (
                      <iframe
                        src={selectedLesson.pdfUrl}
                        className="w-full h-full"
                        title={selectedLesson.title}
                        frameBorder="0"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-50">
                        <div className="text-center p-8">
                          <FileText className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                          <h3 className="mb-2">{selectedLesson.title}</h3>
                          <p className="text-gray-600">Tài liệu PDF chưa được tải lên</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-6 text-center">
                    <h3 className="text-white mb-2">{selectedLesson.title}</h3>
                    <p className="text-gray-400 text-sm">{selectedLesson.duration}</p>
                  </div>
                </div>
              </div>
            )}
            
            {selectedLesson.type === 'quiz' && (
              <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-4xl mx-auto">
                  <Card>
                    <CardContent className="p-8">
                      <div className="text-center mb-8">
                        <Award className="w-16 h-16 text-[#1E88E5] mx-auto mb-4" />
                        <h2 className="mb-2">{selectedLesson.title}</h2>
                        <p className="text-gray-600">
                          {showResults ? 'Kết quả bài kiểm tra' : 'Trả lời tất cả các câu hỏi bên dưới'}
                        </p>
                      </div>

                      <div className="space-y-8">
                        {mockQuizQuestions.map((question, qIndex) => {
                          const userAnswer = quizAnswers[question.id];
                          const isCorrect = userAnswer === question.correctAnswer;
                          
                          return (
                            <Card key={question.id} className={showResults ? (isCorrect ? 'border-green-500' : 'border-red-500') : ''}>
                              <CardContent className="p-6">
                                <div className="flex items-start gap-3 mb-4">
                                  <Badge variant="secondary" className="mt-1">
                                    Câu {qIndex + 1}
                                  </Badge>
                                  <h4 className="flex-1">{question.question}</h4>
                                  {showResults && (
                                    <Badge className={isCorrect ? 'bg-green-500' : 'bg-red-500'}>
                                      {isCorrect ? '✓ Đúng' : '✗ Sai'}
                                    </Badge>
                                  )}
                                </div>

                                <div className="space-y-3">
                                  {question.options.map((option, optIndex) => {
                                    const isThisCorrect = optIndex === question.correctAnswer;
                                    const isUserSelection = userAnswer === optIndex;
                                    
                                    return (
                                      <button
                                        key={optIndex}
                                        type="button"
                                        disabled={showResults}
                                        onClick={() => !showResults && handleQuizAnswerChange(question.id, optIndex)}
                                        className={`w-full flex items-center space-x-3 p-4 rounded-lg border-2 transition-all text-left ${
                                          showResults
                                            ? isThisCorrect
                                              ? 'border-green-500 bg-green-500 text-white'
                                              : isUserSelection
                                              ? 'border-red-500 bg-red-500 text-white'
                                              : 'border-gray-200 bg-white'
                                            : isUserSelection
                                            ? 'border-[#1E88E5] bg-[#1E88E5] text-white'
                                            : 'border-gray-200 hover:border-[#1E88E5] hover:bg-blue-50 cursor-pointer'
                                        } ${showResults ? 'cursor-not-allowed' : ''}`}
                                      >
                                        <span className="flex-1">
                                          {option}
                                        </span>
                                        {showResults && isThisCorrect && (
                                          <CheckCircle className="w-5 h-5 flex-shrink-0" />
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>

                                {showResults && (
                                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-sm text-blue-900">
                                      <strong>Giải thích:</strong> {question.explanation}
                                    </p>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>

                      <div className="mt-8 flex gap-4 justify-center">
                        {!showResults ? (
                          <Button
                            size="lg"
                            className="bg-[#1E88E5] text-white hover:bg-[#1565C0]"
                            onClick={handleSubmitQuiz}
                          >
                            Nộp bài
                          </Button>
                        ) : (
                          <Button
                            size="lg"
                            variant="outline"
                            onClick={handleResetQuiz}
                          >
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
        </div>

        {/* Bottom Navigation */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              disabled={!canGoPrevious}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Trước
            </Button>
            <div className="text-center">
              <div className="text-sm text-gray-600">Mục {currentIndex + 1} / {allLessons.length}</div>
            </div>
            <Button 
              className="bg-[#1E88E5] text-white hover:bg-[#1565C0]"
              onClick={handleNext}
              disabled={!canGoNext}
            >
              Tiếp
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto">
        <div className="p-4">
          <h3 className="mb-4">Nội dung khóa học</h3>
          <div className="space-y-2">
            {mockSections.map((section) => (
              <div key={section.id} className="border rounded-lg overflow-hidden">
                <button
                  className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                  onClick={() => toggleSection(section.id)}
                >
                  <span className="font-medium">{section.title}</span>
                  <Badge variant="secondary">{section.lessons.length}</Badge>
                </button>
                {expandedSections.includes(section.id) && (
                  <div className="p-2 space-y-1">
                    {section.lessons.map((lesson) => (
                      <button
                        key={lesson.id}
                        onClick={() => {
                          setSelectedLesson(lesson);
                          setShowResults(false);
                          setQuizAnswers({});
                        }}
                        className={`w-full p-3 text-left rounded-lg transition-all flex items-start gap-3 ${
                          selectedLesson.id === lesson.id
                            ? 'bg-[#1E88E5]/10 border-2 border-[#1E88E5]'
                            : 'hover:bg-gray-50 border-2 border-transparent'
                        }`}
                      >
                        <div className="mt-0.5">
                          {lesson.completed ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm mb-1">{lesson.title}</div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            {lesson.type === 'video' && <Play className="w-3 h-3" />}
                            {lesson.type === 'pdf' && <FileText className="w-3 h-3" />}
                            {lesson.type === 'quiz' && <Award className="w-3 h-3" />}
                            <span>{lesson.duration}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
