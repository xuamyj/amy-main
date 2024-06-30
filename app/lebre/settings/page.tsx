import { SubmitButton } from "@/app/login/submit-button";
import { AmySupabaseServiceInstance } from "@/utils/supabase/amy/SupabaseService";
import { redirect } from "next/navigation";

export default async function LebreSettingsPage() {
  const supabase = AmySupabaseServiceInstance.getSupabase();
  const userId = await AmySupabaseServiceInstance.getUserId();

  let displayName : string|null = null;
  if (userId) {
    const { data, error } = await supabase
    .from('user_info')
    .select()
    .eq('id', userId);

    if (data && data.length > 0) {
      displayName = data[0].display_name;
    }
  }

  const submitDisplayName = async (formData: FormData) => {
    "use server";

    const supabaseDB = AmySupabaseServiceInstance.getSupabase();
    const userId = await AmySupabaseServiceInstance.getUserId();

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