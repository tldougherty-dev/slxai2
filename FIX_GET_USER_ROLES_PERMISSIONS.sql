-- Fix get_user_roles function permissions
-- Run this in Supabase SQL Editor to ensure the function can access auth.users

-- Drop and recreate the function with proper SECURITY DEFINER and search_path
DROP FUNCTION IF EXISTS get_user_roles(TEXT[]);

CREATE OR REPLACE FUNCTION get_user_roles(user_emails TEXT[])
RETURNS TABLE (
  email TEXT,
  role TEXT,
  email_confirmed_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.email::TEXT,
    COALESCE(au.raw_user_meta_data->>'role', 'member')::TEXT as role,
    au.email_confirmed_at
  FROM auth.users au
  WHERE au.email = ANY(user_emails);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_roles(TEXT[]) TO authenticated;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

