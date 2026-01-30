-- Complete Fix for Ticket Reservations RLS and Permissions
-- Run this in Supabase SQL Editor to fix all issues
-- This replaces all previous fix files

-- ============================================================================
-- STEP 1: Create Helper Functions
-- ============================================================================

-- Helper function to get user email (SECURITY DEFINER to access auth.users)
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

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION check_user_is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT raw_user_meta_data->>'role' INTO user_role
  FROM auth.users
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_role, '') IN ('admin', 'super_admin');
END;
$$;

-- Function to check if user is admin or summit member
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

-- Grant execute permissions on helper functions
GRANT EXECUTE ON FUNCTION get_user_email() TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_email() TO anon;
GRANT EXECUTE ON FUNCTION check_user_is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION check_user_is_admin() TO anon;
GRANT EXECUTE ON FUNCTION check_user_is_admin_or_summit_member() TO authenticated;
GRANT EXECUTE ON FUNCTION check_user_is_admin_or_summit_member() TO anon;

-- Set function owners
ALTER FUNCTION get_user_email() OWNER TO postgres;
ALTER FUNCTION check_user_is_admin() OWNER TO postgres;
ALTER FUNCTION check_user_is_admin_or_summit_member() OWNER TO postgres;

-- ============================================================================
-- STEP 2: Ensure Ticket Count Functions Exist and Have Permissions
-- ============================================================================

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

-- Grant execute permissions on ticket count functions
GRANT EXECUTE ON FUNCTION get_available_ticket_count() TO authenticated;
GRANT EXECUTE ON FUNCTION get_available_ticket_count() TO anon;
GRANT EXECUTE ON FUNCTION get_reserved_ticket_count() TO authenticated;
GRANT EXECUTE ON FUNCTION get_reserved_ticket_count() TO anon;

-- Set function owners
ALTER FUNCTION get_available_ticket_count() OWNER TO postgres;
ALTER FUNCTION get_reserved_ticket_count() OWNER TO postgres;

-- ============================================================================
-- STEP 3: Drop ALL Existing Policies
-- ============================================================================

DROP POLICY IF EXISTS "Anyone can submit ticket reservations" ON summit_ticket_reservations;
DROP POLICY IF EXISTS "Anonymous can read reservations" ON summit_ticket_reservations;
DROP POLICY IF EXISTS "Anonymous can read ticket counts" ON summit_ticket_reservations;
DROP POLICY IF EXISTS "Anonymous can check own reservation by email" ON summit_ticket_reservations;
DROP POLICY IF EXISTS "Users can view their own reservations" ON summit_ticket_reservations;
DROP POLICY IF EXISTS "Admins can view all reservations" ON summit_ticket_reservations;
DROP POLICY IF EXISTS "Admins and summit members can view all reservations" ON summit_ticket_reservations;
DROP POLICY IF EXISTS "Admins can manage reservations" ON summit_ticket_reservations;
DROP POLICY IF EXISTS "Admins and summit members can manage reservations" ON summit_ticket_reservations;

-- ============================================================================
-- STEP 4: Enable RLS
-- ============================================================================

ALTER TABLE summit_ticket_reservations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 5: Create RLS Policies (Order Matters - More Restrictive First)
-- ============================================================================

-- Policy 1: INSERT - Anyone can submit reservations
CREATE POLICY "Anyone can submit ticket reservations"
ON summit_ticket_reservations
FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- Policy 2: SELECT - Authenticated users can view their own reservations
-- This must come BEFORE the admin policy to ensure proper OR logic
CREATE POLICY "Users can view their own reservations"
ON summit_ticket_reservations
FOR SELECT
TO authenticated
USING (email = get_user_email());

-- Policy 3: SELECT - Admins and summit members can view ALL reservations
CREATE POLICY "Admins and summit members can view all reservations"
ON summit_ticket_reservations
FOR SELECT
TO authenticated
USING (check_user_is_admin_or_summit_member());

-- Policy 4: SELECT - Anonymous users can ONLY use functions (no direct SELECT)
-- Note: Anonymous users should use get_available_ticket_count() and get_reserved_ticket_count()
-- functions instead of direct SELECT. We don't create a policy for anonymous SELECT
-- because the SECURITY DEFINER functions handle availability checks.

-- Policy 5: UPDATE/DELETE - Admins and summit members can manage all reservations
CREATE POLICY "Admins and summit members can manage reservations"
ON summit_ticket_reservations
FOR ALL
TO authenticated
USING (check_user_is_admin_or_summit_member())
WITH CHECK (check_user_is_admin_or_summit_member());

-- ============================================================================
-- STEP 6: Grant Table Permissions Explicitly
-- ============================================================================

GRANT SELECT ON summit_ticket_reservations TO authenticated;
GRANT INSERT ON summit_ticket_reservations TO authenticated, anon;
GRANT UPDATE ON summit_ticket_reservations TO authenticated;
GRANT DELETE ON summit_ticket_reservations TO authenticated;

-- ============================================================================
-- STEP 7: Refresh Schema Cache
-- ============================================================================

NOTIFY pgrst, 'reload schema';

