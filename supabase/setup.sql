-- Clario Complete Database Setup
-- Run this ONCE in Supabase SQL Editor

-- ============================================
-- 1. PROFILES TABLE SETUP
-- ============================================

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS requests_used_this_month INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_period_start DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS current_period_end DATE DEFAULT (CURRENT_DATE + INTERVAL '1 month - 1 day')::DATE;

UPDATE public.profiles SET requests_used_this_month = COALESCE(requests_used, 0) WHERE requests_used_this_month = 0;

-- ============================================
-- 2. USAGE STATS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.usage_stats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE DEFAULT CURRENT_DATE NOT NULL,
  summaries_count INTEGER DEFAULT 0,
  chats_count INTEGER DEFAULT 0,
  writing_count INTEGER DEFAULT 0,
  meeting_notes_count INTEGER DEFAULT 0,
  total_requests INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Add foreign key constraint if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'usage_stats_user_id_fkey'
  ) THEN
    ALTER TABLE public.usage_stats ADD CONSTRAINT usage_stats_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

ALTER TABLE public.usage_stats ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_usage_stats_user_date ON public.usage_stats(user_id, date DESC);

-- ============================================
-- 3. RLS POLICIES
-- ============================================

-- Profiles
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- AI Summaries
DROP POLICY IF EXISTS "Users can view own summaries" ON public.ai_summaries;
DROP POLICY IF EXISTS "Users can insert own summaries" ON public.ai_summaries;
CREATE POLICY "Users can view own summaries" ON public.ai_summaries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own summaries" ON public.ai_summaries FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Chat Messages
DROP POLICY IF EXISTS "Users can view own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can insert own messages" ON public.chat_messages;
CREATE POLICY "Users can view own messages" ON public.chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own messages" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Writing Sessions
DROP POLICY IF EXISTS "Users can view own writing" ON public.writing_sessions;
DROP POLICY IF EXISTS "Users can insert own writing" ON public.writing_sessions;
CREATE POLICY "Users can view own writing" ON public.writing_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own writing" ON public.writing_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Meeting Notes
DROP POLICY IF EXISTS "Users can view own meetings" ON public.meeting_notes;
DROP POLICY IF EXISTS "Users can insert own meetings" ON public.meeting_notes;
CREATE POLICY "Users can view own meetings" ON public.meeting_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own meetings" ON public.meeting_notes FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Usage Stats
DROP POLICY IF EXISTS "Users can view own usage stats" ON public.usage_stats;
DROP POLICY IF EXISTS "Users can insert own usage stats" ON public.usage_stats;
DROP POLICY IF EXISTS "Users can update own usage stats" ON public.usage_stats;
CREATE POLICY "Users can view own usage stats" ON public.usage_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own usage stats" ON public.usage_stats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own usage stats" ON public.usage_stats FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- 4. FUNCTIONS
-- ============================================

-- Update timestamp trigger
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

-- Handle new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, requests_used_this_month, current_period_start, current_period_end)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    0,
    CURRENT_DATE,
    (CURRENT_DATE + INTERVAL '1 month')::DATE
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Track usage (records stats for all users, only increments counter for non-admins)
DROP FUNCTION IF EXISTS public.track_usage(UUID, TEXT, INTEGER) CASCADE;

CREATE OR REPLACE FUNCTION public.track_usage(p_user_id UUID, p_type TEXT, p_count INTEGER DEFAULT 1)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_period_end DATE;
  v_email TEXT;
  v_is_admin BOOLEAN;
BEGIN
  SELECT email, current_period_end INTO v_email, v_period_end FROM public.profiles WHERE id = p_user_id;
  
  v_is_admin := v_email = 'muhammadtanveerabbas.dev@gmail.com';
  
  IF v_period_end IS NULL OR CURRENT_DATE > v_period_end THEN
    UPDATE public.profiles SET 
      requests_used_this_month = 0,
      current_period_start = CURRENT_DATE,
      current_period_end = (CURRENT_DATE + INTERVAL '1 month - 1 day')::DATE
    WHERE id = p_user_id;
  END IF;

  INSERT INTO public.usage_stats (user_id, date, summaries_count, chats_count, writing_count, meeting_notes_count, total_requests)
  VALUES (
    p_user_id, CURRENT_DATE,
    CASE WHEN p_type = 'summary' THEN p_count ELSE 0 END,
    CASE WHEN p_type = 'chat' THEN p_count ELSE 0 END,
    CASE WHEN p_type = 'writing' THEN p_count ELSE 0 END,
    CASE WHEN p_type = 'meeting' THEN p_count ELSE 0 END,
    p_count
  )
  ON CONFLICT (user_id, date) DO UPDATE SET
    summaries_count = usage_stats.summaries_count + CASE WHEN p_type = 'summary' THEN p_count ELSE 0 END,
    chats_count = usage_stats.chats_count + CASE WHEN p_type = 'chat' THEN p_count ELSE 0 END,
    writing_count = usage_stats.writing_count + CASE WHEN p_type = 'writing' THEN p_count ELSE 0 END,
    meeting_notes_count = usage_stats.meeting_notes_count + CASE WHEN p_type = 'meeting' THEN p_count ELSE 0 END,
    total_requests = usage_stats.total_requests + p_count;

  IF NOT v_is_admin THEN
    UPDATE public.profiles SET requests_used_this_month = requests_used_this_month + p_count WHERE id = p_user_id;
  END IF;
END;
$$;

-- ============================================
-- 5. TRIGGERS
-- ============================================

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_usage_stats_updated_at ON public.usage_stats;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_usage_stats_updated_at BEFORE UPDATE ON public.usage_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. ADMIN SETUP (Optional - Update email)
-- ============================================

UPDATE public.profiles
SET 
  subscription_tier = 'pro',
  subscription_status = 'active',
  requests_used_this_month = 0
WHERE email = 'muhammadtanveerabbas.dev@gmail.com';

-- ============================================
-- DONE
-- ============================================

NOTIFY pgrst, 'reload schema';
