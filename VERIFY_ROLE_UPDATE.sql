-- Verify that Travis's role was updated
-- Run this in Supabase SQL Editor

SELECT 
  email,
  raw_user_meta_data->>'role' as current_role,
  CASE 
    WHEN raw_user_meta_data->>'role' = 'super_admin' THEN '✅ SUPER ADMIN'
    WHEN raw_user_meta_data->>'role' = 'admin' THEN '⚠️ ADMIN (not super_admin)'
    ELSE '❌ NOT ADMIN'
  END as status
FROM auth.users
WHERE email = 'travis@gosign.ai';

