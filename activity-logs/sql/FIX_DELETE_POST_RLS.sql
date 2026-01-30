-- Fix RLS Policy for Deleting Posts
-- This ensures authors, admins, and super_admins can delete posts

-- Drop existing delete policy if it exists
DROP POLICY IF EXISTS "Allow authors and admins to delete posts" ON feed_posts;

-- Create a SECURITY DEFINER function to check if user is admin
CREATE OR REPLACE FUNCTION check_user_is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT raw_user_meta_data->>'role' INTO user_role
  FROM auth.users
  WHERE id = auth.uid();
  
  RETURN user_role IN ('admin', 'super_admin');
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION check_user_is_admin() TO authenticated;

-- Create delete policy using the function
CREATE POLICY "Allow authors and admins to delete posts"
ON feed_posts FOR DELETE
TO authenticated
USING (
  author_id = auth.uid() OR
  check_user_is_admin()
);

