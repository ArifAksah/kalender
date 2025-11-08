-- Massive Progress Tracker Update - Database Migration
-- Run this in Supabase SQL Editor
-- This migration adds all new features: profiles, gamification, collaboration, AI, PWA

-- ============================================
-- 1. USER PROFILES TABLE
-- ============================================
DROP TABLE IF EXISTS profiles CASCADE;
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  avatar_url TEXT,
  bio TEXT,
  timezone TEXT DEFAULT 'UTC',
  language TEXT DEFAULT 'en',
  theme_preference TEXT DEFAULT 'light',
  xp_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_level ON profiles(level, xp_points);

-- ============================================
-- 2. PASSWORD RESET TOKENS
-- ============================================
DROP TABLE IF EXISTS password_reset_tokens CASCADE;
CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

-- ============================================
-- 3. GAMIFICATION TABLES
-- ============================================

-- Achievements table
DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '🏆',
  xp_reward INTEGER DEFAULT 50,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User achievements (unlocked achievements)
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  progress INTEGER DEFAULT 100,
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);

-- Badges table
DROP TABLE IF EXISTS user_badges CASCADE;
DROP TABLE IF EXISTS badges CASCADE;
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '🎖️',
  rarity TEXT DEFAULT 'common',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User badges (earned badges)
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON user_badges(badge_id);

-- ============================================
-- 4. COLLABORATION TABLES
-- ============================================

-- Teams table
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_teams_owner_id ON teams(owner_id);

-- Team members
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);

-- Shared progress
DROP TABLE IF EXISTS shared_progress CASCADE;
CREATE TABLE shared_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  progress_id BIGINT NOT NULL REFERENCES progress(id) ON DELETE CASCADE,
  shared_with_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  shared_with_team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  can_edit BOOLEAN DEFAULT false,
  shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (
    (shared_with_user_id IS NOT NULL AND shared_with_team_id IS NULL) OR
    (shared_with_user_id IS NULL AND shared_with_team_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_shared_progress_progress_id ON shared_progress(progress_id);
CREATE INDEX IF NOT EXISTS idx_shared_progress_shared_with_user ON shared_progress(shared_with_user_id);
CREATE INDEX IF NOT EXISTS idx_shared_progress_shared_with_team ON shared_progress(shared_with_team_id);

-- Comments
DROP TABLE IF EXISTS comments CASCADE;
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  progress_id BIGINT NOT NULL REFERENCES progress(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_progress_id ON comments(progress_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);

-- Reactions
DROP TABLE IF EXISTS reactions CASCADE;
CREATE TABLE reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  progress_id BIGINT NOT NULL REFERENCES progress(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL DEFAULT '👍',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(progress_id, user_id, reaction_type)
);

CREATE INDEX IF NOT EXISTS idx_reactions_progress_id ON reactions(progress_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user_id ON reactions(user_id);

-- ============================================
-- 5. AI/SMART FEATURES TABLES
-- ============================================

-- Tags table
DROP TABLE IF EXISTS progress_tags CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT DEFAULT '#667eea',
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_tags_user_id ON tags(user_id);
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);

-- Progress tags (many-to-many)
CREATE TABLE progress_tags (
  progress_id BIGINT NOT NULL REFERENCES progress(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (progress_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_progress_tags_progress_id ON progress_tags(progress_id);
CREATE INDEX IF NOT EXISTS idx_progress_tags_tag_id ON progress_tags(tag_id);

-- AI Insights
DROP TABLE IF EXISTS ai_insights CASCADE;
CREATE TABLE ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL,
  content JSONB NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_insights_user_id ON ai_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_type ON ai_insights(insight_type);

-- ============================================
-- 6. PWA TABLES
-- ============================================

-- Push subscriptions
DROP TABLE IF EXISTS push_subscriptions CASCADE;
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  keys JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);

-- ============================================
-- 7. UPDATE EXISTING PROGRESS TABLE
-- ============================================

-- Add new columns to progress table
DO $$ 
BEGIN
  -- Tags array (keeping for backward compatibility, but also using tags table)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'progress' AND column_name = 'tags'
  ) THEN
    ALTER TABLE progress ADD COLUMN tags TEXT[];
  END IF;

  -- Video URL
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'progress' AND column_name = 'video_url'
  ) THEN
    ALTER TABLE progress ADD COLUMN video_url TEXT;
  END IF;

  -- Audio URL
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'progress' AND column_name = 'audio_url'
  ) THEN
    ALTER TABLE progress ADD COLUMN audio_url TEXT;
  END IF;

  -- Attachments (JSONB for file metadata)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'progress' AND column_name = 'attachments'
  ) THEN
    ALTER TABLE progress ADD COLUMN attachments JSONB DEFAULT '[]'::jsonb;
  END IF;

  -- Mood
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'progress' AND column_name = 'mood'
  ) THEN
    ALTER TABLE progress ADD COLUMN mood TEXT;
  END IF;

  -- XP earned
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'progress' AND column_name = 'xp_earned'
  ) THEN
    ALTER TABLE progress ADD COLUMN xp_earned INTEGER DEFAULT 10;
  END IF;
