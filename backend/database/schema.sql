CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(100),
  avatar_url TEXT,
  phone VARCHAR(20),
  address TEXT,
  bio TEXT CHECK (char_length(bio) <= 500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_profiles_name ON user_profiles(full_name);

-- ========================================
-- TAGS TABLE
-- ========================================
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(7), -- HEX color
  icon VARCHAR(50), -- Icon name
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- COURSES TABLE (ENHANCED)
-- ========================================
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Info
  title VARCHAR(100) NOT NULL,
  description TEXT CHECK (char_length(description) <= 500),
  short_description VARCHAR(500),
  overview TEXT CHECK (char_length(overview) <= 2000),
  image_url TEXT,
  
  -- Course Details
  requirements TEXT,
  level VARCHAR(20) CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  language VARCHAR(10) DEFAULT 'vi',
  duration_hours INTEGER,
  certificate_enabled BOOLEAN DEFAULT FALSE,
  
  -- Status & Visibility
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
  visibility VARCHAR(20) NOT NULL DEFAULT 'private' CHECK (visibility IN ('public', 'private')),
  
  -- Approval Info
  rejection_reason TEXT CHECK (char_length(rejection_reason) <= 1000),
  rejected_by UUID REFERENCES auth.users(id),
  rejected_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- COURSE_TAGS (Many-to-Many)
-- ========================================
CREATE TABLE course_tags (
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (course_id, tag_id)
);

-- ========================================
-- SECTIONS TABLE
-- ========================================
CREATE TABLE sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- LESSONS TABLE
-- ========================================
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('video', 'article', 'quiz', 'pdf')),
  content_url TEXT CHECK (char_length(content_url) <= 200),
  content_text TEXT CHECK (char_length(content_text) <= 10000),
  duration INTEGER, -- seconds
  order_index INTEGER NOT NULL DEFAULT 0,
  is_free BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- QUIZ QUESTIONS TABLE
-- ========================================
CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  question TEXT NOT NULL CHECK (char_length(question) <= 500),
  type VARCHAR(20) NOT NULL CHECK (type IN ('single_choice', 'multiple_choice')),
  order_index INTEGER NOT NULL DEFAULT 0,
  explanation TEXT CHECK (char_length(explanation) <= 1000),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- QUIZ ANSWERS TABLE
-- ========================================
CREATE TABLE quiz_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  answer_text TEXT NOT NULL CHECK (char_length(answer_text) <= 200),
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  order_index INTEGER NOT NULL DEFAULT 0
);

-- ========================================
-- ENROLLMENTS TABLE (ENHANCED)
-- ========================================
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'left')),
  request_message TEXT CHECK (char_length(request_message) <= 500),
  rejection_reason TEXT CHECK (char_length(rejection_reason) <= 500),
  approved_by UUID REFERENCES auth.users(id),
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- ========================================
-- COURSE INVITATIONS TABLE
-- ========================================
CREATE TABLE course_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_email VARCHAR(255) NOT NULL,
  invitee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  message TEXT CHECK (char_length(message) <= 500),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE
);

-- ========================================
-- LESSON_PROGRESS TABLE
-- ========================================
CREATE TABLE lesson_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- ========================================
-- QUIZ ATTEMPTS TABLE
-- ========================================
CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  score INTEGER,
  total_questions INTEGER,
  correct_answers INTEGER,
  time_spent INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- REVIEWS TABLE
-- ========================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT CHECK (char_length(comment) <= 1000),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- ========================================
-- NOTIFICATIONS TABLE
-- ========================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN (
    'course_approved',
    'course_rejected',
    'enrollment_request',
    'enrollment_approved',
    'enrollment_rejected',
    'student_joined',
    'course_completed'
  )),
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  related_course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  related_enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- INDEXES
-- ========================================
-- Profiles
CREATE INDEX idx_profiles_name ON user_profiles(full_name);

-- Courses
CREATE INDEX idx_courses_owner ON courses(owner_id);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_visibility ON courses(visibility);
CREATE INDEX idx_courses_level ON courses(level);
CREATE INDEX idx_courses_language ON courses(language);

-- Sections & Lessons
CREATE INDEX idx_sections_course ON sections(course_id);
CREATE INDEX idx_lessons_section ON lessons(section_id);
CREATE INDEX idx_lessons_type ON lessons(content_type);

