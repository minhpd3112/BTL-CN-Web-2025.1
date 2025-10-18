import { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, Play, FileText, Award } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner@2.0.3';
import { Course, Page } from '../../types';

// Mock quiz questions
const mockQuizQuestions = [
  {
    id: 1,
    question: 'React lÃ  gÃ¬?',
    options: [
      'Má»™t thÆ° viá»‡n JavaScript Ä‘á»ƒ xÃ¢y dá»±ng giao diá»‡n ngÆ°á»i dÃ¹ng',
      'Má»™t framework backend',
      'Má»™t ngÃ´n ngá»¯ láº­p trÃ¬nh má»›i',
      'Má»™t database'
    ],
    correctAnswer: 0,
    explanation: 'React lÃ  má»™t thÆ° viá»‡n JavaScript mÃ£ nguá»“n má»Ÿ Ä‘Æ°á»£c phÃ¡t triá»ƒn bá»Ÿi Facebook, chuyÃªn dÃ¹ng Ä‘á»ƒ xÃ¢y dá»±ng giao diá»‡n ngÆ°á»i dÃ¹ng.'
  },
  {
    id: 2,
    question: 'JSX lÃ  viáº¿t táº¯t cá»§a gÃ¬?',
    options: [
      'JavaScript XML',
      'Java Syntax Extension',
      'JavaScript Extension',
      'JSON XML'
    ],
    correctAnswer: 0,
    explanation: 'JSX lÃ  viáº¿t táº¯t cá»§a JavaScript XML, cho phÃ©p viáº¿t cÃº phÃ¡p giá»‘ng HTML trong JavaScript.'
  },
  {
    id: 3,
    question: 'Hook nÃ o Ä‘Æ°á»£c dÃ¹ng Ä‘á»ƒ quáº£n lÃ½ state trong function component?',
    options: [
      'useEffect',
      'useState',
      'useContext',
      'useReducer'
    ],
    correctAnswer: 1,
    explanation: 'useState lÃ  hook cÆ¡ báº£n nháº¥t Ä‘á»ƒ quáº£n lÃ½ state trong React function component.'
  },
  {
    id: 4,
    question: 'Virtual DOM trong React cÃ³ tÃ¡c dá»¥ng gÃ¬?',
    options: [
      'LÆ°u trá»¯ dá»¯ liá»‡u ngÆ°á»i dÃ¹ng',
      'Tá»‘i Æ°u hiá»‡u suáº¥t render',
      'Káº¿t ná»‘i vá»›i database',
      'Quáº£n lÃ½ routing'
    ],
    correctAnswer: 1,
    explanation: 'Virtual DOM giÃºp React tá»‘i Æ°u hiá»‡u suáº¥t báº±ng cÃ¡ch so sÃ¡nh vÃ  chá»‰ cáº­p nháº­t nhá»¯ng pháº§n thay Ä‘á»•i trÃªn DOM tháº­t.'
  },
  {
    id: 5,
    question: 'Props trong React Ä‘Æ°á»£c dÃ¹ng Ä‘á»ƒ lÃ m gÃ¬?',
    options: [
      'LÆ°u trá»¯ state',
      'Truyá»n dá»¯ liá»‡u tá»« component cha sang component con',
      'Káº¿t ná»‘i API',
      'Táº¡o event handler'
    ],
    correctAnswer: 1,
    explanation: 'Props (properties) lÃ  cÃ¡ch Ä‘á»ƒ truyá»n dá»¯ liá»‡u tá»« component cha xuá»‘ng component con trong React.'
  }
];

