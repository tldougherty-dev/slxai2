-- Bulk Verify All Pending Accounts
-- This script will verify all pending user emails and activate their accounts
-- Run this in Supabase SQL Editor
-- WARNING: This will verify ALL unconfirmed emails. Use with caution!

-- Step 1: Create a function to bulk verify emails
-- This function sets email_confirmed_at for all users with unconfirmed emails
CREATE OR REPLACE FUNCTION bulk_verify_pending_emails()
RETURNS TABLE (
  email TEXT,
  verified BOOLEAN,
  user_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  user_record RECORD;
  verified_count INTEGER := 0;
BEGIN
  -- Update all users with unconfirmed emails
  FOR user_record IN 
    SELECT au.id, au.email, au.email_confirmed_at
    FROM auth.users au
    WHERE au.email_confirmed_at IS NULL
    AND au.email IS NOT NULL
  LOOP
    -- Set email_confirmed_at to current timestamp
    UPDATE auth.users
    SET email_confirmed_at = NOW()
    WHERE id = user_record.id;
    
    verified_count := verified_count + 1;
    
    -- Return the verified email
    RETURN QUERY SELECT user_record.email::TEXT, TRUE, user_record.id;
  END LOOP;
  
  -- Log the count
  RAISE NOTICE 'Verified % pending email(s)', verified_count;
END;
$$;

-- Step 2: Execute the function to verify all pending emails
SELECT * FROM bulk_verify_pending_emails();

-- Step 3: Update member_persons status to 'active' for all verified emails
UPDATE member_persons mp
SET status = 'active'
WHERE status = 'pending'
AND EXISTS (
  SELECT 1 
  FROM auth.users au 
  WHERE au.email = mp.email 
  AND au.email_confirmed_at IS NOT NULL
);

-- Step 4: Update members status to 'active' if ANY of their persons are now active
UPDATE members m
SET status = 'active'
WHERE status = 'pending'
AND EXISTS (
  SELECT 1 
  FROM member_persons mp 
  WHERE mp.member_id = m.id 
  AND mp.status = 'active'
);

-- Step 5: Also update members based on POC email confirmation
UPDATE members m
SET status = 'active'
WHERE status = 'pending'
AND EXISTS (
  SELECT 1 
  FROM auth.users au 
  WHERE au.email = m.poc_email 
  AND au.email_confirmed_at IS NOT NULL
);

-- Step 6: Show summary of verified accounts
SELECT 
  'Summary' as report_type,
  COUNT(*) FILTER (WHERE email_confirmed_at IS NOT NULL) as verified_users,
  COUNT(*) FILTER (WHERE email_confirmed_at IS NULL) as pending_users,
  COUNT(*) as total_users
FROM auth.users
WHERE email IS NOT NULL;

-- Step 7: Show updated member statuses
SELECT 
  'Members Status' as report_type,
  COUNT(*) FILTER (WHERE status = 'active') as active_members,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_members,
  COUNT(*) as total_members
FROM members;

-- Step 8: Show updated member_persons statuses
SELECT 
  'Member Persons Status' as report_type,
  COUNT(*) FILTER (WHERE status = 'active') as active_persons,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_persons,
  COUNT(*) as total_persons
FROM member_persons;

-- Step 9: Clean up - drop the function (optional, can keep for future use)
-- DROP FUNCTION IF EXISTS bulk_verify_pending_emails();
