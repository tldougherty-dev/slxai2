-- Interest Submissions Table
-- Run this in Supabase SQL Editor to create the table for interest form submissions

CREATE TABLE IF NOT EXISTS interest_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  organization TEXT NOT NULL,
  reason TEXT NOT NULL,
  approved BOOLEAN DEFAULT FALSE,
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interest_submissions_created_at ON interest_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_interest_submissions_organization ON interest_submissions(organization);
CREATE INDEX IF NOT EXISTS idx_interest_submissions_email ON interest_submissions(email);

-- Row Level Security (RLS) Policies
-- Allow anyone to insert (submit interest forms)
ALTER TABLE interest_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit interest forms"
  ON interest_submissions
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Only admins can view and delete submissions
-- First, ensure check_user_is_admin() function exists (create if it doesn't)
CREATE OR REPLACE FUNCTION check_user_is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Access auth.users with SECURITY DEFINER privileges
  SELECT raw_user_meta_data->>'role' INTO user_role
  FROM auth.users
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_role, '') IN ('admin', 'super_admin');
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION check_user_is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION check_user_is_admin() TO anon;

-- Now create policies using the helper function
DROP POLICY IF EXISTS "Admins can view all submissions" ON interest_submissions;
CREATE POLICY "Admins can view all submissions"
  ON interest_submissions
  FOR SELECT
  TO authenticated
  USING (check_user_is_admin());

DROP POLICY IF EXISTS "Admins can delete submissions" ON interest_submissions;
CREATE POLICY "Admins can delete submissions"
  ON interest_submissions
  FOR DELETE
  TO authenticated
  USING (check_user_is_admin());

