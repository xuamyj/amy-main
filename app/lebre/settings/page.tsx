import { SubmitButton } from "@/app/login/submit-button";
import { createClient } from "@/utils/supabase/server";
import { getUserId, getUserDisplayName } from "@/utils/supabase/amy/helpers";
import { redirect } from "next/navigation";

export default async function LebreSettingsPage() {
  const supabase = createClient();
  const displayName = await getUserDisplayName(supabase);

  const submitDisplayName = async (formData: FormData) => {
    "use server";

    const supabaseDB = createClient();
    const userId = await getUserId(supabaseDB);

    // Convert FormData to a JavaScript object
    const formObject: { [key: string]: any } = {};
    for (const [key, value] of Array.from(formData.entries())) {
      formObject[key] = value;
    }
    console.log(formObject);

    if (userId) {
      const { error } = await supabaseDB
      .from('user_info')
      .update(formObject)
      .eq('id', userId)

      if (error) {
        console.error('Error inserting data:', error);
      } else {
        console.log('Data inserted successfully');
        return redirect("/lebre/settings");
      }
    }
  }

  return (
    <div className="flex-1 flex flex-col max-w-4xl w-full px-3 ">
      <h2>Lebre: Edit user</h2>
      <p>
        Display name: {displayName}
      </p>

      <form>
        <label htmlFor="label_1">
          Change display name: 
        </label>
        <input type="text" id="label_1" 
        name="display_name" className="mx-3" required />

        <SubmitButton
          formAction={submitDisplayName}
          className="flat-button submit-button"
          pendingText="Working..."
        >
          Submit
        </SubmitButton>
      </form>
    </div>
  );
}
