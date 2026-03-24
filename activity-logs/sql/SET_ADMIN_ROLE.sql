-- Set travis@signapse.ai as admin
-- Run this in Supabase SQL Editor

-- Update user metadata to set role as admin
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'travis@signapse.ai';

-- Verify the update
SELECT 
  id,
  email,
  raw_user_meta_data->>'role' as role,
  raw_user_meta_data->>'organization_id' as organization_id
FROM auth.users
WHERE email = 'travis@signapse.ai';

