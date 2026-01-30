# Row Level Security (RLS) Policy Review

## Overview
This document reviews the current RLS policies in Supabase and provides recommendations for strengthening security.

## Current RLS Status

### Tables with RLS Enabled
Based on the SQL files found, the following tables have RLS enabled:
- `members`
- `member_persons`
- `votes`
- `vote_options`
- `files`
- `videos`
- `notifications`
- `file_categories`
- `feed_posts`
- `summit_workshop_submissions`
- `summit_sponsor_submissions`
- `summit_members`
- `summit_tasks`
- `portal_settings`
- `activities`
- `analytics_events`

## Critical Issues Found

### 1. **Overly Permissive Policies**
**Issue:** Many policies allow all authenticated users to perform all operations.

**Examples:**
```sql
-- TOO PERMISSIVE
CREATE POLICY "Allow authenticated read settings" ON portal_settings FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert activities" ON activities FOR INSERT WITH CHECK (true);
```

**Risk:** Any authenticated user can read/modify sensitive data.

**Recommendation:** Implement role-based access control:
```sql
-- BETTER: Role-based access
CREATE POLICY "Admins can read settings" ON portal_settings FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND (auth.users.raw_user_meta_data->>'role')::text IN ('admin', 'super_admin')
  )
);
```

### 2. **Missing Organization-Level Isolation**
**Issue:** Policies don't always check organization membership.

**Example:** `feed_posts` table should restrict users to their organization's posts.

**Current Policy (from FIX_RLS_FINAL.sql):**
```sql
CREATE POLICY "Allow users to create posts for their organization"
ON feed_posts FOR INSERT
TO authenticated
WITH CHECK (
  organization_id::text IN (
    SELECT raw_user_meta_data->>'organization_id' 
    FROM auth.users 
    WHERE id = auth.uid()
  )
);
```

**Status:** ✅ This policy is good - it checks organization_id.

**Recommendation:** Ensure all policies check organization_id where applicable.

### 3. **Admin Functions Using SECURITY DEFINER**
**Issue:** Functions like `update_user_role()` use `SECURITY DEFINER` which runs with elevated privileges.

**Current Implementation (from SECURE_UPDATE_USER_ROLE_FUNCTION.sql):**
```sql
CREATE OR REPLACE FUNCTION update_user_role(
  user_email TEXT,
  new_role TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- ⚠️ Runs with admin privileges
```

**Status:** ✅ Function includes proper admin checks inside.

**Recommendation:** 
- Document all SECURITY DEFINER functions
- Ensure all functions validate permissions
- Review function permissions regularly

## Recommendations by Table

### 1. **members** Table
**Current:** Allows all authenticated users to read/write.

**Recommendation:**
```sql
-- Read: All authenticated users can read
-- Write: Only admins or users from same organization
CREATE POLICY "Users can read members" ON members FOR SELECT USING (true);

CREATE POLICY "Users can update own organization" ON members FOR UPDATE
USING (
  id::text = (SELECT raw_user_meta_data->>'organization_id' FROM auth.users WHERE id = auth.uid())
  OR
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND (auth.users.raw_user_meta_data->>'role')::text IN ('admin', 'super_admin')
  )
);
```

### 2. **files** Table
**Current:** Need to verify policies.

**Recommendation:**
```sql
-- Read: All authenticated users
-- Write: Only file owner or admin
CREATE POLICY "Users can read files" ON files FOR SELECT USING (true);

CREATE POLICY "Users can manage own files" ON files FOR ALL
USING (
  uploaded_by = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND (auth.users.raw_user_meta_data->>'role')::text IN ('admin', 'super_admin')
  )
);
```

### 3. **votes** Table
**Current:** Allows all authenticated users to read/write.

**Recommendation:**
```sql
-- Read: All authenticated users
-- Write: Only voting members or admins
CREATE POLICY "Voting members can vote" ON vote_options FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND (
      (auth.users.raw_user_meta_data->>'role')::text IN ('voting_member', 'admin', 'super_admin')
      OR
      (auth.users.raw_user_meta_data->>'is_voting_rep')::boolean = true
    )
  )
);
```

### 4. **feed_posts** Table
**Current:** ✅ Good - checks organization_id.

**Recommendation:** Add UPDATE/DELETE policies:
```sql
CREATE POLICY "Users can update own posts" ON feed_posts FOR UPDATE
USING (
  author_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND (auth.users.raw_user_meta_data->>'role')::text IN ('admin', 'super_admin')
  )
);

CREATE POLICY "Users can delete own posts" ON feed_posts FOR DELETE
USING (
  author_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND (auth.users.raw_user_meta_data->>'role')::text IN ('admin', 'super_admin')
  )
);
```

### 5. **summit_workshop_submissions** Table
**Current:** Allows all authenticated users to insert, admins/summit members to read.

**Status:** ✅ Good - uses helper function `check_user_is_admin_or_summit_member()`.

**Recommendation:** Add UPDATE/DELETE policies for submitters:
```sql
CREATE POLICY "Users can update own submissions" ON summit_workshop_submissions FOR UPDATE
USING (
  submitter_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR
  check_user_is_admin_or_summit_member()
);
```

## Action Items

### Immediate (Before Launch)
1. ✅ Review all RLS policies in Supabase dashboard
2. ✅ Test policies with different user roles
3. ✅ Ensure organization-level isolation
4. ✅ Add UPDATE/DELETE policies where missing

### Short Term (Week 1)
1. Implement role-based access control for all tables
2. Add policies for UPDATE/DELETE operations
3. Document all SECURITY DEFINER functions
4. Create test cases for RLS policies

### Long Term (Month 1)
1. Regular RLS policy audits
2. Monitor for policy violations
3. Implement policy versioning
4. Create RLS policy documentation

## Testing RLS Policies

### Test Script
```sql
-- Test as regular user
SET ROLE authenticated;
SET request.jwt.claim.sub = 'user-uuid-here';
SELECT * FROM members; -- Should work
UPDATE members SET ...; -- Should fail if not admin/own org

-- Test as admin
SET ROLE authenticated;
SET request.jwt.claim.sub = 'admin-uuid-here';
-- Update user metadata to have admin role first
SELECT * FROM members; -- Should work
UPDATE members SET ...; -- Should work
```

## Helper Functions

### Recommended Helper Functions
```sql
-- Check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND (raw_user_meta_data->>'role')::text IN ('admin', 'super_admin')
  );
END;
$$;

-- Get user's organization ID
CREATE OR REPLACE FUNCTION get_user_org_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  org_id UUID;
BEGIN
  SELECT (raw_user_meta_data->>'organization_id')::uuid INTO org_id
  FROM auth.users
  WHERE id = auth.uid();
  RETURN org_id;
END;
$$;
```

## Summary

**Current Security Posture:** MODERATE RISK ⚠️

**Key Issues:**
- Some policies are too permissive
- Missing UPDATE/DELETE policies
- Need better role-based access control

**Recommendations:**
- Implement role-based policies
- Add organization-level isolation
- Document all SECURITY DEFINER functions
- Regular policy audits

**Priority:** HIGH - Review and tighten before launch

