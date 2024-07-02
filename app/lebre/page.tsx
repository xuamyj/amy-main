import { getBoardDaysForTodayAsRecord, getTodayYYYYMMDD, getUserBoardsAsArray, getUserId } from "@/utils/supabase/amy/helpers";
import { createClient } from "@/utils/supabase/server";
import { BoardWithDoneButton } from "./board-with-donebutton";
import { TablesInsert } from "@/types/supabase";
import { redirect } from "next/navigation";

export default async function LebreHomePage() {
  const supabase = createClient();
  const boards = await getUserBoardsAsArray(supabase);
  const boardDays = await getBoardDaysForTodayAsRecord(supabase);

  // console.log('getUserBoardsAsArray', boards);
  // console.log('getBoardDaysForTodayAsRecord', boardDays);
  // console.log('\n')

  let doneBoardDaysArr: {boardDayId: number, boardTitle: string; notes: string | null}[] = [];
  let remainingBoardsArrA: {boardId: number, boardTitle: string}[] = [];
  let remainingBoardsArrB: {boardId: number, boardTitle: string}[] = [];

  if (boards) {
    for (const board of boards) {
      const boardId = board.id;

      if (board.id in boardDays) {
        doneBoardDaysArr.push({
          boardDayId: boardDays[boardId].id,
          boardTitle: board.board_title, 
          notes: boardDays[boardId].notes
        });
      } else if (board.section == 'A') {
        remainingBoardsArrA.push({
          boardId: boardId, 
          boardTitle: board.board_title, 
        });
      } else if (board.section == 'B') {
        remainingBoardsArrB.push({
          boardId: boardId, 
          boardTitle: board.board_title, 
        });
      } else {
        throw "LebreHomePage: Invalid `board` in `boards`"
      }
    }
  }

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
    console.log(formObject);

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

  return (
    <div className="flex-1 flex flex-col max-w-4xl w-full px-3 ">
      <h2>Lebre: Done today</h2>

      {doneBoardDaysArr.map(item => (
        <div key={`boardDay-${item.boardDayId}`}>
        <h3>{item.boardTitle}</h3>
        {item.notes && <p>{item.notes}</p>} 
        {!item.notes && <p>--</p>}
        </div>
      ))}
     
      <h2>Lebre: Add things to today</h2>

      <BoardWithDoneButton remainingBoardsArr={remainingBoardsArrA} submitDone={submitDone}/>
        
      <div className="divider"></div>

      <BoardWithDoneButton remainingBoardsArr={remainingBoardsArrB} submitDone={submitDone}/>

      <div className="divider"></div>

      <h3>Notes :)</h3>
      <p>Eventually notes will go here</p>

    </div>
  );
}
