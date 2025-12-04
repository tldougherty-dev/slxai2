-- Add status field to member_persons table for pending/active status
-- Run this in Supabase SQL Editor

-- Step 1: Add status column to member_persons table
ALTER TABLE member_persons 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active'));

-- Step 2: Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_member_persons_status ON member_persons(status);

-- Step 3: Update existing member persons to 'active' if they don't have a status
UPDATE member_persons 
SET status = 'active' 
WHERE status IS NULL;

-- Step 4: Set NOT NULL constraint after updating existing rows
ALTER TABLE member_persons 
ALTER COLUMN status SET NOT NULL;

-- Step 5: Add comment for documentation
COMMENT ON COLUMN member_persons.status IS 'Person status: pending (approved but not signed up) or active (signed up and email confirmed)';

