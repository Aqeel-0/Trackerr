-- COMPLETE DATABASE SETUP WITH USERNAME SUPPORT
-- This is the ONLY SQL file you need to run
-- Run this ONCE in Supabase SQL Editor after deleting all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- HABITS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL,
  icon TEXT NOT NULL,
  tracking_type TEXT NOT NULL CHECK (tracking_type IN ('checkbox', 'counter')),
  target_count INTEGER,
  unit TEXT,
  category TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- HABIT COMPLETIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS habit_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  completed BOOLEAN DEFAULT false,
  count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(habit_id, date)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS profiles_username_idx ON profiles(username);
CREATE INDEX IF NOT EXISTS habits_user_id_idx ON habits(user_id);
CREATE INDEX IF NOT EXISTS habits_display_order_idx ON habits(display_order);
CREATE INDEX IF NOT EXISTS completions_habit_id_idx ON habit_completions(habit_id);
CREATE INDEX IF NOT EXISTS completions_user_id_idx ON habit_completions(user_id);
CREATE INDEX IF NOT EXISTS completions_date_idx ON habit_completions(date);
CREATE INDEX IF NOT EXISTS completions_habit_date_idx ON habit_completions(habit_id, date);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- DROP EXISTING POLICIES (if any)
-- ============================================
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view profiles by username" ON profiles;

DROP POLICY IF EXISTS "Users can view their own habits" ON habits;
DROP POLICY IF EXISTS "Users can insert their own habits" ON habits;
DROP POLICY IF EXISTS "Users can update their own habits" ON habits;
DROP POLICY IF EXISTS "Users can delete their own habits" ON habits;

DROP POLICY IF EXISTS "Users can view their own completions" ON habit_completions;
DROP POLICY IF EXISTS "Users can insert their own completions" ON habit_completions;
DROP POLICY IF EXISTS "Users can update their own completions" ON habit_completions;
DROP POLICY IF EXISTS "Users can delete their own completions" ON habit_completions;

-- ============================================
-- RLS POLICIES FOR PROFILES
-- ============================================
CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view profiles by username"
ON profiles FOR SELECT
TO authenticated
USING (true);

-- ============================================
-- RLS POLICIES FOR HABITS
-- ============================================
CREATE POLICY "Users can view their own habits"
ON habits FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own habits"
ON habits FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habits"
ON habits FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habits"
ON habits FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================
-- RLS POLICIES FOR HABIT COMPLETIONS
-- ============================================
CREATE POLICY "Users can view their own completions"
ON habit_completions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own completions"
ON habit_completions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own completions"
ON habit_completions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own completions"
ON habit_completions FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================
-- TRIGGER FUNCTION: Auto-create profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', NULL),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================
-- RPC FUNCTION: Get email by username (for login)
-- ============================================
CREATE OR REPLACE FUNCTION get_email_by_username(username_input TEXT)
RETURNS TEXT AS $$
DECLARE
  user_email TEXT;
BEGIN
  SELECT u.email INTO user_email
  FROM auth.users u
  INNER JOIN public.profiles p ON u.id = p.id
  WHERE LOWER(p.username) = LOWER(username_input);
  
  RETURN user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCTION: Update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS: Auto-update updated_at
-- ============================================
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_habits_updated_at ON habits;
CREATE TRIGGER update_habits_updated_at
  BEFORE UPDATE ON habits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_completions_updated_at ON habit_completions;
CREATE TRIGGER update_completions_updated_at
  BEFORE UPDATE ON habit_completions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- GRANT PERMISSIONS
-- ============================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON habits TO authenticated;
GRANT ALL ON habit_completions TO authenticated;

-- ============================================
-- VERIFICATION QUERIES (Optional - for testing)
-- ============================================
-- To verify everything is set up correctly, you can run:
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public';
-- SELECT * FROM pg_policies WHERE schemaname = 'public';
-- SELECT proname FROM pg_proc WHERE proname IN ('handle_new_user', 'get_email_by_username', 'update_updated_at');

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- Your database is now ready with:
-- ✅ Profiles table (auto-created on signup)
-- ✅ Habits table
-- ✅ Habit completions table
-- ✅ All RLS policies
-- ✅ Username login support
-- ✅ Auto-update timestamps
-- ✅ All necessary indexes
