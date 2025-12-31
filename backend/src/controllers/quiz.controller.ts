import { Request, Response } from 'express';
import { supabase, supabaseAdmin } from '@config/supabase';
import { httpStatus } from '@utils/httpStatus';

export const QuizController = {
    /**
     * Create/Update quiz for a lesson
     * POST /api/quiz/:lessonId
     */
    async createOrUpdateQuiz(req: Request, res: Response) {
        try {
            const { lessonId } = req.params;
            const { questions, settings } = req.body;

            // Validate input
            if (!Array.isArray(questions) || questions.length === 0) {
                return res.status(httpStatus.BAD_REQUEST).json({
                    success: false,
                    message: 'Questions array is required and must not be empty',
                });
            }

            // Update lesson with quiz settings (use admin client)
            const { error: lessonError } = await supabaseAdmin
                .from('lessons')
                .update({
                    quiz_settings: settings,
                    content_type: 'quiz'
                })
                .eq('id', lessonId);

            if (lessonError) throw lessonError;

            // Delete existing quiz questions for this lesson (use admin client)
            await supabaseAdmin
                .from('quiz_questions')
                .delete()
                .eq('lesson_id', lessonId);

            // Insert new quiz questions (use admin client)
            const questionsToInsert = questions.map((q: any, index: number) => ({
                lesson_id: lessonId,
                question: q.question,
                type: q.type === 'single' ? 'single_choice' : 'multiple_choice',
                order_index: index,
                explanation: q.explanation || null,
            }));

            const { data: insertedQuestions, error: questionError } = await supabaseAdmin
                .from('quiz_questions')
                .insert(questionsToInsert)
                .select();

            if (questionError) throw questionError;

            // Insert answers for each question (use admin client)
            const answersToInsert: any[] = [];
            questions.forEach((q: any, qIndex: number) => {
                q.options.forEach((option: string, optIndex: number) => {
                    answersToInsert.push({
                        question_id: insertedQuestions[qIndex].id,
                        answer_text: option,
                        is_correct: q.correctAnswers.includes(optIndex),
                        order_index: optIndex,
                    });
                });
            });

            const { error: answerError } = await supabaseAdmin
                .from('quiz_answers')
                .insert(answersToInsert);

            if (answerError) throw answerError;

            res.status(httpStatus.CREATED).json({
                success: true,
                message: 'Quiz created successfully',
                data: {
                    lessonId,
                    questionsCount: insertedQuestions.length,
                },
            });
        } catch (error: any) {
            console.error('Create quiz error:', error);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Failed to create quiz',
                error: error.message,
            });
        }
    },

    /**
     * Get quiz by lesson ID (for students)
     * GET /api/quiz/:lessonId
     */
    async getQuizByLessonId(req: Request, res: Response) {
        try {
            const { lessonId } = req.params;
            const userId = req.user?.id; // From auth middleware

            // Get lesson with quiz settings (use admin client to avoid RLS issues)
            const { data: lesson, error: lessonError } = await supabaseAdmin
                .from('lessons')
                .select('id, title, quiz_settings')
                .eq('id', lessonId)
                .eq('content_type', 'quiz')
                .single();

            if (lessonError || !lesson) {
                return res.status(httpStatus.NOT_FOUND).json({
                    success: false,
                    message: 'Quiz not found',
                });
            }

            // Get quiz questions with answers (use admin client)
            const { data: questions, error: questionsError } = await supabaseAdmin
                .from('quiz_questions')
                .select(`
          id,
          question,
          type,
          order_index,
          answers:quiz_answers(id, answer_text, is_correct, order_index)
        `)
                .eq('lesson_id', lessonId)
                .order('order_index', { ascending: true });

            if (questionsError) throw questionsError;

            // Check if user has already attempted this quiz (use admin client)
            let previousAttempt = null;
            if (userId) {
                const { data: attempt } = await supabaseAdmin
                    .from('quiz_attempts')
                    .select('*')
                    .eq('lesson_id', lessonId)
                    .eq('user_id', userId)
                    .order('completed_at', { ascending: false })
                    .limit(1)
                    .single();

                previousAttempt = attempt;
            }

            res.json({
                success: true,
                data: {
                    lesson,
                    questions: questions?.map(q => ({
                        ...q,
                        answers: q.answers?.sort((a: any, b: any) => a.order_index - b.order_index)
                    })),
                    previousAttempt,
                },
            });
        } catch (error: any) {
            console.error('Get quiz error:', error);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Failed to fetch quiz',
                error: error.message,
            });
        }
    },

    /**
     * Submit quiz answers and get results
     * POST /api/quiz/:lessonId/submit
     */
    async submitQuiz(req: Request, res: Response) {
        try {
            const { lessonId } = req.params;
            const { answers, timeSpent } = req.body; // answers: { questionId: [answerIds] }
            const userId = req.user?.id;

            if (!userId) {
                return res.status(httpStatus.UNAUTHORIZED).json({
                    success: false,
                    message: 'User not authenticated',
                });
            }

            // Get all questions with correct answers (use admin client)
            const { data: questions, error: questionsError } = await supabaseAdmin
                .from('quiz_questions')
                .select(`
          id,
          question,
          type,
          explanation,
          answers:quiz_answers(id, answer_text, is_correct, order_index)
        `)
                .eq('lesson_id', lessonId)
                .order('order_index', { ascending: true });

            if (questionsError) throw questionsError;

            // Get quiz settings (use admin client)
            const { data: lesson } = await supabaseAdmin
                .from('lessons')
                .select('quiz_settings')
                .eq('id', lessonId)
                .single();

            const quizSettings = lesson?.quiz_settings || {};
            const passingScore = quizSettings.passingScore || 70;

            // Grade the quiz
            let correctCount = 0;
            const results: any[] = [];

            questions?.forEach((question: any) => {
                const userAnswerIds = answers[question.id] || [];
                const correctAnswerIds = question.answers
                    ?.filter((a: any) => a.is_correct)
                    .map((a: any) => a.id) || [];

                // Check if answer is correct
                const isCorrect =
                    userAnswerIds.length === correctAnswerIds.length &&
                    userAnswerIds.every((id: string) => correctAnswerIds.includes(id));

                if (isCorrect) correctCount++;

                results.push({
                    questionId: question.id,
                    question: question.question,
                    userAnswers: userAnswerIds,
                    correctAnswers: correctAnswerIds,
                    isCorrect,
                    explanation: question.explanation,
                    answers: question.answers?.sort((a: any, b: any) => a.order_index - b.order_index),
                });
            });

            const totalQuestions = questions?.length || 0;
            const score = Math.round((correctCount / totalQuestions) * 100);
            const passed = score >= passingScore;

            // Save quiz attempt (use admin client)
            const { data: attempt, error: attemptError } = await supabaseAdmin
                .from('quiz_attempts')
                .insert({
                    user_id: userId,
                    lesson_id: lessonId,
                    score,
                    total_questions: totalQuestions,
                    correct_answers: correctCount,
                    time_spent: timeSpent || null,
                })
                .select()
                .single();

            if (attemptError) throw attemptError;

            // Update lesson progress if passed (use admin client)
            if (passed) {
                const { error: progressError } = await supabaseAdmin
                    .from('lesson_progress')
                    .upsert({
                        user_id: userId,
                        lesson_id: lessonId,
                        completed: true,
                        completed_at: new Date().toISOString(),
                    }, {
                        onConflict: 'user_id,lesson_id'
                    });

                if (progressError) console.error('Progress update error:', progressError);
            }

            res.json({
                success: true,
                data: {
                    attemptId: attempt.id,
                    score,
                    correctCount,
                    totalQuestions,
                    passed,
                    passingScore,
                    results,
                },
            });
        } catch (error: any) {
            console.error('Submit quiz error:', error);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Failed to submit quiz',
                error: error.message,
            });
        }
    },

    /**
     * Get quiz attempts history
     * GET /api/quiz/:lessonId/attempts
     */
    async getQuizAttempts(req: Request, res: Response) {
        try {
            const { lessonId } = req.params;
            const userId = req.user?.id;

            if (!userId) {
                return res.status(httpStatus.UNAUTHORIZED).json({
                    success: false,
                    message: 'User not authenticated',
                });
            }

            const { data: attempts, error } = await supabaseAdmin
                .from('quiz_attempts')
                .select('*')
                .eq('lesson_id', lessonId)
                .eq('user_id', userId)
                .order('completed_at', { ascending: false });

            if (error) throw error;

            res.json({
                success: true,
                data: attempts || [],
            });
        } catch (error: any) {
            console.error('Get quiz attempts error:', error);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Failed to fetch quiz attempts',
                error: error.message,
            });
        }
    },
};
