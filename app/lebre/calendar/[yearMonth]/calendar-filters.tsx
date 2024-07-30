"use client";

import { Tables } from '@/types/supabase';
import { atom, useAtom } from 'jotai';

export const shouldShowSkippedAtom = atom(false);

interface CalendarFiltersProps {
}

export function CalendarFilters() {
  const [shouldShowSkipped, setShouldShowSkipped] = useAtom(shouldShowSkippedAtom);
  
  return (
    <div className="my-2">
      <input
        type="checkbox"
        id="showSkip"
        name="showSkip"
        onChange={(e) => {
          setShouldShowSkipped(e.target.checked);
        }}
      />
      <label htmlFor="showSkip">Show Skipped</label>
    </div>
  );
}