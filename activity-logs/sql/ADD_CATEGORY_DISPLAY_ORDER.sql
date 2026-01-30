-- Add display_order column to file_categories table if it doesn't exist
-- Run this in your Supabase SQL Editor

-- Check if column exists and add it if it doesn't
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'file_categories' 
    AND column_name = 'display_order'
  ) THEN
    ALTER TABLE file_categories ADD COLUMN display_order INTEGER DEFAULT 0;
    
    -- Update existing rows to have display_order based on created_at
    UPDATE file_categories 
    SET display_order = (
      SELECT row_number() OVER (ORDER BY created_at ASC)
      FROM file_categories f2
      WHERE f2.id = file_categories.id
    );
    
    -- Create index for faster ordering queries
    CREATE INDEX IF NOT EXISTS idx_file_categories_display_order ON file_categories(display_order);
    
    RAISE NOTICE 'display_order column added successfully to file_categories';
  ELSE
    RAISE NOTICE 'display_order column already exists in file_categories';
  END IF;
END $$;

