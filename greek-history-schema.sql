-- Greek Vocabulary History Tracking Schema
-- Run this in Supabase SQL Editor AFTER running greek-schema.sql

-- Table for tracking vocabulary progress over time
CREATE TABLE IF NOT EXISTS greek_vocabulary_history (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word_count INTEGER NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security for history table
ALTER TABLE greek_vocabulary_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for history table
CREATE POLICY "Users can view their own vocabulary history" ON greek_vocabulary_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vocabulary history" ON greek_vocabulary_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vocabulary history" ON greek_vocabulary_history
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vocabulary history" ON greek_vocabulary_history
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for history table
CREATE INDEX IF NOT EXISTS idx_greek_vocabulary_history_user_id ON greek_vocabulary_history(user_id);
CREATE INDEX IF NOT EXISTS idx_greek_vocabulary_history_recorded_at ON greek_vocabulary_history(user_id, recorded_at DESC);