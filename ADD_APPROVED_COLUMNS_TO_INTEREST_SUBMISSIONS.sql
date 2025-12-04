-- Add approved columns to interest_submissions table
-- Run this in Supabase SQL Editor if the table exists but is missing the approved columns

-- Check if columns exist and add them if they don't
DO $$ 
BEGIN
  -- Add approved column
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'interest_submissions' 
    AND column_name = 'approved'
  ) THEN
    ALTER TABLE interest_submissions ADD COLUMN approved BOOLEAN DEFAULT FALSE;
    RAISE NOTICE 'Added approved column to interest_submissions';
  ELSE
    RAISE NOTICE 'approved column already exists in interest_submissions';
  END IF;

  -- Add approved_at column
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'interest_submissions' 
    AND column_name = 'approved_at'
  ) THEN
    ALTER TABLE interest_submissions ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;
    RAISE NOTICE 'Added approved_at column to interest_submissions';
  ELSE
    RAISE NOTICE 'approved_at column already exists in interest_submissions';
  END IF;

  -- Add approved_by column
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'interest_submissions' 
    AND column_name = 'approved_by'
  ) THEN
    ALTER TABLE interest_submissions ADD COLUMN approved_by TEXT;
    RAISE NOTICE 'Added approved_by column to interest_submissions';
  ELSE
    RAISE NOTICE 'approved_by column already exists in interest_submissions';
  END IF;

  -- Update existing rows to have approved = false if null
  UPDATE interest_submissions SET approved = FALSE WHERE approved IS NULL;
END $$;

-- Add UPDATE policy for admins to approve submissions
DROP POLICY IF EXISTS "Admins can update submissions" ON interest_submissions;
CREATE POLICY "Admins can update submissions"
  ON interest_submissions
  FOR UPDATE
  TO authenticated
  USING (check_user_is_admin())
  WITH CHECK (check_user_is_admin());

