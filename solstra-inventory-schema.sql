-- Solstra Inventory System Database Schema
-- Run this in Supabase SQL Editor

-- Table for storing user inventory items
CREATE TABLE IF NOT EXISTS solstra_user_inventory (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  received_from TEXT NOT NULL,
  received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_solstra_inventory_user_received 
  ON solstra_user_inventory(user_id, received_at);
CREATE INDEX IF NOT EXISTS idx_solstra_inventory_user_item 
  ON solstra_user_inventory(user_id, item_name);

-- Enable Row Level Security
ALTER TABLE solstra_user_inventory ENABLE ROW LEVEL SECURITY;

-- RLS Policy - users can only access their own inventory
CREATE POLICY "Users can access own inventory" ON solstra_user_inventory
  FOR ALL USING (auth.uid() = user_id);