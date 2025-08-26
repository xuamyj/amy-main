import { AmySupabaseClient } from "../server";
import { getUserId } from "../amy/helpers";

export type GreekVocabularyEntry = {
  id: number;
  user_id: string;
  english_word: string;
  greek_word: string;
  transliteration: string;
  word_type: 'noun' | 'verb' | 'adjective' | 'adverb' | 'number' | 'other';
  knowledge_level: 'Full know' | 'Almost full or with errors' | 'Moderate know' | 'Recent touch';
  created_at: string;
  updated_at: string;
};

export type GreekVocabularyInsert = {
  english_word: string;
  greek_word: string;
  transliteration: string;
  word_type: 'noun' | 'verb' | 'adjective' | 'adverb' | 'number' | 'other';
  knowledge_level: 'Full know' | 'Almost full or with errors' | 'Moderate know' | 'Recent touch';
};

export type GreekVocabularyUpdate = {
  english_word?: string;
  greek_word?: string;
  transliteration?: string;
  word_type?: 'noun' | 'verb' | 'adjective' | 'adverb' | 'number' | 'other';
  knowledge_level?: 'Full know' | 'Almost full or with errors' | 'Moderate know' | 'Recent touch';
};

// --------------
// DB: GREEK VOCABULARY
// --------------

export async function getUserGreekVocabulary(supabaseClient: AmySupabaseClient): Promise<GreekVocabularyEntry[] | null> {
  const userId = await getUserId(supabaseClient);

  if (!userId) {
    return null;
  }

  const { data, error } = await supabaseClient
    .from('greek_vocabulary')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching Greek vocabulary:', error);
    return null;
  }

  return data as GreekVocabularyEntry[];
}

export async function addGreekVocabularyEntry(
  supabaseClient: AmySupabaseClient, 
  entry: GreekVocabularyInsert
): Promise<GreekVocabularyEntry | null> {
  const userId = await getUserId(supabaseClient);

  if (!userId) {
    return null;
  }

  const { data, error } = await supabaseClient
    .from('greek_vocabulary')
    .insert([{
      user_id: userId,
      ...entry
    }])
    .select('*')
    .single();

  if (error) {
    console.error('Error adding Greek vocabulary entry:', error);
    return null;
  }

  return data as GreekVocabularyEntry;
}

export async function updateGreekVocabularyEntry(
  supabaseClient: AmySupabaseClient,
  id: number,
  updates: GreekVocabularyUpdate
): Promise<GreekVocabularyEntry | null> {
  const userId = await getUserId(supabaseClient);

  if (!userId) {
    return null;
  }

  const { data, error } = await supabaseClient
    .from('greek_vocabulary')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', userId)  // Ensure user can only update their own entries
    .select('*')
    .single();

  if (error) {
    console.error('Error updating Greek vocabulary entry:', error);
    return null;
  }

  return data as GreekVocabularyEntry;
}

export async function deleteGreekVocabularyEntry(
  supabaseClient: AmySupabaseClient,
  id: number
): Promise<boolean> {
  const userId = await getUserId(supabaseClient);

  if (!userId) {
    return false;
  }

  const { error } = await supabaseClient
    .from('greek_vocabulary')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);  // Ensure user can only delete their own entries

  if (error) {
    console.error('Error deleting Greek vocabulary entry:', error);
    return false;
  }

  return true;
}

export async function getGreekVocabularyById(
  supabaseClient: AmySupabaseClient,
  id: number
): Promise<GreekVocabularyEntry | null> {
  const userId = await getUserId(supabaseClient);

  if (!userId) {
    return null;
  }

  const { data, error } = await supabaseClient
    .from('greek_vocabulary')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)  // Ensure user can only access their own entries
    .single();

  if (error) {
    console.error('Error fetching Greek vocabulary entry:', error);
    return null;
  }

  return data as GreekVocabularyEntry;
}

export async function searchGreekVocabulary(
  supabaseClient: AmySupabaseClient,
  searchTerms: {
    greek?: string;
    english?: string;
    transliteration?: string;
    word_type?: string;
    knowledge_level?: string;
  }
): Promise<GreekVocabularyEntry[] | null> {
  const userId = await getUserId(supabaseClient);

  if (!userId) {
    return null;
  }

  let query = supabaseClient
    .from('greek_vocabulary')
    .select('*')
    .eq('user_id', userId);

  // Add search filters
  if (searchTerms.greek) {
    query = query.ilike('greek_word', `%${searchTerms.greek}%`);
  }
  if (searchTerms.english) {
    query = query.ilike('english_word', `%${searchTerms.english}%`);
  }
  if (searchTerms.transliteration) {
    query = query.ilike('transliteration', `%${searchTerms.transliteration}%`);
  }
  if (searchTerms.word_type) {
    query = query.eq('word_type', searchTerms.word_type);
  }
  if (searchTerms.knowledge_level) {
    query = query.eq('knowledge_level', searchTerms.knowledge_level);
  }

  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error('Error searching Greek vocabulary:', error);
    return null;
  }

  return data as GreekVocabularyEntry[];
}

export async function getUserVocabularyStats(
  supabaseClient: AmySupabaseClient
): Promise<{
  totalWords: number;
  byWordType: Record<string, number>;
  byKnowledgeLevel: Record<string, number>;
} | null> {
  const vocabulary = await getUserGreekVocabulary(supabaseClient);

  if (!vocabulary) {
    return null;
  }

  const byWordType: Record<string, number> = {};
  const byKnowledgeLevel: Record<string, number> = {};

  vocabulary.forEach(entry => {
    byWordType[entry.word_type] = (byWordType[entry.word_type] || 0) + 1;
    byKnowledgeLevel[entry.knowledge_level] = (byKnowledgeLevel[entry.knowledge_level] || 0) + 1;
  });

  return {
    totalWords: vocabulary.length,
    byWordType,
    byKnowledgeLevel
  };
}