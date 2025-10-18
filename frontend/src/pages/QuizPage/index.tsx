import { useState, useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { Page } from '../../types';

const mockQuizQuestions = [
  {
    id: 1,
    question: 'React lÃ  gÃ¬?',
    options: [
      'Má»™t thÆ° viá»‡n JavaScript Ä‘á»ƒ xÃ¢y dá»±ng giao diá»‡n ngÆ°á»i dÃ¹ng',
      'Má»™t framework backend',
      'Má»™t ngÃ´n ngá»¯ láº­p trÃ¬nh',
      'Má»™t cÆ¡ sá»Ÿ dá»¯ liá»‡u'
    ],
    correctAnswer: 0
  },
  {
    id: 2,
    question: 'Hook nÃ o Ä‘Æ°á»£c sá»­ dá»¥ng Ä‘á»ƒ quáº£n lÃ½ state trong functional component?',
    options: ['useEffect', 'useState', 'useContext', 'useReducer'],
    correctAnswer: 1
  },
  {
    id: 3,
    question: 'JSX lÃ  viáº¿t táº¯t cá»§a gÃ¬?',
    options: ['JavaScript XML', 'JavaScript Extension', 'Java Syntax', 'JavaScript XAML'],
    correctAnswer: 0
  },
  {
    id: 4,
    question: 'Props trong React dÃ¹ng Ä‘á»ƒ lÃ m gÃ¬?',
    options: [
      'Truyá»n dá»¯ liá»‡u tá»« component cha sang component con',
      'LÆ°u trá»¯ state',
      'Gá»i API',
      'Táº¡o style cho component'
    ],
    correctAnswer: 0
  },
  {
    id: 5,
    question: 'Virtual DOM lÃ  gÃ¬?',
    options: [
      'Má»™t báº£n sao cá»§a DOM tháº­t Ä‘Æ°á»£c lÆ°u trong bá»™ nhá»›',
      'Má»™t thÆ° viá»‡n cá»§a React',
      'Má»™t loáº¡i component',
      'Má»™t design pattern'
    ],
    correctAnswer: 0
  }
];

interface QuizPageProps {
  navigateTo: (page: Page) => void;
}

export function QuizPage({ navigateTo }: QuizPageProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1200); // 20 minutes in seconds

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && !showResults) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResults) {
      handleSubmit();
    }
  }, [timeLeft, showResults]);

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
            <h2 className="mb-4">{score >= 70 ? 'ChÃºc má»«ng!' : 'ChÆ°a Ä‘áº¡t'}</h2>
            <p className="text-gray-600 mb-6">
              Báº¡n Ä‘Ã£ tráº£ lá»i Ä‘Ãºng {correctAnswers}/{mockQuizQuestions.length} cÃ¢u há»i
            </p>
            <div className="text-5xl text-[#1E88E5] mb-8">{score.toFixed(0)}%</div>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={() => {
                setShowResults(false);
                setCurrentQuestion(0);
                setSelectedAnswers([]);
                setTimeLeft(1200);
              }}>
                LÃ m láº¡i
              </Button>
              <Button className="bg-[#1E88E5] text-white hover:bg-[#1565C0]" onClick={() => navigateTo('learning')}>
                Tiáº¿p tá»¥c há»c
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
              <h2 className="mb-2">Quiz: Kiá»ƒm tra kiáº¿n thá»©c</h2>
              <div className="text-gray-600">
                CÃ¢u há»i {currentQuestion + 1} / {mockQuizQuestions.length}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Thá»i gian cÃ²n láº¡i</div>
              <div className={`text-2xl ${timeLeft < 60 ? 'text-red-500' : 'text-[#1E88E5]'}`}>
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </div>
            </div>
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
              CÃ¢u trÆ°á»›c
            </Button>
            {currentQuestion === mockQuizQuestions.length - 1 ? (
              <Button
                className="bg-[#1E88E5] text-white hover:bg-[#1565C0]"
                onClick={handleSubmit}
                disabled={selectedAnswers.length !== mockQuizQuestions.length}
              >
                Ná»™p bÃ i
              </Button>
            ) : (
              <Button
                className="bg-[#1E88E5] text-white hover:bg-[#1565C0]"
                onClick={() => setCurrentQuestion(currentQuestion + 1)}
              >
                CÃ¢u tiáº¿p theo
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

