import { AmySupabaseServiceInstance } from "@/utils/supabase/amy/SupabaseService";

export default async function LebreCreateBoardPage() {
  const supabase = AmySupabaseServiceInstance.getSupabase();

  return (
    <div className="flex-1 flex flex-col max-w-4xl w-full px-3 ">
      <h2>Lebre: Create Board</h2>
      <p>
        [eventually a form? ]
      </p>
    </div>
  );
}
