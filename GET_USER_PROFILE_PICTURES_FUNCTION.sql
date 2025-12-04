-- RPC Function to get user profile pictures by email
-- This allows fetching profile_picture from auth.users metadata

CREATE OR REPLACE FUNCTION get_user_profile_pictures(user_emails TEXT[])
RETURNS TABLE (
  email TEXT,
  profile_picture TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.email::TEXT,
    (u.raw_user_meta_data->>'profile_picture')::TEXT as profile_picture
  FROM auth.users u
  WHERE u.email = ANY(user_emails)
  AND u.raw_user_meta_data->>'profile_picture' IS NOT NULL;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_profile_pictures(TEXT[]) TO authenticated;

