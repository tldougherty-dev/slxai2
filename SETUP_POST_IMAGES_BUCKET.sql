-- Setup RLS policies for post-images bucket
-- This allows authenticated users to upload and read images from the post-images bucket

-- First, ensure the bucket exists and is public
-- Note: You need to create the bucket manually in Supabase Dashboard:
-- Storage > New Bucket > Name: post-images > Public: ON

-- Policy 1: Allow authenticated users to upload images
CREATE POLICY IF NOT EXISTS "Allow authenticated users to upload post images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'post-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 2: Allow authenticated users to read all images (public bucket)
CREATE POLICY IF NOT EXISTS "Allow authenticated users to read post images"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'post-images');

-- Policy 3: Allow authenticated users to update their own images
CREATE POLICY IF NOT EXISTS "Allow authenticated users to update their own post images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'post-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'post-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 4: Allow authenticated users to delete their own images
CREATE POLICY IF NOT EXISTS "Allow authenticated users to delete their own post images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'post-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Alternative simpler policy if the above doesn't work:
-- Allow all authenticated users full access to post-images bucket
-- (Use this if you want all authenticated users to be able to upload/read any image)

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to upload post images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to read post images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update their own post images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete their own post images" ON storage.objects;

-- Create simpler policies for public post-images bucket
CREATE POLICY "Allow authenticated users to upload post images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'post-images');

CREATE POLICY "Allow authenticated users to read post images"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'post-images');

CREATE POLICY "Allow authenticated users to update post images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'post-images')
WITH CHECK (bucket_id = 'post-images');

CREATE POLICY "Allow authenticated users to delete post images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'post-images');

