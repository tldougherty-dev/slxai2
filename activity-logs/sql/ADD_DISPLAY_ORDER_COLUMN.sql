-- Add display_order column to files table if it doesn't exist
-- Run this in your Supabase SQL Editor

-- Check if column exists and add it if it doesn't
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'files' 
    AND column_name = 'display_order'
  ) THEN
    ALTER TABLE files ADD COLUMN display_order INTEGER DEFAULT 0;
    
    -- Update existing rows to have display_order based on created_at
    UPDATE files 
    SET display_order = (
      SELECT row_number() OVER (ORDER BY created_at DESC)
      FROM files f2
      WHERE f2.id = files.id
    );
    
    -- Create index for faster ordering queries
    CREATE INDEX IF NOT EXISTS idx_files_display_order ON files(display_order);
    
    RAISE NOTICE 'display_order column added successfully';
  ELSE
    RAISE NOTICE 'display_order column already exists';
  END IF;
END $$;

