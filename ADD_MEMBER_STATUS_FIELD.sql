-- Add status field to members table for pending/active status
-- Run this in Supabase SQL Editor

-- Step 1: Add status column to members table
ALTER TABLE members 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active'));

-- Step 2: Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);

-- Step 3: Update existing members to 'active' if they don't have a status
UPDATE members 
SET status = 'active' 
WHERE status IS NULL;

-- Step 4: Set NOT NULL constraint after updating existing rows
ALTER TABLE members 
ALTER COLUMN status SET NOT NULL;

-- Step 5: Add comment for documentation
COMMENT ON COLUMN members.status IS 'Member status: pending (approved but not signed up) or active (signed up and email confirmed)';

