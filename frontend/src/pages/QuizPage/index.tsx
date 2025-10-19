import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Page, QuizSettings } from '@/types';

const mockQuizQuestions = [
  {
    id: 1,
    question: 'React là gì?',
    options: [
      'Một thư viện JavaScript để xây dựng giao diện người dùng',
      'Một framework backend',
      'Một ngôn ngữ lập trình',
      'Một cơ sở dữ liệu'
    ],
    correctAnswer: 0
  },
  {
    id: 2,
    question: 'Hook nào được sử dụng để quản lý state trong functional component?',
    options: ['useEffect', 'useState', 'useContext', 'useReducer'],
    correctAnswer: 1
  },
  {
    id: 3,
    question: 'JSX là viết tắt của gì?',
    options: ['JavaScript XML', 'JavaScript Extension', 'Java Syntax', 'JavaScript XAML'],
    correctAnswer: 0
  },
  {
    id: 4,
    question: 'Props trong React dùng để làm gì?',
    options: [
      'Truyền dữ liệu từ component cha sang component con',
      'Lưu trữ state',
      'Gọi API',
      'Tạo style cho component'
    ],
    correctAnswer: 0
  },
  {
    id: 5,
    question: 'Virtual DOM là gì?',
    options: [
      'Một bản sao của DOM thật được lưu trong bộ nhớ',
      'Một thư viện của React',
      'Một loại component',
      'Một design pattern'
    ],
    correctAnswer: 0
  }
];

interface QuizPageProps {
  navigateTo: (page: Page) => void;
  quizSettings?: QuizSettings; // Quiz settings from lesson
}

