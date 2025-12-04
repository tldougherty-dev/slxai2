-- Sync member and member_person status based on actual Supabase email confirmation
-- Run this in Supabase SQL Editor to fix existing records

-- Step 1: Create a function to check if email is confirmed
CREATE OR REPLACE FUNCTION check_email_confirmed(user_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  confirmed_at TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT email_confirmed_at INTO confirmed_at
  FROM auth.users
  WHERE email = user_email;
  
  RETURN confirmed_at IS NOT NULL;
END;
$$;

-- Step 2: Update member_persons status based on email confirmation
UPDATE member_persons mp
SET status = CASE 
  WHEN check_email_confirmed(mp.email) THEN 'active'
  ELSE 'pending'
END
WHERE status IS NOT NULL;

-- Step 3: Update members status based on their POC email confirmation
UPDATE members m
SET status = CASE 
  WHEN check_email_confirmed(m.poc_email) THEN 'active'
  ELSE 'pending'
END
WHERE status IS NOT NULL;

-- Step 4: Drop the temporary function (optional, can keep it for future use)
-- DROP FUNCTION IF EXISTS check_email_confirmed(TEXT);

