import { SupabaseClient } from '@supabase/supabase-js'

// Types for Solstra game data
export interface DragonState {
  id?: number
  user_id?: string
  hunger_time_marker: string
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

export interface InventoryItem {
  id?: number
  user_id?: string
  item_name: string
  received_from: string
  received_at?: string
  created_at?: string
}

export interface FeedingLogEntry {
  id?: number
  user_id?: string
  food_name: string
  first_tasted_at?: string
  created_at?: string
}

// Character names from the game content
export const VILLAGER_NAMES = ["Evander", "Leonidas", "Banner", "Lana", "Sapphira", "Tessa"]

// All possible foods that Solis can taste (in character order)
export const ALL_FOODS = [
  // Evander (liquids)
  "Honey", "Wine", "Vinegar", "Olive Oil",
  // Tessa (flour/vegetables) 
  "Flour", "Celery", "Corn", "Tomato", "Zucchini", "Onion", "Bell Pepper", "Eggplant",
  // Banner (fruits)
  "Orange", "Strawberry", "Lemon", "Apple", "Grape", "Pomegranate",
  // Leonidas (fish)
  "Fish",
  // Sapphira (herbs)
  "Laurel", "Mint", "Oregano", "Dill", "Parsley", "Basil", "Rosemary", "Garlic",
  // Lana (flowers)
  "Crocus", "Chaste-Flower", "Myrtle", "Rose", "Morning Glory", "Poppy", "Amaranth", "Asphodel"
]

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
    // Create initial state if none exists - TM set to current_time - 24h for 3 available eats
    const now = new Date()
    const initialTimeMarker = new Date(now.getTime() - (24 * 60 * 60 * 1000))
    
