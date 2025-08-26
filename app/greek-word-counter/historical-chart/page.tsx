"use client";

import { useState, useEffect } from "react";

type HistoryEntry = {
  id: number;
  user_id: string;
  word_count: number;
  recorded_at: string;
  created_at: string;
};

type WeeklyStreakData = {
  weeklyActivity: any[];
  currentStreak: number;
  longestStreak: number;
  totalActiveWeeks: number;
};

export default function HistoricalChartPage() {
  const [currentWordCount, setCurrentWordCount] = useState<number>(0);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [weeklyStreaks, setWeeklyStreaks] = useState<WeeklyStreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchCurrentStats();
    fetchHistory();
    fetchWeeklyStreaks();
  }, []);

  const fetchCurrentStats = async () => {
    try {
      const response = await fetch('/api/greek-vocabulary');
      if (response.ok) {
        const vocabulary = await response.json();
        setCurrentWordCount(vocabulary.length);
      }
    } catch (error) {
      console.error('Error fetching current vocabulary:', error);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/greek-vocabulary-history');
      if (response.ok) {
        const historyData = await response.json();
        setHistory(historyData);
        if (historyData.length > 0) {
          setLastUpdated(historyData[0].recorded_at);
        }
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
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

  const updateChart = async () => {
    setUpdating(true);
    try {
      const response = await fetch('/api/greek-vocabulary-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ word_count: currentWordCount }),
      });

      if (response.ok) {
        await fetchHistory();
      }
    } catch (error) {
      console.error('Error updating history:', error);
    } finally {
      setUpdating(false);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffMonths = Math.floor(diffDays / 30);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Group history by date, keeping only the latest entry per date
  const dailyHistory = history.reduce((acc, entry) => {
    const date = formatDate(entry.recorded_at);
    if (!acc[date] || new Date(entry.recorded_at) > new Date(acc[date].recorded_at)) {
      acc[date] = entry;
    }
    return acc;
  }, {} as { [key: string]: HistoryEntry });

  const dailyHistoryArray = Object.entries(dailyHistory)
    .map(([date, entry]) => ({ date, ...entry }))
    .sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime());

  if (loading) {
    return (
      <div className="greek-content w-full max-w-4xl mx-auto p-6">
        <div className="greek-header-main mb-8">
          <h1>Historical Chart</h1>
          <p className="greek-text mt-2">Loading vocabulary progress...</p>
        </div>
        <div className="greek-card">
          <div className="text-center py-16">
            <div className="greek-loading">
              <div className="greek-text-lg">Loading...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="greek-content w-full max-w-4xl mx-auto p-6">
      <div className="greek-header-main mb-8">
        <h1>Historical Chart</h1>
        <p className="greek-text mt-2">
          Track your vocabulary growth and learning progress over time.
        </p>
      </div>

      {/* Current Stats */}
      <div className="greek-card mb-6">
        <h2 className="greek-header-section mb-4">Current Progress</h2>
        <div className="space-y-4">
          <div className="greek-stat-box">
            <div className="greek-text-lg font-bold text-blue-600">{currentWordCount}</div>
            <div className="greek-text-sm">Total Words</div>
          </div>
          
          <div>
            <div className="greek-text font-medium">Last Updated:</div>
            <div className="greek-text-sm text-gray-600">
              {lastUpdated ? (
                <>
                  {formatDateTime(lastUpdated)}, {getTimeAgo(lastUpdated)}
                </>
              ) : (
                "Never updated"
              )}
            </div>
          </div>
          
          <button
            onClick={updateChart}
            disabled={updating}
            className="greek-btn"
          >
            {updating ? "Updating..." : "Update Chart"}
          </button>
        </div>
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

      {/* Simple Progress Display */}
      {dailyHistoryArray.length > 0 && (
        <>
          <div className="greek-card mb-6">
            <h2 className="greek-header-section mb-4">Progress Overview</h2>
            <div className="space-y-2">
              {dailyHistoryArray.slice(0, 10).map((entry, index) => {
                const prevEntry = dailyHistoryArray[index + 1];
                const change = prevEntry ? entry.word_count - prevEntry.word_count : 0;
                
                return (
                  <div key={entry.id} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                    <div className="greek-text font-medium">{entry.date}</div>
                    <div className="flex items-center gap-3">
                      <span className="greek-text font-bold text-blue-600">{entry.word_count} words</span>
                      {change !== 0 && (
                        <span className={`greek-text-sm px-2 py-1 rounded ${
                          change > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {change > 0 ? '+' : ''}{change}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="greek-card">
            <h2 className="greek-header-section mb-4">Complete History</h2>
            <div className="max-h-64 overflow-y-auto">
              <div className="space-y-1">
                {dailyHistoryArray.map((entry) => (
                  <div key={entry.id} className="flex justify-between items-center py-1 px-2 hover:bg-gray-50 rounded">
                    <span className="greek-text-sm">{entry.date}</span>
                    <span className="greek-text-sm font-medium">{entry.word_count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {dailyHistoryArray.length === 0 && (
        <div className="greek-card">
          <div className="text-center py-16">
            <div className="greek-text-lg text-gray-500 mb-4">📊</div>
            <h2 className="greek-header-section text-gray-600 mb-2">No History Yet</h2>
            <p className="greek-text text-gray-500 mb-4">
              Click "Update Chart" to start tracking your vocabulary progress over time.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}