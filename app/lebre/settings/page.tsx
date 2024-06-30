import { SubmitButton } from "@/app/login/submit-button";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function LebreSettingsPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let displayName : string|null = null;
  if (user) {
    const { data, error } = await supabase
    .from('user_info')
    .select()
    .eq('id', user.id);

    if (data && data.length > 0) {
      displayName = data[0].display_name;
    }
  }

  const submitDisplayName = async (formData: FormData) => {
    "use server";

    const supabaseDB = createClient();

    const {
      data: { user },
    } = await supabaseDB.auth.getUser();

    // Convert FormData to a JavaScript object
    const formObject: { [key: string]: any } = {};
    for (const [key, value] of Array.from(formData.entries())) {
      formObject[key] = value;
    }
    console.log(formObject);

    if (user) {
      const { error } = await supabaseDB
      .from('user_info')
      .update(formObject)
      .eq('id', user.id)

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
      <h2>Lebre: Edit User</h2>
      <p>
        Display name: {displayName}
      </p>

      <form>
        <label htmlFor="label_1">
          Change display name: 
        </label>
        <input type="text" id="label_1" 
        name="display_name" required />

        <SubmitButton
          formAction={submitDisplayName}
          className="submit-button"
          pendingText="Loading..."
        >
          Submit
        </SubmitButton>
      </form>
    </div>
  );
}
