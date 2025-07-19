"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { getUserId } from "@/utils/supabase/amy/helpers";
import { getUserInventorySorted } from "@/utils/supabase/solstra/helpers";

export default function HousePage() {
  const [inventory, setInventory] = useState<{ item_name: string; count: number; received_from: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const supabase = createClient();

  // Load user inventory
  const loadInventory = async () => {
    if (!userId) return;
    
    try {
      const userInventory = await getUserInventorySorted(supabase, userId);
      setInventory(userInventory);
    } catch (error) {
      console.error("Error loading inventory:", error);
    } finally {
      setLoading(false);
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

  // Load inventory when user is set
  useEffect(() => {
    if (userId) {
      loadInventory();
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
    </div>
  );
}