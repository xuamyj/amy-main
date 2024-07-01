import { getBoardDaysForTodayAsRecord, getUserBoardsAsRecord } from "@/utils/supabase/amy/helpers";
import { createClient } from "@/utils/supabase/server";
import { SubmitButton } from "@/app/login/submit-button";

export default async function LebreHomePage() {
  const supabase = createClient();
  const boards = await getUserBoardsAsRecord(supabase);
  const boardDays = await getBoardDaysForTodayAsRecord(supabase);

  console.log('getUserBoardsAsRecord', boards);
  console.log('getBoardDaysForTodayAsRecord', boardDays);
  console.log('\n')


  const submitDisplayName = async (formData: FormData) => {
    "use server";
  }

  return (
    <div className="flex-1 flex flex-col max-w-4xl w-full px-3 ">
      <h2>Lebre: Done today</h2>
      <h3>Other exercise</h3>
      <p>walked in best weather of the year</p>
      <p>--</p>

      <h2>Lebre: Add things to today</h2>
      <form>
        <label htmlFor="label_1" className="label-like-h3">
          Stretch
        </label>
        <div>
          <input type="text" id="label_1" 
            name="display_name" placeholder="[optional note]" 
            className="done-input" />
           <SubmitButton
            formAction={submitDisplayName}
            className="done-button"
            pendingText="Loading..."
          >
            Done
          </SubmitButton>
        </div>
      </form>


    </div>
  );
}
