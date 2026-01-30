-- Feedback Submissions Table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS feedback_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  user_name TEXT,
  feedback_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_submissions_created_at ON feedback_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_submissions_user_email ON feedback_submissions(user_email);

-- Enable Row Level Security
ALTER TABLE feedback_submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own feedback
CREATE POLICY "Users can submit feedback"
ON feedback_submissions
FOR INSERT
TO authenticated
WITH CHECK (auth.email() = user_email);

-- Policy: Admins can view all feedback
CREATE POLICY "Admins can view all feedback"
ON feedback_submissions
FOR SELECT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (auth.users.raw_user_meta_data->>'role' IN ('admin', 'super_admin'))
  )
);

-- Also allow admins to view (USING clause)
ALTER POLICY "Admins can view all feedback" ON feedback_submissions
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (auth.users.raw_user_meta_data->>'role' IN ('admin', 'super_admin'))
  )
);

-- Policy: Users can view their own feedback
CREATE POLICY "Users can view their own feedback"
ON feedback_submissions
FOR SELECT
TO authenticated
USING (auth.email() = user_email);

