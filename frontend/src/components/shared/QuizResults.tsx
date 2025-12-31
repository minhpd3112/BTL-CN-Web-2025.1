import { CheckCircle2, XCircle, Award, TrendingUp, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface QuizResultsProps {
    results: {
        score: number;
        correctCount: number;
        totalQuestions: number;
        passed: boolean;
        passingScore: number;
        results: Array<{
            questionId: string;
            question: string;
            userAnswers: string[];
            correctAnswers: string[];
            isCorrect: boolean;
            explanation?: string;
            answers: Array<{
                id: string;
                answer_text: string;
                is_correct: boolean;
                order_index: number;
            }>;
        }>;
    };
    quizType: 'exam' | 'practice';
    onRetry?: () => void;
    onClose: () => void;
}

export function QuizResults({ results, quizType, onRetry, onClose }: QuizResultsProps) {
    const { score, correctCount, totalQuestions, passed, passingScore } = results;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Score summary card */}
            <Card className={`border-2 ${passed ? 'border-green-500 bg-green-50' : 'border-orange-500 bg-orange-50'}`}>
                <CardContent className="p-8">
                    <div className="text-center space-y-4">
                        {passed ? (
                            <Award className="w-20 h-20 mx-auto text-green-600" />
                        ) : (
                            <TrendingUp className="w-20 h-20 mx-auto text-orange-600" />
                        )}

                        <div>
                            <h2 className="text-3xl font-bold mb-2">
                                {passed ? 'Chúc mừng! Bạn đã đạt!' : 'Chưa đạt yêu cầu'}
                            </h2>
                            <p className="text-gray-600">
                                {passed
                                    ? `Bạn đã vượt qua với ${score}% (yêu cầu ${passingScore}%)`
                                    : `Bạn đạt ${score}% (yêu cầu ${passingScore}%)`
                                }
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                                <div className="text-3xl font-bold text-[#1E88E5]">{score}%</div>
                                <div className="text-sm text-gray-600">Điểm số</div>
                            </div>
                            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                                <div className="text-3xl font-bold text-green-600">{correctCount}</div>
                                <div className="text-sm text-gray-600">Đúng</div>
                            </div>
                            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                                <div className="text-3xl font-bold text-red-600">{totalQuestions - correctCount}</div>
                                <div className="text-sm text-gray-600">Sai</div>
                            </div>
                        </div>

                        <Progress value={score} className="h-3" />

                        <div className="flex gap-3 justify-center pt-4">
                            {quizType === 'practice' && onRetry && (
                                <Button
                                    onClick={onRetry}
                                    variant="outline"
                                    className="gap-2"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Làm lại
                                </Button>
                            )}
                            <Button
                                onClick={onClose}
                                className="bg-[#1E88E5] hover:bg-[#1565C0] text-white"
                            >
                                Đóng
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Detailed results */}
            <Card>
                <CardHeader>
                    <CardTitle>Chi tiết từng câu hỏi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {results.results.map((result, index) => (
                        <Card key={result.questionId} className={`border ${result.isCorrect ? 'border-green-200' : 'border-red-200'}`}>
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge variant="outline">Câu {index + 1}</Badge>
                                            {result.isCorrect ? (
                                                <Badge className="bg-green-600">
                                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                                    Đúng
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-red-600">
                                                    <XCircle className="w-3 h-3 mr-1" />
                                                    Sai
                                                </Badge>
                                            )}
                                        </div>
                                        <h4 className="font-medium leading-relaxed">{result.question}</h4>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {result.answers.map((answer) => {
                                    const isUserAnswer = result.userAnswers.includes(answer.id);
                                    const isCorrectAnswer = answer.is_correct;

                                    let bgClass = 'bg-gray-50';
                                    let borderClass = 'border-gray-200';
                                    let icon = null;

                                    if (isCorrectAnswer) {
                                        bgClass = 'bg-green-50';
                                        borderClass = 'border-green-300';
                                        icon = <CheckCircle2 className="w-5 h-5 text-green-600" />;
                                    } else if (isUserAnswer && !isCorrectAnswer) {
                                        bgClass = 'bg-red-50';
                                        borderClass = 'border-red-300';
                                        icon = <XCircle className="w-5 h-5 text-red-600" />;
                                    }

                                    return (
                                        <div
                                            key={answer.id}
                                            className={`p-3 border-2 rounded-lg ${bgClass} ${borderClass} flex items-center gap-3`}
                                        >
                                            {icon && <div className="flex-shrink-0">{icon}</div>}
                                            <div className="flex-1">
                                                {answer.answer_text}
                                                {isUserAnswer && !isCorrectAnswer && (
                                                    <span className="ml-2 text-sm text-red-600">(Bạn đã chọn)</span>
                                                )}
                                                {isUserAnswer && isCorrectAnswer && (
                                                    <span className="ml-2 text-sm text-green-600">(Bạn đã chọn)</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                {result.explanation && (
                                    <Alert className="mt-3">
                                        <AlertDescription>
                                            <strong>Giải thích:</strong> {result.explanation}
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
