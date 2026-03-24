-- Final Fix - Handle NULL and use proper UUID comparison
-- The issue might be NULL handling or type casting

-- Step 1: Drop all existing insert policies
DROP POLICY IF EXISTS "Allow members to create posts for their organization" ON feed_posts;
DROP POLICY IF EXISTS "Allow members and admins to create posts" ON feed_posts;
DROP POLICY IF EXISTS "Allow users to create posts for their organization" ON feed_posts;
DROP POLICY IF EXISTS "TEST - Allow all authenticated users to create posts" ON feed_posts;

-- Step 2: Create policy with proper NULL handling and UUID comparison
CREATE POLICY "Allow users to create posts for their organization"
ON feed_posts FOR INSERT
TO authenticated
WITH CHECK (
  -- Check if organization_id matches, handling NULLs properly
  organization_id IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'organization_id' IS NOT NULL
    AND (raw_user_meta_data->>'organization_id')::uuid = organization_id
  )
);

-- Step 3: Test the policy
SELECT 
  'Policy Test' as test,
  EXISTS (
    SELECT 1
    FROM auth.users
    WHERE email = 'travis@signapse.ai'
    AND raw_user_meta_data->>'organization_id' IS NOT NULL
    AND (raw_user_meta_data->>'organization_id')::uuid = 'f482d7bd-ec1c-4d7f-a9c9-ae9aa5d9d948'::uuid
  ) as should_allow;

