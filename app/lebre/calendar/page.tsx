import { AmySupabaseServiceInstance } from "@/utils/supabase/amy/SupabaseService";

export default async function LebreCalendarPage() {
  const supabase = AmySupabaseServiceInstance.getSupabase();

  return (
    <div className="flex-1 flex flex-col max-w-4xl w-full px-3 ">
      <h2>Lebre: All days</h2>

      <h3>Stretch</h3>
      <p>
        [eventually a list of days? ]
      </p>
      <h3>Other exercise</h3>
      <p>
        [eventually a list of days? ]
      </p>
      <h3>Prep food</h3>
      <p>
        [eventually a list of days? ]
      </p>
      <h3>Plates at night</h3>
      <p>
        [eventually a list of days? ]
      </p>
      <h3>Took eye breaks today</h3>
      <p>
        [eventually a list of days? ]
      </p>

      <div className="divider"></div>

      <h3>Tidy</h3>
      <p>
        [eventually a list of days? ]
      </p>
      <h3>Study language</h3>
      <p>
        [eventually a list of days? ]
      </p>
      <h3>Practice coding</h3>
      <p>
        [eventually a list of days? ]
      </p>
      <h3>Sewing or weaving or stamps</h3>
      <p>
        [eventually a list of days? ]
      </p>

      <div className="divider"></div>
      
      <h3>Notes :)</h3>
      <p>
        [eventually a list of days? ]
      </p>
    </div>
  );
}
