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
      .from('generated_quizzes')
      .select('*')
      .eq('user_id', userId)
      .order('starred', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch quizzes' }, { status: 500 });
    }

    return NextResponse.json(data || []);

  } catch (error) {
    console.error('Quiz fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch saved quizzes',
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

    const { scenario, outcome, quiz_data } = await request.json();

    const { data, error } = await supabase
      .from('generated_quizzes')
      .insert([
        {
          user_id: userId,
          scenario,
          outcome,
          quiz_data
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to save quiz' }, { status: 500 });
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Quiz save error:', error);
    return NextResponse.json({ 
      error: 'Failed to save quiz',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}