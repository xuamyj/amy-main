import { getBoardDaysForTodayAsRecord, getDayNotesForToday, getTodayYYYYMMDD, getUserBoardsAsArray, getUserBoardsOrdering, getUserId, mapBoardIdAsRecord } from "@/utils/supabase/amy/helpers";
import { AmySupabaseClient, createClient } from "@/utils/supabase/server";
import { BoardWithDoneButton } from "./board-with-donebutton";
import { TablesInsert } from "@/types/supabase";
import { redirect } from "next/navigation";
import { SubmitButton } from "../login/submit-button";
import { DayNotesSection } from "./daynotes-section";
import { DotDotDotMenu } from "./dotdotdot-menu";

function formatDayNoteForSupabase(formData: FormData, userId: string) {
  // Convert FormData to a JavaScript object
  const formObject: { [key: string]: any } = {};
  for (const [key, value] of Array.from(formData.entries())) {
    formObject[key] = value;
  }
  formObject['user_id'] = userId;
  formObject['created_day'] = getTodayYYYYMMDD();

  return formObject;
}

export default async function LebreHomePage() {
  const supabase = createClient();
  const dayNotes = await getDayNotesForToday(supabase);

  let currDayNoteText: string | null = null;
  let currDayNoteId: number | null = null;

  if (dayNotes && dayNotes[0]) {
    currDayNoteText = dayNotes[0].notes;
    currDayNoteId = dayNotes[0].id;
  }

  async function filterSortBoardsInSection(supabase: AmySupabaseClient, boards, section: string) {
    const boardsOrdering = await getUserBoardsOrdering(supabase, section);
    if (!boardsOrdering) {
      return boards;
    }

    const map = mapBoardIdAsRecord(boards, (board) => {
      return board.boardId
    });
    const resultArr = [];
    for (const id of boardsOrdering) {
      resultArr.push(map[id]);
    }
    return resultArr;
  }

  const boards = await getUserBoardsAsArray(supabase);
  const boardDays = await getBoardDaysForTodayAsRecord(supabase);

  let doneBoardDaysArr: {boardDayId: number, boardTitle: string; notes: string | null}[] = [];
  let skipBoardDaysArr: {boardDayId: number, boardTitle: string; notes: string | null}[] = [];
  let remainingBoardsArrA: {boardId: number, boardTitle: string}[] = [];
  let remainingBoardsArrB: {boardId: number, boardTitle: string}[] = [];

  if (boards) {
    for (const board of boards) {
      const boardId = board.id;

      if (board.id in boardDays && boardDays[boardId].done) { // marked done
        doneBoardDaysArr.push({
          boardDayId: boardDays[boardId].id,
          boardTitle: board.board_title, 
          notes: boardDays[boardId].notes
        });
      } else if (board.id in boardDays && (boardDays[boardId].done === false)) { // marked skip
        skipBoardDaysArr.push({
          boardDayId: boardDays[boardId].id,
          boardTitle: board.board_title, 
          notes: boardDays[boardId].notes
        });
      } else if (board.section == 'A') { // not marked; A
        remainingBoardsArrA.push({
          boardId: boardId, 
          boardTitle: board.board_title, 
        });
      } else if (board.section == 'B') { // not marked; B
        remainingBoardsArrB.push({
          boardId: boardId, 
          boardTitle: board.board_title, 
        });
      } else {
        throw "LebreHomePage: Invalid `board` in `boards`"
      }
    }
  }
  remainingBoardsArrA = await filterSortBoardsInSection(supabase, remainingBoardsArrA, 'A');
  remainingBoardsArrB = await filterSortBoardsInSection(supabase, remainingBoardsArrB, 'B');

  // ------------------
  // "button" functions
  // ------------------

  const submitDone = async (formData: FormData) => {
    "use server";

    const supabaseDB = createClient();
    const userId = await getUserId(supabaseDB);

    // Convert FormData to a JavaScript object
    const formObject: { [key: string]: any } = {};
    for (const [key, value] of Array.from(formData.entries())) {
      formObject[key] = value;
    }
    formObject['created_day'] = getTodayYYYYMMDD();
    formObject['done'] = true;
    console.log('submitDone():', formObject);

    if (userId) {
      const { error } = await supabaseDB
      .from('board_days')
      .insert(formObject as TablesInsert<'board_days'>); // todo: is this right? 

      if (error) {
        console.error('Error inserting data:', error);
      } else {
        console.log('Data inserted successfully');
        return redirect("/lebre");
      }
    }
  }

  const submitSkip = async (formData: FormData) => {
    "use server";

    const supabaseDB = createClient();
    const userId = await getUserId(supabaseDB);

    // Convert FormData to a JavaScript object
    const formObject: { [key: string]: any } = {};
    for (const [key, value] of Array.from(formData.entries())) {
      formObject[key] = value;
    }
    formObject['created_day'] = getTodayYYYYMMDD();
    formObject['done'] = false;
    console.log('submitSkip():', formObject);

    if (userId) {
      const { error } = await supabaseDB
      .from('board_days')
      .insert(formObject as TablesInsert<'board_days'>); // todo: is this right? 

      if (error) {
        console.error('Error inserting data:', error);
      } else {
        console.log('Data inserted successfully');
        return redirect("/lebre");
      }
    }
  }

  const submitDelete = async (formData: FormData) => {
    "use server";

    const supabaseDB = createClient();
    const userId = await getUserId(supabaseDB);

    // Convert FormData to a JavaScript object
    const formObject: { [key: string]: any } = {};
    for (const [key, value] of Array.from(formData.entries())) {
      formObject[key] = value;
    }
    console.log('submitDelete()', formObject);

    if (userId) {
      const { error } = await supabaseDB
      .from('board_days')
      .delete()
      .eq('id', formObject['id']);

      if (error) {
        console.error('Error deleting data:', error);
      } else {
        console.log('Data deleted successfully');
        return redirect("/lebre");
      }
    }
  }

  const createDayNote = async (formData: FormData) => {
    "use server";

    const supabaseDB = createClient();
    const userId = await getUserId(supabaseDB);

    if (userId) {
      const formObject = formatDayNoteForSupabase(formData, userId);
      console.log('createDayNote():', formObject);

      const { error } = await supabaseDB
      .from('day_notes')
      .insert(formObject as TablesInsert<'day_notes'>); // todo: is this right? 

      if (error) {
        console.error('Error inserting data:', error);
      } else {
        console.log('Data inserted successfully');
        return redirect("/lebre");
      }
    }
  }

  const updateDayNote = async (formData: FormData) => {
    "use server";

    const supabaseDB = createClient();
    const userId = await getUserId(supabaseDB);

    if (userId) {
      const formObject = formatDayNoteForSupabase(formData, userId);
      console.log('updateDayNote():', formObject);

      const { error } = await supabaseDB
      .from('day_notes')
      .update(formObject as TablesInsert<'day_notes'>) // todo: is this right? 
      .eq('id', formObject['id']);

      if (error) {
        console.error('Error updating data:', error);
      } else {
        console.log('Data updated successfully');
        return redirect("/lebre");
      }
    }
  }

  // ------------------
  // jsx display
  // ------------------

  return (
    <div className="flex-1 flex flex-col max-w-4xl w-full px-3 ">
      <h2>Lebre: Done today</h2>

      {doneBoardDaysArr.map(item => (
        <div key={`boardDay-${item.boardDayId}`}>

        <div className="flex">
          <h3>{item.boardTitle}</h3> 
          <DotDotDotMenu boardDayId={item.boardDayId} submitDelete={submitDelete} />
        </div>
        
        {item.notes && <p>{item.notes}</p>} 
        {!item.notes && <p>--</p>}
        </div>
      ))}
     
      <h2>Lebre: Add things to today</h2>

      <BoardWithDoneButton remainingBoardsArr={remainingBoardsArrA} submitDone={submitDone} submitSkip={submitSkip}/>
        
      <div className="divider"></div>

      <BoardWithDoneButton remainingBoardsArr={remainingBoardsArrB} submitDone={submitDone} submitSkip={submitSkip}/>

      <div className="divider"></div>

      <h3>Notes :)</h3>
      {currDayNoteText && 
        <DayNotesSection 
        currDayNoteText={currDayNoteText} 
        currDayNoteId={currDayNoteId} 
        labelVerb="Edit" 
          submitFunction={updateDayNote} 
        /> 
      }
      {!currDayNoteText && 
        <DayNotesSection 
          currDayNoteText={null}
          currDayNoteId={null} 
          labelVerb="Add" 
          submitFunction={createDayNote} 
        /> 
      }

      <h2>Lebre: Skipped today</h2>

      {skipBoardDaysArr.map(item => (
        <div key={`boardDay-${item.boardDayId}`}>

        <div className="flex">
          <h3>{item.boardTitle}</h3> 
          <DotDotDotMenu boardDayId={item.boardDayId} submitDelete={submitDelete} />
        </div>

        {item.notes && <p>{item.notes}</p>} 
        {!item.notes && <p>--</p>}
        </div>
      ))}

    </div>
  );
}
