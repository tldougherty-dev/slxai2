-- Summit Planning Schema
-- Run this in Supabase SQL Editor

-- Table for summit committee members
CREATE TABLE IF NOT EXISTS summit_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  organization_id UUID REFERENCES members(id),
  organization_name TEXT,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  added_by UUID REFERENCES auth.users(id)
);

-- Table for summit tasks (Kanban board)
CREATE TABLE IF NOT EXISTS summit_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
  owner_email TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  tags TEXT[] DEFAULT '{}'
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_summit_members_email ON summit_members(email);
CREATE INDEX IF NOT EXISTS idx_summit_tasks_status ON summit_tasks(status);
CREATE INDEX IF NOT EXISTS idx_summit_tasks_owner_email ON summit_tasks(owner_email);
CREATE INDEX IF NOT EXISTS idx_summit_tasks_due_date ON summit_tasks(due_date);

-- Create a SECURITY DEFINER function to check if user is a summit member
-- This avoids infinite recursion in RLS policies
CREATE OR REPLACE FUNCTION check_is_summit_member(user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM summit_members
    WHERE summit_members.email = user_email
  );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION check_is_summit_member(text) TO authenticated;

-- RLS Policies for summit_members
ALTER TABLE summit_members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can manage summit members" ON summit_members;
DROP POLICY IF EXISTS "Admins can insert summit members" ON summit_members;
DROP POLICY IF EXISTS "Admins can update summit members" ON summit_members;
DROP POLICY IF EXISTS "Admins can delete summit members" ON summit_members;
DROP POLICY IF EXISTS "Summit members can view summit members" ON summit_members;

-- Drop function if exists
DROP FUNCTION IF EXISTS check_user_is_admin();

-- Create a SECURITY DEFINER function to check if user is admin
-- This function runs with elevated privileges to access auth.users
-- Note: Must be created by a superuser (postgres role)
CREATE OR REPLACE FUNCTION check_user_is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Access auth.users with SECURITY DEFINER privileges
  -- This bypasses RLS because SECURITY DEFINER runs as the function creator
  SELECT raw_user_meta_data->>'role' INTO user_role
  FROM auth.users
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_role, '') IN ('admin', 'super_admin');
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION check_user_is_admin() TO authenticated;

-- Also grant to anon role if needed
GRANT EXECUTE ON FUNCTION check_user_is_admin() TO anon;

-- Allow admins and super admins to manage summit members
-- Using separate policies for different operations
CREATE POLICY "Admins can insert summit members"
ON summit_members
FOR INSERT
TO authenticated
WITH CHECK (check_user_is_admin());

CREATE POLICY "Admins can update summit members"
ON summit_members
FOR UPDATE
TO authenticated
USING (check_user_is_admin())
WITH CHECK (check_user_is_admin());

CREATE POLICY "Admins can delete summit members"
ON summit_members
FOR DELETE
TO authenticated
USING (check_user_is_admin());

-- Create a helper function to get user email (SECURITY DEFINER to access auth.users)
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_email() TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_email() TO anon;

-- Allow summit members to view summit members list (using function to avoid recursion)
CREATE POLICY "Summit members can view summit members"
ON summit_members
FOR SELECT
TO authenticated
USING (
  check_is_summit_member(get_user_email())
  OR check_user_is_admin()
);

-- RLS Policies for summit_tasks
ALTER TABLE summit_tasks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Summit members can manage tasks" ON summit_tasks;

-- Allow admins, super admins, and summit members to manage tasks (using function to avoid recursion)
CREATE POLICY "Summit members can manage tasks"
ON summit_tasks
FOR ALL
TO authenticated
USING (
  check_is_summit_member(get_user_email())
  OR check_user_is_admin()
)
WITH CHECK (
  check_is_summit_member(get_user_email())
  OR check_user_is_admin()
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_summit_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_summit_tasks_updated_at ON summit_tasks;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_summit_tasks_updated_at
BEFORE UPDATE ON summit_tasks
FOR EACH ROW
EXECUTE FUNCTION update_summit_tasks_updated_at();

-- Grant permissions
GRANT ALL ON summit_members TO authenticated;
GRANT ALL ON summit_tasks TO authenticated;

-- Refresh Supabase schema cache (important for PostgREST)
NOTIFY pgrst, 'reload schema';

