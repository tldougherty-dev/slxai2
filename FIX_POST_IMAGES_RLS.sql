-- Fix RLS Policies for post-images bucket
-- Run this in Supabase SQL Editor

-- First, drop any existing policies for post-images bucket
DROP POLICY IF EXISTS "Allow authenticated users to upload post images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to read post images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update post images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete post images" ON storage.objects;

-- Policy 1: Allow authenticated users to upload images
CREATE POLICY "Allow authenticated users to upload post images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'post-images');

-- Policy 2: Allow authenticated users to read all images (public bucket)
CREATE POLICY "Allow authenticated users to read post images"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'post-images');

-- Policy 3: Allow authenticated users to update images
CREATE POLICY "Allow authenticated users to update post images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'post-images')
WITH CHECK (bucket_id = 'post-images');

-- Policy 4: Allow authenticated users to delete images
CREATE POLICY "Allow authenticated users to delete post images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'post-images');

