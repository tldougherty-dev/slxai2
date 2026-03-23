-- Run if CREATE_USER_ROLES_TABLE_AND_BACKFILL.sql failed on FK organization_id.
-- Uses only organization_id values that exist in public.members (metadata can be stale).

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

-- ---------------------------------------------------------------------------
-- Verification (run after success)
-- ---------------------------------------------------------------------------
-- Row counts should match: every auth user should have at most one user_roles row.
-- SELECT (SELECT COUNT(*) FROM auth.users) AS auth_users,
--        (SELECT COUNT(*) FROM public.user_roles) AS user_roles_rows;
--
-- No orphan organization_id (must return 0 rows):
-- SELECT ur.id, ur.user_id, ur.email, ur.organization_id
-- FROM public.user_roles ur
-- WHERE ur.organization_id IS NOT NULL
--   AND NOT EXISTS (SELECT 1 FROM public.members m WHERE m.id = ur.organization_id);
--
-- Duplicate emails in user_roles (should be 0 rows):
-- SELECT LOWER(TRIM(email)) AS e, COUNT(*) FROM public.user_roles GROUP BY 1 HAVING COUNT(*) > 1;
