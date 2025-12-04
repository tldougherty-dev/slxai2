-- Update Summit 2026 Schema to Support Multiple Presenters/Panel Members
-- This migration adds support for multiple presenters/panel members

-- Add a JSONB column to store multiple presenters
ALTER TABLE summit_workshop_submissions 
ADD COLUMN IF NOT EXISTS presenters JSONB DEFAULT '[]'::jsonb;

-- Migrate existing single presenter data to the new JSONB format
UPDATE summit_workshop_submissions
SET presenters = jsonb_build_array(
  jsonb_build_object(
    'name', presenter_name,
    'email', presenter_email,
    'bio', presenter_bio,
    'organization', presenter_organization
  )
)
WHERE presenters = '[]'::jsonb OR presenters IS NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_workshop_submissions_presenters ON summit_workshop_submissions USING GIN (presenters);

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

