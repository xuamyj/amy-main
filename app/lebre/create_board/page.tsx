import { createClient } from "@/utils/supabase/server";

export default async function LebreCreateBoardPage() {
  const supabaseDB = createClient();

  return (
    <div className="flex-1 flex flex-col max-w-4xl w-full px-3 ">
      <h2>Lebre: Create Board</h2>
      <p>
        [eventually a form? ]
      </p>
    </div>
  );
}
