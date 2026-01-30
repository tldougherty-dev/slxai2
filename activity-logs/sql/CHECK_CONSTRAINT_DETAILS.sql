-- Check What the Status Constraint Actually Does
-- Run this to see the constraint definition

-- Check the constraint definition for member_persons
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'member_persons'::regclass
AND conname LIKE '%status%';

-- Also check members table constraints
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'members'::regclass
AND conname LIKE '%status%';

-- Check all constraints on member_persons
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'member_persons'::regclass
ORDER BY conname;

-- Check all constraints on members
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'members'::regclass
ORDER BY conname;
