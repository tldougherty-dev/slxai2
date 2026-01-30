-- Add display_order column to channels table if it doesn't exist
-- Run this in your Supabase SQL Editor

-- Check if column exists and add it if it doesn't
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'channels' 
    AND column_name = 'display_order'
  ) THEN
    ALTER TABLE channels ADD COLUMN display_order INTEGER DEFAULT 0;
    
    -- Update existing rows to have display_order based on created_at
    UPDATE channels 
    SET display_order = (
      SELECT row_number() OVER (ORDER BY created_at ASC)
      FROM channels c2
      WHERE c2.id = channels.id
    );
    
    -- Create index for faster ordering queries
    CREATE INDEX IF NOT EXISTS idx_channels_display_order ON channels(display_order);
    
    RAISE NOTICE 'display_order column added successfully to channels';
  ELSE
    RAISE NOTICE 'display_order column already exists in channels';
  END IF;
END $$;

