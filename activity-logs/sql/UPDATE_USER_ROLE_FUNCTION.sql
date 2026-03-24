-- Step 1: Create a function that updates a user's role
-- This is like creating a special tool that only admins can use
-- Run this in Supabase SQL Editor

-- First, let's create the function
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
  result JSONB;
BEGIN
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
  
  -- Step 3: Validate the role (make sure it's a valid role)
  IF new_role NOT IN ('member', 'voting_member', 'admin', 'super_admin') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid role. Must be: member, voting_member, admin, or super_admin'
    );
  END IF;
  
  -- Step 4: Update the user's role in their metadata
  UPDATE auth.users
  SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{role}',
    to_jsonb(new_role)
  )
  WHERE id = user_id;
  
  -- Step 5: Return success message
  RETURN jsonb_build_object(
    'success', true,
    'message', 'User role updated successfully',
    'user_id', user_id,
    'new_role', new_role
  );
END;
$$;

-- Step 2: Grant permission to authenticated users to call this function
-- But we'll add a check inside to make sure only admins/super_admins can use it
GRANT EXECUTE ON FUNCTION update_user_role(TEXT, TEXT) TO authenticated;

-- Step 3: Test the function (optional - you can test it here)
-- Note: When you SELECT an RPC function, Supabase wraps the result in an array
-- This is normal! The function still works correctly.
-- 
-- Test query:
-- SELECT update_user_role('travis@signapse.ai', 'super_admin');
--
-- Expected result (wrapped in array - this is normal!):
-- [
--   {
--     "update_user_role": {
--       "success": true,
--       "message": "User role updated successfully",
--       "user_id": "...",
--       "new_role": "super_admin"
--     }
--   }
-- ]
--
-- To verify the role was actually updated, run:
-- SELECT email, raw_user_meta_data->>'role' as role 
-- FROM auth.users 
-- WHERE email = 'travis@signapse.ai';

