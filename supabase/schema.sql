-- ═══════════════════════════════════════════════════════════════════════════════
-- Clario  Master Schema
-- ═══════════════════════════════════════════════════════════════════════════════

-- Drop everything in dependency order
DROP TABLE IF EXISTS feedback CASCADE;
DROP TABLE IF EXISTS processed_webhook_events CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS image_prompts CASCADE;
DROP TABLE IF EXISTS calendar_events CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS chat_sessions CASCADE;
DROP TABLE IF EXISTS remix_history CASCADE;
DROP TABLE IF EXISTS summarizer_history CASCADE;
DROP TABLE IF EXISTS brand_voices CASCADE;
DROP TABLE IF EXISTS api_rate_limits CASCADE;
DROP TABLE IF EXISTS usage_tracking CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at() CASCADE;
DROP FUNCTION IF EXISTS increment_usage(UUID, TEXT, JSONB) CASCADE;
DROP FUNCTION IF EXISTS reset_monthly_usage() CASCADE;
DROP FUNCTION IF EXISTS check_rate_limit(UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS ensure_single_active_brand_voice() CASCADE;
DROP VIEW IF EXISTS dashboard_stats CASCADE;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ═══════════════════════════════════════════════════════════════════════════════
-- SHARED UTILITY FUNCTION
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- PROFILES
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE profiles (
  id                     UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email                  TEXT,
  full_name              TEXT,
  avatar_url             TEXT,
  plan                   TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  stripe_customer_id     TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  subscription_status    TEXT NOT NULL DEFAULT 'inactive'
                           CHECK (subscription_status IN ('active','inactive','past_due','canceled','trialing','unpaid')),
  billing_cycle          TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly','annual')),
  requests_used          INTEGER NOT NULL DEFAULT 0 CHECK (requests_used >= 0),
  requests_reset_at      TIMESTAMPTZ NOT NULL DEFAULT date_trunc('month', NOW()) + INTERVAL '1 month',
  onboarding_completed   BOOLEAN NOT NULL DEFAULT FALSE,
  onboarding_steps       JSONB NOT NULL DEFAULT '{"summarize":false,"remix":false,"brandVoice":false,"chat":false}'::JSONB,
  theme                  TEXT NOT NULL DEFAULT 'dark' CHECK (theme IN ('dark','light')),
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_email       ON profiles(email);
CREATE INDEX idx_profiles_plan        ON profiles(plan);
CREATE INDEX idx_profiles_stripe_cust ON profiles(stripe_customer_id);
CREATE INDEX idx_profiles_reset_at    ON profiles(requests_reset_at);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING ((SELECT auth.uid()) = id);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK ((SELECT auth.uid()) = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING ((SELECT auth.uid()) = id);

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ═══════════════════════════════════════════════════════════════════════════════
-- USAGE TRACKING
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE usage_tracking (
  id         UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type       TEXT        NOT NULL CHECK (type IN ('summarize','chat','remix','brand_voice','image_prompt','calendar_event','export_notion','export_gdocs')),
  metadata   JSONB       NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_usage_user_id    ON usage_tracking(user_id);
CREATE INDEX idx_usage_created_at ON usage_tracking(created_at DESC);
CREATE INDEX idx_usage_type       ON usage_tracking(type);
CREATE INDEX idx_usage_user_date  ON usage_tracking(user_id, created_at DESC);

ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "usage_select_own" ON usage_tracking FOR SELECT USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "usage_insert_own" ON usage_tracking FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- API RATE LIMITS
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE api_rate_limits (
  id            UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  endpoint      TEXT        NOT NULL,
  window_start  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  request_count INTEGER     NOT NULL DEFAULT 1 CHECK (request_count >= 0),
  UNIQUE (user_id, endpoint, window_start)
);

CREATE INDEX idx_rate_limits_user_endpoint ON api_rate_limits(user_id, endpoint, window_start DESC);

ALTER TABLE api_rate_limits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rate_limits_select_own" ON api_rate_limits FOR SELECT USING ((SELECT auth.uid()) = user_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- BRAND VOICES
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE brand_voices (
  id          UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  description TEXT        CHECK (char_length(description) <= 500),
  samples     TEXT[]      NOT NULL DEFAULT '{}',
  tone        TEXT        CHECK (char_length(tone) <= 300),
  vocabulary  TEXT        CHECK (char_length(vocabulary) <= 300),
  personality TEXT        CHECK (char_length(personality) <= 300),
  is_active   BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_brand_voices_user_id ON brand_voices(user_id);
CREATE INDEX idx_brand_voices_active  ON brand_voices(user_id, is_active) WHERE is_active = TRUE;

ALTER TABLE brand_voices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "brand_voices_all_own" ON brand_voices FOR ALL USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE TRIGGER brand_voices_updated_at BEFORE UPDATE ON brand_voices FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════════
-- SUMMARIZER HISTORY
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE summarizer_history (
  id             UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  source_type    TEXT        NOT NULL CHECK (source_type IN ('youtube_url','paste_text')),
  source_url     TEXT        CHECK (source_url ~ '^https?://'),
  source_title   TEXT        CHECK (char_length(source_title) <= 500),
  input_text     TEXT        NOT NULL CHECK (char_length(input_text) <= 200000),
  summary_mode   TEXT        NOT NULL CHECK (char_length(summary_mode) <= 100),
  output_text    TEXT        NOT NULL,
  brand_voice_id UUID        REFERENCES brand_voices(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_summarizer_user_id    ON summarizer_history(user_id);
CREATE INDEX idx_summarizer_created_at ON summarizer_history(created_at DESC);

ALTER TABLE summarizer_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "summarizer_all_own" ON summarizer_history FOR ALL USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- REMIX HISTORY
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE remix_history (
  id             UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  input_text     TEXT        NOT NULL CHECK (char_length(input_text) <= 200000),
  outputs        JSONB       NOT NULL DEFAULT '{}'::JSONB,
  brand_voice_id UUID        REFERENCES brand_voices(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_remix_user_id    ON remix_history(user_id);
CREATE INDEX idx_remix_created_at ON remix_history(created_at DESC);

ALTER TABLE remix_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "remix_all_own" ON remix_history FOR ALL USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- CHAT SESSIONS + MESSAGES
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE chat_sessions (
  id         UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title      TEXT        NOT NULL DEFAULT 'New chat' CHECK (char_length(title) <= 200),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chat_sessions_user_id    ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_updated_at ON chat_sessions(user_id, updated_at DESC);

ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "chat_sessions_all_own" ON chat_sessions FOR ALL USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE TRIGGER chat_sessions_updated_at BEFORE UPDATE ON chat_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE chat_messages (
  id         UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID        NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role       TEXT        NOT NULL CHECK (role IN ('user','assistant','system')),
  content    TEXT        NOT NULL CHECK (char_length(content) <= 100000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_user_id    ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(session_id, created_at ASC);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "chat_messages_select_own" ON chat_messages FOR SELECT USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "chat_messages_insert_own" ON chat_messages FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "chat_messages_update_own" ON chat_messages FOR UPDATE USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "chat_messages_delete_own" ON chat_messages FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- CALENDAR EVENTS
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE calendar_events (
  id               UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title            TEXT        NOT NULL CHECK (char_length(title) BETWEEN 1 AND 300),
  description      TEXT        CHECK (char_length(description) <= 2000),
  platform         TEXT        CHECK (platform IN ('twitter','linkedin','instagram','youtube','newsletter','podcast','blog','tiktok','other')),
  content_text     TEXT        CHECK (char_length(content_text) <= 50000),
  scheduled_at     TIMESTAMPTZ NOT NULL,
  status           TEXT        NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','scheduled','published','cancelled')),
  remix_history_id UUID        REFERENCES remix_history(id) ON DELETE SET NULL,
  color            TEXT        NOT NULL DEFAULT '#f97316',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_calendar_user_id      ON calendar_events(user_id);
CREATE INDEX idx_calendar_scheduled_at ON calendar_events(user_id, scheduled_at);
CREATE INDEX idx_calendar_status       ON calendar_events(user_id, status);

ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "calendar_all_own" ON calendar_events FOR ALL USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE TRIGGER calendar_events_updated_at BEFORE UPDATE ON calendar_events FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════════
-- IMAGE PROMPTS
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE image_prompts (
  id          UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  source_text TEXT        NOT NULL CHECK (char_length(source_text) <= 50000),
  style       TEXT        CHECK (char_length(style) <= 100),
  platform    TEXT        CHECK (char_length(platform) <= 100),
  prompt_text TEXT        NOT NULL CHECK (char_length(prompt_text) <= 2000),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_image_prompts_user_id    ON image_prompts(user_id);
CREATE INDEX idx_image_prompts_created_at ON image_prompts(user_id, created_at DESC);

ALTER TABLE image_prompts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "image_prompts_all_own" ON image_prompts FOR ALL USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- SUBSCRIPTIONS
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE subscriptions (
  id                     UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id                UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT        NOT NULL UNIQUE,
  stripe_customer_id     TEXT        NOT NULL,
  stripe_price_id        TEXT        NOT NULL,
  status                 TEXT        NOT NULL CHECK (status IN ('active','canceled','incomplete','incomplete_expired','past_due','trialing','unpaid','paused')),
  current_period_start   TIMESTAMPTZ,
  current_period_end     TIMESTAMPTZ,
  cancel_at_period_end   BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id     ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_sub  ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_stripe_cust ON subscriptions(stripe_customer_id);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subscriptions_select_own" ON subscriptions FOR SELECT USING ((SELECT auth.uid()) = user_id);

CREATE TRIGGER subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════════
-- STRIPE WEBHOOK IDEMPOTENCY
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE processed_webhook_events (
  id           TEXT        NOT NULL PRIMARY KEY,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE processed_webhook_events ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════════════════════
-- FEEDBACK
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE feedback (
  id         UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  type       TEXT        NOT NULL DEFAULT 'general' CHECK (type IN ('bug','feature','general','billing')),
  message    TEXT        NOT NULL CHECK (char_length(message) BETWEEN 1 AND 5000),
  metadata   JSONB       NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_feedback_user_id    ON feedback(user_id);
CREATE INDEX idx_feedback_created_at ON feedback(created_at DESC);
CREATE INDEX idx_feedback_type       ON feedback(type);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "feedback_select_own"  ON feedback FOR SELECT USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "feedback_insert_anon" ON feedback FOR INSERT WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════════════════════
-- FUNCTION: increment_usage
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION increment_usage(
  p_user_id  UUID,
  p_type     TEXT,
  p_metadata JSONB DEFAULT '{}'::JSONB
)
RETURNS TABLE(allowed BOOLEAN, requests_used INTEGER, requests_limit INTEGER)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_plan  TEXT;
  v_limit INTEGER;
  v_used  INTEGER;
BEGIN
  SELECT plan, requests_used INTO v_plan, v_used
  FROM profiles WHERE id = p_user_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found for user %', p_user_id;
  END IF;

  v_limit := CASE WHEN v_plan = 'pro' THEN 1000 ELSE 100 END;

  IF v_used >= v_limit THEN
    RETURN QUERY SELECT FALSE, v_used, v_limit;
    RETURN;
  END IF;

  INSERT INTO usage_tracking (user_id, type, metadata) VALUES (p_user_id, p_type, p_metadata);
  UPDATE profiles SET requests_used = requests_used + 1 WHERE id = p_user_id;

  RETURN QUERY SELECT TRUE, v_used + 1, v_limit;
END;
$$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- FUNCTION: reset_monthly_usage
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE profiles
  SET requests_used = 0,
      requests_reset_at = date_trunc('month', NOW()) + INTERVAL '1 month'
  WHERE requests_reset_at <= NOW();
END;
$$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- FUNCTION: check_rate_limit
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION check_rate_limit(p_user_id UUID, p_endpoint TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_plan         TEXT;
  v_limit        INTEGER;
  v_window_start TIMESTAMPTZ;
  v_count        INTEGER;
BEGIN
  SELECT plan INTO v_plan FROM profiles WHERE id = p_user_id;
  v_limit        := CASE WHEN v_plan = 'pro' THEN 60 ELSE 20 END;
  v_window_start := date_trunc('minute', NOW());

  INSERT INTO api_rate_limits (user_id, endpoint, window_start, request_count)
  VALUES (p_user_id, p_endpoint, v_window_start, 1)
  ON CONFLICT (user_id, endpoint, window_start)
  DO UPDATE SET request_count = api_rate_limits.request_count + 1
  RETURNING request_count INTO v_count;

  RETURN v_count <= v_limit;
END;
$$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- FUNCTION: ensure_single_active_brand_voice
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION ensure_single_active_brand_voice()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.is_active = TRUE THEN
    UPDATE brand_voices SET is_active = FALSE
    WHERE user_id = NEW.user_id AND id <> NEW.id AND is_active = TRUE;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_single_active_voice
  BEFORE INSERT OR UPDATE OF is_active ON brand_voices
  FOR EACH ROW EXECUTE FUNCTION ensure_single_active_brand_voice();

-- ═══════════════════════════════════════════════════════════════════════════════
-- VIEW: dashboard_stats
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE VIEW dashboard_stats AS
SELECT
  p.id AS user_id,
  p.plan,
  p.requests_used,
  CASE WHEN p.plan = 'pro' THEN 1000 ELSE 100 END AS requests_limit,
  ROUND((p.requests_used::NUMERIC / NULLIF(CASE WHEN p.plan = 'pro' THEN 1000 ELSE 100 END, 0)) * 100, 1) AS usage_pct,
  COALESCE(COUNT(DISTINCT s.id) FILTER (WHERE s.created_at > NOW() - INTERVAL '30 days'), 0) AS summaries_this_month,
  COALESCE(COUNT(DISTINCT r.id) FILTER (WHERE r.created_at > NOW() - INTERVAL '30 days'), 0) AS remixes_this_month,
  COALESCE(COUNT(DISTINCT cm.id) FILTER (WHERE cm.role = 'user' AND cm.created_at > NOW() - INTERVAL '30 days'), 0) AS chats_this_month,
  COALESCE(COUNT(DISTINCT bv.id), 0) AS brand_voices_count,
  COALESCE(COUNT(DISTINCT ce.id) FILTER (WHERE ce.status = 'scheduled'), 0) AS scheduled_posts,
  p.requests_reset_at
FROM profiles p
LEFT JOIN summarizer_history s ON s.user_id = p.id
LEFT JOIN remix_history r ON r.user_id = p.id
LEFT JOIN chat_messages cm ON cm.user_id = p.id
LEFT JOIN brand_voices bv ON bv.user_id = p.id
LEFT JOIN calendar_events ce ON ce.user_id = p.id
GROUP BY p.id, p.plan, p.requests_used, p.requests_reset_at;
