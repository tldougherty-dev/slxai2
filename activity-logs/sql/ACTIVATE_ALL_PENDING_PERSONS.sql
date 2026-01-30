-- Activate All Pending Member Persons with Verified Emails
-- This will activate member_persons, which should then activate their parent members
-- Run this in Supabase SQL Editor

-- Step 1: Show current status before activation
SELECT 
  'Before Activation' as stage,
  COUNT(*) FILTER (WHERE status = 'active') as active_persons,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_persons,
  COUNT(*) as total_persons
FROM member_persons;

-- Step 2: Show pending persons and their email verification status
SELECT 
  mp.id,
  mp.name,
  mp.email,
  mp.status,
  m.organization_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM auth.users au 
      WHERE au.email = mp.email 
      AND au.email_confirmed_at IS NOT NULL
    ) THEN '✅ Email Verified - Will Activate'
    WHEN EXISTS (
      SELECT 1 FROM auth.users au 
      WHERE au.email = mp.email
    ) THEN '⚠️ Email Exists But Not Verified'
    ELSE '❌ Email Not Found in auth.users'
  END as email_status
FROM member_persons mp
LEFT JOIN members m ON m.id = mp.member_id
WHERE mp.status = 'pending'
ORDER BY m.organization_name, mp.name;

-- Step 3: Activate ALL pending member_persons where email is verified
UPDATE member_persons mp
SET status = 'active'
WHERE mp.status = 'pending'
AND EXISTS (
  SELECT 1 
  FROM auth.users au 
  WHERE au.email = mp.email 
  AND au.email_confirmed_at IS NOT NULL
);

-- Step 4: Show how many were activated
SELECT 
  'After Person Activation' as stage,
  COUNT(*) FILTER (WHERE status = 'active') as active_persons,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_persons,
  COUNT(*) as total_persons
FROM member_persons;

-- Step 5: Now activate members where ANY person is active
UPDATE members m
SET status = 'active'
WHERE m.status = 'pending'
AND EXISTS (
  SELECT 1 
  FROM member_persons mp 
  WHERE mp.member_id = m.id 
  AND mp.status = 'active'
);

-- Step 6: Also activate members where POC email is verified
UPDATE members m
SET status = 'active'
WHERE m.status = 'pending'
AND EXISTS (
  SELECT 1 
  FROM auth.users au 
  WHERE au.email = m.poc_email 
  AND au.email_confirmed_at IS NOT NULL
);

-- Step 7: Show final member status
SELECT 
  'Final Member Status' as report_type,
  COUNT(*) FILTER (WHERE status = 'active') as active_members,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_members,
  COUNT(*) as total_members
FROM members;

-- Step 8: Show any remaining pending members (should be 0 now)
SELECT 
  m.id,
  m.organization_name,
  m.poc_email,
  m.status,
  COUNT(mp.id) FILTER (WHERE mp.status = 'active') as active_persons,
  COUNT(mp.id) FILTER (WHERE mp.status = 'pending') as pending_persons,
  COUNT(mp.id) as total_persons
FROM members m
LEFT JOIN member_persons mp ON mp.member_id = m.id
WHERE m.status = 'pending'
GROUP BY m.id, m.organization_name, m.poc_email, m.status
ORDER BY m.organization_name;

-- Step 9: Show any remaining pending persons (if any)
SELECT 
  mp.id,
  mp.name,
  mp.email,
  mp.status,
  m.organization_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM auth.users au 
      WHERE au.email = mp.email 
      AND au.email_confirmed_at IS NOT NULL
    ) THEN '✅ Email Verified'
    ELSE '❌ Email Not Verified'
  END as email_status
FROM member_persons mp
LEFT JOIN members m ON m.id = mp.member_id
WHERE mp.status = 'pending'
ORDER BY m.organization_name, mp.name;
