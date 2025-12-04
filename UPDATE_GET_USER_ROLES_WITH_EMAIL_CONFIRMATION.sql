-- Update get_user_roles function to also return email_confirmed_at
-- Run this in Supabase SQL Editor

-- Step 1: Drop the existing function first (required when changing return type)
DROP FUNCTION IF EXISTS get_user_roles(TEXT[]);

-- Step 2: Create the updated function with email_confirmed_at
CREATE FUNCTION get_user_roles(user_emails TEXT[])
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
  RETURN QUERY
  SELECT 
    au.email::TEXT,
    COALESCE(au.raw_user_meta_data->>'role', 'member')::TEXT as role,
    au.email_confirmed_at
  FROM auth.users au
  WHERE au.email = ANY(user_emails);
END;
$$;

-- Step 3: Grant permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_roles(TEXT[]) TO authenticated;

