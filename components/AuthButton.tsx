import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AuthButton() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const signOut = async () => {
    "use server";

    const supabase = createClient();
    await supabase.auth.signOut();
    return redirect("/login");
  };

  let displayName = null;
  if (user) {
    const { data, error } = await supabase
    .from('user_info')
    .select()
    .eq('id', user.id);

    if (data && data.length > 0) {
      displayName = data[0].display_name;
    }
  }

  return displayName ? (
    <div className="flex items-center gap-4">
      Hey, {displayName}!
      <form action={signOut}>
        <button className="py-2 px-4 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover">
          Logout
        </button>
      </form>
    </div>
  ) : (
    <Link
      href="/login"
      className="py-2 px-3 flex rounded-md no-underline bg-indigo-300 hover:bg-indigo-400"
    >
      Login
    </Link>
  );
}
