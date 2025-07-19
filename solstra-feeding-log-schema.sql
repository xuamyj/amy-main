-- Solstra Feeding Log Database Schema
-- Run this in Supabase SQL Editor

-- Table for tracking what foods Solis has tasted
CREATE TABLE IF NOT EXISTS solstra_feeding_log (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  food_name TEXT NOT NULL,
  first_tasted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one row per user/food combination
  UNIQUE(user_id, food_name)
);

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_solstra_feeding_log_user_food 
  ON solstra_feeding_log(user_id, food_name);

-- Enable Row Level Security
ALTER TABLE solstra_feeding_log ENABLE ROW LEVEL SECURITY;

-- RLS Policy - users can only access their own feeding log
CREATE POLICY "Users can access own feeding log" ON solstra_feeding_log
  FOR ALL USING (auth.uid() = user_id);