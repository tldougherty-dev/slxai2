-- Feed System Database Schema
-- Run this in Supabase SQL Editor to create posts, comments, and reactions tables

-- ============================================
-- 1. POSTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS feed_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  author_id UUID NOT NULL, -- References auth.users.id
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  content TEXT NOT NULL,
  post_type TEXT NOT NULL CHECK (post_type IN ('video', 'document', 'link', 'text')),
  media_url TEXT, -- Video URL, PDF URL, or Website URL
  media_title TEXT, -- Title for the linked content
  media_description TEXT, -- Description for the linked content
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feed_posts_organization_id ON feed_posts(organization_id);
CREATE INDEX IF NOT EXISTS idx_feed_posts_author_id ON feed_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_feed_posts_created_at ON feed_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feed_posts_post_type ON feed_posts(post_type);

-- ============================================
-- 2. POST REACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS feed_post_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES feed_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- References auth.users.id
  user_email TEXT NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'love', 'celebrate', 'insightful', 'curious')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id, reaction_type) -- One reaction type per user per post
);

CREATE INDEX IF NOT EXISTS idx_feed_post_reactions_post_id ON feed_post_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_feed_post_reactions_user_id ON feed_post_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_feed_post_reactions_type ON feed_post_reactions(reaction_type);

-- ============================================
-- 3. POST COMMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS feed_post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES feed_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL, -- References auth.users.id
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feed_post_comments_post_id ON feed_post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_feed_post_comments_author_id ON feed_post_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_feed_post_comments_created_at ON feed_post_comments(created_at ASC);

-- ============================================
-- 4. ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE feed_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_post_comments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. RLS POLICIES FOR POSTS
-- ============================================
-- Anyone authenticated can read posts
CREATE POLICY "Allow authenticated users to read posts"
ON feed_posts FOR SELECT
TO authenticated
USING (true);

-- Members can create posts for their organization
CREATE POLICY "Allow members to create posts for their organization"
ON feed_posts FOR INSERT
TO authenticated
WITH CHECK (
  organization_id IN (
    SELECT id FROM members 
    WHERE id::text = (SELECT raw_user_meta_data->>'organization_id' FROM auth.users WHERE id = auth.uid())
  )
);

-- Authors can update their own posts
CREATE POLICY "Allow authors to update their own posts"
ON feed_posts FOR UPDATE
TO authenticated
USING (author_id = auth.uid())
WITH CHECK (author_id = auth.uid());

-- Authors and admins can delete posts
CREATE POLICY "Allow authors and admins to delete posts"
ON feed_posts FOR DELETE
TO authenticated
USING (
  author_id = auth.uid() OR
  (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) IN ('admin', 'super_admin')
);

-- ============================================
-- 6. RLS POLICIES FOR REACTIONS
-- ============================================
-- Anyone authenticated can read reactions
CREATE POLICY "Allow authenticated users to read reactions"
ON feed_post_reactions FOR SELECT
TO authenticated
USING (true);

-- Anyone authenticated can add reactions
CREATE POLICY "Allow authenticated users to add reactions"
ON feed_post_reactions FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Users can update their own reactions
CREATE POLICY "Allow users to update their own reactions"
ON feed_post_reactions FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Users can delete their own reactions
CREATE POLICY "Allow users to delete their own reactions"
ON feed_post_reactions FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ============================================
-- 7. RLS POLICIES FOR COMMENTS
-- ============================================
-- Anyone authenticated can read comments
CREATE POLICY "Allow authenticated users to read comments"
ON feed_post_comments FOR SELECT
TO authenticated
USING (true);

-- Anyone authenticated can add comments
CREATE POLICY "Allow authenticated users to add comments"
ON feed_post_comments FOR INSERT
TO authenticated
WITH CHECK (author_id = auth.uid());

-- Authors can update their own comments
CREATE POLICY "Allow authors to update their own comments"
ON feed_post_comments FOR UPDATE
TO authenticated
USING (author_id = auth.uid())
WITH CHECK (author_id = auth.uid());

-- Authors and admins can delete comments
CREATE POLICY "Allow authors and admins to delete comments"
ON feed_post_comments FOR DELETE
TO authenticated
USING (
  author_id = auth.uid() OR
  (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) IN ('admin', 'super_admin')
);

-- ============================================
-- 8. TRIGGER TO UPDATE updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_feed_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_feed_posts_updated_at
BEFORE UPDATE ON feed_posts
FOR EACH ROW
EXECUTE FUNCTION update_feed_posts_updated_at();

CREATE TRIGGER update_feed_post_comments_updated_at
BEFORE UPDATE ON feed_post_comments
FOR EACH ROW
EXECUTE FUNCTION update_feed_posts_updated_at();

