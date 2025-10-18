import { useState } from 'react';
import { Sparkles, Copy, Check, AlertCircle, HelpCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { toast } from 'sonner@2.0.3';

interface QuizQuestion {
  question: string;
  type: 'single' | 'multiple';
  options: string[];
  correctAnswers: number[];
  explanation?: string;
}

interface QuizEditorProps {
  onSave: (questions: QuizQuestion[]) => void;
  initialQuestions?: QuizQuestion[];
}

const EXAMPLE_SINGLE = `Ai là đáp án đúng?
() Đáp án A
(x) Đáp án B - đúng
() Đáp án C`;

const EXAMPLE_MULTIPLE = `Chọn đáp án đúng (có thể nhiều đáp án):
[] Đáp án A
[x] Đáp án B - đúng
[x] Đáp án C - đúng
[] Đáp án D`;

const EXAMPLE_FULL = `React là gì?
() Một framework backend
(x) Một thư viện JavaScript để xây dựng UI
() Một database
() Một ngôn ngữ lập trình

Đâu là hook trong React? (có thể chọn nhiều)
[] useBackend
[x] useState
[x] useEffect
[] useDatabase`;

export function QuizEditor({ onSave, initialQuestions = [] }: QuizEditorProps) {
  const [quizText, setQuizText] = useState('');
  const [parsedQuestions, setParsedQuestions] = useState<QuizQuestion[]>(initialQuestions);
  const [isNormalizing, setIsNormalizing] = useState(false);
  const [rawText, setRawText] = useState('');

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
      const singleChoiceMatch = trimmedLine.match(/^\(([x ])\)\s*(.+)$/);
      const multipleChoiceMatch = trimmedLine.match(/^\[([x ])\]\s*(.+)$/);
      
      if (singleChoiceMatch || multipleChoiceMatch) {
        // It's an option
        const match = singleChoiceMatch || multipleChoiceMatch;
        const isChecked = match![1] === 'x';
        const optionText = match![2].trim();
        
        if (!currentQuestion) {
          // Skip options without a question
          continue;
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
      const typedQuestions = detectQuestionType(questions);
      
      if (typedQuestions.length === 0) {
        toast.error('Không tìm thấy câu hỏi nào! Vui lòng kiểm tra format.');
        return;
      }
      
      setParsedQuestions(typedQuestions);
      toast.success(`Đã phân tích ${typedQuestions.length} câu hỏi!`);
    } catch (error) {
      toast.error('Có lỗi khi phân tích câu hỏi. Vui lòng kiểm tra format.');
    }
  };

  const handleNormalizeWithGemini = async () => {
    if (!rawText.trim()) {
      toast.error('Vui lòng nhập văn bản cần chuẩn hóa!');
      return;
    }

    setIsNormalizing(true);
    
    try {
      // Mock Gemini API call - In production, replace with actual API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock response - In production, this would be the Gemini API response
      const mockNormalizedText = `React là gì?
() Một framework backend
(x) Một thư viện JavaScript để xây dựng UI
() Một database

Đâu là hook trong React?
[x] useState
[x] useEffect
[] useBackend
[] useDatabase`;
      
      setQuizText(mockNormalizedText);
      toast.success('Đã chuẩn hóa văn bản! Vui lòng kiểm tra và chỉnh sửa nếu cần.');
    } catch (error) {
      toast.error('Không thể kết nối đến Gemini API. Vui lòng thử lại.');
    } finally {
      setIsNormalizing(false);
    }
  };

  const handleSave = () => {
    if (parsedQuestions.length === 0) {
      toast.error('Chưa có câu hỏi nào để lưu!');
      return;
    }
    
    onSave(parsedQuestions);
    toast.success(`Đã lưu ${parsedQuestions.length} câu hỏi!`);
  };

  const copyExample = (example: string) => {
    setQuizText(example);
    toast.success('Đã copy ví dụ!');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Tạo Quiz</CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Hướng dẫn
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Hướng dẫn tạo Quiz</DialogTitle>
                  <DialogDescription>
                    Sử dụng format đặc biệt để tạo quiz nhanh chóng
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  <div>
                    <h4 className="mb-3 flex items-center gap-2">
                      <Badge>Format</Badge>
                      Câu hỏi một đáp án đúng
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-2">
                      <pre className="text-sm whitespace-pre-wrap">{EXAMPLE_SINGLE}</pre>
                    </div>
                    <p className="text-sm text-gray-600">
                      • Dùng <code className="bg-gray-200 px-1 rounded">()</code> cho câu hỏi 1 đáp án đúng<br />
                      • Đánh dấu <code className="bg-gray-200 px-1 rounded">(x)</code> cho đáp án đúng
                    </p>
                  </div>

                  <div>
                    <h4 className="mb-3 flex items-center gap-2">
                      <Badge>Format</Badge>
                      Câu hỏi nhiều đáp án đúng
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-2">
                      <pre className="text-sm whitespace-pre-wrap">{EXAMPLE_MULTIPLE}</pre>
                    </div>
                    <p className="text-sm text-gray-600">
                      • Dùng <code className="bg-gray-200 px-1 rounded">[]</code> cho câu hỏi nhiều đáp án đúng<br />
                      • Đánh dấu <code className="bg-gray-200 px-1 rounded">[x]</code> cho các đáp án đúng
                    </p>
                  </div>

                  <div>
                    <h4 className="mb-3 flex items-center gap-2">
                      <Badge variant="secondary">Lưu ý</Badge>
                      Quy tắc quan trọng
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li>• Dòng đầu tiên (không có () hoặc []) là câu hỏi</li>
                      <li>• Các dòng tiếp theo với () hoặc [] là đáp án</li>
                      <li>• Mỗi câu hỏi cách nhau bằng 1 dòng trống (không bắt buộc)</li>
                      <li>• Có thể có nhiều đáp án đúng với [x]</li>
                      <li>• Phải có ít nhất 1 đáp án đúng</li>
                    </ul>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="editor">
            <TabsList className="mb-4">
              <TabsTrigger value="editor">Soạn thảo</TabsTrigger>
              <TabsTrigger value="normalize">Chuẩn hóa AI</TabsTrigger>
              <TabsTrigger value="preview">
                Xem trước ({parsedQuestions.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Nhập câu hỏi theo format</Label>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => copyExample(EXAMPLE_SINGLE)}
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Ví dụ 1
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => copyExample(EXAMPLE_FULL)}
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Ví dụ đầy đủ
                    </Button>
                  </div>
                </div>
                <Textarea
                  placeholder={`Nhập câu hỏi theo format...\n\n${EXAMPLE_SINGLE}`}
                  value={quizText}
                  onChange={(e) => setQuizText(e.target.value)}
                  rows={15}
                  className="font-mono text-sm"
                />
              </div>

              <Alert>
                <AlertCircle className="w-4 h-4" />
                <AlertDescription className="text-sm">
                  <strong>Format:</strong> Dòng đầu là câu hỏi. 
                  Dùng <code>(x)</code> cho đáp án đúng (1 đáp án) hoặc <code>[x]</code> (nhiều đáp án).
                </AlertDescription>
              </Alert>

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
            </TabsContent>

            <TabsContent value="normalize" className="space-y-4">
              <Alert className="bg-blue-50 border-blue-200">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <AlertDescription className="text-blue-900 text-sm">
                  <strong>Công cụ AI:</strong> Dán văn bản quiz chưa chuẩn (từ Word, PDF, v.v.) 
                  và AI sẽ tự động chuẩn hóa sang format đúng.
                </AlertDescription>
              </Alert>

              <div>
                <Label>Văn bản chưa chuẩn hóa</Label>
                <Textarea
                  placeholder={`Dán văn bản quiz chưa chuẩn vào đây...\n\nVí dụ:\nCâu 1: React là gì?\nA. Framework backend\nB. Thư viện JavaScript (đúng)\nC. Database\n\nCâu 2: Hook nào dùng để quản lý state?\nA. useState (đúng)\nB. useEffect (đúng)\nC. useBackend`}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  rows={12}
                  className="mt-2"
                />
              </div>

              <Button 
                onClick={handleNormalizeWithGemini}
                disabled={isNormalizing}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {isNormalizing ? 'Đang chuẩn hóa...' : 'Chuẩn hóa bằng AI'}
              </Button>

              <Alert className="bg-amber-50 border-amber-200">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <AlertDescription className="text-amber-900 text-sm">
                  <strong>Lưu ý:</strong> Sau khi AI chuẩn hóa, hãy kiểm tra lại kết quả 
                  trong tab "Soạn thảo" trước khi lưu.
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              {parsedQuestions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Chưa có câu hỏi nào</p>
                  <p className="text-sm">Nhập câu hỏi ở tab "Soạn thảo" và nhấn "Phân tích câu hỏi"</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {parsedQuestions.map((q, qIndex) => (
                    <Card key={qIndex}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-3 mb-4">
                          <Badge variant="secondary">Câu {qIndex + 1}</Badge>
                          <div className="flex-1">
                            <h4 className="mb-1">{q.question}</h4>
                            <Badge className={q.type === 'single' ? 'bg-blue-500' : 'bg-purple-500'}>
                              {q.type === 'single' ? '1 đáp án đúng' : 'Nhiều đáp án đúng'}
                            </Badge>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {q.options.map((option, optIndex) => {
                            const isCorrect = q.correctAnswers.includes(optIndex);
                            return (
                              <div
                                key={optIndex}
                                className={`p-3 rounded-lg border-2 ${
                                  isCorrect 
                                    ? 'border-green-500 bg-green-50' 
                                    : 'border-gray-200 bg-white'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  {isCorrect && <Check className="w-4 h-4 text-green-600" />}
                                  <span className={isCorrect ? 'font-medium text-green-900' : ''}>
                                    {option}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  <Button onClick={handleSave} className="w-full bg-[#1E88E5] text-white hover:bg-[#1565C0]">
                    <Check className="w-4 h-4 mr-2" />
                    Xác nhận và lưu {parsedQuestions.length} câu hỏi
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
