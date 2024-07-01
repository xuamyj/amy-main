import { SupabaseClient } from "@supabase/supabase-js";
import { AmySupabaseClient } from "../server";

export async function getUserId(supabaseClient: AmySupabaseClient) {
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  return user?.id || null;
}

export async function getUserDisplayName(supabaseClient: AmySupabaseClient) {
  const userId = await getUserId(supabaseClient);

  let displayName : string|null = null;
  if (userId) {
    const { data, error } = await supabaseClient
    .from('user_info')
    .select()
    .eq('id', userId);

    if (data && data.length > 0) {
      displayName = data[0].display_name;
    }
  }
  return displayName;
}

export async function getUserBoards(supabaseClient: AmySupabaseClient) {
  const userId = await getUserId(supabaseClient);

  let boards = null;
  if (userId) {
    const { data, error } = await supabaseClient
    .from('boards')
    .select()
    .eq('user_id', userId);

    boards = data;
  }
  return boards;
}

export async function getUserDayNotes(supabaseClient: AmySupabaseClient) {
  const userId = await getUserId(supabaseClient);

  let dayNotes = null;
  if (userId) {
    const { data, error } = await supabaseClient
    .from('day_notes')
    .select()
    .eq('user_id', userId);

    dayNotes = data;
  }
  return dayNotes;
}
