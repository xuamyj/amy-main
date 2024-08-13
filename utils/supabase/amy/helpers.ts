import { SupabaseClient } from "@supabase/supabase-js";
import { AmySupabaseClient } from "../server";
import { Tables, TablesInsert, TablesUpdate } from "@/types/supabase";

// --------------
// NOT DATABASE
// --------------

export const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]; 

export function getTodayPST() {
  const options = { timeZone: 'America/Los_Angeles' };
  const rawDate = new Date().toLocaleString('en-US', options);
  return new Date(rawDate);
}

export function getTodayYYYYMMDD() {
  const currentDate = getTodayPST();

  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Adding 1 because months are zero-based
  const day = String(currentDate.getDate()).padStart(2, '0');

  return parseInt(`${year}${month}${day}`);
}

export function getThisMonthYYYYMM() {
  const yearMonthDay = getTodayYYYYMMDD();
  return Math.floor(yearMonthDay/100);
}

export function mapBoardIdAsRecord(thingArr: any[], findIdFunc) {
  const map: Record<string, any> = {};
  for (const thing of thingArr) {
    const id = String(findIdFunc(thing));
    map[id] = thing;
  }
  return map;
}

// --------------
// DB: USER
// --------------

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

export async function getUserStartWeekday(supabaseClient: AmySupabaseClient) {
  const userId = await getUserId(supabaseClient);

  let startWeekday : number|null = null;
  if (userId) {
    const { data, error } = await supabaseClient
    .from('user_info')
    .select()
    .eq('id', userId);

    if (data && data.length > 0) {
      startWeekday = data[0].start_weekday;
    }
  }
  return startWeekday;
}

export async function getUserBoardsOrdering(supabaseClient: AmySupabaseClient, boardsSection: string) {
  const userId = await getUserId(supabaseClient);

  let result : Array<number>|null = null;
  if (userId) {
    const { data, error } = await supabaseClient
    .from('user_info')
    .select()
    .eq('id', userId);

    if (data && data.length > 0) {
      if (data[0].boards_ordering && data[0].boards_ordering[boardsSection]) {
        result = data[0].boards_ordering[boardsSection];
      }
      
    }
  }
  return result;
}

// --------------
// DB: BOARDS
// --------------

export async function getBoard(supabaseClient: AmySupabaseClient, boardId: number) {
  const { data, error } = await supabaseClient
  .from('boards')
  .select()
  .eq('id', boardId);

  return data;
}

export async function getUserBoardsAsArray(supabaseClient: AmySupabaseClient, section: string | null = null) {
  const userId = await getUserId(supabaseClient);

  const resultA = await getUserBoardsOrdering(supabaseClient, 'A');
  const resultB = await getUserBoardsOrdering(supabaseClient, 'B');
  console.log('resultA', resultA);
  console.log('resultB', resultB);

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

// --------------
// DB: BOARD_DAYS
// --------------

export async function getBoardDaysForBoard(supabaseClient: AmySupabaseClient, boardId: number, yearMonth: number) {
  const yearMonthStart = yearMonth * 100;
  const yearMonthEnd = (yearMonth + 1) * 100;

  const { data, error } = await supabaseClient
  .from('board_days')
  .select()
  .eq('board_id', boardId)
  .gt('created_day', yearMonthStart)
  .lt('created_day', yearMonthEnd);

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
  const dayInt = getTodayYYYYMMDD();
  const boardDaysArray = await getBoardDaysForDay(supabaseClient, dayInt);

  const boardDaysRecord : Record<string, Tables<'board_days'>> = {}; 
  if (boardDaysArray) {
    for (const boardDay of boardDaysArray) {
      boardDaysRecord[boardDay.board_id] = boardDay;
    }
  } 
  return boardDaysRecord;
}

// --------------
// DB: DAY_NOTES
// --------------

export async function getUserDayNotes(supabaseClient: AmySupabaseClient, yearMonth: number) {
  const userId = await getUserId(supabaseClient);

  const yearMonthStart = yearMonth * 100;
  const yearMonthEnd = (yearMonth + 1) * 100;

  let dayNotes = null;
  if (userId) {
    const { data, error } = await supabaseClient
    .from('day_notes')
    .select()
    .eq('user_id', userId)
    .gt('created_day', yearMonthStart)
    .lt('created_day', yearMonthEnd);

    dayNotes = data;
  }
  return dayNotes;
}

export async function getDayNotesForDay(supabaseClient: AmySupabaseClient, dayInt: number) {
  const userId = await getUserId(supabaseClient);

  let dayNotes = null;
  if (userId) {
    const { data, error } = await supabaseClient
    .from('day_notes')
    .select()
    .eq('user_id', userId)
    .eq('created_day', dayInt);

    dayNotes = data;
  }
  return dayNotes;
}

export async function getDayNotesForToday(supabaseClient: AmySupabaseClient) {
  const dayInt = getTodayYYYYMMDD();
  return await getDayNotesForDay(supabaseClient, dayInt);
}
