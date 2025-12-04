-- Create a function to get user roles for multiple emails
-- This allows the Admin page to fetch actual roles from auth.users
-- Run this in Supabase SQL Editor

CREATE OR REPLACE FUNCTION get_user_roles(user_emails TEXT[])
RETURNS TABLE (
  email TEXT,
  role TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.email::TEXT,
    COALESCE(au.raw_user_meta_data->>'role', 'member')::TEXT as role
  FROM auth.users au
  WHERE au.email = ANY(user_emails);
END;
$$;

-- Grant permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_roles(TEXT[]) TO authenticated;

