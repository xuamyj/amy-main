-- Solstra Game Database Schema
-- Run this in Supabase SQL Editor

-- Table for tracking dragon hunger/feeding state
CREATE TABLE IF NOT EXISTS solstra_dragon_state (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  food_slots INTEGER DEFAULT 0 CHECK (food_slots >= 0 AND food_slots <= 3),
  last_slot_increase TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for tracking villager harvest status
CREATE TABLE IF NOT EXISTS solstra_villager_harvests (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  villager_name TEXT NOT NULL,
  harvest_date DATE DEFAULT CURRENT_DATE,
  has_harvested BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one row per user/villager/date
  UNIQUE(user_id, villager_name, harvest_date)
);

-- Enable Row Level Security
ALTER TABLE solstra_dragon_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE solstra_villager_harvests ENABLE ROW LEVEL SECURITY;

-- RLS Policies - users can only access their own data
CREATE POLICY "Users can access own dragon state" ON solstra_dragon_state
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own villager harvests" ON solstra_villager_harvests
  FOR ALL USING (auth.uid() = user_id);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for auto-updating updated_at
CREATE TRIGGER update_solstra_dragon_state_updated_at
  BEFORE UPDATE ON solstra_dragon_state
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();