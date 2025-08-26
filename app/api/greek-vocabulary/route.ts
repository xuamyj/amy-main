import { createClient } from '@/utils/supabase/server';
import { 
  getUserGreekVocabulary, 
  addGreekVocabularyEntry,
  GreekVocabularyInsert 
} from '@/utils/supabase/greek/helpers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createClient();
    const vocabulary = await getUserGreekVocabulary(supabase);

    if (vocabulary === null) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(vocabulary);

  } catch (error) {
    console.error('Greek vocabulary fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch Greek vocabulary',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const body = await request.json();
    
    const { english_word, greek_word, transliteration, word_type, knowledge_level } = body;

    // Validation
    if (!english_word || !greek_word || !transliteration) {
      return NextResponse.json({ 
        error: 'Missing required fields: english_word, greek_word, transliteration' 
      }, { status: 400 });
    }

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

    const vocabularyEntry: GreekVocabularyInsert = {
      english_word: english_word.trim(),
      greek_word: greek_word.trim(),
      transliteration: transliteration.trim(),
      word_type: word_type || 'noun',
      knowledge_level: knowledge_level || 'Moderate know'
    };

    const result = await addGreekVocabularyEntry(supabase, vocabularyEntry);

    if (!result) {
      return NextResponse.json({ error: 'Failed to add vocabulary entry' }, { status: 500 });
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Greek vocabulary add error:', error);
    return NextResponse.json({ 
      error: 'Failed to add Greek vocabulary entry',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}