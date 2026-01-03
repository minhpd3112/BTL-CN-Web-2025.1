import { useState, useEffect, useRef } from 'react';
import { Clock, CheckCircle2, XCircle, AlertCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface QuizQuestion {
    id: string;
    question: string;
    type: string; // 'single_choice' or 'multiple_choice'
    order_index: number;
    answers: QuizAnswer[];
}

interface QuizAnswer {
    id: string;
    answer_text: string;
    order_index: number;
}

interface QuizSettings {
    quizType: 'exam' | 'practice';
    timeLimit?: number;
    passingScore: number;
}

interface QuizTakerProps {
    lessonId: string;
    quizData: {
        lesson: { title: string; quiz_settings: QuizSettings };
        questions: QuizQuestion[];
        previousAttempt?: any;
    };
    onSubmit: (answers: Record<string, string[]>, timeSpent: number) => Promise<any>;
    onClose: () => void;
}

export function QuizTaker({ lessonId, quizData, onSubmit, onClose }: QuizTakerProps) {
    const { lesson, questions } = quizData;

    // Default settings if lesson or quiz_settings is null
    const defaultSettings: QuizSettings = {
        quizType: 'practice',
        timeLimit: undefined,
        passingScore: 50
    };

    const settings = lesson?.quiz_settings || defaultSettings;

    const [started, setStarted] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string[]>>({});
    const [timeRemaining, setTimeRemaining] = useState<number | null>(
        settings.quizType === 'exam' && settings.timeLimit ? settings.timeLimit * 60 : null
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    const startTimeRef = useRef<number>(Date.now());

    // Timer effect
    useEffect(() => {
        if (!started || !timeRemaining || settings.quizType !== 'exam') return;

        const interval = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev === null || prev <= 1) {
                    clearInterval(interval);
                    handleAutoSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [started, timeRemaining]);

    const currentQuestion = questions[currentQuestionIndex];

    const handleAnswerChange = (questionId: string, answerId: string, isMultiple: boolean) => {
        setAnswers((prev) => {
            if (isMultiple) {
                const current = prev[questionId] || [];
                const newAnswers = current.includes(answerId)
                    ? current.filter(id => id !== answerId)
                    : [...current, answerId];
                return { ...prev, [questionId]: newAnswers };
            } else {
                return { ...prev, [questionId]: [answerId] };
            }
        });
    };

    const handleAutoSubmit = async () => {
        toast.warning('Hết thời gian! Quiz sẽ được nộp tự động.');
        await handleSubmit();
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
            const result = await onSubmit(answers, timeSpent);

            // The parent component will handle showing results
        } catch (error) {
            console.error('Submit error:', error);
            toast.error('Không thể nộp bài. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
            setShowConfirmDialog(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const answeredCount = Object.keys(answers).length;
    const progress = (answeredCount / questions.length) * 100;

    // Start screen
    if (!started) {
        return (
            <Card className="max-w-2xl mx-auto">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">{lesson?.title || 'Quiz'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className="text-3xl font-bold text-[#1E88E5]">{questions.length}</div>
                            <div className="text-sm text-gray-600">Câu hỏi</div>
                        </div>
                        {settings.timeLimit && settings.quizType === 'exam' && (
                            <div className="text-center p-4 bg-orange-50 rounded-lg">
                                <div className="text-3xl font-bold text-orange-600">{settings.timeLimit}</div>
                                <div className="text-sm text-gray-600">Phút</div>
                            </div>
                        )}
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-3xl font-bold text-green-600">{settings.passingScore}%</div>
                            <div className="text-sm text-gray-600">Điểm đạt</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <div className="text-xl font-bold text-purple-600">
                                {settings.quizType === 'exam' ? 'Thi' : 'Luyện tập'}
                            </div>
                            <div className="text-sm text-gray-600">Loại quiz</div>
                        </div>
                    </div>

                    {settings.quizType === 'exam' && (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                Đây là bài kiểm tra có thời gian giới hạn. Bạn không thể tạm dừng sau khi bắt đầu.
                                {settings.timeLimit && ` Thời gian: ${settings.timeLimit} phút.`}
                            </AlertDescription>
                        </Alert>
                    )}

                    {quizData.previousAttempt && (
                        <Alert>
                            <AlertDescription>
                                Lần làm trước: <strong>{quizData.previousAttempt.score}%</strong>
                                {quizData.previousAttempt.score >= settings.passingScore ? ' (Đạt)' : ' (Không đạt)'}
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="flex gap-3 justify-center">
                        <Button variant="outline" onClick={onClose}>
                            Hủy
                        </Button>
                        <Button
                            onClick={() => {
                                setStarted(true);
                                startTimeRef.current = Date.now();
                            }}
                            className="bg-[#1E88E5] hover:bg-[#1565C0] text-white"
                        >
                            Bắt đầu làm bài
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Check if questions array is empty or currentQuestion is undefined
    if (!questions || questions.length === 0 || !currentQuestion) {
        return (
            <Card className="max-w-2xl mx-auto">
                <CardContent className="p-8 text-center">
                    <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Không có câu hỏi</h3>
                    <p className="text-gray-600 mb-4">Quiz này chưa có câu hỏi nào. Vui lòng liên hệ giảng viên.</p>
                    <Button onClick={onClose} className="bg-[#1E88E5] hover:bg-[#1565C0] text-white">
                        Quay lại
                    </Button>
                </CardContent>
            </Card>
        );
    }

    // Quiz screen
    return (
        <>
            <div className="max-w-4xl mx-auto space-y-4">
                {/* Header with timer and progress */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Badge variant="outline">
                                    Câu {currentQuestionIndex + 1}/{questions.length}
                                </Badge>
                                <Progress value={progress} className="w-32" />
                                <span className="text-sm text-gray-600">
                                    {answeredCount}/{questions.length} đã trả lời
                                </span>
                            </div>
                            {timeRemaining !== null && (
                                <div className="flex items-center gap-2">
                                    <Clock className={`w-5 h-5 ${timeRemaining < 60 ? 'text-red-500' : 'text-gray-600'}`} />
                                    <span className={`font-mono font-bold ${timeRemaining < 60 ? 'text-red-500' : ''}`}>
                                        {formatTime(timeRemaining)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Question card */}
                <Card>
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <Badge className="mb-3">
                                    {currentQuestion.type === 'multiple_choice' ? 'Nhiều đáp án' : 'Một đáp án'}
                                </Badge>
                                <CardTitle className="text-xl leading-relaxed">
                                    {currentQuestion.question}
                                </CardTitle>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {currentQuestion.type === 'single_choice' ? (
                            <RadioGroup
                                value={answers[currentQuestion.id]?.[0] || ''}
                                onValueChange={(value) => handleAnswerChange(currentQuestion.id, value, false)}
                            >
                                {currentQuestion.answers.map((answer) => (
                                    <div
                                        key={answer.id}
                                        className="flex items-center space-x-3 p-4 border-2 rounded-lg hover:border-[#1E88E5] cursor-pointer transition-colors"
                                        onClick={() => handleAnswerChange(currentQuestion.id, answer.id, false)}
                                    >
                                        <RadioGroupItem value={answer.id} id={answer.id} />
                                        <Label htmlFor={answer.id} className="flex-1 cursor-pointer">
                                            {answer.answer_text}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        ) : (
                            <div className="space-y-3">
                                {currentQuestion.answers.map((answer) => (
                                    <div
                                        key={answer.id}
                                        className="flex items-center space-x-3 p-4 border-2 rounded-lg hover:border-[#1E88E5] cursor-pointer transition-colors"
                                        onClick={() => handleAnswerChange(currentQuestion.id, answer.id, true)}
                                    >
                                        <Checkbox
                                            id={answer.id}
                                            checked={answers[currentQuestion.id]?.includes(answer.id) || false}
                                            onCheckedChange={() => handleAnswerChange(currentQuestion.id, answer.id, true)}
                                        />
                                        <Label htmlFor={answer.id} className="flex-1 cursor-pointer">
                                            {answer.answer_text}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                    <Button
                        variant="outline"
                        onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                        disabled={currentQuestionIndex === 0}
                    >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Câu trước
                    </Button>

                    {currentQuestionIndex === questions.length - 1 ? (
                        <Button
                            onClick={() => setShowConfirmDialog(true)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                            disabled={isSubmitting}
                        >
                            Nộp bài
                        </Button>
                    ) : (
                        <Button
                            onClick={() => setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                            className="bg-[#1E88E5] hover:bg-[#1565C0] text-white"
                        >
                            Câu tiếp
                            <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    )}
                </div>

                {/* Question grid navigator */}
                <Card>
                    <CardContent className="p-4">
                        <div className="text-sm font-medium mb-3">Điều hướng nhanh:</div>
                        <div className="grid grid-cols-10 gap-2">
                            {questions.map((q, idx) => (
                                <button
                                    key={q.id}
                                    onClick={() => setCurrentQuestionIndex(idx)}
                                    className={`
                    aspect-square rounded flex items-center justify-center text-sm font-medium transition-colors
                    ${idx === currentQuestionIndex
                                            ? 'bg-[#1E88E5] text-white'
                                            : answers[q.id]?.length
                                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                  `}
                                >
                                    {idx + 1}
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Confirm submit dialog */}
            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Nộp bài quiz?</DialogTitle>
                        <DialogDescription>
                            Bạn đã trả lời {answeredCount}/{questions.length} câu hỏi.
                            {answeredCount < questions.length && (
                                <span className="block mt-2 text-orange-600 font-medium">
                                    Còn {questions.length - answeredCount} câu chưa trả lời!
                                </span>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                            Tiếp tục làm bài
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            {isSubmitting ? 'Đang nộp...' : 'Xác nhận nộp bài'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
