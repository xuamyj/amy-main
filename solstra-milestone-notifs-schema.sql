-- Schema for tracking milestone notifications in Solstra game
-- This prevents showing celebration modals multiple times

CREATE TABLE solstra_milestone_notifs (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone_type TEXT NOT NULL,
  notified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, milestone_type)
);

-- Add RLS (Row Level Security) policies
ALTER TABLE solstra_milestone_notifs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own milestone notifications
CREATE POLICY "Users can view own milestone notifications" ON solstra_milestone_notifs
    FOR ALL USING (auth.uid() = user_id);

-- Policy: Users can insert their own milestone notifications
CREATE POLICY "Users can insert own milestone notifications" ON solstra_milestone_notifs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX idx_solstra_milestone_notifs_user_milestone 
ON solstra_milestone_notifs(user_id, milestone_type);