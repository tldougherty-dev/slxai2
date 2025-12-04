-- COPY THIS ENTIRE FILE AND PASTE INTO SUPABASE SQL EDITOR
-- Then click "Run" button

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

CREATE INDEX IF NOT EXISTS idx_members_organization ON members(organization_name);
CREATE INDEX IF NOT EXISTS idx_members_country ON members(country);

CREATE TABLE IF NOT EXISTS member_persons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  title TEXT,
  is_voting_rep BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_member_persons_member_id ON member_persons(member_id);
CREATE INDEX IF NOT EXISTS idx_member_persons_email ON member_persons(email);

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

CREATE INDEX IF NOT EXISTS idx_votes_status ON votes(status);
CREATE INDEX IF NOT EXISTS idx_votes_end_time ON votes(end_time);

CREATE TABLE IF NOT EXISTS vote_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vote_id UUID NOT NULL REFERENCES votes(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  votes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vote_options_vote_id ON vote_options(vote_id);

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

CREATE INDEX IF NOT EXISTS idx_files_type ON files(type);
CREATE INDEX IF NOT EXISTS idx_files_category ON files(category_id);

CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  embed_url TEXT NOT NULL,
  uploaded_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  type TEXT NOT NULL CHECK (type IN ('vote', 'mention', 'reply', 'file', 'member', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

CREATE TABLE IF NOT EXISTS file_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#0080FF',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO file_categories (name, color) VALUES
  ('Research', '#0080FF'),
  ('Meeting Minutes', '#10B981'),
  ('Standards', '#F59E0B'),
  ('Governance', '#8B5CF6'),
  ('Other', '#6B7280')
ON CONFLICT (name) DO NOTHING;

-- Add foreign key constraint for files.category_id
ALTER TABLE files
  ADD CONSTRAINT files_category_fk
  FOREIGN KEY (category_id) REFERENCES file_categories(id) ON DELETE SET NULL;

-- Add unique constraint for member_persons email per member
CREATE UNIQUE INDEX IF NOT EXISTS uq_member_persons_member_email
  ON member_persons(member_id, email);

ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vote_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members are viewable by everyone" ON members FOR SELECT USING (true);
CREATE POLICY "Members are insertable by authenticated users" ON members FOR INSERT WITH CHECK (true);
CREATE POLICY "Members are updatable by authenticated users" ON members FOR UPDATE USING (true);
CREATE POLICY "Members are deletable by authenticated users" ON members FOR DELETE USING (true);

CREATE POLICY "Member persons are viewable by everyone" ON member_persons FOR SELECT USING (true);
CREATE POLICY "Member persons are insertable by authenticated users" ON member_persons FOR INSERT WITH CHECK (true);
CREATE POLICY "Member persons are updatable by authenticated users" ON member_persons FOR UPDATE USING (true);
CREATE POLICY "Member persons are deletable by authenticated users" ON member_persons FOR DELETE USING (true);

CREATE POLICY "Votes are viewable by everyone" ON votes FOR SELECT USING (true);
CREATE POLICY "Votes are insertable by authenticated users" ON votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Votes are updatable by authenticated users" ON votes FOR UPDATE USING (true);
CREATE POLICY "Votes are deletable by authenticated users" ON votes FOR DELETE USING (true);

CREATE POLICY "Vote options are viewable by everyone" ON vote_options FOR SELECT USING (true);
CREATE POLICY "Vote options are insertable by authenticated users" ON vote_options FOR INSERT WITH CHECK (true);
CREATE POLICY "Vote options are updatable by authenticated users" ON vote_options FOR UPDATE USING (true);
CREATE POLICY "Vote options are deletable by authenticated users" ON vote_options FOR DELETE USING (true);

CREATE POLICY "Files are viewable by everyone" ON files FOR SELECT USING (true);
CREATE POLICY "Files are insertable by authenticated users" ON files FOR INSERT WITH CHECK (true);
CREATE POLICY "Files are updatable by authenticated users" ON files FOR UPDATE USING (true);
CREATE POLICY "Files are deletable by authenticated users" ON files FOR DELETE USING (true);

CREATE POLICY "Videos are viewable by everyone" ON videos FOR SELECT USING (true);
CREATE POLICY "Videos are insertable by authenticated users" ON videos FOR INSERT WITH CHECK (true);
CREATE POLICY "Videos are updatable by authenticated users" ON videos FOR UPDATE USING (true);
CREATE POLICY "Videos are deletable by authenticated users" ON videos FOR DELETE USING (true);

CREATE POLICY "Users can view their own notifications" ON notifications FOR SELECT USING (true);
CREATE POLICY "Users can insert notifications" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own notifications" ON notifications FOR UPDATE USING (true);
CREATE POLICY "Users can delete their own notifications" ON notifications FOR DELETE USING (true);

CREATE POLICY "File categories are viewable by everyone" ON file_categories FOR SELECT USING (true);
CREATE POLICY "File categories are insertable by authenticated users" ON file_categories FOR INSERT WITH CHECK (true);
CREATE POLICY "File categories are updatable by authenticated users" ON file_categories FOR UPDATE USING (true);
CREATE POLICY "File categories are deletable by authenticated users" ON file_categories FOR DELETE USING (true);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_votes_updated_at BEFORE UPDATE ON votes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_files_updated_at BEFORE UPDATE ON files
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON videos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

