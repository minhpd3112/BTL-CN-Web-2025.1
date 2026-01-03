import { Request, Response } from 'express';
import { supabase, supabaseAdmin } from '../config/supabase';
import aiService from '../services/ai.service';
import youtubeService from '../services/youtube.service';

interface GenerateCourseRequest {
    topic: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    goal: string;
}

export const aiCourseController = {
    /**
     * Preview a course without saving (for user review)
     */
    previewCourse: async (req: Request, res: Response) => {
        try {
            const { topic, level, goal } = req.body as GenerateCourseRequest;

            if (!topic || !level || !goal) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: topic, level, goal',
                });
            }

            console.log(`Generating AI course preview: ${topic} - ${level} - ${goal}`);

            // Generate course outline using AI
            const courseOutline = await aiService.generateCourseOutline({
                topic,
                level,
                goal,
            });

            // Search YouTube videos for video lessons
            for (const section of courseOutline.sections) {
                for (const lesson of section.lessons) {
                    if (lesson.type === 'video' && lesson.searchQuery) {
                        try {
                            const video = await youtubeService.getFirstVideo(lesson.searchQuery);
                            if (video) {
                                (lesson as any).youtubeUrl = video.url;
                                (lesson as any).videoTitle = video.title;
                                (lesson as any).videoThumbnail = video.thumbnail;
                            }
                        } catch (error) {
                            console.error(`Failed to find video for: ${lesson.searchQuery}`);
                        }
                    }
                }
            }

            return res.json({
                success: true,
                data: courseOutline,
            });
        } catch (error: any) {
            console.error('Preview course error:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to generate course preview',
            });
        }
    },

    /**
     * Generate and save a complete course
     */
    generateCourse: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required',
                });
            }

            const { topic, level, goal, courseData } = req.body;

            // If courseData is provided, use it directly (from preview)
            // Otherwise, generate new course outline
            let courseOutline = courseData;

            if (!courseOutline) {
                if (!topic || !level || !goal) {
                    return res.status(400).json({
                        success: false,
                        message: 'Missing required fields: topic, level, goal',
                    });
                }

                console.log(`Generating AI course: ${topic} - ${level} - ${goal}`);
                courseOutline = await aiService.generateCourseOutline({ topic, level, goal });

                // Search YouTube videos for video lessons
                for (const section of courseOutline.sections) {
                    for (const lesson of section.lessons) {
                        if (lesson.type === 'video' && lesson.searchQuery) {
                            try {
                                const video = await youtubeService.getFirstVideo(lesson.searchQuery);
                                if (video) {
                                    lesson.youtubeUrl = video.url;
                                }
                            } catch (error) {
                                console.error(`Failed to find video for: ${lesson.searchQuery}`);
                            }
                        }
                    }
                }
            }
                  // Find the first video thumbnail to use as course image
            let courseImageUrl = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80'; // Default placeholder
            for (const section of courseOutline.sections) {
                for (const lesson of section.lessons) {
                    if (lesson.type === 'video' && (lesson as any).videoThumbnail) {
                        courseImageUrl = (lesson as any).videoThumbnail;
                        break;
                    }
                }
                if (courseImageUrl !== 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80') break;
            }
            // Create course in database
            const { data: course, error: courseError } = await supabase
                .from('courses')
                .insert({
                    title: courseOutline.title,
                    description: courseOutline.description,
                    overview: courseOutline.overview,
                    owner_id: userId,
                    visibility: 'private',
                    status: 'draft', // Draft for private courses, no approval needed
                    image_url: courseImageUrl, // Use video thumbnail or default image
                })
                .select()
                .single();

            if (courseError) {
                throw new Error(`Failed to create course: ${courseError.message}`);
            }

            // Create sections and lessons
            for (let sectionIndex = 0; sectionIndex < courseOutline.sections.length; sectionIndex++) {
                const sectionData = courseOutline.sections[sectionIndex];

                // Create section
                const { data: section, error: sectionError } = await supabase
                    .from('sections')
                    .insert({
                        course_id: course.id,
                        title: sectionData.title,
                        description: '',
                        order_index: sectionIndex,
                    })
                    .select()
                    .single();

                if (sectionError) {
                    console.error(`Failed to create section: ${sectionError.message}`);
                    continue;
                }

                // Create lessons
                for (let lessonIndex = 0; lessonIndex < sectionData.lessons.length; lessonIndex++) {
                    const lessonData = sectionData.lessons[lessonIndex];

                    const lessonInsertData: any = {
                        section_id: section.id,
                        title: lessonData.title,
                        description: lessonData.description || '',
                        content_type: lessonData.type === 'text' ? 'article' : lessonData.type,
                        order_index: lessonIndex,
                        is_free: lessonIndex === 0, // First lesson is free
                    };

                    // Set content based on type
                    if (lessonData.type === 'video' && lessonData.youtubeUrl) {
                        lessonInsertData.content_url = lessonData.youtubeUrl;
                    } else if (lessonData.type === 'text' && lessonData.content) {
                        lessonInsertData.content_text = lessonData.content;
                    }

                    const { data: lesson, error: lessonError } = await supabase
                        .from('lessons')
                        .insert(lessonInsertData)
                        .select()
                        .single();

                    if (lessonError) {
                        console.error(`Failed to create lesson: ${lessonError.message}`);
                        continue;
                    }

                    // Debug: Log quiz data
                    if (lessonData.type === 'quiz') {
                        console.log(`Quiz lesson "${lessonData.title}":`, {
                            hasQuizQuestions: !!lessonData.quizQuestions,
                            quizQuestionsCount: lessonData.quizQuestions?.length || 0,
                            quizQuestions: lessonData.quizQuestions
                        });
                    }

                    // Create quiz questions if it's a quiz lesson
                    if (lessonData.type === 'quiz' && lessonData.quizQuestions && lessonData.quizQuestions.length > 0) {
                        for (let qIndex = 0; qIndex < lessonData.quizQuestions.length; qIndex++) {
                            const q = lessonData.quizQuestions[qIndex];

                            // Create question using admin client to bypass RLS
                            const { data: question, error: questionError } = await supabaseAdmin
                                .from('quiz_questions')
                                .insert({
                                    lesson_id: lesson.id,
                                    question: q.question,
                                    type: q.type === 'single' ? 'single_choice' : 'multiple_choice',
                                    explanation: q.explanation || '',
                                    order_index: qIndex,
                                })
                                .select()
                                .single();

                            if (questionError) {
                                console.error(`Failed to create question: ${questionError.message}`);
                                continue;
                            }

                            console.log(`Created question: ${q.question.substring(0, 50)}...`);

                            // Create answers using admin client
                            for (let aIndex = 0; aIndex < q.options.length; aIndex++) {
                                const { error: answerError } = await supabaseAdmin.from('quiz_answers').insert({
                                    question_id: question.id,
                                    answer_text: q.options[aIndex],
                                    is_correct: q.correctAnswers.includes(aIndex),
                                    order_index: aIndex,
                                });
                                if (answerError) {
                                    console.error(`Failed to create answer: ${answerError.message}`);
                                }
                            }
                        }
                    }
                }
            }

            // Add tags based on topic
            const topicTags = [topic];
            try {
                // Check if tags exist, if not create them
                for (const tagName of topicTags) {
                    const { data: existingTag } = await supabase
                        .from('tags')
                        .select('id')
                        .eq('name', tagName)
                        .single();

                    let tagId = existingTag?.id;

                    if (!tagId) {
                        const { data: newTag } = await supabase
                            .from('tags')
                            .insert({ name: tagName })
                            .select('id')
                            .single();
                        tagId = newTag?.id;
                    }

                    if (tagId) {
                        await supabase.from('course_tags').insert({
                            course_id: course.id,
                            tag_id: tagId,
                        });
                    }
                }
            } catch (error) {
                console.error('Failed to add tags:', error);
            }

            return res.json({
                success: true,
                message: 'Course generated successfully',
                data: {
                    courseId: course.id,
                    title: course.title,
                },
            });
        } catch (error: any) {
            console.error('Generate course error:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to generate course',
            });
        }
    },
};

export default aiCourseController;
