-- Fix category_id column type in files table
-- Run this in your Supabase SQL Editor

-- Step 1: Drop the foreign key constraint if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'files_category_fk' 
    AND table_name = 'files'
  ) THEN
    ALTER TABLE files DROP CONSTRAINT files_category_fk;
    RAISE NOTICE 'Foreign key constraint files_category_fk dropped';
  ELSE
    RAISE NOTICE 'Foreign key constraint files_category_fk does not exist';
  END IF;
END $$;

-- Step 2: Change category_id from UUID to TEXT to match category IDs like "meeting-minutes", "research", etc.
-- First, clear any existing UUID values (they won't convert properly)
UPDATE files SET category_id = NULL WHERE category_id IS NOT NULL;

-- Now change the column type
ALTER TABLE files 
ALTER COLUMN category_id TYPE TEXT USING category_id::TEXT;

-- Step 3: Verify the change
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'files' AND column_name = 'category_id';

