import { createClient } from '@/utils/supabase/server';
import { getUserId } from '@/utils/supabase/amy/helpers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const supabase = createClient();
    const userId = await getUserId(supabase);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'current_count') {
      // Get current vocabulary count (excluding "Recent touch")
      const { count, error: countError } = await supabase
        .from('greek_vocabulary')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .neq('knowledge_level', 'Recent touch');

      if (countError) {
        console.error('Count error:', countError);
        return NextResponse.json({ error: 'Failed to get word count' }, { status: 500 });
      }

      // Get most recent history entry
      const { data: historyData, error: historyError } = await supabase
        .from('greek_vocabulary_history')
        .select('word_count, recorded_at')
        .eq('user_id', userId)
        .order('recorded_at', { ascending: false })
        .limit(1);

      if (historyError) {
        console.error('History error:', historyError);
        return NextResponse.json({ error: 'Failed to get history' }, { status: 500 });
      }

      const currentCount = count || 0;
      const latestHistory = historyData && historyData.length > 0 ? historyData[0] : null;
      let latestTimestamp = latestHistory?.recorded_at || null;
      let needsUpdate = false;

      // Check if we need to insert a new history entry
      if (!latestHistory || latestHistory.word_count !== currentCount) {
        const { data: newEntry, error: insertError } = await supabase
          .from('greek_vocabulary_history')
          .insert([{
            user_id: userId,
            word_count: currentCount
          }])
          .select('recorded_at')
          .single();

        if (insertError) {
          console.error('Insert error:', insertError);
          return NextResponse.json({ error: 'Failed to save history entry' }, { status: 500 });
        }

        latestTimestamp = newEntry.recorded_at;
        needsUpdate = true;
      }

      return NextResponse.json({
        currentCount,
        latestTimestamp,
        wasUpdated: needsUpdate
      });
    }

    // Default behavior: return all history
    const { data, error } = await supabase
      .from('greek_vocabulary_history')
      .select('*')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
    }

    return NextResponse.json(data || []);

  } catch (error) {
    console.error('History fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch vocabulary history',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
