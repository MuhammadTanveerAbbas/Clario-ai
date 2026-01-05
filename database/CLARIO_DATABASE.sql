-- Clario Complete Database Schema
-- Paste this entire file into Supabase SQL Editor and run

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- Users
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'trialing')),
  paddle_subscription_id TEXT,
  paddle_customer_id TEXT,
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
  model TEXT DEFAULT 'mixtral-8x7b-32768',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Writing Drafts
CREATE TABLE IF NOT EXISTS public.writing_drafts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  template_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
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

-- Usage Stats (Unified)
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

-- Insights
CREATE TABLE IF NOT EXISTS public.insights (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  insight_text TEXT NOT NULL,
  insight_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
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

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.writing_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quick_notes ENABLE ROW LEVEL SECURITY;

-- Users Policies
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- AI Summaries Policies
CREATE POLICY "Users can view own summaries" ON public.ai_summaries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own summaries" ON public.ai_summaries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own summaries" ON public.ai_summaries FOR DELETE USING (auth.uid() = user_id);

-- Chat Messages Policies
CREATE POLICY "Users can view own messages" ON public.chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own messages" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own messages" ON public.chat_messages FOR DELETE USING (auth.uid() = user_id);

-- Writing Drafts Policies
CREATE POLICY "Users can view own drafts" ON public.writing_drafts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own drafts" ON public.writing_drafts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own drafts" ON public.writing_drafts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own drafts" ON public.writing_drafts FOR DELETE USING (auth.uid() = user_id);

-- Meeting Notes Policies
CREATE POLICY "Users can view own meeting notes" ON public.meeting_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own meeting notes" ON public.meeting_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own meeting notes" ON public.meeting_notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own meeting notes" ON public.meeting_notes FOR DELETE USING (auth.uid() = user_id);

-- Usage Stats Policies
CREATE POLICY "Users can view own usage stats" ON public.usage_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own usage stats" ON public.usage_stats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own usage stats" ON public.usage_stats FOR UPDATE USING (auth.uid() = user_id);

-- Insights Policies
CREATE POLICY "Users can view own insights" ON public.insights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own insights" ON public.insights FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Quick Notes Policies
CREATE POLICY "Users can view own notes" ON public.quick_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notes" ON public.quick_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notes" ON public.quick_notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notes" ON public.quick_notes FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_summaries_user_id ON public.ai_summaries(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_summaries_created_at ON public.ai_summaries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON public.chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON public.chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_writing_drafts_user_id ON public.writing_drafts(user_id);
CREATE INDEX IF NOT EXISTS idx_meeting_notes_user_id ON public.meeting_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_stats_user_id ON public.usage_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_stats_date ON public.usage_stats(date DESC);
CREATE INDEX IF NOT EXISTS idx_insights_user_id ON public.insights(user_id);
CREATE INDEX IF NOT EXISTS idx_quick_notes_user_id ON public.quick_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_quick_notes_category ON public.quick_notes(category);
CREATE INDEX IF NOT EXISTS idx_quick_notes_created_at ON public.quick_notes(created_at DESC);

-- Functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_writing_drafts_updated_at ON public.writing_drafts;
CREATE TRIGGER update_writing_drafts_updated_at BEFORE UPDATE ON public.writing_drafts
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
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.track_usage(p_user_id UUID, p_type TEXT, p_count INTEGER DEFAULT 1)
RETURNS VOID AS $$
BEGIN
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_monthly_usage(p_user_id UUID)
RETURNS TABLE(total_requests INTEGER, limit_requests INTEGER) AS $$
DECLARE
  v_tier TEXT;
  v_total INTEGER;
  v_limit INTEGER;
BEGIN
  SELECT subscription_tier INTO v_tier FROM public.users WHERE id = p_user_id;
  SELECT COALESCE(SUM(total_requests), 0) INTO v_total FROM public.usage_stats
  WHERE user_id = p_user_id AND DATE_TRUNC('month', date) = DATE_TRUNC('month', CURRENT_DATE);
  v_limit := CASE WHEN v_tier = 'pro' THEN 1000 ELSE 100 END;
  RETURN QUERY SELECT v_total, v_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- End of Clario Database Schema
