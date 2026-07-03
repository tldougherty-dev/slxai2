-- SLxAI Academy Schema
-- Live, interactive Zoom workshops in sign language

CREATE TABLE IF NOT EXISTS academy_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  icon TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS academy_presenters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  bio TEXT NOT NULL DEFAULT '',
  organization TEXT,
  email TEXT NOT NULL,
  sign_language TEXT NOT NULL DEFAULT 'ASL',
  avatar_url TEXT,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS academy_workshop_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  skill_level TEXT NOT NULL CHECK (skill_level IN ('beginner', 'intermediate', 'advanced', 'all_levels')),
  ai_tools TEXT[] NOT NULL DEFAULT '{}',
  sign_language TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  presenter_name TEXT NOT NULL,
  presenter_bio TEXT NOT NULL,
  presenter_organization TEXT,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'under_review')),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by TEXT,
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS academy_workshops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES academy_categories(id) ON DELETE SET NULL,
  presenter_id UUID REFERENCES academy_presenters(id) ON DELETE SET NULL,
  submission_id UUID REFERENCES academy_workshop_submissions(id) ON DELETE SET NULL,
  skill_level TEXT NOT NULL CHECK (skill_level IN ('beginner', 'intermediate', 'advanced', 'all_levels')),
  ai_tools TEXT[] NOT NULL DEFAULT '{}',
  sign_language TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  learning_objectives TEXT[] NOT NULL DEFAULT '{}',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  zoom_url TEXT,
  zoom_meeting_id TEXT,
  zoom_passcode TEXT,
  recording_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'completed', 'cancelled')),
  max_participants INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS academy_workshop_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id UUID NOT NULL REFERENCES academy_workshops(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  file_type TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS academy_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id UUID NOT NULL REFERENCES academy_workshops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  organization TEXT,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (workshop_id, email)
);

CREATE TABLE IF NOT EXISTS academy_email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id UUID REFERENCES academy_workshops(id) ON DELETE SET NULL,
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  email_type TEXT NOT NULL CHECK (email_type IN ('registration_confirmation', 'reminder', 'custom')),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'queued'))
);

CREATE INDEX IF NOT EXISTS idx_academy_workshops_status ON academy_workshops(status);
CREATE INDEX IF NOT EXISTS idx_academy_workshops_scheduled ON academy_workshops(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_academy_submissions_status ON academy_workshop_submissions(status);
CREATE INDEX IF NOT EXISTS idx_academy_registrations_workshop ON academy_registrations(workshop_id);
CREATE INDEX IF NOT EXISTS idx_academy_presenters_featured ON academy_presenters(featured);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_academy_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_academy_presenters_updated_at ON academy_presenters;
CREATE TRIGGER update_academy_presenters_updated_at
  BEFORE UPDATE ON academy_presenters
  FOR EACH ROW EXECUTE FUNCTION update_academy_updated_at();

DROP TRIGGER IF EXISTS update_academy_workshop_submissions_updated_at ON academy_workshop_submissions;
CREATE TRIGGER update_academy_workshop_submissions_updated_at
  BEFORE UPDATE ON academy_workshop_submissions
  FOR EACH ROW EXECUTE FUNCTION update_academy_updated_at();

DROP TRIGGER IF EXISTS update_academy_workshops_updated_at ON academy_workshops;
CREATE TRIGGER update_academy_workshops_updated_at
  BEFORE UPDATE ON academy_workshops
  FOR EACH ROW EXECUTE FUNCTION update_academy_updated_at();

-- RLS
ALTER TABLE academy_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_presenters ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_workshop_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_workshop_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_email_logs ENABLE ROW LEVEL SECURITY;

-- Public read for published content
CREATE POLICY "Public can view categories" ON academy_categories FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Public can view presenters" ON academy_presenters FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Public can view scheduled workshops" ON academy_workshops FOR SELECT TO authenticated, anon
  USING (status IN ('scheduled', 'completed'));
CREATE POLICY "Public can view workshop resources" ON academy_workshop_resources FOR SELECT TO authenticated, anon USING (true);

-- Anyone can submit proposals and register
CREATE POLICY "Anyone can submit workshop proposals" ON academy_workshop_submissions FOR INSERT TO authenticated, anon WITH CHECK (true);
CREATE POLICY "Anyone can register for workshops" ON academy_registrations FOR INSERT TO authenticated, anon WITH CHECK (true);

-- Admin policies (reuse check_user_is_admin if available)
CREATE POLICY "Admins manage categories" ON academy_categories FOR ALL TO authenticated
  USING (check_user_is_admin()) WITH CHECK (check_user_is_admin());
CREATE POLICY "Admins manage presenters" ON academy_presenters FOR ALL TO authenticated
  USING (check_user_is_admin()) WITH CHECK (check_user_is_admin());
CREATE POLICY "Admins view submissions" ON academy_workshop_submissions FOR SELECT TO authenticated USING (check_user_is_admin());
CREATE POLICY "Admins update submissions" ON academy_workshop_submissions FOR UPDATE TO authenticated
  USING (check_user_is_admin()) WITH CHECK (check_user_is_admin());
CREATE POLICY "Admins manage workshops" ON academy_workshops FOR ALL TO authenticated
  USING (check_user_is_admin()) WITH CHECK (check_user_is_admin());
CREATE POLICY "Admins manage resources" ON academy_workshop_resources FOR ALL TO authenticated
  USING (check_user_is_admin()) WITH CHECK (check_user_is_admin());
CREATE POLICY "Admins view registrations" ON academy_registrations FOR SELECT TO authenticated USING (check_user_is_admin());
CREATE POLICY "Admins manage email logs" ON academy_email_logs FOR ALL TO authenticated
  USING (check_user_is_admin()) WITH CHECK (check_user_is_admin());