END $$;

-- ============================================
-- 8. SEED DATA - ACHIEVEMENTS
-- ============================================

INSERT INTO achievements (name, description, icon, xp_reward, category) VALUES
  ('First Step', 'Created your first progress entry', '🎯', 50, 'milestone'),
  ('Week Warrior', 'Maintained a 7-day streak', '🔥', 100, 'streak'),
  ('Century', 'Reached 100 progress entries', '💯', 500, 'milestone'),
  ('Early Bird', 'Created progress before 8 AM', '🌅', 75, 'time'),
  ('Night Owl', 'Created progress after 10 PM', '🦉', 75, 'time'),
  ('Storyteller', 'Wrote 1000+ words in total', '📝', 200, 'content'),
  ('Photographer', 'Uploaded 50+ images', '📸', 300, 'media'),
  ('Consistent', 'Maintained a 30-day streak', '⭐', 1000, 'streak'),
  ('Social Butterfly', 'Shared 10 progress entries', '🦋', 150, 'social'),
  ('Team Player', 'Joined your first team', '👥', 100, 'social'),
  ('Commenter', 'Left 20 comments', '💬', 150, 'social'),
  ('Reaction Master', 'Reacted to 50 posts', '👍', 100, 'social')
ON CONFLICT DO NOTHING;

-- ============================================
-- 9. SEED DATA - BADGES
-- ============================================

INSERT INTO badges (name, description, icon, rarity) VALUES
  ('Newcomer', 'Welcome to the platform!', '🌱', 'common'),
  ('Dedicated', 'Active for 30 days', '💪', 'common'),
  ('Elite', 'Reached level 10', '👑', 'rare'),
  ('Legendary', 'Reached level 25', '🌟', 'legendary'),
  ('Streak Master', '100-day streak', '🔥', 'rare'),
  ('Content Creator', '500 progress entries', '✨', 'rare'),
  ('Community Leader', 'Created a team', '👑', 'uncommon'),
  ('Helper', 'Helped 50 users', '🤝', 'uncommon')
ON CONFLICT DO NOTHING;

-- ============================================
-- 10. FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update profile updated_at
CREATE OR REPLACE FUNCTION update_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_updated_at();

-- Function to cleanup expired tokens
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM verification_tokens WHERE expires_at < NOW();
  DELETE FROM password_reset_tokens WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to calculate user level from XP
CREATE OR REPLACE FUNCTION calculate_level(xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
  -- Level formula: level = floor(sqrt(xp / 100)) + 1
  RETURN FLOOR(SQRT(GREATEST(xp, 0) / 100.0))::INTEGER + 1;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-create profile on user creation
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (user_id, xp_points, level)
  VALUES (NEW.id, 0, 1)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create profile
DROP TRIGGER IF EXISTS trigger_create_user_profile ON users;
CREATE TRIGGER trigger_create_user_profile
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();

-- ============================================
-- 11. DISABLE RLS (for development)
-- ============================================

ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_tokens DISABLE ROW LEVEL SECURITY;
ALTER TABLE achievements DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements DISABLE ROW LEVEL SECURITY;
ALTER TABLE badges DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges DISABLE ROW LEVEL SECURITY;
ALTER TABLE teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE team_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE shared_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE reactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE progress_tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights DISABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 12. VERIFICATION QUERY
-- ============================================

-- Check all tables were created
SELECT 
  table_name, 
  COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN (
    'profiles', 'password_reset_tokens', 'achievements', 
    'user_achievements', 'badges', 'user_badges', 'teams', 
    'team_members', 'shared_progress', 'comments', 'reactions',
    'tags', 'progress_tags', 'ai_insights', 'push_subscriptions'
  )
GROUP BY table_name
ORDER BY table_name;

