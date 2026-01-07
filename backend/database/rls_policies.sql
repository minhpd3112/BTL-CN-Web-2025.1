-- ========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Comprehensive security setup for multi-tenant e-learning platform
-- Supports: User-owned data, public courses, admin bypass via service role
-- ========================================

-- ========================================
-- USER_PROFILES TABLE
-- ========================================
-- Rules: Users can view/edit only their own profile
--        Service role (backend/admin via supabaseAdmin) bypasses RLS
-- ========================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- SELECT: Users view their own profile
CREATE POLICY "user_profiles_select_own"
  ON user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- INSERT: Users create their own profile during signup
CREATE POLICY "user_profiles_insert_own"
  ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- UPDATE: Users update their own profile
CREATE POLICY "user_profiles_update_own"
  ON user_profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ========================================
-- TAGS TABLE
-- ========================================
-- Rules: Anyone can view tags
--        Authenticated users create tags (admin checks in backend)
--        Service role manages all (for admin operations)
-- ========================================

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- SELECT: Public read - anyone can view all tags
CREATE POLICY "tags_select_public"
  ON tags
  FOR SELECT
  USING (true);

-- INSERT: Authenticated users can create tags (admin check in backend)
CREATE POLICY "tags_insert_authenticated"
  ON tags
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- UPDATE: Authenticated users can update (admin check in backend)
CREATE POLICY "tags_update_authenticated"
  ON tags
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- DELETE: Authenticated users can delete (admin check in backend)
CREATE POLICY "tags_delete_authenticated"
  ON tags
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- ========================================
-- COURSES TABLE
-- ========================================
-- Rules: Public courses (approved) visible to anyone
--        Owners see/edit their own courses (pending, draft, rejected, approved)
--        Service role manages all (admin bypass for course review/management)
-- ========================================

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- SELECT: Public - approved public courses
CREATE POLICY "courses_select_public_approved"
  ON courses
  FOR SELECT
  USING (visibility = 'public' AND status = 'approved');

-- SELECT: Owners see their own courses (all statuses)
CREATE POLICY "courses_select_own"
  ON courses
  FOR SELECT
  USING (owner_id = auth.uid());

-- INSERT: Authenticated users can create courses
CREATE POLICY "courses_insert_authenticated"
  ON courses
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id AND auth.role() = 'authenticated');

-- UPDATE: Owners update their own courses
CREATE POLICY "courses_update_own"
  ON courses
  FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- DELETE: Owners delete their own courses
CREATE POLICY "courses_delete_own"
  ON courses
  FOR DELETE
  USING (owner_id = auth.uid());

-- ========================================
-- SECTIONS TABLE
-- ========================================
-- Rules: Anyone sees sections of public approved courses
--        Owners see/manage sections of their courses
-- ========================================

ALTER TABLE sections ENABLE ROW LEVEL SECURITY;

-- SELECT: Public sections (course is public + approved)
CREATE POLICY "sections_select_public"
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

-- SELECT: Owners see sections of their courses
CREATE POLICY "sections_select_own_course"
  ON sections
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = sections.course_id
      AND courses.owner_id = auth.uid()
    )
  );

-- INSERT/UPDATE/DELETE: Owners manage sections of their courses
CREATE POLICY "sections_manage_own_course"
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
-- Rules: Anyone sees lessons of public approved courses
--        Enrolled users (future) see course lessons
--        Owners see/manage all lessons of their courses
-- ========================================

ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- SELECT: Public lessons (course is public + approved)
CREATE POLICY "lessons_select_public"
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

-- SELECT: Owners see lessons of their courses
CREATE POLICY "lessons_select_own_course"
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

-- INSERT/UPDATE/DELETE: Owners manage lessons of their courses
CREATE POLICY "lessons_manage_own_course"
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
-- Rules: Anyone sees tags of public approved courses
--        Owners manage tags of their courses
-- ========================================

ALTER TABLE course_tags ENABLE ROW LEVEL SECURITY;

-- SELECT: Public course tags
CREATE POLICY "course_tags_select_public"
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

-- SELECT: Owners see tags of their courses
CREATE POLICY "course_tags_select_own_course"
  ON course_tags
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = course_tags.course_id
      AND courses.owner_id = auth.uid()
    )
  );

-- INSERT/UPDATE/DELETE: Owners manage tags of their courses
CREATE POLICY "course_tags_manage_own_course"
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
-- Rules: Users see their own enrollments
--        Course owners see enrollments in their courses
--        Users can only enroll/manage their own enrollments
-- ========================================

ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- SELECT: Users view their own enrollments
CREATE POLICY "enrollments_select_own"
  ON enrollments
  FOR SELECT
  USING (user_id = auth.uid());

-- SELECT: Owners see enrollments in their courses
CREATE POLICY "enrollments_select_own_course"
  ON enrollments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = enrollments.course_id
      AND courses.owner_id = auth.uid()
    )
  );

-- INSERT: Users can enroll in courses
CREATE POLICY "enrollments_insert_own"
  ON enrollments
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- UPDATE: Users update their own enrollments (course owners update via admin backend)
CREATE POLICY "enrollments_update_own"
  ON enrollments
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- DELETE: Users can leave courses
CREATE POLICY "enrollments_delete_own"
  ON enrollments
  FOR DELETE
  USING (user_id = auth.uid());

-- ========================================
-- LESSON_PROGRESS TABLE
-- ========================================
-- Rules: Users see only their own progress
--        Users update their own progress
-- ========================================

ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

-- SELECT: Users view their own progress
CREATE POLICY "lesson_progress_select_own"
  ON lesson_progress
  FOR SELECT
  USING (user_id = auth.uid());

-- INSERT: Users log their own progress
CREATE POLICY "lesson_progress_insert_own"
  ON lesson_progress
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- UPDATE: Users update their own progress
CREATE POLICY "lesson_progress_update_own"
  ON lesson_progress
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ========================================
-- NOTIFICATIONS TABLE
-- ========================================
-- Rules: Users see only their own notifications
--        Backend creates notifications (via supabaseAdmin)
-- ========================================

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- SELECT: Users view their own notifications
CREATE POLICY "notifications_select_own"
  ON notifications
  FOR SELECT
  USING (user_id = auth.uid());

-- UPDATE: Users update their own notifications (mark as read)
CREATE POLICY "notifications_update_own"
  ON notifications
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- DELETE: Users delete their own notifications
CREATE POLICY "notifications_delete_own"
  ON notifications
  FOR DELETE
  USING (user_id = auth.uid());

-- ========================================
-- QUIZ_SUBMISSIONS TABLE (if exists)
-- ========================================
-- Rules: Users see/submit only their own quiz submissions
-- ========================================

-- Uncomment if quiz_submissions table exists:
-- ALTER TABLE quiz_submissions ENABLE ROW LEVEL SECURITY;
--
-- CREATE POLICY "quiz_submissions_select_own"
--   ON quiz_submissions
--   FOR SELECT
--   USING (user_id = auth.uid());
--
-- CREATE POLICY "quiz_submissions_insert_own"
--   ON quiz_submissions
--   FOR INSERT
--   WITH CHECK (user_id = auth.uid());

-- ========================================
-- SERVICE ROLE BYPASS NOTES
-- ========================================
-- The backend uses `supabaseAdmin` (service role key) for:
--  - Admin operations that need to bypass RLS
--  - Creating notifications on behalf of users
--  - Managing enrollments (approve/reject)
--  - Reviewing courses (approve/reject)
--  - User profile management during signup
-- 
-- Regular authenticated users use `supabase` client with RLS enforced.
-- ========================================