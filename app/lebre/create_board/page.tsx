import { SubmitButton } from "@/app/login/submit-button";
import { getUserBoardsAsArray, getUserId } from "@/utils/supabase/amy/helpers";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Tables, TablesInsert } from "@/types/supabase";


export default async function LebreCreateBoardPage() {
  const supabase = createClient();
  const boards = await getUserBoardsAsArray(supabase);

  const submitCreateBoard = async (formData: FormData) => {
    "use server";

    const supabaseDB = createClient();
    const userId = await getUserId(supabaseDB);

    // Convert FormData to a JavaScript object
    const formObject: { [key: string]: any } = {};
    for (const [key, value] of Array.from(formData.entries())) {
      formObject[key] = value;
    }
    formObject['user_id'] = userId;
    console.log(formObject);

    if (userId) {
      const { error } = await supabaseDB
      .from('boards')
      .insert(formObject as TablesInsert<'boards'>); // todo: is this right? 

      if (error) {
        console.error('Error inserting data:', error);
      } else {
        console.log('Data inserted successfully');
        return redirect("/lebre/create_board");
      }
    }
  }

  return (
    <div className="flex-1 flex flex-col max-w-4xl w-full px-3 ">
      <h2>Lebre: Create board</h2>
      
      <form className="flex flex-wrap items-center gap-y-2">
          <label htmlFor="label_1">
            Board title: 
          </label>
          <input type="text" id="label_1" 
          name="board_title" className="mx-3" required />
        
          <label htmlFor="label_2">
            Section: 
          </label>
          <select name="section" id="label_2" className="mx-2">
            <option value="A" selected>A (default)</option>
            <option value="B">B</option>
          </select>

        <SubmitButton
          formAction={submitCreateBoard}
          className="flat-button submit-button"
          pendingText="Working..."
        >
          Submit
        </SubmitButton>
      </form>

      <h2>Lebre: Existing boards</h2>

      {boards && 
      <ul>
        {boards.map(board => (
        <li key={board.id}> 
          {board.board_title} : {board.section}
        </li>
        ))}
      </ul>
      }
    </div>
  );
}
