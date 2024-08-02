"use client";

import { Tables } from '@/types/supabase';
import { DAY_NAMES, getTodayPST } from '@/utils/supabase/amy/helpers';
import { useAtom } from 'jotai';

// const isSomethingAtom = atom(false);

interface SingleBoardCalProps {
  board: Tables<'boards'>;
  boardDays: Tables<'board_days'>[] | null; 
  startWeekday: number; 
}

export function SingleBoardCal({ board, boardDays, startWeekday }: SingleBoardCalProps) {
  // const [shouldShowSkipped, setShouldShowSkipped] = useAtom(shouldShowSkippedAtom);

  // const currentDate = new Date('Feb 5, 2023 19:24:00');
  const currentDate = getTodayPST();
  const monthNumDays = new Date(currentDate.getFullYear(), currentDate.getMonth()+1, 0).getDate();
  const monthStartWeekday = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const options = { month: "long", year: "numeric"} as const;
  const monthStr = new Intl.DateTimeFormat("en-US", options).format(currentDate);

  return (
    <div>
      <p>
        startWeekday: {startWeekday}
      </p>

      <div>
      {
        DAY_NAMES.map((currElem, index) => {
          const calculatedIndex = (index-startWeekday+7)%7;
          return (<div>
            {currElem}'s calculated index: {calculatedIndex}
          </div>);
        })
      }
      </div>

      <h3>
        {monthStr}
      </h3>
      <div className="flex">
      {
        DAY_NAMES.map((currElem, index) => {
          return (<div className="border px-4 py-3">
            {currElem}
          </div>);
        })
      }
      </div>

      <p>
        {monthNumDays} days in the month, starting on a {DAY_NAMES[monthStartWeekday]}
      </p>
      
    </div>
  );
}
