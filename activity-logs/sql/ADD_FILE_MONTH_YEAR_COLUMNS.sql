-- Add file_month and file_year columns to files table
-- Run this in Supabase SQL Editor

-- Add file_month column (optional, integer 1-12)
ALTER TABLE files 
ADD COLUMN IF NOT EXISTS file_month INTEGER CHECK (file_month >= 1 AND file_month <= 12);

-- Add file_year column (required, integer)
ALTER TABLE files 
ADD COLUMN IF NOT EXISTS file_year INTEGER CHECK (file_year >= 1900 AND file_year <= 2100);

-- Add comments for documentation
COMMENT ON COLUMN files.file_month IS 'Optional month (1-12) when the file was created or is relevant';
COMMENT ON COLUMN files.file_year IS 'Required year when the file was created or is relevant';

-- Add authors column (optional, JSONB array of strings)
ALTER TABLE files 
ADD COLUMN IF NOT EXISTS authors JSONB DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN files.authors IS 'Optional array of author names';

-- Create index for faster filtering/sorting by year
CREATE INDEX IF NOT EXISTS idx_files_file_year ON files(file_year);
CREATE INDEX IF NOT EXISTS idx_files_file_month_year ON files(file_month, file_year);

