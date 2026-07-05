-- Curated library links (research, datasets, etc.)
CREATE TABLE IF NOT EXISTS library_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('research', 'dataset', 'educational_video', 'recorded_workshop', 'files')),
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  source TEXT,
  sign_language TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_library_resources_type ON library_resources(type);
CREATE INDEX IF NOT EXISTS idx_library_resources_display_order ON library_resources(display_order);

ALTER TABLE library_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Library resources are viewable by everyone"
  ON library_resources FOR SELECT USING (true);

CREATE POLICY "Library resources are insertable by authenticated users"
  ON library_resources FOR INSERT WITH CHECK (true);

CREATE POLICY "Library resources are updatable by authenticated users"
  ON library_resources FOR UPDATE USING (true);

CREATE POLICY "Library resources are deletable by authenticated users"
  ON library_resources FOR DELETE USING (true);
