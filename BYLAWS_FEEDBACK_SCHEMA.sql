-- Bylaws public feedback (anonymous submissions from /bylaws page)
-- Prefer: activity-logs/sql/BYLAWS_FEEDBACK_COMPLETE.sql (includes admin helper + NOTIFY).
-- This file assumes check_user_is_admin() already exists.

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