-- Quiz
CREATE INDEX idx_quiz_questions_lesson ON quiz_questions(lesson_id);
CREATE INDEX idx_quiz_answers_question ON quiz_answers(question_id);
CREATE INDEX idx_quiz_attempts_user ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_lesson ON quiz_attempts(lesson_id);

-- Enrollments
CREATE INDEX idx_enrollments_user ON enrollments(user_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
CREATE INDEX idx_enrollments_status ON enrollments(status);

-- Invitations
CREATE INDEX idx_invitations_course ON course_invitations(course_id);
CREATE INDEX idx_invitations_email ON course_invitations(invitee_email);
CREATE INDEX idx_invitations_invitee ON course_invitations(invitee_id);
CREATE INDEX idx_invitations_status ON course_invitations(status);

-- Progress
CREATE INDEX idx_lesson_progress_user ON lesson_progress(user_id);
CREATE INDEX idx_lesson_progress_lesson ON lesson_progress(lesson_id);

-- Reviews
CREATE INDEX idx_reviews_course ON reviews(course_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- Notifications
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_tags ENABLE ROW LEVEL SECURITY;

-- ========================================
-- RLS POLICIES - USER PROFILES
-- ========================================
CREATE POLICY "Anyone can view profiles" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ========================================
-- RLS POLICIES - TAGS
-- ========================================
CREATE POLICY "Anyone can view tags" ON tags FOR SELECT USING (true);
CREATE POLICY "Only admins can insert tags" ON tags FOR INSERT WITH CHECK (
  (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY "Only admins can update tags" ON tags FOR UPDATE USING (
  (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY "Only admins can delete tags" ON tags FOR DELETE USING (
  (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
);

-- ========================================
-- RLS POLICIES - COURSES
-- ========================================
CREATE POLICY "Anyone can view approved public courses" ON courses FOR SELECT USING (
  visibility = 'public' AND status = 'approved'
);
CREATE POLICY "Users can view their own courses" ON courses FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Admins can view all courses" ON courses FOR SELECT USING (
  (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY "Enrolled users can view private courses" ON courses FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM enrollments
    WHERE enrollments.course_id = courses.id
    AND enrollments.user_id = auth.uid()
    AND enrollments.status = 'approved'
  )
);
CREATE POLICY "Users can create courses" ON courses FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update their own courses" ON courses FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Admins can update all courses" ON courses FOR UPDATE USING (
  (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY "Users can delete their own courses" ON courses FOR DELETE USING (auth.uid() = owner_id);
CREATE POLICY "Admins can delete all courses" ON courses FOR DELETE USING (
  (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
);

-- ========================================
-- RLS POLICIES - COURSE TAGS
-- ========================================
CREATE POLICY "Anyone can view course tags" ON course_tags FOR SELECT USING (true);
CREATE POLICY "Course owners can manage tags" ON course_tags FOR ALL USING (
  EXISTS (SELECT 1 FROM courses WHERE courses.id = course_tags.course_id AND courses.owner_id = auth.uid())
);

-- ========================================
-- RLS POLICIES - SECTIONS & LESSONS
-- ========================================
CREATE POLICY "Users can view sections of accessible courses" ON sections FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = sections.course_id
    AND (
      courses.owner_id = auth.uid()
      OR (courses.visibility = 'public' AND courses.status = 'approved')
      OR (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
      OR EXISTS (
        SELECT 1 FROM enrollments
        WHERE enrollments.course_id = courses.id
        AND enrollments.user_id = auth.uid()
        AND enrollments.status = 'approved'
      )
    )
  )
);
CREATE POLICY "Course owners can manage sections" ON sections FOR ALL USING (
  EXISTS (SELECT 1 FROM courses WHERE courses.id = sections.course_id AND courses.owner_id = auth.uid())
);

CREATE POLICY "Users can view lessons of accessible sections" ON lessons FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM sections
    JOIN courses ON courses.id = sections.course_id
    WHERE sections.id = lessons.section_id
    AND (
      courses.owner_id = auth.uid()
      OR (courses.visibility = 'public' AND courses.status = 'approved' AND lessons.is_free = true)
      OR (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
      OR EXISTS (
        SELECT 1 FROM enrollments
        WHERE enrollments.course_id = courses.id
        AND enrollments.user_id = auth.uid()
        AND enrollments.status = 'approved'
      )
    )
  )
);
CREATE POLICY "Course owners can manage lessons" ON lessons FOR ALL USING (
  EXISTS (
    SELECT 1 FROM sections
    JOIN courses ON courses.id = sections.course_id
    WHERE sections.id = lessons.section_id AND courses.owner_id = auth.uid()
  )
);

-- ========================================
-- RLS POLICIES - QUIZ
-- ========================================
CREATE POLICY "Users can view quiz questions" ON quiz_questions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM lessons
    JOIN sections ON sections.id = lessons.section_id
    JOIN courses ON courses.id = sections.course_id
    WHERE lessons.id = quiz_questions.lesson_id
    AND (
      courses.owner_id = auth.uid()
      OR (courses.visibility = 'public' AND courses.status = 'approved')
      OR (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
      OR EXISTS (
        SELECT 1 FROM enrollments
        WHERE enrollments.user_id = auth.uid()
        AND enrollments.course_id = courses.id
        AND enrollments.status = 'approved'
      )
    )
  )
);

CREATE POLICY "Enrolled users can view answers" ON quiz_answers FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM quiz_questions
    JOIN lessons ON lessons.id = quiz_questions.lesson_id
    JOIN sections ON sections.id = lessons.section_id
    JOIN courses ON courses.id = sections.course_id
    WHERE quiz_questions.id = quiz_answers.question_id
    AND (
      courses.owner_id = auth.uid()
      OR (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
      OR EXISTS (
        SELECT 1 FROM enrollments
        WHERE enrollments.user_id = auth.uid()
        AND enrollments.course_id = courses.id
        AND enrollments.status = 'approved'
      )
    )
  )
);

CREATE POLICY "Course owners can manage quiz" ON quiz_questions FOR ALL USING (
  EXISTS (
    SELECT 1 FROM lessons
    JOIN sections ON sections.id = lessons.section_id
    JOIN courses ON courses.id = sections.course_id
    WHERE lessons.id = quiz_questions.lesson_id AND courses.owner_id = auth.uid()
  )
);

CREATE POLICY "Course owners can manage answers" ON quiz_answers FOR ALL USING (
  EXISTS (
    SELECT 1 FROM quiz_questions
    JOIN lessons ON lessons.id = quiz_questions.lesson_id
    JOIN sections ON sections.id = lessons.section_id
    JOIN courses ON courses.id = sections.course_id
    WHERE quiz_questions.id = quiz_answers.question_id AND courses.owner_id = auth.uid()
  )
);

-- ========================================
-- RLS POLICIES - QUIZ ATTEMPTS
-- ========================================
CREATE POLICY "Users can view their attempts" ON quiz_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create attempts" ON quiz_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ========================================
-- RLS POLICIES - ENROLLMENTS
-- ========================================
CREATE POLICY "Users can view their enrollments" ON enrollments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Course owners can view enrollments" ON enrollments FOR SELECT USING (
  EXISTS (SELECT 1 FROM courses WHERE courses.id = enrollments.course_id AND courses.owner_id = auth.uid())
);
CREATE POLICY "Users can create enrollments" ON enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Course owners can update enrollments" ON enrollments FOR UPDATE USING (
  EXISTS (SELECT 1 FROM courses WHERE courses.id = enrollments.course_id AND courses.owner_id = auth.uid())
);
CREATE POLICY "Users can delete their enrollments" ON enrollments FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- RLS POLICIES - INVITATIONS
-- ========================================
CREATE POLICY "Course owners can create invitations" ON course_invitations FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM courses WHERE courses.id = course_invitations.course_id AND courses.owner_id = auth.uid())
);
CREATE POLICY "Users can view invitations sent to them" ON course_invitations FOR SELECT USING (
  auth.uid() = invitee_id OR (SELECT email FROM auth.users WHERE id = auth.uid()) = invitee_email
);
CREATE POLICY "Course owners can view their invitations" ON course_invitations FOR SELECT USING (auth.uid() = inviter_id);
CREATE POLICY "Invitees can update invitation status" ON course_invitations FOR UPDATE USING (auth.uid() = invitee_id);

-- ========================================
-- RLS POLICIES - PROGRESS
-- ========================================
CREATE POLICY "Users can view their own progress" ON lesson_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own progress" ON lesson_progress FOR ALL USING (auth.uid() = user_id);

-- ========================================
-- RLS POLICIES - REVIEWS
-- ========================================
CREATE POLICY "Anyone can view reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Enrolled users can create reviews" ON reviews FOR INSERT WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM enrollments
    WHERE enrollments.user_id = auth.uid()
    AND enrollments.course_id = reviews.course_id
    AND enrollments.status = 'approved'
  )
);
CREATE POLICY "Users can update their reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their reviews" ON reviews FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- RLS POLICIES - NOTIFICATIONS
-- ========================================
CREATE POLICY "Users can view their notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- ========================================
-- TRIGGERS
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sections_updated_at BEFORE UPDATE ON sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tags_updated_at BEFORE UPDATE ON tags
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enrollments_updated_at BEFORE UPDATE ON enrollments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lesson_progress_updated_at BEFORE UPDATE ON lesson_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- AUTO-CREATE USER PROFILE
-- ========================================
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_profile();

