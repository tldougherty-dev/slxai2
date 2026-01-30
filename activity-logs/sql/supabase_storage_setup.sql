-- Supabase Storage RLS Policies for avatars bucket
-- Run this in Supabase SQL Editor after creating the 'avatars' bucket

-- IMPORTANT: First create the bucket via UI:
-- Storage > New Bucket > Name: avatars > Public: OFF (or ON for public access)

-- If bucket is PUBLIC, you don't need any policies - skip this SQL entirely!

-- If bucket is PRIVATE, run these policies one at a time:

-- Policy 1: Allow authenticated users to upload profile pictures
CREATE POLICY "avatars_upload_policy"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'avatars');

-- Policy 2: Allow authenticated users to read profile pictures
CREATE POLICY "avatars_read_policy"
ON storage.objects
FOR SELECT
USING (bucket_id = 'avatars');

-- Policy 3: Allow authenticated users to update profile pictures
CREATE POLICY "avatars_update_policy"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'avatars')
WITH CHECK (bucket_id = 'avatars');

-- Policy 4: Allow authenticated users to delete profile pictures
CREATE POLICY "avatars_delete_policy"
ON storage.objects
FOR DELETE
USING (bucket_id = 'avatars');

