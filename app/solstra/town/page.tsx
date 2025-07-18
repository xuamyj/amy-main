"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { getUserId } from "@/utils/supabase/amy/helpers";
import { 
  hasHarvestedFromVillager, 
  markVillagerHarvested,
  VILLAGER_NAMES 
} from "@/utils/supabase/solstra/helpers";
import { 
  getRandomStandingLine,
  getRandomGreetingLine,
  getRandomHarvestLine,
  getRandomHarvestItem
} from "@/utils/solstra/game-content";

interface VillagerState {
  name: string;
  standingLine: string;
  hasHarvested: boolean;
  isLoading: boolean;
}

export default function TownPage() {
  const [villagers, setVillagers] = useState<VillagerState[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const supabase = createClient();

  // Initialize villagers with random standing lines
  const initializeVillagers = async () => {
    if (!userId) return;

    try {
      const villagerStates: VillagerState[] = [];
      
      for (const name of VILLAGER_NAMES) {
        const hasHarvested = await hasHarvestedFromVillager(supabase, userId, name);
        villagerStates.push({
          name,
          standingLine: getRandomStandingLine(),
          hasHarvested,
          isLoading: false
        });
      }
      
      setVillagers(villagerStates);
    } catch (error) {
      console.error("Error initializing villagers:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle talking to a villager (harvest interaction)
  const handleTalkToVillager = async (villagerName: string) => {
    if (!userId) return;

    // Update UI to show loading state
    setVillagers(prev => prev.map(v => 
      v.name === villagerName 
        ? { ...v, isLoading: true }
        : v
    ));

    try {
      const hasHarvested = await hasHarvestedFromVillager(supabase, userId, villagerName);
      
      if (!hasHarvested) {
        // Mark as harvested and show harvest message
        await markVillagerHarvested(supabase, userId, villagerName);
        const harvestItem = getRandomHarvestItem(villagerName);
        const harvestLine = getRandomHarvestLine(villagerName);
        
        alert(`${harvestLine}\n\nYou received: ${harvestItem}`);
        
        // Update villager state
        setVillagers(prev => prev.map(v => 
          v.name === villagerName 
            ? { ...v, hasHarvested: true, isLoading: false }
            : v
        ));
      } else {
        // Just show greeting if already harvested
        const greetingLine = getRandomGreetingLine(villagerName);
        alert(`${villagerName}: "${greetingLine}"`);
        
        setVillagers(prev => prev.map(v => 
          v.name === villagerName 
            ? { ...v, isLoading: false }
            : v
        ));
      }
    } catch (error) {
      console.error("Error talking to villager:", error);
      setVillagers(prev => prev.map(v => 
        v.name === villagerName 
          ? { ...v, isLoading: false }
          : v
      ));
    }
  };

  // Initialize user and load data
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const id = await getUserId(supabase);
        setUserId(id);
      } catch (error) {
        console.error("Error getting user ID:", error);
        setLoading(false);
      }
    };

    initializeUser();
  }, []);

  // Load villager data when user is set
  useEffect(() => {
    if (userId) {
      initializeVillagers();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="w-full max-w-4xl flex flex-col items-center p-8">
        <h1 className="text-3xl font-bold mb-4">Town</h1>
        <p className="text-lg text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl flex flex-col items-center p-8">
      <h1 className="text-3xl font-bold mb-6">Town</h1>
      
      <div className="w-full max-w-2xl space-y-4">
        {villagers.map((villager) => (
          <div key={villager.name} className="solstra-card">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">{villager.name}</h3>
                <p className="text-gray-700">
                  <strong>{villager.name}</strong>{villager.standingLine}
                </p>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                {villager.hasHarvested && (
                  <span className="text-sm text-green-600 font-medium">
                    ✓ Harvested today
                  </span>
                )}
                
                <button
                  onClick={() => handleTalkToVillager(villager.name)}
                  disabled={villager.isLoading}
                  className="solstra-btn-small"
                >
                  {villager.isLoading ? "..." : 
                   villager.hasHarvested ? "Talk" : "Talk & Harvest"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 text-center text-sm text-gray-600 max-w-2xl">
        <p>
          You can talk to villagers anytime, but you can only receive harvest items once per day. 
          The day resets at 11 PM Eastern.
        </p>
      </div>
    </div>
  );
}