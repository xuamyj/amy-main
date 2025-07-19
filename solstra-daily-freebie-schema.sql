-- Add daily freebie tracking to existing solstra_villager_harvests table
-- This tracks whether the user has received their guaranteed new item for the day

ALTER TABLE solstra_villager_harvests 
ADD COLUMN daily_freebie_used BOOLEAN DEFAULT FALSE;

-- Update existing records to set default value
UPDATE solstra_villager_harvests 
SET daily_freebie_used = FALSE 
WHERE daily_freebie_used IS NULL;