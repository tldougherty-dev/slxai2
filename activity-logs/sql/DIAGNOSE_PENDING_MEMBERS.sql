-- Diagnose Why Members Are Still Pending
-- This script shows detailed information about pending members
-- Run this in Supabase SQL Editor

-- Check 1: Show all pending members with their POC email verification status
SELECT 
  m.id,
  m.organization_name,
  m.poc_email,
  m.status as member_status,
  CASE 
    WHEN m.poc_email IS NULL THEN 'No POC Email'
    WHEN EXISTS (
      SELECT 1 FROM auth.users au 
      WHERE au.email = m.poc_email 
      AND au.email_confirmed_at IS NOT NULL
    ) THEN '✅ POC Email Verified'
    WHEN EXISTS (
      SELECT 1 FROM auth.users au 
      WHERE au.email = m.poc_email
    ) THEN '⚠️ POC Email Exists But Not Verified'
    ELSE '❌ POC Email Not Found in auth.users'
  END as poc_email_status,
  COUNT(mp.id) FILTER (WHERE mp.status = 'active') as active_persons_count,
  COUNT(mp.id) FILTER (WHERE mp.status = 'pending') as pending_persons_count,
  COUNT(mp.id) as total_persons_count
FROM members m
LEFT JOIN member_persons mp ON mp.member_id = m.id
WHERE m.status = 'pending'
GROUP BY m.id, m.organization_name, m.poc_email, m.status
ORDER BY m.organization_name;

-- Check 2: Show pending members' POC emails and their auth.users status
SELECT 
  m.organization_name,
  m.poc_email,
  au.email as auth_email,
  au.email_confirmed_at,
  CASE 
    WHEN au.email_confirmed_at IS NOT NULL THEN '✅ Verified'
    WHEN au.email IS NOT NULL THEN '⚠️ Exists but not verified'
    ELSE '❌ Not found'
  END as status
FROM members m
LEFT JOIN auth.users au ON au.email = m.poc_email
WHERE m.status = 'pending'
ORDER BY m.organization_name;

-- Check 3: Show all member_persons for pending members
SELECT 
  m.organization_name,
  mp.name,
  mp.email as person_email,
  mp.status as person_status,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM auth.users au 
      WHERE au.email = mp.email 
      AND au.email_confirmed_at IS NOT NULL
    ) THEN '✅ Email Verified'
    WHEN EXISTS (
      SELECT 1 FROM auth.users au 
      WHERE au.email = mp.email
    ) THEN '⚠️ Email Exists But Not Verified'
    ELSE '❌ Email Not Found in auth.users'
  END as email_status
FROM members m
JOIN member_persons mp ON mp.member_id = m.id
WHERE m.status = 'pending'
ORDER BY m.organization_name, mp.name;

-- Check 4: Count by reason for pending status
SELECT 
  CASE 
    WHEN m.poc_email IS NULL THEN 'No POC Email'
    WHEN NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.email = m.poc_email) THEN 'POC Email Not in auth.users'
    WHEN EXISTS (
      SELECT 1 FROM auth.users au 
      WHERE au.email = m.poc_email 
      AND au.email_confirmed_at IS NULL
    ) THEN 'POC Email Not Verified'
    WHEN NOT EXISTS (
      SELECT 1 FROM member_persons mp 
      WHERE mp.member_id = m.id 
      AND mp.status = 'active'
    ) THEN 'No Active Persons'
    ELSE 'Unknown Reason'
  END as reason,
  COUNT(*) as count
FROM members m
WHERE m.status = 'pending'
GROUP BY reason
ORDER BY count DESC;

-- Check 5: Force activate members where we have verified emails (even if POC email isn't verified)
-- This will activate members if ANY of their persons have verified emails
UPDATE members m
SET status = 'active'
WHERE m.status = 'pending'
AND EXISTS (
  SELECT 1 
  FROM member_persons mp
  JOIN auth.users au ON au.email = mp.email
  WHERE mp.member_id = m.id
  AND mp.status = 'active'
  AND au.email_confirmed_at IS NOT NULL
);

-- Check 6: Show final status after force activation
SELECT 
  'Final Status' as report_type,
  COUNT(*) FILTER (WHERE status = 'active') as active_members,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_members,
  COUNT(*) as total_members
FROM members;

-- Check 7: Show remaining pending members (if any)
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
