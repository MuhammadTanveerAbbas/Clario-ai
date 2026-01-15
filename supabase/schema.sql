-- Clario Database Schema
-- Run this in Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users (profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'trialing')),
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  trial_ends_at TIMESTAMPTZ,
  requests_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Keep users table for backward compatibility
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'trialing')),
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Summaries
CREATE TABLE IF NOT EXISTS public.ai_summaries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  summary_text TEXT NOT NULL,
  original_text TEXT,
  mode TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Messages
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  conversation_id UUID DEFAULT uuid_generate_v4(),
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  model TEXT DEFAULT 'llama-3.1-8b-instant',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Writing Sessions
CREATE TABLE IF NOT EXISTS public.writing_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  original_text TEXT NOT NULL,
  improved_text TEXT NOT NULL,
  tone TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meeting Notes
CREATE TABLE IF NOT EXISTS public.meeting_notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  transcript TEXT,
  summary TEXT,
  action_items TEXT[],
  key_points TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage Stats
CREATE TABLE IF NOT EXISTS public.usage_stats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  date DATE DEFAULT CURRENT_DATE NOT NULL,
  total_requests INTEGER DEFAULT 0,
  summaries_count INTEGER DEFAULT 0,
  chats_count INTEGER DEFAULT 0,
  writing_count INTEGER DEFAULT 0,
  meeting_notes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Quick Notes
