-- Add quiz_settings column to lessons table
-- This will store quiz configuration like time limit, passing score, quiz type, etc.

ALTER TABLE lessons ADD COLUMN IF NOT EXISTS quiz_settings JSONB;

-- Add comment to describe the structure
COMMENT ON COLUMN lessons.quiz_settings IS 'Quiz settings stored as JSON: { quizType: "exam" | "practice", timeLimit?: number, passingScore?: number }';

-- Index for querying lessons by quiz type
CREATE INDEX IF NOT EXISTS idx_lessons_quiz_settings ON lessons USING GIN (quiz_settings);
