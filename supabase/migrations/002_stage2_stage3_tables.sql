-- Stage 2: Shared Album
CREATE TABLE IF NOT EXISTS shared_album (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  caption TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE shared_album ENABLE ROW LEVEL SECURITY;

CREATE POLICY "albums_select_all" ON shared_album FOR SELECT USING (true);
CREATE POLICY "albums_insert_own" ON shared_album FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "albums_delete_own" ON shared_album FOR DELETE USING (auth.uid() = user_id);

-- Stage 2: Anniversaries
CREATE TABLE IF NOT EXISTS anniversaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE anniversaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anniversaries_select_all" ON anniversaries FOR SELECT USING (true);
CREATE POLICY "anniversaries_insert" ON anniversaries FOR INSERT WITH CHECK (true);
CREATE POLICY "anniversaries_delete" ON anniversaries FOR DELETE USING (true);

-- Stage 2: Read Receipts
CREATE TABLE IF NOT EXISTS read_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  viewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(entry_id, viewer_id)
);

ALTER TABLE read_receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "receipts_select_all" ON read_receipts FOR SELECT USING (true);
CREATE POLICY "receipts_insert" ON read_receipts FOR INSERT WITH CHECK (true);

-- Stage 3: Messages (encrypted chat)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  encrypted_text TEXT NOT NULL DEFAULT '',
  reaction TEXT NOT NULL DEFAULT '',
  disappears_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "messages_select_all" ON messages FOR SELECT USING (true);
CREATE POLICY "messages_insert" ON messages FOR INSERT WITH CHECK (true);
CREATE POLICY "messages_delete" ON messages FOR DELETE USING (true);

-- Enable realtime for messages (Stage 3)
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table anniversaries;
alter publication supabase_realtime add table shared_album;
