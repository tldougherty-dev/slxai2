-- SLxAI Signal Newsletter issues (admin-authored, public pages at /signal/:slug)
-- Run in Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS signal_newsletters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  issue_number INTEGER,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published')),
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_signal_newsletters_status ON signal_newsletters(status);
CREATE INDEX IF NOT EXISTS idx_signal_newsletters_published_at ON signal_newsletters(published_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_signal_newsletters_scheduled_at ON signal_newsletters(scheduled_at);

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

ALTER TABLE signal_newsletters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read published signal newsletters" ON signal_newsletters;
CREATE POLICY "Public can read published signal newsletters"
  ON signal_newsletters
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

DROP POLICY IF EXISTS "Admins can manage signal newsletters" ON signal_newsletters;
CREATE POLICY "Admins can manage signal newsletters"
  ON signal_newsletters
  FOR ALL
  TO authenticated
  USING (check_user_is_admin())
  WITH CHECK (check_user_is_admin());
