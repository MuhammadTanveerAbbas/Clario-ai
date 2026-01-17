-- Fix RLS Performance Issues
-- Run this in Supabase SQL Editor

-- ============================================
-- FIX: Wrap auth.uid() in SELECT for performance
-- ============================================

-- Profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING ((SELECT auth.uid()) = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING ((SELECT auth.uid()) = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK ((SELECT auth.uid()) = id);

-- AI Summaries
DROP POLICY IF EXISTS "Users can view own summaries" ON public.ai_summaries;
DROP POLICY IF EXISTS "Users can insert own summaries" ON public.ai_summaries;
DROP POLICY IF EXISTS "Users can delete own summaries" ON public.ai_summaries;
CREATE POLICY "Users can view own summaries" ON public.ai_summaries FOR SELECT USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can insert own summaries" ON public.ai_summaries FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can delete own summaries" ON public.ai_summaries FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- Chat Messages
DROP POLICY IF EXISTS "Users can view own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can insert own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can delete own messages" ON public.chat_messages;
CREATE POLICY "Users can view own messages" ON public.chat_messages FOR SELECT USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can insert own messages" ON public.chat_messages FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can delete own messages" ON public.chat_messages FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- Writing Sessions (Remove duplicates, keep optimized ones)
DROP POLICY IF EXISTS "Users can view own sessions" ON public.writing_sessions;
DROP POLICY IF EXISTS "Users can view own writing" ON public.writing_sessions;
DROP POLICY IF EXISTS "Users can insert own sessions" ON public.writing_sessions;
DROP POLICY IF EXISTS "Users can insert own writing" ON public.writing_sessions;
DROP POLICY IF EXISTS "Users can delete own sessions" ON public.writing_sessions;
CREATE POLICY "Users can view own writing" ON public.writing_sessions FOR SELECT USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can insert own writing" ON public.writing_sessions FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can delete own writing" ON public.writing_sessions FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- Meeting Notes (Remove duplicates, keep optimized ones)
DROP POLICY IF EXISTS "Users can view own meeting notes" ON public.meeting_notes;
DROP POLICY IF EXISTS "Users can view own meetings" ON public.meeting_notes;
DROP POLICY IF EXISTS "Users can insert own meeting notes" ON public.meeting_notes;
DROP POLICY IF EXISTS "Users can insert own meetings" ON public.meeting_notes;
DROP POLICY IF EXISTS "Users can update own meeting notes" ON public.meeting_notes;
DROP POLICY IF EXISTS "Users can delete own meeting notes" ON public.meeting_notes;
CREATE POLICY "Users can view own meetings" ON public.meeting_notes FOR SELECT USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can insert own meetings" ON public.meeting_notes FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can update own meetings" ON public.meeting_notes FOR UPDATE USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can delete own meetings" ON public.meeting_notes FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- Usage Stats
DROP POLICY IF EXISTS "Users can view own usage stats" ON public.usage_stats;
DROP POLICY IF EXISTS "Users can insert own usage stats" ON public.usage_stats;
DROP POLICY IF EXISTS "Users can update own usage stats" ON public.usage_stats;
CREATE POLICY "Users can view own usage stats" ON public.usage_stats FOR SELECT USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can insert own usage stats" ON public.usage_stats FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can update own usage stats" ON public.usage_stats FOR UPDATE USING ((SELECT auth.uid()) = user_id);

-- Quick Notes
DROP POLICY IF EXISTS "Users can view own notes" ON public.quick_notes;
DROP POLICY IF EXISTS "Users can insert own notes" ON public.quick_notes;
DROP POLICY IF EXISTS "Users can update own notes" ON public.quick_notes;
DROP POLICY IF EXISTS "Users can delete own notes" ON public.quick_notes;
CREATE POLICY "Users can view own notes" ON public.quick_notes FOR SELECT USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can insert own notes" ON public.quick_notes FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can update own notes" ON public.quick_notes FOR UPDATE USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can delete own notes" ON public.quick_notes FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- Feedback (Remove duplicate, keep one optimized)
DROP POLICY IF EXISTS "Anyone can insert feedback" ON public.feedback;
DROP POLICY IF EXISTS "Service role can insert feedback" ON public.feedback;
DROP POLICY IF EXISTS "Users can view own feedback" ON public.feedback;
CREATE POLICY "Users can view own feedback" ON public.feedback FOR SELECT USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Anyone can insert feedback" ON public.feedback FOR INSERT WITH CHECK (true);

-- ============================================
-- DONE - All performance issues fixed
-- ============================================