CREATE TABLE IF NOT EXISTS public.quick_notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  summary TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feedback
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  email TEXT,
  feedback TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.writing_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quick_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view own profile') THEN
    CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update own profile') THEN
    CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can view own user') THEN
    CREATE POLICY "Users can view own user" ON public.users FOR SELECT USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can update own user') THEN
    CREATE POLICY "Users can update own user" ON public.users FOR UPDATE USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_summaries' AND policyname = 'Users can view own summaries') THEN
    CREATE POLICY "Users can view own summaries" ON public.ai_summaries FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_summaries' AND policyname = 'Users can insert own summaries') THEN
    CREATE POLICY "Users can insert own summaries" ON public.ai_summaries FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_summaries' AND policyname = 'Users can delete own summaries') THEN
    CREATE POLICY "Users can delete own summaries" ON public.ai_summaries FOR DELETE USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chat_messages' AND policyname = 'Users can view own messages') THEN
    CREATE POLICY "Users can view own messages" ON public.chat_messages FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chat_messages' AND policyname = 'Users can insert own messages') THEN
    CREATE POLICY "Users can insert own messages" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chat_messages' AND policyname = 'Users can delete own messages') THEN
    CREATE POLICY "Users can delete own messages" ON public.chat_messages FOR DELETE USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'writing_sessions' AND policyname = 'Users can view own sessions') THEN
    CREATE POLICY "Users can view own sessions" ON public.writing_sessions FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'writing_sessions' AND policyname = 'Users can insert own sessions') THEN
    CREATE POLICY "Users can insert own sessions" ON public.writing_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'writing_sessions' AND policyname = 'Users can delete own sessions') THEN
    CREATE POLICY "Users can delete own sessions" ON public.writing_sessions FOR DELETE USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'meeting_notes' AND policyname = 'Users can view own meeting notes') THEN
    CREATE POLICY "Users can view own meeting notes" ON public.meeting_notes FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'meeting_notes' AND policyname = 'Users can insert own meeting notes') THEN
    CREATE POLICY "Users can insert own meeting notes" ON public.meeting_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'meeting_notes' AND policyname = 'Users can update own meeting notes') THEN
    CREATE POLICY "Users can update own meeting notes" ON public.meeting_notes FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'meeting_notes' AND policyname = 'Users can delete own meeting notes') THEN
    CREATE POLICY "Users can delete own meeting notes" ON public.meeting_notes FOR DELETE USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'usage_stats' AND policyname = 'Users can view own usage stats') THEN
    CREATE POLICY "Users can view own usage stats" ON public.usage_stats FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'usage_stats' AND policyname = 'Users can insert own usage stats') THEN
    CREATE POLICY "Users can insert own usage stats" ON public.usage_stats FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'usage_stats' AND policyname = 'Users can update own usage stats') THEN
    CREATE POLICY "Users can update own usage stats" ON public.usage_stats FOR UPDATE USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quick_notes' AND policyname = 'Users can view own notes') THEN
    CREATE POLICY "Users can view own notes" ON public.quick_notes FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quick_notes' AND policyname = 'Users can insert own notes') THEN
    CREATE POLICY "Users can insert own notes" ON public.quick_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quick_notes' AND policyname = 'Users can update own notes') THEN
    CREATE POLICY "Users can update own notes" ON public.quick_notes FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quick_notes' AND policyname = 'Users can delete own notes') THEN
    CREATE POLICY "Users can delete own notes" ON public.quick_notes FOR DELETE USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'feedback' AND policyname = 'Service role can insert feedback') THEN
    CREATE POLICY "Service role can insert feedback" ON public.feedback FOR INSERT WITH CHECK (auth.jwt()->>'role' = 'service_role' OR auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'feedback' AND policyname = 'Users can view own feedback') THEN
    CREATE POLICY "Users can view own feedback" ON public.feedback FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_summaries_user_id ON public.ai_summaries(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_summaries_created_at ON public.ai_summaries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON public.chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON public.chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_writing_sessions_user_id ON public.writing_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_writing_sessions_created_at ON public.writing_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_meeting_notes_user_id ON public.meeting_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_stats_user_id ON public.usage_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_stats_date ON public.usage_stats(date DESC);
CREATE INDEX IF NOT EXISTS idx_quick_notes_user_id ON public.quick_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_quick_notes_created_at ON public.quick_notes(created_at DESC);

-- Functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_meeting_notes_updated_at ON public.meeting_notes;
CREATE TRIGGER update_meeting_notes_updated_at BEFORE UPDATE ON public.meeting_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_usage_stats_updated_at ON public.usage_stats;
CREATE TRIGGER update_usage_stats_updated_at BEFORE UPDATE ON public.usage_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_quick_notes_updated_at ON public.quick_notes;
CREATE TRIGGER update_quick_notes_updated_at BEFORE UPDATE ON public.quick_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, requests_used)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', ''), 0)
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO public.users (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', ''))
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Migrate existing users to profiles table
INSERT INTO public.profiles (id, email, name, subscription_tier, subscription_status, requests_used, created_at, updated_at)
SELECT u.id, u.email, u.name, u.subscription_tier, u.subscription_status, 0, u.created_at, u.updated_at
FROM public.users u
ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.track_usage(p_user_id UUID, p_type TEXT, p_count INTEGER DEFAULT 1)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update usage_stats table
  INSERT INTO public.usage_stats (user_id, date, total_requests, summaries_count, chats_count, writing_count, meeting_notes_count)
  VALUES (p_user_id, CURRENT_DATE, p_count,
    CASE WHEN p_type = 'summary' THEN p_count ELSE 0 END,
    CASE WHEN p_type = 'chat' THEN p_count ELSE 0 END,
    CASE WHEN p_type = 'writing' THEN p_count ELSE 0 END,
    CASE WHEN p_type = 'meeting' THEN p_count ELSE 0 END)
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    total_requests = usage_stats.total_requests + p_count,
    summaries_count = usage_stats.summaries_count + CASE WHEN p_type = 'summary' THEN p_count ELSE 0 END,
    chats_count = usage_stats.chats_count + CASE WHEN p_type = 'chat' THEN p_count ELSE 0 END,
    writing_count = usage_stats.writing_count + CASE WHEN p_type = 'writing' THEN p_count ELSE 0 END,
    meeting_notes_count = usage_stats.meeting_notes_count + CASE WHEN p_type = 'meeting' THEN p_count ELSE 0 END;
  
  -- Update profiles table requests_used
  UPDATE public.profiles
  SET requests_used = (
    SELECT COALESCE(SUM(total_requests), 0)
    FROM public.usage_stats
    WHERE user_id = p_user_id
      AND date >= DATE_TRUNC('month', CURRENT_DATE)
  )
  WHERE id = p_user_id;
END;
$$;
