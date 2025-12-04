-- Add social_media column to members table
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)

ALTER TABLE members 
ADD COLUMN IF NOT EXISTS social_media JSONB;

-- Add comment to document the column
COMMENT ON COLUMN members.social_media IS 'JSON object containing social media links: {facebook, x, linkedin, instagram, youtube, tiktok}';

