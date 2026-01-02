import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';
console.log('🔑 GEMINI_API_KEY loaded:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT SET');

const genAI = new GoogleGenerativeAI(apiKey);

interface CourseOutline {
    title: string;
    description: string;
    overview: string;
    sections: {
        title: string;
        lessons: {
            title: string;
            type: 'video' | 'text' | 'quiz';
            description: string;
            searchQuery?: string; // For YouTube search
            content?: string; // For text lessons
            quizQuestions?: {
                question: string;
                type: 'single' | 'multiple';
                options: string[];
                correctAnswers: number[];
                explanation: string;
            }[];
        }[];
    }[];
}

interface GenerateCourseInput {
    topic: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    goal: string;
    language?: string;
}

export const aiService = {
    /**
     * Generate a complete course outline using Gemini AI
     */
    generateCourseOutline: async (input: GenerateCourseInput): Promise<CourseOutline> => {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

        const levelText = {
            beginner: 'người mới bắt đầu, chưa có kinh nghiệm',
            intermediate: 'trình độ trung cấp, có kiến thức cơ bản',
            advanced: 'trình độ nâng cao, có kinh nghiệm thực tế',
        };

        const prompt = `Bạn là một chuyên gia giáo dục. Hãy tạo một lộ trình học hoàn chỉnh cho chủ đề "${input.topic}" dành cho ${levelText[input.level]} với mục tiêu "${input.goal}".

Yêu cầu:
1. Tạo 2-3 mục (sections) chính
2. Mỗi mục có 2-3 bài học (lessons)
3. Mỗi bài học có thể là: video, text (bài viết), hoặc quiz
4. Mỗi mục nên có ít nhất 1 video lesson và kết thúc bằng 1 quiz
5. Với video lesson, cung cấp query tìm kiếm YouTube tiếng Việt hoặc tiếng Anh phù hợp
6. Với text lesson, viết nội dung chi tiết (500-1000 từ) theo format Markdown
7. Với quiz, tạo 4-5 câu hỏi trắc nghiệm có giải thích

Trả về JSON theo format sau (KHÔNG có markdown code block, chỉ JSON thuần):
{
  "title": "Tên khóa học",
  "description": "Mô tả ngắn gọn (100-200 ký tự)",
  "overview": "Tổng quan chi tiết về khóa học (format Markdown)",
  "sections": [
    {
      "title": "Tên mục",
      "lessons": [
        {
          "title": "Tên bài học",
          "type": "video",
          "description": "Mô tả ngắn",
          "searchQuery": "query tìm kiếm YouTube cho video này"
        },
        {
          "title": "Tên bài học",
          "type": "text",
          "description": "Mô tả ngắn",
          "content": "Nội dung bài viết đầy đủ với format Markdown"
        },
        {
          "title": "Tên bài học",
          "type": "quiz",
          "description": "Kiểm tra kiến thức",
          "quizQuestions": [
            {
              "question": "Câu hỏi?",
              "type": "single",
              "options": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
              "correctAnswers": [0],
              "explanation": "Giải thích đáp án đúng"
            }
          ]
        }
      ]
    }
  ]
}`;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            let text = response.text();

            console.log('Raw AI response length:', text.length);
            console.log('Raw AI response preview:', text.substring(0, 200));

            // Clean up response - remove markdown code blocks if present
            text = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

            // Find the JSON object boundaries
            const startIndex = text.indexOf('{');
            const endIndex = text.lastIndexOf('}');

            if (startIndex === -1 || endIndex === -1) {
                console.error('No JSON object found in response');
                throw new Error('AI response does not contain valid JSON object');
            }

            text = text.substring(startIndex, endIndex + 1);

            // Sanitize control characters in JSON string values
            // This regex finds strings and escapes control characters within them
            text = text.replace(/"(?:[^"\\]|\\.)*"/g, (match) => {
                return match
                    .replace(/\n/g, '\\n')
                    .replace(/\r/g, '\\r')
                    .replace(/\t/g, '\\t')
                    .replace(/[\x00-\x1F\x7F]/g, ''); // Remove other control chars
            });

            console.log('Sanitized JSON length:', text.length);

            // Try to parse, if fails, try to repair
            let courseOutline: CourseOutline;
            try {
                courseOutline = JSON.parse(text);
            } catch (parseError: any) {
                console.log('JSON parse failed, attempting repair...');
                console.log('Parse error position:', parseError.message);

                // Try to fix common JSON errors
                // 1. Remove trailing commas before } or ]
                text = text.replace(/,(\s*[}\]])/g, '$1');

                // 2. If JSON is truncated, try to close it properly
                const openBraces = (text.match(/{/g) || []).length;
                const closeBraces = (text.match(/}/g) || []).length;
                const openBrackets = (text.match(/\[/g) || []).length;
                const closeBrackets = (text.match(/]/g) || []).length;

                // Add missing closing brackets/braces
                for (let i = 0; i < openBrackets - closeBrackets; i++) {
                    text += ']';
                }
                for (let i = 0; i < openBraces - closeBraces; i++) {
                    text += '}';
                }

                try {
                    courseOutline = JSON.parse(text);
                    console.log('JSON repair successful!');
                } catch (repairError) {
                    console.error('JSON repair failed');
                    throw parseError; // Throw original error
                }
            }

            return courseOutline;
        } catch (error: any) {
            console.error('AI generation error:', error);
            throw new Error(`Failed to generate course outline: ${error.message}`);
        }
    },

    /**
     * Generate quiz questions for a specific topic
     */
    generateQuizQuestions: async (topic: string, difficulty: string, count: number = 5) => {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

        const prompt = `Tạo ${count} câu hỏi trắc nghiệm về "${topic}" với độ khó "${difficulty}".
    
Trả về JSON array (KHÔNG có markdown code block):
[
  {
    "question": "Câu hỏi?",
    "type": "single",
    "options": ["A", "B", "C", "D"],
    "correctAnswers": [0],
    "explanation": "Giải thích"
  }
]`;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            let text = response.text();
            text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

            // Remove control characters
            text = text.replace(/[\x00-\x1F\x7F]/g, (char) => {
                if (char === '\n') return '\\n';
                if (char === '\r') return '\\r';
                if (char === '\t') return '\\t';
                return '';
            });

            return JSON.parse(text);
        } catch (error: any) {
            console.error('Quiz generation error:', error);
            throw new Error(`Failed to generate quiz: ${error.message}`);
        }
    },
};

export default aiService;