-- ========================================
-- NOTIFICATION TRIGGERS
-- ========================================
CREATE OR REPLACE FUNCTION notify_course_approved()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    INSERT INTO notifications (user_id, type, title, message, link, related_course_id)
    VALUES (
      NEW.owner_id,
      'course_approved',
      'Khóa học đã được duyệt',
      'Khóa học "' || NEW.title || '" của bạn đã được duyệt và hiển thị công khai.',
      '/courses/' || NEW.id,
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER course_approved_notification
  AFTER UPDATE ON courses
  FOR EACH ROW
  WHEN (NEW.status = 'approved' AND OLD.status != 'approved')
  EXECUTE FUNCTION notify_course_approved();

CREATE OR REPLACE FUNCTION notify_course_rejected()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'rejected' AND OLD.status != 'rejected' THEN
    INSERT INTO notifications (user_id, type, title, message, link, related_course_id, metadata)
    VALUES (
      NEW.owner_id,
      'course_rejected',
      'Khóa học bị từ chối',
      'Khóa học "' || NEW.title || '" của bạn đã bị từ chối.',
      '/my-courses',
      NEW.id,
      jsonb_build_object('reason', NEW.rejection_reason)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER course_rejected_notification
  AFTER UPDATE ON courses
  FOR EACH ROW
  WHEN (NEW.status = 'rejected' AND OLD.status != 'rejected')
  EXECUTE FUNCTION notify_course_rejected();

CREATE OR REPLACE FUNCTION notify_enrollment_request()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, message, link, related_course_id, related_enrollment_id)
  SELECT
    c.owner_id,
    'enrollment_request',
    'Yêu cầu đăng ký khóa học mới',
    (SELECT full_name FROM user_profiles WHERE id = NEW.user_id) || ' muốn đăng ký khóa học "' || c.title || '"',
    '/courses/' || NEW.course_id || '/students',
    NEW.course_id,
    NEW.id
  FROM courses c
  WHERE c.id = NEW.course_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enrollment_request_notification
  AFTER INSERT ON enrollments
  FOR EACH ROW
  WHEN (NEW.status = 'pending')
  EXECUTE FUNCTION notify_enrollment_request();

-- ========================================
-- VIEWS FOR STATISTICS
-- ========================================
CREATE OR REPLACE VIEW course_statistics AS
SELECT
  c.id,
  c.title,
  c.owner_id,
  COUNT(DISTINCT e.user_id) FILTER (WHERE e.status = 'approved') as total_students,
  AVG(r.rating) as average_rating,
  COUNT(DISTINCT r.id) as total_reviews,
  COUNT(DISTINCT s.id) as total_sections,
  COUNT(DISTINCT l.id) as total_lessons
FROM courses c
LEFT JOIN enrollments e ON e.course_id = c.id
LEFT JOIN reviews r ON r.course_id = c.id
LEFT JOIN sections s ON s.course_id = c.id
LEFT JOIN lessons l ON l.section_id = s.id
GROUP BY c.id;

CREATE OR REPLACE VIEW user_statistics AS
SELECT
  u.id,
  up.full_name,
  COUNT(DISTINCT c.id) as courses_created,
  COUNT(DISTINCT e.course_id) as courses_enrolled,
  SUM(CASE WHEN c.status = 'approved' THEN 1 ELSE 0 END) as approved_courses,
  (SELECT COUNT(DISTINCT e2.user_id) 
   FROM enrollments e2 
   JOIN courses c2 ON c2.id = e2.course_id 
   WHERE c2.owner_id = u.id AND e2.status = 'approved') as total_students
FROM auth.users u
LEFT JOIN user_profiles up ON up.id = u.id
LEFT JOIN courses c ON c.owner_id = u.id
LEFT JOIN enrollments e ON e.user_id = u.id
GROUP BY u.id, up.full_name;