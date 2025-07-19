import { createClient } from '@/utils/supabase/server';
import { getUserId } from '@/utils/supabase/amy/helpers';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const userId = await getUserId(supabase);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const quizId = parseInt(params.id);
    if (isNaN(quizId)) {
      return NextResponse.json({ error: 'Invalid quiz ID' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('generated_quizzes')
      .select('*')
      .eq('id', quizId)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Quiz fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch quiz',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const userId = await getUserId(supabase);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const quizId = parseInt(params.id);
    if (isNaN(quizId)) {
      return NextResponse.json({ error: 'Invalid quiz ID' }, { status: 400 });
    }

    const { starred } = await request.json();

    if (typeof starred !== 'boolean') {
      return NextResponse.json({ error: 'Invalid starred value' }, { status: 400 });
    }

    // First check if the quiz exists and belongs to the user
    const { data: existingQuiz, error: fetchError } = await supabase
      .from('generated_quizzes')
      .select('id, starred')
      .eq('id', quizId)
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      console.error('Quiz fetch error:', fetchError);
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    // Now update the quiz
    const { data, error } = await supabase
      .from('generated_quizzes')
      .update({ starred })
      .eq('id', quizId)
      .eq('user_id', userId)
      .select();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to update quiz' }, { status: 500 });
    }

    return NextResponse.json(data && data.length > 0 ? data[0] : { id: quizId, starred });

  } catch (error) {
    console.error('Quiz update error:', error);
    return NextResponse.json({ 
      error: 'Failed to update quiz',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}