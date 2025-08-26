import { createClient } from '@/utils/supabase/server';
import { getUserId } from '@/utils/supabase/amy/helpers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createClient();
    const userId = await getUserId(supabase);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get weekly activity data
    const { data: weeklyData, error: weeklyError } = await supabase
      .from('greek_weekly_activity')
      .select('*')
      .eq('user_id', userId)
      .eq('has_activity', true)
      .order('week_start', { ascending: false });

    if (weeklyError) {
      console.error('Database error:', weeklyError);
      return NextResponse.json({ error: 'Failed to fetch weekly data' }, { status: 500 });
    }

    // Calculate current streak
    const currentStreak = calculateCurrentStreak(weeklyData || []);
    const longestStreak = calculateLongestStreak(weeklyData || []);

    return NextResponse.json({
      weeklyActivity: weeklyData || [],
      currentStreak,
      longestStreak,
      totalActiveWeeks: weeklyData?.length || 0
    });

  } catch (error) {
    console.error('Weekly streaks fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch weekly streaks data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function calculateCurrentStreak(weeklyData: any[]): number {
  if (!weeklyData || weeklyData.length === 0) return 0;

  const today = new Date();
  const currentWeekStart = getWeekStart(today);
  let streak = 0;
  let checkDate = new Date(currentWeekStart);

  // Sort by week_start descending (most recent first)
  const sortedData = [...weeklyData].sort((a, b) => 
    new Date(b.week_start).getTime() - new Date(a.week_start).getTime()
  );

  for (let i = 0; i < sortedData.length; i++) {
    const activityWeek = new Date(sortedData[i].week_start);
    
    if (activityWeek.getTime() === checkDate.getTime()) {
      streak++;
      // Move to previous week
      checkDate.setDate(checkDate.getDate() - 7);
    } else {
      // Check if we're looking at current week and there's no activity yet
      if (i === 0 && activityWeek.getTime() < currentWeekStart.getTime()) {
        // No activity this week, but check if last week had activity
        const lastWeekStart = new Date(currentWeekStart);
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);
        
        if (activityWeek.getTime() === lastWeekStart.getTime()) {
          streak++;
          checkDate = new Date(lastWeekStart);
          checkDate.setDate(checkDate.getDate() - 7);
          continue;
        }
      }
      break;
    }
  }

  return streak;
}

function calculateLongestStreak(weeklyData: any[]): number {
  if (!weeklyData || weeklyData.length === 0) return 0;

  const sortedData = [...weeklyData].sort((a, b) => 
    new Date(a.week_start).getTime() - new Date(b.week_start).getTime()
  );

  let maxStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < sortedData.length; i++) {
    const currentWeek = new Date(sortedData[i].week_start);
    const prevWeek = new Date(sortedData[i - 1].week_start);
    
    // Check if current week is exactly 7 days after previous week
    const daysDiff = (currentWeek.getTime() - prevWeek.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysDiff === 7) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  return maxStreak;
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
}