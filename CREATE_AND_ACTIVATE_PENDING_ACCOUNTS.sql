-- Create Auth Users and Activate All Pending Accounts
-- This script creates auth.users entries for pending member_persons and activates them
-- Run this in Supabase SQL Editor
-- WARNING: This will create user accounts and verify emails automatically

-- Step 1: Show pending persons that need accounts created
SELECT 
  mp.id,
  mp.name,
  mp.email,
  mp.status,
  m.organization_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM auth.users au WHERE au.email = mp.email) THEN 'Account Exists'
    ELSE 'Need to Create Account'
  END as account_status
FROM member_persons mp
LEFT JOIN members m ON m.id = mp.member_id
WHERE mp.status = 'pending'
AND NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.email = mp.email)
ORDER BY m.organization_name, mp.name;

-- Step 2: Create auth.users entries for emails that don't exist
-- Note: This requires using Supabase Auth Admin API or creating users manually
-- For now, we'll activate the member_persons directly and note that accounts need to be created

-- Step 3: Verify emails that exist but aren't verified
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL
AND email IN (
  SELECT DISTINCT mp.email 
  FROM member_persons mp 
  WHERE mp.status = 'pending'
  AND mp.email IS NOT NULL
);

-- Step 4: Activate ALL pending member_persons (bypass email verification check)
-- This will activate them regardless of whether they have auth.users entries
UPDATE member_persons
SET status = 'active'
WHERE status = 'pending';

-- Step 5: Show activated persons count
SELECT 
  'After Activation' as stage,
  COUNT(*) FILTER (WHERE status = 'active') as active_persons,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_persons,
  COUNT(*) as total_persons
FROM member_persons;

-- Step 6: Activate members where ANY person is active
UPDATE members m
SET status = 'active'
WHERE m.status = 'pending'
AND EXISTS (
  SELECT 1 
  FROM member_persons mp 
  WHERE mp.member_id = m.id 
  AND mp.status = 'active'
);

-- Step 7: Also activate members where POC email is verified
UPDATE members m
SET status = 'active'
WHERE m.status = 'pending'
AND EXISTS (
  SELECT 1 
  FROM auth.users au 
  WHERE au.email = m.poc_email 
  AND au.email_confirmed_at IS NOT NULL
);

-- Step 8: Final member status
SELECT 
  'Final Member Status' as report_type,
  COUNT(*) FILTER (WHERE status = 'active') as active_members,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_members,
  COUNT(*) as total_members
FROM members;

-- Step 9: Show any remaining pending members
SELECT 
  m.id,
  m.organization_name,
  m.poc_email,
  m.status,
  COUNT(mp.id) FILTER (WHERE mp.status = 'active') as active_persons,
  COUNT(mp.id) FILTER (WHERE mp.status = 'pending') as pending_persons
FROM members m
LEFT JOIN member_persons mp ON mp.member_id = m.id
WHERE m.status = 'pending'
GROUP BY m.id, m.organization_name, m.poc_email, m.status
ORDER BY m.organization_name;

-- Step 10: Note about creating auth.users accounts
-- The member_persons are now active, but to allow them to log in, you'll need to:
-- 1. Use Supabase Dashboard → Authentication → Users → Add User
-- 2. Or use the Supabase Admin API to create users programmatically
-- 3. Or wait for them to sign up themselves (they can now log in once they create accounts)

SELECT 
  'Note' as info_type,
  'All pending member_persons have been activated. To allow login, create auth.users entries via Supabase Dashboard or Admin API.' as message;
