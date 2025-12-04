-- Fix Flags Storage Access
-- Run this in Supabase SQL Editor

-- 1. Ensure flags bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('flags', 'flags', true)
ON CONFLICT (id) 
DO UPDATE SET public = true;

-- 2. Create public read policy for flags bucket
-- First, drop existing policy if it exists
DROP POLICY IF EXISTS "Public Access" ON storage.objects;

-- Create new public read policy
CREATE POLICY "Public Access Flags"
ON storage.objects FOR SELECT
USING (bucket_id = 'flags');

-- 3. Verify bucket is public
SELECT id, name, public 
FROM storage.buckets 
WHERE id = 'flags';

