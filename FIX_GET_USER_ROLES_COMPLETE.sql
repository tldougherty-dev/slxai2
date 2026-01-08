-- Complete fix for get_user_roles function
-- Run this in Supabase SQL Editor
-- This ensures the function can access auth.users with proper permissions

-- Step 1: Drop the existing function
DROP FUNCTION IF EXISTS get_user_roles(TEXT[]);

-- Step 2: Create the function with SECURITY DEFINER
-- Note: SECURITY DEFINER allows the function to run with the privileges of the function owner
-- This matches the pattern used by check_user_is_admin() which successfully accesses auth.users
CREATE OR REPLACE FUNCTION get_user_roles(user_emails TEXT[])
RETURNS TABLE (
  email TEXT,
  role TEXT,
  email_confirmed_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Access auth.users directly - SECURITY DEFINER allows this
  -- Use fully qualified name auth.users (same as check_user_is_admin)
  RETURN QUERY
  SELECT 
    au.email::TEXT,
    COALESCE(au.raw_user_meta_data->>'role', 'member')::TEXT as role,
    au.email_confirmed_at
  FROM auth.users au
  WHERE au.email = ANY(user_emails);
END;
$$;

-- Step 3: Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_roles(TEXT[]) TO authenticated;

-- Step 4: Ensure the function owner is postgres (default, but explicit is better)
ALTER FUNCTION get_user_roles(TEXT[]) OWNER TO postgres;

-- Step 5: Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- Step 6: Test the function (optional - uncomment to test)
-- SELECT * FROM get_user_roles(ARRAY['your-email@example.com']);

