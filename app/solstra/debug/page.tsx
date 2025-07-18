"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { getUserId } from "@/utils/supabase/amy/helpers";
import { 
  debugAddFoodSlot,
  resetTodayVillagerHarvests,
  getDragonState,
  calculateCurrentFoodSlots
} from "@/utils/supabase/solstra/helpers";

export default function DebugPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [dragonInfo, setDragonInfo] = useState<string>("");

  const supabase = createClient();

  // Load debug info
  const loadDebugInfo = async () => {
    if (!userId) return;

    try {
      const dragonState = await getDragonState(supabase, userId);
      const { currentSlots, timeUntilNext } = calculateCurrentFoodSlots(dragonState);
      
      const info = `
Dragon State:
- Current food slots: ${currentSlots}/3
- Database food slots: ${dragonState.food_slots}
- Last slot increase: ${new Date(dragonState.last_slot_increase).toLocaleString()}
- Time until next slot: ${Math.round(timeUntilNext / (1000 * 60))} minutes
      `.trim();
      
      setDragonInfo(info);
    } catch (error) {
      console.error("Error loading debug info:", error);
      setDragonInfo("Error loading debug info");
    }
  };

  // Handle adding a food slot
  const handleAddFoodSlot = async () => {
    if (!userId || adding) return;

    setAdding(true);
    try {
      await debugAddFoodSlot(supabase, userId);
      await loadDebugInfo(); // Refresh info
      alert("Added 1 food slot to the dragon!");
    } catch (error) {
      console.error("Error adding food slot:", error);
      alert("Error adding food slot");
    } finally {
      setAdding(false);
    }
  };

  // Handle resetting villager harvests
  const handleResetHarvests = async () => {
    if (!userId || resetting) return;

    setResetting(true);
    try {
      await resetTodayVillagerHarvests(supabase, userId);
      alert("Reset all villager harvests for today!");
    } catch (error) {
      console.error("Error resetting harvests:", error);
      alert("Error resetting villager harvests");
    } finally {
      setResetting(false);
    }
  };

  // Initialize user and load debug info
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

  // Load debug info when user is set
  useEffect(() => {
    if (userId) {
      loadDebugInfo().finally(() => setLoading(false));
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="w-full max-w-4xl flex flex-col items-center p-8">
        <h1 className="text-3xl font-bold mb-4">Debug</h1>
        <p className="solstra-text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl flex flex-col items-center p-8">
      <h1 className="text-3xl font-bold mb-6 solstra-header-main">Debug Tools</h1>
      
      <div className="w-full max-w-2xl space-y-6">
        {/* Dragon Debug Info */}
        <div className="solstra-card">
          <h2 className="text-xl font-semibold mb-3 solstra-header-section">Dragon State Information</h2>
          <pre className="text-sm bg-gray-100 p-3 rounded whitespace-pre-wrap font-mono">
            {dragonInfo}
          </pre>
          <button
            onClick={loadDebugInfo}
            className="solstra-btn-small mt-3"
          >
            Refresh Info
          </button>
        </div>

        {/* Dragon Controls */}
        <div className="solstra-card">
          <h2 className="text-xl font-semibold mb-3 solstra-header-section">Dragon Controls</h2>
          <p className="solstra-text mb-4">
            Manually add food slots to test the feeding system without waiting 8 hours.
          </p>
          <button
            onClick={handleAddFoodSlot}
            disabled={adding}
            className="solstra-btn"
          >
            {adding ? "Adding..." : "Add 1 Food Slot"}
          </button>
        </div>

        {/* Villager Controls */}
        <div className="solstra-card">
          <h2 className="text-xl font-semibold mb-3 solstra-header-section">Villager Controls</h2>
          <p className="solstra-text mb-4">
            Reset all villager harvest status for today so you can harvest from them again.
          </p>
          <button
            onClick={handleResetHarvests}
            disabled={resetting}
            className="solstra-btn"
          >
            {resetting ? "Resetting..." : "Reset All Villager Harvests"}
          </button>
        </div>

        {/* Warning */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-semibold text-purple-800 mb-2">⚠️ Debug Mode</h3>
          <p className="text-purple-700 text-sm">
            These tools are for testing purposes only. They bypass normal game timing 
            and reset mechanisms. Use them to test features without waiting for real-time delays.
          </p>
        </div>
      </div>
    </div>
  );
}