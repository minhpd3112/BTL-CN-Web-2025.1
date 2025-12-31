-- DEBUG SCRIPT: Check why profile is not found
-- Run this in Supabase SQL Editor

-- Step 1: Check if user exists in auth.users
SELECT 
    id, 
    email, 
    raw_user_meta_data->>'full_name' as metadata_name,
    raw_user_meta_data->>'avatar_url' as metadata_avatar,
    created_at
FROM auth.users 
WHERE id = '82e04040-b3cd-4785-9e57-20627aac1f1c';

-- Step 2: Check if profile exists in user_profiles
SELECT * 
FROM public.user_profiles 
WHERE id = '82e04040-b3cd-4785-9e57-20627aac1f1c';

-- Step 3: If no profile found, create it manually
INSERT INTO public.user_profiles (id, full_name, created_at, updated_at)
VALUES (
  '82e04040-b3cd-4785-9e57-20627aac1f1c',
  'Minh quân Nguyễn',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE 
SET full_name = 'Minh quân Nguyễn', updated_at = NOW();

-- Step 4: Verify profile was created
SELECT * 
FROM public.user_profiles 
WHERE id = '82e04040-b3cd-4785-9e57-20627aac1f1c';

-- Step 5: Check RLS policies on user_profiles table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- Step 6: Add SELECT policy if missing (allow authenticated users to read all profiles)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_profiles' 
        AND policyname = 'Allow authenticated users to read all profiles'
    ) THEN
        CREATE POLICY "Allow authenticated users to read all profiles"
        ON user_profiles
        FOR SELECT
        TO authenticated
        USING (true);
    END IF;
END $$;

-- Step 7: Verify the policy was created
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'user_profiles' AND cmd = 'SELECT';
