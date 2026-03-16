-- Migration: Multi-Map Support
-- Run this AFTER supabase_schema.sql has been applied

-- 1. Add name column
ALTER TABLE public.testing_maps
  ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT 'Untitled Map';

-- 2. Drop the unique user constraint to allow multiple maps per user
ALTER TABLE public.testing_maps
  DROP CONSTRAINT IF EXISTS unique_user_map;

-- 3. Add index for listing maps by user efficiently
CREATE INDEX IF NOT EXISTS idx_testing_maps_user_id
  ON public.testing_maps (user_id, updated_at DESC);
