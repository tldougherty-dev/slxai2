-- Summit 2026 Schema
-- Workshop/Panel Submissions and Sponsor Submissions

-- Workshop/Panel Submissions Table
CREATE TABLE IF NOT EXISTS summit_workshop_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  submission_type TEXT NOT NULL CHECK (submission_type IN ('workshop', 'panel')),
  -- Multiple presenters stored as JSONB array
  presenters JSONB DEFAULT '[]'::jsonb,
  -- Legacy single presenter fields (for backward compatibility)
  presenter_name TEXT,
  presenter_email TEXT,
  presenter_bio TEXT,
  presenter_organization TEXT,
  learning_objectives TEXT,
  target_audience TEXT,
  duration_minutes INTEGER CHECK (duration_minutes > 0),
  max_participants INTEGER,
  technical_requirements TEXT,
  additional_info TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'under_review')),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by TEXT,
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sponsor Submissions Table
CREATE TABLE IF NOT EXISTS summit_sponsor_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  company_website TEXT,
  sponsorship_level TEXT CHECK (sponsorship_level IN ('platinum', 'gold', 'silver', 'bronze', 'other')),
  sponsorship_amount DECIMAL(10, 2),
  sponsorship_package_details TEXT,
  company_description TEXT,
  previous_sponsorship_experience TEXT,
  marketing_goals TEXT,
  additional_requests TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'under_review')),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by TEXT,
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_workshop_submissions_status ON summit_workshop_submissions(status);
CREATE INDEX IF NOT EXISTS idx_workshop_submissions_type ON summit_workshop_submissions(submission_type);
CREATE INDEX IF NOT EXISTS idx_workshop_submissions_submitted_at ON summit_workshop_submissions(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_workshop_submissions_presenters ON summit_workshop_submissions USING GIN (presenters);
CREATE INDEX IF NOT EXISTS idx_sponsor_submissions_status ON summit_sponsor_submissions(status);
CREATE INDEX IF NOT EXISTS idx_sponsor_submissions_submitted_at ON summit_sponsor_submissions(submitted_at DESC);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_summit_workshop_submissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_summit_sponsor_submissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_summit_workshop_submissions_updated_at ON summit_workshop_submissions;
CREATE TRIGGER update_summit_workshop_submissions_updated_at
  BEFORE UPDATE ON summit_workshop_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_summit_workshop_submissions_updated_at();

DROP TRIGGER IF EXISTS update_summit_sponsor_submissions_updated_at ON summit_sponsor_submissions;
CREATE TRIGGER update_summit_sponsor_submissions_updated_at
  BEFORE UPDATE ON summit_sponsor_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_summit_sponsor_submissions_updated_at();

-- RLS Policies
ALTER TABLE summit_workshop_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE summit_sponsor_submissions ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin or summit member
CREATE OR REPLACE FUNCTION check_user_is_admin_or_summit_member()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
  user_email TEXT;
BEGIN
  -- Get user role and email
  SELECT raw_user_meta_data->>'role', email INTO user_role, user_email
  FROM auth.users
  WHERE id = auth.uid();
  
  -- Check if admin
  IF COALESCE(user_role, '') IN ('admin', 'super_admin') THEN
    RETURN TRUE;
  END IF;
  
  -- Check if summit member
  IF EXISTS (
    SELECT 1 FROM summit_members
    WHERE summit_members.email = user_email
  ) THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;

GRANT EXECUTE ON FUNCTION check_user_is_admin_or_summit_member() TO authenticated;
GRANT EXECUTE ON FUNCTION check_user_is_admin_or_summit_member() TO anon;

-- Workshop Submissions Policies
DROP POLICY IF EXISTS "Anyone can submit workshops" ON summit_workshop_submissions;
CREATE POLICY "Anyone can submit workshops"
ON summit_workshop_submissions
FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view their own submissions" ON summit_workshop_submissions;
CREATE POLICY "Users can view their own submissions"
ON summit_workshop_submissions
FOR SELECT
TO authenticated
USING (
  presenter_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR check_user_is_admin_or_summit_member()
);

DROP POLICY IF EXISTS "Admins and summit members can manage submissions" ON summit_workshop_submissions;
CREATE POLICY "Admins and summit members can manage submissions"
ON summit_workshop_submissions
FOR ALL
TO authenticated
USING (check_user_is_admin_or_summit_member())
WITH CHECK (check_user_is_admin_or_summit_member());

-- Sponsor Submissions Policies
DROP POLICY IF EXISTS "Anyone can submit sponsorships" ON summit_sponsor_submissions;
CREATE POLICY "Anyone can submit sponsorships"
ON summit_sponsor_submissions
FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view their own sponsor submissions" ON summit_sponsor_submissions;
CREATE POLICY "Users can view their own sponsor submissions"
ON summit_sponsor_submissions
FOR SELECT
TO authenticated
USING (
  contact_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR check_user_is_admin_or_summit_member()
);

DROP POLICY IF EXISTS "Admins and summit members can manage sponsor submissions" ON summit_sponsor_submissions;
CREATE POLICY "Admins and summit members can manage sponsor submissions"
ON summit_sponsor_submissions
FOR ALL
TO authenticated
USING (check_user_is_admin_or_summit_member())
WITH CHECK (check_user_is_admin_or_summit_member());

-- Migrate any existing single presenter data to the new JSONB format (if table already exists)
DO $$
BEGIN
  -- Only migrate if there are rows with empty presenters array
  IF EXISTS (
    SELECT 1 FROM summit_workshop_submissions 
    WHERE (presenters = '[]'::jsonb OR presenters IS NULL) 
    AND presenter_name IS NOT NULL
  ) THEN
    UPDATE summit_workshop_submissions
    SET presenters = jsonb_build_array(
      jsonb_build_object(
        'name', presenter_name,
        'email', presenter_email,
        'bio', presenter_bio,
        'organization', presenter_organization
      )
    )
    WHERE (presenters = '[]'::jsonb OR presenters IS NULL) 
    AND presenter_name IS NOT NULL;
  END IF;
END $$;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

