-- Fix Feedback Submissions RLS Policies
-- Run this in Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view all feedback" ON feedback_submissions;
DROP POLICY IF EXISTS "Users can view their own feedback" ON feedback_submissions;

-- Create a function to check if user is admin (SECURITY DEFINER to access auth.users)
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

-- Policy: Admins can view all feedback
CREATE POLICY "Admins can view all feedback"
ON feedback_submissions
FOR SELECT
TO authenticated
USING (check_user_is_admin());

-- Policy: Users can view their own feedback
CREATE POLICY "Users can view their own feedback"
ON feedback_submissions
FOR SELECT
TO authenticated
USING (auth.email() = user_email);

