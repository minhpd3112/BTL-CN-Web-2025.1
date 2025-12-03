-- ========================================
-- FIX AUTO-CREATE USER PROFILE TRIGGER
-- ========================================

-- Drop the problematic trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS create_user_profile();

-- The backend will handle creating user profiles during signup
-- This avoids RLS policy issues during user creation
