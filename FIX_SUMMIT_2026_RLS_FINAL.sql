-- Fix RLS Policies for Summit 2026 Submissions - Final Version
-- Uses SECURITY DEFINER functions to safely access auth.users

-- Step 1: Ensure get_user_email() function exists (from SUMMIT_SCHEMA.sql)
-- Create a helper function to get user email (SECURITY DEFINER to access auth.users)
CREATE OR REPLACE FUNCTION get_user_email()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email TEXT;
BEGIN
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = auth.uid();
  
  RETURN user_email;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_email() TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_email() TO anon;

-- Step 2: Drop existing policies
DROP POLICY IF EXISTS "Anyone can submit workshops" ON summit_workshop_submissions;
DROP POLICY IF EXISTS "Users can view their own submissions" ON summit_workshop_submissions;
DROP POLICY IF EXISTS "Admins and summit members can manage submissions" ON summit_workshop_submissions;

DROP POLICY IF EXISTS "Anyone can submit sponsorships" ON summit_sponsor_submissions;
DROP POLICY IF EXISTS "Users can view their own sponsor submissions" ON summit_sponsor_submissions;
DROP POLICY IF EXISTS "Admins and summit members can manage sponsor submissions" ON summit_sponsor_submissions;

-- Step 3: Workshop Submissions Policies
-- Allow any authenticated user to submit workshops
CREATE POLICY "Anyone can submit workshops"
ON summit_workshop_submissions
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow users to view submissions - use get_user_email() function instead of direct auth.users query
CREATE POLICY "Users can view their own submissions"
ON summit_workshop_submissions
FOR SELECT
TO authenticated
USING (
  -- User can see their own submissions (check if any presenter email matches)
  -- Handle case where presenters might be null, empty, or a scalar value
  (
    presenters IS NOT NULL 
    AND jsonb_typeof(presenters) = 'array'
    AND EXISTS (
      SELECT 1 FROM jsonb_array_elements(presenters) AS presenter
      WHERE jsonb_typeof(presenter) = 'object'
      AND (presenter->>'email') = get_user_email()
    )
  )
  OR presenter_email = get_user_email()
  -- Allow viewing if submitted in the last 5 minutes (for insert + select)
  OR submitted_at >= NOW() - INTERVAL '5 minutes'
  OR check_user_is_admin_or_summit_member()
);

-- Allow admins and summit members to manage all submissions
CREATE POLICY "Admins and summit members can manage submissions"
ON summit_workshop_submissions
FOR ALL
TO authenticated
USING (check_user_is_admin_or_summit_member())
WITH CHECK (check_user_is_admin_or_summit_member());

-- Step 4: Sponsor Submissions Policies
-- Allow any authenticated user to submit sponsorships
CREATE POLICY "Anyone can submit sponsorships"
ON summit_sponsor_submissions
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow users to view their own sponsor submissions - use get_user_email() function
CREATE POLICY "Users can view their own sponsor submissions"
ON summit_sponsor_submissions
FOR SELECT
TO authenticated
USING (
  contact_email = get_user_email()
  -- Allow viewing if submitted in the last 5 minutes (for insert + select)
  OR submitted_at >= NOW() - INTERVAL '5 minutes'
  OR check_user_is_admin_or_summit_member()
);

-- Allow admins and summit members to manage all sponsor submissions
CREATE POLICY "Admins and summit members can manage sponsor submissions"
ON summit_sponsor_submissions
FOR ALL
TO authenticated
USING (check_user_is_admin_or_summit_member())
WITH CHECK (check_user_is_admin_or_summit_member());

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

