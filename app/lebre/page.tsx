import { createClient } from "@/utils/supabase/server";

export default async function Index() {
  const supabaseDB = createClient();

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
