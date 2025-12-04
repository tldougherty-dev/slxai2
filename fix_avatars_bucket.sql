-- Fix Avatars Bucket RLS Policies
-- Copy and paste each CREATE POLICY statement ONE AT A TIME into Supabase SQL Editor
-- Or run all at once if you prefer

-- Step 1: Upload Policy
CREATE POLICY "avatars_upload_policy"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'avatars');

-- Step 2: Read Policy  
CREATE POLICY "avatars_read_policy"
ON storage.objects
FOR SELECT
USING (bucket_id = 'avatars');

-- Step 3: Update Policy
CREATE POLICY "avatars_update_policy"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'avatars')
WITH CHECK (bucket_id = 'avatars');

-- Step 4: Delete Policy
CREATE POLICY "avatars_delete_policy"
ON storage.objects
FOR DELETE
USING (bucket_id = 'avatars');