// Mock sections with lessons
const mockSections = [
  {
    id: 1,
    title: 'Giá»›i thiá»‡u',
    lessons: [
      { id: 1, title: 'Giá»›i thiá»‡u khÃ³a há»c', type: 'video', duration: '10:00', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', completed: true },
      { id: 2, title: 'CÃ i Ä‘áº·t mÃ´i trÆ°á»ng', type: 'video', duration: '15:00', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', completed: true },
    ]
  },
  {
    id: 2,
    title: 'Ná»™i dung chÃ­nh',
    lessons: [
      { id: 3, title: 'Concepts cÆ¡ báº£n', type: 'video', duration: '20:00', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', completed: false },
      { id: 4, title: 'TÃ i liá»‡u tham kháº£o', type: 'pdf', duration: '5 phÃºt', pdfUrl: '#', completed: false },
      { id: 5, title: 'Quiz kiá»ƒm tra', type: 'quiz', duration: '10 phÃºt', completed: false },
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
      toast.error('Vui lÃ²ng tráº£ lá»i táº¥t cáº£ cÃ¡c cÃ¢u há»i!');
      return;
    }
    setShowResults(true);
    
    const correctCount = mockQuizQuestions.filter(q => quizAnswers[q.id] === q.correctAnswer).length;
    const percentage = (correctCount / mockQuizQuestions.length) * 100;
    
    if (percentage >= 80) {
      toast.success(`Xuáº¥t sáº¯c! Báº¡n Ä‘áº¡t ${correctCount}/${mockQuizQuestions.length} cÃ¢u Ä‘Ãºng (${percentage.toFixed(0)}%)`);
    } else if (percentage >= 50) {
      toast.success(`KhÃ¡ tá»‘t! Báº¡n Ä‘áº¡t ${correctCount}/${mockQuizQuestions.length} cÃ¢u Ä‘Ãºng (${percentage.toFixed(0)}%)`);
    } else {
      toast.error(`Báº¡n cáº§n cá»‘ gáº¯ng thÃªm. Äiá»ƒm: ${correctCount}/${mockQuizQuestions.length} (${percentage.toFixed(0)}%)`);
    }
  };

  const handleResetQuiz = () => {
    setQuizAnswers({});
    setShowResults(false);
    toast.success('ÄÃ£ lÃ m má»›i quiz!');
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
                <span>{completedLessons}/{allLessons.length} má»¥c Ä‘Ã£ hoÃ n thÃ nh</span>
                <Progress value={progress} className="w-48 h-2" />
                <span>{progress.toFixed(0)}%</span>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigateTo('my-courses')}>
              ThoÃ¡t khÃ³a há»c
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
              <div className="flex-1 flex items-center justify-center p-8">
                <Card className="max-w-2xl w-full">
                  <CardContent className="p-12 text-center">
                    <FileText className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                    <h3 className="mb-2">{selectedLesson.title}</h3>
                    <p className="text-gray-600 mb-4">TÃ i liá»‡u PDF</p>
                    <Button>Táº£i xuá»‘ng PDF</Button>
                  </CardContent>
                </Card>
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
                          {showResults ? 'Káº¿t quáº£ bÃ i kiá»ƒm tra' : 'Tráº£ lá»i táº¥t cáº£ cÃ¡c cÃ¢u há»i bÃªn dÆ°á»›i'}
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
                                    CÃ¢u {qIndex + 1}
                                  </Badge>
                                  <h4 className="flex-1">{question.question}</h4>
                                  {showResults && (
                                    <Badge className={isCorrect ? 'bg-green-500' : 'bg-red-500'}>
                                      {isCorrect ? 'âœ“ ÄÃºng' : 'âœ— Sai'}
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
                                      <strong>Giáº£i thÃ­ch:</strong> {question.explanation}
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
                            Ná»™p bÃ i
                          </Button>
                        ) : (
                          <Button
                            size="lg"
                            variant="outline"
                            onClick={handleResetQuiz}
                          >
                            LÃ m láº¡i
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
              TrÆ°á»›c
            </Button>
            <div className="text-center">
              <div className="text-sm text-gray-600">Má»¥c {currentIndex + 1} / {allLessons.length}</div>
            </div>
            <Button 
              className="bg-[#1E88E5] text-white hover:bg-[#1565C0]"
              onClick={handleNext}
              disabled={!canGoNext}
            >
              Tiáº¿p
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto">
        <div className="p-4">
          <h3 className="mb-4">Ná»™i dung khÃ³a há»c</h3>
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

