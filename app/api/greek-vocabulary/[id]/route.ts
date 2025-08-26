import { createClient } from '@/utils/supabase/server';
import { 
  getGreekVocabularyById,
  updateGreekVocabularyEntry,
  deleteGreekVocabularyEntry,
  GreekVocabularyUpdate 
} from '@/utils/supabase/greek/helpers';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const entry = await getGreekVocabularyById(supabase, id);

    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    return NextResponse.json(entry);

  } catch (error) {
    console.error('Greek vocabulary fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch Greek vocabulary entry',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const body = await request.json();
    const { english_word, greek_word, transliteration, word_type, knowledge_level } = body;

    // Validation for provided fields
    const validWordTypes = ['noun', 'verb', 'adjective', 'adverb', 'number', 'other'];
    const validKnowledgeLevels = ['Full know', 'Almost full or with errors', 'Moderate know', 'Recent touch'];

    if (word_type && !validWordTypes.includes(word_type)) {
      return NextResponse.json({ 
        error: `Invalid word_type. Must be one of: ${validWordTypes.join(', ')}` 
      }, { status: 400 });
    }

    if (knowledge_level && !validKnowledgeLevels.includes(knowledge_level)) {
      return NextResponse.json({ 
        error: `Invalid knowledge_level. Must be one of: ${validKnowledgeLevels.join(', ')}` 
      }, { status: 400 });
    }

    const updates: GreekVocabularyUpdate = {};
    if (english_word !== undefined) updates.english_word = english_word.trim();
    if (greek_word !== undefined) updates.greek_word = greek_word.trim();
    if (transliteration !== undefined) updates.transliteration = transliteration.trim();
    if (word_type !== undefined) updates.word_type = word_type;
    if (knowledge_level !== undefined) updates.knowledge_level = knowledge_level;

    const result = await updateGreekVocabularyEntry(supabase, id, updates);

    if (!result) {
      return NextResponse.json({ error: 'Entry not found or update failed' }, { status: 404 });
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Greek vocabulary update error:', error);
    return NextResponse.json({ 
      error: 'Failed to update Greek vocabulary entry',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const success = await deleteGreekVocabularyEntry(supabase, id);

    if (!success) {
      return NextResponse.json({ error: 'Entry not found or delete failed' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Entry deleted successfully' });

  } catch (error) {
    console.error('Greek vocabulary delete error:', error);
    return NextResponse.json({ 
      error: 'Failed to delete Greek vocabulary entry',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}