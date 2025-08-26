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

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const userId = await getUserId(supabase);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { word_count } = await request.json();

    if (typeof word_count !== 'number' || word_count < 0) {
      return NextResponse.json({ 
        error: 'Invalid word_count. Must be a non-negative number.' 
      }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('greek_vocabulary_history')
      .insert([
        {
          user_id: userId,
          word_count: word_count
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to save history entry' }, { status: 500 });
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('History save error:', error);
    return NextResponse.json({ 
      error: 'Failed to save vocabulary history',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}