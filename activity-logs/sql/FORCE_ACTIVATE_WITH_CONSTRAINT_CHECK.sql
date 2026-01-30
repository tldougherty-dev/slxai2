-- Force Activate All Accounts - Handles Constraints
-- This script checks and works with any constraints
-- Run this in Supabase SQL Editor

-- Step 1: Check current status
SELECT 'BEFORE' as stage, 
  (SELECT COUNT(*) FROM members WHERE status = 'pending') as pending_members,
  (SELECT COUNT(*) FROM member_persons WHERE status = 'pending') as pending_persons;

-- Step 2: Check what values are allowed for status
-- First, let's see what the constraint allows
SELECT DISTINCT status 
FROM member_persons 
ORDER BY status;

SELECT DISTINCT status 
FROM members 
ORDER BY status;

-- Step 3: Try updating member_persons with explicit value
-- Using CASE to ensure we're setting a valid value
UPDATE member_persons
SET status = CASE 
  WHEN status = 'pending' THEN 'active'
  WHEN status IS NULL THEN 'active'
  ELSE status
END
WHERE status = 'pending' OR status IS NULL;

-- Step 4: Verify member_persons update
SELECT 'AFTER PERSONS' as stage,
  (SELECT COUNT(*) FROM member_persons WHERE status = 'pending') as pending_persons,
  (SELECT COUNT(*) FROM member_persons WHERE status = 'active') as active_persons,
  (SELECT COUNT(*) FROM member_persons WHERE status IS NULL) as null_persons;

-- Step 5: Update members with explicit value
UPDATE members
SET status = CASE 
  WHEN status = 'pending' THEN 'active'
  WHEN status IS NULL THEN 'active'
  ELSE status
END
WHERE status = 'pending' OR status IS NULL;

-- Step 6: Verify members update
SELECT 'AFTER MEMBERS' as stage,
  (SELECT COUNT(*) FROM members WHERE status = 'pending') as pending_members,
  (SELECT COUNT(*) FROM members WHERE status = 'active') as active_members,
  (SELECT COUNT(*) FROM members WHERE status IS NULL) as null_members;

-- Step 7: Final check - try direct update if still pending
-- Sometimes we need to be more explicit
UPDATE member_persons
SET status = 'active'
WHERE status != 'active' OR status IS NULL;

UPDATE members
SET status = 'active'
WHERE status != 'active' OR status IS NULL;

-- Step 8: Final verification
SELECT 
  'FINAL STATUS' as report,
  (SELECT COUNT(*) FROM members WHERE status = 'pending') as pending_members,
  (SELECT COUNT(*) FROM members WHERE status = 'active') as active_members,
  (SELECT COUNT(*) FROM member_persons WHERE status = 'pending') as pending_persons,
  (SELECT COUNT(*) FROM member_persons WHERE status = 'active') as active_persons,
  CASE 
    WHEN (SELECT COUNT(*) FROM members WHERE status = 'pending') = 0 
      AND (SELECT COUNT(*) FROM member_persons WHERE status = 'pending') = 0
    THEN '✅ SUCCESS - All accounts are active!'
    ELSE CONCAT('⚠️ WARNING - ', 
      (SELECT COUNT(*) FROM members WHERE status = 'pending'), 
      ' members and ', 
      (SELECT COUNT(*) FROM member_persons WHERE status = 'pending'),
      ' persons still pending')
  END as result;

-- Step 9: Show any remaining pending
SELECT 'REMAINING PENDING' as check_type, 
  'members' as table_name,
  COUNT(*) as count
FROM members
WHERE status = 'pending'
UNION ALL
SELECT 'REMAINING PENDING' as check_type,
  'member_persons' as table_name,
  COUNT(*) as count
FROM member_persons
WHERE status = 'pending';
