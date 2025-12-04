-- Discussions Schema for Supabase
-- Run this in Supabase SQL Editor

-- Channels table
CREATE TABLE IF NOT EXISTS channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  is_private BOOLEAN DEFAULT FALSE,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_channels_name ON channels(name);
CREATE INDEX IF NOT EXISTS idx_channels_created_at ON channels(created_at DESC);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  author_email TEXT,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_channel_id ON messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_is_pinned ON messages(is_pinned);

-- Message reactions table
CREATE TABLE IF NOT EXISTS message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(message_id, emoji, user_id)
);

CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_emoji ON message_reactions(emoji);

-- Thread replies table
CREATE TABLE IF NOT EXISTS thread_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  author_email TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_thread_replies_message_id ON thread_replies(message_id);
CREATE INDEX IF NOT EXISTS idx_thread_replies_created_at ON thread_replies(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE thread_replies ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allow all for now - adjust based on your auth requirements)
CREATE POLICY "Allow all on channels" ON channels FOR ALL USING (true);
CREATE POLICY "Allow all on messages" ON messages FOR ALL USING (true);
CREATE POLICY "Allow all on message_reactions" ON message_reactions FOR ALL USING (true);
CREATE POLICY "Allow all on thread_replies" ON thread_replies FOR ALL USING (true);

