"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { getUserId } from "@/utils/supabase/amy/helpers";
import { getUserInventorySorted, getUserFeedingLog, shouldShowFeedingLogCelebration, markMilestoneNotified } from "@/utils/supabase/solstra/helpers";
import FeedingModal from "../components/FeedingModal";

export default function HousePage() {
  const [inventory, setInventory] = useState<{ item_name: string; count: number; received_from: string }[]>([]);
  const [feedingLog, setFeedingLog] = useState<{ food_name: string; has_tasted: boolean }[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [celebrationModal, setCelebrationModal] = useState<{
    isVisible: boolean;
  }>({
    isVisible: false
  });

  const supabase = createClient();

  // Load user data
  const loadUserData = async () => {
    if (!userId) return;
    
    try {
      const [userInventory, userFeedingLog, shouldCelebrate] = await Promise.all([
        getUserInventorySorted(supabase, userId),
        getUserFeedingLog(supabase, userId),
        shouldShowFeedingLogCelebration(supabase, userId)
      ]);
      
      setInventory(userInventory);
      setFeedingLog(userFeedingLog);
      
      // Show celebration if feeding log is complete and not previously notified
      if (shouldCelebrate) {
        setCelebrationModal({ isVisible: true });
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle celebration modal dismissal
  const handleCelebrationDismiss = async () => {
    if (!userId) return;
    
    try {
      // Mark milestone as notified
      await markMilestoneNotified(supabase, userId, 'feeding_log_complete');
      setCelebrationModal({ isVisible: false });
    } catch (error) {
      console.error("Error marking milestone as notified:", error);
      // Still dismiss the modal even if database update fails
      setCelebrationModal({ isVisible: false });
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

  // Load user data when user is set
  useEffect(() => {
    if (userId) {
      loadUserData();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="w-full max-w-4xl flex flex-col items-center p-8">
        <h1 className="text-3xl font-bold mb-4 solstra-header-main">House</h1>
        <p className="solstra-text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl flex flex-col items-center p-8">
      <h1 className="text-3xl font-bold mb-6 solstra-header-main">House</h1>
      
      {/* Inventory Section */}
      <div className="solstra-card w-full max-w-2xl">
        <h2 className="text-xl font-semibold mb-4 solstra-header-section">Inventory</h2>
        
        {inventory.length === 0 ? (
          <p className="solstra-text">
            You don't have any items yet. Visit the Town to harvest items from villagers!
          </p>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {inventory.map((item, index) => (
              <div key={index} className="text-center p-3 bg-white rounded-lg border border-blue-200">
                <div className="solstra-text-sm mb-1">
                  <strong>{item.item_name}</strong>
                  <span className="solstra-food-count">
                  {item.count > 1 && ` x ${item.count}`}
                  </span>
                </div>
                {/* <div className="solstra-text-sm opacity-75">
                  From {item.received_from}
                </div> */}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Feeding Log Section */}
      <div className="solstra-card w-full max-w-2xl">
        <h2 className="text-xl font-semibold mb-4 solstra-header-section">Feeding Log</h2>
        <p className="solstra-text-sm mb-4">
          Foods that Solis has tasted. Higlighted items in white have been tasted, grayed ones haven't.
        </p>
        
        <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
          {feedingLog.map((food, index) => (
            <div 
              key={index} 
              className="text-center p-2 rounded border border-blue-200"
              style={{ 
                backgroundColor: food.has_tasted ? '#ffffff' : '#ebeced',
                color: food.has_tasted ? '#4b5563' : '#a3adc2'
              }}
            >
              <div style={{ 
                fontSize: '1rem', 
                fontWeight: 400,
                color: 'inherit'
              }}>
                {food.food_name}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feeding Log Completion Celebration */}
      {celebrationModal.isVisible && (
        <FeedingModal
          feedingLine="Solis is grateful and wants to eat all the foods again!"
          onDismiss={handleCelebrationDismiss}
          title="Solis completed her Feeding Log!"
        />
      )}
    </div>
  );
}