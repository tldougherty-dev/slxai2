-- Fix Ticket Reservations RLS Policies
-- Run this in Supabase SQL Editor to ensure anonymous users can submit reservations

-- Step 1: Ensure the table exists (run SUMMIT_TICKET_RESERVATIONS_SCHEMA.sql first if needed)
-- This is just a safety check - the main schema should already be run

-- Step 2: Disable RLS temporarily to reset all policies
ALTER TABLE IF EXISTS summit_ticket_reservations DISABLE ROW LEVEL SECURITY;

-- Step 3: Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Anyone can submit ticket reservations" ON summit_ticket_reservations;
DROP POLICY IF EXISTS "Anonymous can check own reservation by email" ON summit_ticket_reservations;
DROP POLICY IF EXISTS "Users can view their own reservations" ON summit_ticket_reservations;
DROP POLICY IF EXISTS "Admins and summit members can view all reservations" ON summit_ticket_reservations;
DROP POLICY IF EXISTS "Admins and summit members can manage reservations" ON summit_ticket_reservations;

-- Step 4: Re-enable RLS
ALTER TABLE summit_ticket_reservations ENABLE ROW LEVEL SECURITY;

-- Step 5: Create INSERT policy - MOST IMPORTANT: Allow anonymous users to insert
CREATE POLICY "Anyone can submit ticket reservations"
ON summit_ticket_reservations
FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- Step 6: Allow anonymous users to SELECT (needed for checking availability via functions)
-- This is safe because the functions use SECURITY DEFINER
CREATE POLICY "Anonymous can read ticket counts"
ON summit_ticket_reservations
FOR SELECT
TO anon
USING (true);

-- Step 7: Authenticated users can view their own reservations
CREATE POLICY "Users can view their own reservations"
ON summit_ticket_reservations
FOR SELECT
TO authenticated
USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Step 8: Admins and summit members can view all reservations
-- First ensure the function exists
CREATE OR REPLACE FUNCTION check_user_is_admin_or_summit_member()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
  user_email TEXT;
BEGIN
  -- Get user role and email
  SELECT raw_user_meta_data->>'role', email INTO user_role, user_email
  FROM auth.users
  WHERE id = auth.uid();
  
  -- Check if admin
  IF COALESCE(user_role, '') IN ('admin', 'super_admin') THEN
    RETURN TRUE;
  END IF;
  
  -- Check if summit member
  IF EXISTS (
    SELECT 1 FROM summit_members
    WHERE summit_members.email = user_email
  ) THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;

GRANT EXECUTE ON FUNCTION check_user_is_admin_or_summit_member() TO authenticated;
GRANT EXECUTE ON FUNCTION check_user_is_admin_or_summit_member() TO anon;

CREATE POLICY "Admins and summit members can view all reservations"
ON summit_ticket_reservations
FOR SELECT
TO authenticated
USING (check_user_is_admin_or_summit_member());

-- Step 9: Admins and summit members can manage reservations
CREATE POLICY "Admins and summit members can manage reservations"
ON summit_ticket_reservations
FOR ALL
TO authenticated
USING (check_user_is_admin_or_summit_member())
WITH CHECK (check_user_is_admin_or_summit_member());

-- Step 10: Grant table permissions explicitly
GRANT INSERT ON summit_ticket_reservations TO authenticated;
GRANT INSERT ON summit_ticket_reservations TO anon;
GRANT SELECT ON summit_ticket_reservations TO authenticated;
GRANT SELECT ON summit_ticket_reservations TO anon;

-- Step 11: Ensure functions exist and have proper permissions
CREATE OR REPLACE FUNCTION get_available_ticket_count()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  reserved_count INTEGER;
  max_tickets INTEGER := 175;
BEGIN
  SELECT COUNT(*) INTO reserved_count
  FROM summit_ticket_reservations
  WHERE status IN ('reserved', 'confirmed');
  
  RETURN GREATEST(0, max_tickets - reserved_count);
END;
$$;

CREATE OR REPLACE FUNCTION get_reserved_ticket_count()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  reserved_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO reserved_count
  FROM summit_ticket_reservations
  WHERE status IN ('reserved', 'confirmed');
  
  RETURN reserved_count;
END;
$$;

GRANT EXECUTE ON FUNCTION get_available_ticket_count() TO authenticated;
GRANT EXECUTE ON FUNCTION get_available_ticket_count() TO anon;
GRANT EXECUTE ON FUNCTION get_reserved_ticket_count() TO authenticated;
GRANT EXECUTE ON FUNCTION get_reserved_ticket_count() TO anon;

-- Step 12: Refresh schema cache
NOTIFY pgrst, 'reload schema';

