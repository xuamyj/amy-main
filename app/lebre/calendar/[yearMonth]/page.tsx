import { getBoardDaysForBoard, getUserBoardsAsArray, getUserBoardsOrdering, getUserDayNotes, mapBoardIdAsRecord } from "@/utils/supabase/amy/helpers";
import { AmySupabaseClient, createClient } from "@/utils/supabase/server";
import { BoardWithDays } from "./board-with-days";
import { Tables } from "@/types/supabase";
import { CalendarFilters } from "./calendar-filters";
import Link from "next/link";

type QuickBoardTuples = [
  Tables<'boards'>,
  Tables<'board_days'>[],
]

function getPrevNextMonth(yearMonth: string | number) {
  let y = Math.floor(Number(yearMonth) / 100);
  let m = Number(yearMonth) % 100;
  let prevY = m === 1 ? y - 1 : y;
  let prevM = m === 1 ? 12 : m - 1;
  let nextY = m === 12 ? y + 1 : y;
  let nextM = m === 12 ? 1 : m + 1;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return {
    prevMonth: `${prevY}${pad(prevM)}`,
    nextMonth: `${nextY}${pad(nextM)}`
  };
}

export default async function LebreCalendarPage({ params }: { params: { yearMonth: string } }) {
  const yearMonthInt = parseInt(params.yearMonth);

  const supabase = createClient();
  const dayNotes = await getUserDayNotes(supabase, yearMonthInt);

  async function getTuplesFromBoards(boards: Tables<'boards'>[] | null) {
    const boardDayPromises = boards?.map(async function(board) {
      const boardDays = await getBoardDaysForBoard(supabase, board.id, yearMonthInt);
      return [board, boardDays] as QuickBoardTuples;
    }) || [];
    const boardDayTuples = await Promise.all(boardDayPromises);

    return boardDayTuples;
  }

  async function filterSortTuplesInSection(supabase: AmySupabaseClient, tuples: QuickBoardTuples[], section: string) {
    const boardsOrdering = await getUserBoardsOrdering(supabase, section);
    if (!boardsOrdering) { 
      return tuples;
    }

    const map = mapBoardIdAsRecord(tuples, (tuple) => {
      return tuple[0].id
    });
    const resultArr = [];
    for (const id of boardsOrdering) {
      resultArr.push(map[id]);
    }
    return resultArr;
  }

  const boards = await getUserBoardsAsArray(supabase);
  const boardDayTuples = await getTuplesFromBoards(boards);

  let boardDayTuplesA: QuickBoardTuples[] = [];
  let boardDayTuplesB: QuickBoardTuples[] = [];

  // filter and sort
  if (boards) {
    for (const boardDayTuple of boardDayTuples) {
      const [board, boardDays] = boardDayTuple; // array destructuring! proud
      const boardId = board.id;

      if (board.section == 'A') { // not marked; A
        boardDayTuplesA.push(boardDayTuple);
      } else if (board.section == 'B') { // not marked; B
        boardDayTuplesB.push(boardDayTuple);
      } else {
        throw "LebreHomePage: Invalid `board` in `boards`"
      }
    }
  }
  boardDayTuplesA = await filterSortTuplesInSection(supabase, boardDayTuplesA, 'A');
  boardDayTuplesB = await filterSortTuplesInSection(supabase, boardDayTuplesB, 'B');

  const { prevMonth, nextMonth } = getPrevNextMonth(params.yearMonth);

  return (
    <div className="flex-1 flex flex-col max-w-4xl w-full px-3 ">
      <h2>Lebre: All boards</h2>
      <div className="flex gap-4 my-2">
        <Link href={`/lebre/calendar/${prevMonth}`} className="text-indigo-800 font-bold">Prev month</Link>
        <Link href={`/lebre/calendar/${nextMonth}`} className="text-indigo-800 font-bold">Next month</Link>
      </div>
      <CalendarFilters/>

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
