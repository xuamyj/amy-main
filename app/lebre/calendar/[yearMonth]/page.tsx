import { getBoardDaysForBoard, getUserBoardsAsArray, getUserDayNotes } from "@/utils/supabase/amy/helpers";
import { createClient } from "@/utils/supabase/server";
import { BoardWithDays } from "./board-with-days";
import { Tables } from "@/types/supabase";

export default async function LebreCalendarPage({ params }: { params: { yearMonth: string } }) {
  const yearMonthInt = parseInt(params.yearMonth);

  const supabase = createClient();
  const dayNotes = await getUserDayNotes(supabase, yearMonthInt);

  async function getTuplesFromBoards(boards: Tables<'boards'>[] | null) {
    const boardDayPromises = boards?.map(async function(board) {
      const boardDays = await getBoardDaysForBoard(supabase, board.id, yearMonthInt);
      return [board, boardDays] as const;
    }) || [];
    const boardDayTuples = await Promise.all(boardDayPromises);

    return boardDayTuples;
  }

  const boardsA = await getUserBoardsAsArray(supabase, 'A');
  const boardsB = await getUserBoardsAsArray(supabase, 'B');
  const boardDayTuplesA = await getTuplesFromBoards(boardsA);
  const boardDayTuplesB = await getTuplesFromBoards(boardsB);

  return (
    <div className="flex-1 flex flex-col max-w-4xl w-full px-3 ">
      <h2>Lebre: All boards</h2>

      <BoardWithDays boardDayTuples={boardDayTuplesA}/>

      <div className="divider"></div>

      <BoardWithDays boardDayTuples={boardDayTuplesB}/>

      <div className="divider"></div>
      
      <h3>Notes :)</h3>
      {dayNotes &&
        <ul>
          {dayNotes.map(dayNote => (
          <li key={`dayNote-${dayNote.id}`}>
            {dayNote.created_day} : {dayNote.notes}
          </li>
          ))}
        </ul>
      }
    </div>
  );
}
