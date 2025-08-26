"use client";

import { useState, useEffect } from "react";

type WeeklyStreakData = {
  weeklyActivity: any[];
  currentStreak: number;
  longestStreak: number;
  totalActiveWeeks: number;
};

type WordCountData = {
  currentCount: number;
  latestTimestamp: string | null;
  wasUpdated: boolean;
};

type HistoryEntry = {
  id: number;
  word_count: number;
  recorded_at: string;
};

export default function HistoricalChartPage() {
  const [weeklyStreaks, setWeeklyStreaks] = useState<WeeklyStreakData | null>(null);
  const [wordCountData, setWordCountData] = useState<WordCountData | null>(null);
  const [historyData, setHistoryData] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([
      fetchWeeklyStreaks(),
      fetchWordCountData(),
      fetchHistoryData()
    ]);
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

  const fetchWordCountData = async () => {
    try {
      const response = await fetch('/api/greek-vocabulary-history?action=current_count');
      if (response.ok) {
        const countData = await response.json();
        setWordCountData(countData);
      }
    } catch (error) {
      console.error('Error fetching word count data:', error);
    }
  };

  const fetchHistoryData = async () => {
    try {
      const response = await fetch('/api/greek-vocabulary-history');
      if (response.ok) {
        const history = await response.json();
        setHistoryData(history);
      }
    } catch (error) {
      console.error('Error fetching history data:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Process history data for chart - group by date and take latest entry per day
  const processHistoryForChart = () => {
    const groupedByDate: { [key: string]: HistoryEntry } = {};
    
    historyData.forEach(entry => {
      const dateKey = new Date(entry.recorded_at).toDateString();
      if (!groupedByDate[dateKey] || new Date(entry.recorded_at) > new Date(groupedByDate[dateKey].recorded_at)) {
        groupedByDate[dateKey] = entry;
      }
    });

    return Object.values(groupedByDate).sort((a, b) => 
      new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
    );
  };


  const chartData = processHistoryForChart();

  return (
    <div className="greek-content w-full max-w-4xl mx-auto p-6">
      <div className="greek-header-main mb-8">
        <h1>Historical Chart</h1>
        <p className="greek-text mt-2">
          Track your vocabulary growth and learning progress over time.
        </p>
      </div>

      {/* Word Count Section */}
      {wordCountData && (
        <div className="greek-card mb-6">
          <h2 className="greek-header-section mb-4">Current Vocabulary Count</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="greek-text-lg">
                Total Words: <span className="font-bold text-green-600">{wordCountData.currentCount}</span>
              </div>
              <div className="greek-text-sm text-gray-600">
                (excluding "Recent touch" words)
              </div>
            </div>
          </div>
          {wordCountData.latestTimestamp && (
            <div className="greek-text-sm text-gray-600 mt-2">
              Latest plot point: {formatTimestamp(wordCountData.latestTimestamp)}
              {wordCountData.wasUpdated && <span className="text-green-600 ml-2">(Updated now)</span>}
            </div>
          )}
        </div>
      )}

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

      {/* Historical Chart */}
      {chartData.length > 0 && (
        <div className="greek-card">
          <h2 className="greek-header-section mb-4">Vocabulary Growth Chart</h2>
          
          {/* Simple Line Chart */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="relative h-64 border-l-2 border-b-2 border-gray-300">
              <svg viewBox="0 0 800 200" className="w-full h-full">
                {chartData.map((entry, index) => {
                  const x = (index / Math.max(chartData.length - 1, 1)) * 780 + 10;
                  const maxCount = Math.max(...chartData.map(e => e.word_count));
                  const y = 190 - (entry.word_count / Math.max(maxCount, 1)) * 180;
                  
                  return (
                    <g key={entry.id}>
                      {/* Line to next point */}
                      {index < chartData.length - 1 && (
                        <line
                          x1={x}
                          y1={y}
                          x2={(index + 1) / Math.max(chartData.length - 1, 1) * 780 + 10}
                          y2={190 - (chartData[index + 1].word_count / Math.max(maxCount, 1)) * 180}
                          stroke="#1e3a8a"
                          strokeWidth="2"
                        />
                      )}
                      {/* Data point */}
                      <circle
                        cx={x}
                        cy={y}
                        r="4"
                        fill="#dc2626"
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                      {/* Hover tooltip area */}
                      <title>{`${formatDate(entry.recorded_at)}: ${entry.word_count} words`}</title>
                    </g>
                  );
                })}
              </svg>
            </div>
            <div className="greek-text-sm text-gray-600 mt-2">
              Hover over points to see details. Each point represents the latest word count for that day.
            </div>
          </div>

          {/* Data Table */}
          <div>
            <h3 className="greek-text-lg font-semibold mb-3">Historical Data</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="greek-text-sm font-semibold text-left py-2">Date</th>
                    <th className="greek-text-sm font-semibold text-right py-2">Word Count</th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.reverse().map((entry) => (
                    <tr key={entry.id} className="border-b border-gray-100">
                      <td className="greek-text-sm py-2">{formatDate(entry.recorded_at)}</td>
                      <td className="greek-text-sm text-right py-2 font-medium text-green-600">{entry.word_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {chartData.length === 0 && (
              <div className="greek-text text-gray-600 text-center py-8">
                No historical data available yet. Data points are automatically created when your vocabulary count changes.
              </div>
            )}
          </div>
        </div>
      )}

      {chartData.length === 0 && (
        <div className="greek-card">
          <h2 className="greek-header-section mb-4">Vocabulary Growth Chart</h2>
          <div className="greek-text text-gray-600 text-center py-8">
            No historical data available yet. Data points will be automatically created as you add vocabulary.
          </div>
        </div>
      )}

    </div>
  );
}