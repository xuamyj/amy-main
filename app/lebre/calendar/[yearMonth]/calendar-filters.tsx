"use client";

import { Tables } from '@/types/supabase';
import { atom, useAtom } from 'jotai';

export const shouldShowSkippedAtom = atom(false);

interface CalendarFiltersProps {
}

export function CalendarFilters() {
  const [shouldShowSkipped, setShouldShowSkipped] = useAtom(shouldShowSkippedAtom);

  console.log('did i rerun?', shouldShowSkipped);
  
  return (
    <div className="my-2">
      <input
        // uncontrolled input

        // add react, specifically value= => now it's stuck
        // controlled input / stuck input
        type="checkbox"
        id="showSkip"
        name="showSkip"
        onChange={(e) => {
          setShouldShowSkipped(e.target.checked);
          console.log('e.target.checked:', e.target.checked);
          console.log('shouldShowSkipped', shouldShowSkipped);
        }}
      />
      <label htmlFor="showSkip">Show Skipped</label>
    </div>
  );
}