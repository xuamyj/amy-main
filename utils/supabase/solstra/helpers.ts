import { SupabaseClient } from '@supabase/supabase-js'

// Types for Solstra game data
export interface DragonState {
  id?: number
  user_id?: string
  food_slots: number
  last_slot_increase: string
  status_line_index?: number
  last_status_change?: string
  created_at?: string
  updated_at?: string
}

export interface VillagerHarvest {
  id?: number
  user_id?: string
  villager_name: string
  harvest_date: string
  has_harvested: boolean
  created_at?: string
}

// Character names from the game content
export const VILLAGER_NAMES = ["Ajax", "Leonidas", "Banner", "Lana", "Sapphira", "Tessa"]

// Dragon feeding mechanics
export const FOOD_SLOTS_MAX = 3
export const HOURS_PER_SLOT = 8

/**
 * Get current Eastern Time zone date for day reset calculations
 * Reset time is 11 PM EDT
 */
export function getCurrentEasternDate(): Date {
  const now = new Date()
  const eastern = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}))
  
  // If it's before 11 PM, use current date. If after 11 PM, it's still "today" for game purposes
  const currentHour = eastern.getHours()
  if (currentHour >= 23) {
    // After 11 PM, advance to next day for reset purposes
    eastern.setDate(eastern.getDate() + 1)
  }
  
  return eastern
}

/**
 * Get the dragon's current state for the user
 */
export async function getDragonState(supabase: SupabaseClient, userId: string): Promise<DragonState> {
  const { data, error } = await supabase
    .from('solstra_dragon_state')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
    throw error
  }

  if (!data) {
    // Create initial state if none exists
    const initialState: DragonState = {
      user_id: userId,
      food_slots: 3, // Start with full food slots
      last_slot_increase: new Date().toISOString(),
      status_line_index: 0,
      last_status_change: new Date().toISOString()
    }

    const { data: newData, error: insertError } = await supabase
      .from('solstra_dragon_state')
      .insert(initialState)
      .select('*')
      .single()

    if (insertError) throw insertError
    return newData
  }

  return data
}

/**
 * Calculate current food slots based on time elapsed
 */
export function calculateCurrentFoodSlots(dragonState: DragonState): {
  currentSlots: number
  timeUntilNext: number // milliseconds until next slot
} {
  const lastIncrease = new Date(dragonState.last_slot_increase)
  const now = new Date()
  const timeDiff = now.getTime() - lastIncrease.getTime()
  const hoursElapsed = timeDiff / (1000 * 60 * 60)
  
  const slotsToAdd = Math.floor(hoursElapsed / HOURS_PER_SLOT)
  const currentSlots = Math.min(dragonState.food_slots + slotsToAdd, FOOD_SLOTS_MAX)
  
  // Calculate time until next slot increase
  const hoursUntilNext = HOURS_PER_SLOT - (hoursElapsed % HOURS_PER_SLOT)
  const timeUntilNext = hoursUntilNext * 60 * 60 * 1000

  return { currentSlots, timeUntilNext }
}

/**
 * Update dragon state with new food slot count (preserves timing)
 */
export async function updateDragonFoodSlots(
  supabase: SupabaseClient, 
  userId: string, 
  newSlots: number,
  preserveTiming: boolean = false
): Promise<DragonState> {
  const updateData: any = {
    food_slots: newSlots
  }
  
  // Only update timing if not preserving (for debug functions)
  if (!preserveTiming) {
    updateData.last_slot_increase = new Date().toISOString()
  }
  
  const { data, error } = await supabase
    .from('solstra_dragon_state')
    .update(updateData)
    .eq('user_id', userId)
    .select('*')
    .single()

  if (error) throw error
  return data
}

/**
 * Feed the dragon (reduce food slots by 1, resets timer only when going from 3->2 slots)
 */
export async function feedDragon(supabase: SupabaseClient, userId: string): Promise<DragonState> {
  const dragonState = await getDragonState(supabase, userId)
  const { currentSlots } = calculateCurrentFoodSlots(dragonState)
  
  if (currentSlots <= 0) {
    throw new Error("No food slots available")
  }

  const newSlots = currentSlots - 1
  const shouldResetTimer = currentSlots === 3 // Reset timer only when going from 3->2
  
  return updateDragonFoodSlots(supabase, userId, newSlots, !shouldResetTimer)
}

/**
 * Get today's harvest status for all villagers
 */
export async function getTodayVillagerHarvests(
  supabase: SupabaseClient, 
  userId: string
): Promise<VillagerHarvest[]> {
  const today = getCurrentEasternDate().toISOString().split('T')[0] // YYYY-MM-DD format

  const { data, error } = await supabase
    .from('solstra_villager_harvests')
    .select('*')
    .eq('user_id', userId)
    .eq('harvest_date', today)

  if (error) throw error
  return data || []
}

/**
 * Check if user has harvested from a specific villager today
 */
export async function hasHarvestedFromVillager(
  supabase: SupabaseClient,
  userId: string,
  villagerName: string
): Promise<boolean> {
  const today = getCurrentEasternDate().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('solstra_villager_harvests')
    .select('has_harvested')
    .eq('user_id', userId)
    .eq('villager_name', villagerName)
    .eq('harvest_date', today)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data?.has_harvested || false
}

/**
 * Mark villager as harvested for today
 */
export async function markVillagerHarvested(
  supabase: SupabaseClient,
  userId: string,
  villagerName: string
): Promise<VillagerHarvest> {
  const today = getCurrentEasternDate().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('solstra_villager_harvests')
    .upsert({
      user_id: userId,
      villager_name: villagerName,
      harvest_date: today,
      has_harvested: true
    })
    .select('*')
    .single()

  if (error) throw error
  return data
}

/**
 * Reset all villager harvests for today (debug function)
 */
export async function resetTodayVillagerHarvests(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  const today = getCurrentEasternDate().toISOString().split('T')[0]

  const { error } = await supabase
    .from('solstra_villager_harvests')
    .delete()
    .eq('user_id', userId)
    .eq('harvest_date', today)

  if (error) throw error
}

/**
 * Get current status line index, updating if an hour has passed
 */
export async function getCurrentStatusIndex(
  supabase: SupabaseClient,
  userId: string
): Promise<{ statusIndex: number; shouldUpdate: boolean }> {
  const dragonState = await getDragonState(supabase, userId)
  
  const lastStatusChange = dragonState.last_status_change ? 
    new Date(dragonState.last_status_change) : new Date()
  const now = new Date()
  const hoursSinceLastChange = (now.getTime() - lastStatusChange.getTime()) / (1000 * 60 * 60)
  
  if (hoursSinceLastChange >= 1) {
    // Update to new status index
    const newIndex = (dragonState.status_line_index || 0) + 1
    
    const { data, error } = await supabase
      .from('solstra_dragon_state')
      .update({
        status_line_index: newIndex,
        last_status_change: now.toISOString()
      })
      .eq('user_id', userId)
      .select('status_line_index')
      .single()

    if (error) throw error
    return { statusIndex: data.status_line_index, shouldUpdate: true }
  }
  
  return { statusIndex: dragonState.status_line_index || 0, shouldUpdate: false }
}

/**
 * Debug function to manually add a food slot
 */
export async function debugAddFoodSlot(
  supabase: SupabaseClient,
  userId: string
): Promise<DragonState> {
  const dragonState = await getDragonState(supabase, userId)
  const { currentSlots } = calculateCurrentFoodSlots(dragonState)
  const newSlots = Math.min(currentSlots + 1, FOOD_SLOTS_MAX)
  
  return updateDragonFoodSlots(supabase, userId, newSlots)
}