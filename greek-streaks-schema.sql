-- Greek Learning Streaks Schema
-- Run this in Supabase SQL Editor AFTER running greek-schema.sql and greek-history-schema.sql

-- Table for tracking weekly learning activity
CREATE TABLE IF NOT EXISTS greek_weekly_activity (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL, -- Monday of the week (ISO week)
  words_added INTEGER DEFAULT 0,
  words_updated INTEGER DEFAULT 0,
  has_activity BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one row per user per week
  UNIQUE(user_id, week_start)
);

-- Enable Row Level Security
ALTER TABLE greek_weekly_activity ENABLE ROW LEVEL SECURITY;

-- RLS Policies for weekly activity table
CREATE POLICY "Users can view their own weekly activity" ON greek_weekly_activity
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own weekly activity" ON greek_weekly_activity
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weekly activity" ON greek_weekly_activity
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own weekly activity" ON greek_weekly_activity
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger to auto-update updated_at timestamp
CREATE TRIGGER update_greek_weekly_activity_updated_at
  BEFORE UPDATE ON greek_weekly_activity
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for weekly activity
CREATE INDEX IF NOT EXISTS idx_greek_weekly_activity_user_id ON greek_weekly_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_greek_weekly_activity_week_start ON greek_weekly_activity(user_id, week_start DESC);

-- Function to get the Monday of the ISO week for any date
CREATE OR REPLACE FUNCTION get_week_start(input_date DATE)
RETURNS DATE AS $$
BEGIN
  -- Get Monday of the ISO week
  RETURN input_date - INTERVAL '1 day' * ((EXTRACT(DOW FROM input_date)::integer + 6) % 7);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update weekly activity when vocabulary changes
CREATE OR REPLACE FUNCTION update_weekly_activity()
RETURNS TRIGGER AS $$
DECLARE
  week_monday DATE;
  activity_exists BOOLEAN;
BEGIN
  -- Get the Monday of the current week
  week_monday := get_week_start(CURRENT_DATE);
  
  -- Check if we already have activity for this week
  SELECT EXISTS(
    SELECT 1 FROM greek_weekly_activity 
    WHERE user_id = COALESCE(NEW.user_id, OLD.user_id) 
    AND week_start = week_monday
  ) INTO activity_exists;
  
  -- Insert or update weekly activity
  IF activity_exists THEN
    UPDATE greek_weekly_activity 
    SET 
      words_added = words_added + CASE WHEN TG_OP = 'INSERT' THEN 1 ELSE 0 END,
      words_updated = words_updated + CASE WHEN TG_OP = 'UPDATE' THEN 1 ELSE 0 END,
      has_activity = TRUE,
      updated_at = NOW()
    WHERE user_id = COALESCE(NEW.user_id, OLD.user_id) 
    AND week_start = week_monday;
  ELSE
    INSERT INTO greek_weekly_activity (user_id, week_start, words_added, words_updated, has_activity)
    VALUES (
      COALESCE(NEW.user_id, OLD.user_id), 
      week_monday,
      CASE WHEN TG_OP = 'INSERT' THEN 1 ELSE 0 END,
      CASE WHEN TG_OP = 'UPDATE' THEN 1 ELSE 0 END,
      TRUE
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically track weekly activity on vocabulary changes
CREATE TRIGGER track_weekly_vocabulary_activity
  AFTER INSERT OR UPDATE ON greek_vocabulary
  FOR EACH ROW EXECUTE FUNCTION update_weekly_activity();