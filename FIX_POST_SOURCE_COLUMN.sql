-- Fix post_source column issue
-- This script ensures the column exists and handles schema cache refresh

-- First, check if column exists and drop it if needed (to recreate properly)
DO $$ 
BEGIN
    -- Check if column exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'feed_posts' 
        AND column_name = 'post_source'
    ) THEN
        -- Column exists, but might have wrong type or constraints
        -- Drop and recreate to ensure it's correct
        ALTER TABLE feed_posts DROP COLUMN post_source;
    END IF;
END $$;

-- Add the column with proper constraints
ALTER TABLE feed_posts 
ADD COLUMN post_source TEXT NOT NULL DEFAULT 'profile' 
CHECK (post_source IN ('profile', 'organization'));

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_feed_posts_post_source ON feed_posts(post_source);

-- Refresh the schema cache (this is important for Supabase)
NOTIFY pgrst, 'reload schema';

