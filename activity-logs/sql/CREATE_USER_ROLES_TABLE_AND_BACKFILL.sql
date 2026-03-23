-- Create public.user_roles and backfill from auth.users (same role source as get_user_roles)
-- plus optional enrichment from member_persons and raw_user_meta_data.
-- Run in Supabase SQL Editor (Dashboard → SQL → New query), then reload schema if needed.

-- ---------------------------------------------------------------------------
-- 1. Table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users (id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('member', 'voting_member', 'admin', 'super_admin')),
  full_name TEXT,
  organization_id UUID REFERENCES public.members (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_user_roles_email_lower ON public.user_roles (LOWER(TRIM(email)));

CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles (role);

COMMENT ON TABLE public.user_roles IS 'Per-user portal role; backfilled from auth.users metadata; used by Admin and backups.';

-- Keep updated_at fresh
CREATE OR REPLACE FUNCTION public.set_user_roles_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_user_roles_updated_at ON public.user_roles;
CREATE TRIGGER trg_user_roles_updated_at
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_user_roles_updated_at();

-- ---------------------------------------------------------------------------
-- 2. RLS (aligned with other open portal tables in supabase-schema.sql)
-- ---------------------------------------------------------------------------
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_roles_select_authenticated" ON public.user_roles;
CREATE POLICY "user_roles_select_authenticated"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "user_roles_all_service_role" ON public.user_roles;
-- Service role bypasses RLS; this is for explicit grants if you use a custom role.

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

-- ---------------------------------------------------------------------------
-- 3. Backfill (idempotent: only inserts missing user_id rows)
-- ---------------------------------------------------------------------------
INSERT INTO public.user_roles (user_id, email, role, full_name, organization_id)
SELECT
  au.id,
  LOWER(TRIM(au.email::text)),
  CASE
    WHEN NULLIF(TRIM(COALESCE(au.raw_user_meta_data->>'role', '')), '') IN (
      'member', 'voting_member', 'admin', 'super_admin'
    ) THEN NULLIF(TRIM(COALESCE(au.raw_user_meta_data->>'role', '')), '')
    ELSE 'member'
  END,
  COALESCE(
    NULLIF(TRIM(COALESCE(au.raw_user_meta_data->>'full_name', '')), ''),
    NULLIF(TRIM(COALESCE(au.raw_user_meta_data->>'name', '')), ''),
    mp.name,
    split_part(au.email::text, '@', 1)
  ),
  -- Only set organization_id when it exists in public.members (metadata may be stale or wrong)
  COALESCE(
    (
      SELECT m.id
      FROM public.members m
      WHERE
        NULLIF(TRIM(COALESCE(au.raw_user_meta_data->>'organization_id', '')), '') ~ '^[0-9a-fA-F-]{36}$'
        AND m.id = NULLIF(TRIM(au.raw_user_meta_data->>'organization_id'), '')::uuid
      LIMIT 1
    ),
    (
      SELECT m.id
      FROM public.members m
      WHERE mp.member_id IS NOT NULL AND m.id = mp.member_id
      LIMIT 1
    )
  )
FROM auth.users au
LEFT JOIN LATERAL (
  SELECT mp.name, mp.member_id
  FROM public.member_persons mp
  WHERE LOWER(TRIM(mp.email)) = LOWER(TRIM(au.email::text))
  ORDER BY mp.created_at NULLS LAST
  LIMIT 1
) mp ON true
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles ur WHERE ur.user_id = au.id
);

NOTIFY pgrst, 'reload schema';
