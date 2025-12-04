# Supabase Setup Guide

## Step 1: Get Your Supabase Credentials

1. Go to your Supabase project dashboard: https://app.supabase.com
2. Select your project
3. Click **Settings** (gear icon) → **API**
4. Copy these two values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

## Step 2: Create Environment File

Create a `.env` file in the root of your project (if it doesn't exist) and add:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**Important:** Never commit your `.env` file to git! It should already be in `.gitignore`.

## Step 3: Install Supabase Client

Run this command in your terminal:

```bash
npm install @supabase/supabase-js
```

## Step 4: Create Database Tables

Go to your Supabase dashboard → **SQL Editor** and run these SQL commands:

### 1. Members Table

```sql
-- Create members table
CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_name TEXT NOT NULL,
  country TEXT NOT NULL,
  logo TEXT,
  bio TEXT,
  website TEXT,
  poc_name TEXT NOT NULL,
  poc_email TEXT NOT NULL,
  poc_title TEXT,
  member_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster searches
CREATE INDEX IF NOT EXISTS idx_members_organization ON members(organization_name);
CREATE INDEX IF NOT EXISTS idx_members_country ON members(country);
```

### 2. Member Persons Table (individual members within organizations)

```sql
-- Create member_persons table
CREATE TABLE IF NOT EXISTS member_persons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  title TEXT,
  is_voting_rep BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_member_persons_member_id ON member_persons(member_id);
CREATE INDEX IF NOT EXISTS idx_member_persons_email ON member_persons(email);
```

### 3. Votes Table

```sql
-- Create votes table
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  organization TEXT NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('active', 'closed', 'draft')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_votes_status ON votes(status);
CREATE INDEX IF NOT EXISTS idx_votes_end_time ON votes(end_time);
```

### 4. Vote Options Table

```sql
-- Create vote_options table
CREATE TABLE IF NOT EXISTS vote_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vote_id UUID NOT NULL REFERENCES votes(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  votes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_vote_options_vote_id ON vote_options(vote_id);
```

### 5. Files Table

```sql
-- Create files table
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  category_id UUID,
  file_url TEXT,
  uploaded_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_files_type ON files(type);
CREATE INDEX IF NOT EXISTS idx_files_category ON files(category_id);
```

### 6. Videos Table

```sql
-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  embed_url TEXT NOT NULL,
  uploaded_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC);
```

### 7. Notifications Table

```sql
-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  type TEXT NOT NULL CHECK (type IN ('vote', 'mention', 'reply', 'file', 'member', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
```

### 8. File Categories Table

```sql
-- Create file_categories table
CREATE TABLE IF NOT EXISTS file_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#0080FF',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Insert default categories
INSERT INTO file_categories (name, color) VALUES
  ('Research', '#0080FF'),
  ('Meeting Minutes', '#10B981'),
  ('Standards', '#F59E0B'),
  ('Governance', '#8B5CF6'),
  ('Other', '#6B7280')
ON CONFLICT (name) DO NOTHING;
```

### 9. Enable Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vote_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_categories ENABLE ROW LEVEL SECURITY;

-- Create policies (for now, allow all reads, restrict writes to authenticated users)
-- You can customize these later based on your needs

-- Members: Allow read for all, write for authenticated
CREATE POLICY "Members are viewable by everyone" ON members FOR SELECT USING (true);
CREATE POLICY "Members are insertable by authenticated users" ON members FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Members are updatable by authenticated users" ON members FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Members are deletable by authenticated users" ON members FOR DELETE USING (auth.role() = 'authenticated');

-- Member Persons: Same as members
CREATE POLICY "Member persons are viewable by everyone" ON member_persons FOR SELECT USING (true);
CREATE POLICY "Member persons are insertable by authenticated users" ON member_persons FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Member persons are updatable by authenticated users" ON member_persons FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Member persons are deletable by authenticated users" ON member_persons FOR DELETE USING (auth.role() = 'authenticated');

-- Votes: Allow read for all, write for authenticated
CREATE POLICY "Votes are viewable by everyone" ON votes FOR SELECT USING (true);
CREATE POLICY "Votes are insertable by authenticated users" ON votes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Votes are updatable by authenticated users" ON votes FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Votes are deletable by authenticated users" ON votes FOR DELETE USING (auth.role() = 'authenticated');

-- Vote Options: Same as votes
CREATE POLICY "Vote options are viewable by everyone" ON vote_options FOR SELECT USING (true);
CREATE POLICY "Vote options are insertable by authenticated users" ON vote_options FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Vote options are updatable by authenticated users" ON vote_options FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Vote options are deletable by authenticated users" ON vote_options FOR DELETE USING (auth.role() = 'authenticated');

-- Files: Allow read for all, write for authenticated
CREATE POLICY "Files are viewable by everyone" ON files FOR SELECT USING (true);
CREATE POLICY "Files are insertable by authenticated users" ON files FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Files are updatable by authenticated users" ON files FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Files are deletable by authenticated users" ON files FOR DELETE USING (auth.role() = 'authenticated');

-- Videos: Same as files
CREATE POLICY "Videos are viewable by everyone" ON videos FOR SELECT USING (true);
CREATE POLICY "Videos are insertable by authenticated users" ON videos FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Videos are updatable by authenticated users" ON videos FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Videos are deletable by authenticated users" ON videos FOR DELETE USING (auth.role() = 'authenticated');

-- Notifications: Users can only see their own notifications
CREATE POLICY "Users can view their own notifications" ON notifications FOR SELECT USING (auth.uid()::text = user_id OR user_id IS NULL);
CREATE POLICY "Users can insert notifications" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own notifications" ON notifications FOR UPDATE USING (auth.uid()::text = user_id OR user_id IS NULL);
CREATE POLICY "Users can delete their own notifications" ON notifications FOR DELETE USING (auth.uid()::text = user_id OR user_id IS NULL);

-- File Categories: Allow read for all, write for authenticated
CREATE POLICY "File categories are viewable by everyone" ON file_categories FOR SELECT USING (true);
CREATE POLICY "File categories are insertable by authenticated users" ON file_categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "File categories are updatable by authenticated users" ON file_categories FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "File categories are deletable by authenticated users" ON file_categories FOR DELETE USING (auth.role() = 'authenticated');
```

## Step 5: Set Up Storage Bucket (for file uploads)

1. Go to **Storage** in your Supabase dashboard
2. Click **New bucket**
3. Name it: `files`
4. Make it **Public** (or Private if you want to restrict access)
5. Click **Create bucket**

## Step 6: Enable Realtime (for live updates)

1. Go to **Database** → **Replication** in your Supabase dashboard
2. Enable replication for these tables:
   - `votes`
   - `vote_options`
   - `files`
   - `videos`
   - `notifications`

## Next Steps

After completing these steps, let me know and I'll help you:
1. Migrate your existing data to Supabase
2. Update your code to use Supabase instead of localStorage
3. Set up authentication
4. Configure real-time subscriptions

