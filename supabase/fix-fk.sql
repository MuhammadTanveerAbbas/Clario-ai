-- Fix Foreign Key Constraint
-- Run this in Supabase SQL Editor

-- Drop wrong constraint if exists
ALTER TABLE public.usage_stats DROP CONSTRAINT IF EXISTS usage_stats_user_id_fkey;

-- Add correct constraint
ALTER TABLE public.usage_stats 
ADD CONSTRAINT usage_stats_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
