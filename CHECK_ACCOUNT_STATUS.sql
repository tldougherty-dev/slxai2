-- Check Account Status - Verify if all accounts are active
-- Run this in Supabase SQL Editor to see current status

-- Check 1: User email confirmation status
SELECT 
  'User Email Status' as check_type,
  COUNT(*) FILTER (WHERE email_confirmed_at IS NOT NULL) as verified_users,
  COUNT(*) FILTER (WHERE email_confirmed_at IS NULL) as pending_users,
  COUNT(*) as total_users
FROM auth.users
WHERE email IS NOT NULL;

-- Check 2: Member organizations status
SELECT 
  'Member Organizations' as check_type,
  COUNT(*) FILTER (WHERE status = 'active') as active_members,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_members,
  COUNT(*) as total_members
FROM members;

-- Check 3: Member persons status
SELECT 
  'Member Persons' as check_type,
  COUNT(*) FILTER (WHERE status = 'active') as active_persons,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_persons,
  COUNT(*) as total_persons
FROM member_persons;

-- Check 4: Detailed view of pending members (if any)
SELECT 
  m.id,
  m.organization_name,
  m.poc_email,
  m.status as member_status,
  COUNT(mp.id) FILTER (WHERE mp.status = 'pending') as pending_persons_count,
  COUNT(mp.id) FILTER (WHERE mp.status = 'active') as active_persons_count
FROM members m
LEFT JOIN member_persons mp ON mp.member_id = m.id
WHERE m.status = 'pending'
GROUP BY m.id, m.organization_name, m.poc_email, m.status
ORDER BY m.organization_name;

-- Check 5: Detailed view of pending member persons (if any)
SELECT 
  mp.id,
  mp.name,
  mp.email,
  mp.status,
  m.organization_name,
  au.email_confirmed_at IS NOT NULL as email_is_confirmed
FROM member_persons mp
LEFT JOIN members m ON m.id = mp.member_id
LEFT JOIN auth.users au ON au.email = mp.email
WHERE mp.status = 'pending'
ORDER BY m.organization_name, mp.name;

-- Check 6: Summary - Are all accounts active?
SELECT 
  CASE 
    WHEN (
      (SELECT COUNT(*) FROM auth.users WHERE email IS NOT NULL AND email_confirmed_at IS NULL) = 0
      AND (SELECT COUNT(*) FROM members WHERE status = 'pending') = 0
      AND (SELECT COUNT(*) FROM member_persons WHERE status = 'pending') = 0
    ) THEN '✅ All accounts are active!'
    ELSE '⚠️ Some accounts are still pending'
  END as overall_status,
  (SELECT COUNT(*) FROM auth.users WHERE email IS NOT NULL AND email_confirmed_at IS NULL) as unverified_emails,
  (SELECT COUNT(*) FROM members WHERE status = 'pending') as pending_members,
  (SELECT COUNT(*) FROM member_persons WHERE status = 'pending') as pending_persons;
