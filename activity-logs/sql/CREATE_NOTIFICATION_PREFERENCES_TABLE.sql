-- Create user notification preferences table
-- This allows members to control which email notifications they receive

CREATE TABLE IF NOT EXISTS user_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Supabase auth user ID or email
  email TEXT NOT NULL, -- User's email address
  
  -- Feed notifications
  feed_new_post BOOLEAN DEFAULT TRUE, -- New posts on global feed
  feed_new_comment BOOLEAN DEFAULT TRUE, -- New comments on feed posts
  
  -- File notifications
  file_new_upload BOOLEAN DEFAULT TRUE, -- New files uploaded
  file_category_update BOOLEAN DEFAULT FALSE, -- Files added to watched categories
  
  -- Discussion notifications
  discussion_new_message BOOLEAN DEFAULT TRUE, -- New messages in discussions
  discussion_new_channel BOOLEAN DEFAULT FALSE, -- New discussion channels created
  discussion_mention BOOLEAN DEFAULT TRUE, -- Mentioned in discussion
  
  -- Post/Comment notifications
  post_reply BOOLEAN DEFAULT TRUE, -- Replies to user's posts
  comment_reply BOOLEAN DEFAULT TRUE, -- Replies to user's comments
  post_mention BOOLEAN DEFAULT TRUE, -- Mentioned in a post
  
  -- Voting notifications
  vote_new BOOLEAN DEFAULT TRUE, -- New votes created
  vote_ending_soon BOOLEAN DEFAULT TRUE, -- Votes ending soon (24h reminder)
  vote_result BOOLEAN DEFAULT TRUE, -- Vote results available
  
  -- Member notifications
  member_new_organization BOOLEAN DEFAULT FALSE, -- New organization joined
  member_profile_update BOOLEAN DEFAULT FALSE, -- Organization profile updated
  
  -- Summit notifications
  summit_new_workshop BOOLEAN DEFAULT TRUE, -- New workshop submissions
  summit_new_sponsor BOOLEAN DEFAULT FALSE, -- New sponsor submissions
  summit_deadline_reminder BOOLEAN DEFAULT TRUE, -- Summit deadline reminders
  
  -- System notifications
  system_announcement BOOLEAN DEFAULT TRUE, -- System announcements
  system_maintenance BOOLEAN DEFAULT TRUE, -- Maintenance notifications
  
  -- Email frequency (optional - for future use)
  email_frequency TEXT DEFAULT 'immediate' CHECK (email_frequency IN ('immediate', 'daily', 'weekly', 'never')),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one preference record per user
  UNIQUE(user_id),
  UNIQUE(email)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_notification_prefs_user_id ON user_notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_prefs_email ON user_notification_preferences(email);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER trigger_update_notification_preferences_updated_at
  BEFORE UPDATE ON user_notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_preferences_updated_at();

-- Enable RLS
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only view/edit their own preferences
CREATE POLICY "Users can view their own notification preferences"
  ON user_notification_preferences
  FOR SELECT
  USING (auth.uid()::text = user_id OR auth.jwt()->>'email' = email);

CREATE POLICY "Users can insert their own notification preferences"
  ON user_notification_preferences
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id OR auth.jwt()->>'email' = email);

CREATE POLICY "Users can update their own notification preferences"
  ON user_notification_preferences
  FOR UPDATE
  USING (auth.uid()::text = user_id OR auth.jwt()->>'email' = email);

-- Create function to get default preferences (for new users)
CREATE OR REPLACE FUNCTION get_default_notification_preferences()
RETURNS JSONB AS $$
BEGIN
  RETURN jsonb_build_object(
    'feed_new_post', true,
    'feed_new_comment', true,
    'file_new_upload', true,
    'file_category_update', false,
    'discussion_new_message', true,
    'discussion_new_channel', false,
    'discussion_mention', true,
    'post_reply', true,
    'comment_reply', true,
    'post_mention', true,
    'vote_new', true,
    'vote_ending_soon', true,
    'vote_result', true,
    'member_new_organization', false,
    'member_profile_update', false,
    'summit_new_workshop', true,
    'summit_new_sponsor', false,
    'summit_deadline_reminder', true,
    'system_announcement', true,
    'system_maintenance', true,
    'email_frequency', 'immediate'
  );
END;
$$ LANGUAGE plpgsql;

