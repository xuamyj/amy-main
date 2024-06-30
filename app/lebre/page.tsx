import { AmySupabaseServiceInstance } from "@/utils/supabase/amy/SupabaseService";

export default async function LebreHomePage() {
  const supabase = AmySupabaseServiceInstance.getSupabase();

  return (
    <div className="flex-1 flex flex-col max-w-4xl w-full px-3 ">
      <h2>Lebre: Today so far</h2>
      <p>
        [eventually a list of things? ]
      </p>

      <h2>Lebre: Add things to today</h2>
      <p>
        [eventually a form? ]
      </p>
    </div>
  );
}
