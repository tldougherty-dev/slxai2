-- Bylaws feedback: self-contained migration for /bylaws page (public INSERT, admin read/delete)
-- Run once in Supabase SQL Editor (Dashboard → SQL → New query → Run).
-- Then: Table Editor → bylaws_feedback should exist; test submit from https://yoursite.org/bylaws

-- ---------------------------------------------------------------------------
-- 1. Admin helper (same pattern as interest_submissions / portal)
-- ---------------------------------------------------------------------------
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

GRANT EXECUTE ON FUNCTION check_user_is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION check_user_is_admin() TO anon;

-- ---------------------------------------------------------------------------
-- 2. Table + RLS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bylaws_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  organization TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bylaws_feedback_created_at ON bylaws_feedback(created_at DESC);

ALTER TABLE bylaws_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit bylaws feedback" ON bylaws_feedback;
CREATE POLICY "Anyone can submit bylaws feedback"
  ON bylaws_feedback
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view bylaws feedback" ON bylaws_feedback;
CREATE POLICY "Admins can view bylaws feedback"
  ON bylaws_feedback
  FOR SELECT
  TO authenticated
  USING (check_user_is_admin());

DROP POLICY IF EXISTS "Admins can delete bylaws feedback" ON bylaws_feedback;
CREATE POLICY "Admins can delete bylaws feedback"
  ON bylaws_feedback
  FOR DELETE
  TO authenticated
  USING (check_user_is_admin());

GRANT SELECT, INSERT ON bylaws_feedback TO anon;
GRANT SELECT, INSERT, DELETE ON bylaws_feedback TO authenticated;

NOTIFY pgrst, 'reload schema';
