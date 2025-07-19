-- Migration to Time Marker (TM) hunger system
-- This replaces the food_slots + last_slot_increase system with a single time marker

-- Drop old columns and add new hunger_time_marker column
ALTER TABLE solstra_dragon_state 
DROP COLUMN food_slots,
DROP COLUMN last_slot_increase,
ADD COLUMN hunger_time_marker TIMESTAMP WITH TIME ZONE DEFAULT (NOW() - INTERVAL '24 hours');

-- Set existing records to have full hunger (3 available eats)
UPDATE solstra_dragon_state 
SET hunger_time_marker = NOW() - INTERVAL '24 hours'
WHERE hunger_time_marker IS NULL;

-- Add comment explaining the TM system
COMMENT ON COLUMN solstra_dragon_state.hunger_time_marker IS 
'Time marker for hunger calculation. 
current_time > TM+24h = 3 eats available
TM+16h ≤ current_time ≤ TM+24h = 2 eats available  
TM+8h ≤ current_time ≤ TM+16h = 1 eat available
current_time < TM+8h = 0 eats available';