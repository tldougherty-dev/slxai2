-- Add post_source column to track where post was created from
-- 'profile' = created from My Profile page
-- 'organization' = created from My Organization page

ALTER TABLE feed_posts 
ADD COLUMN IF NOT EXISTS post_source TEXT DEFAULT 'profile' CHECK (post_source IN ('profile', 'organization'));

CREATE INDEX IF NOT EXISTS idx_feed_posts_post_source ON feed_posts(post_source);

