-- ========================================
-- SUPABASE STORAGE SETUP
-- ========================================

-- Create storage bucket for course images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-images',
  'course-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- STORAGE POLICIES
-- ========================================

-- Allow anyone to view course images (public bucket)
CREATE POLICY "Anyone can view course images"
ON storage.objects FOR SELECT
USING (bucket_id = 'course-images');

-- Allow authenticated users to upload course images
CREATE POLICY "Authenticated users can upload course images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'course-images' 
  AND auth.role() = 'authenticated'
);

-- Allow course owners to update their course images
CREATE POLICY "Users can update their own course images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'course-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow course owners to delete their course images
CREATE POLICY "Users can delete their own course images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'course-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
