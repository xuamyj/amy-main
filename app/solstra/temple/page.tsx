"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { getUserId } from "@/utils/supabase/amy/helpers";
import { 
  getDragonState, 
  calculateCurrentFoodSlots, 
  feedDragon,
  getCurrentStatusIndex,
  DragonState,
  FOOD_SLOTS_MAX 
} from "@/utils/supabase/solstra/helpers";
import { getSolisStatusLineByIndex, getRandomSolisFeedingLine } from "@/utils/solstra/game-content";
import Image from "next/image";
import solisImage from "../game-content/catdragon-solis-placeholder300.png";
import FeedingModal from "../components/FeedingModal";

export default function TemplePage() {
  const [dragonState, setDragonState] = useState<DragonState | null>(null);
  const [currentSlots, setCurrentSlots] = useState(0);
  const [timeUntilNext, setTimeUntilNext] = useState(0);
  const [loading, setLoading] = useState(true);
  const [feeding, setFeeding] = useState(false);
  const [dragonStatus, setDragonStatus] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [feedingModal, setFeedingModal] = useState<{
    isVisible: boolean;
    feedingLine: string;
  }>({
    isVisible: false,
    feedingLine: ""
  });

  const supabase = createClient();

  // Format time remaining until next slot
  const formatTimeRemaining = (milliseconds: number): string => {
    const totalMinutes = Math.floor(milliseconds / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Load dragon state
  const loadDragonState = async () => {
    if (!userId) return;
    
    try {
      const state = await getDragonState(supabase, userId);
      const { currentSlots: slots, timeUntilNext: timeNext } = calculateCurrentFoodSlots(state);
      const { statusIndex, shouldUpdate } = await getCurrentStatusIndex(supabase, userId);
      
      setDragonState(state);
      setCurrentSlots(slots);
      setTimeUntilNext(timeNext);
      setDragonStatus(getSolisStatusLineByIndex(statusIndex));
    } catch (error) {
      console.error("Error loading dragon state:", error);
    } finally {
      setLoading(false);
    }
  };

  // Show feeding modal
  const showFeedingModal = (feedingLine: string) => {
    setFeedingModal({
      isVisible: true,
      feedingLine
    });
  };

  // Hide feeding modal
  const hideFeedingModal = () => {
    setFeedingModal(prev => ({
      ...prev,
      isVisible: false
    }));
  };

  // Handle feeding the dragon
  const handleFeedDragon = async () => {
    if (!userId || currentSlots <= 0 || feeding) return;
    
    setFeeding(true);
    try {
      await feedDragon(supabase, userId);
      await loadDragonState(); // Reload state (preserves status timing)
      
      // Show feeding modal with random line
      const feedingLine = getRandomSolisFeedingLine();
      showFeedingModal(feedingLine);
    } catch (error) {
      console.error("Error feeding dragon:", error);
    } finally {
      setFeeding(false);
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

  // Load dragon state when user is set
  useEffect(() => {
    if (userId) {
      loadDragonState();
    }
  }, [userId]);

  // Update timer every minute
  useEffect(() => {
    if (!dragonState) return;

    const interval = setInterval(() => {
      const { currentSlots: slots, timeUntilNext: timeNext } = calculateCurrentFoodSlots(dragonState);
      setCurrentSlots(slots);
      setTimeUntilNext(timeNext);
      
      // If slots increased, reload full state to sync with database
      if (slots > currentSlots) {
        loadDragonState();
      }
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [dragonState, currentSlots]);

  if (loading) {
    return (
      <div className="w-full max-w-4xl flex flex-col items-center p-8">
        <h1 className="text-3xl font-bold mb-4">Temple</h1>
        <p className="solstra-text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl flex flex-col items-center p-8">
      <h1 className="text-3xl font-bold mb-6 solstra-header-main">Temple</h1>
      
      {/* Dragon Status */}
      <div className="solstra-card mb-6 w-full max-w-2xl">
        <h2 className="text-xl font-semibold mb-4 solstra-header-section">Solis the Dragon</h2>
        
        {/* Dragon Image */}
        <div className="flex justify-center mb-4">
          <Image
            src={solisImage}
            alt="Solis the Dragon"
            className="solstra-dragon-image"
            priority
          />
        </div>
        
        <p className="solstra-text mb-4">{dragonStatus}</p>
        
        {/* Looking for Food Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">Looking for food</span>
            <span className="solstra-no-italic-hint">
              {currentSlots < FOOD_SLOTS_MAX && timeUntilNext > 0 && 
                `Next in ${formatTimeRemaining(timeUntilNext)}`
              }
            </span>
          </div>
          
          {/* Food slots visualization */}
          <div className="flex gap-2 mb-4">
            {Array.from({ length: FOOD_SLOTS_MAX }, (_, i) => (
              <div
                key={i}
                className={`solstra-food-slot ${i < currentSlots ? 'filled' : 'empty'}`}
              />
            ))}
          </div>
          
          {/* Feed button */}
          <button
            onClick={handleFeedDragon}
            disabled={currentSlots <= 0 || feeding}
            className={`solstra-btn ${currentSlots <= 0 ? 'disabled' : ''}`}
          >
            {feeding ? "Feeding..." : 
             currentSlots <= 0 ? "Solis isn't looking for food right now" :
             `Feed Solis (${currentSlots} available)`}
          </button>
        </div>
      </div>

      {/* Feeding Modal */}
      {feedingModal.isVisible && (
        <FeedingModal
          feedingLine={feedingModal.feedingLine}
          onDismiss={hideFeedingModal}
        />
      )}
    </div>
  );
}