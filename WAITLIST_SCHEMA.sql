-- Waitlist Table
-- Run this in Supabase SQL Editor to create the table for waitlist submissions

CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  organization TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);

-- Row Level Security (RLS) Policies
-- Allow anyone to insert (submit waitlist forms)
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then create them
DROP POLICY IF EXISTS "Anyone can submit waitlist forms" ON waitlist;
CREATE POLICY "Anyone can submit waitlist forms"
  ON waitlist
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Only admins can view and delete waitlist entries
-- Use the existing check_user_is_admin() function
DROP POLICY IF EXISTS "Admins can view all waitlist entries" ON waitlist;
CREATE POLICY "Admins can view all waitlist entries"
  ON waitlist
  FOR SELECT
  TO authenticated
  USING (check_user_is_admin());

DROP POLICY IF EXISTS "Admins can delete waitlist entries" ON waitlist;
CREATE POLICY "Admins can delete waitlist entries"
  ON waitlist
  FOR DELETE
  TO authenticated
  USING (check_user_is_admin());
