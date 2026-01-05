import { useState, useEffect } from 'react';
import { Check, HelpCircle, Clock, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { QuizQuestion, QuizSettings } from '@/types';

interface QuizEditorProps {
  onSave: (questions: QuizQuestion[], settings: QuizSettings) => void;
  initialQuestions?: QuizQuestion[];
  initialSettings?: QuizSettings;
}

const EXAMPLE_SINGLE = `React là gì?
() Framework backend
(x) Thư viện JavaScript để xây dựng UI
() Hệ quản trị cơ sở dữ liệu
() Ngôn ngữ lập trình`;

const EXAMPLE_MULTIPLE = `Các hook cơ bản trong React:
[] useBackend
[x] useState
[x] useEffect
[] useDatabase`;

const EXAMPLE_FULL = `React là gì?
() Framework backend
(x) Thư viện JavaScript để xây dựng UI
() Hệ quản trị cơ sở dữ liệu
() Ngôn ngữ lập trình

Các hook cơ bản trong React:
[] useBackend
[x] useState
[x] useEffect
[] useDatabase`;

export function QuizEditor({ onSave, initialQuestions = [], initialSettings }: QuizEditorProps) {
  const [quizText, setQuizText] = useState('');
  const [parsedQuestions, setParsedQuestions] = useState<QuizQuestion[]>(initialQuestions);

  // Quiz Settings State
  const [hasTimeLimit, setHasTimeLimit] = useState<boolean>(initialSettings?.quizType === 'exam');
  const [timeLimit, setTimeLimit] = useState<number>(initialSettings?.timeLimit || 30);
  const [passingScore, setPassingScore] = useState<number>(initialSettings?.passingScore || 70);

  // Convert initialQuestions to text format when component mounts or initialQuestions changes
  useEffect(() => {
    if (initialQuestions && initialQuestions.length > 0) {
      const formattedText = initialQuestions.map(q => {
        const questionLine = q.question;
        const optionLines = q.options.map((opt, idx) => {
          const isCorrect = q.correctAnswers.includes(idx);

          // Use proper format: (x) for single choice, [x] for multiple choice
          if (q.type === 'single') {
            return isCorrect ? `(x) ${opt}` : `( ) ${opt}`;
          } else {
            return isCorrect ? `[x] ${opt}` : `[ ] ${opt}`;
          }
        }).join('\n');
        return `${questionLine}\n${optionLines}`;
      }).join('\n\n');

      setQuizText(formattedText);
      setParsedQuestions(initialQuestions);
    }
  }, [initialQuestions]);

  const parseQuizText = (text: string): QuizQuestion[] => {
    const questions: QuizQuestion[] = [];
    const lines = text.trim().split('\n').filter(line => line.trim());

    let currentQuestion: Partial<QuizQuestion> | null = null;
    let currentOptions: string[] = [];
    let currentCorrectAnswers: number[] = [];
    let optionIndex = 0;

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Check if it's an option line
      // Match both (x) and ( x ) and () and ( ) formats
      const singleChoiceMatch = trimmedLine.match(/^\(([x ]?)\)\s*(.+)$/);
      const multipleChoiceMatch = trimmedLine.match(/^\[([x ]?)\]\s*(.+)$/);

      if (singleChoiceMatch || multipleChoiceMatch) {
        // It's an option
        const match = singleChoiceMatch || multipleChoiceMatch;
        const isChecked = match![1].trim() === 'x';
        const optionText = match![2].trim();

        if (!currentQuestion) {
          // Skip options without a question
          continue;
        }

        // Detect question type from first option's bracket format
        if (currentOptions.length === 0) {
          // First option - set question type based on bracket
          const detectedType = singleChoiceMatch ? 'single' : 'multiple';
          currentQuestion.type = detectedType;
        }

        currentOptions.push(optionText);
        if (isChecked) {
          currentCorrectAnswers.push(optionIndex);
        }
        optionIndex++;
      } else {
        // It's a question
        // Save previous question if exists
        if (currentQuestion && currentQuestion.question && currentOptions.length > 0) {
          questions.push({
            question: currentQuestion.question,
            type: currentQuestion.type || 'single',
            options: currentOptions,
            correctAnswers: currentCorrectAnswers,
            explanation: currentQuestion.explanation
          });
        }

        // Start new question
        currentQuestion = {
          question: trimmedLine,
          type: 'single',
          explanation: undefined
        };
        currentOptions = [];
        currentCorrectAnswers = [];
        optionIndex = 0;
      }
    }

    // Save last question
    if (currentQuestion && currentQuestion.question && currentOptions.length > 0) {
      questions.push({
        question: currentQuestion.question,
        type: currentQuestion.type || 'single',
        options: currentOptions,
        correctAnswers: currentCorrectAnswers,
        explanation: currentQuestion.explanation
      });
    }

    return questions;
  };

  const detectQuestionType = (questions: QuizQuestion[]): QuizQuestion[] => {
    return questions.map(q => ({
      ...q,
      type: q.correctAnswers.length > 1 ? 'multiple' : 'single'
    }));
  };

  const handleParse = () => {
    try {
      const questions = parseQuizText(quizText);

      if (questions.length === 0) {
        toast.error('Không tìm thấy câu hỏi nào! Vui lòng kiểm tra format.');
        return;
      }

      setParsedQuestions(questions);
      toast.success(`Đã phân tích ${questions.length} câu hỏi!`);
    } catch (error) {
      toast.error('Có lỗi khi phân tích câu hỏi. Vui lòng kiểm tra format.');
    }
  };

  const handleSave = () => {
    if (parsedQuestions.length === 0) {
      toast.error('Chưa có câu hỏi nào để lưu!');
      return;
    }

    if (hasTimeLimit && (!timeLimit || timeLimit <= 0)) {
      toast.error('Vui lòng nhập thời gian giới hạn!');
      return;
    }

    const settings: QuizSettings = {
      quizType: hasTimeLimit ? 'exam' : 'practice',
      timeLimit: hasTimeLimit ? timeLimit : undefined,
      passingScore
    };

    onSave(parsedQuestions, settings);
    toast.success(`Đã lưu ${parsedQuestions.length} câu hỏi!`);
  };



  return (
    <div className="space-y-6">
      {/* Quiz Settings Card */}
      <Card className="border-2 border-[#1E88E5]/20">
        <CardHeader className="bg-gradient-to-r from-[#1E88E5]/10 to-transparent">
          <CardTitle className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-[#1E88E5]" />
            Cài đặt Quiz
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 pt-6">
          {/* Time Limit Toggle */}
          <div className="flex items-start justify-between gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-[#1E88E5]/30 transition-colors">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-[#1E88E5]" />
                <Label htmlFor="time-limit-toggle" className="cursor-pointer">
                  Giới hạn thời gian
                </Label>
              </div>
              <p className="text-sm text-gray-600">
                {hasTimeLimit
                  ? 'Học viên cần xác nhận và sẽ có thời gian giới hạn để làm bài'
                  : 'Học viên có thể làm bài không giới hạn thời gian'
                }
              </p>
            </div>
            <Switch
              id="time-limit-toggle"
              checked={hasTimeLimit}
              onCheckedChange={setHasTimeLimit}
              className="mt-1"
            />
          </div>

          {/* Time Limit Input - Only show when enabled */}
          {hasTimeLimit && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
              <Label htmlFor="time-limit" className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                Thời gian làm bài (phút) *
              </Label>
              <Input
                id="time-limit"
                type="number"
                min="1"
                max="180"
                value={timeLimit}
                onChange={(e) => setTimeLimit(parseInt(e.target.value) || 0)}
                placeholder="VD: 30"
                className="bg-white"
              />
            </div>
          )}

          {/* Passing Score */}
          <div>
            <Label htmlFor="passing-score" className="mb-2 block">
              Điểm tối thiểu để đạt (%)
            </Label>
            <Input
              id="passing-score"
              type="number"
              min="0"
              max="100"
              value={passingScore}
              onChange={(e) => setPassingScore(parseInt(e.target.value) || 0)}
              placeholder="VD: 70"
            />
            <p className="text-xs text-gray-600 mt-1">
              Học viên cần đạt tối thiểu {passingScore}% để hoàn thành quiz
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quiz Questions Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Tạo câu hỏi Quiz</CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Hướng dẫn
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Hướng dẫn Format Quiz</DialogTitle>
                  <DialogDescription>
                    Quy tắc định dạng câu hỏi và đáp án
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  <div>
                    <h4 className="mb-3 flex items-center gap-2">
                      <Badge>Format 1</Badge>
                      Câu hỏi một đáp án đúng
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-2">
                      <pre className="text-sm whitespace-pre-wrap">{EXAMPLE_SINGLE}</pre>
                    </div>
                    <p className="text-sm text-gray-600">
                      Sử dụng <code className="bg-gray-200 px-1 rounded">()</code> cho các đáp án và đánh dấu <code className="bg-gray-200 px-1 rounded">(x)</code> cho đáp án đúng.
                    </p>
                  </div>

                  <div>
                    <h4 className="mb-3 flex items-center gap-2">
                      <Badge>Format 2</Badge>
                      Câu hỏi nhiều đáp án đúng
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-2">
                      <pre className="text-sm whitespace-pre-wrap">{EXAMPLE_MULTIPLE}</pre>
                    </div>
                    <p className="text-sm text-gray-600">
                      Sử dụng <code className="bg-gray-200 px-1 rounded">[]</code> cho các đáp án và đánh dấu <code className="bg-gray-200 px-1 rounded">[x]</code> cho các đáp án đúng.
                    </p>
                  </div>

                  <div>
                    <h4 className="mb-3 flex items-center gap-2">
                      <Badge variant="secondary">Quy tắc</Badge>
                      Yêu cầu bắt buộc
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li>• Dòng đầu tiên không chứa ký tự đặc biệt là câu hỏi</li>
                      <li>• Các dòng bắt đầu bằng () hoặc [] là đáp án</li>
                      <li>• Mỗi câu hỏi được phân tách bằng một dòng trống</li>
                      <li>• Có thể đánh dấu nhiều đáp án đúng với [x]</li>
                      <li>• Mỗi câu hỏi phải có ít nhất một đáp án đúng</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="mb-3 flex items-center gap-2">
                      <Badge className="bg-purple-600">Sử dụng AI</Badge>
                      Prompt để chuẩn hóa với LLM
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-800 mb-2 font-medium">Copy prompt này và gửi đến ChatGPT/Claude/Gemini kèm theo nội dung quiz của bạn:</p>
                      <div className="bg-white p-3 rounded border border-gray-300 text-sm font-mono whitespace-pre-wrap">
                        {`Hãy chuyển đổi các câu hỏi quiz sau sang format chuẩn:

Format cho câu hỏi một đáp án đúng:
- Dòng đầu: Câu hỏi
- Các dòng tiếp theo: () cho đáp án sai, (x) cho đáp án đúng

Format cho câu hỏi nhiều đáp án đúng:
- Dòng đầu: Câu hỏi  
- Các dòng tiếp theo: [] cho đáp án sai, [x] cho đáp án đúng

Ví dụ output:
React là gì?
() Framework backend
(x) Thư viện JavaScript để xây dựng UI
() Hệ quản trị cơ sở dữ liệu

Các hook cơ bản trong React:
[x] useState
[x] useEffect
[] useBackend

[PASTE NỘI DUNG QUIZ CỦA BẠN Ở ĐÂY]`}</div>
                      <p className="text-xs text-gray-600 mt-2">
                        💡 Sau khi nhận kết quả từ AI, copy và paste vào ô "Nhập câu hỏi theo format" bên dưới
                      </p>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="mb-2">
              <Label>Nhập câu hỏi theo format</Label>
            </div>
            <Textarea
              placeholder={`Nhập câu hỏi theo format...\n\n${EXAMPLE_SINGLE}`}
              value={quizText}
              onChange={(e) => setQuizText(e.target.value)}
              rows={15}
              className="font-mono text-sm"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleParse}
              className="bg-[#1E88E5] text-white hover:bg-[#1565C0]"
            >
              Phân tích câu hỏi
            </Button>
            {parsedQuestions.length > 0 && (
              <Button onClick={handleSave} variant="outline">
                <Check className="w-4 h-4 mr-2" />
                Lưu {parsedQuestions.length} câu
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
