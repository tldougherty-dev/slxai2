-- Robust Force Activation Script
-- This script will definitely activate all accounts
-- Run this in Supabase SQL Editor

-- Step 1: Show current counts
SELECT 'BEFORE' as stage, 
  (SELECT COUNT(*) FROM members WHERE status = 'pending') as pending_members,
  (SELECT COUNT(*) FROM member_persons WHERE status = 'pending') as pending_persons;

-- Step 2: Force activate ALL member_persons (no conditions)
UPDATE member_persons
SET status = 'active'
WHERE status = 'pending' OR status IS NULL;

-- Step 3: Verify member_persons update
SELECT 'AFTER PERSONS UPDATE' as stage,
  (SELECT COUNT(*) FROM member_persons WHERE status = 'pending') as pending_persons,
  (SELECT COUNT(*) FROM member_persons WHERE status = 'active') as active_persons;

-- Step 4: Force activate ALL members (no conditions)
UPDATE members
SET status = 'active'
WHERE status = 'pending' OR status IS NULL;

-- Step 5: Verify members update
SELECT 'AFTER MEMBERS UPDATE' as stage,
  (SELECT COUNT(*) FROM members WHERE status = 'pending') as pending_members,
  (SELECT COUNT(*) FROM members WHERE status = 'active') as active_members;

-- Step 6: Final verification - should all be active now
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
    ELSE '⚠️ WARNING - Some accounts still pending'
  END as result;

-- Step 7: Show any remaining pending (should be empty)
SELECT 'REMAINING PENDING MEMBERS' as check_type, id, organization_name, status
FROM members
WHERE status = 'pending';

SELECT 'REMAINING PENDING PERSONS' as check_type, id, name, email, status
FROM member_persons
WHERE status = 'pending';
