-- Greek Word Counter Database Schema
-- Run this in Supabase SQL Editor

-- Table for storing user's Greek vocabulary entries
CREATE TABLE IF NOT EXISTS greek_vocabulary (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  english_word TEXT NOT NULL,
  greek_word TEXT NOT NULL,
  transliteration TEXT NOT NULL,
  word_type TEXT NOT NULL CHECK (word_type IN ('noun', 'verb', 'adjective', 'adverb', 'number', 'other')),
  knowledge_level TEXT NOT NULL CHECK (knowledge_level IN ('Full know', 'Almost full or with errors', 'Moderate know', 'Recent touch')) DEFAULT 'Moderate know',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE greek_vocabulary ENABLE ROW LEVEL SECURITY;

-- RLS Policies - users can only access their own vocabulary
CREATE POLICY "Users can view their own vocabulary" ON greek_vocabulary
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vocabulary" ON greek_vocabulary
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vocabulary" ON greek_vocabulary
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vocabulary" ON greek_vocabulary
  FOR DELETE USING (auth.uid() = user_id);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for auto-updating updated_at
CREATE TRIGGER update_greek_vocabulary_updated_at
  BEFORE UPDATE ON greek_vocabulary
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_greek_vocabulary_user_id ON greek_vocabulary(user_id);
CREATE INDEX IF NOT EXISTS idx_greek_vocabulary_word_type ON greek_vocabulary(user_id, word_type);
CREATE INDEX IF NOT EXISTS idx_greek_vocabulary_knowledge_level ON greek_vocabulary(user_id, knowledge_level);
CREATE INDEX IF NOT EXISTS idx_greek_vocabulary_created_at ON greek_vocabulary(user_id, created_at DESC);

-- Create text search indexes for faster searching
CREATE INDEX IF NOT EXISTS idx_greek_vocabulary_english_word ON greek_vocabulary 
  USING gin(to_tsvector('english', english_word));
CREATE INDEX IF NOT EXISTS idx_greek_vocabulary_greek_word ON greek_vocabulary 
  USING gin(to_tsvector('simple', greek_word));
CREATE INDEX IF NOT EXISTS idx_greek_vocabulary_transliteration ON greek_vocabulary 
  USING gin(to_tsvector('simple', transliteration));