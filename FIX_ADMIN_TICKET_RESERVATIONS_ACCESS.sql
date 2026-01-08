-- Fix Admin Access to Ticket Reservations
-- Run this in Supabase SQL Editor to allow admins to view all ticket reservations
-- This ensures admins can SELECT from summit_ticket_reservations

-- Step 1: Create helper function to get user email (SECURITY DEFINER to access auth.users)
CREATE OR REPLACE FUNCTION get_user_email()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email TEXT;
BEGIN
  -- Access auth.users with SECURITY DEFINER privileges
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = auth.uid();
  
  RETURN user_email;
END;
$$;

-- Step 2: Ensure check_user_is_admin() function exists and works
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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_user_email() TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_email() TO anon;
GRANT EXECUTE ON FUNCTION check_user_is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION check_user_is_admin() TO anon;

-- Step 2: Drop ALL existing policies on summit_ticket_reservations to start fresh
DROP POLICY IF EXISTS "Anyone can submit ticket reservations" ON summit_ticket_reservations;
DROP POLICY IF EXISTS "Anonymous can read reservations" ON summit_ticket_reservations;
DROP POLICY IF EXISTS "Anonymous can check own reservation by email" ON summit_ticket_reservations;
DROP POLICY IF EXISTS "Users can view their own reservations" ON summit_ticket_reservations;
DROP POLICY IF EXISTS "Admins can view all reservations" ON summit_ticket_reservations;
DROP POLICY IF EXISTS "Admins and summit members can view all reservations" ON summit_ticket_reservations;
DROP POLICY IF EXISTS "Admins can manage reservations" ON summit_ticket_reservations;
DROP POLICY IF EXISTS "Admins and summit members can manage reservations" ON summit_ticket_reservations;

-- Step 3: Enable RLS
ALTER TABLE summit_ticket_reservations ENABLE ROW LEVEL SECURITY;

-- Step 4: Create INSERT policy - allow anyone to submit
CREATE POLICY "Anyone can submit ticket reservations"
ON summit_ticket_reservations
FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- Step 5: Allow anonymous to SELECT (needed for availability checks)
CREATE POLICY "Anonymous can read reservations"
ON summit_ticket_reservations
FOR SELECT
TO anon
USING (true);

-- Step 6: Authenticated users can view their own reservations
-- Use helper function instead of direct auth.users query
CREATE POLICY "Users can view their own reservations"
ON summit_ticket_reservations
FOR SELECT
TO authenticated
USING (email = get_user_email());

-- Step 7: Admins can view ALL reservations (THIS IS THE KEY FIX)
CREATE POLICY "Admins can view all reservations"
ON summit_ticket_reservations
FOR SELECT
TO authenticated
USING (check_user_is_admin());

-- Step 8: Admins can manage (UPDATE/DELETE) all reservations
CREATE POLICY "Admins can manage reservations"
ON summit_ticket_reservations
FOR ALL
TO authenticated
USING (check_user_is_admin())
WITH CHECK (check_user_is_admin());

-- Step 9: Grant table permissions explicitly
GRANT SELECT ON summit_ticket_reservations TO authenticated;
GRANT INSERT ON summit_ticket_reservations TO authenticated, anon;
GRANT UPDATE ON summit_ticket_reservations TO authenticated;
GRANT DELETE ON summit_ticket_reservations TO authenticated;

-- Step 10: Refresh schema cache
NOTIFY pgrst, 'reload schema';