export function QuizPage({ navigateTo, quizSettings }: QuizPageProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showStartDialog, setShowStartDialog] = useState(quizSettings?.quizType === 'exam');
  const [quizStarted, setQuizStarted] = useState(quizSettings?.quizType !== 'exam');
  
  // Set initial time based on quiz type
  const initialTime = quizSettings?.quizType === 'exam' && quizSettings?.timeLimit 
    ? quizSettings.timeLimit * 60 
    : 1200; // Default 20 minutes
  const [timeLeft, setTimeLeft] = useState(initialTime);

  // Timer countdown - only for exams
  useEffect(() => {
    if (quizSettings?.quizType === 'exam' && quizStarted && timeLeft > 0 && !showResults) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (quizSettings?.quizType === 'exam' && timeLeft === 0 && !showResults) {
      handleSubmit();
    }
  }, [timeLeft, showResults, quizStarted, quizSettings]);

  const handleStartQuiz = () => {
    setShowStartDialog(false);
    setQuizStarted(true);
  };

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  const correctAnswers = selectedAnswers.filter((answer, index) => answer === mockQuizQuestions[index].correctAnswer).length;
  const score = (correctAnswers / mockQuizQuestions.length) * 100;
  const passingScore = quizSettings?.passingScore || 70;

  // Show start dialog for exam type
  if (showStartDialog && quizSettings?.quizType === 'exam') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <Card className="border-2 border-orange-500/30">
          <CardHeader className="bg-gradient-to-r from-orange-500/10 to-transparent">
            <CardTitle className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <Timer className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2>Quiz có giới hạn thời gian</h2>
                <p className="text-sm text-gray-600 font-normal mt-1">
                  Vui lòng đọc kỹ hướng dẫn trước khi bắt đầu
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <Alert className="border-orange-200 bg-orange-50">
              <AlertCircle className="w-4 h-4 text-orange-600" />
              <AlertDescription className="text-orange-900">
                Quiz này có giới hạn thời gian. Sau khi bắt đầu, bạn không thể tạm dừng.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-900">Thời gian làm bài</h4>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {quizSettings.timeLimit} phút
                </p>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold text-green-900">Điểm đạt</h4>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {passingScore}%
                </p>
                <p className="text-sm text-green-700 mt-1">
                  Điểm tối thiểu để pass
                </p>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-gray-700" />
                Lưu ý quan trọng
              </h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-[#1E88E5] mt-1">•</span>
                  <span>Quiz có <strong>{mockQuizQuestions.length} câu hỏi</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#1E88E5] mt-1">•</span>
                  <span>Thời gian làm bài: <strong>{quizSettings.timeLimit} phút</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#1E88E5] mt-1">•</span>
                  <span>Hết giờ sẽ tự động nộp bài</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#1E88E5] mt-1">•</span>
                  <span>Điểm tối thiểu: <strong>{passingScore}%</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#1E88E5] mt-1">•</span>
                  <span>Hãy kiểm tra kỹ trước khi nộp bài</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 flex gap-3">
              <Button
                onClick={handleStartQuiz}
                className="flex-1 bg-orange-500 hover:bg-orange-600 h-12"
              >
                <Timer className="w-5 h-5 mr-2" />
                Tôi đã sẵn sàng - Bắt đầu làm bài
              </Button>
              <Button
                variant="outline"
                onClick={() => navigateTo('learning')}
                className="h-12"
              >
                Quay lại
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <Card>
          <CardContent className="p-12 text-center">
            <div className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center ${
              score >= 70 ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {score >= 70 ? (
                <CheckCircle className="w-12 h-12 text-green-500" />
              ) : (
                <XCircle className="w-12 h-12 text-red-500" />
              )}
            </div>
            <h2 className="mb-4">{score >= passingScore ? 'Chúc mừng!' : 'Chưa đạt'}</h2>
            <p className="text-gray-600 mb-6">
              Bạn đã trả lời đúng {correctAnswers}/{mockQuizQuestions.length} câu hỏi
            </p>
            <div className="text-5xl text-[#1E88E5] mb-4">{score.toFixed(0)}%</div>
            {quizSettings?.quizType === 'exam' && (
              <p className="text-sm text-gray-600 mb-6">
                Điểm tối thiểu: {passingScore}% • 
                Kết quả: <span className={score >= passingScore ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                  {score >= passingScore ? 'ĐẠT' : 'CHƯA ĐẠT'}
                </span>
              </p>
            )}
            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={() => {
                setShowResults(false);
                setCurrentQuestion(0);
                setSelectedAnswers([]);
                setTimeLeft(initialTime);
                if (quizSettings?.quizType === 'exam') {
                  setShowStartDialog(true);
                  setQuizStarted(false);
                }
              }}>
                Làm lại
              </Button>
              <Button className="bg-[#1E88E5] text-white hover:bg-[#1565C0]" onClick={() => navigateTo('learning')}>
                Tiếp tục học
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="mb-2">Quiz: Kiểm tra kiến thức</h2>
              <div className="text-gray-600">
                Câu hỏi {currentQuestion + 1} / {mockQuizQuestions.length}
              </div>
            </div>
            {quizSettings?.quizType === 'exam' && (
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Thời gian còn lại</div>
                <div className={`text-2xl font-bold ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-[#1E88E5]'}`}>
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </div>
              </div>
            )}
          </div>
          <Progress value={(currentQuestion / mockQuizQuestions.length) * 100} className="mt-4 h-2" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-8">
          <h3 className="mb-6">{mockQuizQuestions[currentQuestion].question}</h3>
          <div className="space-y-3">
            {mockQuizQuestions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  selectedAnswers[currentQuestion] === index
                    ? 'border-[#1E88E5] bg-[#1E88E5]/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedAnswers[currentQuestion] === index
                      ? 'border-[#1E88E5] bg-[#1E88E5]'
                      : 'border-gray-300'
                  }`}>
                    {selectedAnswers[currentQuestion] === index && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between mt-8">
            <Button
              variant="outline"
              disabled={currentQuestion === 0}
              onClick={() => setCurrentQuestion(currentQuestion - 1)}
            >
              Câu trước
            </Button>
            {currentQuestion === mockQuizQuestions.length - 1 ? (
              <Button
                className="bg-[#1E88E5] text-white hover:bg-[#1565C0]"
                onClick={handleSubmit}
                disabled={selectedAnswers.length !== mockQuizQuestions.length}
              >
                Nộp bài
              </Button>
            ) : (
              <Button
                className="bg-[#1E88E5] text-white hover:bg-[#1565C0]"
                onClick={() => setCurrentQuestion(currentQuestion + 1)}
              >
                Câu tiếp theo
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
