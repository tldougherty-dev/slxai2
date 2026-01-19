-- Check Why Accounts Are Still Pending
-- Run this to diagnose the issue

-- Check 1: Verify the status column exists and has data
SELECT 
  'Members Table Check' as check_type,
  COUNT(*) as total_members,
  COUNT(*) FILTER (WHERE status = 'active') as active_count,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
  COUNT(*) FILTER (WHERE status IS NULL) as null_status_count
FROM members;

-- Check 2: Verify member_persons status column
SELECT 
  'Member Persons Table Check' as check_type,
  COUNT(*) as total_persons,
  COUNT(*) FILTER (WHERE status = 'active') as active_count,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
  COUNT(*) FILTER (WHERE status IS NULL) as null_status_count
FROM member_persons;

-- Check 3: Show actual pending members with their IDs
SELECT 
  id,
  organization_name,
  status,
  created_at
FROM members
WHERE status = 'pending'
ORDER BY organization_name
LIMIT 10;

-- Check 4: Show actual pending persons with their IDs
SELECT 
  id,
  name,
  email,
  status,
  member_id
FROM member_persons
WHERE status = 'pending'
ORDER BY email
LIMIT 10;

-- Check 5: Try to see if there are any constraints or triggers
SELECT 
  constraint_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'members'
AND constraint_type = 'CHECK';

SELECT 
  constraint_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'member_persons'
AND constraint_type = 'CHECK';
