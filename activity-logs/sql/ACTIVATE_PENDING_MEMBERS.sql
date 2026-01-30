-- Activate All Pending Members and Member Persons
-- This script activates members/persons whose emails are already verified
-- Run this in Supabase SQL Editor

-- Step 1: Activate member_persons where email is confirmed
UPDATE member_persons mp
SET status = 'active'
WHERE mp.status = 'pending'
AND EXISTS (
  SELECT 1 
  FROM auth.users au 
  WHERE au.email = mp.email 
  AND au.email_confirmed_at IS NOT NULL
);

-- Step 2: Activate members where POC email is confirmed
UPDATE members m
SET status = 'active'
WHERE m.status = 'pending'
AND EXISTS (
  SELECT 1 
  FROM auth.users au 
  WHERE au.email = m.poc_email 
  AND au.email_confirmed_at IS NOT NULL
);

-- Step 3: Activate members where ANY of their persons are active
UPDATE members m
SET status = 'active'
WHERE m.status = 'pending'
AND EXISTS (
  SELECT 1 
  FROM member_persons mp 
  WHERE mp.member_id = m.id 
  AND mp.status = 'active'
);

-- Step 4: Show summary of what was activated
SELECT 
  'Activation Summary' as report_type,
  (SELECT COUNT(*) FROM member_persons WHERE status = 'active') as active_persons,
  (SELECT COUNT(*) FROM member_persons WHERE status = 'pending') as pending_persons,
  (SELECT COUNT(*) FROM members WHERE status = 'active') as active_members,
  (SELECT COUNT(*) FROM members WHERE status = 'pending') as pending_members;

-- Step 5: Show any remaining pending members (if any)
SELECT 
  m.id,
  m.organization_name,
  m.poc_email,
  m.status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM auth.users au WHERE au.email = m.poc_email AND au.email_confirmed_at IS NOT NULL) 
    THEN 'Email Verified'
    ELSE 'Email Not Verified'
  END as poc_email_status,
  COUNT(mp.id) FILTER (WHERE mp.status = 'active') as active_persons_count,
  COUNT(mp.id) FILTER (WHERE mp.status = 'pending') as pending_persons_count
FROM members m
LEFT JOIN member_persons mp ON mp.member_id = m.id
WHERE m.status = 'pending'
GROUP BY m.id, m.organization_name, m.poc_email, m.status
ORDER BY m.organization_name;

-- Step 6: Show any remaining pending persons (if any)
SELECT 
  mp.id,
  mp.name,
  mp.email,
  mp.status,
  m.organization_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM auth.users au WHERE au.email = mp.email AND au.email_confirmed_at IS NOT NULL) 
    THEN 'Email Verified'
    ELSE 'Email Not Verified'
  END as email_status
FROM member_persons mp
LEFT JOIN members m ON m.id = mp.member_id
WHERE mp.status = 'pending'
ORDER BY m.organization_name, mp.name;