    const initialState: DragonState = {
      user_id: userId,
      hunger_time_marker: initialTimeMarker.toISOString(),
      status_line_index: 0,
      last_status_change: now.toISOString()
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
 * Calculate current food slots based on Time Marker (TM) system
 * TM+24h+ = 3 slots, TM+16h-24h = 2 slots, TM+8h-16h = 1 slot, TM+0h-8h = 0 slots
 */
export function calculateCurrentFoodSlots(dragonState: DragonState): {
  currentSlots: number
  timeUntilNext: number // milliseconds until next slot
} {
  const timeMarker = new Date(dragonState.hunger_time_marker)
  const now = new Date()
  const hoursFromTM = (now.getTime() - timeMarker.getTime()) / (1000 * 60 * 60)
  
  let currentSlots: number
  let nextSlotAtHours: number // hours from TM when next slot becomes available
  
  if (hoursFromTM >= 24) {
    currentSlots = 3
    nextSlotAtHours = 24 // Already at max, next "slot" would be at 24h (but we're already past it)
  } else if (hoursFromTM >= 16) {
    currentSlots = 2
    nextSlotAtHours = 24 // Next slot at TM+24h
  } else if (hoursFromTM >= 8) {
    currentSlots = 1
    nextSlotAtHours = 16 // Next slot at TM+16h
  } else {
    currentSlots = 0
    nextSlotAtHours = 8 // Next slot at TM+8h
  }
  
  // Calculate time until next slot (only meaningful if not at max)
  let timeUntilNext = 0
  if (currentSlots < 3) {
    const hoursUntilNext = nextSlotAtHours - hoursFromTM
    timeUntilNext = hoursUntilNext * 60 * 60 * 1000
  }

  return { currentSlots, timeUntilNext }
}

/**
 * Update dragon state with new Time Marker (TM)
 */
export async function updateDragonTimeMarker(
  supabase: SupabaseClient, 
  userId: string, 
  newTimeMarker: Date
): Promise<DragonState> {
  const { data, error } = await supabase
    .from('solstra_dragon_state')
    .update({
      hunger_time_marker: newTimeMarker.toISOString()
    })
    .eq('user_id', userId)
    .select('*')
    .single()

  if (error) throw error
  return data
}

/**
 * Feed the dragon using Time Marker (TM) system
 * 3→2: TM = current_time - 16h (resets timer)
 * 2→1: TM = TM + 8h (preserves timing)  
 * 1→0: TM = TM + 8h (preserves timing)
 */
export async function feedDragon(supabase: SupabaseClient, userId: string): Promise<DragonState> {
  const dragonState = await getDragonState(supabase, userId)
  const { currentSlots } = calculateCurrentFoodSlots(dragonState)
  
  if (currentSlots <= 0) {
    throw new Error("No food slots available")
  }

  const currentTime = new Date()
  const currentTM = new Date(dragonState.hunger_time_marker)
  let newTimeMarker: Date

  if (currentSlots === 3) {
    // 3→2: Reset timer - set TM to current_time - 16h
    newTimeMarker = new Date(currentTime.getTime() - (16 * 60 * 60 * 1000))
  } else {
    // 2→1 or 1→0: Preserve timing - set TM to TM + 8h
    newTimeMarker = new Date(currentTM.getTime() + (8 * 60 * 60 * 1000))
  }
  
  return updateDragonTimeMarker(supabase, userId, newTimeMarker)
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
 * Get current status line index, updating exactly on the hour
 */
export async function getCurrentStatusIndex(
  supabase: SupabaseClient,
  userId: string
): Promise<{ statusIndex: number; shouldUpdate: boolean }> {
  const dragonState = await getDragonState(supabase, userId)
  
  const lastStatusChange = dragonState.last_status_change ? 
    new Date(dragonState.last_status_change) : new Date()
  const now = new Date()
  
  // Check if we've crossed an hour boundary (e.g., 2:59 -> 3:00)
  const lastHour = lastStatusChange.getHours()
  const currentHour = now.getHours()
  const lastDay = lastStatusChange.getDate()
  const currentDay = now.getDate()
  
  // Update if we're in a different hour, or if it's a new day
  const shouldUpdate = (currentHour !== lastHour) || (currentDay !== lastDay)
  
  if (shouldUpdate) {
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
 * Debug function to manually add a food slot by shifting TM back 8 hours
 */
export async function debugAddFoodSlot(
  supabase: SupabaseClient,
  userId: string
): Promise<DragonState> {
  const dragonState = await getDragonState(supabase, userId)
  const { currentSlots } = calculateCurrentFoodSlots(dragonState)
  
  // If already at max, no change needed
  if (currentSlots >= FOOD_SLOTS_MAX) {
    return dragonState
  }
  
  // Simple: TM = TM - 8h to add one slot level
  const currentTM = new Date(dragonState.hunger_time_marker)
  const newTimeMarker = new Date(currentTM.getTime() - (8 * 60 * 60 * 1000))
  
  return updateDragonTimeMarker(supabase, userId, newTimeMarker)
}

/**
 * Add an item to user's inventory
 */
export async function addItemToInventory(
  supabase: SupabaseClient,
  userId: string,
  itemName: string,
  receivedFrom: string
): Promise<InventoryItem> {
  const { data, error } = await supabase
    .from('solstra_user_inventory')
    .insert({
      user_id: userId,
      item_name: itemName,
      received_from: receivedFrom
    })
    .select('*')
    .single()

  if (error) throw error
  return data
}

/**
 * Get user's inventory with item counts
 */
export async function getUserInventory(
  supabase: SupabaseClient,
  userId: string
): Promise<{ item_name: string; count: number; received_from: string }[]> {
  const { data, error } = await supabase
    .from('solstra_user_inventory')
    .select('item_name, received_from')
    .eq('user_id', userId)
    .order('received_at', { ascending: true })

  if (error) throw error
  
  // Group items by name and count quantities
  const itemCounts: Record<string, { count: number; received_from: string }> = {}
  
  data?.forEach(item => {
    if (itemCounts[item.item_name]) {
      itemCounts[item.item_name].count++
    } else {
      itemCounts[item.item_name] = {
        count: 1,
        received_from: item.received_from
      }
    }
  })
  
  return Object.entries(itemCounts).map(([item_name, { count, received_from }]) => ({
    item_name,
    count,
    received_from
  }))
}

/**
 * Get item ordering priority based on character harvest order
 * Order: Evander (liquids) -> Tessa (flour/vegetables) -> Banner (fruits) -> Leonidas (fish) -> Sapphira (herbs) -> Lana (flowers)
 */
export function getItemOrderPriority(itemName: string): number {
  // Define character ordering priority
  const characterOrder = ["Evander", "Tessa", "Banner", "Leonidas", "Sapphira", "Lana"]
  
  // Import the item mapping from game content
  const itemToCharacterMap: Record<string, string> = {
    // Evander items (liquids)
    "Honey": "Evander", "Wine": "Evander", "Vinegar": "Evander", "Olive Oil": "Evander",
    // Tessa items (flour/vegetables) 
    "Flour": "Tessa", "Celery": "Tessa", "Corn": "Tessa", "Tomato": "Tessa", 
    "Zucchini": "Tessa", "Onion": "Tessa", "Bell Pepper": "Tessa", "Eggplant": "Tessa",
    // Banner items (fruits)
    "Orange": "Banner", "Strawberry": "Banner", "Lemon": "Banner", "Apple": "Banner", 
    "Grape": "Banner", "Pomegranate": "Banner",
    // Leonidas items (fish)
    "Fish": "Leonidas",
    // Sapphira items (herbs)
    "Laurel": "Sapphira", "Mint": "Sapphira", "Oregano": "Sapphira", "Dill": "Sapphira", 
    "Parsley": "Sapphira", "Basil": "Sapphira", "Rosemary": "Sapphira", "Garlic": "Sapphira",
    // Lana items (flowers)
    "Crocus": "Lana", "Chaste-Flower": "Lana", "Myrtle": "Lana", "Rose": "Lana", 
    "Morning Glory": "Lana", "Poppy": "Lana", "Amaranth": "Lana", "Asphodel": "Lana"
  }
  
  const character = itemToCharacterMap[itemName]
  if (!character) return 999 // Unknown items go to end
  
  const characterPriority = characterOrder.indexOf(character)
  return characterPriority === -1 ? 999 : characterPriority
}

/**
 * Get user's inventory sorted by game content order
 */
export async function getUserInventorySorted(
  supabase: SupabaseClient,
  userId: string
): Promise<{ item_name: string; count: number; received_from: string }[]> {
  const inventory = await getUserInventory(supabase, userId)
  
  return inventory.sort((a, b) => {
    const priorityA = getItemOrderPriority(a.item_name)
    const priorityB = getItemOrderPriority(b.item_name)
    
    if (priorityA !== priorityB) {
      return priorityA - priorityB
    }
    
    // If same character, sort alphabetically
    return a.item_name.localeCompare(b.item_name)
  })
}

/**
 * Remove one item from user's inventory by item name
 */
export async function removeItemFromInventory(
  supabase: SupabaseClient,
  userId: string,
  itemName: string
): Promise<void> {
  // Get the oldest item of this type to remove (FIFO)
  const { data, error: selectError } = await supabase
    .from('solstra_user_inventory')
    .select('id')
    .eq('user_id', userId)
    .eq('item_name', itemName)
    .order('received_at', { ascending: true })
    .limit(1)
    .single()

  if (selectError) throw selectError
  if (!data) throw new Error(`No ${itemName} found in inventory`)

  // Delete the specific item
  const { error: deleteError } = await supabase
    .from('solstra_user_inventory')
    .delete()
    .eq('id', data.id)

  if (deleteError) throw deleteError
}

/**
 * Clear all items from user's inventory (debug function)
 */
export async function clearUserInventory(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from('solstra_user_inventory')
    .delete()
    .eq('user_id', userId)

  if (error) throw error
}

/**
 * Check if Solis has tasted a specific food
 */
export async function hasTastedFood(
  supabase: SupabaseClient,
  userId: string,
  foodName: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('solstra_feeding_log')
    .select('food_name')
    .eq('user_id', userId)
    .eq('food_name', foodName)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return !!data
}

/**
 * Record that Solis has tasted a new food
 */
export async function recordFoodTasted(
  supabase: SupabaseClient,
  userId: string,
  foodName: string
): Promise<FeedingLogEntry> {
  const { data, error } = await supabase
    .from('solstra_feeding_log')
    .insert({
      user_id: userId,
      food_name: foodName
    })
    .select('*')
    .single()

  if (error) throw error
  return data
}

/**
 * Get user's complete feeding log with all foods
 */
export async function getUserFeedingLog(
  supabase: SupabaseClient,
  userId: string
): Promise<{ food_name: string; has_tasted: boolean }[]> {
  const { data, error } = await supabase
    .from('solstra_feeding_log')
    .select('food_name')
    .eq('user_id', userId)

  if (error) throw error
  
  const tastedFoods = new Set(data?.map(entry => entry.food_name) || [])
  
  return ALL_FOODS.map(food => ({
    food_name: food,
    has_tasted: tastedFoods.has(food)
  }))
}

/**
 * Clear user's feeding log (debug function)
 */
export async function clearUserFeedingLog(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from('solstra_feeding_log')
    .delete()
    .eq('user_id', userId)

  if (error) throw error
}

// ============================================================================
// MILESTONE NOTIFICATION FUNCTIONS
// ============================================================================

/**
 * Check if a milestone has already been notified to the user
 */
export async function checkMilestoneNotified(
  supabase: SupabaseClient,
  userId: string,
  milestoneType: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('solstra_milestone_notifs')
    .select('id')
    .eq('user_id', userId)
    .eq('milestone_type', milestoneType)
    .maybeSingle()

  if (error) throw error
  return data !== null
}

/**
 * Mark a milestone as notified for the user
 */
export async function markMilestoneNotified(
  supabase: SupabaseClient,
  userId: string,
  milestoneType: string
): Promise<void> {
  const { error } = await supabase
    .from('solstra_milestone_notifs')
    .insert({
      user_id: userId,
      milestone_type: milestoneType
    })

  if (error) throw error
}

/**
 * Check if user has completed the feeding log (tasted all 30 foods)
 */
export async function checkFeedingLogComplete(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const feedingLog = await getUserFeedingLog(supabase, userId)
  return feedingLog.every(entry => entry.has_tasted)
}

/**
 * Check if user should see the feeding log completion celebration
 * Returns true if: feeding log is complete AND not previously notified
 */
export async function shouldShowFeedingLogCelebration(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const isComplete = await checkFeedingLogComplete(supabase, userId)
  if (!isComplete) return false
  
  const alreadyNotified = await checkMilestoneNotified(supabase, userId, 'feeding_log_complete')
  return !alreadyNotified
}

// ============================================================================
// DAILY FREEBIE SYSTEM
// ============================================================================

/**
 * Check if user has used their daily freebie (guaranteed new item)
 */
export async function checkDailyFreebieUsed(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const today = getCurrentEasternDate().toISOString().split('T')[0] // YYYY-MM-DD format
  
  const { data, error } = await supabase
    .from('solstra_villager_harvests')
    .select('daily_freebie_used')
    .eq('user_id', userId)
    .eq('harvest_date', today)
    .eq('daily_freebie_used', true)
    .maybeSingle()

  if (error) throw error
  return data !== null
}

/**
 * Mark that user has used their daily freebie
 */
export async function markDailyFreebieUsed(
  supabase: SupabaseClient,
  userId: string,
  villagerName: string
): Promise<void> {
  const today = getCurrentEasternDate().toISOString().split('T')[0] // YYYY-MM-DD format
  
  const { error } = await supabase
    .from('solstra_villager_harvests')
    .update({ daily_freebie_used: true })
    .eq('user_id', userId)
    .eq('villager_name', villagerName)
    .eq('harvest_date', today)

  if (error) throw error
}

/**
 * Get items that a villager can provide that the player hasn't tasted yet
 */
export async function getUntastedItemsForVillager(
  supabase: SupabaseClient,
  userId: string,
  villagerName: string
): Promise<string[]> {
  // Get what foods the user has already tasted
  const { data: tastedData, error: tastedError } = await supabase
    .from('solstra_feeding_log')
    .select('food_name')
    .eq('user_id', userId)

  if (tastedError) throw tastedError
  
  const tastedFoods = new Set(tastedData.map(row => row.food_name))
  
  // Get items this villager can provide
  const itemToCharacterMap: Record<string, string> = {
    // Evander items (liquids)
    "Honey": "Evander", "Wine": "Evander", "Vinegar": "Evander", "Olive Oil": "Evander",
    // Tessa items (flour/vegetables) 
    "Flour": "Tessa", "Celery": "Tessa", "Corn": "Tessa", "Tomato": "Tessa", 
    "Zucchini": "Tessa", "Onion": "Tessa", "Bell Pepper": "Tessa", "Eggplant": "Tessa",
    // Banner items (fruits)
    "Orange": "Banner", "Strawberry": "Banner", "Lemon": "Banner", "Apple": "Banner", 
    "Grape": "Banner", "Pomegranate": "Banner",
    // Leonidas items (fish)
    "Fish": "Leonidas",
    // Sapphira items (herbs)
    "Laurel": "Sapphira", "Mint": "Sapphira", "Oregano": "Sapphira", "Dill": "Sapphira", 
    "Parsley": "Sapphira", "Basil": "Sapphira", "Rosemary": "Sapphira", "Garlic": "Sapphira",
    // Lana items (flowers)
    "Crocus": "Lana", "Chaste-Flower": "Lana", "Myrtle": "Lana", "Rose": "Lana", 
    "Morning Glory": "Lana", "Poppy": "Lana", "Amaranth": "Lana", "Asphodel": "Lana"
  }
  
  // Filter to items this villager provides that haven't been tasted
  const villagerItems = ALL_FOODS.filter(food => 
    itemToCharacterMap[food] === villagerName && !tastedFoods.has(food)
  )
  
  return villagerItems
}