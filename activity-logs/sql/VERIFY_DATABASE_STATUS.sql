-- Verify Actual Database Status
-- Run this to see what's actually in the database

-- Check members table
SELECT 
  'Members Table' as table_name,
  status,
  COUNT(*) as count
FROM members
GROUP BY status
ORDER BY status;

-- Check member_persons table
SELECT 
  'Member Persons Table' as table_name,
  status,
  COUNT(*) as count
FROM member_persons
GROUP BY status
ORDER BY status;

-- Show some examples
SELECT 
  'Sample Members' as check_type,
  id,
  organization_name,
  status,
  poc_email
FROM members
ORDER BY status, organization_name
LIMIT 10;

SELECT 
  'Sample Member Persons' as check_type,
  id,
  name,
  email,
  status,
  member_id
FROM member_persons
ORDER BY status, email
LIMIT 10;
