-- SECURE VERSION: Create a function that updates a user's role
-- This version includes proper admin permission checks
-- Run this in Supabase SQL Editor to replace the insecure version

CREATE OR REPLACE FUNCTION update_user_role(
  user_email TEXT,
  new_role TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- This means it runs with admin privileges
AS $$
DECLARE
  user_id UUID;
  current_user_role TEXT;
  result JSONB;
BEGIN
  -- SECURITY CHECK: Verify the calling user is an admin or super_admin
  SELECT raw_user_meta_data->>'role' INTO current_user_role
  FROM auth.users
  WHERE id = auth.uid();
  
  -- If no role found or not admin/super_admin, deny access
  IF current_user_role IS NULL OR current_user_role NOT IN ('admin', 'super_admin') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unauthorized: Only admins can update user roles'
    );
  END IF;
  
  -- Step 1: Find the user by their email
  SELECT id INTO user_id
  FROM auth.users
  WHERE email = LOWER(user_email);
  
  -- Step 2: Check if user exists
  IF user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;
  
  -- Step 3: Prevent self-promotion to super_admin (only super_admins can promote to super_admin)
  IF new_role = 'super_admin' AND current_user_role != 'super_admin' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unauthorized: Only super_admins can promote users to super_admin'
    );
  END IF;
  
  -- Step 4: Validate the role (make sure it's a valid role)
  IF new_role NOT IN ('member', 'voting_member', 'admin', 'super_admin') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid role. Must be: member, voting_member, admin, or super_admin'
    );
  END IF;
  
  -- Step 5: Update the user's role in their metadata
  UPDATE auth.users
  SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{role}',
    to_jsonb(new_role)
  )
  WHERE id = user_id;
  
  -- Step 6: Return success message
  RETURN jsonb_build_object(
    'success', true,
    'message', 'User role updated successfully',
    'user_id', user_id,
    'new_role', new_role
  );
END;
$$;

-- Grant permission to authenticated users to call this function
-- The function itself checks admin permissions internally
GRANT EXECUTE ON FUNCTION update_user_role(TEXT, TEXT) TO authenticated;

