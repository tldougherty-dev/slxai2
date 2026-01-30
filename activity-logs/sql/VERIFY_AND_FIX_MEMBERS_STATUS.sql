-- Verify and Fix Members Status
-- Check if members table status matches member_persons status

-- Check 1: Show members with their status and person counts
SELECT 
  m.id,
  m.organization_name,
  m.status as member_status,
  COUNT(mp.id) FILTER (WHERE mp.status = 'active') as active_persons,
  COUNT(mp.id) FILTER (WHERE mp.status = 'pending') as pending_persons,
  COUNT(mp.id) as total_persons
FROM members m
LEFT JOIN member_persons mp ON mp.member_id = m.id
GROUP BY m.id, m.organization_name, m.status
HAVING m.status = 'pending'
ORDER BY m.organization_name;

-- Check 2: Show members that should be active (have active persons but status is pending)
SELECT 
  m.id,
  m.organization_name,
  m.status as current_status,
  COUNT(mp.id) FILTER (WHERE mp.status = 'active') as active_persons_count,
  'Should be active' as recommendation
FROM members m
LEFT JOIN member_persons mp ON mp.member_id = m.id
WHERE m.status = 'pending'
GROUP BY m.id, m.organization_name, m.status
HAVING COUNT(mp.id) FILTER (WHERE mp.status = 'active') > 0
ORDER BY m.organization_name;

-- Fix: Activate all members that have at least one active person
UPDATE members m
SET status = 'active'
WHERE m.status = 'pending'
AND EXISTS (
  SELECT 1 
  FROM member_persons mp 
  WHERE mp.member_id = m.id 
  AND mp.status = 'active'
);

-- Verify: Show final status
SELECT 
  'Final Status' as report,
  COUNT(*) FILTER (WHERE status = 'active') as active_members,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_members,
  COUNT(*) as total_members
FROM members;

-- Show any remaining pending members
SELECT 
  m.id,
  m.organization_name,
  m.status,
  COUNT(mp.id) FILTER (WHERE mp.status = 'active') as active_persons,
  COUNT(mp.id) FILTER (WHERE mp.status = 'pending') as pending_persons
FROM members m
LEFT JOIN member_persons mp ON mp.member_id = m.id
WHERE m.status = 'pending'
GROUP BY m.id, m.organization_name, m.status
ORDER BY m.organization_name;
