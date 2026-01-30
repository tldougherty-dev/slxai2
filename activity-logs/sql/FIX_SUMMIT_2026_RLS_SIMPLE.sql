-- Fix RLS Policies for Summit 2026 Submissions - Simple Version
-- This ensures authenticated users can submit and view their submissions

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can submit workshops" ON summit_workshop_submissions;
DROP POLICY IF EXISTS "Users can view their own submissions" ON summit_workshop_submissions;
DROP POLICY IF EXISTS "Admins and summit members can manage submissions" ON summit_workshop_submissions;

DROP POLICY IF EXISTS "Anyone can submit sponsorships" ON summit_sponsor_submissions;
DROP POLICY IF EXISTS "Users can view their own sponsor submissions" ON summit_sponsor_submissions;
DROP POLICY IF EXISTS "Admins and summit members can manage sponsor submissions" ON summit_sponsor_submissions;

-- Workshop Submissions Policies
-- Allow any authenticated user to submit workshops
CREATE POLICY "Anyone can submit workshops"
ON summit_workshop_submissions
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow users to view submissions - be more permissive to allow viewing after insert
CREATE POLICY "Users can view their own submissions"
ON summit_workshop_submissions
FOR SELECT
TO authenticated
USING (
  -- User can see their own submissions (check if any presenter email matches)
  EXISTS (
    SELECT 1 FROM jsonb_array_elements(COALESCE(presenters, '[]'::jsonb)) AS presenter
    WHERE (presenter->>'email') = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
  OR presenter_email = (SELECT email FROM auth.users WHERE id = auth.uid())
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

-- Sponsor Submissions Policies
-- Allow any authenticated user to submit sponsorships
CREATE POLICY "Anyone can submit sponsorships"
ON summit_sponsor_submissions
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow users to view their own sponsor submissions
CREATE POLICY "Users can view their own sponsor submissions"
ON summit_sponsor_submissions
FOR SELECT
TO authenticated
USING (
  contact_email = (SELECT email FROM auth.users WHERE id = auth.uid())
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

