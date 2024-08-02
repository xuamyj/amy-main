import { getBoard, getBoardDaysForBoard, getThisMonthYYYYMM } from "@/utils/supabase/amy/helpers";
import { createClient } from "@/utils/supabase/server";

export default async function LebreViewBoardPage({ params }: { params: { boardId: string } }) {
  const boardIdInt = parseInt(params.boardId);

  const supabase = createClient();

  const boardData = await getBoard(supabase, boardIdInt);
  if (!boardData || boardData.length != 1) {
    throw "LebreViewBoardPage: Invalid `boardId`"
  }
  const board = boardData[0];

  const yearMonth = getThisMonthYYYYMM();
  const boardDays = await getBoardDaysForBoard(supabase, boardIdInt, yearMonth);

  console.log('board', board);
  console.log('boardDays', boardDays);

  return (
    <div className="flex-1 flex flex-col max-w-4xl w-full px-3 ">
      <h2>Lebre: "{board.board_title}"</h2>
      

    </div>
  );
}