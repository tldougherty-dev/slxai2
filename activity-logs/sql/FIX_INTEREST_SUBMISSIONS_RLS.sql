-- Fix Interest Submissions RLS Policies
-- Run this in Supabase SQL Editor to fix the "failed to load" error

-- Step 1: Ensure the table exists with email column and approval fields
-- If table exists but columns are missing, add them
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'interest_submissions') THEN
    -- Table exists, check if email column exists
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'interest_submissions' AND column_name = 'email'
    ) THEN
      ALTER TABLE interest_submissions ADD COLUMN email TEXT NOT NULL DEFAULT '';
      -- Update existing rows (if any) - you may need to manually set emails
      UPDATE interest_submissions SET email = '' WHERE email IS NULL OR email = '';
    END IF;
    
    -- Add approval columns if they don't exist
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'interest_submissions' AND column_name = 'approved'
    ) THEN
      ALTER TABLE interest_submissions ADD COLUMN approved BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'interest_submissions' AND column_name = 'approved_at'
    ) THEN
      ALTER TABLE interest_submissions ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'interest_submissions' AND column_name = 'approved_by'
    ) THEN
      ALTER TABLE interest_submissions ADD COLUMN approved_by TEXT;
    END IF;
  ELSE
    -- Table doesn't exist, create it
    CREATE TABLE interest_submissions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      organization TEXT NOT NULL,
      reason TEXT NOT NULL,
      approved BOOLEAN DEFAULT FALSE,
      approved_at TIMESTAMP WITH TIME ZONE,
      approved_by TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    CREATE INDEX IF NOT EXISTS idx_interest_submissions_created_at ON interest_submissions(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_interest_submissions_organization ON interest_submissions(organization);
    CREATE INDEX IF NOT EXISTS idx_interest_submissions_email ON interest_submissions(email);
  END IF;
END $$;

-- Step 2: Ensure check_user_is_admin() function exists
CREATE OR REPLACE FUNCTION check_user_is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Access auth.users with SECURITY DEFINER privileges
  SELECT raw_user_meta_data->>'role' INTO user_role
  FROM auth.users
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_role, '') IN ('admin', 'super_admin');
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION check_user_is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION check_user_is_admin() TO anon;

-- Step 3: Enable RLS
ALTER TABLE interest_submissions ENABLE ROW LEVEL SECURITY;

-- Step 4: Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can submit interest forms" ON interest_submissions;
DROP POLICY IF EXISTS "Admins can view all submissions" ON interest_submissions;
DROP POLICY IF EXISTS "Admins can delete submissions" ON interest_submissions;

-- Step 5: Create new policies using the helper function
CREATE POLICY "Anyone can submit interest forms"
  ON interest_submissions
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Admins can view all submissions"
  ON interest_submissions
  FOR SELECT
  TO authenticated
  USING (check_user_is_admin());

CREATE POLICY "Admins can delete submissions"
  ON interest_submissions
  FOR DELETE
  TO authenticated
  USING (check_user_is_admin());

-- Step 6: Verify the setup
-- Check if you're an admin (replace with your email)
-- SELECT 
--   email,
--   raw_user_meta_data->>'role' as role,
--   check_user_is_admin() as is_admin_check
-- FROM auth.users
-- WHERE email = 'your-admin-email@example.com';

