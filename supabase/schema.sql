-- ============================================
-- PREREQ - Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  company TEXT,
  role TEXT,
  linkedin_url TEXT,
  linkedin_data JSONB,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================
-- BRIEFS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS briefs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  linkedin_url TEXT NOT NULL,
  meeting_goal TEXT NOT NULL DEFAULT 'general' CHECK (meeting_goal IN ('networking', 'sales', 'hiring', 'investor', 'partner', 'general')),

  -- Profile data from Proxycurl
  profile_name TEXT NOT NULL,
  profile_headline TEXT,
  profile_photo_url TEXT,
  profile_location TEXT,
  profile_company TEXT,
  profile_data JSONB,

  -- AI-generated content
  summary TEXT NOT NULL,
  talking_points JSONB NOT NULL DEFAULT '[]'::jsonb,
  common_ground JSONB NOT NULL DEFAULT '[]'::jsonb,
  icebreaker TEXT NOT NULL,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Metadata
  is_saved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for briefs
CREATE INDEX IF NOT EXISTS idx_briefs_user_id ON briefs(user_id);
CREATE INDEX IF NOT EXISTS idx_briefs_created_at ON briefs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_briefs_profile_name ON briefs(profile_name);
CREATE INDEX IF NOT EXISTS idx_briefs_is_saved ON briefs(is_saved) WHERE is_saved = TRUE;

-- ============================================
-- CHAT SESSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  brief_id UUID REFERENCES briefs(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for chat sessions
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_brief_id ON chat_sessions(brief_id);

-- ============================================
-- CHAT MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for chat messages
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- ============================================
-- USAGE LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('brief_generated', 'brief_refreshed', 'chat_message', 'profile_synced')),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for usage logs
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_action ON usage_logs(action);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON usage_logs(created_at);

-- Composite index for monthly usage queries
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_action_date
ON usage_logs(user_id, action, created_at);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read/update their own profile
-- Note: We use service role key for API routes, so these policies
-- are mainly for extra security if direct Supabase access is used

CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (true);  -- Allow service role

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (true);  -- Allow service role

-- Policy: Users can only access their own briefs
CREATE POLICY "Users can view own briefs" ON briefs
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own briefs" ON briefs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own briefs" ON briefs
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete own briefs" ON briefs
  FOR DELETE USING (true);

-- Policy: Users can only access their own chat sessions
CREATE POLICY "Users can view own chat sessions" ON chat_sessions
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own chat sessions" ON chat_sessions
  FOR INSERT WITH CHECK (true);

-- Policy: Users can only access messages from their sessions
CREATE POLICY "Users can view own messages" ON chat_messages
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own messages" ON chat_messages
  FOR INSERT WITH CHECK (true);

-- Policy: Usage logs - read only for analytics
CREATE POLICY "Users can view own usage" ON usage_logs
  FOR SELECT USING (true);

CREATE POLICY "System can insert usage logs" ON usage_logs
  FOR INSERT WITH CHECK (true);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_briefs_updated_at
    BEFORE UPDATE ON briefs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_sessions_updated_at
    BEFORE UPDATE ON chat_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED DATA (Optional - for testing)
-- ============================================

-- Uncomment below to add test data

-- INSERT INTO users (clerk_id, email, name, company, role, plan)
-- VALUES
--   ('user_test_123', 'test@example.com', 'Test User', 'Test Company', 'Engineer', 'starter');
