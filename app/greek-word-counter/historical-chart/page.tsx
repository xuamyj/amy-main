"use client";

import { useState, useEffect } from "react";

type WeeklyStreakData = {
  weeklyActivity: any[];
  currentStreak: number;
  longestStreak: number;
  totalActiveWeeks: number;
};

export default function HistoricalChartPage() {
  const [weeklyStreaks, setWeeklyStreaks] = useState<WeeklyStreakData | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await fetchWeeklyStreaks();
  };



  const fetchWeeklyStreaks = async () => {
    try {
      const response = await fetch('/api/greek-weekly-streaks');
      if (response.ok) {
        const streakData = await response.json();
        setWeeklyStreaks(streakData);
      }
    } catch (error) {
      console.error('Error fetching weekly streaks:', error);
    }
  };


  return (
    <div className="greek-content w-full max-w-4xl mx-auto p-6">
      <div className="greek-header-main mb-8">
        <h1>Historical Chart</h1>
        <p className="greek-text mt-2">
          Track your vocabulary growth and learning progress over time.
        </p>
      </div>

      {/* Weekly Learning Streaks */}
      {weeklyStreaks && (
        <div className="greek-card mb-6">
          <h2 className="greek-header-section mb-4">Learning Streaks</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="greek-stat-box">
              <div className="greek-text-lg font-bold text-orange-600">{weeklyStreaks.currentStreak}</div>
              <div className="greek-text-sm">Current Weekly Streak</div>
            </div>
            <div className="greek-stat-box">
              <div className="greek-text-lg font-bold text-green-600">{weeklyStreaks.longestStreak}</div>
              <div className="greek-text-sm">Longest Weekly Streak</div>
            </div>
            <div className="greek-stat-box">
              <div className="greek-text-lg font-bold text-purple-600">{weeklyStreaks.totalActiveWeeks}</div>
              <div className="greek-text-sm">Total Active Weeks</div>
            </div>
          </div>
          <p className="greek-text-sm text-gray-600 mt-3">
            Weekly streaks are automatically tracked when you add or edit vocabulary. A week runs Monday to Sunday.
          </p>
        </div>
      )}

 
    </div>
  );
}