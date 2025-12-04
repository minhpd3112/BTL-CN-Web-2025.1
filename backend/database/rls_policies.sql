-- ========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

-- ========================================
-- USER_PROFILES TABLE
-- ========================================

-- Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to insert their own profile
CREATE POLICY "Allow users to insert their own profile"
  ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy: Allow authenticated users to view their own profile
CREATE POLICY "Allow users to view their own profile"
  ON user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Allow authenticated users to update their own profile
CREATE POLICY "Allow users to update their own profile"
  ON user_profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Allow service role (backend) to manage all profiles
CREATE POLICY "Allow service role to manage profiles"
  ON user_profiles
  USING (true)
  WITH CHECK (true);

-- ========================================
-- TAGS TABLE
-- ========================================

-- Enable RLS on tags
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to view tags
CREATE POLICY "Allow public read access to tags"
  ON tags
  FOR SELECT
  USING (true);

-- Policy: Allow authenticated users to create tags
CREATE POLICY "Allow authenticated users to create tags"
  ON tags
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Policy: Allow users to update tags (admin only - checked in backend)
CREATE POLICY "Allow authenticated users to update tags"
  ON tags
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Policy: Allow users to delete tags (admin only - checked in backend)
CREATE POLICY "Allow authenticated users to delete tags"
  ON tags
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- ========================================
-- COURSES TABLE
-- ========================================

-- Enable RLS on courses
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to view public approved courses
CREATE POLICY "Allow public read access to public approved courses"
  ON courses
  FOR SELECT
  USING (visibility = 'public' AND status = 'approved');

-- Policy: Allow course owner to view their own courses
CREATE POLICY "Allow course owner to view their own courses"
  ON courses
  FOR SELECT
  USING (owner_id = auth.uid());

-- Policy: Allow authenticated users to create courses
CREATE POLICY "Allow authenticated users to create courses"
  ON courses
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id AND auth.role() = 'authenticated');

-- Policy: Allow course owner to update their own courses
CREATE POLICY "Allow course owner to update their own courses"
  ON courses
  FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Policy: Allow course owner to delete their own courses
CREATE POLICY "Allow course owner to delete their own courses"
  ON courses
  FOR DELETE
  USING (owner_id = auth.uid());

-- ========================================
-- SECTIONS TABLE
-- ========================================

-- Enable RLS on sections
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to view sections of public approved courses
CREATE POLICY "Allow public read access to sections of public courses"
  ON sections
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = sections.course_id
      AND courses.visibility = 'public'
      AND courses.status = 'approved'
    )
  );

-- Policy: Allow course owner to view sections of their courses
CREATE POLICY "Allow course owner to view sections of their courses"
  ON sections
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = sections.course_id
      AND courses.owner_id = auth.uid()
    )
  );

-- Policy: Allow course owner to manage sections
CREATE POLICY "Allow course owner to manage sections"
  ON sections
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = sections.course_id
      AND courses.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = sections.course_id
      AND courses.owner_id = auth.uid()
    )
  );

-- ========================================
-- LESSONS TABLE
-- ========================================

-- Enable RLS on lessons
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to view lessons of public approved courses
CREATE POLICY "Allow public read access to lessons of public courses"
  ON lessons
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sections
      JOIN courses ON courses.id = sections.course_id
      WHERE sections.id = lessons.section_id
      AND courses.visibility = 'public'
      AND courses.status = 'approved'
    )
  );

-- Policy: Allow course owner to view lessons of their courses
CREATE POLICY "Allow course owner to view lessons of their courses"
  ON lessons
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sections
      JOIN courses ON courses.id = sections.course_id
      WHERE sections.id = lessons.section_id
      AND courses.owner_id = auth.uid()
    )
  );

-- Policy: Allow course owner to manage lessons
CREATE POLICY "Allow course owner to manage lessons"
  ON lessons
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM sections
      JOIN courses ON courses.id = sections.course_id
      WHERE sections.id = lessons.section_id
      AND courses.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sections
      JOIN courses ON courses.id = sections.course_id
      WHERE sections.id = lessons.section_id
      AND courses.owner_id = auth.uid()
    )
  );

-- ========================================
-- COURSE_TAGS TABLE
-- ========================================

-- Enable RLS on course_tags
ALTER TABLE course_tags ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to view tags of public approved courses
CREATE POLICY "Allow public read access to course tags"
  ON course_tags
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = course_tags.course_id
      AND courses.visibility = 'public'
      AND courses.status = 'approved'
    )
  );

-- Policy: Allow course owner to manage course tags
CREATE POLICY "Allow course owner to manage course tags"
  ON course_tags
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = course_tags.course_id
      AND courses.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = course_tags.course_id
      AND courses.owner_id = auth.uid()
    )
  );

-- ========================================
-- ENROLLMENTS TABLE
-- ========================================

-- Enable RLS on enrollments
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to view their own enrollments
CREATE POLICY "Allow users to view their own enrollments"
  ON enrollments
  FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Allow course owners to view enrollments in their courses
CREATE POLICY "Allow course owners to view enrollments in their courses"
  ON enrollments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = enrollments.course_id
      AND courses.owner_id = auth.uid()
    )
  );

-- Policy: Allow users to enroll in courses
CREATE POLICY "Allow users to enroll in courses"
  ON enrollments
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Policy: Allow users to update their own enrollments
CREATE POLICY "Allow users to update their own enrollments"
  ON enrollments
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());


