-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'partner')),
  display_name TEXT NOT NULL DEFAULT '',
  profile_photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Entries table
CREATE TABLE entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  text TEXT NOT NULL DEFAULT '',
  mood TEXT NOT NULL CHECK (mood IN ('sad', 'missing', 'loving', 'happy', 'in-love')),
  mood_emoji TEXT NOT NULL DEFAULT '',
  photo_url TEXT,
  voice_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- App settings (single row, admin-only)
CREATE TABLE app_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  departure_date DATE NOT NULL,
  together_since DATE NOT NULL,
  her_display_name TEXT NOT NULL DEFAULT '',
  his_display_name TEXT NOT NULL DEFAULT '',
  admin_profile_photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Love letters (30 reasons)
CREATE TABLE love_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL CHECK (day_number BETWEEN 1 AND 99),
  reason TEXT NOT NULL DEFAULT '',
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE love_letters ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read their own profile; admin can read all
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admin can read all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Entries: users can read all entries; users can write their own
CREATE POLICY "Anyone logged in can read all entries" ON entries
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert their own entries" ON entries
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own entries" ON entries
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- App settings: admin-only access
CREATE POLICY "Admin can read app settings" ON app_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin can update app settings" ON app_settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Love letters: users can read all; users can write their own
CREATE POLICY "Anyone logged in can read all love letters" ON love_letters
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert their own love letters" ON love_letters
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Trigger: create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    'partner',  -- default role, admin sets this later
    ''
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
