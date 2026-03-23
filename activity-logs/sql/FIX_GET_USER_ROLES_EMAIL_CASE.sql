-- Match auth.users emails case-insensitively when resolving roles for directory/admin views.
-- Run in Supabase SQL Editor if get_user_roles returns no row for some users whose
-- login email casing differs from auth.users.email storage.

DROP FUNCTION IF EXISTS get_user_roles(TEXT[]);

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
  RETURN QUERY
  SELECT
    au.email::TEXT,
    COALESCE(au.raw_user_meta_data->>'role', 'member')::TEXT AS role,
    au.email_confirmed_at
  FROM auth.users au
  WHERE LOWER(au.email) = ANY (
    ARRAY(SELECT LOWER(TRIM(x)) FROM unnest(user_emails) AS x)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION get_user_roles(TEXT[]) TO authenticated;
ALTER FUNCTION get_user_roles(TEXT[]) OWNER TO postgres;

NOTIFY pgrst, 'reload schema';
