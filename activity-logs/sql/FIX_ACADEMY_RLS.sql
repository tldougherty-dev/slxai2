-- Fix Academy RLS Policies
-- Run this in Supabase SQL Editor to fix workshop proposal and registration submissions.
--
-- Root causes addressed:
-- 1. INSERT policies existed but SELECT-after-INSERT failed (client used .select().single())
-- 2. Missing explicit GRANTs for anon/authenticated roles
-- 3. academy_email_logs had no public INSERT policy (registration confirmation logging)
-- 4. check_user_is_admin() / get_user_email() may be missing or lack EXECUTE grants

-- ============================================================================
-- STEP 1: Helper functions
-- ============================================================================

CREATE OR REPLACE FUNCTION check_user_is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT raw_user_meta_data->>'role' INTO user_role
  FROM auth.users
  WHERE id = auth.uid();

  RETURN COALESCE(user_role, '') IN ('admin', 'super_admin');
END;
$$;

CREATE OR REPLACE FUNCTION get_user_email()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email TEXT;
BEGIN
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = auth.uid();

  RETURN user_email;
END;
$$;

GRANT EXECUTE ON FUNCTION check_user_is_admin() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_user_email() TO authenticated, anon;

-- ============================================================================
-- STEP 2: Enable RLS on all academy tables
-- ============================================================================

ALTER TABLE academy_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_presenters ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_workshop_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_workshop_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_email_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 3: Drop existing policies (idempotent)
-- ============================================================================

-- Categories
DROP POLICY IF EXISTS "Public can view categories" ON academy_categories;
DROP POLICY IF EXISTS "Admins manage categories" ON academy_categories;

-- Presenters
DROP POLICY IF EXISTS "Public can view presenters" ON academy_presenters;
DROP POLICY IF EXISTS "Admins manage presenters" ON academy_presenters;

-- Submissions
DROP POLICY IF EXISTS "Anyone can submit workshop proposals" ON academy_workshop_submissions;
DROP POLICY IF EXISTS "Users can view their own workshop proposals" ON academy_workshop_submissions;
DROP POLICY IF EXISTS "Admins view submissions" ON academy_workshop_submissions;
DROP POLICY IF EXISTS "Admins update submissions" ON academy_workshop_submissions;
DROP POLICY IF EXISTS "Admins manage submissions" ON academy_workshop_submissions;

-- Workshops
DROP POLICY IF EXISTS "Public can view scheduled workshops" ON academy_workshops;
DROP POLICY IF EXISTS "Admins manage workshops" ON academy_workshops;

-- Resources
DROP POLICY IF EXISTS "Public can view workshop resources" ON academy_workshop_resources;
DROP POLICY IF EXISTS "Admins manage resources" ON academy_workshop_resources;

-- Registrations
DROP POLICY IF EXISTS "Anyone can register for workshops" ON academy_registrations;
DROP POLICY IF EXISTS "Users can view their own registrations" ON academy_registrations;
DROP POLICY IF EXISTS "Admins view registrations" ON academy_registrations;
DROP POLICY IF EXISTS "Admins manage registrations" ON academy_registrations;

-- Email logs
DROP POLICY IF EXISTS "Anyone can log registration emails" ON academy_email_logs;
DROP POLICY IF EXISTS "Admins manage email logs" ON academy_email_logs;

-- ============================================================================
-- STEP 4: Public read policies (catalog)
-- ============================================================================

CREATE POLICY "Public can view categories"
  ON academy_categories
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Public can view presenters"
  ON academy_presenters
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Public can view scheduled workshops"
  ON academy_workshops
  FOR SELECT
  TO authenticated, anon
  USING (status IN ('scheduled', 'completed'));

CREATE POLICY "Public can view workshop resources"
  ON academy_workshop_resources
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- ============================================================================
-- STEP 5: Workshop proposal submissions
-- ============================================================================

CREATE POLICY "Anyone can submit workshop proposals"
  ON academy_workshop_submissions
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Allow SELECT only for own contact email, very recent inserts, or admins.
-- Supports insert+select clients; public forms should prefer insert-only (see academy.ts).
CREATE POLICY "Users can view their own workshop proposals"
  ON academy_workshop_submissions
  FOR SELECT
  TO authenticated, anon
  USING (
    contact_email = get_user_email()
    OR submitted_at >= NOW() - INTERVAL '5 minutes'
    OR check_user_is_admin()
  );

CREATE POLICY "Admins manage submissions"
  ON academy_workshop_submissions
  FOR ALL
  TO authenticated
  USING (check_user_is_admin())
  WITH CHECK (check_user_is_admin());

-- ============================================================================
-- STEP 6: Workshop registrations
-- ============================================================================

CREATE POLICY "Anyone can register for workshops"
  ON academy_registrations
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Users can view their own registrations"
  ON academy_registrations
  FOR SELECT
  TO authenticated, anon
  USING (
    email = get_user_email()
    OR registered_at >= NOW() - INTERVAL '5 minutes'
    OR check_user_is_admin()
  );

CREATE POLICY "Admins manage registrations"
  ON academy_registrations
  FOR ALL
  TO authenticated
  USING (check_user_is_admin())
  WITH CHECK (check_user_is_admin());

-- ============================================================================
-- STEP 7: Email logs (registration confirmations only for non-admins)
-- ============================================================================

CREATE POLICY "Anyone can log registration emails"
  ON academy_email_logs
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (email_type = 'registration_confirmation');

CREATE POLICY "Admins manage email logs"
  ON academy_email_logs
  FOR ALL
  TO authenticated
  USING (check_user_is_admin())
  WITH CHECK (check_user_is_admin());

-- ============================================================================
-- STEP 8: Admin management for catalog tables
-- ============================================================================

CREATE POLICY "Admins manage categories"
  ON academy_categories
  FOR ALL
  TO authenticated
  USING (check_user_is_admin())
  WITH CHECK (check_user_is_admin());

CREATE POLICY "Admins manage presenters"
  ON academy_presenters
  FOR ALL
  TO authenticated
  USING (check_user_is_admin())
  WITH CHECK (check_user_is_admin());

CREATE POLICY "Admins manage workshops"
  ON academy_workshops
  FOR ALL
  TO authenticated
  USING (check_user_is_admin())
  WITH CHECK (check_user_is_admin());

CREATE POLICY "Admins manage resources"
  ON academy_workshop_resources
  FOR ALL
  TO authenticated
  USING (check_user_is_admin())
  WITH CHECK (check_user_is_admin());

-- ============================================================================
-- STEP 9: Explicit table grants
-- ============================================================================

GRANT SELECT ON academy_categories TO authenticated, anon;
GRANT SELECT ON academy_presenters TO authenticated, anon;
GRANT SELECT ON academy_workshops TO authenticated, anon;
GRANT SELECT ON academy_workshop_resources TO authenticated, anon;

GRANT INSERT ON academy_workshop_submissions TO authenticated, anon;
GRANT SELECT ON academy_workshop_submissions TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON academy_workshop_submissions TO authenticated;

GRANT INSERT ON academy_registrations TO authenticated, anon;
GRANT SELECT ON academy_registrations TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON academy_registrations TO authenticated;

GRANT INSERT ON academy_email_logs TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON academy_email_logs TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON academy_categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON academy_presenters TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON academy_workshops TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON academy_workshop_resources TO authenticated;

-- ============================================================================
-- STEP 10: Refresh PostgREST schema cache
-- ============================================================================

NOTIFY pgrst, 'reload schema';
