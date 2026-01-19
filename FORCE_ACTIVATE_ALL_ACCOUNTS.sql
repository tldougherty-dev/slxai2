-- Force Activate All Members, Organizations, and Individuals
-- This script sets ALL pending accounts to active status
-- Run this in Supabase SQL Editor
-- No email verification required - just activates everything

-- Step 1: Show current status before activation
SELECT 
  'Before Activation' as stage,
  (SELECT COUNT(*) FROM members WHERE status = 'pending') as pending_members,
  (SELECT COUNT(*) FROM members WHERE status = 'active') as active_members,
  (SELECT COUNT(*) FROM member_persons WHERE status = 'pending') as pending_persons,
  (SELECT COUNT(*) FROM member_persons WHERE status = 'active') as active_persons;

-- Step 2: Force activate ALL pending member_persons
UPDATE member_persons
SET status = 'active'
WHERE status = 'pending';

-- Step 3: Force activate ALL pending members (organizations)
UPDATE members
SET status = 'active'
WHERE status = 'pending';

-- Step 4: Show final status after activation
SELECT 
  'After Activation' as stage,
  (SELECT COUNT(*) FROM members WHERE status = 'pending') as pending_members,
  (SELECT COUNT(*) FROM members WHERE status = 'active') as active_members,
  (SELECT COUNT(*) FROM member_persons WHERE status = 'pending') as pending_persons,
  (SELECT COUNT(*) FROM member_persons WHERE status = 'active') as active_persons;

-- Step 5: Verify - should show 0 pending for both
SELECT 
  'Verification' as check_type,
  CASE 
    WHEN (SELECT COUNT(*) FROM members WHERE status = 'pending') = 0 
      AND (SELECT COUNT(*) FROM member_persons WHERE status = 'pending') = 0
    THEN '✅ All accounts are now active!'
    ELSE '⚠️ Some accounts are still pending'
  END as status,
  (SELECT COUNT(*) FROM members WHERE status = 'pending') as remaining_pending_members,
  (SELECT COUNT(*) FROM member_persons WHERE status = 'pending') as remaining_pending_persons;
