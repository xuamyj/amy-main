-- Add status tracking columns to existing solstra_dragon_state table
-- Run this in Supabase SQL Editor

ALTER TABLE solstra_dragon_state 
ADD COLUMN IF NOT EXISTS status_line_index INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_status_change TIMESTAMP WITH TIME ZONE DEFAULT NOW();