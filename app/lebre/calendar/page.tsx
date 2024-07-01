import { getBoardDays, getUserBoards, getUserDayNotes } from "@/utils/supabase/amy/helpers";
import { createClient } from "@/utils/supabase/server";

export default async function LebreCalendarPage() {
  const supabase = createClient();
  const boards = await getUserBoards(supabase);
  const dayNotes = await getUserDayNotes(supabase);

  const boardDayPromises = boards?.map(async function(board) {
    const boardDays = await getBoardDays(supabase, board.id);
    return [board, boardDays] as const;
  }) || [];
  const boardDayTuples = await Promise.all(boardDayPromises);
  // const firstBoardInfo = boardDayTuples[0][0];
  // const firstBoardDayList = boardDayTuples[0][1];

  return (
    <div className="flex-1 flex flex-col max-w-4xl w-full px-3 ">
      <h2>Lebre: All days</h2>
      {boardDayTuples && boardDayTuples.map(boardDayTuple => (
      <div key={`board-${boardDayTuple[0].id}`}>
        <h3>{boardDayTuple[0].board_title}</h3>

        {boardDayTuple[1] &&
          <ul>
            {boardDayTuple[1].map(boardDay => (
            <li key={`boardDay-${boardDay.id}`}>
              {boardDay.created_day} : {String(boardDay.done)}
            </li>
            ))}
          </ul>
        }

      </div>
      ))}

      <div className="divider"></div>

      <h3>[this one's fake] Tidy</h3>
      <p>
        [eventually a list of days? ]
      </p>
      <h3>[this one's fake] Study language</h3>
      <p>
        [eventually a list of days? ]
      </p>
      <h3>[this one's fake] Practice coding</h3>
      <p>
        [eventually a list of days? ]
      </p>
      <h3>[this one's fake] Sewing or weaving or stamps</h3>
      <p>
        [eventually a list of days? ]
      </p>

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
