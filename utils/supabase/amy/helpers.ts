import { SupabaseClient } from "@supabase/supabase-js";
import { AmySupabaseClient } from "../server";
import { Tables, TablesInsert, TablesUpdate } from "@/types/supabase";

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

// --------

export async function getUserBoardsAsArray(supabaseClient: AmySupabaseClient, section: string | null = null) {
  const userId = await getUserId(supabaseClient);

  let boards = null;
  if (userId) {
    let asyncSupabaseCall = supabaseClient
    .from('boards')
    .select()
    .eq('user_id', userId);

    if (section) {
      asyncSupabaseCall = asyncSupabaseCall.eq('section', section);
    }
    
    const { data, error } = await asyncSupabaseCall;
    boards = data;
  }
  return boards;
}

export async function getUserBoardsAsRecord(supabaseClient: AmySupabaseClient, section: string | null = null) {
  const boardsArray = await getUserBoardsAsArray(supabaseClient, section);

  const boardsRecord : Record<string, Tables<'boards'>> = {}; 
  if (boardsArray) {
    for (const board of boardsArray) {
      boardsRecord[board.id] = board;
    }
  } 
  return boardsRecord;
}

// --------

export async function getBoardDaysForBoard(supabaseClient: AmySupabaseClient, boardId: number) {
  const { data, error } = await supabaseClient
  .from('board_days')
  .select()
  .eq('board_id', boardId);

  return data;  
}

export async function getBoardDaysForDay(supabaseClient: AmySupabaseClient, dayInt: number) {
  const { data, error } = await supabaseClient
  .from('board_days')
  .select()
  .eq('created_day', dayInt);

  return data;
}

export async function getBoardDaysForTodayAsRecord(supabaseClient: AmySupabaseClient) {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Adding 1 because months are zero-based
  const day = String(currentDate.getDate()).padStart(2, '0');

  const dayInt = parseInt(`${year}${month}${day}`);
  const boardDaysArray = await getBoardDaysForDay(supabaseClient, dayInt);

  const boardDaysRecord : Record<string, Tables<'board_days'>> = {}; 
  if (boardDaysArray) {
    for (const boardDay of boardDaysArray) {
      boardDaysRecord[boardDay.board_id] = boardDay;
    }
  } 
  return boardDaysRecord;
}

// --------

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
